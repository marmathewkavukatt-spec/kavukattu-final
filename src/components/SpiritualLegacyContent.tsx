"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";
import { useTranslate } from "@/hooks/useTranslate";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function SpiritualLegacyContent() {
  const { lang } = useLang();
  const tr = t[lang];
  
  const [
    charityTitle,
    charityDescription,
    humilityTitle,
    humilityDescription,
    serviceTitle,
    serviceDescription,
  ] = useTranslate([
    "Charity",
    "A shepherd who saw Christ in the suffering and the poor",
    "Humility",
    "A leader who carried authority with simplicity and gentleness",
    "Service",
    "A life poured out for the Church and its people, without seeking recognition",
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section - Matching other pages */}
      <div className="bg-accent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="site-page-title text-white">
            {tr.spiritualLegacy}
          </h1>
        </div>
      </div>

      {/* Core Values Section */}
      <section className="relative py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
              <div className="inline-block mb-4">
                <span className="text-gold text-sm font-semibold tracking-wider uppercase">Foundation</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-6">
                {tr.coreValues}
              </h2>
              <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
                {tr.coreValuesDescription}
              </p>
            </motion.div>

            {/* Core Values Cards - Colored */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {/* Charity Card */}
              <motion.div 
                variants={fadeInUp}
                className="group relative bg-gradient-to-br from-accent to-accent-dark rounded-xl p-8 lg:p-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-1 bg-gold mb-6"></div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">
                    {charityTitle}
                  </h3>
                  <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                    {charityDescription}
                  </p>
                </div>
              </motion.div>

              {/* Humility Card */}
              <motion.div 
                variants={fadeInUp}
                className="group relative bg-gradient-to-br from-gold-dark to-gold rounded-xl p-8 lg:p-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-1 bg-white/60 mb-6"></div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">
                    {humilityTitle}
                  </h3>
                  <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                    {humilityDescription}
                  </p>
                </div>
              </motion.div>

              {/* Service Card */}
              <motion.div 
                variants={fadeInUp}
                className="group relative bg-gradient-to-br from-stone-700 to-stone-900 rounded-xl p-8 lg:p-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-12 h-1 bg-gold mb-6"></div>
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">
                    {serviceTitle}
                  </h3>
                  <p className="text-white/90 leading-relaxed text-base lg:text-lg">
                    {serviceDescription}
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={fadeInUp}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="bg-accent/5 border-l-4 border-gold rounded-r-xl p-6 lg:p-8">
                <p className="text-stone-700 leading-relaxed text-lg lg:text-xl italic">
                  His ministry was not about position, but about presence — especially among those forgotten by society.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Motto Section */}
      <MottoSection />

      {/* Pastoral Vision */}
      <PastoralVisionSection />

      {/* Heart for the Poor */}
      <HeartForPoorSection />

      {/* Living Inspiration */}
      <LivingInspirationSection />
    </div>
  );
}

