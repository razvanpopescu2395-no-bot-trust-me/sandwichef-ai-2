import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'server_data');
const DATA_FILE = path.join(DATA_DIR, 'bread_inventory.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface BreadInventoryLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  type: 'online' | 'physical' | 'adjustment' | 'reset';
  quantity: number;
  note?: string;
  seller?: string;
}

export interface BreadInventoryState {
  date: string; // YYYY-MM-DD
  dailyTarget: number;
  totalPhysicalSold: number;
  totalOnlineSold: number;
  remaining: number;
  isSoldOut: boolean;
  lastUpdated: string;
  logs: BreadInventoryLog[];
}

function getTodayBucharestDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Returns YYYY-MM-DD
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

function getBucharestTimeFormatted(): string {
  try {
    const formatter = new Intl.DateTimeFormat('ro-RO', {
      timeZone: 'Europe/Bucharest',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  } catch (e) {
    return new Date().toLocaleTimeString();
  }
}

function createDefaultState(date: string, target = 12): BreadInventoryState {
  return {
    date,
    dailyTarget: target,
    totalPhysicalSold: 0,
    totalOnlineSold: 0,
    remaining: target,
    isSoldOut: target <= 0,
    lastUpdated: new Date().toISOString(),
    logs: [
      {
        id: `init-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: getBucharestTimeFormatted(),
        type: 'reset',
        quantity: target,
        note: `Inițializare lot zilnic (${target} panini Schiacciata coapte)`,
        seller: 'Sistem brutărie',
      },
    ],
  };
}

function loadState(): BreadInventoryState {
  const today = getTodayBucharestDate();
  if (!fs.existsSync(DATA_FILE)) {
    const initialState = createDefaultState(today, 12);
    saveState(initialState);
    return initialState;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed: BreadInventoryState = JSON.parse(raw);
    
    // Auto-rollover to new day if date has changed
    if (parsed.date !== today) {
      const newState = createDefaultState(today, 12);
      saveState(newState);
      return newState;
    }

    // Recalculate remaining to ensure strict consistency
    parsed.remaining = Math.max(0, parsed.dailyTarget - parsed.totalPhysicalSold - parsed.totalOnlineSold);
    parsed.isSoldOut = parsed.remaining <= 0;
    return parsed;
  } catch (err) {
    console.error('Error reading inventory file, resetting to default:', err);
    const fallback = createDefaultState(today, 12);
    saveState(fallback);
    return fallback;
  }
}

function saveState(state: BreadInventoryState): void {
  try {
    state.remaining = Math.max(0, state.dailyTarget - state.totalPhysicalSold - state.totalOnlineSold);
    state.isSoldOut = state.remaining <= 0;
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    notifySseClients(state);
  } catch (err) {
    console.error('Error saving inventory state:', err);
  }
}

// SSE Clients for instant real-time synchronization
type SSEClient = Response;
const sseClients: Set<SSEClient> = new Set();

function notifySseClients(state: BreadInventoryState) {
  const data = JSON.stringify(state);
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // SSE stream endpoint
  app.get('/api/inventory/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send current state immediately
    const current = loadState();
    res.write(`data: ${JSON.stringify(current)}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // GET current inventory status
  app.get('/api/inventory', (_req: Request, res: Response) => {
    const current = loadState();
    res.json(current);
  });

  // POST broadcast direct remaining stock to site (from seller interface)
  app.post('/api/inventory/set-stock', (req: Request, res: Response) => {
    const remaining = Math.max(0, parseInt(req.body.remaining, 10) || 0);
    const seller = req.body.seller || 'Vânzător magazin';
    const note = req.body.note || (remaining === 0 ? 'Înștiințare pe site: STOC EPUIZAT' : `Înștiințare pe site: mai sunt ${remaining} bucăți`);

    const state = loadState();

    if (remaining === 0) {
      // Immediate 0 / out of stock
      state.totalPhysicalSold = Math.max(0, state.dailyTarget - state.totalOnlineSold);
      state.remaining = 0;
      state.isSoldOut = true;
    } else {
      const currentAvailableBeforePhysical = state.dailyTarget - state.totalOnlineSold;
      if (remaining > currentAvailableBeforePhysical) {
        state.dailyTarget = state.totalOnlineSold + remaining;
        state.totalPhysicalSold = 0;
      } else {
        state.totalPhysicalSold = currentAvailableBeforePhysical - remaining;
      }
      state.remaining = remaining;
      state.isSoldOut = false;
    }

    state.logs.unshift({
      id: `set-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: getBucharestTimeFormatted(),
      type: remaining === 0 ? 'adjustment' : 'reset',
      quantity: remaining,
      seller,
      note,
    });

    if (state.logs.length > 100) state.logs = state.logs.slice(0, 100);

    saveState(state);
    res.json({ success: true, state });
  });

  // POST sell physical bread in store
  app.post('/api/inventory/sell-physical', (req: Request, res: Response) => {
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    const seller = req.body.seller || 'Vânzător magazin';
    const note = req.body.note || 'Vânzare fizică la tejghea';

    const state = loadState();

    if (state.remaining < qty) {
      return res.status(400).json({
        error: `Stoc insuficient. Mai sunt doar ${state.remaining} panini disponibile.`,
        currentRemaining: state.remaining,
      });
    }

    state.totalPhysicalSold += qty;
    state.logs.unshift({
      id: `phys-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: getBucharestTimeFormatted(),
      type: 'physical',
      quantity: -qty,
      seller,
      note,
    });

    // Keep max 100 recent logs
    if (state.logs.length > 100) state.logs = state.logs.slice(0, 100);

    saveState(state);
    res.json({ success: true, state });
  });

  // POST revert/undo physical sale (correction)
  app.post('/api/inventory/correction', (req: Request, res: Response) => {
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    const seller = req.body.seller || 'Vânzător magazin';
    const note = req.body.note || 'Corecție stoc fizic (+ adăugare)';

    const state = loadState();
    state.totalPhysicalSold = Math.max(0, state.totalPhysicalSold - qty);

    state.logs.unshift({
      id: `corr-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: getBucharestTimeFormatted(),
      type: 'adjustment',
      quantity: qty,
      seller,
      note,
    });

    if (state.logs.length > 100) state.logs = state.logs.slice(0, 100);

    saveState(state);
    res.json({ success: true, state });
  });

  // POST sell online bread (when customer completes an order)
  app.post('/api/inventory/sell-online', (req: Request, res: Response) => {
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    const customer = req.body.customer || 'Client online';
    const note = req.body.note || 'Comandă plasată pe site';

    const state = loadState();

    if (state.remaining < qty) {
      return res.status(400).json({
        error: `Stoc insuficient. Mai sunt doar ${state.remaining} panini disponibile.`,
        currentRemaining: state.remaining,
      });
    }

    state.totalOnlineSold += qty;
    state.logs.unshift({
      id: `online-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: getBucharestTimeFormatted(),
      type: 'online',
      quantity: -qty,
      seller: 'Comandă Online',
      note: `${note} (${customer})`,
    });

    if (state.logs.length > 100) state.logs = state.logs.slice(0, 100);

    saveState(state);
    res.json({ success: true, state });
  });

  // POST reset or update daily target (e.g. 12)
  app.post('/api/inventory/reset', (req: Request, res: Response) => {
    const today = getTodayBucharestDate();
    const target = Math.max(1, parseInt(req.body.target, 10) || 12);
    const seller = req.body.seller || 'Manager brutărie';

    const newState = createDefaultState(today, target);
    newState.logs.unshift({
      id: `reset-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: getBucharestTimeFormatted(),
      type: 'reset',
      quantity: target,
      seller,
      note: `Resetare lot zilnic la ${target} panini de către ${seller}`,
    });

    saveState(newState);
    res.json({ success: true, state: newState });
  });

  // POST update target count without resetting sold counts
  app.post('/api/inventory/adjust-target', (req: Request, res: Response) => {
    const target = Math.max(1, parseInt(req.body.target, 10) || 12);
    const seller = req.body.seller || 'Personal brutărie';
    const state = loadState();

    const diff = target - state.dailyTarget;
    state.dailyTarget = target;

    state.logs.unshift({
      id: `adj-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: getBucharestTimeFormatted(),
      type: 'adjustment',
      quantity: diff,
      seller,
      note: `Ajustare număr total panini copt azi la ${target} (${diff >= 0 ? `+${diff}` : diff})`,
    });

    saveState(state);
    res.json({ success: true, state });
  });

  // Explicit route for private staff inventory page so direct navigation to /inventar or /gestiune always serves SPA
  app.get(['/inventar', '/gestiune', '/inventar/*', '/gestiune/*'], (req: Request, res: Response, next) => {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      const distPath = path.resolve(__dirname, 'dist');
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });

  // Setup Vite dev server or static files
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sandwichef Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
