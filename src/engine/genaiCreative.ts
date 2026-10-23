import { GenAiCreativeDraft } from '@/types';

export interface GenAiInputParams {
  brandName?: string;
  brief: string;
  category?: string;
  targetSegment?: string;
  discountPercent?: number;
  language?: 'EN' | 'ES' | 'AR' | 'HI';
}

interface CreativeTemplate {
  keywords: string[];
  category: string;
  accentColor: string;
  imageUrl: string;
  content: Record<'EN' | 'ES' | 'AR' | 'HI', {
    headline: string;
    subheadline: string;
    callToAction: string;
    badgeText: string;
  }>;
}

const TEMPLATES: CreativeTemplate[] = [
  {
    keywords: ['sweet', 'candy', 'chocolate', 'family', 'festive', 'kid'],
    category: 'Confectionery & Family',
    accentColor: '#f59e0b', // Amber/Orange
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1200&q=80',
    content: {
      EN: {
        headline: 'Sweeten Your Flight! Artisanal Confections & Treat Bags.',
        subheadline: 'Handmade pralines, caramel popcorn & kid packs 30 steps from Gate 42.',
        callToAction: 'Claim Family 20% Discount',
        badgeText: 'FAMILY HOLIDAY SPECIAL',
      },
      ES: {
        headline: '¡Endulza tu Vuelo! Dulces Artesanales y Paquetes Familiares.',
        subheadline: 'Pralinés hechos a mano, palomitas de caramelo y cajas para niños en la Puerta 42.',
        callToAction: 'Reclamar 20% de Descuento Familiar',
        badgeText: 'ESPECIAL VACACIONES EN FAMILIA',
      },
      AR: {
        headline: 'حلّي رحلتك! حلويات يدوية فاخرة وباقات مميزة للأطفال.',
        subheadline: 'شوكولاتة حرفية وفشار كراميل طازج على بعد ٣٠ خطوة من البوابة ٤٢.',
        callToAction: 'احصل على خصم العائلة ٢٠٪',
        badgeText: 'عرض العطلات العائلي',
      },
      HI: {
        headline: 'अपनी उड़ान को मीठा बनाएं! हस्तनिर्मित स्वादिष्ट मिठाइयाँ।',
        subheadline: 'ताज़ा चॉकलेट और बच्चों के स्नैक्स गेट 42 के बिल्कुल पास उपलब्ध।',
        callToAction: '20% फैमिली छूट प्राप्त करें',
        badgeText: 'विशेष पारिवारिक उपहार',
      },
    },
  },
  {
    keywords: ['coffee', 'breakfast', 'espresso', 'pastry', 'delay', 'wait', 'snack'],
    category: 'Grab & Go F&B',
    accentColor: '#e11d48', // Crimson/Rose
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    content: {
      EN: {
        headline: 'Delayed or In Transit? Sip Freshly Roasted Artisan Coffee.',
        subheadline: 'Signature flat whites, hot brioche sandwiches & almond croissants prepared fresh.',
        callToAction: 'Redeem Flight Voucher (20% Off)',
        badgeText: 'GATE DELAY CARE SPECIAL',
      },
      ES: {
        headline: '¿Vuelo Retrasado? Disfruta un Café de Especialidad Recién Tostado.',
        subheadline: 'Flat whites de autor, sándwiches calientes en pan brioche y croissants recién horneados.',
        callToAction: 'Canjear Cupón de Vuelo (20% Dcto)',
        badgeText: 'ESPECIAL POR DEMORA DE VUELO',
      },
      AR: {
        headline: 'رحلتك متأخرة؟ استمتع بقهوة مختصة طازجة ومعجنات ساخنة.',
        subheadline: 'فلات وايت مميز وسندويشات بريوش طازجة مخبوزة على بعد خطوات من بوابتك.',
        callToAction: 'استبدل قسيمة التأخير (خصم ٢٠٪)',
        badgeText: 'عرض خاص لركاب الرحلات المتأخرة',
      },
      HI: {
        headline: 'फ्लाइट में देरी? ताज़ी कॉफ़ी और स्वादिष्ट स्नैक्स का आनंद लें।',
        subheadline: 'हैंडक्राफ्टेड एस्प्रेसो और गर्म क्रोइसैन गेट के ठीक सामने उपलब्ध।',
        callToAction: '20% छूट वाउचर भुनाएं',
        badgeText: 'फ्लाइट डिले केयर स्पेशल',
      },
    },
  },
  {
    keywords: ['luxury', 'watch', 'duty free', 'perfume', 'jewel', 'fragrance', 'rolex'],
    category: 'Haute Horlogerie & Fragrance',
    accentColor: '#eab308', // Gold
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    content: {
      EN: {
        headline: 'Tax-Free Haute Horlogerie & Rare Private Reserve Scents.',
        subheadline: 'Preview limited edition timepieces and prestige parfums at Metropolis Duty Free.',
        callToAction: 'Visit Concourse Luxury Vault',
        badgeText: 'PRESTIGE TAX-FREE SELECTION',
      },
      ES: {
        headline: 'Alta Relojería Libre de Impuestos y Perfumería Exclusiva.',
        subheadline: 'Descubra piezas de edición limitada y fragancias de colección en Duty Free.',
        callToAction: 'Visitar Boutique de Lujo',
        badgeText: 'SELECCIÓN EXCLUSIVA TAX-FREE',
      },
      AR: {
        headline: 'ساعات سويسرية فاخرة وعطور نادرة معفاة من الرسوم الجمركية.',
        subheadline: 'استكشف تشكيلات حصرية وإصدارات محدودة في متجر السوق الحرة الرئيسي.',
        callToAction: 'زر جناح النخبة في المبنى ١',
        badgeText: 'مجموعة فاخرة معفاة من الضرائب',
      },
      HI: {
        headline: 'टैक्स-फ्री लक्ज़री घड़ियाँ और विशेष अंतर्राष्ट्रीय परफ्यूम।',
        subheadline: 'मेट्रोपोलिस ड्यूटी फ्री में विश्व प्रसिद्ध ब्रांड्स का अनूठा संग्रह।',
        callToAction: 'लक्ज़री बुटीक में पधारें',
        badgeText: 'टैक्स-फ्री प्रीमियम संग्रह',
      },
    },
  },
  {
    keywords: ['tech', 'audio', 'headphone', 'gadget', 'noise', 'bose', 'sony'],
    category: 'Consumer Electronics & Travel Tech',
    accentColor: '#3b82f6', // Electric Blue
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    content: {
      EN: {
        headline: 'Silence the Jet Engines. Noise-Canceling Travel Audio.',
        subheadline: 'Experience 30-hour spatial sound engineered for ultra long-haul cross-continental comfort.',
        callToAction: 'Test Interactive Audio Display',
        badgeText: 'INMOTION TECH DEMO',
      },
      ES: {
        headline: 'Silencia los Motores del Avión. Audio con Cancelación Activa de Ruido.',
        subheadline: 'Sonido espacial de 30 horas diseñado para viajes intercontinentales de máximo confort.',
        callToAction: 'Probar Unidad de Demostración',
        badgeText: 'DEMO DE TECNOLOGÍA EN VIVO',
      },
      AR: {
        headline: 'اعزل ضجيج المحركات! سماعات سفر متطورة مع إلغاء تام للضوضاء.',
        subheadline: 'صوت مكاني مذهل وبطارية تدوم ٣٠ ساعة لتجربة سفر هادئة ومريحة.',
        callToAction: 'جرّب وحدة الصوت التفاعلية',
        badgeText: 'تجربة تقنية حصرية',
      },
      HI: {
        headline: 'शांत और आरामदायक सफर! एक्टिव नॉइज़ कैंसलेशन हेडफोन्स।',
        subheadline: '30 घंटे की लंबी बैटरी लाइफ और बेजोड़ साउंड क्वालिटी के साथ।',
        callToAction: 'ऑडियो डेमो टेस्ट करें',
        badgeText: 'प्रीमियम ट्रैवल टेक',
      },
    },
  },
  {
    keywords: ['beach', 'resort', 'vacation', 'maldives', 'hotel', 'escape', 'island'],
    category: 'Travel & Resorts',
    accentColor: '#06b6d4', // Cyan
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
    content: {
      EN: {
        headline: 'Your Private Island Sanctuary. Turquoise Water Villas.',
        subheadline: 'Flyside reservations for Maldives, Cancún & Phuket with complimentary seaplane transfer.',
        callToAction: 'Reserve Flightside Sanctuary Pass',
        badgeText: 'TROPICAL ESCAPE PRIVILEGE',
      },
      ES: {
        headline: 'Tu Santuario en una Isla Privada. Villas sobre Aguas Turquesas.',
        subheadline: 'Reservas exclusivas para Maldivas, Cancún y Phuket con traslado en hidroavión incluido.',
        callToAction: 'Reservar Pase Exclusivo de Playa',
        badgeText: 'PRIVILEGIO DE ESCAPADA TROPICAL',
      },
      AR: {
        headline: 'ملاذك الخاص فوق المياه الفيروزية الساحرة في جزر المالديف.',
        subheadline: 'حجوزات حصرية ومباشرة من المطار مع تنقل مجاني بالطائرة المائية وخدمة الخادم الشخصي.',
        callToAction: 'احجز باقتك الفاخرة الآن',
        badgeText: 'عرض الملاذ الاستوائي الفاخر',
      },
      HI: {
        headline: 'आपका निजी ड्रीम रिसॉर्ट! शांत नीले समंदर के बीच विला।',
        subheadline: 'मालदीव और फुकेत के लिए विशेष फ्लाइटसाइड बुकिंग और सी-प्लेन ट्रांसफर।',
        callToAction: 'हॉलिडे पास अभी बुक करें',
        badgeText: 'विशेष ट्रॉपिकल वैकेशन ऑफर',
      },
    },
  },
];