// Motto Section Component with Logo Background
function MottoSection() {
  const [
    toServeWithLoveText,
    mottoDescriptionText,
    servireHeadingText,
    servireDescriptionText,
    inText,
    caritateHeadingText,
    caritateDescriptionText,
    mottoConclusionText,
  ] = useTranslate([
    "\"To Serve with Love\"",
    "This was not merely a motto, but the guiding force of his entire life.",
    "Servire (To Serve)",
    "A calling to serve all, especially the least",
    "in",
    "Caritate (Charity)",
    "Love that is active, sacrificial, and Christ-centered",
    "For him, service without love was empty, and love without service was incomplete. He embodied both — quietly, consistently, and completely.",
  ]);

  return (
      <section className="relative py-16 md:py-20 bg-accent overflow-hidden">
        {/* Logo Background with proper opacity for text visibility */}
        <div className="absolute inset-0">
          <Image
            src="/uploads/logo.jpg"
            alt="Background"
            fill
            className="object-cover opacity-[0.16] saturate-0 contrast-125 brightness-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-accent/85 via-accent/80 to-accent-dark/90"></div>
        </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-6">
              <div className="w-20 h-1 bg-gold mx-auto"></div>
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
              Servire in Caritate
            </h2>
             
            <p className="text-xl md:text-2xl mb-6 text-white font-light italic drop-shadow-[0_1px_10px_rgba(0,0,0,0.30)]">
              {toServeWithLoveText}
            </p>
            
            <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-white/95">
              {mottoDescriptionText}
            </p>
          </motion.div>

          {/* 3-col: Servire | in | Caritate */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 max-w-5xl mx-auto mb-12 items-center">
            <motion.div 
              variants={fadeInUp}
              className="bg-white/10 rounded-xl p-8 lg:p-10 border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-10 h-1 bg-gold mb-5"></div>
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">{servireHeadingText}</h3>
              <p className="text-white/95 leading-relaxed text-lg">
                {servireDescriptionText}
              </p>
            </motion.div>

            {/* "in" connector */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-3 py-4 md:py-0"
            >
              <div className="w-px h-8 bg-gold/50 hidden md:block"></div>
              <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg">
                <span className="font-serif text-xl font-bold text-white italic">{inText}</span>
              </div>
              <div className="w-px h-8 bg-gold/50 hidden md:block"></div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white/10 rounded-xl p-8 lg:p-10 border border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-10 h-1 bg-gold mb-5"></div>
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-4">{caritateHeadingText}</h3>
              <p className="text-white/95 leading-relaxed text-lg">
                {caritateDescriptionText}
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm border-l-4 border-gold rounded-r-xl p-6 lg:p-8">
              <p className="text-lg md:text-xl leading-relaxed italic text-white">
                {mottoConclusionText}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Pastoral Vision Section Component
function PastoralVisionSection() {
  const [
    pastoralVisionTitle,
    pastoralVisionSubtitle,
    aChurchText,
    closeToPeopleText,
    notDistantText,
    aChurchOfText,
    compassionText,
    whereSufferingText,
    responsibilityText,
    whereFaithLeadsText,
    faithBeyondWordsText,
  ] = useTranslate([
    "Pastoral Vision",
    "His vision of the Church was clear and deeply human:",
    "A Church",
    "close to the people",
    ", not distant or institutional",
    "A Church of",
    "compassion",
    ", where suffering is seen and responded to",
    "responsibility",
    ", where faith leads to action",
    "He believed that faith must move beyond words — into concrete acts of care, justice, and mercy.",
  ]);

  return (
    <section className="relative py-16 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4">
              <span className="text-gold text-sm font-semibold tracking-wider uppercase">Vision</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-6">
              {pastoralVisionTitle}
            </h2>
            <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
              {pastoralVisionSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12">
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-accent/10 to-accent/5 border-l-4 border-accent rounded-r-xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-6">
                <span className="font-serif text-white font-bold text-sm">I</span>
              </div>
              <p className="text-lg leading-relaxed text-stone-700">
                {aChurchText} <span className="font-bold text-accent">{closeToPeopleText}</span>{notDistantText}
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-gold/10 to-gold/5 border-l-4 border-gold rounded-r-xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center mb-6">
                <span className="font-serif text-white font-bold text-sm">II</span>
              </div>
              <p className="text-lg leading-relaxed text-stone-700">
                {aChurchOfText} <span className="font-bold text-gold-dark">{compassionText}</span>{whereSufferingText}
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-stone-500/10 to-stone-500/5 border-l-4 border-stone-500 rounded-r-xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-stone-500 flex items-center justify-center mb-6">
                <span className="font-serif text-white font-bold text-sm">III</span>
              </div>
              <p className="text-lg leading-relaxed text-stone-700">
                {aChurchOfText} <span className="font-bold text-stone-700">{responsibilityText}</span>{whereFaithLeadsText}
              </p>
            </motion.div>
          </div>

          <motion.div 
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-accent/5 border-l-4 border-gold rounded-r-xl p-6 lg:p-8">
              <p className="text-stone-700 leading-relaxed text-lg md:text-xl italic">
                {faithBeyondWordsText}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Heart for the Poor Section Component — Dark accent background with quote focal point
function HeartForPoorSection() {
  const [
    heartForPoorTitle,
    heartForPoorSubtitle,
    lazarusQuoteText,
    challengeText,
    awarenessTitle,
    awarenessDescription,
    conscienceTitle,
    conscienceDescription,
    actionTitle,
    actionDescription,
    heartForPoorConclusion,
  ] = useTranslate([
    "Heart for the Poor",
    "One of the most powerful expressions of his spirituality was his concern for the marginalized.",
    "\"Let there be no Lazarus at our doorstep whom we fail to notice.\"",
    "This was not just a statement — it was a challenge.",
    "A call to awareness",
    "to see those we often ignore",
    "A call to conscience",
    "to feel responsible for others",
    "A call to action",
    "to respond with love, not indifference",
    "He reminded the faithful that ignoring the poor is not just a social failure — it is a spiritual one.",
  ]);

  return (
    <section className="relative bg-stone-900 overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-accent via-gold to-accent"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-gold text-sm font-semibold tracking-wider uppercase">Compassion</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {heartForPoorTitle}
            </h2>
            <p className="text-lg text-stone-300 max-w-3xl mx-auto leading-relaxed">
              {heartForPoorSubtitle}
            </p>
          </motion.div>

          {/* Central Quote — full-width spotlight */}
          <motion.div
            variants={fadeInUp}
            className="relative max-w-4xl mx-auto mb-12"
          >
            <div className="bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-10 lg:p-14 text-center shadow-2xl">
              <div className="text-gold text-7xl font-serif leading-none mb-4 opacity-60">"</div>
              <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug mb-6">
                {lazarusQuoteText}
              </p>
              <div className="w-16 h-1 bg-gold mx-auto mb-6"></div>
              <p className="text-white/80 text-lg italic">{challengeText}</p>
            </div>
          </motion.div>

          {/* Three calls — horizontal colored strips with enhanced animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-accent/10 border border-accent/30 rounded-xl p-6 hover:bg-accent/20 hover:border-accent/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-8 h-1 bg-accent mb-4"></div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">{awarenessTitle}</h4>
              <p className="text-stone-300 text-sm leading-relaxed">{awarenessDescription}</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gold/10 border border-gold/30 rounded-xl p-6 hover:bg-gold/20 hover:border-gold/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-8 h-1 bg-gold mb-4"></div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">{conscienceTitle}</h4>
              <p className="text-stone-300 text-sm leading-relaxed">{conscienceDescription}</p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-stone-500/10 border border-stone-500/30 rounded-xl p-6 hover:bg-stone-500/20 hover:border-stone-500/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-8 h-1 bg-stone-400 mb-4"></div>
              <h4 className="font-serif text-lg font-bold text-white mb-2">{actionTitle}</h4>
              <p className="text-stone-300 text-sm leading-relaxed">{actionDescription}</p>
            </motion.div>
          </div>

          {/* Conclusion */}
          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <div className="border-l-4 border-gold pl-6 lg:pl-8">
              <p className="text-stone-200 leading-relaxed text-lg md:text-xl italic">
                {heartForPoorConclusion}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-accent via-gold to-accent"></div>
    </section>
  );
}

// Living Inspiration Section Component — Split layout with large numbered items
function LivingInspirationSection() {
  const [
    livingInspirationTitle,
    livingInspirationSubtitle,
    leadersText,
    leadersRestText,
    believersText,
    believersRestText,
    communitiesText,
    communitiesRestText,
    livingInspirationConclusion,
  ] = useTranslate([
    "Living Inspiration",
    "Even today, his life continues to inspire:",
    "Leaders",
    "to serve with humility",
    "Believers",
    "to live their faith through action",
    "Communities",
    "to become places of compassion and inclusion",
    "His legacy is not confined to history — it is a living invitation to love, serve, and care more deeply.",
  ]);

  const items = [
    {
      num: "01",
      title: leadersText,
      desc: leadersRestText,
      bg: "from-accent to-accent-dark",
      contentBg: "bg-accent/5 border-accent/20",
      titleColor: "text-accent",
    },
    {
      num: "02",
      title: believersText,
      desc: believersRestText,
      bg: "from-gold-dark to-gold",
      contentBg: "bg-gold/5 border-gold/20",
      titleColor: "text-gold-dark",
    },
    {
      num: "03",
      title: communitiesText,
      desc: communitiesRestText,
      bg: "from-stone-700 to-stone-900",
      contentBg: "bg-stone-100 border-stone-200",
      titleColor: "text-stone-800",
    },
  ];

  return (
    <section className="relative py-16 md:py-20 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-gold text-sm font-semibold tracking-wider uppercase">Legacy</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-4">
              {livingInspirationTitle}
            </h2>
            <p className="text-lg text-stone-600 max-w-3xl mx-auto leading-relaxed">
              {livingInspirationSubtitle}
            </p>
          </motion.div>

          {/* Large numbered inspiration items */}
          <div className="max-w-5xl mx-auto space-y-4 mb-12">
            {items.map((item) => (
              <motion.div
                key={item.num}
                variants={fadeInUp}
                className="group flex items-stretch gap-0 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Colored number block */}
                <div className={`bg-gradient-to-br ${item.bg} flex flex-col items-center justify-center px-6 py-8 min-w-[90px] md:min-w-[110px]`}>
                  <span className="font-serif text-3xl md:text-4xl font-bold text-white/40 leading-none">{item.num}</span>
                </div>

                {/* Content block — colored bg so text is always visible */}
                <div className={`flex-1 ${item.contentBg} flex flex-col justify-center px-8 py-8 border border-l-0`}>
                  <h3 className={`font-serif text-2xl md:text-3xl font-bold ${item.titleColor} mb-2`}>{item.title}</h3>
                  <p className="text-stone-700 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Closing statement — full accent banner */}
          <motion.div
            variants={fadeInUp}
            className="relative rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="bg-gradient-to-r from-accent via-accent-light to-accent-dark px-8 py-10 lg:px-14 lg:py-12 text-center">
              <div className="w-16 h-1 bg-gold mx-auto mb-6"></div>
              <p className="font-serif text-xl md:text-2xl lg:text-3xl text-white leading-relaxed font-light max-w-4xl mx-auto">
                {livingInspirationConclusion}
              </p>
              <div className="w-16 h-1 bg-gold mx-auto mt-6"></div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
