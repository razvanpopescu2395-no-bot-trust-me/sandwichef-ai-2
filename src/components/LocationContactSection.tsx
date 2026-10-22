import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Mail, Navigation, ExternalLink, ShieldCheck, Share2 } from 'lucide-react';
import { Language } from '../types';
import { getStoreStatus } from '../utils/status';

interface LocationContactSectionProps {
  lang: Language;
}

export const LocationContactSection: React.FC<LocationContactSectionProps> = ({ lang }) => {
  const [storeStatus, setStoreStatus] = useState(getStoreStatus());
  const [mapInteractive, setMapInteractive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => setStoreStatus(getStoreStatus());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleShareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sandwichef Craiova',
          text: 'Strada Amaradia, Nr. 29, Craiova, Dolj - Panini Gourmet & Sandwichuri Artizanale',
          url: 'https://maps.app.goo.gl/UqDviip6A3CN9qXP7',
        });
      } catch (e) {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText('Strada Amaradia, Nr. 29, Craiova, Dolj');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scheduleRows = [
    { dayRo: 'Luni', dayEn: 'Monday', dayIt: 'Lunedì', hours: '09:30 - 17:30', hoursIt: '09:30 - 17:30', dayIndex: 1 },
    { dayRo: 'Marți', dayEn: 'Tuesday', dayIt: 'Martedì', hours: '09:30 - 17:30', hoursIt: '09:30 - 17:30', dayIndex: 2 },
    { dayRo: 'Miercuri', dayEn: 'Wednesday', dayIt: 'Mercoledì', hours: '09:30 - 17:30', hoursIt: '09:30 - 17:30', dayIndex: 3 },
    { dayRo: 'Joi', dayEn: 'Thursday', dayIt: 'Giovedì', hours: '09:30 - 17:30', hoursIt: '09:30 - 17:30', dayIndex: 4 },
    { dayRo: 'Vineri', dayEn: 'Friday', dayIt: 'Venerdì', hours: '09:30 - 17:30', hoursIt: '09:30 - 17:30', dayIndex: 5 },
    { dayRo: 'Sâmbătă', dayEn: 'Saturday', dayIt: 'Sabato', hours: 'Închis (Catering la cerere)', hoursIt: 'Chiuso (Catering su richiesta)', dayIndex: 6 },
    { dayRo: 'Duminică', dayEn: 'Sunday', dayIt: 'Domenica', hours: 'Închis (Catering la cerere)', hoursIt: 'Chiuso (Catering su richiesta)', dayIndex: 0 },
  ];

  const todayIndex = new Date().getDay();

  return (
    <section id="location" className="py-12 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#C44E36] bg-[#C44E36]/10 mb-2 sm:mb-3">
            <MapPin className="w-3.5 h-3.5" />
            {lang === 'ro' ? 'Vino să ne cunoști' : lang === 'it' ? 'Vieni a trovarci' : 'Visit us in Craiova'}
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#241813] tracking-tight mb-2 sm:mb-3">
            {lang === 'ro' ? 'Locație & program Sandwichef' : lang === 'it' ? 'Posizione & orari Sandwichef' : 'Location & store hours'}
          </h2>
          <p className="text-xs sm:text-base text-[#6B5E55] leading-relaxed px-2">
            {lang === 'ro'
              ? 'Te așteptăm în Craiova pe Strada Amaradia 29 pentru sandwichuri proaspăt rumenite sau comandă prin livrare.'
              : lang === 'it'
              ? 'Ti aspettiamo a Craiova in Strada Amaradia 29 per panini caldi e fragranti o ordina a domicilio.'
              : 'Visit our sandwich shop on Amaradia Street 29, Craiova, or order delivery.'}
          </p>
        </div>

        {/* Quick 1-Tap Mobile Navigation Dial Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
          <a
            href="tel:0735468253"
            className="p-3 rounded-2xl bg-white border border-[#E7DDCE] shadow-2xs hover:border-[#C44E36] flex items-center gap-2.5 transition-all text-left min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C44E36]/10 text-[#C44E36] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#8C7E74] uppercase font-bold">
                {lang === 'ro' ? 'Apel direct' : lang === 'it' ? 'Chiamata' : 'Direct call'}
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#241813] truncate">0735 468 253</p>
            </div>
          </a>

          <a
            href="https://maps.app.goo.gl/UqDviip6A3CN9qXP7"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-2xl bg-white border border-[#E7DDCE] shadow-2xs hover:border-[#C44E36] flex items-center gap-2.5 transition-all text-left min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-xl bg-[#F0BE2C]/20 text-[#B37B00] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#8C7E74] uppercase font-bold">Google Maps</p>
              <p className="text-xs sm:text-sm font-bold text-[#241813] truncate">
                {lang === 'ro' ? 'Deschide harta' : lang === 'it' ? 'Apri mappa' : 'Open map'}
              </p>
            </div>
          </a>

          <a
            href="https://waze.com/ul?q=Sandwichef+Craiova"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-2xl bg-white border border-[#E7DDCE] shadow-2xs hover:border-cyan-600 flex items-center gap-2.5 transition-all text-left min-h-[48px]"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#8C7E74] uppercase font-bold">Waze GPS</p>
              <p className="text-xs sm:text-sm font-bold text-[#241813] truncate">
                {lang === 'ro' ? 'Navighează' : lang === 'it' ? 'Naviga' : 'Navigate'}
              </p>
            </div>
          </a>

          <button
            onClick={handleShareAddress}
            className="p-3 rounded-2xl bg-white border border-[#E7DDCE] shadow-2xs hover:border-purple-600 flex items-center gap-2.5 transition-all text-left min-h-[48px] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#8C7E74] uppercase font-bold">
                {copied
                  ? (lang === 'ro' ? 'Copiat!' : lang === 'it' ? 'Copiato!' : 'Copied!')
                  : (lang === 'ro' ? 'Trimite adresa' : lang === 'it' ? 'Condividi indirizzo' : 'Share address')}
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#241813] truncate">
                {copied
                  ? (lang === 'ro' ? 'În clipboard' : lang === 'it' ? 'Negli appunti' : 'In clipboard')
                  : (lang === 'ro' ? 'Distribuie' : lang === 'it' ? 'Invia' : 'Share')}
              </p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Map Column (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl overflow-hidden border border-[#E7DDCE] shadow-xs relative">
            <div className="relative h-64 sm:h-96 w-full">
              <iframe
                title="Sandwichef Craiova Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2853.8643224741484!2d23.791535476698668!3d44.32279140890045!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4752d7e63b65bf73%3A0x868b4db84c07b4be!2sSandwichef!5e0!3m2!1sro!2sro!4v1700000000000!5m2!1sro!2sro"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={`w-full h-full ${!mapInteractive ? 'pointer-events-none sm:pointer-events-auto' : 'pointer-events-auto'}`}
              />

              {/* Mobile overlay toggle to prevent touch hijacking while scrolling page */}
              {!mapInteractive && (
                <div
                  onClick={() => setMapInteractive(true)}
                  className="sm:hidden absolute inset-0 bg-black/10 flex items-center justify-center cursor-pointer"
                >
                  <span className="bg-[#241813]/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                    {lang === 'ro'
                      ? 'Apasă pentru a naviga pe hartă 👆'
                      : lang === 'it'
                      ? 'Tocca per navigare sulla mappa 👆'
                      : 'Tap to interact with map 👆'}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#241813]">
                  Strada Amaradia, Nr. 29, Craiova, Dolj
                </p>
                <p className="text-xs text-[#8C7E74]">
                  {lang === 'ro'
                    ? 'În apropierea Universității din Craiova și a zonei centrale'
                    : lang === 'it'
                    ? 'Vicino all\'Università di Craiova e al centro storico'
                    : 'Near the University of Craiova and city center'}
                </p>
              </div>

              <a
                href="https://maps.app.goo.gl/UqDviip6A3CN9qXP7"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#C44E36] hover:bg-[#A63B25] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs min-h-[40px] shrink-0"
              >
                <span>{lang === 'ro' ? 'Deschide în Google Maps' : lang === 'it' ? 'Apri in Google Maps' : 'Open in Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Schedule Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {/* Live Store Status Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E7DDCE] shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#C44E36]" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#241813]">
                  {lang === 'ro' ? 'Program de funcționare' : lang === 'it' ? 'Orari di apertura' : 'Store hours'}
                </h3>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E7DDCE] mb-4 flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    storeStatus.isOpen ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                  }`}
                />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#241813]">
                    {lang === 'ro'
                      ? storeStatus.statusTextRo
                      : lang === 'it'
                      ? (storeStatus.statusTextIt || storeStatus.statusTextRo)
                      : storeStatus.statusTextEn}
                  </p>
                  <p className="text-[11px] text-[#8C7E74]">
                    {lang === 'ro'
                      ? storeStatus.subtextRo
                      : lang === 'it'
                      ? (storeStatus.subtextIt || storeStatus.subtextRo)
                      : storeStatus.subtextEn}
                  </p>
                </div>
              </div>

              {/* Weekly schedule with today highlighted */}
              <div className="space-y-1.5">
                {scheduleRows.map((row) => {
                  const isToday = row.dayIndex === todayIndex;
                  const dayLabel = lang === 'ro' ? row.dayRo : lang === 'it' ? row.dayIt : row.dayEn;
                  const hoursLabel = lang === 'it' ? row.hoursIt : row.hours;
                  return (
                    <div
                      key={row.dayRo}
                      className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs ${
                        isToday
                          ? 'bg-[#C44E36]/10 font-bold text-[#241813] border border-[#C44E36]/30'
                          : 'text-[#6B5E55] hover:bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{dayLabel}</span>
                        {isToday && (
                          <span className="bg-[#C44E36] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase">
                            {lang === 'ro' ? 'Azi' : lang === 'it' ? 'Oggi' : 'Today'}
                          </span>
                        )}
                      </div>
                      <span className={isToday ? 'text-[#C44E36]' : ''}>{hoursLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-[#241813] text-white rounded-3xl p-5 sm:p-6 shadow-xs">
              <h4 className="font-serif text-base sm:text-lg font-bold mb-3">
                {lang === 'ro' ? 'Comenzi rapide & întrebări' : lang === 'it' ? 'Ordini rapidi & domande' : 'Direct assistance'}
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed mb-4">
                {lang === 'ro'
                  ? 'Sună-ne înainte de a ajunge pentru a avea sandwichul gata rumenit și cald.'
                  : lang === 'it'
                  ? 'Chiamaci prima di passare per trovare il tuo panino già caldo e pronto.'
                  : 'Call ahead so your sandwich is hot and ready when you arrive.'}
              </p>

              <div className="space-y-2.5">
                <a
                  href="tel:0735468253"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#F0BE2C]" />
                  <span className="text-xs sm:text-sm font-bold text-white">0735 468 253</span>
                </a>

                <a
                  href="mailto:sandwichefcraiova@gmail.com"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#C44E36]" />
                  <span className="text-xs sm:text-sm font-medium text-white truncate">
                    sandwichefcraiova@gmail.com
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
