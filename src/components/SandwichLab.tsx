import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Layers, Check, RotateCcw, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { BuilderOption, Language, MenuItem, BreadInventoryState } from '../types';
import { BUILDER_OPTIONS } from '../data/menuData';

interface SandwichLabProps {
  onAddCustomSandwich: (
    item: MenuItem,
    details: {
      bread: string;
      proteins: string[];
      cheeses: string[];
      veggies: string[];
      sauces: string[];
      totalWeight: number;
    }
  ) => void;
  lang: Language;
  inventory?: BreadInventoryState;
}

export const SandwichLab: React.FC<SandwichLabProps> = ({
  onAddCustomSandwich,
  lang,
  inventory,
}) => {
  // Selections
  const [selectedBread, setSelectedBread] = useState<string>('b-schiacciata');
  const [selectedProteins, setSelectedProteins] = useState<string[]>(['p-mortadella']);
  const [selectedCheeses, setSelectedCheeses] = useState<string[]>(['c-gorgonzola']);
  const [selectedVeggies, setSelectedVeggies] = useState<string[]>(['v-sundried', 'v-rucola']);
  const [selectedSauces, setSelectedSauces] = useState<string[]>(['s-pesto']);
  const [sandwichName, setSandwichName] = useState<string>('Panini Il Magnifico Craiova');
  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);

  const breads = BUILDER_OPTIONS.filter((o) => o.category === 'bread');
  const proteins = BUILDER_OPTIONS.filter((o) => o.category === 'protein');
  const cheeses = BUILDER_OPTIONS.filter((o) => o.category === 'cheese');
  const veggies = BUILDER_OPTIONS.filter((o) => o.category === 'veggies');
  const sauces = BUILDER_OPTIONS.filter((o) => o.category === 'sauce');

  // Toggle helpers
  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    id: string
  ) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  // Calculations
  const allSelectedIds = [
    selectedBread,
    ...selectedProteins,
    ...selectedCheeses,
    ...selectedVeggies,
    ...selectedSauces,
  ];

  const selectedOptions = BUILDER_OPTIONS.filter((o) => allSelectedIds.includes(o.id));
  const totalGrams = selectedOptions.reduce((sum, opt) => sum + opt.weight, 0);
  const totalPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);

  const handleReset = () => {
    setSelectedBread('b-schiacciata');
    setSelectedProteins(['p-mortadella']);
    setSelectedCheeses(['c-gorgonzola']);
    setSelectedVeggies(['v-sundried', 'v-rucola']);
    setSelectedSauces(['s-pesto']);
    setSandwichName('Panini Il Magnifico Craiova');
  };

  const handleCreateAndAddToCart = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#C44E36', '#F0BE2C', '#241813'],
      });
    } catch (e) {
      // non-blocking
    }

    const breadObj = BUILDER_OPTIONS.find((b) => b.id === selectedBread);
    const breadName = breadObj
      ? lang === 'ro'
        ? breadObj.name
        : lang === 'it'
        ? (breadObj.nameIt || breadObj.name)
        : breadObj.nameEn
      : 'Pâine Artizanală';

    const proteinNames = selectedProteins
      .map((id) => BUILDER_OPTIONS.find((o) => o.id === id))
      .filter(Boolean)
      .map((o) => (lang === 'ro' ? o!.name : lang === 'it' ? (o!.nameIt || o!.name) : o!.nameEn));

    const cheeseNames = selectedCheeses
      .map((id) => BUILDER_OPTIONS.find((o) => o.id === id))
      .filter(Boolean)
      .map((o) => (lang === 'ro' ? o!.name : lang === 'it' ? (o!.nameIt || o!.name) : o!.nameEn));

    const veggieNames = selectedVeggies
      .map((id) => BUILDER_OPTIONS.find((o) => o.id === id))
      .filter(Boolean)
      .map((o) => (lang === 'ro' ? o!.name : lang === 'it' ? (o!.nameIt || o!.name) : o!.nameEn));

    const sauceNames = selectedSauces
      .map((id) => BUILDER_OPTIONS.find((o) => o.id === id))
      .filter(Boolean)
      .map((o) => (lang === 'ro' ? o!.name : lang === 'it' ? (o!.nameIt || o!.name) : o!.nameEn));

    const customItem: MenuItem = {
      id: `custom-${Date.now()}`,
      number: 99,
      name:
        sandwichName ||
        (lang === 'ro' ? 'Sandwich Personalizat Chef' : lang === 'it' ? 'Panino Personalizzato Chef' : 'Custom Chef Sandwich'),
      nameEn: sandwichName || 'Custom Chef Sandwich',
      nameIt: sandwichName || 'Panino Personalizzato Chef',
      category: 'panini',
      price: totalPrice,
      weight: totalGrams,
      image: '/images/swc-panini-mama-mia.jpeg',
      ingredients: [breadName, ...proteinNames, ...cheeseNames, ...veggieNames, ...sauceNames],
      description: `Creație unică: ${breadName}, cu ${proteinNames.join(', ')} și sosuri gourmet.`,
      descriptionEn: `Custom creation with ${breadName}, ${proteinNames.join(', ')} and sauces.`,
      descriptionIt: `Creazione unica: ${breadName}, con ${proteinNames.join(', ')} e salse gourmet.`,
      tags: ['Creație Proprie', 'Chef Lab', `${totalGrams}g`],
    };

    onAddCustomSandwich(customItem, {
      bread: breadName,
      proteins: proteinNames,
      cheeses: cheeseNames,
      veggies: veggieNames,
      sauces: sauceNames,
      totalWeight: totalGrams,
    });
  };

  return (
    <section id="builder" className="py-12 sm:py-20 bg-[#F5EFE6] border-y border-[#241813]/10 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#C44E36] bg-[#C44E36]/10 mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F0BE2C]" />
            {lang === 'ro'
              ? 'Laboratorul Sandwichef'
              : lang === 'it'
              ? 'Laboratorio Sandwichef'
              : 'Sandwichef Creative Lab'}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#241813] tracking-tight mb-2 sm:mb-3">
            {lang === 'ro'
              ? 'Fii tu chef-ul! Creează-ți sandwich-ul'
              : lang === 'it'
              ? 'Diventa tu lo chef! Crea il tuo panino'
              : 'Build your own sandwich'}
          </h2>
          <p className="text-xs sm:text-base text-[#6B5E55] leading-relaxed px-2">
            {lang === 'ro'
              ? 'Alege pâinea toscană, carnea rumenită, brânzeturile fine și sosurile. Calculăm live gramajul și prețul.'
              : lang === 'it'
              ? 'Scegli la schiacciata toscana, salumi saporiti, formaggi pregiati e salse fatte in casa. Calcolo in tempo reale di peso e prezzo.'
              : 'Pick your artisan bread, proteins, cheeses, and dressings. Real-time weight and price.'}
          </p>
        </div>

        {/* MOBILE STICKY FLOATING ACTION BAR FOR PHONES */}
        <div className="lg:hidden sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-3 mb-6 border border-[#E7DDCE] shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-[#8C7E74] block">
                {lang === 'ro' ? 'Total live' : lang === 'it' ? 'Totale live' : 'Live total'}
              </span>
              <span className="font-bold text-sm sm:text-base text-[#C44E36]">
                {totalPrice} RON
              </span>
              <span className="text-xs text-[#8C7E74] ml-1">({totalGrams}g)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#FAF7F2] border border-[#E7DDCE] text-[#4A3B32] flex items-center gap-1 min-h-[40px]"
              aria-label="Arată previzualizare sandwich"
            >
              {showMobilePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>
                {showMobilePreview
                  ? (lang === 'ro' ? 'Ascunde' : lang === 'it' ? 'Nascondi' : 'Hide')
                  : (lang === 'ro' ? 'Straturi' : lang === 'it' ? 'Strati' : 'Layers')}
              </span>
            </button>

            <button
              id="builder-mobile-quick-add-btn"
              onClick={handleCreateAndAddToCart}
              className="px-4 py-2 bg-[#C44E36] hover:bg-[#A63B25] active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs min-h-[40px]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{lang === 'ro' ? 'Adaugă' : lang === 'it' ? 'Aggiungi' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Sandwich Stacker Preview */}
        {showMobilePreview && (
          <div className="lg:hidden bg-white p-4 rounded-2xl border border-[#E7DDCE] shadow-md mb-6 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#241813] flex items-center gap-1">
                <Layers className="w-4 h-4 text-[#C44E36]" />
                <span>
                  {lang === 'ro'
                    ? `Previzualizare Sandwichef (${totalGrams}g)`
                    : lang === 'it'
                    ? `Anteprima Panino (${totalGrams}g)`
                    : `Sandwich Preview (${totalGrams}g)`}
                </span>
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] font-bold text-[#8C7E74] hover:text-[#C44E36]"
              >
                {lang === 'ro' ? 'Resetează' : lang === 'it' ? 'Reimposta' : 'Reset'}
              </button>
            </div>

            {/* Visual Mini Stacker */}
            <div className="w-full max-w-[240px] mx-auto flex flex-col gap-1 items-center py-2">
              <div className="w-full h-6 rounded-t-xl bg-[#D99B52] border border-[#B37B39] shadow-2xs flex items-center justify-center text-[10px] font-bold text-[#4B2F10]">
                🍞 {BUILDER_OPTIONS.find((b) => b.id === selectedBread)?.name.split(' ')[0] || 'Pâine'} ({lang === 'ro' ? 'Capac' : lang === 'it' ? 'Sopra' : 'Top'})
              </div>

              {selectedSauces.map((sId) => {
                const s = BUILDER_OPTIONS.find((o) => o.id === sId);
                return (
                  <div
                    key={sId}
                    style={{ backgroundColor: s?.color || '#C44E36' }}
                    className="w-[92%] h-2 rounded-full opacity-90"
                    title={s?.name}
                  />
                );
              })}

              {selectedCheeses.map((cId) => {
                const c = BUILDER_OPTIONS.find((o) => o.id === cId);
                return (
                  <div
                    key={cId}
                    style={{ backgroundColor: c?.color || '#FFA500' }}
                    className="w-[95%] h-3 rounded-md border border-amber-300/60 shadow-2xs flex items-center justify-center text-[9px] font-bold text-stone-800"
                  >
                    🧀 {c?.name.split(' ')[0]}
                  </div>
                );
              })}

              {selectedProteins.map((pId) => {
                const p = BUILDER_OPTIONS.find((o) => o.id === pId);
                return (
                  <div
                    key={pId}
                    style={{ backgroundColor: p?.color || '#993D2C' }}
                    className="w-full h-4.5 rounded-md text-white text-[9px] font-bold flex items-center justify-center shadow-2xs"
                  >
                    🥩 {p?.name.slice(0, 20)}
                  </div>
                );
              })}

              {selectedVeggies.map((vId) => {
                const v = BUILDER_OPTIONS.find((o) => o.id === vId);
                return (
                  <div
                    key={vId}
                    style={{ backgroundColor: v?.color || '#3A7D44' }}
                    className="w-[96%] h-2.5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                  >
                    🥬 {v?.name.split(' ')[0]}
                  </div>
                );
              })}

              <div className="w-full h-5 rounded-b-lg bg-[#D99B52] border border-[#B37B39] shadow-2xs flex items-center justify-center text-[10px] font-bold text-[#4B2F10]">
                🍞 {lang === 'ro' ? 'Baza pâinii' : lang === 'it' ? 'Base piatto' : 'Bottom bread'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT: Interactive Options Picker (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Step 1: Bread */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E7DDCE] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[#241813] flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C44E36] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    1
                  </span>
                  <span>{lang === 'ro' ? 'Alege pâinea / baza' : lang === 'it' ? 'Scegli la base / pane' : 'Select bread base'}</span>
                </h3>
                <span className="text-[11px] text-[#8C7E74]">
                  {lang === 'ro' ? '1 opțiune' : lang === 'it' ? '1 opzione' : '1 choice'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {breads.map((bread) => {
                  const isSelected = selectedBread === bread.id;
                  const isSchiacciata = bread.id === 'b-schiacciata';
                  const isBreadSoldOut = isSchiacciata && !!inventory && inventory.remaining <= 0;
                  const isBreadLow = isSchiacciata && !!inventory && inventory.remaining > 0 && inventory.remaining <= 5;
                  const optName = lang === 'ro' ? bread.name : lang === 'it' ? (bread.nameIt || bread.name) : bread.nameEn;
                  return (
                    <button
                      key={bread.id}
                      id={`builder-bread-${bread.id}`}
                      type="button"
                      disabled={isBreadSoldOut}
                      onClick={() => setSelectedBread(bread.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all min-h-[44px] ${
                        isBreadSoldOut
                          ? 'bg-stone-100 border-stone-300 text-stone-400 cursor-not-allowed opacity-75'
                          : isSelected
                          ? 'bg-[#C44E36]/10 border-[#C44E36] text-[#241813] font-bold shadow-2xs cursor-pointer'
                          : 'bg-[#FAF7F2] border-[#E7DDCE] text-[#4A3B32] hover:bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isBreadSoldOut
                              ? 'border-stone-300 bg-stone-200'
                              : isSelected
                              ? 'border-[#C44E36] bg-[#C44E36] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && !isBreadSoldOut && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs sm:text-sm">{optName}</p>
                            {isBreadSoldOut && (
                              <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {lang === 'ro' ? 'Stoc epuizat pentru azi' : 'Sold out today'}
                              </span>
                            )}
                            {isBreadLow && (
                              <span className="text-[10px] bg-amber-500 text-stone-900 font-extrabold px-1.5 py-0.5 rounded-md">
                                🔥 {lang === 'ro' ? `Doar ${inventory?.remaining} rămase!` : `Only ${inventory?.remaining} left!`}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-[#8C7E74]">{bread.weight}g</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#C44E36] shrink-0 ml-2">
                        {bread.price} RON
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Proteins */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E7DDCE] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[#241813] flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C44E36] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    2
                  </span>
                  <span>{lang === 'ro' ? 'Carne & proteine' : lang === 'it' ? 'Salumi & carni' : 'Proteins & meats'}</span>
                </h3>
                <span className="text-[11px] text-[#8C7E74]">
                  {lang === 'ro' ? 'Selecție multiplă' : lang === 'it' ? 'Scelta multipla' : 'Multiple choices'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {proteins.map((p) => {
                  const isSelected = selectedProteins.includes(p.id);
                  const optName = lang === 'ro' ? p.name : lang === 'it' ? (p.nameIt || p.name) : p.nameEn;
                  return (
                    <button
                      key={p.id}
                      id={`builder-protein-${p.id}`}
                      type="button"
                      onClick={() => toggleArrayItem(selectedProteins, setSelectedProteins, p.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-[#C44E36]/10 border-[#C44E36] text-[#241813] font-bold shadow-2xs'
                          : 'bg-[#FAF7F2] border-[#E7DDCE] text-[#4A3B32] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#C44E36] bg-[#C44E36] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm">{optName}</p>
                          <span className="text-[10px] sm:text-[11px] text-[#8C7E74]">{p.weight}g</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#C44E36] shrink-0 ml-2">
                        +{p.price} RON
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Cheeses */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E7DDCE] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[#241813] flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C44E36] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    3
                  </span>
                  <span>{lang === 'ro' ? 'Brânzeturi fine & creme' : lang === 'it' ? 'Formaggi pregiati & creme' : 'Gourmet cheeses'}</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {cheeses.map((c) => {
                  const isSelected = selectedCheeses.includes(c.id);
                  const optName = lang === 'ro' ? c.name : lang === 'it' ? (c.nameIt || c.name) : c.nameEn;
                  return (
                    <button
                      key={c.id}
                      id={`builder-cheese-${c.id}`}
                      type="button"
                      onClick={() => toggleArrayItem(selectedCheeses, setSelectedCheeses, c.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-[#C44E36]/10 border-[#C44E36] text-[#241813] font-bold shadow-2xs'
                          : 'bg-[#FAF7F2] border-[#E7DDCE] text-[#4A3B32] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#C44E36] bg-[#C44E36] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm">{optName}</p>
                          <span className="text-[10px] sm:text-[11px] text-[#8C7E74]">{c.weight}g</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#C44E36] shrink-0 ml-2">
                        +{c.price} RON
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Veggies */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E7DDCE] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[#241813] flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C44E36] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    4
                  </span>
                  <span>{lang === 'ro' ? 'Legume & verdețuri' : lang === 'it' ? 'Verdure fresche & contorni' : 'Fresh veggies'}</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {veggies.map((v) => {
                  const isSelected = selectedVeggies.includes(v.id);
                  const optName = lang === 'ro' ? v.name : lang === 'it' ? (v.nameIt || v.name) : v.nameEn;
                  return (
                    <button
                      key={v.id}
                      id={`builder-veg-${v.id}`}
                      type="button"
                      onClick={() => toggleArrayItem(selectedVeggies, setSelectedVeggies, v.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-[#C44E36]/10 border-[#C44E36] text-[#241813] font-bold shadow-2xs'
                          : 'bg-[#FAF7F2] border-[#E7DDCE] text-[#4A3B32] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#C44E36] bg-[#C44E36] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm">{optName}</p>
                          <span className="text-[10px] sm:text-[11px] text-[#8C7E74]">{v.weight}g</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#C44E36] shrink-0 ml-2">
                        +{v.price} RON
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Sauces */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E7DDCE] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-[#241813] flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#C44E36] text-white text-xs flex items-center justify-center font-bold shrink-0">
                    5
                  </span>
                  <span>{lang === 'ro' ? 'Sosuri artizanale' : lang === 'it' ? 'Salse artigianali' : 'House sauces'}</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {sauces.map((s) => {
                  const isSelected = selectedSauces.includes(s.id);
                  const optName = lang === 'ro' ? s.name : lang === 'it' ? (s.nameIt || s.name) : s.nameEn;
                  return (
                    <button
                      key={s.id}
                      id={`builder-sauce-${s.id}`}
                      type="button"
                      onClick={() => toggleArrayItem(selectedSauces, setSelectedSauces, s.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-[#C44E36]/10 border-[#C44E36] text-[#241813] font-bold shadow-2xs'
                          : 'bg-[#FAF7F2] border-[#E7DDCE] text-[#4A3B32] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#C44E36] bg-[#C44E36] text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm">{optName}</p>
                          <span className="text-[10px] sm:text-[11px] text-[#8C7E74]">{s.weight}g</span>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-[#C44E36] shrink-0 ml-2">
                        +{s.price} RON
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Visual Sandwich Stacker & Cart Summary (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7DDCE] shadow-md">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#E7DDCE] mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#C44E36]" />
                  <span className="font-serif text-base sm:text-lg font-bold text-[#241813]">
                    {lang === 'ro' ? 'Panoul de asamblare' : lang === 'it' ? 'Banco di assemblaggio' : 'Assembly board'}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-[#8C7E74] hover:text-[#C44E36] flex items-center gap-1 cursor-pointer p-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ro' ? 'Resetează' : lang === 'it' ? 'Reimposta' : 'Reset'}</span>
                </button>
              </div>

              {/* Name your sandwich */}
              <div className="mb-4 sm:mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7E74] mb-1">
                  {lang === 'ro' ? 'Numește creația ta' : lang === 'it' ? 'Dai un nome al tuo panino' : 'Name your sandwich'}
                </label>
                <input
                  type="text"
                  id="custom-sandwich-name-input"
                  value={sandwichName}
                  onChange={(e) => setSandwichName(e.target.value)}
                  placeholder={lang === 'ro' ? 'Ex: Panini favorit Craiova' : lang === 'it' ? 'Es: Panino preferito Craiova' : 'e.g. Favorite panini Craiova'}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl font-bold text-[#241813] focus:outline-none focus:border-[#C44E36] min-h-[44px]"
                />
              </div>

              {/* Visual Sandwich Stacker Graphic */}
              <div className="bg-[#FAF7F2] p-3 sm:p-4 rounded-2xl border border-[#E7DDCE] mb-4 sm:mb-6 flex flex-col items-center">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#8C7E74] mb-2">
                  {lang === 'ro' ? 'Stratificare reală (secțiune)' : lang === 'it' ? 'Stratificazione reale' : 'Live layer stacking'}
                </p>

                <div className="w-full max-w-[240px] flex flex-col gap-1.5 items-center py-2">
                  <div className="w-full h-7 rounded-t-xl bg-[#D99B52] border border-[#B37B39] shadow-2xs flex items-center justify-center text-[11px] font-bold text-[#4B2F10] tracking-wide">
                    🍞 {BUILDER_OPTIONS.find((b) => b.id === selectedBread)?.name.split(' ')[0] || 'Pâine'} ({lang === 'ro' ? 'Capac' : lang === 'it' ? 'Sopra' : 'Top'})
                  </div>

                  {selectedSauces.map((sId) => {
                    const s = BUILDER_OPTIONS.find((o) => o.id === sId);
                    return (
                      <div
                        key={sId}
                        style={{ backgroundColor: s?.color || '#C44E36' }}
                        className="w-[92%] h-2.5 rounded-full opacity-90 transition-all duration-300"
                        title={s?.name}
                      />
                    );
                  })}

                  {selectedCheeses.map((cId) => {
                    const c = BUILDER_OPTIONS.find((o) => o.id === cId);
                    return (
                      <div
                        key={cId}
                        style={{ backgroundColor: c?.color || '#FFA500' }}
                        className="w-[95%] h-3.5 rounded-md border border-amber-300/60 shadow-2xs flex items-center justify-center text-[10px] font-bold text-stone-800"
                      >
                        🧀 {c?.name.split(' ')[0]}
                      </div>
                    );
                  })}

                  {selectedProteins.map((pId) => {
                    const p = BUILDER_OPTIONS.find((o) => o.id === pId);
                    return (
                      <div
                        key={pId}
                        style={{ backgroundColor: p?.color || '#993D2C' }}
                        className="w-full h-5 rounded-md text-white text-[10px] font-bold flex items-center justify-center shadow-2xs"
                      >
                        🥩 {p?.name.slice(0, 22)}...
                      </div>
                    );
                  })}

                  {selectedVeggies.map((vId) => {
                    const v = BUILDER_OPTIONS.find((o) => o.id === vId);
                    return (
                      <div
                        key={vId}
                        style={{ backgroundColor: v?.color || '#3A7D44' }}
                        className="w-[96%] h-3 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      >
                        🥬 {v?.name.split(' ')[0]}
                      </div>
                    );
                  })}

                  <div className="w-full h-6 rounded-b-xl bg-[#D99B52] border border-[#B37B39] shadow-2xs flex items-center justify-center text-[11px] font-bold text-[#4B2F10] tracking-wide">
                    🍞 {lang === 'ro' ? 'Baza pâinii' : lang === 'it' ? 'Base piatto' : 'Bottom bread'}
                  </div>
                </div>
              </div>

              {/* Weight & Price Metrics */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-center">
                  <p className="text-[11px] text-[#8C7E74] font-medium">
                    {lang === 'ro' ? 'Gramaj total' : lang === 'it' ? 'Peso totale' : 'Total weight'}
                  </p>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#241813]">
                    {totalGrams} <span className="text-xs font-sans font-normal">G</span>
                  </p>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7DDCE] text-center">
                  <p className="text-[11px] text-[#8C7E74] font-medium">
                    {lang === 'ro' ? 'Preț total' : lang === 'it' ? 'Prezzo totale' : 'Total price'}
                  </p>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#C44E36]">
                    {totalPrice} <span className="text-xs font-sans font-normal">RON</span>
                  </p>
                </div>
              </div>

              {/* Action: Add to Cart */}
              {selectedBread === 'b-schiacciata' && inventory && inventory.remaining <= 0 ? (
                <div className="p-3.5 rounded-2xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold text-center mb-2">
                  🥖 {lang === 'ro' ? `Stoc epuizat pentru azi! Toate cele ${inventory.dailyTarget} pâini Schiacciata au fost vândute. Alege un alt tip de pâine sau revenim mâine!` : 'Panini bread sold out for today. Please select another bread!'}
                </div>
              ) : selectedBread === 'b-schiacciata' && inventory && inventory.remaining > 0 && inventory.remaining <= 5 ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold text-center mb-2 flex items-center justify-center gap-1.5 shadow-2xs">
                  <span>🔥</span>
                  <span>
                    {lang === 'ro'
                      ? (inventory.remaining === 1 ? 'Atenție: a mai rămas doar 1 pâine Schiacciata disponibilă azi!' : `Atenție: mai sunt doar ${inventory.remaining} pâini Schiacciata disponibile azi!`)
                      : `Hurry! Only ${inventory.remaining} Schiacciata breads left today!`}
                  </span>
                </div>
              ) : null}

              <button
                id="builder-add-cart-btn"
                disabled={selectedBread === 'b-schiacciata' && !!inventory && inventory.remaining <= 0}
                onClick={handleCreateAndAddToCart}
                className={`w-full py-3.5 px-6 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base min-h-[48px] ${
                  selectedBread === 'b-schiacciata' && inventory && inventory.remaining <= 0
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                    : 'bg-[#C44E36] hover:bg-[#A63B25] active:scale-98 text-white cursor-pointer'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {selectedBread === 'b-schiacciata' && inventory && inventory.remaining <= 0
                    ? (lang === 'ro' ? 'Stoc epuizat pentru azi' : 'Sold out today')
                    : (lang === 'ro' ? 'Comandă creația ta' : lang === 'it' ? 'Ordina il tuo panino' : 'Order your panini')} {!inventory || inventory.remaining > 0 || selectedBread !== 'b-schiacciata' ? `(${totalPrice} RON)` : ''}
                </span>
              </button>

              <p className="text-center text-[11px] text-[#8C7E74] mt-2.5">
                {lang === 'ro'
                  ? 'Pregătit manual pe loc la Sandwichef Craiova, Str. Amaradia 29'
                  : lang === 'it'
                  ? 'Preparato fresco sul momento da Sandwichef Craiova, Via Amaradia 29'
                  : 'Crafted to order at Sandwichef Craiova'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
