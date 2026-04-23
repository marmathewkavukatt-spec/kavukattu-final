"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "@/context/LangContext";
import { useAutoTranslate } from "@/components/AutoTranslate";
import Image from "next/image";

interface TimelineEvent {
  year: string;
  title: {
    en: string;
    ml: string;
  };
  description?: {
    en: string;
    ml: string;
  };
  image: string;
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "1904",
    title: {
      en: "Birth (Pravithanam)",
      ml: "ജനനം (പ്രവിത്താനം)",
    },
    description: {
      en: "Born in Pravithanam, beginning a life dedicated to faith and service",
      ml: "വിശ്വാസത്തിനും സേവനത്തിനും സമർപ്പിതമായ ജീവിതം പ്രവിത്താനത്തിൽ ആരംഭിച്ചു"
    },
    image: "/uploads/life journey/birth.png"
  },
  {
    year: "1935",
    title: {
      en: "Ordination",
      ml: "പൗരോഹിത്യ സ്വീകരണം",
    },
    description: {
      en: "Ordained as a priest, embarking on a sacred journey of spiritual leadership",
      ml: "ആത്മീയ നേതൃത്വത്തിന്റെ വിശുദ്ധ യാത്ര ആരംഭിച്ച് പുരോഹിതനായി നിയമിക്കപ്പെട്ടു"
    },
    image: "/uploads/life journey/ordination image.png"
  },
  {
    year: "1950",
    title: {
      en: "Consecration In Rome",
      ml: "റോമിൽ ബിഷപ്പ്",
    },
    description: {
      en: "Elevated to Bishop, serving the Church with wisdom and devotion in Rome",
      ml: "ജ്ഞാനത്തോടും ഭക്തിയോടും കൂടി റോമിൽ സഭയെ സേവിച്ച് ബിഷപ്പായി ഉയർത്തപ്പെട്ടു"
    },
    image: "/uploads/life journey/consecration in rome.png"
  },
  {
    year: "1956",
    title: {
      en: "First Archbishop",
      ml: "ആദ്യ മെത്രാപ്പോലീത്ത",
    },
    description: {
      en: "Appointed as the first Archbishop, a historic milestone in Church history",
      ml: "സഭാചരിത്രത്തിലെ ചരിത്രപരമായ നാഴികക്കല്ല്, ആദ്യ മെത്രാപ്പോലീത്തയായി നിയമിക്കപ്പെട്ടു"
    },
    image: "/uploads/life journey/first archbishop.png"
  },
  {
    year: "1969",
    title: {
      en: "Called To Eternal Rest",
      ml: "നിര്യാണം",
    },
    description: {
      en: "Departed to eternal rest, leaving behind a legacy of faith and compassion",
      ml: "വിശ്വാസത്തിന്റെയും കരുണയുടെയും പാരമ്പര്യം അവശേഷിപ്പിച്ച് നിത്യവിശ്രമത്തിലേക്ക് പോയി"
    },
    image: "/uploads/life journey/eternal rest.png"
  },
  {
    year: "1994",
    title: {
      en: "Declared Servant Of God",
      ml: "ദൈവദാസനായി പ്രഖ്യാപിച്ചു",
    },
    description: {
      en: "Recognized as Servant of God, honoring a life of extraordinary holiness",
      ml: "അസാധാരണമായ വിശുദ്ധിയുടെ ജീവിതത്തെ ആദരിച്ച് ദൈവദാസനായി അംഗീകരിക്കപ്പെട്ടു"
    },
    image: "/uploads/life journey/servant of god.png"
  },
];

// Branch-like Timeline Item Component
function BranchTimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const { lang } = useLang();
  const isLeftText = index % 2 === 0; // Alternating pattern: left text, right image, left image, right text
  const itemRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px", amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="relative"
    >
      
      {/* Branch node (circle) */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.3, delay: index * 0.05 + 0.1, ease: "backOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block"
      >
        <div className="relative">
          <motion.div
            className="w-6 h-6 rounded-full bg-accent border-4 border-white shadow-lg"
            whileHover={{ scale: 1.3 }}
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(139, 92, 246, 0.4)',
                '0 0 0 20px rgba(139, 92, 246, 0)',
                '0 0 0 0 rgba(139, 92, 246, 0)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </div>
      </motion.div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center mb-16 lg:mb-24 ${
        isLeftText ? '' : 'lg:grid-flow-dense'
      }`}>
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: isLeftText ? -30 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, delay: index * 0.05 + 0.1, ease: "easeOut" }}
          className={`${isLeftText ? 'lg:col-start-1 lg:text-right lg:pr-16' : 'lg:col-start-2 lg:text-left lg:pl-16'} relative p-8 sm:p-10`}
        >
          {/* Parallelogram Background Shape */}
          <div className={`absolute inset-0 bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-stone-100 z-0 transition-transform duration-500 hover:scale-[1.02] ${isLeftText ? 'skew-x-[-4deg] lg:skew-x-[-6deg]' : 'skew-x-[4deg] lg:skew-x-[6deg]'}`} />

          <div className="relative z-10 space-y-5">
            {/* Year Badge */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`inline-block ${isLeftText ? 'lg:float-right lg:ml-4' : 'lg:float-left lg:mr-4'}`}
            >
              <div className="relative bg-accent text-white px-6 py-3 rounded-2xl shadow-lg">
                <span className="text-3xl md:text-4xl font-black tracking-tight">{event.year}</span>
              </div>
            </motion.div>

            {/* Title */}
            <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight clear-both pt-2">
              {event.title[lang]}
            </h3>

            {/* Description */}
            {event.description && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.05 + 0.15, ease: "easeOut" }}
                className="text-stone-600 text-base md:text-lg leading-relaxed max-w-xl"
              >
                {event.description[lang]}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: isLeftText ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4, delay: index * 0.05 + 0.1, ease: "easeOut" }}
          className={`${isLeftText ? 'lg:col-start-2' : 'lg:col-start-1'} relative`}
        >
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-stone-100 to-stone-200">
            {/* Image - Using object-contain to show full image */}
            <Image
              src={event.image}
              alt={event.title.en}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Floating shadow effect */}
          <div className="absolute inset-0 -z-10 bg-stone-200/50 rounded-3xl blur-xl transform translate-y-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function TimelineSection() {
  const { lang } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Use real-time translation instead of hardcoded translations
  const lifeJourneyTitle = useAutoTranslate("Life Journey");
  const lifeJourneySubtitle = useAutoTranslate("A sacred journey through the milestones of a life devoted to faith and service");
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"]
  });

  return (
    <section ref={sectionRef} id="timeline" className="relative overflow-hidden bg-stone-50 py-16 scroll-mt-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6">
            {lifeJourneyTitle}
          </h2>
          
          <p className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto">
            {lifeJourneySubtitle}
          </p>
        </motion.div>

        {/* Timeline Items */}
        <div className="relative">
          {/* Animated Continuous Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-stone-200 -translate-x-1/2 hidden lg:block rounded-full" />
          <motion.div 
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-gradient-to-b from-accent to-rose-900 -translate-x-1/2 hidden lg:block z-0 rounded-full"
          />

          {timelineEvents.map((event, index) => (
            <BranchTimelineItem key={index} event={event} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
