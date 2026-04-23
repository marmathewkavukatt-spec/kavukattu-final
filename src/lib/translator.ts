// Real-time translation service
interface TranslationCache {
  [key: string]: string;
}

class TranslationService {
  private cache: TranslationCache = {};
  private apiKey: string | null = null;

  constructor() {
    // Get API key from environment variables
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY || null;
  }

  // Generate cache key
  private getCacheKey(text: string, targetLang: string): string {
    return `${text}_${targetLang}`;
  }

  // Clean text for translation (remove HTML, extra spaces)
  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Check if text needs translation (contains English characters)
  private needsTranslation(text: string, targetLang: string): boolean {
    if (targetLang === 'en') return false;
    
    // Check if text contains English letters
    const englishPattern = /[a-zA-Z]/;
    return englishPattern.test(text);
  }

  // Translate using Google Translate API
  async translateWithAPI(text: string, targetLang: string): Promise<string> {
    if (!this.apiKey) {
      console.warn('Google Translate API key not found');
      return text;
    }

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLang,
            source: 'en',
            format: 'text'
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation API error:', error);
      return text; // Return original text on error
    }
  }

  // Fallback translation using browser's built-in translation
  async translateWithBrowser(text: string, targetLang: string): Promise<string> {
    // This is a fallback method using a simple translation map
    // You can expand this with more translations or use a different service
    
    if (targetLang !== 'ml') return text;

    // Basic translation map for common words/phrases
    const translationMap: { [key: string]: string } = {
      // Common UI elements
      'Home': 'ഹോം',
      'About': 'കുറിച്ച്',
      'History': 'ചരിത്രം',
      'Gallery': 'ഗാലറി',
      'Contact': 'ബന്ധപ്പെടുക',
      'News': 'വാർത്തകൾ',
      'Events': 'പരിപാടികൾ',
      'Announcements': 'അറിയിപ്പുകൾ',
      'Read More': 'കൂടുതൽ വായിക്കുക',
      'View All': 'എല്ലാം കാണുക',
      'Learn More': 'കൂടുതൽ അറിയുക',
      
      // Common phrases
      'Welcome': 'സ്വാഗതം',
      'Thank you': 'നന്ദി',
      'Please': 'ദയവായി',
      'Yes': 'അതെ',
      'No': 'ഇല്ല',
      
      // Religious terms
      'Prayer': 'പ്രാർത്ഥന',
      'Church': 'പള്ളി',
      'Mass': 'കുർബാന',
      'Holy': 'വിശുദ്ധ',
      'Saint': 'വിശുദ്ധൻ',
      'Father': 'ഫാദർ',
      'Bishop': 'ബിഷപ്പ്',
      'Archbishop': 'ആർച്ച് ബിഷപ്പ്',
    };

    // Check for exact matches first
    if (translationMap[text]) {
      return translationMap[text];
    }

    // Check for partial matches
    let translatedText = text;
    Object.entries(translationMap).forEach(([english, malayalam]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, malayalam);
    });

    return translatedText;
  }

  // Main translation method
  async translate(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;
    if (!this.needsTranslation(text, targetLang)) return text;

    const cleanedText = this.cleanText(text);
    const cacheKey = this.getCacheKey(cleanedText, targetLang);

    // Check cache first
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    let translatedText: string;

    // Try API translation first, fallback to browser translation
    if (this.apiKey) {
      translatedText = await this.translateWithAPI(cleanedText, targetLang);
    } else {
      translatedText = await this.translateWithBrowser(cleanedText, targetLang);
    }

    // Cache the result
    this.cache[cacheKey] = translatedText;
    return translatedText;
  }

  // Batch translation for multiple texts
  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    const promises = texts.map(text => this.translate(text, targetLang));
    return Promise.all(promises);
  }

  // Clear cache
  clearCache(): void {
    this.cache = {};
  }
}

// Create singleton instance
export const translator = new TranslationService();

// Hook for easy use in components
export function useTranslator() {
  return {
    translate: translator.translate.bind(translator),
    translateBatch: translator.translateBatch.bind(translator),
    clearCache: translator.clearCache.bind(translator),
  };
}