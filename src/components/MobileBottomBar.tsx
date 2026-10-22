import React, { useState } from 'react';
import { Home, Utensils, MapPin, ShoppingBag, Phone, MessageCircle, X, ExternalLink, Bike } from 'lucide-react';
import { Language } from '../types';

interface MobileBottomBarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onNavigateTo: (id: string) => void;
  activeSection?: string;
  lang: Language;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onNavigateTo,
  activeSection = 'home',
  lang,
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const whatsappMessage = encodeURIComponent(
    lang === 'ro'
      ? 'Salut Sandwichef Craiova! Aș dori să plasez o comandă.'
      : lang === 'it'
      ? 'Ciao Sandwichef Craiova! Vorrei effettuare un ordine.'
      : 'Hello Sandwichef Craiova! I would like to place an order.'
  );

  return (
    <>
      <div
        id="mobile-bottom-navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-lg border-t border-[#241813]/10 px-2 pt-1.5 pb-2 safe-bottom shadow-[0_-4px_20px_rgba(36,24,19,0.08)]"
        role="navigation"
        aria-label="Navigare rapidă mobilă"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Acasă (Home) */}
          <button
            id="mobile-tab-home"
            onClick={() => onNavigateTo('home')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all min-h-[48px] ${
              activeSection === 'home'
                ? 'text-[#C44E36] font-bold'
                : 'text-[#6B5E55] hover:text-[#C44E36]'
            }`}
          >
            <Home className={`w-5 h-5 mb-0.5 ${activeSection === 'home' ? 'text-[#C44E36]' : 'text-[#8C7E74]'}`} />
            <span className="text-[10px] tracking-tight">
              {lang === 'ro' ? 'Acasă' : lang === 'it' ? 'Inizio' : 'Home'}
            </span>
          </button>

          {/* 2. Meniu (Menu Page) */}
          <button
            id="mobile-tab-menu"
            onClick={() => onNavigateTo('menu')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all min-h-[48px] ${
              activeSection === 'menu'
                ? 'text-[#C44E36] font-bold'
                : 'text-[#6B5E55] hover:text-[#C44E36]'
            }`}
          >
            <Utensils className={`w-5 h-5 mb-0.5 ${activeSection === 'menu' ? 'text-[#C44E36]' : 'text-[#8C7E74]'}`} />
            <span className="text-[10px] tracking-tight">
              {lang === 'ro' ? 'Meniu' : lang === 'it' ? 'Menu' : 'Menu'}
            </span>
          </button>

          {/* 3. Center Call / Order Hub Button */}
          <button
            id="mobile-tab-contact"
            onClick={() => setIsContactModalOpen(true)}
            className="flex-1 flex flex-col items-center justify-center -mt-5 group active:scale-95 transition-transform cursor-pointer"
            aria-label="Contactează Sandwichef prin apel, WhatsApp, Bolt Food sau Wolt"
            title="Apelează sau comandă prin WhatsApp, Bolt Food sau Wolt"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#C44E36] to-[#E0654B] text-white flex items-center justify-center shadow-lg border-2 border-[#FAF7F2] group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-[#C44E36] mt-0.5 tracking-tight">
              {lang === 'ro' ? 'Comandă / Sună' : lang === 'it' ? 'Ordina / Chiama' : 'Call / Order'}
            </span>
          </button>

          {/* 4. Locație */}
          <button
            id="mobile-tab-location"
            onClick={() => onNavigateTo('location')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl active:scale-95 transition-all min-h-[48px] ${
              activeSection === 'location'
                ? 'text-[#C44E36] font-bold'
                : 'text-[#6B5E55] hover:text-[#C44E36]'
            }`}
          >
            <MapPin className={`w-5 h-5 mb-0.5 ${activeSection === 'location' ? 'text-[#C44E36]' : 'text-[#8C7E74]'}`} />
            <span className="text-[10px] tracking-tight">
              {lang === 'ro' ? 'Locație' : lang === 'it' ? 'Posizione' : 'Location'}
            </span>
          </button>

          {/* 5. Coș Cumpărături with dot count */}
          <button
            id="mobile-tab-cart"
            onClick={onOpenCart}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl active:scale-95 transition-all min-h-[48px] relative ${
              cartCount > 0 ? 'text-[#C44E36] font-bold' : 'text-[#4A3B32]'
            }`}
          >
            <div className="relative inline-flex">
              <ShoppingBag className={`w-5 h-5 mb-0.5 ${cartCount > 0 ? 'text-[#C44E36]' : 'text-[#6B5E55]'}`} />
              <span
                id="mobile-cart-badge-dot"
                className={`absolute -top-1 -right-2 text-white text-[9px] sm:text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-xs transition-colors ${
                  cartCount > 0 ? 'bg-[#C44E36]' : 'bg-[#8C7E74]'
                }`}
              >
                {cartCount}
              </span>
            </div>
            <span className="text-[10px] font-bold tracking-tight whitespace-nowrap text-center">
              {cartCount > 0
                ? `${cartTotal} ${lang === 'ro' ? 'lei' : lang === 'it' ? 'lei' : 'RON'}`
                : (lang === 'ro' ? 'Coș' : lang === 'it' ? 'Carrello' : 'Cart')}
            </span>
          </button>
        </div>
      </div>

      {/* CALL, WHATSAPP, BOLT FOOD & WOLT MODAL / ACTION SHEET */}
      {isContactModalOpen && (
        <div
          id="contact-action-sheet-backdrop"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            id="contact-action-sheet"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl p-5 border-t sm:border border-[#E4D9CA] shadow-2xl animate-in slide-in-from-bottom duration-250 safe-bottom max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#241813]/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#241813]">
                  {lang === 'ro'
                    ? 'Comandă & Contact Sandwichef'
                    : lang === 'it'
                    ? 'Ordina & Contatta Sandwichef'
                    : 'Order & Contact Sandwichef'}
                </h3>
                <p className="text-xs text-[#6B5E55]">
                  Strada Amaradia, Nr. 29, Craiova
                </p>
              </div>
              <button
                id="contact-modal-close"
                onClick={() => setIsContactModalOpen(false)}
                className="p-2 rounded-full text-stone-500 hover:text-[#241813] hover:bg-[#EAE4DC] transition-colors cursor-pointer"
                aria-label="Închide fereastra de contact"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Contact Options */}
            <div className="mb-2">
              <span className="text-[11px] font-bold text-[#8C7E74] uppercase tracking-wider block mb-2 px-1">
                {lang === 'ro' ? 'Contact Direct' : lang === 'it' ? 'Contatto Diretto' : 'Direct Contact'}
              </span>
              <div className="flex flex-col gap-2.5">
                {/* Option 1: Direct Call */}
                <a
                  id="contact-option-call"
                  href="tel:0735468253"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#241813] text-white hover:bg-[#38261F] transition-all shadow-xs active:scale-98 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#C44E36] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {lang === 'ro' ? 'Apel telefonic' : lang === 'it' ? 'Chiamata telefonica' : 'Phone call'}
                      </span>
                      <span className="text-[11px] font-bold text-[#F0BE2C] bg-white/10 px-2 py-0.5 rounded-md">
                        0735 468 253
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {lang === 'ro'
                        ? 'Comandă telefonică & rezervări rapide'
                        : lang === 'it'
                        ? 'Ordina per telefono & prenotazioni'
                        : 'Call directly for instant orders & reservations'}
                    </p>
                  </div>
                </a>

                {/* Option 2: WhatsApp Message */}
                <a
                  id="contact-option-whatsapp"
                  href={`https://wa.me/40769409493?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow-xs active:scale-98 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        {lang === 'ro' ? 'Mesaj pe WhatsApp' : lang === 'it' ? 'Messaggio su WhatsApp' : 'WhatsApp message'}
                      </span>
                      <span className="text-[11px] font-bold text-white bg-black/15 px-2 py-0.5 rounded-md">
                        0769 409 493
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 mt-0.5">
                      {lang === 'ro'
                        ? 'Trimite comanda sau întrebări pe WhatsApp'
                        : lang === 'it'
                        ? 'Invia il tuo ordine o domande su WhatsApp'
                        : 'Send your order or questions on WhatsApp'}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Delivery Apps Section (Bolt Food & Wolt) */}
            <div className="mt-4 mb-4">
              <span className="text-[11px] font-bold text-[#8C7E74] uppercase tracking-wider block mb-2 px-1">
                {lang === 'ro' ? 'Aplicații Livrare la Domiciliu' : lang === 'it' ? 'App di Consegna a Domicilio' : 'Delivery Apps'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 3: Bolt Food */}
                <a
                  id="contact-option-bolt"
                  href="https://food.bolt.eu/ro-ro/1052-craiova/p/91364-sandwichef/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#241813] border border-[#34D186]/40 text-white hover:bg-[#34D186] hover:text-[#181818] transition-all shadow-xs active:scale-98 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#34D186] text-[#181818] flex items-center justify-center font-black text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <span className="tracking-tighter">⚡</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold truncate group-hover:text-black">
                        Bolt Food
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#34D186] group-hover:text-black shrink-0" />
                    </div>
                    <p className="text-[10px] text-stone-300 group-hover:text-black/80 truncate mt-0.5">
                      {lang === 'ro' ? 'Livrare rapidă Craiova' : lang === 'it' ? 'Consegna rapida Craiova' : 'Fast delivery Craiova'}
                    </p>
                  </div>
                </a>

                {/* Option 4: Wolt */}
                <a
                  id="contact-option-wolt"
                  href="https://wolt.com/ro/rou/craiova/restaurant/sandwichef-68dfdfbd3a8557c375c011d6"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsContactModalOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#241813] border border-[#009DE0]/40 text-white hover:bg-[#009DE0] hover:text-white transition-all shadow-xs active:scale-98 group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#009DE0] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <span className="tracking-tighter font-serif">W</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold truncate">
                        Wolt Craiova
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#009DE0] group-hover:text-white shrink-0" />
                    </div>
                    <p className="text-[10px] text-stone-300 group-hover:text-white/90 truncate mt-0.5">
                      {lang === 'ro' ? 'Comandă online pe Wolt' : lang === 'it' ? 'Ordina online su Wolt' : 'Order online on Wolt'}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-[#6B5E55] hover:bg-[#EAE4DC] transition-colors cursor-pointer"
            >
              {lang === 'ro' ? 'Închide' : lang === 'it' ? 'Chiudi' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