/**
 * GenAI Creative Synthesis Engine
 * Fast, deterministic, template-driven natural language brief synthesizer
 */
export function generateCreativeDraft(params: GenAiInputParams): GenAiCreativeDraft {
  const briefLower = params.brief.toLowerCase();
  const lang: 'EN' | 'ES' | 'AR' | 'HI' = params.language || 'EN';
  const discount = params.discountPercent || 20;

  // Find best template matching prompt keywords
  let bestTemplate = TEMPLATES[0];
  let maxMatches = -1;

  for (const t of TEMPLATES) {
    let matches = 0;
    for (const kw of t.keywords) {
      if (briefLower.includes(kw)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestTemplate = t;
    }
  }

  const selectedContent = bestTemplate.content[lang] || bestTemplate.content.EN;
  const brandName = params.brandName || 'Metropolis Merchant';
  const promoCode = `${brandName.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase()}${discount}`;

  // Calculate fit score and demographic affinity reasoning
  let fitScore = 88;
  let audienceReasoning = `High demographic alignment for upcoming flights at Gate 42. Campaign profile targets high dwell passengers with a ${discount}% conversion concession incentive.`;

  if (bestTemplate.category.includes('Family') || bestTemplate.category.includes('Confectionery')) {
    fitScore = 92;
    audienceReasoning = 'Matches leisure & family composition on SunVacation flight ZQ88 (holiday share 76%, family 12%). Projected +42% CTR uplift over generic ads.';
  } else if (bestTemplate.category.includes('F&B')) {
    fitScore = 96;
    audienceReasoning = 'Optimal fit for delayed flight XY501 (45 min holdroom delay). Delay surge multiplier (+85%) activates immediately for passengers awaiting departure.';
  } else if (bestTemplate.category.includes('Haute Horlogerie')) {
    fitScore = 90;
    audienceReasoning = 'High business demographic match (48% business, 88% international) departing to luxury hub Dubai (DXB). Strong purchasing power fit.';
  }

  return {
    headline: selectedContent.headline,
    subheadline: selectedContent.subheadline,
    callToAction: selectedContent.callToAction,
    badgeText: selectedContent.badgeText,
    promoCode,
    accentColor: bestTemplate.accentColor,
    imageUrl: bestTemplate.imageUrl,
    language: lang,
    fitScore,
    audienceReasoning,
    discountPercent: discount,
    localizedContent: bestTemplate.content,
  };
}

export const GENAI_STARTER_PROMPTS = [
  'Festive sweets, 20% off, families flying domestic',
  'Executive noise-canceling headphones, business frequent flyers',
  'Grab & go artisan espresso & breakfast sandwich, delayed travelers',
  'Luxury Swiss horology & fragrance tax-free, international long-haul',
  'Maldives azure overwater villa retreat, couples & honeymooners',
];

export const STARTER_PROMPTS = GENAI_STARTER_PROMPTS;
