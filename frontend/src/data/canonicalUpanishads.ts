/**
 * Canonical 108 Muktika Upanishads Dataset
 * Categorized systematically by Vedic lineage (Rigveda, Shukla Yajurveda, Krishna Yajurveda, Samaveda, Atharvaveda)
 * Source Reference: Muktika Canon & Advaita Ashrama (108-upanishads.pdf)
 */

export type VedicTradition = 
  | 'Rigveda' 
  | 'Shukla Yajurveda' 
  | 'Krishna Yajurveda' 
  | 'Samaveda' 
  | 'Atharvaveda';

export type UpanishadCategory = 
  | 'Mukhya' 
  | 'Samanya' 
  | 'Sannyasa' 
  | 'Yoga' 
  | 'Shaiva' 
  | 'Vaishnava' 
  | 'Shakta';

export interface VedicShantiMantra {
  veda: VedicTradition;
  nameSanskrit: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  essence: string;
}

export interface CanonicalUpanishad {
  id: string;
  muktikaNumber: number;
  pdfIndex: number;
  name: string;
  sanskritName: string;
  veda: VedicTradition;
  category: UpanishadCategory;
  startPage: number;
  endPage: number;
  inDatabase: boolean;
  dbSourceName?: string;
  verseCount?: number;
  summary: string;
}

export const VEDIC_SHANTI_MANTRAS: Record<VedicTradition, VedicShantiMantra> = {
  'Rigveda': {
    veda: 'Rigveda',
    nameSanskrit: 'ऋग्वेद शान्ति मन्त्र (वाङ् मे मनसि)',
    sanskrit: 'ॐ वाङ् मे मनसि प्रतिष्ठिता मनो मे वाचि प्रतिष्ठितमाविरावीर्म एधि ॥ वेदस्य म आणीस्थः श्रुतं मे मा प्रहासीरनेनाधीतेनाहोरात्रान् संदधाम्यूतं वदिष्यामि सत्यं वदिष्यामि ॥ तन्मामवतु तद्वक्तारमवत्ववतु मामवतु वक्तारमवतु वक्तारम् ॥\nॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'oṁ vāṅ me manasi pratiṣṭhitā mano me vāci pratiṣṭhitam āvirāvīrma edhi | vedasya ma āṇīsthaḥ śrutaṁ me mā prahāsīr anenādhītenāhorātrān saṁdadhāmy ṛtaṁ vadiṣyāmi satyaṁ vadiṣyāmi | tan mām avatu tad vaktāram avatv avatu mām avatu vaktāram avatu vaktāram ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
    translation: 'May my speech be established in my mind; may my mind be established in my speech. O Self-effulgent Divine, reveal Thyself to me. May mind and speech bring the highest wisdom of the Vedas to me. Let not what I have heard depart from me. I join days and nights together through contemplation. I shall speak the eternal Law (Rita); I shall speak the Truth (Satya). May That protect me; may That protect the preceptor. Om Peace! Peace! Peace!',
    essence: 'Unity of Mind, Speech and Supreme Truth'
  },
  'Shukla Yajurveda': {
    veda: 'Shukla Yajurveda',
    nameSanskrit: 'शुक्ल यजुर्वेद शान्ति मन्त्र (पूर्णमदः पूर्णमिदम्)',
    sanskrit: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते ।\nपूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते ॥\nॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'oṁ pūrṇam adaḥ pūrṇam idaṁ pūrṇāt pūrṇam udacyate |\npūrṇasya pūrṇam ādāya pūrṇam evāvaśiṣyate ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
    translation: 'That Supreme Brahman is Infinite and Whole; this created manifestation is Infinite and Whole. From the Infinite Whole, the Infinite Whole arises. When the Infinite Whole is taken from the Infinite Whole, the Infinite Whole alone remains. Om Peace! Peace! Peace!',
    essence: 'The Non-Dual Completeness and Infinity of Brahman'
  },
  'Krishna Yajurveda': {
    veda: 'Krishna Yajurveda',
    nameSanskrit: 'कृष्ण यजुर्वेद शान्ति मन्त्र (सह नाववतु)',
    sanskrit: 'ॐ सह नाववतु । सह नौ भुनक्तु ।\nसह वीर्यं करवावहै ।\nतेजस्वि नावधीतमस्तु मा विद्विषावहै ॥\nॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'oṁ saha nāv avatu | saha nau bhunaktu |\nsaha vīryaṁ karavāvahai |\ntejasvi nāv adhītam astu mā vidviṣāvahai ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
    translation: 'May He protect us both together (teacher and seeker). May He nourish us both together. May we acquire spiritual strength together. May our learning be brilliant and illumined. May we never harbor any ill-feeling toward one another. Om Peace! Peace! Peace!',
    essence: 'Harmonious Fellowship and Illumination Between Teacher and Disciple'
  },
  'Samaveda': {
    veda: 'Samaveda',
    nameSanskrit: 'सामवेद शान्ति मन्त्र (आप्यायन्तु ममाङ्गानि)',
    sanskrit: 'ॐ आप्यायन्तु ममाङ्गानि वाक्प्राणश्चक्षुः श्रोत्रमथो बलमिन्द्रियाणि च सर्वाणि ।\nसर्वं ब्रह्मौपनिषदं माहं ब्रह्म निराकुर्यां मा मा ब्रह्म निराकरोदनिराकरणमस्त्वनिराकरणं मेऽस्तु ॥\nतदात्मनि निरते य उपनिषत्सु धर्मास्ते मयि सन्तु ते मयि सन्तु ॥\nॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'oṁ āpyāyantu mamāṅgāni vāk prāṇaś cakṣuḥ śrotram atho balam indriyāṇi ca sarvāṇi |\nsarvaṁ brahmaupaniṣadaṁ māhaṁ brahma nirākuryāṁ mā mā brahma nirākarod anirākaraṇam astv anirākaraṇaṁ me\\\'stu ||\ntad ātmani nirate ya upaniṣatsu dharmās te mayi santu te mayi santu ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
    translation: 'May all my limbs, speech, vital breath, eyes, ears, strength, and all senses grow vigorous. All existence is the Brahman of the Upanishads. May I never deny Brahman, nor may Brahman deny me. Let there be non-denial; let there be steadfast devotion in me. May the virtues celebrated in the Upanishads reside in me, who am devoted to the Self! Om Peace! Peace! Peace!',
    essence: 'Vital Strength, Unbroken Communion and Upanishadic Virtue'
  },
  'Atharvaveda': {
    veda: 'Atharvaveda',
    nameSanskrit: 'अथर्ववेद शान्ति मन्त्र (भद्रं कर्णेभिः)',
    sanskrit: 'ॐ भद्रं कर्णेभिः शृणुयाम देवाः । भद्रं पश्येमाक्षभिर्यजत्राः ।\nस्थिरैरङ्गैस्तुष्टुवांसस्तनूभिर्व्यशेम देवहितं यदायुः ॥\nस्वस्ति न इन्द्रो वृद्धश्रवाः । स्वस्ति नः पूषा विश्ववेदाः ।\nस्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः । स्वस्ति नो बृहस्पतिर्दधातु ॥\nॐ शान्तिः शान्तिः शान्तिः ॥',
    transliteration: 'oṁ bhadraṁ karṇebhiḥ śṛṇuyāma devāḥ | bhadraṁ paśyemākṣabhir yajatrāḥ |\nsthirair aṅgais tuṣṭuvāṁsas tanūbhir vyaśema devahitaṁ yad āyuḥ ||\nsvasti na indro vṛddhaśravāḥ | svasti naḥ pūṣā viśvavedāḥ |\nsvasti nas tārkṣyo ariṣṭanemiḥ | svasti no bṛhaspatir dadhātu ||\noṁ śāntiḥ śāntiḥ śāntiḥ ||',
    translation: 'O Gods, may we hear with our ears what is auspicious; may we see with our eyes what is auspicious, O worshipful ones! With firm limbs and bodies, praising the Divine, may we enjoy the full span of life granted to us by the Gods. May Indra of ancient renown grant us welfare! May the all-knowing Pushan grant us welfare! May Garuda, the guardian of cosmic order, grant us welfare! May Brihaspati protect our well-being! Om Peace! Peace! Peace!',
    essence: 'Auspicious Senses, Reverent Health and Divine Blessings'
  }
};

