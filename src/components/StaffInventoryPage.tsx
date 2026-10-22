import React, { useState, useEffect } from 'react';
import { BreadInventoryState } from '../types';
import {
  setRemainingBreadStock,
  resetDailyTarget,
  adjustDailyTarget,
  fetchInventory,
} from '../utils/inventoryClient';
import {
  ArrowLeft,
  Flame,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  History,
  Store,
  Globe,
  Settings,
  Sparkles,
  RefreshCw,
  User,
  ShieldCheck,
  Volume2,
  VolumeX,
  Radio,
  Send,
  Eye,
  Check,
  XCircle,
} from 'lucide-react';

interface StaffInventoryPageProps {
  inventory: BreadInventoryState;
  onInventoryUpdate: (newState: BreadInventoryState) => void;
  onBackToStore: () => void;
  isInventoryLoading?: boolean;
}

export const StaffInventoryPage: React.FC<StaffInventoryPageProps> = ({
  inventory,
  onInventoryUpdate,
  onBackToStore,
  isInventoryLoading = false,
}) => {
  const [sellerName, setSellerName] = useState(() => {
    return localStorage.getItem('sandwichef_staff_name') || 'Tura de zi (Magazin)';
  });

  // Selected X count for broadcasting to the site
  const [selectedCount, setSelectedCount] = useState<number>(() => {
    return Math.max(0, inventory.remaining);
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [targetInput, setTargetInput] = useState(inventory.dailyTarget.toString());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const isDisplayLoading = isInventoryLoading || isRefreshing;

  // Sync selectedCount when external inventory remaining changes, unless user is currently editing
  useEffect(() => {
    setSelectedCount(Math.max(0, inventory.remaining));
  }, [inventory.remaining]);

  useEffect(() => {
    setTargetInput(inventory.dailyTarget.toString());
  }, [inventory.dailyTarget]);

  // Audio tone synthesizer for satisfying cashier / broadcast feedback
  const playCashSound = (isSuccess = true) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio not permitted or supported
    }
  };

  const handleSellerNameChange = (val: string) => {
    setSellerName(val);
    localStorage.setItem('sandwichef_staff_name', val);
  };

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => {
      setActionFeedback(null);
    }, 3500);
  };

  // Primary action 1: "Înștiințează pe site că mai sunt X bucăți"
  const handleBroadcastStock = async (count: number) => {
    const validCount = Math.max(0, count);
    setIsLoading(true);
    const seller = sellerName.trim() || 'Vânzător magazin';
    const note =
      validCount === 0
        ? 'Spus pe site că nu mai sunt în stoc'
        : `Înștiințat pe site că mai sunt ${validCount} bucăți`;

    const res = await setRemainingBreadStock(validCount, seller, note);
    setIsLoading(false);

    if (res.success && res.state) {
      playCashSound(true);
      onInventoryUpdate(res.state);
      triggerFeedback(
        validCount === 0
          ? '🛑 Site actualizat: Clienții văd „Stoc epuizat pentru azi”!'
          : `✅ Site actualizat: Clienții văd că mai sunt ${validCount} ${validCount === 1 ? 'bucată' : 'bucăți'}!`
      );
    } else {
      playCashSound(false);
      triggerFeedback(`❌ ${res.error || 'A apărut o eroare la actualizarea site-ului.'}`);
    }
  };

  // Primary action 2: Instant 1-click button: "Spune pe site că nu mai sunt în stoc"
  const handleInstantSoldOut = async () => {
    setIsLoading(true);
    setSelectedCount(0);
    const seller = sellerName.trim() || 'Vânzător magazin';
    const res = await setRemainingBreadStock(
      0,
      seller,
      'Spus pe site că nu mai sunt în stoc (1-click)'
    );
    setIsLoading(false);

    if (res.success && res.state) {
      playCashSound(true);
      onInventoryUpdate(res.state);
      triggerFeedback('🛑 Ai spus pe site că nu mai sunt în stoc! Panini marcate ca „Stoc epuizat”.');
    } else {
      playCashSound(false);
      triggerFeedback(`❌ ${res.error || 'A apărut o eroare.'}`);
    }
  };

  // Manual refresh of state from server
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const latest = await fetchInventory();
      onInventoryUpdate(latest);
      setSelectedCount(latest.remaining);
      triggerFeedback('🔄 Datele de stoc au fost reîmprospătate din server.');
    } catch (e) {
      triggerFeedback('Eroare la conectare cu serverul.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Start new day reset
  const handleConfirmReset = async () => {
    setIsLoading(true);
    setIsResetModalOpen(false);
    const res = await resetDailyTarget(12, sellerName.trim() || 'Manager brutărie');
    setIsLoading(false);
    if (res.success && res.state) {
      playCashSound(true);
      onInventoryUpdate(res.state);
      setSelectedCount(res.state.remaining);
      triggerFeedback('🥖 Zi nouă inițializată: lot complet de 12 panini Schiacciata pe site!');
    }
  };

  // Adjust total production
  const handleConfirmAdjust = async () => {
    const val = parseInt(targetInput, 10);
    if (isNaN(val) || val < 1) return;
    setIsLoading(true);
    setIsAdjustModalOpen(false);
    const res = await adjustDailyTarget(val, sellerName.trim() || 'Personal brutărie');
    setIsLoading(false);
    if (res.success && res.state) {
      playCashSound(true);
      onInventoryUpdate(res.state);
      setSelectedCount(res.state.remaining);
      triggerFeedback(`Totalul copt a fost setat la ${val} panini.`);
    }
  };

  const presetValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

  return (
    <div className="min-h-screen bg-[#1E1511] text-stone-100 selection:bg-[#C44E36] selection:text-white pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#2B1F19]/95 backdrop-blur-md border-b border-[#3D2C24] px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-2 -ml-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Înapoi la site-ul clienților"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Magazin Online</span>
            </button>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xl">🥖</span>
              <div>
                <h1 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide leading-tight">
                  Panou Vânzători • Sandwichef Craiova
                </h1>
                <p className="text-[10px] sm:text-[11px] text-[#D9A384] flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Link privat vânzători: <code className="text-white/90 font-mono">/inventar</code>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 transition-colors cursor-pointer"
              title={soundEnabled ? 'Dezactivează sunet confirmare' : 'Activează sunet confirmare'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#F0BE2C]" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
              title="Reîmprospătează stocul"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#F0BE2C]' : ''}`} />
              <span className="hidden md:inline">Actualizează</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Feedback Toast */}
      {actionFeedback && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-black/95 border border-white/20 text-white text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 flex items-center gap-2.5">
          <span>{actionFeedback}</span>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Private Page Reminder & Seller Name Bar */}
        <div className="bg-[#2B1D16] border border-[#4A3225] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C44E36]/20 border border-[#C44E36]/40 flex items-center justify-center text-[#E07A5F] shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#A8988F] font-bold">
                Vânzător / Tură
              </p>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => handleSellerNameChange(e.target.value)}
                placeholder="Numele tău sau tura"
                className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-white/30 focus:border-[#F0BE2C] focus:outline-none transition-colors px-0 py-0.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-stone-400">
            <span className="hidden sm:inline">Pagină privată vânzători:</span>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 font-mono text-white text-[11px] border border-white/5">
              www.sandwichef.ro/inventar
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 font-mono text-[#F0BE2C] font-semibold">
              {inventory.date}
            </span>
          </div>
        </div>

        {/* Current Live State Card (What is currently active on the site) or Skeleton Screen */}
        {isDisplayLoading ? (
          <div
            data-testid="staff-inventory-skeleton"
            className="p-5 sm:p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#261C16] to-[#1C1410] shadow-xl relative overflow-hidden skeleton-shimmer"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-stone-700/60 animate-pulse" />
                <div className="h-4 w-44 bg-stone-700/60 rounded-md animate-pulse" />
              </div>
              <div className="h-6 w-32 bg-stone-700/50 rounded-full animate-pulse" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <div className="h-16 w-24 sm:w-28 bg-stone-700/70 rounded-2xl animate-pulse" />
                  <div className="h-5 w-28 bg-stone-700/40 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Skeleton Customer Preview Box */}
              <div className="bg-black/50 border border-white/10 rounded-2xl p-3.5 sm:p-4 w-full sm:w-80 space-y-2.5">
                <div className="h-3 w-36 bg-stone-700/60 rounded-md animate-pulse" />
                <div className="h-3.5 w-56 bg-stone-700/80 rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
              inventory.remaining === 0
                ? 'bg-gradient-to-br from-red-950/80 via-[#2A1212] to-[#1F1010] border-red-500/50 shadow-xl shadow-red-950/40'
                : inventory.remaining <= 5
                ? 'bg-gradient-to-br from-amber-950/70 via-[#2D1E12] to-[#22160E] border-amber-500/50 shadow-xl shadow-amber-950/40'
                : 'bg-gradient-to-br from-[#1C3325] via-[#16271D] to-[#121E17] border-emerald-500/40 shadow-xl shadow-emerald-950/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥖</span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Starea Curentă Afișată pe Site
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    inventory.remaining === 0
                      ? 'bg-red-500 animate-pulse'
                      : inventory.remaining <= 5
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="font-semibold text-stone-200">
                  {inventory.remaining === 0
                    ? 'Stoc epuizat pe site'
                    : inventory.remaining <= 5
                    ? `Stoc redus (< 5)`
                    : 'Stoc suficient (> 5)'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-6xl sm:text-7xl font-black font-mono tracking-tight ${
                      inventory.remaining === 0
                        ? 'text-red-400'
                        : inventory.remaining <= 5
                        ? 'text-[#F0BE2C]'
                        : 'text-emerald-400'
                    }`}
                  >
                    {inventory.remaining}
                  </span>
                  <span className="text-stone-300 text-lg font-semibold">
                    {inventory.remaining === 1 ? 'panini rămas' : 'panini rămase'}
                  </span>
                </div>
              </div>

              {/* Live Customer Preview Box */}
              <div className="bg-black/50 border border-white/15 rounded-2xl p-3.5 sm:p-4 max-w-sm">
                <p className="text-[11px] uppercase tracking-wider text-stone-400 font-bold mb-1 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#F0BE2C]" />
                  Ce văd clienții acum pe site:
                </p>
                {inventory.remaining === 0 ? (
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>„Stoc epuizat pentru azi” (fără detalii despre numărul total inițial)</span>
                  </div>
                ) : inventory.remaining <= 5 ? (
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      {inventory.remaining === 1
                        ? '„Ultimul panini disponibil azi!”'
                        : `„Doar ${inventory.remaining} panini rămase azi!”`}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Disponibil normal (fără avertizare, conform regulii de sub 5 bucăți)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN SELLER BROADCAST CONTROL PANEL                                       */}
        {/* ========================================================================= */}
        <div className="bg-[#291E18] border-2 border-[#C44E36]/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
          <div className="border-b border-[#3E2D24] pb-4">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#C44E36] animate-pulse" />
              <span>Transmite Stocul Live pe Site</span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Nu trebuie să notezi fiecare vânzare pentru bilanț. Te uiți câte pâini Schiacciata mai ai la tejghea, selectezi numărul și apeși butonul:
            </p>
          </div>

          {/* Section 1: Selector for X & Primary Button "Înștiințează pe site că mai sunt X bucăți" */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-200 flex items-center gap-1.5">
                  <span>1. Alege câte bucăți mai ai disponibile:</span>
                </label>
                <p className="text-[11px] text-stone-400">
                  Selectează direct din butoane sau folosește reglajul manual
                </p>
              </div>

              {/* Number Stepper for X */}
              <div className="flex items-center gap-2 bg-black/40 border border-[#4E372E] rounded-2xl p-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCount(Math.max(0, selectedCount - 1))}
                  className="w-10 h-10 rounded-xl bg-[#382821] hover:bg-[#4A352C] active:scale-95 text-stone-200 flex items-center justify-center font-bold text-lg transition-all cursor-pointer"
                  title="Scade cu 1"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-3 min-w-[70px] text-center">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-[#F0BE2C]">
                    {selectedCount}
                  </span>
                  <span className="block text-[10px] text-stone-400 uppercase font-semibold">
                    bucăți
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCount(selectedCount + 1)}
                  className="w-10 h-10 rounded-xl bg-[#382821] hover:bg-[#4A352C] active:scale-95 text-stone-200 flex items-center justify-center font-bold text-lg transition-all cursor-pointer"
                  title="Crește cu 1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Presets for X (0 to 12) for fast 1-tap selection behind the counter */}
            <div>
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                Atinge rapid numărul de bucăți rămase:
              </span>
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
                {presetValues.map((val) => {
                  const isSelected = selectedCount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedCount(val)}
                      className={`py-2.5 rounded-xl font-mono text-sm sm:text-base font-bold transition-all active:scale-95 flex flex-col items-center justify-center cursor-pointer border ${
                        isSelected
                          ? 'bg-[#C44E36] border-[#F5B499] text-white shadow-lg shadow-[#C44E36]/40 scale-105 z-10'
                          : val === 0
                          ? 'bg-red-950/40 border-red-800/40 text-red-300 hover:bg-red-900/50'
                          : val <= 5
                          ? 'bg-[#3A271F] border-amber-700/40 text-[#F0BE2C] hover:bg-[#483127]'
                          : 'bg-[#2F211A] border-[#443026] text-stone-200 hover:bg-[#3D2B22]'
                      }`}
                    >
                      <span>{val}</span>
                      <span className="text-[9px] font-sans font-normal opacity-70">
                        {val === 0 ? 'zero' : 'buc'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIMARY BUTTON 1: "Înștiințează pe site că mai sunt X bucăți" */}
            <div className="pt-2">
              <button
                type="button"
                id="staff-broadcast-stock-btn"
                onClick={() => handleBroadcastStock(selectedCount)}
                disabled={isLoading}
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-[#C44E36] via-[#D3573E] to-[#B63E28] hover:from-[#D25940] hover:to-[#C44E36] active:scale-[0.99] text-white font-extrabold text-base sm:text-lg shadow-xl shadow-[#C44E36]/30 border border-[#F5B499]/40 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>
                  Înștiințează pe site că mai sunt {selectedCount} {selectedCount === 1 ? 'bucată' : 'bucăți'}
                </span>
              </button>
            </div>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3E2D24]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#291E18] px-3 text-stone-500 font-semibold tracking-wider">
                Sau acțiune rapidă de urgență
              </span>
            </div>
          </div>

          {/* Section 2: FAST 1-CLICK BUTTON: "Spune pe site că nu mai sunt în stoc" */}
          <div>
            <button
              type="button"
              id="staff-instant-soldout-btn"
              onClick={handleInstantSoldOut}
              disabled={isLoading || inventory.remaining === 0}
              className={`w-full py-4 sm:py-4.5 px-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.99] cursor-pointer border ${
                inventory.remaining === 0
                  ? 'bg-red-950/30 border-red-900/40 text-red-400/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-700 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white border-red-400/40 shadow-red-950/50 hover:shadow-xl hover:shadow-red-900/40'
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-amber-300" />
              <span>Spune pe site că nu mai sunt în stoc</span>
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Apasă acest buton când s-a dat ultima pâine Schiacciata. Site-ul va afișa imediat „Stoc epuizat pentru azi”.
            </p>
          </div>
        </div>

        {/* History of Recent Broadcasts & Reset Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* History of Announcements */}
          <div className="md:col-span-2 bg-[#291E18] border border-[#3E2D24] rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-[#3E2D24] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#F0BE2C]" />
                <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                  Jurnal Înștiințări pe Site ({inventory.logs.length})
                </h3>
              </div>
              <span className="text-[11px] text-stone-400">Transmisii în timp real</span>
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 divide-y divide-[#382820]">
              {isDisplayLoading ? (
                <div className="space-y-3 py-1">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="flex items-center gap-2.5 skeleton-shimmer">
                      <div className="w-7 h-7 rounded-lg bg-stone-800/80 border border-white/5 shrink-0 animate-pulse" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-3/4 bg-stone-800/80 rounded animate-pulse" />
                        <div className="h-2.5 w-1/3 bg-stone-800/50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : inventory.logs.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">
                  Nicio înștiințare trimisă încă azi.
                </p>
              ) : (
                inventory.logs.map((log) => (
                  <div
                    key={log.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                          log.note.includes('STOC EPUIZAT') || log.note.includes('nu mai sunt în stoc')
                            ? 'bg-red-950/60 text-red-400 border border-red-600/30'
                            : 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30'
                        }`}
                      >
                        {log.note.includes('STOC EPUIZAT') || log.note.includes('nu mai sunt în stoc') ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-200 leading-snug">{log.note}</p>
                        <p className="text-[10px] text-stone-400">
                          {log.seller || 'Vânzător'} • {log.timeFormatted}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Management / Reset to 12 */}
          <div className="bg-[#291E18] border border-[#3E2D24] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#C44E36]" />
                <h3 className="font-serif text-sm font-bold text-white">
                  Resetare / Lot Nou
                </h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Dacă s-a copt o nouă serie de Schiacciata sau vrei să resetezi ziua:
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleBroadcastStock(12)}
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-stone-200 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Setează stoc complet (12 bucăți)</span>
                <span className="font-mono text-[#F0BE2C] font-bold">12</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-700/40 text-xs font-bold text-red-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Zi Nouă</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-[10px] text-stone-400">
              🔒 <span className="text-stone-300 font-semibold">Pagină ascunsă de clienți:</span> Nu există butoane în site către această pagină. Doar vânzătorii care știu adresa <span className="text-[#F0BE2C] font-mono">/inventar</span> o pot accesa.
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Confirm Reset */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#291E18] border border-[#4E372E] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-600/40 text-red-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white mb-1">
              Începi o zi nouă?
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed">
              Această acțiune va reseta lotul la 12 panini disponibile pe site.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-stone-300 text-xs font-bold hover:bg-white/15 cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-lg shadow-red-900/40 cursor-pointer"
              >
                Da, resetează la 12
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adjust Target */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#291E18] border border-[#4E372E] rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-lg font-bold text-white mb-2">
              Ajustează totalul copt azi
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Dacă brutăria a pregătit un număr diferit de panini azi, modifică numărul total mai jos:
            </p>
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-stone-300 uppercase mb-1">
                Total panini azi
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#4E372E] text-white font-mono text-lg font-bold focus:outline-none focus:border-[#C44E36]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-stone-300 text-xs font-bold hover:bg-white/15 cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjust}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-[#C44E36] text-white text-xs font-bold hover:bg-[#D25940] cursor-pointer"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
