import { BreadInventoryState, CartItem } from '../types';

const STORAGE_KEY = 'sandwichef_bread_inventory_cache';

export const DEFAULT_INVENTORY: BreadInventoryState = {
  date: new Date().toISOString().split('T')[0],
  dailyTarget: 12,
  totalPhysicalSold: 0,
  totalOnlineSold: 0,
  remaining: 12,
  isSoldOut: false,
  lastUpdated: new Date().toISOString(),
  logs: [
    {
      id: 'default-init',
      timestamp: new Date().toISOString(),
      timeFormatted: '08:00:00',
      type: 'reset',
      quantity: 12,
      note: 'Inițializare automată lot zilnic (12 panini Schiacciata)',
      seller: 'Sistem',
    },
  ],
};

/**
 * Checks if a name contains 'panini' (case-insensitive) as specified by the business rule:
 * "oricare panini vandut din meniu va scadea numaratoarea, sunt mai multe feluri de panini dar aceeasi paine. te poti orienta dupa nume, care contine `panini` stii ca va scadea numerotarea"
 */
export function isPaniniName(name?: string): boolean {
  if (!name) return false;
  return /panini/i.test(name);
}

/**
 * Determines whether a CartItem is a Panini that consumes from the 12-panini daily batch
 */
export function isPaniniItem(item: CartItem): boolean {
  if (
    isPaniniName(item.menuItem.name) ||
    isPaniniName(item.menuItem.nameEn) ||
    isPaniniName(item.menuItem.nameIt)
  ) {
    return true;
  }

  if (item.menuItem.category === 'panini') {
    return true;
  }

  // Custom sandwich from Chef Lab with Schiacciata bread or named panini
  if (item.customSandwichDetails) {
    const bread = (item.customSandwichDetails.bread || '').toLowerCase();
    const customName = (item.menuItem.name || '').toLowerCase();
    if (bread.includes('schiacciata') || isPaniniName(customName)) {
      return true;
    }
  }

  return false;
}

// Helper: Calculate total panini consumed by cart items
export function calculatePaniniInCart(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => {
    if (isPaniniItem(item)) {
      return total + item.quantity;
    }
    return total;
  }, 0);
}

// Backward-compatible alias
export const calculateBreadsInCart = calculatePaniniInCart;

export function getCachedInventory(): BreadInventoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_INVENTORY;
}

export function setCachedInventory(state: BreadInventoryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

export async function fetchInventory(): Promise<BreadInventoryState> {
  try {
    const res = await fetch('/api/inventory');
    if (!res.ok) throw new Error('Network error');
    const data: BreadInventoryState = await res.json();
    setCachedInventory(data);
    return data;
  } catch (err) {
    return getCachedInventory();
  }
}

export async function recordPhysicalSale(
  quantity = 1,
  seller = 'Vânzător magazin',
  note = 'Vânzare fizică la tejghea'
): Promise<{ success: boolean; state?: BreadInventoryState; error?: string }> {
  try {
    const res = await fetch('/api/inventory/sell-physical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, seller, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Eroare la înregistrarea vânzării.' };
    }
    setCachedInventory(data.state);
    return { success: true, state: data.state };
  } catch (err) {
    // Fallback offline update
    const current = getCachedInventory();
    if (current.remaining < quantity) {
      return { success: false, error: `Stoc insuficient. Mai sunt ${current.remaining} pâini.` };
    }
    current.totalPhysicalSold += quantity;
    current.remaining = Math.max(0, current.dailyTarget - current.totalPhysicalSold - current.totalOnlineSold);
    current.isSoldOut = current.remaining <= 0;
    current.logs.unshift({
      id: `phys-offline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      type: 'physical',
      quantity: -quantity,
      seller,
      note: `${note} (offline)`,
    });
    setCachedInventory(current);
    return { success: true, state: current };
  }
}

export async function recordCorrection(
  quantity = 1,
  seller = 'Vânzător magazin',
  note = 'Corecție stoc fizic'
): Promise<{ success: boolean; state?: BreadInventoryState; error?: string }> {
  try {
    const res = await fetch('/api/inventory/correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, seller, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Eroare la corecția stocului.' };
    }
    setCachedInventory(data.state);
    return { success: true, state: data.state };
  } catch (err) {
    const current = getCachedInventory();
    current.totalPhysicalSold = Math.max(0, current.totalPhysicalSold - quantity);
    current.remaining = Math.max(0, current.dailyTarget - current.totalPhysicalSold - current.totalOnlineSold);
    current.isSoldOut = current.remaining <= 0;
    current.logs.unshift({
      id: `corr-offline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      type: 'adjustment',
      quantity: quantity,
      seller,
      note: `${note} (offline)`,
    });
    setCachedInventory(current);
    return { success: true, state: current };
  }
}

