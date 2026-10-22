import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, AlertCircle, Sparkles, Check } from 'lucide-react';
import { MenuItem, Language, BreadInventoryState } from '../types';
import { handleSafeImageError, FALLBACK_IMAGES } from '../utils/imageFallback';

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  inventory?: BreadInventoryState;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    removedIngredients: string[],
    selectedExtras: string[],
    instructions: string
  ) => void;
  lang: Language;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  inventory,
  onAddToCart,
  lang,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  if (!item) return null;

  const extraOptions = [
    { id: 'extra-sauce', nameRo: 'Extra Sos Gorgonzola (+5 RON)', nameEn: 'Extra Gorgonzola Sauce (+5 RON)', nameIt: 'Extra Salsa Gorgonzola (+5 RON)', price: 5 },
    { id: 'extra-cheese', nameRo: 'Extra Cașcaval Afumat (+5 RON)', nameEn: 'Extra Smoked Cheese (+5 RON)', nameIt: 'Extra Formaggio Affumicato (+5 RON)', price: 5 },
    { id: 'extra-jalapeno', nameRo: 'Extra Jalapeño Picant (+4 RON)', nameEn: 'Extra Spicy Jalapeño (+4 RON)', nameIt: 'Extra Jalapeño Piccante (+4 RON)', price: 4 },
  ];

  const currentIngredients = lang === 'ro'
    ? item.ingredients
    : lang === 'it'
    ? (item.ingredientsIt || item.ingredients)
    : (item.ingredientsEn || item.ingredients);

  const toggleRemoveIngredient = (ing: string) => {
    if (removedIngredients.includes(ing)) {
      setRemovedIngredients(removedIngredients.filter((i) => i !== ing));
    } else {
      setRemovedIngredients([...removedIngredients, ing]);
    }
  };

  const toggleExtra = (extraId: string) => {
    if (selectedExtras.includes(extraId)) {
      setSelectedExtras(selectedExtras.filter((e) => e !== extraId));
    } else {
      setSelectedExtras([...selectedExtras, extraId]);
    }
  };

  const extrasPrice = selectedExtras.reduce((sum, extraId) => {
    const found = extraOptions.find((o) => o.id === extraId);
    return sum + (found ? found.price : 0);
  }, 0);

  const unitPrice = item.price + extrasPrice;
  const totalPrice = unitPrice * quantity;

  const isPanini =
    item.category === 'panini' ||
    item.name.toLowerCase().includes('panini') ||
    (item.nameEn && item.nameEn.toLowerCase().includes('panini')) ||
    (item.nameIt && item.nameIt.toLowerCase().includes('panini'));
  const isPaniniSoldOut = isPanini && !!inventory && inventory.remaining <= 0;
  const isPaniniLowStock = isPanini && !!inventory && inventory.remaining > 0 && inventory.remaining <= 5;

  const handleAdd = () => {
    if (isPaniniSoldOut) return;
    onAddToCart(item, quantity, removedIngredients, selectedExtras, instructions);
    onClose();
  };

  const itemName = lang === 'ro' ? item.name : lang === 'it' ? (item.nameIt || item.name) : (item.nameEn || item.name);
  const itemDesc = lang === 'ro' ? item.description : lang === 'it' ? (item.descriptionIt || item.description) : (item.descriptionEn || item.description);

  return (
    <div
      id="item-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="item-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90dvh] animate-in slide-in-from-bottom duration-300 border border-[#E7DDCE]"
      >
        {/* Mobile Drag Pill */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2 pb-1 bg-white">
          <div className="w-12 h-1.5 rounded-full bg-stone-300" />
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 min-h-0 overflow-y-auto touch-scroll overscroll-contain">
          {/* Item Header Image */}
          <div className="relative h-48 sm:h-64 bg-[#F0EAE1] overflow-hidden">
            <img
              src={item.image}
              alt={itemName}
              className={`w-full h-full object-cover ${isPaniniSoldOut ? 'grayscale-40' : ''}`}
              onError={(e) => {
                handleSafeImageError(e, FALLBACK_IMAGES.sandwich);
              }}
            />
            {/* Close Button */}
            <button
              id="close-item-detail-btn"
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label={lang === 'ro' ? 'Închide fereastra' : lang === 'it' ? 'Chiudi finestra' : 'Close modal'}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Weight badge */}
            <div className="absolute bottom-3 left-3 bg-[#241813]/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
              {item.weight} G
            </div>

            {/* Scarcity badge over image */}
            {isPaniniSoldOut && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                {lang === 'ro' ? 'Stoc epuizat pentru azi' : 'Sold out today'}
              </div>
            )}
            {isPaniniLowStock && (
              <div className="absolute top-3 left-3 bg-amber-500 text-stone-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse">
                🔥 {lang === 'ro' ? (inventory?.remaining === 1 ? 'Ultimul panini rămas!' : `Doar ${inventory?.remaining} panini rămase!`) : `Only ${inventory?.remaining} left!`}
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241813]">
                  {item.number}. {itemName}
                </h3>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#C44E36] shrink-0">
                  {unitPrice} RON
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
                {itemDesc}
              </p>
            </div>

            {/* Stock Warning Box - Only when <= 5 or sold out */}
            {isPaniniSoldOut && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                <span className="text-xl shrink-0">🚫</span>
                <div>
                  <p className="font-extrabold uppercase tracking-wide text-red-900">
                    {lang === 'ro' ? 'Stoc epuizat pentru azi' : lang === 'it' ? 'Esaurito per oggi' : 'Sold out for today'}
                  </p>
                  <p className="text-[11px] font-normal text-red-700 mt-0.5">
                    {lang === 'ro'
                      ? 'Pâinea Schiacciata artizanală este epuizată pentru astăzi. Te rugăm să alegi un alt preparat sau te așteptăm cu drag mâine dimineață!'
                      : lang === 'it'
                      ? 'La schiacciata artigianale è esaurita per oggi. Ti invitiamo a scegliere un altro piatto o a tornare domani!'
                      : 'Artisan Schiacciata panini are sold out for today. Please select another item or visit us tomorrow morning!'}
                  </p>
                </div>
              </div>
            )}

            {isPaniniLowStock && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg shrink-0">🔥</span>
                  <span>
                    {lang === 'ro'
                      ? (inventory?.remaining === 1 ? 'Ultimul panini disponibil azi!' : `Doar ${inventory?.remaining} panini rămase azi!`)
                      : lang === 'it'
                      ? (inventory?.remaining === 1 ? 'Ultimo panino disponibile oggi!' : `Solo ${inventory?.remaining} panini rimasti!`)
                      : `Only ${inventory?.remaining} panini left today!`}
                  </span>
                </div>
                <span className="text-[10px] bg-amber-200/90 text-amber-950 font-mono font-bold px-2 py-0.5 rounded-lg">
                  {inventory?.remaining} în stoc
                </span>
              </div>
            )}

            {/* Remove Ingredients (Personalizare) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32]">
                  {lang === 'ro'
                    ? 'Ingrediente (apasă pentru a exclude)'
                    : lang === 'it'
                    ? 'Ingredienti (tocca per escludere)'
                    : 'Ingredients (tap to remove)'}
                </h4>
                <span className="text-[11px] text-[#8C7E74]">
                  {lang === 'ro' ? 'Opțional' : lang === 'it' ? 'Opzionale' : 'Optional'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentIngredients.map((ing, idx) => {
                  const isRemoved = removedIngredients.includes(ing);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleRemoveIngredient(ing)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                        isRemoved
                          ? 'bg-red-50 text-red-700 border border-red-200 line-through opacity-75'
                          : 'bg-[#FAF7F2] text-[#241813] border border-[#E7DDCE] hover:border-[#C44E36]'
                      }`}
                    >
                      {isRemoved ? <X className="w-3 h-3 text-red-600" /> : <Check className="w-3 h-3 text-emerald-600" />}
                      <span>{ing}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extra Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3B32] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F0BE2C]" />
                  <span>
                    {lang === 'ro'
                      ? 'Adaugă extra top-ups'
                      : lang === 'it'
                      ? 'Aggiunte extra'
                      : 'Extra additions'}
                  </span>
                </h4>
              </div>
              <div className="space-y-2">
                {extraOptions.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.id);
                  const extraLabel = lang === 'ro' ? extra.nameRo : lang === 'it' ? extra.nameIt : extra.nameEn;
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all border cursor-pointer min-h-[44px] ${
                        isChecked
                          ? 'bg-[#C44E36]/10 border-[#C44E36] text-[#241813] font-bold'
                          : 'bg-[#FAF7F2] border-[#E7DDCE] text-[#4A3B32] hover:bg-white'
                      }`}
                    >
                      <span className="text-xs">
                        {extraLabel}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'border-[#C44E36] bg-[#C44E36] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A3B32] mb-1.5">
                {lang === 'ro'
                  ? 'Mențiuni pentru bucătar'
                  : lang === 'it'
                  ? 'Note per lo chef'
                  : 'Special instructions'}
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={
                  lang === 'ro'
                    ? 'Ex: Mai bine rumenit, tăiat în două...'
                    : lang === 'it'
                    ? 'Es: Più tostato, tagliato a metà...'
                    : 'e.g., Well toasted, cut in half...'
                }
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl focus:outline-none focus:border-[#C44E36] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Pinned Bottom Actions Bar with Safe Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#E7DDCE] shrink-0 safe-bottom shadow-lg flex items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E7DDCE] shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isPaniniSoldOut}
              className="w-8 h-8 rounded-xl bg-white border border-[#E7DDCE] flex items-center justify-center font-bold text-[#241813] hover:bg-stone-100 active:scale-90 transition-all cursor-pointer disabled:opacity-40"
              aria-label="Scade"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-[#241813] w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => {
                if (isPanini && inventory && quantity >= inventory.remaining) return;
                setQuantity(quantity + 1);
              }}
              disabled={isPaniniSoldOut || (isPanini && !!inventory && quantity >= inventory.remaining)}
              className="w-8 h-8 rounded-xl bg-white border border-[#E7DDCE] flex items-center justify-center font-bold text-[#241813] hover:bg-stone-100 active:scale-90 transition-all cursor-pointer disabled:opacity-40"
              aria-label="Crește"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button with total price */}
          <button
            id="modal-add-to-cart-btn"
            disabled={isPaniniSoldOut}
            onClick={handleAdd}
            className={`flex-1 py-3 px-4 font-bold rounded-2xl shadow-md transition-all flex items-center justify-between text-xs sm:text-sm min-h-[48px] ${
              isPaniniSoldOut
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-[#C44E36] hover:bg-[#A63B25] active:scale-98 text-white cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isPaniniSoldOut
                  ? (lang === 'ro' ? 'Stoc epuizat pentru azi' : 'Panini sold out today')
                  : (lang === 'ro'
                      ? 'Adaugă în coș'
                      : lang === 'it'
                      ? 'Aggiungi al carrello'
                      : 'Add to cart')}
              </span>
            </div>
            {!isPaniniSoldOut && (
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                {totalPrice} RON
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
