"use client";

import { useLang } from "@/context/LangContext";
import { t } from "@/lib/translations";

const STATIC_HISTORY = {
  priestImage: "/uploads/ABOUT SECTION IMAGE.png",
  description: {
    en: `Mar Mathew Kavukatt (1904–1969) was a pioneering leader of the Syro-Malabar Church and the first Archbishop of Changanacherry. Born on 17 July 1904 in Pravithanam, near Palai, he was the son of Chummar and Tresa of the Kavukatt family from Anthinadu.

He began his education at the local school in Anthinadu and later studied at St. Thomas High School, Pala. After completing his schooling in 1923, he continued his higher studies at St. Berchmans College, Changanacherry, and later in Trivandrum, graduating in 1927.

Responding to his call to priesthood, he entered St. Thomas Minor Seminary, Kottayam, in 1928 and continued his formation at the Major Seminary in Aluva. He was ordained a priest on 21 December 1935 by Bishop Kalacherry and celebrated his first Holy Mass shortly afterward in his home parish. Over the next fifteen years, he served the Church in various roles, including pastor, educator, and administrator.

On 9 November 1950, he was consecrated as a bishop in Rome. He assumed leadership of the Diocese of Changanacherry on 3 January 1951, choosing the motto "Caritate Servire" ("To serve with love"). When the diocese was elevated to an archdiocese in 1956, he became its first Archbishop.

Archbishop Kavukatt played a significant role during a crucial period in Kerala's history, particularly in guiding the faithful during socio-political challenges and contributing to movements that protected the rights of minority communities. His leadership was recognized internationally, including by Pope John XXIII during a meeting in 1960.

Marking the silver jubilee of his priesthood (1959–1960), he encouraged initiatives for social welfare, especially housing projects for the poor. His concern for the marginalized remained central to his ministry. He also took active part in major events of the universal Church, including the Second Vatican Council and the Eucharistic Congress held in Bombay.

Despite declining health and undergoing major surgery in Germany, he continued his pastoral mission with dedication, especially serving the poor and suffering. His compassion was often reflected in his desire that no one in need should be left unattended.

He passed away on 9 October 1969. In recognition of his holy life and service, he was declared Servant of God on 25 September 1994, and his cause for canonization had been initiated earlier in 1991.`,
    ml: `മാർ മാത്യു കാവുകാട്ട് (1904-1969) സീറോ-മലബാർ സഭയുടെ പയനിയറിംഗ് നേതാവും ചങ്ങനാശ്ശേരിയുടെ ആദ്യ ആർച്ച് ബിഷപ്പുമായിരുന്നു. 1904 ജൂലൈ 17-ന് പാലയ്ക്ക് സമീപം പ്രവിത്താനത്തിൽ ജനിച്ച അദ്ദേഹം അന്തിനാട്ടിലെ കാവുകാട്ട് കുടുംബത്തിലെ ചുമ്മറിന്റെയും തെരേസയുടെയും മകനായിരുന്നു.

അന്തിനാട്ടിലെ പ്രാദേശിക സ്കൂളിൽ വിദ്യാഭ്യാസം ആരംഭിച്ച അദ്ദേഹം പിന്നീട് പാലാ സെന്റ് തോമസ് ഹൈസ്കൂളിൽ പഠിച്ചു. 1923-ൽ സ്കൂൾ വിദ്യാഭ്യാസം പൂർത്തിയാക്കിയ ശേഷം, സെന്റ് ബെർച്ച്മാൻസ് കോളേജ്, ചങ്ങനാശ്ശേരിയിലും പിന്നീട് തിരുവനന്തപുരത്തും ഉന്നത വിദ്യാഭ്യാസം തുടർന്നു, 1927-ൽ ബിരുദം നേടി.

പൗരോഹിത്യത്തിലേക്കുള്ള തന്റെ വിളിയോട് പ്രതികരിച്ച്, 1928-ൽ കോട്ടയം സെന്റ് തോമസ് മൈനർ സെമിനാരിയിൽ പ്രവേശിച്ച അദ്ദേഹം ആലുവയിലെ മേജർ സെമിനാരിയിൽ തന്റെ രൂപീകരണം തുടർന്നു. 1935 ഡിസംബർ 21-ന് ബിഷപ്പ് കലച്ചേരി അദ്ദേഹത്തെ പുരോഹിതനായി നിയമിച്ചു, താമസിയാതെ തന്റെ ഇടവക പള്ളിയിൽ ആദ്യ വിശുദ്ധ കുർബാന ആഘോഷിച്ചു. അടുത്ത പതിനഞ്ച് വർഷം, ഇടയൻ, അധ്യാപകൻ, ഭരണാധികാരി എന്നിവയുൾപ്പെടെ വിവിധ റോളുകളിൽ സഭയെ സേവിച്ചു.

1950 നവംബർ 9-ന് റോമിൽ ബിഷപ്പായി പ്രതിഷ്ഠിക്കപ്പെട്ടു. 1951 ജനുവരി 3-ന് ചങ്ങനാശ്ശേരി രൂപതയുടെ നേതൃത്വം ഏറ്റെടുത്തു, "കാരിറ്റേറ്റ് സെർവൈർ" ("സ്നേഹത്തോടെ സേവിക്കാൻ") എന്ന മുദ്രാവാക്യം തിരഞ്ഞെടുത്തു. 1956-ൽ രൂപത ഒരു അതിരൂപതയായി ഉയർത്തപ്പെട്ടപ്പോൾ, അദ്ദേഹം അതിന്റെ ആദ്യ ആർച്ച് ബിഷപ്പായി.

കേരളത്തിന്റെ ചരിത്രത്തിലെ നിർണായക കാലഘട്ടത്തിൽ ആർച്ച് ബിഷപ്പ് കാവുകാട്ട് ഒരു പ്രധാന പങ്ക് വഹിച്ചു, പ്രത്യേകിച്ച് സാമൂഹിക-രാഷ്ട്രീയ വെല്ലുവിളികളിൽ വിശ്വാസികളെ നയിക്കുന്നതിലും ന്യൂനപക്ഷ സമുദായങ്ങളുടെ അവകാശങ്ങൾ സംരക്ഷിക്കുന്ന പ്രസ്ഥാനങ്ങൾക്ക് സംഭാവന നൽകുന്നതിലും. 1960-ൽ പോപ്പ് ജോൺ XXIII-മായുള്ള കൂടിക്കാഴ്ച ഉൾപ്പെടെ അദ്ദേഹത്തിന്റെ നേതൃത്വം അന്താരാഷ്ട്രതലത്തിൽ അംഗീകരിക്കപ്പെട്ടു.

തന്റെ പൗരോഹിത്യത്തിന്റെ വെള്ളി ജൂബിലി (1959-1960) അടയാളപ്പെടുത്തി, സാമൂഹിക ക്ഷേമത്തിനായുള്ള സംരംഭങ്ങൾ, പ്രത്യേകിച്ച് ദരിദ്രർക്കുള്ള ഭവന പദ്ധതികൾ പ്രോത്സാഹിപ്പിച്ചു. പാർശ്വവത്കരിക്കപ്പെട്ടവരോടുള്ള അദ്ദേഹത്തിന്റെ ഉത്കണ്ഠ അദ്ദേഹത്തിന്റെ ശുശ്രൂഷയുടെ കേന്ദ്രമായി തുടർന്നു. രണ്ടാം വത്തിക്കാൻ കൗൺസിലും ബോംബെയിൽ നടന്ന യൂക്കറിസ്റ്റിക് കോൺഗ്രസും ഉൾപ്പെടെ സാർവത്രിക സഭയുടെ പ്രധാന സംഭവങ്ങളിൽ അദ്ദേഹം സജീവമായി പങ്കെടുത്തു.

ആരോഗ്യം മോശമാവുകയും ജർമ്മനിയിൽ വലിയ ശസ്ത്രക്രിയയ്ക്ക് വിധേയനാവുകയും ചെയ്തിട്ടും, പ്രത്യേകിച്ച് ദരിദ്രരെയും കഷ്ടപ്പെടുന്നവരെയും സേവിക്കുന്നതിൽ അദ്ദേഹം തന്റെ ഇടയ ദൗത്യം സമർപ്പണത്തോടെ തുടർന്നു. ആവശ്യമുള്ള ആരും ശ്രദ്ധിക്കപ്പെടാതെ പോകരുതെന്ന അദ്ദേഹത്തിന്റെ ആഗ്രഹത്തിൽ അദ്ദേഹത്തിന്റെ അനുകമ്പ പലപ്പോഴും പ്രതിഫലിച്ചു.

1969 ഒക്ടോബർ 9-ന് അദ്ദേഹം അന്തരിച്ചു. അദ്ദേഹത്തിന്റെ വിശുദ്ധ ജീവിതത്തിനും സേവനത്തിനും അംഗീകാരമായി, 1994 സെപ്റ്റംബർ 25-ന് അദ്ദേഹത്തെ ദൈവദാസനായി പ്രഖ്യാപിച്ചു, 1991-ൽ അദ്ദേഹത്തിന്റെ വിശുദ്ധരുടെ പട്ടികയിൽ ഉൾപ്പെടുത്താനുള്ള നടപടികൾ ആരംഭിച്ചിരുന്നു.`
  }
};

