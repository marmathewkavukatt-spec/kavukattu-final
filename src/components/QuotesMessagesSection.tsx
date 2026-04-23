'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '@/context/LangContext';

type QuoteItem = {
  text: string;
  source?: string;
};

const QUOTES: QuoteItem[] = [
  {
    text: "മനോഹരങ്ങളായ ദൈവാലയങ്ങൾ കെടാവിളക്കുകളാകണമെങ്കിൽ ആ ദൈവാലയങ്ങളിൽ അർപ്പിക്കപ്പെടുന്ന ദിവ്യബലികളിലും തിരുകർമ്മങ്ങളിലും നിങ്ങൾ അനുദിനമെന്നോണം ഭക്തിയോടെ സംബന്ധിക്കണം.",
  },
  {
    text: "ദൈവസ്നേഹത്തിൻ്റെ അളവുകോലാണ് പരസ്നേഹം. അത് സാമൂഹ്യപ്രശ്നങ്ങൾക്ക് ശരിയായ സമാധാനം കണ്ടെത്തുവാൻ ഏവരേയും പ്രേരിപ്പിക്കുന്നു.",
  },
  {
    text: "ദൈവത്തിൻ്റെ പിതൃത്വത്തിലും മനുഷ്യരുടെ സാഹോദര്യത്തിലും വിശ്വസിക്കുന്നവർക്ക് ഒരു കർത്തവ്യമുണ്ട്. ഉള്ളവൻ ഇല്ലാത്തവനുകൂടി കൊടുക്കണം.",
  },
  {
    text: "ധൂപത്തിൻ്റെ സൗരഭ്യത്തേക്കാളും ദൈവാലയത്തിൻ്റെയും ബലിപീഠത്തിൻ്റെയും ഭംഗിയേക്കാളും ദൈവം കൂടുതൽ ഇഷ്ടപ്പെടുന്നതും ആവശ്യപ്പെടുന്നതും പുണ്യമാണ്.",
  },
  {
    text: "ലോകത്തിൽ നടക്കുന്ന അധർമ്മ പ്രവൃത്തികളുടെയെല്ലാം ആരംഭം മനുഷ്യഹൃദയത്തിലെ ദുഷ്ടവിചാരങ്ങളാണ്.",
  },
  {
    text: "മദ്യം മനുഷ്യൻ്റെ ശരീരത്തേയും ആത്മാവിനേയും കൊല്ലുന്നു. ഉല്ലാസത്തിനുവേണ്ടി ആരംഭിക്കുന്നു. ധനനാശത്തിലും മാനനാശത്തിലും ആത്മനാശത്തിലും അവസാനിക്കുന്നു.",
  },
  {
    text: "ഇടവകയുടെ ഹൃദയമാണ് ദൈവാലയം. വളരെയധികം ത്യാഗങ്ങളും ക്ലേശങ്ങളും സഹിച്ചാണ് ഇടവകജനങ്ങൾ ദൈവാരാധനയ്ക്കുവേണ്ടി ഒരാലയം പണിയുന്നത്.",
  },
  {
    text: "കൂടെക്കൂടെ എണ്ണ ഒഴിച്ചു കൊണ്ടിരുന്നെങ്കിൽ മാത്രമേ വിളക്കിലെ തിരി മങ്ങാതെ കത്തുകയുള്ളൂ. നിരന്തരമായ പ്രാർത്ഥനയുടേയും ധ്യാനത്തിൻ്റെയും ജീവിതത്തിൽ മാത്രമാണ് ദൈവസ്നേഹം കത്തിജ്വലിച്ചു കൊണ്ടിരിക്കുന്നത്.",
  },
  {
    text: "പ്രിയ മക്കളെ നിങ്ങളുടെ ഭവനങ്ങളിൽ വൈകുന്നേരം വിളക്കുകൾ കത്തിക്കുന്നതിനോടൊപ്പം നിങ്ങളുടെ അധരങ്ങളിൽനിന്നും മാതാവിൻ്റെ മധുരനാമം വിളിച്ചുകൊണ്ടുള്ള പ്രാർത്ഥനയും സ്വർഗ്ഗത്തിലേക്ക് ഉയർന്നുകൊണ്ടിരിക്കട്ടെ!",
  },
];

