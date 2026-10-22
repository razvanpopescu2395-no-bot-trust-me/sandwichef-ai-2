import React from 'react';
import { Sparkles, UtensilsCrossed, Award, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { handleSafeImageError, FALLBACK_IMAGES } from '../utils/imageFallback';

interface StorySectionProps {
  onNavigateTo: (id: string) => void;
  lang: Language;
}

export const StorySection: React.FC<StorySectionProps> = ({ onNavigateTo, lang }) => {
  const quickCards = [
    {
      id: 'menu',
      titleRo: 'Meniu panini & sandwichuri',
      titleEn: 'Panini & sandwich menu',
      titleIt: 'Menu panini & focacce',
      subtitleRo: '19 rețete gătite pe loc',
      subtitleEn: '19 freshly made recipes',
      subtitleIt: '19 ricette preparate al momento',
      image: '/images/swc-bacon.jpeg',
      tagRo: 'Descoperă',
      tagEn: 'Discover',
      tagIt: 'Scopri',
    },
    {
      id: 'catering',
      titleRo: 'Catering corporate & evenimente',
      titleEn: 'Corporate & event catering',
      titleIt: 'Catering aziendale & eventi',
      subtitleRo: 'Platouri schiacciata & snack station',
      subtitleEn: 'Schiacciata boards & break stations',
      subtitleIt: 'Taglieri schiacciata & snack station',
      image: '/images/swc-catering.jpg',
      tagRo: 'Pentru echipe',
      tagEn: 'For teams',
      tagIt: 'Per i team',
    },
    {
      id: 'builder',
      titleRo: 'Chef Lab - fii tu chef-ul',
      titleEn: 'Chef Lab - be the chef',
      titleIt: 'Chef Lab - diventa tu lo chef',
      subtitleRo: 'Construiește-ți sandwich-ul strat cu strat',
      subtitleEn: 'Build your sandwich layer by layer',
      subtitleIt: 'Costruisci il tuo panino strato dopo strato',
      image: FALLBACK_IMAGES.builder,
      tagRo: 'Interactiv',
      tagEn: 'Interactive',
      tagIt: 'Interattivo',
    },
    {
      id: 'location',
      titleRo: 'Locația noastră din Craiova',
      titleEn: 'Our location in Craiova',
      titleIt: 'La nostra sede a Craiova',
      subtitleRo: 'Str. Amaradia, Nr. 29',
      subtitleEn: '29 Amaradia St., Craiova',
      subtitleIt: 'Via Amaradia, N. 29, Craiova',
      image: '/images/swc-locatie.jpeg',
      tagRo: 'Vizitează-ne',
      tagEn: 'Visit us',
      tagIt: 'Vienici a trovare',
    },
  ];

  return (
    <section id="story" className="py-16 bg-[#F5EFE6] border-b border-[#241813]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Story Intro Card */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C44E36] bg-[#C44E36]/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {lang === 'ro'
              ? 'Povestea Sandwichef Craiova'
              : lang === 'it'
              ? 'La storia di Sandwichef Craiova'
              : 'The Sandwichef Craiova story'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#241813] mb-5 tracking-tight">
            {lang === 'ro'
              ? 'Un joc de cuvinte cu gust extraordinar.'
              : lang === 'it'
              ? 'Un gioco di parole dal gusto straordinario.'
              : 'A play on words with extraordinary flavor.'}
          </h2>
          <div className="text-[#55473F] text-base sm:text-lg leading-relaxed space-y-4">
            <p>
              {lang === 'ro' ? (
                <>
                  Sandwichef pornește de la o regulă simplă: <b>gust excelent</b>. Suntem o afacere
                  locală înființată în <b>2024</b> ce și-a propus să îmbine două elemente esențiale:
                </>
              ) : lang === 'it' ? (
                <>
                  Sandwichef nasce nel <b>2024</b> a Craiova da una regola fondamentale:{' '}
                  <b>gusto eccellente</b>. Abbiamo unito due elementi essenziali:
                </>
              ) : (
                <>
                  Sandwichef started in <b>2024</b> in Craiova with one unwavering principle:{' '}
                  <b>exceptional taste</b>. We united two essential elements:
                </>
              )}
            </p>
            <div className="p-4 sm:p-5 bg-white rounded-2xl shadow-xs border border-[#E7DDCE] text-[#241813] font-medium text-sm sm:text-base">
              {lang === 'ro' ? (
                <>
                  🥪 <span className="font-bold text-[#C44E36]">"Sandwich"</span> - cel mai iubit
                  preparat din lume, potrivit pentru orice moment al zilei +{' '}
                  <span className="font-bold text-[#C44E36]">"Chef"</span> - noi, maeștrii care le
                  preparăm pe loc (în engleză), sau <b>tu</b>, cel care vii cu <i>cheful</i> de viață
                  și pofta (în română)!
                </>
              ) : lang === 'it' ? (
                <>
                  🥪 <span className="font-bold text-[#C44E36]">"Sandwich"</span> - la specialità più amata
                  al mondo, perfetta per ogni momento della giornata +{' '}
                  <span className="font-bold text-[#C44E36]">"Chef"</span> - noi che prepariamo
                  ogni pezzo con passione artigianale, e <b>tu</b> con la voglia e l'appetito migliore!
                </>
              ) : (
                <>
                  🥪 <span className="font-bold text-[#C44E36]">"Sandwich"</span> - the worldwide
                  favorite comfort food +{' '}
                  <span className="font-bold text-[#C44E36]">"Chef"</span> - us, crafting each piece
                  artisanally, and <b>you</b>, bringing the good mood and hearty appetite!
                </>
              )}
            </div>
            <p className="text-sm sm:text-base text-[#6B5E55]">
              {lang === 'ro'
                ? 'De la pâinea Schiacciata toscană aerată de 180g la sosul casei cu ierburi proaspete, fiecare ingredient este cântărit și asamblat cu precizie de maestru.'
                : lang === 'it'
                ? 'Dalla soffice Schiacciata toscana da 180g alle salse fatte in casa con erbe fresche, ogni ingrediente è pesato e composto con autentica maestria.'
                : 'From our 180g airy Tuscan Schiacciata to our signature in-house sauces, every ingredient is measured and assembled with master culinary precision.'}
            </p>
          </div>
        </div>

        {/* 4 Interactive Visual Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickCards.map((card, idx) => (
            <div
              key={card.id}
              id={`story-card-${card.id}`}
              onClick={() => onNavigateTo(card.id)}
              className="group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-[#E7DDCE] cursor-pointer flex flex-col hover:-translate-y-1"
            >
              <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100">
                <img
                  src={card.image}
                  alt={card.titleRo}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  onError={(e) => {
                    handleSafeImageError(e, FALLBACK_IMAGES.sandwich);
                  }}
                />
                <div className="absolute top-3 left-3 bg-[#241813]/85 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {lang === 'ro' ? card.tagRo : lang === 'it' ? card.tagIt : card.tagEn}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#241813] group-hover:text-[#C44E36] transition-colors mb-1">
                    {lang === 'ro' ? card.titleRo : lang === 'it' ? card.titleIt : card.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B5E55] leading-snug">
                    {lang === 'ro' ? card.subtitleRo : lang === 'it' ? card.subtitleIt : card.subtitleEn}
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-[#F0EAE1] flex items-center justify-between text-xs font-bold text-[#C44E36]">
                  <span>{lang === 'ro' ? 'Accesează secțiunea' : lang === 'it' ? 'Vai alla sezione' : 'Open section'}</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3 Value Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-[#241813]/10">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-[#E7DDCE]">
            <div className="p-3 bg-[#C44E36]/10 text-[#C44E36] rounded-xl shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#241813] text-base mb-1">
                {lang === 'ro' ? 'Schiacciata florentină' : lang === 'it' ? 'Schiacciata fiorentina' : 'Florentine schiacciata'}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5E55]">
                {lang === 'ro'
                  ? 'Focaccia toscană aerată, unsă cu ulei de măsline extravirgin și rumenită crocant la presare.'
                  : lang === 'it'
                  ? 'Focaccia toscana ariosa, condita con olio extravergine d\'oliva e tostata croccante alla pressa.'
                  : 'Airy Tuscan flatbread dressed with extra virgin olive oil, toasted golden crisp.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-[#E7DDCE]">
            <div className="p-3 bg-[#F0BE2C]/20 text-[#B45309] rounded-xl shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#241813] text-base mb-1">
                {lang === 'ro' ? 'Ingrediente italiene veritabile' : lang === 'it' ? 'Autentici salumi italiani' : 'Authentic Italian meats'}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5E55]">
                {lang === 'ro'
                  ? 'Mortadella di Bologna, salam Ventricina picant, cremă gorgonzola și parmezan maturat.'
                  : lang === 'it'
                  ? 'Mortadella di Bologna, salame Ventricina piccante, crema di gorgonzola e parmigiano stagionato.'
                  : 'Bologna mortadella, spicy Ventricina salami, creamy gorgonzola, and aged parmesan.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-[#E7DDCE]">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#241813] text-base mb-1">
                {lang === 'ro' ? 'Gramaj generos garantat' : lang === 'it' ? 'Peso generoso garantito' : 'Generous portion weights'}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B5E55]">
                {lang === 'ro'
                  ? 'Până la 545g per sandwich! Fiecare ingredient este specificat transparent în grame exacte.'
                  : lang === 'it'
                  ? 'Fino a 545g per panino! Ogni singolo ingrediente è specificato con trasparenza nei grammi esatti.'
                  : 'Up to 545g per sandwich! Every single ingredient transparently weighed.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