export default function AboutContent() {
  const { lang } = useLang();
  const tr = t[lang];

  const priestName = tr.priestName;
  const description = STATIC_HISTORY.description[lang];
  const priestImageSrc = STATIC_HISTORY.priestImage;

  return (
    <section className="relative bg-stone-50 overflow-hidden">
      {/* Diagonal Cross Background Effect - Similar to Quotes Section */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Main background color */}
        <div className="absolute inset-0 bg-stone-50"></div>
        
        {/* Diagonal Cross Shape - Top Left to Bottom Right */}
        <div className="absolute top-0 left-0 w-full h-[70%] bg-gradient-to-r from-[#8B1538] to-[#A91D47] origin-top-left -skew-y-[10deg] transform -translate-y-20 shadow-xl opacity-95"></div>
        
        {/* Diagonal Cross Shape - Bottom Right to Top Left */}
        <div className="absolute bottom-0 right-0 w-full h-[50%] bg-gradient-to-r from-[#A91D47] to-[#8B1538] origin-bottom-right -skew-y-[10deg] transform translate-y-20 shadow-xl opacity-95"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12 relative z-20">
          <h1 className="site-page-title mb-6 text-white drop-shadow-md">{tr.history}</h1>
          <p className="site-page-subtitle text-white/90 drop-shadow-sm">{tr.historySubtitle}</p>
        </div>

        <div className="mt-10 relative z-20">
          {/* Image Container - Float on desktop, full width on mobile */}
          <div className="md:float-left md:mr-8 md:mb-6 mb-6 w-full md:w-96 relative z-30">
            <div className="overflow-hidden rounded-xl border border-stone-400 bg-white p-4 shadow-2xl">
              <img
                src={priestImageSrc}
                alt={priestName}
                className="w-full h-auto object-contain"
                loading="eager"
              />
            </div>
          </div>
          
          {/* Content Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 relative z-20">
            <h2 className="site-section-title text-stone-900">{priestName}</h2>
            <p className="mt-4 whitespace-pre-line site-body-text text-justify text-stone-800">{description}</p>
          </div>
          
          {/* Clear float */}
          <div className="clear-both"></div>
        </div>
      </div>
    </section>
  );
}
