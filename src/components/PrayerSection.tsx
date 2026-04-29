'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang } from '@/context/LangContext';
import { motion } from 'framer-motion';
import AutoTranslate from '@/components/AutoTranslate';
import { useAutoTranslate } from '@/components/AutoTranslate';

export default function PrayerSection() {
  const { lang } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Real-time translations
  const prayerTitle = useAutoTranslate("Prayer for Canonization");
  const prayerSubtitle = useAutoTranslate("Join us in prayer for the canonization of our beloved shepherd");
  const devotionalPrayerText = useAutoTranslate("A devotional prayer for the faithful");

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionHeight = rect.height;
      
      const current = windowHeight - rect.top;
      const total = windowHeight + sectionHeight;
      const progress = Math.max(0, Math.min(1, current / total));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section 
      id="prayer"
      ref={sectionRef}
      className="relative py-16 overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 scroll-mt-20"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-accent/20 rotate-45"
          style={{
            transform: `rotate(${45 + scrollProgress * 90}deg) scale(${0.8 + scrollProgress * 0.4})`,
            opacity: 0.3 + scrollProgress * 0.4
          }}
        />
        <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-accent/20 rounded-full"
          style={{
            transform: `scale(${0.7 + scrollProgress * 0.5})`,
            opacity: 0.2 + scrollProgress * 0.5
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6">
            {prayerTitle}
          </h2>
          
          <p className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto">
            {prayerSubtitle}
          </p>
        </motion.div>

        {/* Prayer Card */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden border border-stone-200">
              <div className="relative z-10 flex flex-col">

                  {/* Prayer Text */}
                  <div>
                    <div
                      className="space-y-4 font-ml text-stone-900 leading-relaxed text-sm sm:text-base"
                      lang="ml"
                    >
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-left sm:text-justify"
                      >
                        പിതാവും പുത്രനും പരിശുദ്ധാത്മാവുമായ ത്രിയേക ദൈവമേ, ദൈവസ്നേഹത്തിൻ്റെയും പരസ്നേഹത്തിൻ്റെയും പുതിയ പ്രമാണം ഞങ്ങളെ പഠിപ്പിച്ച ഈശോ മിശിഹായെ അടുത്തുകരിച്ച്, അങ്ങേ മഹത്വത്തിനും ആജഗണങ്ങളിൽ അങ്ങേ ദിവ്യസ്നേഹം പകർന്നു കൊടുക്കുന്നതിനുംവേണ്ടി, ജീവിതകാലം മുഴുവൻ ചെലവഴിച്ച കാവുകാട്ടുപിതാവിന്, വിശുദ്ധിയുടെ കിരീടം നൽകുവാൻ കൃപയുണ്ടാകണമേ.
                      </motion.p>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-left sm:text-justify"
                      >
                        ഞങ്ങളുടെ പിതാവിൽ വിളങ്ങിയിരുന്ന കരുണാർദ്രമായ സ്നേഹവും, വിനയം നിറഞ്ഞ ദീർഘശാന്തതയും, വീരോചിതമായ സഹനവും, സഭാത്മകമായ ചൈതന്യവും, പാവങ്ങളോടുള്ള അനുകമ്പയും ഞങ്ങളിലും വളർന്നുവരുവാൻ അനുഗ്രഹം തരണമേ.
                      </motion.p>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="text-left sm:text-justify"
                      >
                        ഇടയന്മാരുടെ നാഥനായ ദൈവമേ, ജീവിതകാലത്ത് അനേകർക്കാശ്രയവും ആലംബവുമായിരുന്ന ഞങ്ങളുടെ നല്ല ഇടയൻ കാവുകാട്ടുപിതാവിൻ്റെ ജീവിതവിശുദ്ധിയും, അങ്ങേ പക്കലുള്ള മാദ്ധ്യസ്ഥ്യ ശക്തിയും ഏവരും അറിയുവാൻവേണ്ടി ഞങ്ങളപേക്ഷിക്കുന്നതും, കണ്ണുനീരിൻ്റെ താഴ്‌വരയിൽ അലയുന്ന ഞങ്ങൾക്ക് ഏറ്റവും ആവശ്യമായതുമായ.... അനുഗ്രഹം അങ്ങയുടെ വിശ്വസ്തദാസൻ വഴി നൽകി അദ്ദേഹത്തെ മഹത്വപ്പെടുത്തുവാൻ കൃപയുണ്ടാകണമേ.
                      </motion.p>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="text-left sm:text-justify"
                      >
                        ആമ്മേൻ.
                      </motion.p>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="text-left sm:text-justify"
                      >
                        1 സ്വർഗ്ഗ. 1 നന്മ. 1 ത്രിത്വ.
                      </motion.p>
                    </div>
                  </div>

                  {/* Footer */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="mt-6 pt-6 border-t border-stone-200 text-center"
                  >
                    <p className="text-xs sm:text-sm text-stone-600 italic">
                      {devotionalPrayerText}
                    </p>
                  </motion.div>
                </div>
              </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
