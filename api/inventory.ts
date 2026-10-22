import {
  getInventoryState,
  saveInventoryState,
  getBucharestTimeFormatted,
  isVercelKvConfigured,
} from './_inventoryStore';

// Vercel Serverless Function handler for /api/inventory
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const state = await getInventoryState();
      return res.status(200).json({
        ...state,
        _storage: isVercelKvConfigured() ? 'vercel_kv' : 'memory_fallback',
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const action = body.action || 'set-stock';
      const state = await getInventoryState();

      if (action === 'set-stock') {
        const remaining = Math.max(0, parseInt(body.remaining, 10) || 0);
        const seller = body.seller || 'Vânzător magazin';
        const note = body.note || (remaining === 0 ? 'Stoc epuizat pe site' : `Stoc setat la ${remaining}`);

        if (remaining === 0) {
          state.totalPhysicalSold = Math.max(0, state.dailyTarget - state.totalOnlineSold);
          state.remaining = 0;
          state.isSoldOut = true;
        } else {
          const avail = state.dailyTarget - state.totalOnlineSold;
          if (remaining > avail) {
            state.dailyTarget = state.totalOnlineSold + remaining;
            state.totalPhysicalSold = 0;
          } else {
            state.totalPhysicalSold = avail - remaining;
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

        await saveInventoryState(state);
        return res.status(200).json({ success: true, state });
      }

      if (action === 'sell-physical') {
        const qty = Math.max(1, parseInt(body.quantity, 10) || 1);
        const seller = body.seller || 'Vânzător magazin';
        const note = body.note || 'Vânzare fizică la tejghea';

        if (state.remaining < qty) {
          return res.status(400).json({
            success: false,
            error: `Stoc insuficient. Mai sunt ${state.remaining} bucăți.`,
          });
        }

        state.totalPhysicalSold += qty;
        state.remaining = Math.max(0, state.dailyTarget - state.totalPhysicalSold - state.totalOnlineSold);
        state.isSoldOut = state.remaining <= 0;

        state.logs.unshift({
          id: `phys-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeFormatted: getBucharestTimeFormatted(),
          type: 'physical',
          quantity: -qty,
          seller,
          note,
        });

        await saveInventoryState(state);
        return res.status(200).json({ success: true, state });
      }

      if (action === 'reset') {
        const target = Math.max(1, parseInt(body.target, 10) || 12);
        const seller = body.seller || 'Manager magazin';

        state.dailyTarget = target;
        state.totalPhysicalSold = 0;
        state.totalOnlineSold = 0;
        state.remaining = target;
        state.isSoldOut = false;

        state.logs.unshift({
          id: `rst-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeFormatted: getBucharestTimeFormatted(),
          type: 'reset',
          quantity: target,
          seller,
          note: `Start zi nouă / lot resetat la ${target} bucăți`,
        });

        await saveInventoryState(state);
        return res.status(200).json({ success: true, state });
      }

      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[API Inventory Error]:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