export async function recordOnlineSale(
  quantity = 1,
  customer = 'Client online',
  note = 'Comandă plasată pe site'
): Promise<{ success: boolean; state?: BreadInventoryState; error?: string }> {
  try {
    const res = await fetch('/api/inventory/sell-online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, customer, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Stoc insuficient pentru pâini.' };
    }
    setCachedInventory(data.state);
    return { success: true, state: data.state };
  } catch (err) {
    const current = getCachedInventory();
    current.totalOnlineSold += quantity;
    current.remaining = Math.max(0, current.dailyTarget - current.totalPhysicalSold - current.totalOnlineSold);
    current.isSoldOut = current.remaining <= 0;
    current.logs.unshift({
      id: `online-offline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      type: 'online',
      quantity: -quantity,
      seller: 'Comandă Online',
      note: `${note} (${customer})`,
    });
    setCachedInventory(current);
    return { success: true, state: current };
  }
}

export async function resetDailyTarget(
  target = 12,
  seller = 'Manager brutărie'
): Promise<{ success: boolean; state?: BreadInventoryState }> {
  try {
    const res = await fetch('/api/inventory/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, seller }),
    });
    const data = await res.json();
    if (data.state) {
      setCachedInventory(data.state);
      return { success: true, state: data.state };
    }
    return { success: false };
  } catch (err) {
    const today = new Date().toISOString().split('T')[0];
    const newState: BreadInventoryState = {
      date: today,
      dailyTarget: target,
      totalPhysicalSold: 0,
      totalOnlineSold: 0,
      remaining: target,
      isSoldOut: target <= 0,
      lastUpdated: new Date().toISOString(),
      logs: [
        {
          id: `reset-offline-${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeFormatted: new Date().toLocaleTimeString(),
          type: 'reset',
          quantity: target,
          seller,
          note: `Resetare lot la ${target} panini (offline)`,
        },
      ],
    };
    setCachedInventory(newState);
    return { success: true, state: newState };
  }
}

export async function adjustDailyTarget(
  target: number,
  seller = 'Personal brutărie'
): Promise<{ success: boolean; state?: BreadInventoryState }> {
  try {
    const res = await fetch('/api/inventory/adjust-target', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, seller }),
    });
    const data = await res.json();
    if (data.state) {
      setCachedInventory(data.state);
      return { success: true, state: data.state };
    }
    return { success: false };
  } catch (err) {
    const current = getCachedInventory();
    const diff = target - current.dailyTarget;
    current.dailyTarget = target;
    current.remaining = Math.max(0, current.dailyTarget - current.totalPhysicalSold - current.totalOnlineSold);
    current.isSoldOut = current.remaining <= 0;
    current.logs.unshift({
      id: `adj-offline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      type: 'adjustment',
      quantity: diff,
      seller,
      note: `Ajustare total copt azi la ${target} (offline)`,
    });
    setCachedInventory(current);
    return { success: true, state: current };
  }
}

/**
 * Directly broadcasts remaining bread count to the website, or announces out of stock
 */
export async function setRemainingBreadStock(
  remaining: number,
  seller = 'Vânzător magazin',
  customNote?: string
): Promise<{ success: boolean; state?: BreadInventoryState; error?: string }> {
  const note =
    customNote ||
    (remaining === 0
      ? 'Anunțat pe site: STOC EPUIZAT'
      : `Înștiințat pe site că mai sunt ${remaining} bucăți`);

  try {
    const res = await fetch('/api/inventory/set-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remaining, seller, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Eroare la actualizarea stocului pe site.' };
    }
    if (data.state) {
      setCachedInventory(data.state);
      return { success: true, state: data.state };
    }
    return { success: false, error: 'Răspuns neașteptat de la server.' };
  } catch (err) {
    // Offline fallback
    const current = getCachedInventory();
    if (remaining === 0) {
      current.totalPhysicalSold = Math.max(0, current.dailyTarget - current.totalOnlineSold);
      current.remaining = 0;
      current.isSoldOut = true;
    } else {
      const avail = current.dailyTarget - current.totalOnlineSold;
      if (remaining > avail) {
        current.dailyTarget = current.totalOnlineSold + remaining;
        current.totalPhysicalSold = 0;
      } else {
        current.totalPhysicalSold = avail - remaining;
      }
      current.remaining = remaining;
      current.isSoldOut = false;
    }
    current.logs.unshift({
      id: `set-offline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString(),
      type: remaining === 0 ? 'adjustment' : 'reset',
      quantity: remaining,
      seller,
      note: `${note} (offline)`,
    });
    setCachedInventory(current);
    return { success: true, state: current };
  }
}