export const CANONICAL_108_UPANISHADS: CanonicalUpanishad[] = [
  {
    id: 'aitareya-upanishad',
    muktikaNumber: 8,
    pdfIndex: 1,
    name: 'Aitareya Upanishad',
    sanskritName: 'ऐतरेयोपनिषद्',
    veda: 'Rigveda',
    category: 'Mukhya',
    startPage: 7,
    endPage: 14,
    inDatabase: true,
    dbSourceName: 'Aitareya Upanishad',
    verseCount: 34,
    summary: "Traces the creation of the cosmos and human faculties, culminating in the Rigvedic Mahavakya 'Prajnanam Brahma'."
  },
  {
    id: 'aksha-malika-upanishad',
    muktikaNumber: 67,
    pdfIndex: 2,
    name: 'Aksha Malika Upanishad',
    sanskritName: 'अक्षमालिकोपनिषद्',
    veda: 'Rigveda',
    category: 'Samanya',
    startPage: 15,
    endPage: 24,
    inDatabase: true,
    dbSourceName: 'Aksha Malika Upanishad',
    verseCount: 9,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'atma-bodha-upanishad',
    muktikaNumber: 42,
    pdfIndex: 3,
    name: 'Atma-Bodha Upanishad',
    sanskritName: 'आत्मबोधोपनिषद्',
    veda: 'Rigveda',
    category: 'Samanya',
    startPage: 25,
    endPage: 29,
    inDatabase: true,
    dbSourceName: 'Atma-Bodha Upanishad',
    verseCount: 31,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'bahvricha-upanishad',
    muktikaNumber: 107,
    pdfIndex: 4,
    name: 'Bahvricha Upanishad',
    sanskritName: 'बह्वृचोपनिषद्',
    veda: 'Rigveda',
    category: 'Shakta',
    startPage: 30,
    endPage: 33,
    inDatabase: true,
    dbSourceName: 'Bahvricha Upanishad',
    verseCount: 9,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'kaushitaki-brahmana-upanishad',
    muktikaNumber: 25,
    pdfIndex: 5,
    name: 'Kaushitaki Brahmana Upanishad',
    sanskritName: 'कौषीतकिब्राह्मणोपनिषद्',
    veda: 'Rigveda',
    category: 'Samanya',
    startPage: 34,
    endPage: 61,
    inDatabase: true,
    dbSourceName: 'Kaushitaki Brahmana Upanishad',
    verseCount: 53,
    summary: "Expounds Prana as conscious intelligence (Prajnatman) and traces the esoteric journey of the departing soul."
  },
  {
    id: 'mudgala-upanishad',
    muktikaNumber: 57,
    pdfIndex: 6,
    name: 'Mudgala Upanishad',
    sanskritName: 'मुद्गलोपनिषद्',
    veda: 'Rigveda',
    category: 'Samanya',
    startPage: 62,
    endPage: 66,
    inDatabase: true,
    dbSourceName: 'Mudgala Upanishad',
    verseCount: 11,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'nada-bindu-upanishad',
    muktikaNumber: 38,
    pdfIndex: 7,
    name: 'Nada Bindu Upanishad',
    sanskritName: 'नादबिन्दूपनिषद्',
    veda: 'Rigveda',
    category: 'Yoga',
    startPage: 67,
    endPage: 75,
    inDatabase: true,
    dbSourceName: 'Nada Bindu Upanishad',
    verseCount: 56,
    
    
    summary: "Canonical Yoga Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'nirvana-upanishad',
    muktikaNumber: 47,
    pdfIndex: 8,
    name: 'Nirvana Upanishad',
    sanskritName: 'निर्वाणोपनिषद्',
    veda: 'Rigveda',
    category: 'Samanya',
    startPage: 76,
    endPage: 84,
    inDatabase: true,
    dbSourceName: 'Nirvana Upanishad',
    verseCount: 5,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'saubhagya-lakshmi-upanishad',
    muktikaNumber: 105,
    pdfIndex: 9,
    name: 'Saubhagya Lakshmi Upanishad',
    sanskritName: 'सौभाग्यलक्ष्म्युपनिषद्',
    veda: 'Rigveda',
    category: 'Shakta',
    startPage: 85,
    endPage: 98,
    inDatabase: true,
    dbSourceName: 'Saubhagya Lakshmi Upanishad',
    verseCount: 23,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'tripura-upanishad',
    muktikaNumber: 82,
    pdfIndex: 10,
    name: 'Tripura Upanishad',
    sanskritName: 'त्रिपुरोपनिषद्',
    veda: 'Rigveda',
    category: 'Shakta',
    startPage: 99,
    endPage: 105,
    inDatabase: true,
    dbSourceName: 'Tripura Upanishad',
    verseCount: 16,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Rigveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'adhyatma-upanishad',
    muktikaNumber: 73,
    pdfIndex: 11,
    name: 'Adhyatma Upanishad',
    sanskritName: 'अध्यात्मोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 107,
    endPage: 116,
    inDatabase: true,
    dbSourceName: 'Adhyatma Upanishad',
    verseCount: 69,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'advaya-taraka-upanishad',
    muktikaNumber: 53,
    pdfIndex: 12,
    name: 'Advaya Taraka Upanishad',
    sanskritName: 'अद्वयतारकोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 117,
    endPage: 120,
    inDatabase: true,
    dbSourceName: 'Advaya Taraka Upanishad',
    verseCount: 35,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'bhikshuka-upanishad',
    muktikaNumber: 60,
    pdfIndex: 13,
    name: 'Bhikshuka Upanishad',
    sanskritName: 'भिक्षुकोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Sannyasa',
    startPage: 121,
    endPage: 123,
    inDatabase: true,
    dbSourceName: 'Bhikshuka Upanishad',
    verseCount: 8,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'brihadaranyaka-upanishad',
    muktikaNumber: 10,
    pdfIndex: 14,
    name: 'Brihadaranyaka Upanishad',
    sanskritName: 'बृहदारण्यकोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Mukhya',
    startPage: 124,
    endPage: 217,
    inDatabase: true,
    dbSourceName: 'Brihadaranyaka Upanishad',
    verseCount: 521,
    summary: "The monumental forest scripture of Sage Yajnavalkya; home of 'Asato Ma Sadgamaya' and 'Aham Brahmasmi'."
  },
  {
    id: 'hamsa-upanishad',
    muktikaNumber: 15,
    pdfIndex: 15,
    name: 'Hamsa Upanishad',
    sanskritName: 'हंसोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 218,
    endPage: 221,
    inDatabase: true,
    dbSourceName: 'Hamsa Upanishad',
    verseCount: 5,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'isavasya-upanishad',
    muktikaNumber: 1,
    pdfIndex: 16,
    name: 'Isavasya Upanishad',
    sanskritName: 'ईशावास्योपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Mukhya',
    startPage: 222,
    endPage: 224,
    inDatabase: true,
    dbSourceName: 'Isha Upanishad',
    verseCount: 19,
    summary: "Enveloping the changing universe with Divine consciousness; teaches joyful renunciation and equanimity in sacred action."
  },
  {
    id: 'jabala-upanishad',
    muktikaNumber: 13,
    pdfIndex: 17,
    name: 'Jabala Upanishad',
    sanskritName: 'जाबालोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 225,
    endPage: 230,
    inDatabase: true,
    dbSourceName: 'Jabala Upanishad',
    verseCount: 6,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'mandala-brahmana-upanishad',
    muktikaNumber: 48,
    pdfIndex: 18,
    name: 'Mandala Brahmana Upanishad',
    sanskritName: 'मण्डलब्राह्मणोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 231,
    endPage: 242,
    inDatabase: true,
    dbSourceName: 'Mandala Brahmana Upanishad',
    verseCount: 15,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'mantrika-upanishad',
    muktikaNumber: 32,
    pdfIndex: 19,
    name: 'Mantrika Upanishad',
    sanskritName: 'मान्त्रिकोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 243,
    endPage: 246,
    inDatabase: true,
    dbSourceName: 'Mantrika Upanishad',
    verseCount: 19,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'muktika-upanishad',
    muktikaNumber: 108,
    pdfIndex: 20,
    name: 'Muktika Upanishad',
    sanskritName: 'मुक्तिकोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 247,
    endPage: 270,
    inDatabase: true,
    dbSourceName: 'Muktika Upanishad',
    verseCount: 26,
    
    
    summary: "Lord Rama instructs Hanuman on the Muktika canon of 108 Upanishads and the path to Kaivalya liberation."
  },
  {
    id: 'niralamba-upanishad',
    muktikaNumber: 34,
    pdfIndex: 21,
    name: 'Niralamba Upanishad',
    sanskritName: 'निरालम्बोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 271,
    endPage: 279,
    inDatabase: true,
    dbSourceName: 'Niralamba Upanishad',
    verseCount: 11,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'paingala-upanishad',
    muktikaNumber: 59,
    pdfIndex: 22,
    name: 'Paingala Upanishad',
    sanskritName: 'पैङ्गलोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 280,
    endPage: 295,
    inDatabase: true,
    dbSourceName: 'Paingala Upanishad',
    verseCount: 29,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'paramahamsa-upanishad',
    muktikaNumber: 19,
    pdfIndex: 23,
    name: 'Paramahamsa Upanishad',
    sanskritName: 'परमहंसोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Sannyasa',
    startPage: 296,
    endPage: 298,
    inDatabase: true,
    dbSourceName: 'Paramahamsa Upanishad',
    verseCount: 4,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'satyayaniya-upanishad',
    muktikaNumber: 99,
    pdfIndex: 24,
    name: 'Satyayaniya Upanishad',
    sanskritName: 'शाट्यायनीयोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 299,
    endPage: 308,
    inDatabase: true,
    dbSourceName: 'Satyayaniya Upanishad',
    verseCount: 37,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'subala-upanishad',
    muktikaNumber: 30,
    pdfIndex: 25,
    name: 'Subala Upanishad',
    sanskritName: 'सुबालोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 309,
    endPage: 323,
    inDatabase: true,
    dbSourceName: 'Subala Upanishad',
    verseCount: 15,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'tara-sara-upanishad',
    muktikaNumber: 91,
    pdfIndex: 26,
    name: 'Tara Sara Upanishad',
    sanskritName: 'तारसारोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 324,
    endPage: 329,
    inDatabase: true,
    dbSourceName: 'Tara Sara Upanishad',
    verseCount: 17,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'trisikhi-brahmana-upanishad',
    muktikaNumber: 44,
    pdfIndex: 27,
    name: 'Trisikhi Brahmana Upanishad',
    sanskritName: 'त्रिशिखिब्राह्मणोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 330,
    endPage: 338,
    inDatabase: true,
    dbSourceName: 'Trisikhi Brahmana Upanishad',
    verseCount: 163,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'turiyatita-avadhuta-upanishad',
    muktikaNumber: 64,
    pdfIndex: 28,
    name: 'Turiyatita Avadhuta Upanishad',
    sanskritName: 'तुरीयातीतावधूतोपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Sannyasa',
    startPage: 339,
    endPage: 342,
    inDatabase: true,
    dbSourceName: 'Turiyatita Avadhuta Upanishad',
    verseCount: 10,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'yajnavalkya-upanishad',
    muktikaNumber: 97,
    pdfIndex: 29,
    name: 'Yajnavalkya Upanishad',
    sanskritName: 'याज्ञवल्क्योपनिषद्',
    veda: 'Shukla Yajurveda',
    category: 'Samanya',
    startPage: 343,
    endPage: 351,
    inDatabase: true,
    dbSourceName: 'Yajnavalkya Upanishad',
    verseCount: 25,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Shukla Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'akshi-upanishad',
    muktikaNumber: 72,
    pdfIndex: 30,
    name: 'Akshi Upanishad',
    sanskritName: 'अक्ष्युपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 353,
    endPage: 360,
    inDatabase: true,
    dbSourceName: 'Akshi Upanishad',
    verseCount: 50,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'amrita-bindu-upanishad',
    muktikaNumber: 20,
    pdfIndex: 31,
    name: 'Amrita Bindu Upanishad',
    sanskritName: 'अमृतबिन्दूपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Yoga',
    startPage: 361,
    endPage: 364,
    inDatabase: true,
    dbSourceName: 'Amrita Bindu Upanishad',
    verseCount: 20,
    summary: "Direct wisdom on mastery of the mind: 'The mind alone is the cause of human bondage and liberation.'"
  },
  {
    id: 'amrita-nada-upanishad',
    muktikaNumber: 21,
    pdfIndex: 32,
    name: 'Amrita-Nada Upanishad',
    sanskritName: 'अमृतनादोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 365,
    endPage: 370,
    inDatabase: true,
    dbSourceName: 'Amrita-Nada Upanishad',
    verseCount: 39,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'avadhuta-upanishad',
    muktikaNumber: 79,
    pdfIndex: 33,
    name: 'Avadhuta Upanishad',
    sanskritName: 'अवधूतोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Sannyasa',
    startPage: 371,
    endPage: 376,
    inDatabase: true,
    dbSourceName: 'Avadhuta Upanishad',
    verseCount: 32,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'brahma-vidya-upanishad',
    muktikaNumber: 40,
    pdfIndex: 34,
    name: 'Brahma Vidya Upanishad',
    sanskritName: 'ब्रह्मविद्योपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 377,
    endPage: 379,
    inDatabase: true,
    dbSourceName: 'Brahma Vidya Upanishad',
    verseCount: 110,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'brahma-upanishad',
    muktikaNumber: 11,
    pdfIndex: 35,
    name: 'Brahma Upanishad',
    sanskritName: 'ब्रह्मोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 380,
    endPage: 387,
    inDatabase: true,
    dbSourceName: 'Brahma Upanishad',
    verseCount: 4,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'dakshinamurti-upanishad',
    muktikaNumber: 49,
    pdfIndex: 36,
    name: 'Dakshinamurti Upanishad',
    sanskritName: 'दक्षिणामूर्त्युपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Shaiva',
    startPage: 388,
    endPage: 391,
    inDatabase: true,
    dbSourceName: 'Dakshinamurti Upanishad',
    verseCount: 20,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'dhyana-bindu-upanishad',
    muktikaNumber: 39,
    pdfIndex: 37,
    name: 'Dhyana-Bindu Upanishad',
    sanskritName: 'ध्यानबिन्दूपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Yoga',
    startPage: 392,
    endPage: 405,
    inDatabase: true,
    dbSourceName: 'Dhyana-Bindu Upanishad',
    verseCount: 105,
    
    
    summary: "Canonical Yoga Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'ekakshara-upanishad',
    muktikaNumber: 69,
    pdfIndex: 38,
    name: 'Ekakshara Upanishad',
    sanskritName: 'एकाक्षरोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 406,
    endPage: 409,
    inDatabase: true,
    dbSourceName: 'Ekakshara Upanishad',
    verseCount: 13,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'garbha-upanishad',
    muktikaNumber: 17,
    pdfIndex: 39,
    name: 'Garbha Upanishad',
    sanskritName: 'गर्भोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 410,
    endPage: 413,
    inDatabase: true,
    dbSourceName: 'Garbha Upanishad',
    verseCount: 4,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'kaivalya-upanishad',
    muktikaNumber: 12,
    pdfIndex: 40,
    name: 'Kaivalya Upanishad',
    sanskritName: 'कैवल्योपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Shaiva',
    startPage: 414,
    endPage: 418,
    inDatabase: true,
    dbSourceName: 'Kaivalya Upanishad',
    verseCount: 23,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'kalagni-rudra-upanishad',
    muktikaNumber: 28,
    pdfIndex: 41,
    name: 'Kalagni Rudra Upanishad',
    sanskritName: 'कालाग्निरुद्रोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Shaiva',
    startPage: 419,
    endPage: 421,
    inDatabase: true,
    dbSourceName: 'Kalagni Rudra Upanishad',
    verseCount: 1,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'kali-santarana-upanishad',
    muktikaNumber: 103,
    pdfIndex: 42,
    name: 'Kali Santarana Upanishad',
    sanskritName: 'कलिसन्तरणोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 422,
    endPage: 424,
    inDatabase: true,
    dbSourceName: 'Kali Santarana Upanishad',
    verseCount: 3,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'katha-upanishad',
    muktikaNumber: 3,
    pdfIndex: 43,
    name: 'Katha Upanishad',
    sanskritName: 'कठोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Mukhya',
    startPage: 425,
    endPage: 441,
    inDatabase: true,
    dbSourceName: 'Katha Upanishad',
    verseCount: 121,
    summary: "Nachiketa's legendary dialogue with Yama on the secret of immortality, discrimination (Viveka), and the chariot of the Self."
  },
  {
    id: 'katharudra-upanishad',
    muktikaNumber: 83,
    pdfIndex: 44,
    name: 'Katharudra Upanishad',
    sanskritName: 'कठरुद्रोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 442,
    endPage: 449,
    inDatabase: true,
    dbSourceName: 'Katharudra Upanishad',
    verseCount: 42,
    
    
    summary: "Nachiketa's legendary dialogue with Yama on the secret of immortality, discrimination (Viveka), and the chariot of the Self."
  },
  {
    id: 'kshurika-upanishad',
    muktikaNumber: 31,
    pdfIndex: 45,
    name: 'Kshurika Upanishad',
    sanskritName: 'क्षुरिकोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 450,
    endPage: 453,
    inDatabase: true,
    dbSourceName: 'Kshurika Upanishad',
    verseCount: 24,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'maha-narayana-upanishad',
    muktikaNumber: 52,
    pdfIndex: 46,
    name: 'Maha Narayana Upanishad',
    sanskritName: 'महानारायणोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Vaishnava',
    startPage: 454,
    endPage: 509,
    inDatabase: true,
    dbSourceName: 'Maha Narayana Upanishad',
    verseCount: 263,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'narayana-upanishad-muktika-upanishad-other-version',
    muktikaNumber: 18,
    pdfIndex: 47,
    name: 'Narayana Upanishad (Muktika Upanishad other version)',
    sanskritName: 'नारायणोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Vaishnava',
    startPage: 510,
    endPage: 515,
    inDatabase: true,
    dbSourceName: 'Narayana Upanishad (Muktika Upanishad other version)',
    verseCount: 19,
    
    
    summary: "Lord Rama instructs Hanuman on the Muktika canon of 108 Upanishads and the path to Kaivalya liberation."
  },
  {
    id: 'pancha-brahma-upanishad',
    muktikaNumber: 93,
    pdfIndex: 48,
    name: 'Pancha Brahma Upanishad',
    sanskritName: 'पञ्चब्रह्मोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Shaiva',
    startPage: 516,
    endPage: 519,
    inDatabase: true,
    dbSourceName: 'Pancha Brahma Upanishad',
    verseCount: 36,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'pranagnihotra-upanishad',
    muktikaNumber: 94,
    pdfIndex: 49,
    name: 'Pranagnihotra Upanishad',
    sanskritName: 'प्राणाग्निहोत्रोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 520,
    endPage: 525,
    inDatabase: true,
    dbSourceName: 'Pranagnihotra Upanishad',
    verseCount: 10,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'rudra-hridaya-upanishad',
    muktikaNumber: 85,
    pdfIndex: 50,
    name: 'Rudra Hridaya Upanishad',
    sanskritName: 'रुद्रहृदयोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Shaiva',
    startPage: 526,
    endPage: 531,
    inDatabase: true,
    dbSourceName: 'Rudra Hridaya Upanishad',
    verseCount: 52,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sarasvati-rahasya-upanishad',
    muktikaNumber: 106,
    pdfIndex: 51,
    name: 'Sarasvati-Rahasya Upanishad',
    sanskritName: 'सरस्वतीरहस्योपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Shakta',
    startPage: 532,
    endPage: 551,
    inDatabase: true,
    dbSourceName: 'Sarasvati-Rahasya Upanishad',
    verseCount: 46,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sariraka-upanishad',
    muktikaNumber: 62,
    pdfIndex: 52,
    name: 'Sariraka Upanishad',
    sanskritName: 'शारीरकोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 552,
    endPage: 555,
    inDatabase: true,
    dbSourceName: 'Sariraka Upanishad',
    verseCount: 8,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sarva-sara-upanishad',
    muktikaNumber: 33,
    pdfIndex: 53,
    name: 'Sarva Sara Upanishad',
    sanskritName: 'सर्वसारोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 556,
    endPage: 561,
    inDatabase: true,
    dbSourceName: 'Sarva Sara Upanishad',
    verseCount: 5,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'skanda-upanishad',
    muktikaNumber: 51,
    pdfIndex: 54,
    name: 'Skanda Upanishad',
    sanskritName: 'स्कन्दोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 562,
    endPage: 564,
    inDatabase: true,
    dbSourceName: 'Skanda Upanishad',
    verseCount: 15,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'suka-rahasya-upanishad',
    muktikaNumber: 35,
    pdfIndex: 55,
    name: 'Suka Rahasya Upanishad',
    sanskritName: 'शुकरहस्योपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 565,
    endPage: 571,
    inDatabase: true,
    dbSourceName: 'Suka Rahasya Upanishad',
    verseCount: 43,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'svetasvatara-upanishad',
    muktikaNumber: 14,
    pdfIndex: 56,
    name: 'Svetasvatara Upanishad',
    sanskritName: 'श्वेताश्वतरोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 572,
    endPage: 592,
    inDatabase: true,
    dbSourceName: 'Shvetashvatara Upanishad',
    verseCount: 114,
    summary: "Harmonizes Vedantic philosophy with devotional theism; glorifies the Supreme Purusha who is realized through devotion and Dhyana."
  },
  {
    id: 'taittiriya-upanishad',
    muktikaNumber: 7,
    pdfIndex: 57,
    name: 'Taittiriya Upanishad',
    sanskritName: 'तैत्तिरीयोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Mukhya',
    startPage: 593,
    endPage: 611,
    inDatabase: true,
    dbSourceName: 'Taittiriya Upanishad',
    verseCount: 52,
    summary: "Reveals the Pancha Koshas (Five Sheaths of human existence) and proclaims 'Satyam Jnanam Anantam Brahma'."
  },
  {
    id: 'tejo-bindu-upanishad',
    muktikaNumber: 37,
    pdfIndex: 58,
    name: 'Tejo-Bindu Upanishad',
    sanskritName: 'तेजोबिन्दूपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Yoga',
    startPage: 612,
    endPage: 655,
    inDatabase: true,
    dbSourceName: 'Tejo-Bindu Upanishad',
    verseCount: 466,
    summary: "Instruction on the radiant point of consciousness (Tejobindu), constant absorption in Brahman, and the 15 limbs of Yoga."
  },
  {
    id: 'varaha-upanishad',
    muktikaNumber: 98,
    pdfIndex: 59,
    name: 'Varaha Upanishad',
    sanskritName: 'वराहोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Samanya',
    startPage: 656,
    endPage: 695,
    inDatabase: true,
    dbSourceName: 'Varaha Upanishad',
    verseCount: 252,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'yoga-kundalini-upanishad',
    muktikaNumber: 86,
    pdfIndex: 60,
    name: 'Yoga-Kundalini Upanishad',
    sanskritName: 'योगकुण्डलिन्युपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Yoga',
    startPage: 696,
    endPage: 718,
    inDatabase: true,
    dbSourceName: 'Yoga-Kundalini Upanishad',
    verseCount: 172,
    
    
    summary: "Canonical Yoga Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'yoga-sikha-upanishad',
    muktikaNumber: 63,
    pdfIndex: 61,
    name: 'Yoga Sikha Upanishad',
    sanskritName: 'योगशिखोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Yoga',
    startPage: 719,
    endPage: 726,
    inDatabase: true,
    dbSourceName: 'Yoga Sikha Upanishad',
    verseCount: 393,
    
    
    summary: "Canonical Yoga Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'yoga-tattva-upanishad',
    muktikaNumber: 41,
    pdfIndex: 62,
    name: 'Yoga Tattva Upanishad',
    sanskritName: 'योगतत्त्वोपनिषद्',
    veda: 'Krishna Yajurveda',
    category: 'Yoga',
    startPage: 727,
    endPage: 744,
    inDatabase: true,
    dbSourceName: 'Yoga Tattva Upanishad',
    verseCount: 142,
    
    
    summary: "Canonical Yoga Upanishad affiliated with Krishna Yajurveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'aruni-upanishad',
    muktikaNumber: 16,
    pdfIndex: 63,
    name: 'Aruni Upanishad',
    sanskritName: 'आरुण्युपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 746,
    endPage: 749,
    inDatabase: true,
    dbSourceName: 'Aruni Upanishad',
    verseCount: 5,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'avyakta-upanishad',
    muktikaNumber: 68,
    pdfIndex: 64,
    name: 'Avyakta Upanishad',
    sanskritName: 'अव्यक्तोपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 750,
    endPage: 755,
    inDatabase: true,
    dbSourceName: 'Avyakta Upanishad',
    verseCount: 6,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'chandogya-upanishad',
    muktikaNumber: 9,
    pdfIndex: 65,
    name: 'Chandogya Upanishad',
    sanskritName: 'छान्दोग्योपनिषद्',
    veda: 'Samaveda',
    category: 'Mukhya',
    startPage: 756,
    endPage: 851,
    inDatabase: true,
    dbSourceName: 'Chandogya Upanishad',
    verseCount: 628,
    summary: "One of the grandest Upanishads; encompasses the Udgitha, the dialogue of Uddalaka and Shvetaketu, and 'Tat Tvam Asi'."
  },
  {
    id: 'jabala-darsana-upanishad',
    muktikaNumber: 90,
    pdfIndex: 66,
    name: 'Jabala Darsana Upanishad',
    sanskritName: 'जाबालदर्शनोपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 852,
    endPage: 857,
    inDatabase: true,
    dbSourceName: 'Jabala Darsana Upanishad',
    verseCount: 234,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'jabali-upanishad',
    muktikaNumber: 104,
    pdfIndex: 67,
    name: 'Jabali Upanishad',
    sanskritName: 'जाबाल्युपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 858,
    endPage: 860,
    inDatabase: true,
    dbSourceName: 'Jabali Upanishad',
    verseCount: 8,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'kena-upanishad',
    muktikaNumber: 2,
    pdfIndex: 68,
    name: 'Kena Upanishad',
    sanskritName: 'केनोपनिषद्',
    veda: 'Samaveda',
    category: 'Mukhya',
    startPage: 861,
    endPage: 866,
    inDatabase: true,
    dbSourceName: 'Kena Upanishad',
    verseCount: 36,
    summary: "Investigates the hidden Divine director behind the eyes, ears, mind, and speech: the Supreme Mover of all."
  },
  {
    id: 'kundika-upanishad',
    muktikaNumber: 74,
    pdfIndex: 69,
    name: 'Kundika Upanishad',
    sanskritName: 'कुण्डिकोपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 867,
    endPage: 873,
    inDatabase: true,
    dbSourceName: 'Kundika Upanishad',
    verseCount: 28,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'maha-upanishad',
    muktikaNumber: 61,
    pdfIndex: 70,
    name: 'Maha Upanishad',
    sanskritName: 'महोपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 874,
    endPage: 925,
    inDatabase: true,
    dbSourceName: 'Maha Upanishad',
    verseCount: 539,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'maitrayani-upanishad',
    muktikaNumber: 24,
    pdfIndex: 71,
    name: 'Maitrayani Upanishad',
    sanskritName: 'मैत्रायण्युपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 926,
    endPage: 933,
    inDatabase: true,
    dbSourceName: 'Maitrayani Upanishad',
    verseCount: 99,
    summary: "Addresses King Brihadratha's spiritual yearning and Sage Shakayanya's teachings on time, Gunas, and the Supreme Self."
  },
  {
    id: 'maitreya-upanishad',
    muktikaNumber: 29,
    pdfIndex: 72,
    name: 'Maitreya Upanishad',
    sanskritName: 'मैत्रेयोपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 934,
    endPage: 945,
    inDatabase: true,
    dbSourceName: 'Maitreya Upanishad',
    verseCount: 74,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'rudraksha-jabala-upanishad',
    muktikaNumber: 88,
    pdfIndex: 73,
    name: 'Rudraksha Jabala Upanishad',
    sanskritName: 'रुद्राक्षजाबालोपनिषद्',
    veda: 'Samaveda',
    category: 'Shaiva',
    startPage: 946,
    endPage: 953,
    inDatabase: true,
    dbSourceName: 'Rudraksha Jabala Upanishad',
    verseCount: 42,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sannyasa-upanishad',
    muktikaNumber: 65,
    pdfIndex: 74,
    name: 'Sannyasa Upanishad',
    sanskritName: 'संन्यासोपनिषद्',
    veda: 'Samaveda',
    category: 'Sannyasa',
    startPage: 954,
    endPage: 976,
    inDatabase: true,
    dbSourceName: 'Sannyasa Upanishad',
    verseCount: 104,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'savitri-upanishad',
    muktikaNumber: 75,
    pdfIndex: 75,
    name: 'Savitri Upanishad',
    sanskritName: 'सावित्र्युपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 977,
    endPage: 980,
    inDatabase: true,
    dbSourceName: 'Savitri Upanishad',
    verseCount: 15,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'vajrasuchika-upanishad',
    muktikaNumber: 36,
    pdfIndex: 76,
    name: 'Vajrasuchika Upanishad',
    sanskritName: 'वज्रसूचीकोपनिषद्',
    veda: 'Samaveda',
    category: 'Samanya',
    startPage: 981,
    endPage: 984,
    inDatabase: true,
    dbSourceName: 'Vajrasuchika Upanishad',
    verseCount: 1,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'vasudeva-upanishad',
    muktikaNumber: 56,
    pdfIndex: 77,
    name: 'Vasudeva Upanishad',
    sanskritName: 'वासुदेवोपनिषद्',
    veda: 'Samaveda',
    category: 'Vaishnava',
    startPage: 985,
    endPage: 987,
    inDatabase: true,
    dbSourceName: 'Vasudeva Upanishad',
    verseCount: 26,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'yoga-chudamani-upanishad',
    muktikaNumber: 46,
    pdfIndex: 78,
    name: 'Yoga Chudamani Upanishad',
    sanskritName: 'योगचूडामण्युपनिषद्',
    veda: 'Samaveda',
    category: 'Yoga',
    startPage: 988,
    endPage: 996,
    inDatabase: true,
    dbSourceName: 'Yoga Chudamani Upanishad',
    verseCount: 120,
    
    
    summary: "Canonical Yoga Upanishad affiliated with Samaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'annapurna-upanishad',
    muktikaNumber: 70,
    pdfIndex: 79,
    name: 'Annapurna Upanishad',
    sanskritName: 'अन्नपूर्णोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shakta',
    startPage: 998,
    endPage: 1035,
    inDatabase: true,
    dbSourceName: 'Annapurna Upanishad',
    verseCount: 340,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'atharvasikha-upanishad',
    muktikaNumber: 23,
    pdfIndex: 80,
    name: 'Atharvasikha Upanishad',
    sanskritName: 'अथर्वशिखोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1036,
    endPage: 1040,
    inDatabase: true,
    dbSourceName: 'Atharvasikha Upanishad',
    verseCount: 3,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'atharvasiras-upanishad',
    muktikaNumber: 22,
    pdfIndex: 81,
    name: 'Atharvasiras Upanishad',
    sanskritName: 'अथर्वशिरोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1041,
    endPage: 1048,
    inDatabase: true,
    dbSourceName: 'Atharvasiras Upanishad',
    verseCount: 38,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'atma-upanishad',
    muktikaNumber: 76,
    pdfIndex: 82,
    name: 'Atma Upanishad',
    sanskritName: 'आत्मोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1049,
    endPage: 1054,
    inDatabase: true,
    dbSourceName: 'Atma Upanishad',
    verseCount: 31,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'bhasma-jabala-upanishad',
    muktikaNumber: 87,
    pdfIndex: 83,
    name: 'Bhasma Jabala Upanishad',
    sanskritName: 'भस्मजाबालोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shaiva',
    startPage: 1055,
    endPage: 1061,
    inDatabase: true,
    dbSourceName: 'Bhasma Jabala Upanishad',
    verseCount: 1,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'bhavana-upanishad',
    muktikaNumber: 84,
    pdfIndex: 84,
    name: 'Bhavana Upanishad',
    sanskritName: 'भावनोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shakta',
    startPage: 1062,
    endPage: 1066,
    inDatabase: true,
    dbSourceName: 'Bhavana Upanishad',
    verseCount: 6,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'brihad-jabala-upanishad',
    muktikaNumber: 26,
    pdfIndex: 85,
    name: 'Brihad Jabala Upanishad',
    sanskritName: 'बृहज्जाबालोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1067,
    endPage: 1077,
    inDatabase: true,
    dbSourceName: 'Brihad Jabala Upanishad',
    verseCount: 138,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'dattatreya-upanishad',
    muktikaNumber: 101,
    pdfIndex: 86,
    name: 'Dattatreya Upanishad',
    sanskritName: 'दत्तात्रेयोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1078,
    endPage: 1083,
    inDatabase: true,
    dbSourceName: 'Dattatreya Upanishad',
    verseCount: 5,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'devi-upanishad',
    muktikaNumber: 81,
    pdfIndex: 87,
    name: 'Devi Upanishad',
    sanskritName: 'देव्युपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shakta',
    startPage: 1084,
    endPage: 1092,
    inDatabase: true,
    dbSourceName: 'Devi Upanishad',
    verseCount: 22,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'ganapati-upanishad',
    muktikaNumber: 89,
    pdfIndex: 88,
    name: 'Ganapati Upanishad',
    sanskritName: 'गणपत्युपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1093,
    endPage: 1096,
    inDatabase: true,
    dbSourceName: 'Ganapati Upanishad',
    verseCount: 14,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'garuda-upanishad',
    muktikaNumber: 102,
    pdfIndex: 89,
    name: 'Garuda Upanishad',
    sanskritName: 'गरुडोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1097,
    endPage: 1100,
    inDatabase: true,
    dbSourceName: 'Garuda Upanishad',
    verseCount: 9,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'gopala-tapaniya-upanishad',
    muktikaNumber: 95,
    pdfIndex: 90,
    name: 'Gopala-Tapaniya Upanishad',
    sanskritName: 'गोपालतापनीयोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1101,
    endPage: 1122,
    inDatabase: true,
    dbSourceName: 'Gopala-Tapaniya Upanishad',
    verseCount: 83,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'hayagriva-upanishad',
    muktikaNumber: 100,
    pdfIndex: 91,
    name: 'Hayagriva Upanishad',
    sanskritName: 'हयग्रीवोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1123,
    endPage: 1127,
    inDatabase: true,
    dbSourceName: 'Hayagriva Upanishad',
    verseCount: 10,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'krishna-upanishad',
    muktikaNumber: 96,
    pdfIndex: 92,
    name: 'Krishna Upanishad',
    sanskritName: 'कृष्णोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1128,
    endPage: 1130,
    inDatabase: true,
    dbSourceName: 'Krishna Upanishad',
    verseCount: 26,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'maha-vakya-upanishad',
    muktikaNumber: 92,
    pdfIndex: 93,
    name: 'Maha Vakya Upanishad',
    sanskritName: 'महावाक्योपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1131,
    endPage: 1133,
    inDatabase: true,
    dbSourceName: 'Maha Vakya Upanishad',
    verseCount: 8,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'mandukya-upanishad',
    muktikaNumber: 6,
    pdfIndex: 94,
    name: 'Mandukya Upanishad',
    sanskritName: 'माण्डूक्योपनिषद्',
    veda: 'Atharvaveda',
    category: 'Mukhya',
    startPage: 1134,
    endPage: 1165,
    inDatabase: true,
    dbSourceName: 'Mandukya Upanishad',
    verseCount: 13,
    summary: "Quintessential master treatise analyzing the sacred syllable OM and the four states of consciousness culminating in Turiya."
  },
  {
    id: 'mundaka-upanishad',
    muktikaNumber: 5,
    pdfIndex: 95,
    name: 'Mundaka Upanishad',
    sanskritName: 'मुण्डकोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Mukhya',
    startPage: 1166,
    endPage: 1177,
    inDatabase: true,
    dbSourceName: 'Mundaka Upanishad',
    verseCount: 68,
    summary: "The distinction between lower empirical knowledge and higher Self-knowledge; proclaims 'Satyameva Jayate' (Truth alone triumphs)."
  },
  {
    id: 'narada-parivrajaka-upanishad',
    muktikaNumber: 43,
    pdfIndex: 96,
    name: 'Narada Parivrajaka Upanishad',
    sanskritName: 'नारदपरिव्राजकोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Sannyasa',
    startPage: 1178,
    endPage: 1249,
    inDatabase: true,
    dbSourceName: 'Narada Parivrajaka Upanishad',
    verseCount: 244,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'nrisimha-tapaniya-upanishad',
    muktikaNumber: 27,
    pdfIndex: 97,
    name: 'Nrisimha Tapaniya Upanishad',
    sanskritName: 'नृसिंहतापनीयोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1250,
    endPage: 1274,
    inDatabase: true,
    dbSourceName: 'Nrisimha Tapaniya Upanishad',
    verseCount: 70,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'para-brahma-upanishad',
    muktikaNumber: 78,
    pdfIndex: 98,
    name: 'Para-Brahma Upanishad',
    sanskritName: 'परब्रह्मोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1275,
    endPage: 1283,
    inDatabase: true,
    dbSourceName: 'Para-Brahma Upanishad',
    verseCount: 15,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'paramahamsa-parivrajaka-upanishad',
    muktikaNumber: 66,
    pdfIndex: 99,
    name: 'Paramahamsa-Parivrajaka Upanishad',
    sanskritName: 'परमहंसपरिव्राजकोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Sannyasa',
    startPage: 1284,
    endPage: 1292,
    inDatabase: true,
    dbSourceName: 'Paramahamsa-Parivrajaka Upanishad',
    verseCount: 8,
    
    
    summary: "Canonical Sannyasa Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'pasupata-brahmana-upanishad',
    muktikaNumber: 77,
    pdfIndex: 100,
    name: 'Pasupata Brahmana Upanishad',
    sanskritName: 'पाशुपतब्राह्मणोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shaiva',
    startPage: 1293,
    endPage: 1295,
    inDatabase: true,
    dbSourceName: 'Pasupata Brahmana Upanishad',
    verseCount: 46,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'prasna-upanishad',
    muktikaNumber: 4,
    pdfIndex: 101,
    name: 'Prasna Upanishad',
    sanskritName: 'प्रश्नोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Mukhya',
    startPage: 1296,
    endPage: 1309,
    inDatabase: true,
    dbSourceName: 'Prashna Upanishad',
    verseCount: 68,
    summary: "Six spiritual seekers question Sage Pippalada on the origin of creation, Prana, sleep, and the 16-part Purusha."
  },
  {
    id: 'rama-rahasya-upanishad',
    muktikaNumber: 54,
    pdfIndex: 102,
    name: 'Rama Rahasya Upanishad',
    sanskritName: 'रामरहस्योपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1310,
    endPage: 1348,
    inDatabase: true,
    dbSourceName: 'Rama Rahasya Upanishad',
    verseCount: 146,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'rama-tapaniya-upanishad',
    muktikaNumber: 55,
    pdfIndex: 103,
    name: 'Rama Tapaniya Upanishad',
    sanskritName: 'रामतापनीयोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Vaishnava',
    startPage: 1349,
    endPage: 1357,
    inDatabase: true,
    dbSourceName: 'Rama Tapaniya Upanishad',
    verseCount: 189,
    
    
    summary: "Canonical Vaishnava Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sandilya-upanishad',
    muktikaNumber: 58,
    pdfIndex: 104,
    name: 'Sandilya Upanishad',
    sanskritName: 'शाण्डिल्योपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1358,
    endPage: 1382,
    inDatabase: true,
    dbSourceName: 'Sandilya Upanishad',
    verseCount: 80,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sarabha-upanishad',
    muktikaNumber: 50,
    pdfIndex: 105,
    name: 'Sarabha Upanishad',
    sanskritName: 'शरभोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shaiva',
    startPage: 1383,
    endPage: 1386,
    inDatabase: true,
    dbSourceName: 'Sarabha Upanishad',
    verseCount: 35,
    
    
    summary: "Canonical Shaiva Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'sita-upanishad',
    muktikaNumber: 45,
    pdfIndex: 106,
    name: 'Sita Upanishad',
    sanskritName: 'सीतोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shakta',
    startPage: 1387,
    endPage: 1396,
    inDatabase: true,
    dbSourceName: 'Sita Upanishad',
    verseCount: 9,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'surya-upanishad',
    muktikaNumber: 71,
    pdfIndex: 107,
    name: 'Surya Upanishad',
    sanskritName: 'सूर्योपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1397,
    endPage: 1400,
    inDatabase: true,
    dbSourceName: 'Surya Upanishad',
    verseCount: 9,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'tripadvibhuti-mahanarayana-upanishad',
    muktikaNumber: 52,
    pdfIndex: 108,
    name: 'Tripadvibhuti Mahanarayana Upanishad',
    sanskritName: 'त्रिपाद्विभूतिमहानारायणोपनिषद्',
    veda: 'Atharvaveda',
    category: 'Samanya',
    startPage: 1401,
    endPage: 1405,
    inDatabase: true,
    dbSourceName: 'Tripadvibhuti Mahanarayana Upanishad',
    verseCount: 8,
    
    
    summary: "Canonical Samanya Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
  {
    id: 'tripura-tapini-upanishad',
    muktikaNumber: 80,
    pdfIndex: 109,
    name: 'Tripura Tapini Upanishad',
    sanskritName: 'त्रिपुरातपिनीउपनिषद्',
    veda: 'Atharvaveda',
    category: 'Shakta',
    startPage: 1406,
    endPage: 1438,
    inDatabase: true,
    dbSourceName: 'Tripura Tapini Upanishad',
    verseCount: 27,
    
    
    summary: "Canonical Shakta Upanishad affiliated with Atharvaveda. Explores the realization of Brahman and the eternal nature of the Atman."
  },
];

/** Helper utility functions **/
export function getUpanishadsByVeda(veda: VedicTradition): CanonicalUpanishad[] {
  return CANONICAL_108_UPANISHADS.filter(u => u.veda === veda);
}

export function getAvailableInDatabase(): CanonicalUpanishad[] {
  return CANONICAL_108_UPANISHADS.filter(u => u.inDatabase);
}

export function getUpanishadByDbName(name: string): CanonicalUpanishad | undefined {
  if (!name) return undefined;
  const norm = name.toLowerCase().trim();
  const cleanNorm = norm.replace(/\s*upanishad$/, '').trim();
  return CANONICAL_108_UPANISHADS.find(u => {
    const uDb = u.dbSourceName?.toLowerCase().trim() || '';
    const uName = u.name.toLowerCase().trim();
    const uClean = uName.replace(/\s*upanishad$/, '').trim();
    return uDb === norm || 
           uName === norm || 
           uClean === cleanNorm ||
           uDb.replace(/\s*upanishad$/, '').trim() === cleanNorm;
  });
}

export function getUpanishadByMuktika(num: number): CanonicalUpanishad | undefined {
  return CANONICAL_108_UPANISHADS.find(u => u.muktikaNumber === num);
}
