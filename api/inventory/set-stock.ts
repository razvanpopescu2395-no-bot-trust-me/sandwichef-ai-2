import {
  getInventoryState,
  saveInventoryState,
  getBucharestTimeFormatted,
} from '../_inventoryStore';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const remaining = Math.max(0, parseInt(body.remaining, 10) || 0);
    const seller = body.seller || 'Vânzător magazin';
    const note = body.note || (remaining === 0 ? 'Stoc epuizat pe site' : `Stoc setat la ${remaining}`);

    const state = await getInventoryState();

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
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
