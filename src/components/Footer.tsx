import React from 'react';
import { MapPin, Phone, Clock, Mail, Instagram, ExternalLink, Heart } from 'lucide-react';
import { Language } from '../types';
import { handleSafeImageError, FALLBACK_IMAGES } from '../utils/imageFallback';

interface FooterProps {
  onNavigateTo: (id: string) => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTo, lang }) => {
  return (
    <footer className="bg-[#1E140F] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Sandwichef Craiova"
                className="w-12 h-12 rounded-full border-2 border-[#F0BE2C] bg-white object-cover"
                onError={(e) => {
                  handleSafeImageError(e, FALLBACK_IMAGES.logoSvg);
                }}
              />
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  Sandwichef
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#F0BE2C] font-semibold">
                  Craiova • Est. 2024
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {lang === 'ro'
                ? 'Afacere locală din Craiova dedicată gustului autentic toscan. Panini gourmet pe Schiacciata de 180g și ingrediente proaspete preparate pe loc.'
                : lang === 'it'
                ? 'Attività artigianale a Craiova dedicata all\'autentico gusto toscano. Schiacciate gourmet da 180g e ingredienti freschi preparati al momento.'
                : 'Local artisan sandwich spot in Craiova dedicated to true Tuscan taste. Gourmet panini on 180g Schiacciata flatbread made to order.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/sandwichefcraiova/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C44E36] flex items-center justify-center text-white transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/p/Sandwichef-61552030004351/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C44E36] flex items-center justify-center text-white transition-colors text-xs font-bold"
                title="Facebook"
              >
                fb
              </a>
              <a
                href="https://www.tiktok.com/@sandwichef1"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C44E36] flex items-center justify-center text-white transition-colors text-xs font-bold"
                title="TikTok"
              >
                tt
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-4">
              {lang === 'ro' ? 'Navigare rapidă' : lang === 'it' ? 'Navigazione rapida' : 'Quick navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTo('home')}
                  className="hover:text-[#F0BE2C] transition-colors cursor-pointer"
                >
                  {lang === 'ro' ? 'Acasă' : lang === 'it' ? 'Home' : 'Home'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('story')}
                  className="hover:text-[#F0BE2C] transition-colors cursor-pointer"
                >
                  {lang === 'ro' ? 'Povestea noastră' : lang === 'it' ? 'La nostra storia' : 'Our story'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('menu')}
                  className="hover:text-[#F0BE2C] transition-colors cursor-pointer"
                >
                  {lang === 'ro' ? 'Meniu complet (19 rețete)' : lang === 'it' ? 'Menu completo (19 ricette)' : 'Full menu'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('builder')}
                  className="hover:text-[#F0BE2C] transition-colors cursor-pointer"
                >
                  {lang === 'ro' ? 'Chef Lab (personalizează)' : lang === 'it' ? 'Chef Lab (personalizza)' : 'Chef Lab builder'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('catering')}
                  className="hover:text-[#F0BE2C] transition-colors cursor-pointer"
                >
                  {lang === 'ro' ? 'Catering evenimente' : lang === 'it' ? 'Catering eventi' : 'Catering packages'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('location')}
                  className="hover:text-[#F0BE2C] transition-colors cursor-pointer"
                >
                  {lang === 'ro' ? 'Locație & program' : lang === 'it' ? 'Posizione & orari' : 'Location & hours'}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-4">
              {lang === 'ro' ? 'Contact direct' : lang === 'it' ? 'Contattaci' : 'Contact us'}
            </h4>
            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C44E36] shrink-0 mt-0.5" />
                <span>Strada Amaradia, Nr. 29, Craiova, Dolj</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F0BE2C] shrink-0" />
                <a href="tel:0735468253" className="hover:text-white font-bold">
                  0735 468 253
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C44E36] shrink-0" />
                <a
                  href="mailto:sandwichefcraiova@gmail.com"
                  className="hover:text-white"
                >
                  sandwichefcraiova@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">
                    {lang === 'ro' ? 'Luni - Vineri: 09:30 - 17:30' : lang === 'it' ? 'Lunedì - Venerdì: 09:30 - 17:30' : 'Monday - Friday: 09:30 - 17:30'}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'ro' ? 'Sâmbătă - Duminică: Închis (Catering la cerere)' : lang === 'it' ? 'Sabato - Domenica: Chiuso (Catering su richiesta)' : 'Saturday - Sunday: Closed (Catering on request)'}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Delivery & Ordering Links */}
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-4">
              {lang === 'ro' ? 'Livrare online' : lang === 'it' ? 'Consegna online' : 'Delivery partners'}
            </h4>
            <p className="text-xs text-stone-400 mb-4">
              {lang === 'ro'
                ? 'Comandă direct în aplicațiile de delivery pentru livrare rapidă la birou sau acasă:'
                : lang === 'it'
                ? 'Ordina direttamente sulle app di consegna per riceverlo a casa o in ufficio:'
                : 'Order directly on your favorite food delivery app:'}
            </p>
            <div className="space-y-2">
              <a
                href="https://food.bolt.eu/ro-ro/1052-craiova/p/91364-sandwichef/"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-bold text-emerald-400">Bolt Food Craiova</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
              <a
                href="https://wolt.com/ro/rou/craiova/restaurant/sandwichef-68dfdfbd3a8557c375c011d6"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-bold text-cyan-400">Wolt Craiova</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Romanian ANPC & Consumer Notices */}
        <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-stone-500">
          <div>
            <p>
              © {new Date().getFullYear()} Sandwichef Craiova. Toate drepturile rezervate.
            </p>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Preparate cu ingrediente proaspete respectând normele sanitar-veterinare în vigoare.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-300 underline"
            >
              ANPC - SAL
            </a>
            <span>•</span>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-300 underline"
            >
              Soluționarea online a litigiilor (SOL)
            </a>
            <span>•</span>
            <span>Alergeni disponibili în meniu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
