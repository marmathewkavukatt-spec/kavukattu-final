"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLang } from "@/context/LangContext";
import { useAutoTranslate } from "@/components/AutoTranslate";

const administrators = [
  {
    id: 1,
    name: "Mar Thomas Tharayil",
    designation: "Metropolitan Archbishop",
    image: "/uploads/admins/admin1.png",
  },
  {
    id: 2,
    name: "Fr. Kanniyakonil Scaria",
    designation: "Syncellus",
    image: "/uploads/admins/admin3.jpg",
  },
  {
    id: 3,
    name: "Fr. Maleckal Antony",
    designation: "Procurator",
    image: "/uploads/admins/admin5.jpg",
  },
  {
    id: 4,
    name: "Fr. Alencherry Joseph",
    designation: "Postulator",
    image: "/uploads/admins/admin2.jpg",
  },
  {
    id: 5,
    name: "Fr. John Plathanam",
    designation: "Vice Postulator",
    image: "/uploads/admins/admin4.jpg",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AdministratorsSection() {
  const { lang } = useLang();

  // Use real-time translation for all text
  const administratorsTitle = useAutoTranslate("Our Administrators");
  const administratorsSubtitle = useAutoTranslate("Meet the dedicated leaders guiding our spiritual mission");
  
  // Administrator names with real-time translation
  const marThomasName = useAutoTranslate("Mar Thomas Tharayil");
  const frScariaName = useAutoTranslate("Fr. Kanniyakonil Scaria");
  const frAntonyName = useAutoTranslate("Fr. Maleckal Antony");
  const frJosephName = useAutoTranslate("Fr. Alencherry Joseph");
  const frJohnName = useAutoTranslate("Fr. John Plathanam");
  
  // Designations with real-time translation
  const metropolitanArchbishop = useAutoTranslate("Metropolitan Archbishop");
  const syncellus = useAutoTranslate("Syncellus");
  const procurator = useAutoTranslate("Procurator");
  const postulator = useAutoTranslate("Postulator");
  const vicePostulator = useAutoTranslate("Vice Postulator");

  // Get translated names and designations
  const getTranslatedName = (name: string) => {
    switch (name) {
      case "Mar Thomas Tharayil": return marThomasName;
      case "Fr. Kanniyakonil Scaria": return frScariaName;
      case "Fr. Maleckal Antony": return frAntonyName;
      case "Fr. Alencherry Joseph": return frJosephName;
      case "Fr. John Plathanam": return frJohnName;
      default: return name;
    }
  };

  const getTranslatedDesignation = (designation: string) => {
    switch (designation) {
      case "Metropolitan Archbishop": return metropolitanArchbishop;
      case "Syncellus": return syncellus;
      case "Procurator": return procurator;
      case "Postulator": return postulator;
      case "Vice Postulator": return vicePostulator;
      default: return designation;
    }
  };

  const [mainAdmin, ...otherAdmins] = administrators;

  return (
    <section id="administrators" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20">
      {/* Logo Background with Opacity */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.025]">
          <Image
            src="/uploads/logo.jpg"
            alt="Background Logo"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 z-10">
        {/* Title */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-6 ${lang === 'ml' ? 'font-ml' : 'font-serif'}`}
          >
            {administratorsTitle}
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className={`text-base md:text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed ${lang === 'ml' ? 'font-ml' : ''}`}
          >
            {administratorsSubtitle}
          </motion.p>
        </motion.div>

        {/* Main Administrator - Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col items-center gap-8 p-8 sm:p-12 md:flex-row md:items-center">
              {/* Image with soft glow */}
              <div className="relative shrink-0">
                <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl blur-xl"></div>
                <div className="relative h-72 w-72 md:h-80 md:w-80 overflow-hidden rounded-2xl bg-stone-200 shadow-xl">
                  <Image
                    src={mainAdmin.image}
                    alt={getTranslatedName(mainAdmin.name)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 288px, 320px"
                    quality={85}
                    unoptimized
                    priority
                  />
                </div>
              </div>
              
              {/* Text Content */}
              <div className="flex flex-col items-center text-center md:items-start md:text-left md:pl-8 flex-1">
                <div className="w-16 h-1 bg-accent/40 mb-6 md:ml-0"></div>
                
                <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-accent uppercase leading-tight mb-4 ${lang === 'ml' ? 'font-ml' : 'font-serif'}`}>
                  {getTranslatedName(mainAdmin.name)}
                </h3>
                
                <p className={`text-base sm:text-lg font-semibold uppercase text-stone-600 mb-6 ${lang === 'ml' ? 'font-ml tracking-wide' : 'tracking-[0.2em]'}`}>
                  {getTranslatedDesignation(mainAdmin.designation)}
                </p>

                {/* Decorative element */}
                <div className="flex items-center gap-2 text-accent/60">
                  <div className="w-2 h-2 rounded-full bg-accent/60"></div>
                  <div className="w-8 h-px bg-accent/40"></div>
                  <div className="w-2 h-2 rounded-full bg-accent/60"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Administrators - Elegant Grid */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {otherAdmins.map((admin) => (
            <motion.div
              key={admin.id}
              variants={fadeInUp}
              className="group relative flex flex-col items-center overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm p-6 pb-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
            >
              {/* Image with hover effect */}
              <div className="relative mb-6">
                <div className="absolute -inset-2 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative h-48 w-48 overflow-hidden rounded-xl bg-stone-200 shadow-md transition-all">
                  <Image
                    src={admin.image}
                    alt={getTranslatedName(admin.name)}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="192px"
                    quality={75}
                    unoptimized
                  />
                </div>
              </div>
              
              {/* Decorative divider */}
              <div className="w-12 h-px bg-accent/30 mb-4"></div>
              
              <h3 className={`text-lg sm:text-xl font-bold text-accent uppercase leading-tight mb-3 px-2 ${lang === 'ml' ? 'font-ml' : 'font-serif'}`}>
                {getTranslatedName(admin.name)}
              </h3>
              
              <p className={`text-xs font-semibold uppercase text-stone-600 px-2 ${lang === 'ml' ? 'font-ml tracking-wide' : 'tracking-[0.15em]'}`}>
                {getTranslatedDesignation(admin.designation)}
              </p>
              
              {/* Bottom decorative element */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent/60"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent/40"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

