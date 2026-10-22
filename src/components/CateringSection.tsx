import React, { useState } from 'react';
import { Sparkles, Users, CheckCircle2, Phone, Mail, MessageSquare, Calendar, ArrowRight, Building } from 'lucide-react';
import { Language } from '../types';
import { CATERING_PACKAGES } from '../data/menuData';
import { handleSafeImageError, FALLBACK_IMAGES } from '../utils/imageFallback';

interface CateringSectionProps {
  lang: Language;
}

export const CateringSection: React.FC<CateringSectionProps> = ({ lang }) => {
  const [headcount, setHeadcount] = useState<number>(20);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pack-corporate');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activePackage = CATERING_PACKAGES.find((p) => p.id === selectedPackageId) || CATERING_PACKAGES[0];
  const estimatedCost = headcount * activePackage.pricePerPerson;
  const estimatedPlatters = Math.ceil(headcount / 5);

  const handleWhatsAppInquiry = () => {
    const pkgName = lang === 'ro' ? activePackage.title : lang === 'it' ? (activePackage.titleIt || activePackage.title) : activePackage.titleEn;
    const text = encodeURIComponent(
      lang === 'ro'
        ? `Salut Sandwichef Craiova! Doresc o ofertă de catering pentru ${headcount} persoane.\n` +
          `Pachet selectat: ${pkgName}\n` +
          `Data eveniment: ${inquiryDate || 'de stabilit'}\n` +
          `Nume contact: ${inquiryName || 'Client'}\n` +
          `Telefon: ${inquiryPhone || 'Nespecificat'}\n` +
          `Mențiuni: ${inquiryNotes || 'Niciuna'}\n` +
          `Buget estimativ: ~${estimatedCost} RON`
        : lang === 'it'
        ? `Ciao Sandwichef Craiova! Vorrei un preventivo di catering per ${headcount} persone.\n` +
          `Pacchetto scelto: ${pkgName}\n` +
          `Data evento: ${inquiryDate || 'da definire'}\n` +
          `Nome contatto: ${inquiryName || 'Cliente'}\n` +
          `Telefono: ${inquiryPhone || 'Non specificato'}\n` +
          `Note: ${inquiryNotes || 'Nessuna'}\n` +
          `Budget stimato: ~${estimatedCost} RON`
        : `Hello Sandwichef Craiova! I would like a catering quote for ${headcount} guests.\n` +
          `Package: ${pkgName}\n` +
          `Event date: ${inquiryDate || 'TBD'}\n` +
          `Contact name: ${inquiryName || 'Client'}\n` +
          `Phone: ${inquiryPhone || 'Not specified'}\n` +
          `Notes: ${inquiryNotes || 'None'}\n` +
          `Estimated budget: ~${estimatedCost} RON`
    );
    window.open(`https://wa.me/40769409493?text=${text}`, '_blank');
  };

  const handleEmailInquiry = () => {
    const pkgName = lang === 'ro' ? activePackage.title : lang === 'it' ? (activePackage.titleIt || activePackage.title) : activePackage.titleEn;
    const subject = encodeURIComponent(
      lang === 'ro'
        ? `Solicitare Catering Sandwichef - ${headcount} persoane - ${inquiryName || 'Eveniment'}`
        : lang === 'it'
        ? `Richiesta Catering Sandwichef - ${headcount} persone - ${inquiryName || 'Evento'}`
        : `Catering Inquiry Sandwichef - ${headcount} guests - ${inquiryName || 'Event'}`
    );
    const body = encodeURIComponent(
      lang === 'ro'
        ? `Bună ziua echipa Sandwichef Craiova,\n\n` +
          `Aș dori o ofertă detaliată pentru un eveniment de catering:\n\n` +
          `• Număr de persoane: ${headcount}\n` +
          `• Pachet de interes: ${pkgName}\n` +
          `• Data eveniment: ${inquiryDate || 'În curând'}\n` +
          `• Nume: ${inquiryName}\n` +
          `• Telefon: ${inquiryPhone}\n` +
          `• Mențiuni / Preferințe: ${inquiryNotes || 'Fără mențiuni speciale'}\n\n` +
          `Vă mulțumesc!`
        : lang === 'it'
        ? `Gentile team Sandwichef Craiova,\n\n` +
          `Vorrei richiedere un preventivo per un evento di catering:\n\n` +
          `• Numero di persone: ${headcount}\n` +
          `• Pacchetto di interesse: ${pkgName}\n` +
          `• Data evento: ${inquiryDate || 'A breve'}\n` +
          `• Nome: ${inquiryName}\n` +
          `• Telefono: ${inquiryPhone}\n` +
          `• Note / Preferenze: ${inquiryNotes || 'Nessuna preferenza speciale'}\n\n` +
          `Grazie cordialmente!`
        : `Hello Sandwichef Craiova team,\n\n` +
          `I would like a detailed catering quote:\n\n` +
          `• Number of guests: ${headcount}\n` +
          `• Package: ${pkgName}\n` +
          `• Date: ${inquiryDate || 'Upcoming'}\n` +
          `• Name: ${inquiryName}\n` +
          `• Phone: ${inquiryPhone}\n` +
          `• Notes / Dietary requirements: ${inquiryNotes || 'None'}\n\n` +
          `Thank you!`
    );
    window.location.href = `mailto:sandwichefcraiova@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section id="catering" className="py-20 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C44E36] bg-[#C44E36]/10 mb-3">
            <Building className="w-3.5 h-3.5" />
            {lang === 'ro' ? 'Servicii evenimente & birou' : lang === 'it' ? 'Servizi eventi & ufficio' : 'Event & office services'}
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#241813] tracking-tight mb-4">
            {lang === 'ro' ? 'Catering Sandwichef Craiova' : lang === 'it' ? 'Catering Sandwichef Craiova' : 'Sandwichef Catering Craiova'}
          </h2>
          <p className="text-base sm:text-lg text-[#6B5E55] leading-relaxed">
            {lang === 'ro'
              ? 'Partenerul tău de încredere pentru pauze de prânz corporate, conferințe, team buildinguri și petreceri private. Livrăm promptitudine și savoare toscană.'
              : lang === 'it'
              ? 'Il tuo partner di fiducia per pause pranzo aziendali, conferenze, team building e feste private. Puntualità e autentico gusto toscano.'
              : 'Your trusted partner for corporate lunches, conferences, team buildings, and private celebrations with authentic taste.'}
          </p>
        </div>

        {/* Feature Banner with real photo */}
        <div className="relative rounded-3xl overflow-hidden mb-16 shadow-xl border border-[#E7DDCE]">
          <div className="h-64 sm:h-80 w-full relative">
            <img
              src="/images/swc-catering.jpg"
              alt="Platouri Catering Sandwichef"
              className="w-full h-full object-cover"
              onError={(e) => {
                handleSafeImageError(e, FALLBACK_IMAGES.catering);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#241813]/90 via-[#241813]/65 to-transparent flex items-center p-6 sm:p-12">
              <div className="max-w-xl text-white">
                <span className="bg-[#F0BE2C] text-[#241813] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                  {lang === 'ro' ? 'Comenzi cu 24h înainte' : lang === 'it' ? 'Ordini con 24h di anticipo' : 'Order 24h in advance'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
                  {lang === 'ro'
                    ? 'Platouri mini-schiacciata & wraps gourmet'
                    : lang === 'it'
                    ? 'Vassoi mini-schiacciata & wraps gourmet'
                    : 'Gourmet mini-schiacciata & wrap platters'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {lang === 'ro'
                    ? 'Fiecare sandwich este porționat elegant pentru sharing ușor. Adaptăm rețetele în funcție de cerințe vegetariene, fără gluten sau fără carne.'
                    : lang === 'it'
                    ? 'Ogni panino è porzionato con cura per una facile condivisione. Adattiamo le ricette a richieste vegetariane o preferenze aziendali.'
                    : 'Artisan sandwiches portioned for effortless sharing. Customized for dietary needs, vegetarian preferences, and corporate events.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Catering Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {CATERING_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;
            const pkgTitle = lang === 'ro' ? pkg.title : lang === 'it' ? (pkg.titleIt || pkg.title) : pkg.titleEn;
            const pkgBadge = lang === 'ro' ? pkg.badge : lang === 'it' ? (pkg.badgeIt || pkg.badge) : pkg.badgeEn;
            const pkgDesc = lang === 'ro' ? pkg.description : lang === 'it' ? (pkg.descriptionIt || pkg.description) : pkg.descriptionEn;
            const includesList = lang === 'ro' ? pkg.includes : lang === 'it' ? (pkg.includesIt || pkg.includes) : pkg.includesEn;

            return (
              <div
                key={pkg.id}
                id={`catering-pkg-${pkg.id}`}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`bg-white rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-lg ${
                  isSelected
                    ? 'border-[#C44E36] ring-2 ring-[#C44E36]/30 shadow-md -translate-y-1'
                    : 'border-[#E7DDCE] hover:border-[#C44E36]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{pkg.icon}</span>
                    <span className="bg-[#FAF7F2] text-[#C44E36] border border-[#E7DDCE] text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {pkgBadge}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#241813] mb-2">
                    {pkgTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5E55] mb-5 leading-relaxed">
                    {pkgDesc}
                  </p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-[#F0EAE1]">
                    {includesList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#4A3B32]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F0EAE1] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#8C7E74] block">
                      {lang === 'ro' ? 'Estimare per persoană' : lang === 'it' ? 'Stima a persona' : 'Est. per person'}
                    </span>
                    <span className="font-bold text-lg text-[#C44E36]">
                      ~{pkg.pricePerPerson} RON
                    </span>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-[#C44E36] text-white'
                        : 'bg-[#FAF7F2] text-[#241813] hover:bg-[#F0EAE1]'
                    }`}
                  >
                    {isSelected
                      ? (lang === 'ro' ? 'Selectat ✓' : lang === 'it' ? 'Selezionato ✓' : 'Selected ✓')
                      : (lang === 'ro' ? 'Selectează' : lang === 'it' ? 'Seleziona' : 'Select')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Headcount Calculator & Instant Quote Inquiry Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7DDCE] shadow-lg max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#241813] mb-2">
              {lang === 'ro' ? 'Simulator estimativ buget & oferte' : lang === 'it' ? 'Calcolatore preventivo catering' : 'Instant budget & quote estimator'}
            </h3>
            <p className="text-xs sm:text-sm text-[#6B5E55]">
              {lang === 'ro'
                ? 'Ajustează numărul de invitați și trimite solicitarea pe WhatsApp sau Email.'
                : lang === 'it'
                ? 'Regola il numero di ospiti e invia subito la tua richiesta via WhatsApp o Email.'
                : 'Adjust the guest count and instantly send your request.'}
            </p>
          </div>

          {/* Headcount Slider */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E7DDCE] mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C7E74] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#C44E36]" />
                {lang === 'ro' ? 'Număr persoane / invitați' : lang === 'it' ? 'Numero di persone / ospiti' : 'Number of guests'}
              </span>
              <span className="font-serif text-2xl font-bold text-[#C44E36]">
                {headcount} {lang === 'ro' ? 'persoane' : lang === 'it' ? 'persone' : 'people'}
              </span>
            </div>
            <input
              type="range"
              id="catering-headcount-slider"
              min="10"
              max="150"
              step="5"
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              className="w-full h-2 bg-[#E7DDCE] rounded-lg appearance-none cursor-pointer accent-[#C44E36]"
            />
            <div className="flex justify-between text-[11px] text-[#8C7E74] mt-1 font-medium">
              <span>{lang === 'ro' ? '10 pers (Echipă restrânsă)' : lang === 'it' ? '10 pers (Piccolo team)' : '10 guests (Small team)'}</span>
              <span>{lang === 'ro' ? '50 pers (Companie / Sală)' : lang === 'it' ? '50 pers (Azienda / Sala)' : '50 guests (Company)'}</span>
              <span>{lang === 'ro' ? '150+ pers (Conferință mare)' : lang === 'it' ? '150+ pers (Grande evento)' : '150+ guests (Conference)'}</span>
            </div>

            {/* Quick Math Summary */}
            <div className="mt-4 pt-4 border-t border-[#E7DDCE] grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#E7DDCE]">
                <span className="text-[11px] text-[#8C7E74] block">
                  {lang === 'ro' ? 'Platouri recomandate' : lang === 'it' ? 'Vassoi consigliati' : 'Recommended platters'}
                </span>
                <span className="font-bold text-sm text-[#241813]">
                  ~{estimatedPlatters} {lang === 'ro' ? 'platouri mari' : lang === 'it' ? 'vassoi grandi' : 'large platters'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E7DDCE]">
                <span className="text-[11px] text-[#8C7E74] block">
                  {lang === 'ro' ? 'Pachet selectat' : lang === 'it' ? 'Pacchetto scelto' : 'Selected package'}
                </span>
                <span className="font-bold text-xs text-[#241813] truncate block">
                  {lang === 'ro' ? activePackage.title : lang === 'it' ? (activePackage.titleIt || activePackage.title) : activePackage.titleEn}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E7DDCE] col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#8C7E74] block">
                  {lang === 'ro' ? 'Buget estimativ' : lang === 'it' ? 'Budget stimato' : 'Estimated budget'}
                </span>
                <span className="font-bold text-sm text-[#C44E36]">~{estimatedCost} RON</span>
              </div>
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#8C7E74] uppercase mb-1">
                  {lang === 'ro' ? 'Numele dvs. / companie' : lang === 'it' ? 'Il tuo nome / azienda' : 'Name / company'}
                </label>
                <input
                  type="text"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  placeholder={lang === 'ro' ? 'Ex: Razvan Popescu / Google Romania' : lang === 'it' ? 'Es: Razvan Popescu / Google Romania' : 'e.g. Razvan Popescu / Google Romania'}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl focus:outline-none focus:border-[#C44E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C7E74] uppercase mb-1">
                  {lang === 'ro' ? 'Telefon contact' : lang === 'it' ? 'Telefono di contatto' : 'Phone'}
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                  placeholder="Ex: 0722 000 000"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl focus:outline-none focus:border-[#C44E36]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8C7E74] uppercase mb-1">
                  {lang === 'ro' ? 'Data dorită' : lang === 'it' ? 'Data richiesta' : 'Target date'}
                </label>
                <input
                  type="date"
                  value={inquiryDate}
                  onChange={(e) => setInquiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl focus:outline-none focus:border-[#C44E36]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8C7E74] uppercase mb-1">
                {lang === 'ro' ? 'Preferințe sau mențiuni (opțional)' : lang === 'it' ? 'Note o preferenze (opzionale)' : 'Notes or preferences'}
              </label>
              <textarea
                rows={2}
                value={inquiryNotes}
                onChange={(e) => setInquiryNotes(e.target.value)}
                placeholder={lang === 'ro' ? 'Ex: 5 meniuri vegetariene, livrare la sediul din Craiova la ora 12:00 etc.' : lang === 'it' ? 'Es: 5 opzioni vegetariane, consegna ore 12:00...' : 'e.g. 5 vegetarian options, delivery at 12:00...'}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E7DDCE] rounded-xl focus:outline-none focus:border-[#C44E36]"
              />
            </div>
          </div>

          {/* Action Inquiry Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="catering-whatsapp-btn"
              onClick={handleWhatsAppInquiry}
              className="flex-1 min-w-[200px] py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-101 active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>
                {lang === 'ro'
                  ? `Trimite pe WhatsApp (~${estimatedCost} RON)`
                  : lang === 'it'
                  ? `Invia su WhatsApp (~${estimatedCost} RON)`
                  : `Send on WhatsApp (~${estimatedCost} RON)`}
              </span>
            </button>

            <button
              id="catering-email-btn"
              onClick={handleEmailInquiry}
              className="flex-1 min-w-[200px] py-3.5 px-6 bg-[#241813] hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer hover:scale-101 active:scale-98"
            >
              <Mail className="w-4 h-4 text-[#F0BE2C]" />
              <span>
                {lang === 'ro' ? 'Trimite solicitare prin email' : lang === 'it' ? 'Invia richiesta via email' : 'Send request via email'}
              </span>
            </button>

            <a
              id="catering-call-btn"
              href="tel:0735468253"
              className="py-3.5 px-6 bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#241813] border border-[#E7DDCE] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Phone className="w-4 h-4 text-[#C44E36]" />
              <span>{lang === 'ro' ? 'Sună la 0735 468 253' : lang === 'it' ? 'Chiama 0735 468 253' : 'Call 0735 468 253'}</span>
            </a>
          </div>

          <p className="text-center text-xs text-[#8C7E74] mt-4">
            {lang === 'ro'
              ? 'Sandwichef Craiova răspunde în maxim 2 ore. Livrare gratuită în Craiova pentru comenzi peste 300 RON.'
              : lang === 'it'
              ? 'Sandwichef Craiova risponde entro 2 ore. Consegna gratuita a Craiova per ordini superiori a 300 RON.'
              : 'Sandwichef Craiova replies within 2 hours. Free delivery in Craiova on orders over 300 RON.'}
          </p>
        </div>
      </div>
    </section>
  );
};
