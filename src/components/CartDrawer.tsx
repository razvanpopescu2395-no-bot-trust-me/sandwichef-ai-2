import React, { useState, useRef } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, Phone, ShoppingBag, ShieldCheck, Clock, Store, AlertCircle, Flame } from 'lucide-react';
import { CartItem, Language, BreadInventoryState } from '../types';
import { calculateBreadsInCart, recordOnlineSale } from '../utils/inventoryClient';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items?: CartItem[];
  cartItems?: CartItem[];
  inventory?: BreadInventoryState;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onExploreMenu?: () => void;
  onOrderCompleted?: (breadsCount: number) => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items: itemsProp,
  cartItems: cartItemsProp,
  inventory,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onExploreMenu,
  onOrderCompleted,
  lang,
}) => {
  const items = itemsProp || cartItemsProp || [];
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [pickupTiming, setPickupTiming] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; stock?: string }>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Preparation time estimate based on number of items
  const getPrepTimeEstimate = (count: number) => {
    if (count <= 1) return { min: 10, max: 15 };
    if (count === 2) return { min: 15, max: 20 };
    if (count <= 4) return { min: 20, max: 25 };
    if (count <= 6) return { min: 25, max: 35 };
    return { min: 35, max: 45 };
  };

  const prepTime = getPrepTimeEstimate(totalItemCount);

  const getSuggestedTime = (minutesAhead: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesAhead);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const packagingFee = items.length > 0 ? 3 : 0;
  const grandTotal = subtotal + packagingFee;

  const generateWhatsAppMessage = () => {
    let title = lang === 'ro'
      ? `*COMANDĂ NOUĂ - SANDWICHEF CRAIOVA*`
      : lang === 'it'
      ? `*NUOVO ORDINE - SANDWICHEF CRAIOVA*`
      : `*NEW ORDER - SANDWICHEF CRAIOVA*`;

    let msg = `${title}\n`;
    msg += `----------------------------------------\n`;
    msg += `${lang === 'ro' ? '*Client:*' : lang === 'it' ? '*Cliente:*' : '*Customer:*'} ${customerName || (lang === 'ro' ? 'Nespecificat' : lang === 'it' ? 'Non specificato' : 'Unspecified')}\n`;
    if (customerPhone) msg += `${lang === 'ro' ? '*Telefon:*' : lang === 'it' ? '*Telefono:*' : '*Phone:*'} ${customerPhone}\n`;
    msg += `${lang === 'ro' ? '*Preluare:*' : lang === 'it' ? '*Ritiro:*' : '*Pickup:*'} ${
      lang === 'ro' ? 'Ridicare de la locație' : lang === 'it' ? 'Ritiro in sede' : 'Pickup at location'
    }\n`;
    msg += `${lang === 'ro' ? '*Timp preparare estimat:*' : lang === 'it' ? '*Tempo preparazione stimato:*' : '*Estimated prep time:*'} ~${prepTime.min}-${prepTime.max} min\n`;
    msg += `${lang === 'ro' ? '*Moment ridicare:*' : lang === 'it' ? '*Orario ritiro:*' : '*Pickup time:*'} ${
      pickupTiming === 'asap'
        ? (lang === 'ro' ? `Cât mai curând (gata în aprox. ${prepTime.min}-${prepTime.max} min)` : lang === 'it' ? `Prima possibile (~${prepTime.min}-${prepTime.max} min)` : `As soon as possible (~${prepTime.min}-${prepTime.max} min)`)
        : (lang === 'ro' ? `La ora dorită: ${scheduledTime || 'Specificați ora'}` : lang === 'it' ? `A un orario prestabilito: ${scheduledTime || 'Specificare orario'}` : `Specific time: ${scheduledTime || 'Please specify'}`)
    }\n`;
    if (orderNotes) msg += `${lang === 'ro' ? '*Mențiuni:*' : lang === 'it' ? '*Note:*' : '*Notes:*'} ${orderNotes}\n`;
    msg += `----------------------------------------\n`;
    msg += `${lang === 'ro' ? '*PRODUSE:*' : lang === 'it' ? '*PRODOTTI:*' : '*ITEMS:*'}\n`;

    items.forEach((item, index) => {
      const itemName = lang === 'ro' ? item.menuItem.name : lang === 'it' ? (item.menuItem.nameIt || item.menuItem.name) : (item.menuItem.nameEn || item.menuItem.name);
      msg += `\n${index + 1}. *${itemName}* x${item.quantity} = ${item.menuItem.price * item.quantity} RON\n`;
      if (item.customSandwichDetails) {
        msg += `   - ${lang === 'ro' ? 'Pâine' : lang === 'it' ? 'Pane' : 'Bread'}: ${item.customSandwichDetails.bread}\n`;
        msg += `   - ${lang === 'ro' ? 'Ingrediente' : lang === 'it' ? 'Ingredienti' : 'Ingredients'}: ${[
          ...item.customSandwichDetails.proteins,
          ...item.customSandwichDetails.cheeses,
          ...item.customSandwichDetails.veggies,
          ...item.customSandwichDetails.sauces,
        ].join(', ')}\n`;
        msg += `   - ${lang === 'ro' ? 'Gramaj' : lang === 'it' ? 'Peso' : 'Weight'}: ${item.customSandwichDetails.totalWeight}g\n`;
      }
      if (item.removedIngredients && item.removedIngredients.length > 0) {
        msg += `   - ${lang === 'ro' ? 'FĂRĂ' : lang === 'it' ? 'SENZA' : 'WITHOUT'}: ${item.removedIngredients.join(', ')}\n`;
      }
      if (item.specialInstructions) {
        msg += `   - ${lang === 'ro' ? 'Notă' : lang === 'it' ? 'Nota' : 'Note'}: "${item.specialInstructions}"\n`;
      }
    });

    msg += `\n----------------------------------------\n`;
    msg += `${lang === 'ro' ? 'Ambalaje & pungi' : lang === 'it' ? 'Imballaggio & buste' : 'Packaging'}: ${packagingFee} RON\n`;
    msg += `${lang === 'ro' ? '*TOTAL DE PLATĂ:*' : lang === 'it' ? '*TOTALE DA PAGARE:*' : '*GRAND TOTAL:*'} *${grandTotal} RON*\n`;
    msg += `----------------------------------------\n`;
    msg += `Sandwichef Craiova | sandwichef.ro`;

    return encodeURIComponent(msg);
  };

  const handleSendWhatsAppOrder = () => {
    const trimmedName = customerName.trim();
    const trimmedPhone = customerPhone.trim();
    const cleanDigits = trimmedPhone.replace(/\D/g, '');

    const newErrors: { name?: string; phone?: string } = {};

    if (!trimmedName) {
      newErrors.name =
        lang === 'ro'
          ? 'Numele este obligatoriu'
          : lang === 'it'
          ? 'Il nome è obbligatorio'
          : 'Name is required';
    }

    if (!trimmedPhone) {
      newErrors.phone =
        lang === 'ro'
          ? 'Numărul de telefon este obligatoriu'
          : lang === 'it'
          ? 'Il numero di telefono è obbligatorio'
          : 'Phone number is required';
    } else if (cleanDigits.length < 6) {
      newErrors.phone =
        lang === 'ro'
          ? 'Introdu un număr de telefon valid'
          : lang === 'it'
          ? 'Inserisci un numero di telefono valido'
          : 'Please enter a valid phone number';
    }

    const paniniNeeded = calculateBreadsInCart(items);
    if (inventory && paniniNeeded > 0 && inventory.remaining < paniniNeeded) {
      setErrors({
        stock:
          lang === 'ro'
            ? (inventory.remaining <= 0
                ? 'Stoc epuizat pentru azi! Noul lot de pâine proaspătă Schiacciata va fi copt mâine dimineață.'
                : `Stoc insuficient de panini! Comanda ta include ${paniniNeeded} panini, dar mai sunt doar ${inventory.remaining} ${inventory.remaining === 1 ? 'disponibil' : 'disponibile'} astăzi.`)
            : lang === 'it'
            ? (inventory.remaining <= 0
                ? 'Stoc esaurito per oggi! Il nuovo lotto di schiacciata fresca sarà pronto domani mattina.'
                : `Scorte insufficienti! Il tuo ordine include ${paniniNeeded} panini, ma ne rimangono solo ${inventory.remaining} oggi.`)
            : (inventory.remaining <= 0
                ? 'Panini sold out for today! A fresh batch will be baked tomorrow morning.'
                : `Insufficient panini stock! Your order has ${paniniNeeded} panini, but only ${inventory.remaining} left today.`),
      });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.name) {
        nameInputRef.current?.focus();
        nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.phone) {
        phoneInputRef.current?.focus();
        phoneInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setErrors({});

    // Decrement panini stock on the server incrementally (atomic update)
    if (paniniNeeded > 0) {
      recordOnlineSale(paniniNeeded, trimmedName, `Comandă online site (${paniniNeeded} panini)`);
      onOrderCompleted?.(paniniNeeded);
    }

    const encoded = generateWhatsAppMessage();
    const waUrl = `https://wa.me/40769409493?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200 overflow-hidden overscroll-contain"
      onClick={onClose}
    >
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#FAF7F2] h-[100dvh] max-h-[100dvh] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-[#E7DDCE] overflow-hidden"
      >
        {/* Header - Fixed & Pinned */}
        <div className="p-3.5 sm:p-5 bg-white border-b border-[#E7DDCE] flex items-center justify-between shrink-0 safe-top">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C44E36]/10 text-[#C44E36] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-xl font-bold text-[#241813] leading-tight">
                {lang === 'ro' ? 'Coșul Tău' : lang === 'it' ? 'Il Tuo Carrello' : 'Your Cart'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#8C7E74]">
                {items.length}{' '}
                {items.length === 1
                  ? lang === 'ro'
                    ? 'preparat selectat'
                    : lang === 'it'
                    ? 'prodotto selezionato'
                    : 'item selected'
                  : lang === 'ro'
                  ? 'preparate selectate'
                  : lang === 'it'
                  ? 'prodotti selezionati'
                  : 'items selected'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-[11px] font-bold text-[#8C7E74] hover:text-red-600 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                title={lang === 'ro' ? 'Golește coșul' : lang === 'it' ? 'Svuota carrello' : 'Clear cart'}
              >
                {lang === 'ro' ? 'Golește' : lang === 'it' ? 'Svuota' : 'Clear'}
              </button>
            )}
            <button
              id="close-cart-btn"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-stone-500 hover:text-[#241813] hover:bg-[#F0EAE1] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label={lang === 'ro' ? 'Închide coșul' : lang === 'it' ? 'Chiudi carrello' : 'Close cart'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable Items with min-h-0 for Mobile Viewport Flex Constrain */}
        {items.length === 0 ? (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-[#F0EAE1] flex items-center justify-center text-3xl mb-3">
              🥪
            </div>
            <h3 className="font-serif text-lg font-bold text-[#241813] mb-1">
              {lang === 'ro' ? 'Coșul este gol' : lang === 'it' ? 'Il carrello è vuoto' : 'Your cart is empty'}
            </h3>
            <p className="text-xs text-[#6B5E55] max-w-xs mb-6">
              {lang === 'ro'
                ? 'Alege un sandwich toscan din meniu sau creează o rețetă unică în Chef Lab.'
                : lang === 'it'
                ? 'Scegli un panino toscano dal nostro menu o crea la tua ricetta nel Sandwich Lab.'
                : 'Choose a delicious Tuscan panini or build your own in Chef Lab.'}
            </p>
            <button
              id="empty-cart-explore-menu-btn"
              onClick={() => {
                onClose();
                if (onExploreMenu) {
                  onExploreMenu();
                }
              }}
              className="px-6 py-3 bg-[#C44E36] hover:bg-[#A63B25] text-white font-bold rounded-xl text-xs shadow-xs min-h-[44px] cursor-pointer active:scale-95 transition-all"
            >
              {lang === 'ro' ? 'Vezi Meniul' : lang === 'it' ? 'Esplora il Menu' : 'Explore Menu'}
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 touch-scroll overscroll-contain">
            {/* Live Panini Bread Stock Indicator in Cart */}
            {inventory && calculateBreadsInCart(items) > 0 && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2.5 transition-colors ${
                  inventory.remaining === 0
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : inventory.remaining <= 5
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🥖</span>
                  <div>
                    <p className="font-bold leading-tight flex items-center gap-1.5">
                      <span>{lang === 'ro' ? 'Pâine Panini (Schiacciata toscană)' : lang === 'it' ? 'Pane Panini (Schiacciata)' : 'Panini Bread (Tuscan Schiacciata)'}</span>
                      {inventory.remaining === 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-200/80 text-red-900 font-bold">
                          {lang === 'ro' ? 'Epuizat' : lang === 'it' ? 'Esaurito' : 'Sold out'}
                        </span>
                      ) : inventory.remaining <= 5 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-200/90 text-amber-950 font-mono font-bold">
                          {lang === 'ro' ? `Doar ${inventory.remaining} rămase` : `${inventory.remaining} left`}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {inventory.remaining === 0
                        ? (lang === 'ro' ? 'Stoc epuizat pentru azi! Noul lot de pâine proaspătă va fi copt mâine dimineață.' : 'Panini sold out for today! A fresh batch will be baked tomorrow.')
                        : inventory.remaining < calculateBreadsInCart(items)
                        ? (lang === 'ro' ? `Ai în coș ${calculateBreadsInCart(items)} panini, dar mai sunt doar ${inventory.remaining} disponibile azi!` : `Only ${inventory.remaining} panini left today!`)
                        : inventory.remaining <= 5
                        ? (lang === 'ro' ? (inventory.remaining === 1 ? '🔥 Ultimul panini disponibil azi! Finalizează comanda rapid.' : `🔥 Mai sunt doar ${inventory.remaining} panini rămase azi! Finalizează comanda rapid.`) : `Only ${inventory.remaining} panini left today!`)
                        : (lang === 'ro' ? 'Pâine Schiacciata toscană pregătită și rumenită proaspăt.' : 'Freshly baked and grilled Tuscan Schiacciata bread.')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                      inventory.remaining === 0
                        ? 'bg-red-600 text-white'
                        : inventory.remaining <= 5
                        ? 'bg-amber-500 text-stone-900'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {inventory.remaining === 0
                      ? (lang === 'ro' ? 'Epuizat azi' : lang === 'it' ? 'Esaurito' : 'Sold out')
                      : inventory.remaining <= 5
                      ? (lang === 'ro' ? `Doar ${inventory.remaining}` : `${inventory.remaining} left`)
                      : (lang === 'ro' ? 'În stoc' : lang === 'it' ? 'Disponibile' : 'In stock')}
                  </span>
                </div>
              </div>
            )}

            {/* List of Cart Items */}
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#E7DDCE] shadow-2xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#241813] truncate">
                        {lang === 'ro' ? item.menuItem.name : lang === 'it' ? (item.menuItem.nameIt || item.menuItem.name) : (item.menuItem.nameEn || item.menuItem.name)}
                      </h4>
                      <p className="text-[11px] text-[#8C7E74]">
                        {item.menuItem.weight}g • {item.menuItem.price} RON / {lang === 'ro' ? 'buc' : lang === 'it' ? 'pz' : 'pc'}
                      </p>
                      {item.removedIngredients && item.removedIngredients.length > 0 && (
                        <p className="text-[10px] text-red-600 font-medium mt-0.5">
                          {lang === 'ro' ? 'Fără: ' : lang === 'it' ? 'Senza: ' : 'Without: '}
                          {item.removedIngredients.join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-[10px] text-[#8C7E74] italic mt-0.5">
                          „{item.specialInstructions}”
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-xs sm:text-sm text-[#C44E36]">
                        {item.menuItem.price * item.quantity} RON
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls with touch-friendly 36px targets */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#F0EAE1]">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#8C7E74] hover:text-red-600 p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                      title={lang === 'ro' ? 'Șterge produsul' : lang === 'it' ? 'Rimuovi prodotto' : 'Remove item'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{lang === 'ro' ? 'Șterge' : lang === 'it' ? 'Elimina' : 'Delete'}</span>
                    </button>

                    <div className="flex items-center gap-2 bg-[#FAF7F2] p-1 rounded-xl border border-[#E7DDCE]">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#E7DDCE] flex items-center justify-center text-xs font-bold text-[#241813] hover:bg-[#F0EAE1] active:scale-90 transition-all cursor-pointer"
                        aria-label="Scade cantitatea"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#241813] w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-[#E7DDCE] flex items-center justify-center text-xs font-bold text-[#241813] hover:bg-[#F0EAE1] active:scale-90 transition-all cursor-pointer"
                        aria-label="Crește cantitatea"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer & Order Details Form */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E7DDCE] space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C7E74]">
                {lang === 'ro' ? 'Detalii comandă & ridicare' : lang === 'it' ? 'Dettagli ordine e ritiro' : 'Order & pickup details'}
              </h4>

              {/* Order Mode Banner - Exclusively Pickup at location */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DDCE]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#C44E36]/10 text-[#C44E36] flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#241813] block">
                      {lang === 'ro' ? 'Ridicare de la locație' : lang === 'it' ? 'Ritiro in sede' : 'Pickup at location'}
                    </span>
                    <span className="text-[11px] text-[#8C7E74] block">
                      {lang === 'ro' ? 'Pregătit proaspăt, cald și rumenit' : lang === 'it' ? 'Preparato fresco e croccante' : 'Freshly prepared, hot and crispy'}
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{lang === 'ro' ? 'Pe loc' : lang === 'it' ? 'Espresso' : 'Fresh'}</span>
                </div>
              </div>

              {/* Estimated Preparation Time Banner */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[#241813]">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span className="text-xs font-bold text-[#241813]">
                    {lang === 'ro'
                      ? `Timp estimat de preparare: ~${prepTime.min}-${prepTime.max} minute`
                      : lang === 'it'
                      ? `Tempo stimato di preparazione: ~${prepTime.min}-${prepTime.max} minuti`
                      : `Estimated prep time: ~${prepTime.min}-${prepTime.max} minutes`}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B5E55] leading-relaxed">
                  {lang === 'ro'
                    ? `Calculat automat pentru ${totalItemCount} ${totalItemCount === 1 ? 'preparat' : 'preparate'} (coacere/rumenire, gătire și asamblare artizanală).`
                    : lang === 'it'
                    ? `Calcolato per ${totalItemCount} ${totalItemCount === 1 ? 'prodotto' : 'prodotti'} (tostatura, farcitura e assemblaggio espresso).`
                    : `Calculated for ${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'} (fresh toasting, grilling, and artisan assembly).`}
                </p>
              </div>

              {/* Pickup timing choice: Cât mai curând vs La o oră anume */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#4A3B32]">
                  {lang === 'ro' ? 'Când dorești ridicarea?' : lang === 'it' ? 'Quando vuoi ritirare?' : 'When would you like to pick up?'}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPickupTiming('asap')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] ${
                      pickupTiming === 'asap'
                        ? 'bg-[#241813] text-white border-[#241813] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E7DDCE] hover:border-[#C44E36]'
                    }`}
                  >
                    <span>⚡</span>
                    <span>{lang === 'ro' ? 'Cât mai curând' : lang === 'it' ? 'Prima possibile' : 'As soon as possible'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPickupTiming('scheduled');
                      if (!scheduledTime) {
                        setScheduledTime(getSuggestedTime(prepTime.max + 15));
                      }
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] ${
                      pickupTiming === 'scheduled'
                        ? 'bg-[#241813] text-white border-[#241813] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#4A3B32] border-[#E7DDCE] hover:border-[#C44E36]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{lang === 'ro' ? 'La o oră anume' : lang === 'it' ? 'A un orario' : 'Specific time'}</span>
                  </button>
                </div>

                {/* If ASAP selected */}
                {pickupTiming === 'asap' && (
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] text-[11px] text-[#6B5E55] flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      {lang === 'ro'
                        ? `Comanda intră direct în pregătire. Va fi gata în aproximativ ~${prepTime.min}-${prepTime.max} min.`
                        : lang === 'it'
                        ? `L'ordine entra subito in preparazione (~${prepTime.min}-${prepTime.max} min).`
                        : `Preparation starts immediately (~${prepTime.min}-${prepTime.max} min).`}
                    </span>
                  </div>
                )}

                {/* If scheduled time selected */}
                {pickupTiming === 'scheduled' && (
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DDCE] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#4A3B32]">
                        {lang === 'ro' ? 'Ora dorită pentru ridicare:' : lang === 'it' ? 'Orario desiderato:' : 'Desired pickup time:'}
                      </span>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#E7DDCE] rounded-lg text-xs font-bold text-[#241813] focus:outline-none focus:border-[#C44E36]"
                      />
                    </div>

                    {/* Quick suggestion pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#8C7E74]">
                        {lang === 'ro' ? 'Sugestii rapide:' : lang === 'it' ? 'Suggerimenti:' : 'Quick options:'}
                      </span>
                      {[20, 30, 45, 60].map((mins) => {
                        const timeStr = getSuggestedTime(mins);
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setScheduledTime(timeStr)}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all border cursor-pointer ${
                              scheduledTime === timeStr
                                ? 'bg-[#241813] text-white border-[#241813]'
                                : 'bg-white text-[#6B5E55] border-[#E7DDCE] hover:border-[#C44E36]'
                            }`}
                          >
                            +{mins} min ({timeStr})
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-[#8C7E74] leading-tight">
                      {lang === 'ro'
                        ? `Prepararea va începe cu ~${prepTime.min} min înainte de ${scheduledTime || 'ora stabilită'}, pentru ca sandwichurile să fie proaspete și calde când sosești.`
                        : lang === 'it'
                        ? `La preparazione inizierà ~${prepTime.min} min prima di ${scheduledTime || "l'orario scelto"} per servirlo caldo.`
                        : `Preparation starts ~${prepTime.min} min before ${scheduledTime || 'your time'} so it is fresh and warm upon arrival.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Name input - Required */}
              <div>
                <label htmlFor="cart-customer-name" className="block text-[11px] font-bold text-[#4A3B32] mb-1">
                  <span>{lang === 'ro' ? 'Nume & prenume' : lang === 'it' ? 'Nome & cognome' : 'Full name'}</span>
                  <span className="text-[#C44E36] font-bold ml-1">*</span>
                  <span className="text-[10px] font-normal text-[#8C7E74] ml-1">
                    ({lang === 'ro' ? 'obligatoriu' : lang === 'it' ? 'obbligatorio' : 'required'})
                  </span>
                </label>
                <input
                  ref={nameInputRef}
                  id="cart-customer-name"
                  type="text"
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder={lang === 'ro' ? 'Ex: Razvan Popescu' : lang === 'it' ? 'Es: Razvan Popescu' : 'e.g. Razvan Popescu'}
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl font-medium focus:outline-none min-h-[42px] transition-colors ${
                    errors.name
                      ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border-[#E7DDCE] focus:border-[#C44E36]'
                  }`}
                  required
                  aria-required="true"
                />
                {errors.name && (
                  <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Phone input - Required, opens numeric keypad on mobile devices */}
              <div>
                <label htmlFor="cart-customer-phone" className="block text-[11px] font-bold text-[#4A3B32] mb-1">
                  <span>{lang === 'ro' ? 'Număr de telefon' : lang === 'it' ? 'Numero di telefono' : 'Phone number'}</span>
                  <span className="text-[#C44E36] font-bold ml-1">*</span>
                  <span className="text-[10px] font-normal text-[#8C7E74] ml-1">
                    ({lang === 'ro' ? 'obligatoriu' : lang === 'it' ? 'obbligatorio' : 'required'})
                  </span>
                </label>
                <input
                  ref={phoneInputRef}
                  id="cart-customer-phone"
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                    }
                  }}
                  placeholder={lang === 'ro' ? 'Ex: 0721 000 000' : lang === 'it' ? 'Es: 340 1234567' : 'e.g. 0721 000 000'}
                  className={`w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF7F2] border rounded-xl font-medium focus:outline-none min-h-[42px] transition-colors ${
                    errors.phone
                      ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                      : 'border-[#E7DDCE] focus:border-[#C44E36]'
                  }`}
                  required
                  aria-required="true"
                />
                {errors.phone && (
                  <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[#4A3B32] mb-1">
                  {lang === 'ro' ? 'Instrucțiuni speciale / mențiuni' : lang === 'it' ? 'Note speciali' : 'Special notes'}
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={lang === 'ro' ? 'Ex: Fără ceapă roșie, puțin mai rumenit' : lang === 'it' ? 'Es: Senza cipolla, più croccante' : 'e.g. No red onion, extra crispy'}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl font-medium focus:outline-none focus:border-[#C44E36] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer - Pinned & Always Fully Visible on Mobile View */}
        {items.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-white border-t border-[#E7DDCE] shrink-0 safe-bottom shadow-lg space-y-2.5 sm:space-y-3 z-10">
            {/* Price breakdown */}
            <div className="space-y-1 text-xs text-[#6B5E55]">
              <div className="flex justify-between">
                <span>{lang === 'ro' ? 'Subtotal produse:' : lang === 'it' ? 'Subtotale prodotti:' : 'Items subtotal:'}</span>
                <span className="font-bold text-[#241813]">{subtotal} RON</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ro' ? 'Ambalaje eco & pungi:' : lang === 'it' ? 'Imballaggio eco & busta:' : 'Packaging fee:'}</span>
                <span className="font-bold text-[#241813]">{packagingFee} RON</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#F0EAE1] text-sm font-bold text-[#241813]">
                <span>{lang === 'ro' ? 'Total de plată:' : lang === 'it' ? 'Totale da pagare:' : 'Grand total:'}</span>
                <span className="text-[#C44E36] text-base">{grandTotal} RON</span>
              </div>
            </div>

            {/* Validation warning if required fields are missing */}
            {(errors.name || errors.phone) && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-semibold leading-tight">
                  {lang === 'ro'
                    ? 'Completează numele și numărul de telefon mai sus pentru a trimite comanda.'
                    : lang === 'it'
                    ? 'Compila il nome e il numero di telefono sopra per inviare l’ordine.'
                    : 'Please fill in your name and phone number above to place your order.'}
                </span>
              </div>
            )}

            {/* Stock error warning */}
            {errors.stock && (
              <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2 animate-in shake duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-bold leading-tight">{errors.stock}</span>
              </div>
            )}

            {/* Quick Order Actions - Thumb Friendly Touch Targets */}
            <div className="flex flex-col gap-2 pt-0.5">
              <button
                id="cart-whatsapp-order-btn"
                onClick={handleSendWhatsAppOrder}
                className="w-full py-3 sm:py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer min-h-[46px]"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {lang === 'ro'
                    ? `Comandă pe WhatsApp (${grandTotal} RON)`
                    : lang === 'it'
                    ? `Ordina su WhatsApp (${grandTotal} RON)`
                    : `Order via WhatsApp (${grandTotal} RON)`}
                </span>
              </button>

              <a
                id="cart-direct-call-btn"
                href="tel:0735468253"
                className="w-full py-2.5 sm:py-3 px-4 bg-[#241813] hover:bg-[#3D2C24] active:scale-98 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer min-h-[42px]"
              >
                <Phone className="w-3.5 h-3.5 text-[#F0BE2C] shrink-0" />
                <span className="truncate">
                  {lang === 'ro' ? 'Sau Sună Direct: 0735 468 253' : lang === 'it' ? 'Oppure Chiama: 0735 468 253' : 'Or Call Direct: 0735 468 253'}
                </span>
              </a>
            </div>

            <div className="flex items-center justify-center gap-1 text-[10px] text-[#8C7E74]">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">
                {lang === 'ro'
                  ? 'Preparare proaspătă pe loc la Sandwichef Craiova'
                  : lang === 'it'
                  ? 'Preparazione fresca espressa da Sandwichef Craiova'
                  : 'Freshly prepared to order at Sandwichef Craiova'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