function shuffledIndices(length: number) {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

const AUTO_ADVANCE_MS = 15_000;

export default function QuotesMessagesSection() {
  const { lang } = useLang();

  const [order, setOrder] = useState(() => Array.from({ length: QUOTES.length }, (_, i) => i));
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeIndex = order[pos] ?? 0;
  const activeQuote = QUOTES[activeIndex] ?? QUOTES[0];

  const timeoutRef = useRef<number | null>(null);

  const next = () => {
    setPos((p) => {
      const nextPos = p + 1;
      if (nextPos < order.length) return nextPos;

      const reshuffled = shuffledIndices(QUOTES.length);
      // Avoid immediate repeat when reshuffling.
      if (reshuffled[0] === order[order.length - 1] && reshuffled.length > 1) {
        [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
      }
      setOrder(reshuffled);
      return 0;
    });
  };

  const prev = () => {
    setPos((p) => (p - 1 + order.length) % order.length);
  };

  useEffect(() => {
    // Randomize after mount to keep server/client HTML deterministic.
    setOrder(shuffledIndices(QUOTES.length));
    setPos(0);
  }, []);

  useEffect(() => {
    if (paused) return;

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(next, AUTO_ADVANCE_MS);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, pos, order.length]);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-stone-100" id="spiritual-messages">
      {/* The Diagonal "Cross" Background Effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Main background color */}
        <div className="absolute inset-0 bg-stone-100"></div>
        
        {/* Diagonal Cross Shape matching the image */}
        <div className="absolute top-0 left-0 w-full h-[60%] sm:h-[80%] bg-gradient-to-r from-accent to-rose-900 origin-top-left -skew-y-[12deg] transform -translate-y-20 shadow-xl"></div>
        
        {/* Bottom Diagonal Shape for balance (optional, based on the image style) */}
        <div className="absolute bottom-0 right-0 w-full h-[40%] bg-gradient-to-r from-rose-900 to-accent origin-bottom-right -skew-y-[12deg] transform translate-y-20 shadow-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md mb-4">
            {lang === 'en' ? 'Quotes & Messages' : 'ഉദ്ധരണികളും സന്ദേശങ്ങളും'}
          </h2>
          <p className="text-sm sm:text-base text-white/90 font-medium max-w-3xl mx-auto drop-shadow-sm">
            {lang === 'en'
              ? 'Reflections to read and revisit.'
              : 'വായിച്ചും വീണ്ടും ഓർത്തും മനസിലാക്കാൻ ഉള്ള ചിന്തകൾ.'}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative px-4 sm:px-10">
          <div
            className="bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
              const nextTarget = e.relatedTarget as Node | null;
              if (nextTarget && e.currentTarget.contains(nextTarget)) return;
              setPaused(false);
            }}
          >
            {/* Top Left Quote Icon matching the image */}
            <div className="absolute top-6 left-6 sm:top-10 sm:left-10 text-[#222222]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 sm:w-14 sm:h-14">
                <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
              </svg>
            </div>

            <div className="px-8 sm:px-20 pt-24 pb-16 min-h-[300px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeIndex}-${pos}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="w-full"
                >
                  <p
                    className="font-ml text-stone-900 leading-relaxed text-base sm:text-lg whitespace-pre-line text-center"
                    lang="ml"
                  >
                    {activeQuote?.text}
                  </p>
                  {activeQuote?.source ? (
                    <p className="mt-4 text-xs sm:text-sm text-stone-600 text-center italic">
                      {activeQuote.source}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Square Navigation Buttons overlapping the edges like the image */}
          <button
            type="button"
            onClick={prev}
            className="absolute top-1/2 left-4 sm:left-10 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-[#222222] text-white flex items-center justify-center hover:bg-accent transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            aria-label={lang === 'en' ? 'Previous quote' : 'മുൻപത്തെ ഉദ്ധരണം'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={next}
            className="absolute top-1/2 right-4 sm:right-10 translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-[#222222] text-white flex items-center justify-center hover:bg-accent transition-colors shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
            aria-label={lang === 'en' ? 'Next quote' : 'അടുത്ത ഉദ്ധരണം'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
