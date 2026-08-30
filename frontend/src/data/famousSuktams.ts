export interface HymnVerse {
  verseNumber: number;
  sanskrit: string;
  transliteration?: string;
  english: string;
  hindi?: string;
}

export interface SacredHymn {
  id: string;
  name: string;
  sanskritName: string;
  category: 'Vedic Suktam' | 'Maha Mantra' | 'Upanishadic Shanti' | 'Gita Shloka' | 'Puranic & Epic Stotram';
  deityOrTheme: string;
  exactScripture: string;
  sourceName: string;
  isVeda?: boolean;
  vedaId?: 'rigveda' | 'yajurveda' | 'samaveda' | 'atharvaveda';
  division1?: number;           // Mandala / Kanda / Prapathaka
  division2?: number;           // Sukta / Anuvaka / Dashati
  coordinateText: string;
  canonicalRef: string;
  chapterNumber?: number;
  startVerse?: number;
  endVerse?: number;
  verseNumber?: number;
  summary: string;
  verses: HymnVerse[];
}

export const FAMOUS_SUKTAMS_AND_MANTRAS: SacredHymn[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 1. VEDIC SUKTAMS (वेद संहिता सूक्त)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'purusha-suktam',
    name: 'Purusha Suktam',
    sanskritName: 'पुरुष सूक्तम्',
    category: 'Vedic Suktam',
    deityOrTheme: 'Supreme Cosmic Being (Purusha) & Cosmic Manifestation',
    exactScripture: 'Rigveda Samhita (ऋग्वेद संहिता)',
    sourceName: 'Rigveda',
    isVeda: true,
    vedaId: 'rigveda',
    division1: 10,
    division2: 90,
    chapterNumber: 10,
    startVerse: 1,
    endVerse: 16,
    verseNumber: 1,
    coordinateText: 'Rigveda • Mandala 10, Anuvaka 7, Sukta 90 (Verses 1–16)',
    canonicalRef: 'Rigveda 10.90.1–16 / Shukla Yajurveda 31.1–16',
    summary: 'The universal hymn celebrating the Supreme Cosmic Being from whose divine sacrifice the entire cosmos, seasons, elements, living entities, and sacred Vedas manifest.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'ॐ सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्।\nस भूमिं विश्वतो वृत्वात्यतिष्ठद्दशाङ्गुलम्॥',
        transliteration: 'sahasra-śīrṣā puruṣaḥ sahasrākṣaḥ sahasra-pāt | sa bhūmiṁ viśvato vṛtvāty-atiṣṭhad-daśāṅgulam ||',
        english: 'The Supreme Purusha has a thousand heads, a thousand eyes, and a thousand feet. Pervading the entire cosmos on every side, He extends beyond it by ten fingers.',
        hindi: 'परम पुरुष के सहस्रों (अनंत) सिर, सहस्रों नेत्र और सहस्रों पैर हैं। वह संपूर्ण ब्रह्मांड को सब ओर से व्याप्त करके दस अंगुल और परे स्थित है।'
      },
      {
        verseNumber: 2,
        sanskrit: 'पुरुष एवेदं सर्वं यद्भूतं यच्च भव्यम्।\nउतामृतत्वस्येशानो यदन्नेनातिरोहति॥',
        transliteration: 'puruṣa evedaṁ sarvaṁ yad bhūtaṁ yacca bhavyam | utāmṛtatvasyeśāno yad-annenātirohati ||',
        english: 'The Purusha is indeed all this universe — whatever has been, and whatever is to be. He is the Lord of Immortality and grows beyond through mortal nourishment.',
        hindi: 'यह संपूर्ण जगत जो बीत चुका है और जो भविष्य में होगा, वह सब पुरुष ही है। वह अमृतत्व (मोक्ष) का स्वामी है और अन्न से जीवन धारण करने वाले नश्वर जगत से परे बढ़ता है।'
      },
      {
        verseNumber: 3,
        sanskrit: 'एतावानस्य महिमातो ज्यायांश्च पूरुषः।\nपादोऽस्य विश्वा भूतानि त्रिपादस्यामृतं दिवि॥',
        transliteration: 'etāvān-asya mahimāto jyāyāṁś-ca pūruṣaḥ | pādo\'sya viśvā bhūtāni tripād-asyāmṛtaṁ divi ||',
        english: 'Such is His divine glory, and the Purusha is greater than this. All beings and worlds constitute but one-fourth of Him; His immortal three-fourths remain in the transcendental realm.',
        hindi: 'यह दृश्य प्रपंच उसकी महिमा का एक अंश मात्र है, पुरुष इससे कहीं महान है। समस्त चर-अचर जीव उसके एक पाद (चौथाई भाग) में हैं; उसका अविनाशी तीन-चौथाई अंश दिव्य लोक में स्थित है।'
      },
      {
        verseNumber: 4,
        sanskrit: 'त्रिपाद्धूर्ध्व उदैत्पुरुषः पादोऽस्येहाभवत्पुनः।\nततो विष्वङ् व्यक्रामत्साशनानशने अभि॥',
        transliteration: 'tripād-ūrdhva udait-puruṣaḥ pādo\'syehābhavat-punaḥ | tato viṣvaṅ vyakrāmat-sāśanānaśane abhi ||',
        english: 'With three parts the Purusha ascended above; one part of Him manifested again here in cyclic creation. From that He spread in all directions into that which eats and that which does not.',
        hindi: 'तीन पाद से वह परम पुरुष ऊपर दिव्य लोक में स्थित रहा; उसका एक पाद यहाँ पुनः-पुनः प्रकट हुआ। तत्पश्चात वह चेतन (भोक्ता) और अचेतन (अभोगी) दोनों रूपों में सर्वत्र व्याप्त हो गया।'
      },
      {
        verseNumber: 5,
        sanskrit: 'तस्माद्विराळजायत विराजो अधि पूरुषः।\nस जातो अत्यरिच्यत पश्चाद्भूमिमथो पुरः॥',
        transliteration: 'tasmād-virāḷ-ajāyata virājo adhi pūruṣaḥ | sa jāto atyaricyata paścād-bhūmim-atho puraḥ ||',
        english: 'From Him the Cosmic Body (Viraj) was born, and from Viraj arose the Purusha. Being born, He extended beyond the Earth, behind and before.',
        hindi: 'उस आदि पुरुष से विराट ब्रह्मांड उत्पन्न हुआ, और विराट से पुनः अधिपुरुष प्रकट हुआ। जन्म लेते ही उसने पृथ्वी और सभी लोकों को आगे और पीछे से अतिव्याप्त कर लिया।'
      },
      {
        verseNumber: 6,
        sanskrit: 'यत्पुरुषेण हविषा देवा यज्ञमतन्वता।\nवसन्तो अस्यासीदाज्यं ग्रीष्म इध्मः शरद्धविः॥',
        transliteration: 'yat-puruṣeṇa haviṣā devā yajñam-atanvata | vasanto asyāsīd-ājyaṁ grīṣma idhmaḥ śarad-dhaviḥ ||',
        english: 'When the Devas performed the cosmic sacrifice with the Purusha as the offering, Spring became its clarified butter, Summer its sacred fuel, and Autumn its sacred oblation.',
        hindi: 'जब देवताओं ने उस परम पुरुष को ही हवि बनाकर सृष्टि रूपी महायज्ञ का विस्तार किया, तब वसंत ऋतु उस यज्ञ का घृत, ग्रीष्म ऋतु समिधा (ईंधन) और शरद ऋतु हविष्य बनी।'
      },
      {
        verseNumber: 7,
        sanskrit: 'तं यज्ञं बर्हिषि प्रौक्षन्पुरुषं जातमग्रतः।\nतेन देवा अयजन्त साध्या ऋषयश्च ये॥',
        transliteration: 'taṁ yajñaṁ barhiṣi praukṣan-puruṣaṁ jātam-agrataḥ | tena devā ayajanta sādhyā ṛṣayaś-ca ye ||',
        english: 'They consecrated on the sacred grass that Purusha, the first-born of creation. With Him as the offering, the Devas, the Sadhyas, and the ancient Rishis sacrificed.',
        hindi: 'सर्वप्रथम प्रकट हुए उस परम पुरुष रूपी यज्ञीय स्वरूप का देवताओं, साध्यों और ऋषियों ने कुशा पर प्रोक्षण कर सृष्टि-यज्ञ संपन्न किया।'
      },
      {
        verseNumber: 8,
        sanskrit: 'तस्माद्यज्ञात्सर्वहुतः सम्भृतं पृषदाज्यम्।\nपशून्तांश्चक्रे वायव्यानारण्यान् ग्राम्याश्च ये॥',
        transliteration: 'tasmād-yajñāt-sarva-hutaḥ sambhṛtaṁ pṛṣad-ājyam | paśūn-tāṁś-cakre vāyavyān-āraṇyān grāmyāś-ca ye ||',
        english: 'From that fully consummated sacrifice was gathered the speckled butter. From it He created the creatures of the air, the wild beasts of the forest, and the domestic animals.',
        hindi: 'उस सर्वहुत महायज्ञ से दधि-मिश्रित घृत प्राप्त हुआ। उसी से वायु में विचरने वाले पक्षी, वन के वन्य पशु तथा ग्रामों के पालतू पशु उत्पन्न हुए।'
      },
      {
        verseNumber: 9,
        sanskrit: 'तस्माद्यज्ञात्सर्वहुत ऋचः सामानि जज्ञिरे।\nछन्दांसि जज्ञिरे तस्माद्यजुस्तस्मादजायत॥',
        transliteration: 'tasmād-yajñāt-sarva-huta ṛcaḥ sāmāni jajñire | chandāṁsi jajñire tasmād-yajus-tasmād-ajāyata ||',
        english: 'From that all-offering sacrifice the Rigveda hymns and Samaveda chants were born; the Vedic meters were born from it, and from it the Yajurveda arose.',
        hindi: 'उस सर्वहुत यज्ञ से ऋग्वेद की ऋचाएं और सामवेद के साम-गान उत्पन्न हुए; उसी से वैदिक छंद प्रकट हुए और उसी से यजुर्वेद का प्राकट्य हुआ।'
      },
      {
        verseNumber: 10,
        sanskrit: 'तस्मादश्वा अजायन्त ये के चोभयादतः।\nगावो ह जज्ञिरे तस्मात्तस्माज्जाता अजावयः॥',
        transliteration: 'tasmād-aśvā ajāyanta ye ke cobhayādataḥ | gāvo ha jajñire tasmāt-tasmāj-jātā ajāvayaḥ ||',
        english: 'From it were born horses, and all animals having two rows of teeth; cows were born from it, and from it were born goats and sheep.',
        hindi: 'उसी से घोड़े तथा दोनों ओर दांत वाले पशु उत्पन्न हुए। उसी से गौएं उत्पन्न हुईं और उसी से बकरियां तथा भेड़ें उत्पन्न हुईं।'
      },
      {
        verseNumber: 11,
        sanskrit: 'यत्पुरुषं व्यदधुः कतिधा व्यकल्पयन्।\nमुखं किमस्य कौ बाहू का ऊरू पादा उच्येते॥',
        transliteration: 'yat-puruṣaṁ vyadadhuḥ katidhā vyakalpayan | mukhaṁ kim-asya kau bāhū kā ūrū pādā ucyete ||',
        english: 'When they envisioned the Cosmic Purusha, into how many parts did they divide Him? What was His mouth? What were His arms? What were His thighs and feet called?',
        hindi: 'जब ज्ञानियों ने विराट पुरुष की भावना की, तब उसे कितने रूपों में कल्पित किया? उसका मुख क्या था? उसकी भुजाएं क्या थीं? उसकी जंघाएं और चरण किसे कहा गया?'
      },
      {
        verseNumber: 12,
        sanskrit: 'ब्राह्मणोऽस्य मुखमासीद्बाहू राजन्यः कृतः।\nऊरू तदस्य यद्वैश्यः पद्भ्यां शूद्रो अजायत॥',
        transliteration: 'brāhmaṇo\'sya mukham-āsīd-bāhū rājanyaḥ kṛtaḥ | ūrū tad-asya yad-vaiśyaḥ padbhyāṁ śūdro ajāyata ||',
        english: 'The spiritual sage (Brahmana) was His mouth; the protector (Kshatriya) was made His arms; the provider (Vaishya) was His thighs; from His feet the supporting pillar (Shudra) was born.',
        hindi: 'ज्ञान और वाणी का प्रतीक ब्राह्मण उसका मुख था; रक्षा करने वाला क्षत्रिय उसकी भुजाएं बनीं; पोषण करने वाला वैश्य उसकी जंघाएं और सेवा व आधार देने वाला शूद्र उसके चरणों से प्रकट हुआ।'
      },
      {
        verseNumber: 13,
        sanskrit: 'चन्द्रमा मनसो जातश्चक्षोः सूर्यो अजायत।\nमुखादिन्द्रश्चाग्निश्च प्राणाद्वायुरजायत॥',
        transliteration: 'candramā manaso jātaś-cakṣoḥ sūryo ajāyata | mukhād-indraś-cāgniś-ca prāṇād-vāyur-ajāyata ||',
        english: 'The Moon was born from His mind; the Sun was born from His eyes; from His mouth Indra and Agni were born, and from His breath the cosmic Wind arose.',
        hindi: 'उसके मन से चंद्रमा उत्पन्न हुआ; नेत्रों से सूर्य प्रकट हुआ; मुख से इंद्र और अग्नि देव उत्पन्न हुए तथा उसके प्राण से वायु का प्राकट्य हुआ।'
      },
      {
        verseNumber: 14,
        sanskrit: 'नाभ्या आसीदन्तरिक्षं शीर्ष्णो द्यौः समवर्तत।\nपद्भ्यां भूमिर्दिशः श्रोत्रात्तथा लोकाँ अकल्पयन्॥',
        transliteration: 'nābhyā āsīd-antarikṣaṁ śīrṣṇo dyauḥ samavartata | padbhyāṁ bhūmir-diśaḥ śrotrāt-tathā lokāṁ akalpayan ||',
        english: 'From His navel came the intermediate space; from His head the heavens evolved; from His feet the earth, and from His ears the cardinal directions. Thus did they fashion the worlds.',
        hindi: 'उसकी नाभि से अंतरिक्ष लोक, सिर से द्युलोक (स्वर्ग), चरणों से पृथ्वी और कानों से समस्त दिशाएं प्रकट हुईं। इस प्रकार ऋषियों ने समस्त लोकों की रचना की।'
      },
      {
        verseNumber: 15,
        sanskrit: 'सप्तास्यासन् परिधयस्त्रिः सप्त समिधः कृताः।\nदेवा यद्यज्ञं तन्वाना अबध्नन्पुरुषं पशुम्॥',
        transliteration: 'saptāsyāsan paridhayas-triḥ sapta samidhaḥ kṛtāḥ | devā yad-yajñaṁ tanvānā abadhnan-puruṣaṁ paśum ||',
        english: 'Seven were its enclosing boundaries, and thrice-seven (twenty-one) fuel sticks were prepared, when the Devas, extending the cosmic sacrifice, bound the Purusha as the offering.',
        hindi: 'इस महायज्ञ के सात छंद परिधियां बनीं और इक्कीस (तत्व) समिधाएं बनाई गईं, जब देवताओं ने सृष्टि यज्ञ का विस्तार करते हुए परम पुरुष को हवि रूप में समर्पित किया।'
      },
      {
        verseNumber: 16,
        sanskrit: 'यज्ञेन यज्ञमयजन्त देवास्तानि धर्माणि प्रथमान्यासन्।\nते ह नाकं महिमानः सचन्त यत्र पूर्वे साध्याः सन्ति देवाः॥',
        transliteration: 'yajñena yajñam-ayajanta devās-tāni dharmāṇi prathamāny-āsan | te ha nākaṁ mahimānaḥ sacanta yatra pūrve sādhyāḥ santi devāḥ ||',
        english: 'By means of sacrifice the Devas offered sacrifice unto the Divine; these were the earliest primal laws of Dharma. Those mighty souls attain the highest heavenly realm where the ancient deities and realized beings dwell.',
        hindi: 'देवताओं ने यज्ञ द्वारा यज्ञस्वरूप परमेश्वर का यजन किया; वे ही धर्म के प्रथम मौलिक नियम बने। वे पुण्यात्मा महात्मा उस परम दिव्य धाम को प्राप्त होते हैं जहां पुरातन साध्य और देवता निवास करते हैं।'
      }
    ]
  },
  {
    id: 'nasadiya-suktam',
    name: 'Nasadiya Suktam (Hymn of Cosmic Creation)',
    sanskritName: 'नासदीय सूक्तम् (सृष्टि सूक्त)',
    category: 'Vedic Suktam',
    deityOrTheme: 'Cosmology, Pre-Creation Silence & Ultimate Reality',
    exactScripture: 'Rigveda Samhita (ऋग्वेद संहिता)',
    sourceName: 'Rigveda',
    isVeda: true,
    vedaId: 'rigveda',
    division1: 10,
    division2: 129,
    chapterNumber: 10,
    startVerse: 1,
    endVerse: 7,
    verseNumber: 1,
    coordinateText: 'Rigveda • Mandala 10, Anuvaka 10, Sukta 129 (Verses 1–7)',
    canonicalRef: 'Rigveda 10.129.1–7',
    summary: 'The profound Vedic hymn exploring the mystery of creation prior to existence and non-existence, when only the One breathed without breath in cosmic stillness.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'नासदासीन्नो सदासीत्तदानीं नासीद्रजो नो व्योमा परो यत्।\nकिमावरीवः कुह कस्य शर्मन्नम्भः किमासीद्गहनं गभीरम्॥',
        transliteration: 'nāsad-āsīn-no sad-āsīt-tadānīṁ nāsīd-rajo no vyomā paro yat | kim-āvarīvaḥ kuha kasya śarmann-ambhaḥ kim-āsīd-gahanaṁ gabhīram ||',
        english: 'Then was not non-existent nor existent: there was no realm of air, no sky beyond it. What covered in, and where? And what gave shelter? Was water there, unfathomed depth of water?',
        hindi: 'सृष्टि से पूर्व न असत्य (अभाव) था और न सत्य (भाव) था; न वायुमण्डल था और न उससे परे आकाश था। उस समय किसने किसको ढका था? कहाँ और किसकी शरण में? क्या अथाह और गहरा जल था?'
      },
      {
        verseNumber: 2,
        sanskrit: 'न मृत्युरासीदमृतं न तर्हि न रात्र्या अह्न आसीत्प्रकेतः।\nआनीदवातं स्वधया तदेकं तस्माद्धान्यन्न परः किञ्चनास॥',
        transliteration: 'na mṛtyur-āsīd-amṛtaṁ na tarhi na rātryā ahna āsīt-praketaḥ | ānīd-avātaṁ svadhayā tad-ekaṁ tasmād-dhānyan-na paraḥ kiñcanāsa ||',
        english: 'Death was not then, nor was there aught immortal; no sign was there, the day’s and night’s divider. That One Thing, breathless, breathed by its own nature: apart from it was nothing whatsoever.',
        hindi: 'उस समय न मृत्यु थी और न अमरता; न रात और दिन का कोई भेद था। वह एकमात्र परमतत्व बिना वायु के अपनी ही शक्ति से स्पंदित हो रहा था; उसके अतिरिक्त परे कुछ भी नहीं था।'
      },
      {
        verseNumber: 3,
        sanskrit: 'तम आसीत्तमसा गूळ्हमग्रेऽप्रकेतं सलिलं सर्वमा इदम्।\nतुच्छ्येनाभ्वपिहितं यदासीत्तपसस्तन्महिनाजायतैकम्॥',
        transliteration: 'tama āsīt-tamasā gūḷham-agre\'praketaṁ salilaṁ sarvam-ā idam | tucchyenābhv-apihitaṁ yad-āsīt-tapasas-tan-mahinājāyataikam ||',
        english: 'Darkness there was: at first concealed in darkness this All was indiscriminate chaos. All that existed then was void and formless: by the great power of Tapas (Warmth of Consciousness) was born that Unit.',
        hindi: 'सृष्टि के आदि में अंधकार से अंधकार ढका हुआ था; यह सब अज्ञात सलिल (अव्यक्त ऊर्जा) रूप था। वह जो शून्य और अप्रकट था, वह चेतना के तपोमय संकल्प की महिमा से एक रूप में उत्पन्न हुआ।'
      },
      {
        verseNumber: 4,
        sanskrit: 'कामस्तदग्रे समवर्तताधि मनसो रेतः प्रथमं यदासीत्।\nसतो बन्धुमसति निरविन्दन् हृदि प्रतीष्या कवयो मनीषा॥',
        transliteration: 'kāmas-tad-agre samavartatādhi manaso retaḥ prathamaṁ yad-āsīt | sato bandhum-asati niravindan hṛdi pratīṣyā kavayo manīṣā ||',
        english: 'Desire entered who was the primal seed and germ of Spirit. Sages who searched with their heart’s thought discovered the existent’s kinship in the non-existent.',
        hindi: 'तत्पश्चात आदि संकल्प (कामना/स्फुरण) उत्पन्न हुआ, जो मन का प्रथम बीज था। ज्ञानी ऋषियों ने अपनी बुद्धि द्वारा हृदय में खोजकर अव्यक्त में व्यक्त के संबंध को जाना।'
      },
      {
        verseNumber: 5,
        sanskrit: 'तिरश्चीनो विततो रश्मिरेषामधः स्विदासीदुपरि स्विदासीत्।\nरेतोधा आसन् महिमान आसन्त्स्वधा अवस्तात् प्रयतिः परस्तात्॥',
        transliteration: 'tiraścīno vitato raśmir-eṣām-adhaḥ svid-āsīd-upari svid-āsīt | retodhā āsan mahimāna āsan-tsvadhā avastāt prayatiḥ parastāt ||',
        english: 'Crosswise was severed their dividing line: was there an above? Was there a below? Seed-bearers there were, and mighty forces; free action here, and energy up yonder.',
        hindi: 'उनकी रश्मियां तिरछी फैल गईं; क्या नीचे कुछ था, अथवा ऊपर कुछ था? बीज धारण करने वाली शक्तियां और उनकी महिमाएं प्रकट हुईं; नीचे प्रकृति का भोग था और ऊपर पुरुष का संकल्प।'
      },
      {
        verseNumber: 6,
        sanskrit: 'को अद्धा वेद क इह प्र वोचत् कुत आजाता कुत इयं विसृष्टिः।\nअर्वाग्देवा अस्य विसर्जनेनाथा को वेद यत आबभूव॥',
        transliteration: 'ko addhā veda ka iha pra vocat kuta ājātā kuta iyaṁ visṛṣṭiḥ | arvāg-devā asya visarjanenāthā ko veda yata ābabhūva ||',
        english: 'Who verily knows and who can here declare it, whence it was born and whence comes this creation? The Gods are later than this world’s production. Who knows then whence it first came into being?',
        hindi: 'वास्तव में कौन जानता है और कौन यहाँ कह सकता है कि यह विविध सृष्टि कहाँ से उत्पन्न हुई और कहाँ से आई? देवता भी इस सृष्टि की रचना के बाद आए हैं; फिर कौन जान सकता है कि यह कहाँ से प्रकट हुई?'
      },
      {
        verseNumber: 7,
        sanskrit: 'इयं विसृष्टिर्यत आबभूव यदि वा दधे यदि वा न।\nयो अस्याध्यक्षः परमे व्योमन्त्सो अङ्ग वेद यदि वा न वेद॥',
        transliteration: 'iyaṁ visṛṣṭir-yata ābabhūva yadi vā dadhe yadi vā na | yo asyādhyakṣaḥ parame vyoman-tso aṅga veda yadi vā na veda ||',
        english: 'He, the first origin of this creation, whether he formed it all or did not form it, whose eye controls this world in highest heaven, he verily knows it, or perhaps he knows not!',
        hindi: 'यह विविधात्मक सृष्टि जिससे उत्पन्न हुई, चाहे उसने इसे धारण किया हो अथवा नहीं; जो परम व्योम (सर्वोच्च आकाश) में इसका अध्यक्ष (साक्षी) है, वही इसे जानता है, या शायद वह भी नहीं जानता!'
      }
    ]
  },
  {
    id: 'devi-suktam',
    name: 'Devi Suktam (Vak Suktam)',
    sanskritName: 'देवी सूक्तम् (वाक्सूक्तम्)',
    category: 'Vedic Suktam',
    deityOrTheme: 'Divine Mother (Mahashakti / Vak) Self-Declaration',
    exactScripture: 'Rigveda Samhita (ऋग्वेद संहिता)',
    sourceName: 'Rigveda',
    isVeda: true,
    vedaId: 'rigveda',
    division1: 10,
    division2: 125,
    chapterNumber: 10,
    startVerse: 1,
    endVerse: 8,
    verseNumber: 1,
    coordinateText: 'Rigveda • Mandala 10, Anuvaka 10, Sukta 125 (Verses 1–8)',
    canonicalRef: 'Rigveda 10.125.1–8 / Devi Mahatmyam',
    summary: 'The declaration by Rishika Vak Amrinarayani revealing the Divine Mother as the Supreme Consciousness sustaining all deities, sages, and universes.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'अहं रुद्रेभिर्वसुभिश्चराम्यहमादित्यैरुत विश्वदेवैः।\nअहं मित्रावरुणोभा बिभर्म्यहमिन्द्राग्नी अहमश्विनोभा॥',
        transliteration: 'ahaṁ rudrebhir-vasubhiś-carāmy-aham-ādityair-uta viśvadevaiḥ | ahaṁ mitrā-varuṇobhā bibharmy-aham-indrāgnī aham-aśvinobhā ||',
        english: 'I move with the Rudras and the Vasus, with the Adityas and all the Gods. I support both Mitra and Varuna, Indra and Agni, and the twin Ashvins.',
        hindi: 'मैं एकादश रुद्रों, अष्ट वसुओं, द्वादश आदित्यों और समस्त विश्वेदेवों के साथ विचरण करती हूँ। मैं ही मित्रावरुण, इन्द्राग्नि और दोनों अश्विनीकुमारों को धारण करती हूँ।'
      },
      {
        verseNumber: 2,
        sanskrit: 'अहं सोममाहनसं बिभर्म्यहं त्वष्टारमुत पूषणं भगम्।\nअहं दधामि द्रविणं हविष्मते सुप्राव्ये यजमानाय सुन्वते॥',
        transliteration: 'ahaṁ somam-āhanasaṁ bibharmy-ahaṁ tvaṣṭāram-uta pūṣaṇaṁ bhagam | ahaṁ dadhāmi draviṇaṁ haviṣmate suprāvye yajamānāya sunvate ||',
        english: 'I sustain the invigorating Soma; I sustain Tvashtar, Pushan, and Bhaga. I bestow wealth upon the dedicated sacrificer who offers oblations with a devoted mind.',
        hindi: 'मैं ही सोम को धारण करती हूँ; त्वष्टा, पूषा और भग को भी मैं ही धारण करती हूँ। श्रद्धापूर्वक हवि प्रदान करने वाले यजमान को मैं ही अभीष्ट धन-ऐश्वर्य प्रदान करती हूँ।'
      },
      {
        verseNumber: 3,
        sanskrit: 'अहं राष्ट्री संगमनी वसूनां चिकितुषी प्रथमा यज्ञियानाम्।\nतां मा देवा व्यदधुः पुरुत्रा भूरिस्थात्रां भूर्यावेशयन्तीम्॥',
        transliteration: 'ahaṁ rāṣṭrī saṁgamanī vasūnāṁ cikituṣī prathamā yajñiyānām | tāṁ mā devā vyadadhuḥ purutrā bhūri-sthātrāṁ bhūry-āveśayantīm ||',
        english: 'I am the Queen of the universe, the gatherer of treasures, the conscious Knower, first among those worthy of worship. The Gods have distributed Me in many places, manifold in forms and dwelling everywhere.',
        hindi: 'मैं संपूर्ण जगत की ईश्वरी, समस्त ऐश्वर्यों को एकत्र करने वाली, परब्रह्म को जानने वाली और यज्ञपात्रों में प्रथम हूँ। देवताओं ने मुझे अनेक स्थानों में प्रतिष्ठित किया है, क्योंकि मैं सर्वव्यापी हूँ।'
      },
      {
        verseNumber: 4,
        sanskrit: 'मया सो अन्नमत्ति यो विपश्यति यः प्राणिति य ईं शृणोत्युक्तम्।\nअमन्तवो मां त उप क्षियन्ति श्रुधि श्रुत श्रद्धिवं ते वदामि॥',
        transliteration: 'mayā so annam-atti yo vipaśyati yaḥ prāṇiti ya īṁ śṛṇoty-uktam | amantavo māṁ ta upa kṣiyanti śrudhi śruta śraddhivaṁ te vadāmi ||',
        english: 'Through Me alone all eat food, see, breathe, and hear the spoken word. Those who know Me not decline and perish. Listen, O wise seeker, I speak unto you the Truth worthy of faith.',
        hindi: 'जो भोजन करता है, देखता है, श्वास लेता है और जो सुना हुआ सुनता है, वह सब मेरे द्वारा ही करता है। जो मुझे नहीं जानते, वे क्षीण हो जाते हैं। हे विद्वान, सुनो! मैं श्रद्धा से ग्रहण करने योग्य परम सत्य कहती हूँ।'
      },
      {
        verseNumber: 5,
        sanskrit: 'अहमेव स्वयमिदं वदामि जुष्टं देवेभिरुत मानुषेभिः।\nयं कामये तं तमुग्रं कृणोमि तं ब्रह्माणं तमृषिं तं सुमेधाम्॥',
        transliteration: 'aham-eva svayam-idaṁ vadāmi juṣṭaṁ devebhir-uta mānuṣebhiḥ | yaṁ kāmaye taṁ tam-ugraṁ kṛṇomi taṁ brahmāṇaṁ tam-ṛṣiṁ taṁ sumedhām ||',
        english: 'I Myself verily declare this truth, which is welcomed by both Gods and men. Whomsoever I love, I make him mighty, a creator, a sage, and richly wise.',
        hindi: 'मैं स्वयं ही देवताओं और मनुष्यों द्वारा सेवित इस सत्य का उपदेश करती हूँ। मैं जिसकी रक्षा करना चाहती हूँ, उसे अत्यंत तेजस्वी, ब्रह्मा, ऋषि और परम मेधावी बना देती हूँ।'
      },
      {
        verseNumber: 6,
        sanskrit: 'अहं रुद्राय धनुरातनोमि ब्रह्मद्विषे शरवे हन्तवा उ।\nअहं जनाय समदं कृणोम्यहं द्यावापृथिवी आ विवेश॥',
        transliteration: 'ahaṁ rudrāya dhanur-ātanomi brahma-dviṣe śarave hantavā u | ahaṁ janāya samadaṁ kṛṇomy-ahaṁ dyāvāpṛthivī ā viveśa ||',
        english: 'I bend the bow for Rudra so that his arrow may strike the hater of sacred knowledge. I arouse the spirit of righteousness for the people; I have entered and pervaded heaven and earth.',
        hindi: 'ब्रह्म के द्वेषी को नष्ट करने के लिए मैं ही रुद्र के धनुष पर प्रत्यंचा चढ़ाती हूँ। मैं ही सज्जनों के कल्याण के लिए युद्ध करती हूँ और मैं ही स्वर्ग तथा पृथ्वी में प्रविष्ट होकर व्याप्त हूँ।'
      },
      {
        verseNumber: 7,
        sanskrit: 'अहं सुवे पितरमस्य मूर्धन् मम योनिरप्स्वा समुद्र अंतः।\nततो वि तिष्ठे भुवनानु विश्वोतामूं द्यां वर्ष्मणा उप स्पृशामि॥',
        transliteration: 'ahaṁ suve pitaram-asya mūrdhan mama yonir-apsvā samudra antaḥ | tato vi tiṣṭhe bhuvanānu viśvotāmūṁ dyāṁ varṣmaṇā upa spṛśāmi ||',
        english: 'I give birth to the Father (Heaven) upon the summit of this cosmos; My origin is in the Waters, the inner Ocean of Pure Consciousness. Thence I spread across all worlds and touch yonder heaven with My vastness.',
        hindi: 'मैं इस ब्रह्मांड के शीर्ष पर द्युलोक रूपी पिता को जन्म देती हूँ; मेरा उद्गम स्थान कारण-जल (चिदम्बरी चेतना) के भीतर है। वहीं से मैं समस्त भुवनों में व्याप्त होती हूँ और अपने विशाल स्वरूप से स्वर्ग को स्पर्श करती हूँ।'
      },
      {
        verseNumber: 8,
        sanskrit: 'अहमेव वात इव प्रवाम्यारभमाणा भुवनानि विश्वा।\nपरो दिवा पर एना पृथिव्यैतावती महिना सं बभूव॥',
        transliteration: 'aham-eva vāta iva pravāmy-ārabhamāṇā bhuvanāni viśvā | paro divā para enā pṛthivy-aitāvatī mahinā saṁ babhūva ||',
        english: 'I blow like the cosmic Wind, originating and sustaining all worlds. Beyond heaven, beyond this earth — so vast have I become through My transcendent majesty!',
        hindi: 'समस्त ब्रह्मांडों का निर्माण करती हुई मैं ही वायु की भांति स्वतंत्र रूप से प्रवाहित होती हूँ। द्युलोक से परे और इस पृथ्वी से भी परे — अपनी असीम महिमा के साथ मैं ही सर्वत्र विद्यमान हूँ।'
      }
    ]
  },
  {
    id: 'sri-rudram-namakam',
    name: 'Sri Rudram (Namakam)',
    sanskritName: 'श्रीरुद्रम् (नमकम्)',
    category: 'Vedic Suktam',
    deityOrTheme: 'Bhagavan Shiva / Rudra (All-Pervading Reality)',
    exactScripture: 'Yajurveda Taittiriya Samhita (कृष्ण यजुर्वेद तैत्तिरीय संहिता)',
    sourceName: 'Yajur Veda',
    isVeda: true,
    vedaId: 'yajurveda',
    division1: 4,
    division2: 5,
    chapterNumber: 4,
    startVerse: 1,
    endVerse: 66,
    verseNumber: 1,
    coordinateText: 'Yajurveda (Taittiriya Samhita) • Kanda 4, Prapāṭhaka 5 (Verses 1–66)',
    canonicalRef: 'TS 4.5.1–66 / Shukla Yajurveda 16',
    summary: 'The sacred Vedic invocation recognizing the all-pervading divine reality of Rudra-Shiva across forests, rivers, mountains, warriors, saints, cosmos, and nature.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'नमस्ते रुद्र मन्यव उतो त इषवे नमः।\nबाहुभ्यामुत ते नमः॥',
        transliteration: 'namas-te rudra manyava uto ta iṣave namaḥ | bāhubhyām-uta te namaḥ ||',
        english: 'Salutations to Your wrath, O Rudra, and salutations to Your arrow; salutations to both Your arms.',
        hindi: 'हे संहारकर्ता और कल्याणकारी रुद्र! आपके क्रोध को नमस्कार, आपके बाण को नमस्कार तथा आपकी दोनों भुजाओं को नमस्कार है।'
      }
    ]
  },
  {
    id: 'prithvi-suktam',
    name: 'Prithvi Suktam (Hymn to Mother Earth)',
    sanskritName: 'भूमि सूक्तम् / पृथ्वी सूक्तम्',
    category: 'Vedic Suktam',
    deityOrTheme: 'Mother Earth (Bhumi Mata) & Cosmic Ecology',
    exactScripture: 'Atharvaveda Samhita (अथर्ववेद संहिता)',
    sourceName: 'Atharva Veda',
    isVeda: true,
    vedaId: 'atharvaveda',
    division1: 12,
    division2: 1,
    chapterNumber: 12,
    startVerse: 1,
    endVerse: 63,
    verseNumber: 1,
    coordinateText: 'Atharvaveda • Kanda 12, Sukta 1 (Verses 1–63)',
    canonicalRef: 'Atharvaveda 12.1.1–63',
    summary: 'The world’s earliest charter of environmental reverence, honoring Earth as our loving mother who nurtures all peoples, rivers, mountains, and life in balance.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'सत्यं बृहदृतमुग्रं दीक्षा तपो ब्रह्म यज्ञः पृथिवीं धारयन्ति।\nमाता भूमिः पुत्रो अहं पृथिव्याः पर्जन्यः पिता स उ नः पिपर्तु॥',
        transliteration: 'satyaṁ bṛhad-ṛtam-ugraṁ dīkṣā tapo brahma yajñaḥ pṛthivīṁ dhārayanti | mātā bhūmiḥ putro ahaṁ pṛthivyāḥ parjanyaḥ pitā sa u naḥ pipartu ||',
        english: 'Truth, vast cosmic order, dedication, austerity, prayer, and sacrifice sustain the Earth. Earth is my mother, I am the child of Earth; the sky is my father, may he nourish us.',
        hindi: 'सत्य, महान ऋत (प्राकृतिक व्यवस्था), दीक्षा, तपस्या, ब्रह्मज्ञान और यज्ञ पृथ्वी को धारण करते हैं। पृथ्वी मेरी माता है और मैं पृथ्वी का पुत्र हूँ; पर्जन्य (मेघ) मेरे पिता हैं, वे हमारा पालन-पोषण करें।'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MAHA MANTRAS (वैदिक एवं पौराणिक महामंत्र)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'gayatri-mantra',
    name: 'Gayatri Maha Mantra',
    sanskritName: 'गायत्री महामंत्र (सावित्री मंत्र)',
    category: 'Maha Mantra',
    deityOrTheme: 'Savitr (Radiant Cosmic Consciousness & Awakening of Intellect)',
    exactScripture: 'Rigveda Samhita (ऋग्वेद संहिता)',
    sourceName: 'Rigveda',
    isVeda: true,
    vedaId: 'rigveda',
    division1: 3,
    division2: 62,
    chapterNumber: 3,
    startVerse: 10,
    endVerse: 10,
    verseNumber: 10,
    coordinateText: 'Rigveda • Mandala 3, Sukta 62, Verse 10',
    canonicalRef: 'Rigveda 3.62.10 / Shukla Yajurveda 36.3',
    summary: 'The mother of all Vedic mantras, praying to the Supreme Radiant Sun of Consciousness to illuminate, awaken, and guide our intellect and inner vision.',
    verses: [
      {
        verseNumber: 10,
        sanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥',
        transliteration: 'oṁ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṁ bhargo devasya dhīmahi | dhiyo yo naḥ pracodayāt ||',
        english: 'We meditate upon the adorable, transcendental radiant glory of the Divine Sun, the Creator of the three worlds (Earth, Atmosphere, Heavens). May He inspire, awaken, and illuminate our intellect.',
        hindi: 'हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा का ध्यान करते हैं। वह परमात्मा हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।'
      }
    ]
  },
  {
    id: 'maha-mrityunjaya-mantra',
    name: 'Maha Mrityunjaya Mantra (Rudra Moksha Mantra)',
    sanskritName: 'महामृत्युंजय मंत्र',
    category: 'Maha Mantra',
    deityOrTheme: 'Bhagavan Shiva / Healing, Immortality & Ultimate Liberation',
    exactScripture: 'Rigveda Samhita (ऋग्वेद संहिता)',
    sourceName: 'Rigveda',
    isVeda: true,
    vedaId: 'rigveda',
    division1: 7,
    division2: 59,
    chapterNumber: 7,
    startVerse: 12,
    endVerse: 12,
    verseNumber: 12,
    coordinateText: 'Rigveda • Mandala 7, Sukta 59, Verse 12',
    canonicalRef: 'Rigveda 7.59.12 / Taittiriya Samhita 1.8.6',
    summary: 'The supreme healing and liberation mantra praying to the Three-Eyed Lord to sever the bondages of mortality effortlessly like a ripe fruit falling from its stem.',
    verses: [
      {
        verseNumber: 12,
        sanskrit: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात्॥',
        transliteration: 'oṁ try-ambakaṁ yajāmahe sugandhiṁ puṣṭi-vardhanam | urvārukam-iva bandhanān-mṛtyor-mukṣīya māmṛtāt ||',
        english: 'We worship the Three-Eyed Lord (Shiva), who is fragrant and nourishes all beings. As a ripe cucumber is severed effortlessly from its vine, may we be liberated from the bondage of death unto Immortality.',
        hindi: 'हम त्रिनेत्रधारी भगवान शिव की आराधना करते हैं, जो सुगंधित हैं और सभी प्राणियों का पोषण करते हैं। जिस प्रकार पका हुआ खरबूजा बेल के बंधन से मुक्त हो जाता है, उसी प्रकार हम मृत्यु के पाश से छूटकर अमरता (मोक्ष) को प्राप्त हों।'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. BHAGAVAD GITA MAHA SHLOKAS (श्रीमद्भगवद्गीता महाश्लोक)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'gita-karmanye-vadhikaraste',
    name: 'Karmanye Vadhikaraste (The Law of Karma Yoga)',
    sanskritName: 'कर्मण्येवाधिकारस्ते (कर्मयोग)',
    category: 'Gita Shloka',
    deityOrTheme: 'Selfless Action & Freedom from Outcome Anxiety',
    exactScripture: 'Srimad Bhagavad Gita (श्रीमद्भगवद्गीता)',
    sourceName: 'Bhagavad Gita',
    chapterNumber: 2,
    startVerse: 47,
    endVerse: 47,
    verseNumber: 47,
    coordinateText: 'Bhagavad Gita • Chapter 2 (Sankhya Yoga), Verse 47',
    canonicalRef: 'Bhagavad Gita 2.47',
    summary: 'The quintessential core teaching of the Bhagavad Gita on performing duty with absolute devotion while relinquishing anxious attachment to outcomes.',
    verses: [
      {
        verseNumber: 47,
        sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
        transliteration: 'karmaṇy-evādhikāras-te mā phaleṣu kadācana | mā karma-phala-hetur-bhūr-mā te saṅgo\'stv-akarmaṇi ||',
        english: 'You have a right only to perform your prescribed duty, but never to its fruits. Never let the fruits of action be your motive, nor let your attachment be to inaction.',
        hindi: 'कर्म करने में ही तुम्हारा अधिकार है, उसके फलों में कभी नहीं। इसलिए तुम कर्मफल के हेतु मत बनो और तुम्हारी आसक्ति अकर्म (कर्म न करने) में भी न हो।'
      }
    ]
  },
  {
    id: 'gita-charama-shloka',
    name: 'Sarva-Dharman Parityajya (The Supreme Promise)',
    sanskritName: 'सर्वधर्मान्परित्यज्य (शरणगति)',
    category: 'Gita Shloka',
    deityOrTheme: 'Unconditional Surrender (Sharanagati) & Liberation',
    exactScripture: 'Srimad Bhagavad Gita (श्रीमद्भगवद्गीता)',
    sourceName: 'Bhagavad Gita',
    chapterNumber: 18,
    startVerse: 66,
    endVerse: 66,
    verseNumber: 66,
    coordinateText: 'Bhagavad Gita • Chapter 18 (Moksha Sannyasa Yoga), Verse 66',
    canonicalRef: 'Bhagavad Gita 18.66',
    summary: 'Sri Krishna’s crowning conclusion: abandon all fears and surrender wholly unto Me; I shall liberate you from all bondages, do not grieve.',
    verses: [
      {
        verseNumber: 66,
        sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
        transliteration: 'sarva-dharmān parityajya mām-ekaṁ śaraṇaṁ vraja | ahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ ||',
        english: 'Abandoning all varieties of duty, surrender unto Me alone. I shall deliver you from all sinful reactions; do not grieve.',
        hindi: 'सम्पूर्ण धर्मों (कर्तव्यों) के आश्रय को त्यागकर केवल मेरी शरण में आ जाओ। मैं तुम्हें समस्त पापों व बन्धनों से मुक्त कर दूँगा, शोक मत करो।'
      }
    ]
  },
  {
    id: 'gita-yada-yada-hi',
    name: 'Yada Yada Hi Dharmasya (Avatar Descent)',
    sanskritName: 'यदा यदा हि धर्मस्य (अवतार रहस्य)',
    category: 'Gita Shloka',
    deityOrTheme: 'Protection of the Good & Restoration of Dharma',
    exactScripture: 'Srimad Bhagavad Gita (श्रीमद्भगवद्गीता)',
    sourceName: 'Bhagavad Gita',
    chapterNumber: 4,
    startVerse: 7,
    endVerse: 8,
    verseNumber: 7,
    coordinateText: 'Bhagavad Gita • Chapter 4 (Jnana Karma Sannyasa Yoga), Verses 7–8',
    canonicalRef: 'Bhagavad Gita 4.7–8',
    summary: 'The eternal promise that the Divine manifests age after age to protect the righteous, transform the unrighteous, and re-establish Dharma.',
    verses: [
      {
        verseNumber: 7,
        sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
        transliteration: 'yadā yadā hi dharmasya glānir-bhavati bhārata | abhyutthānam-adharmasya tadātmānaṁ sṛjāmy-aham ||',
        english: 'Whenever there is a decline in righteousness, O Bharata, and an uprising of unrighteousness, then I manifest Myself.',
        hindi: 'हे भारत (अर्जुन)! जब-जब धर्म की हानि होती है और अधर्म की वृद्धि होती है, तब-तब मैं अपने रूप को साकार रूप में प्रकट करता हूँ।'
      },
      {
        verseNumber: 8,
        sanskrit: 'परित्राणाय साधूनां विनाशाय च दुष्कृताम्।\nधर्मसंस्थापनार्थाय सम्भवामि युगे युगे॥',
        transliteration: 'paritrāṇāya sādhūnāṁ vināśāya ca duṣkṛtām | dharma-saṁsthāpanārthāya sambhavāmi yuge yuge ||',
        english: 'For the protection of the good, for the destruction of wicked forces, and for the re-establishment of Dharma, I appear age after age.',
        hindi: 'साधु-सज्जनों की रक्षा के लिए, दुराचारियों के विनाश के लिए और धर्म की सुदृढ़ स्थापना के लिए मैं युग-युग में प्रकट होता हूँ।'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. UPANISHADS (उपनिषद्)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'isha-purna-madah',
    name: 'Purna Madah Purna Midam (The Infinite Wholeness)',
    sanskritName: 'पूर्णमदः पूर्णमिदम् (ईशावास्योपनिषद्)',
    category: 'Upanishadic Shanti',
    deityOrTheme: 'Brahman as Infinite, Whole and Undivided',
    exactScripture: 'Isha Upanishad (ईशावास्योपनिषद्)',
    sourceName: 'Isha Upanishad',
    chapterNumber: 1,
    startVerse: 1,
    endVerse: 18,
    verseNumber: 1,
    coordinateText: 'Isha Upanishad • Shanti Patha & Verses 1–18',
    canonicalRef: 'Isha Upanishad 1–18',
    summary: 'The famous Upanishadic declaration that Brahman is Infinite, the universe is Infinite; taking Infinity from Infinity leaves Infinity perfectly whole.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।\nपूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥\nॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'oṁ pūrṇam-adaḥ pūrṇam-idaṁ pūrṇāt-pūrṇam-udacyate | pūrṇasya pūrṇam-ādāya pūrṇam-evāvaśiṣyate || oṁ śāntiḥ śāntiḥ śāntiḥ ||',
        english: 'That Brahman is Infinite Wholeness; this manifest universe is Infinite Wholeness. From Wholeness proceeds Wholeness. Taking Wholeness from Wholeness, Wholeness alone remains.',
        hindi: 'वह परब्रह्म पूर्ण है और यह जगत भी पूर्ण है। पूर्ण से ही पूर्ण का प्राकट्य होता है। पूर्ण में से पूर्ण को निकाल लेने पर भी पूर्ण ही शेष रहता है। ॐ शान्तिः शान्तिः शान्तिः।'
      }
    ]
  },
  {
    id: 'asato-ma-sadgamaya',
    name: 'Pavamana Mantra (Asato Ma Sadgamaya)',
    sanskritName: 'असतो मा सद्गमय (पावमान मंत्र)',
    category: 'Upanishadic Shanti',
    deityOrTheme: 'Journey from Illusion to Truth, Darkness to Light',
    exactScripture: 'Brihadaranyaka Upanishad (बृहदारण्यकोपनिषद्)',
    sourceName: 'Brihadaranyaka Upanishad',
    chapterNumber: 1,
    startVerse: 28,
    endVerse: 28,
    verseNumber: 28,
    coordinateText: 'Brihadaranyaka Upanishad • Chapter 1, Section 3, Verse 28',
    canonicalRef: 'Brihadaranyaka 1.3.28',
    summary: 'The universal prayer leading the human spirit from the unreal to the Real, from darkness to Light, and from mortality to Immortality.',
    verses: [
      {
        verseNumber: 28,
        sanskrit: 'ॐ असतो मा सद्गमय।\nतमसो मा ज्योतिर्गमय।\nमृत्योर्मा अमृतं गमय॥\nॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'oṁ asato mā sad-gamaya | tamaso mā jyotir-gamaya | mṛtyor-mā amṛtaṁ gamaya || oṁ śāntiḥ śāntiḥ śāntiḥ ||',
        english: 'Lead me from the unreal to the Real. Lead me from darkness to Light. Lead me from death to Immortality. Om Peace, Peace, Peace.',
        hindi: 'हे प्रभु! मुझे असत्य से सत्य की ओर ले चलें। मुझे अज्ञानान्धकार से ज्ञान के प्रकाश की ओर ले चलें। मुझे मृत्यु से अमरता (मोक्ष) की ओर ले चलें। ॐ शान्तिः शान्तिः शान्तिः।'
      }
    ]
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. EPICS & SUTRAS (रामायण, महाभारत एवं योगसूत्र)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'aditya-hridaya-stotram',
    name: 'Aditya Hridaya Stotram',
    sanskritName: 'आदित्यहृदय स्तोत्रम् (वाल्मीकि रामायण)',
    category: 'Puranic & Epic Stotram',
    deityOrTheme: 'Bhagavan Surya (Solar Energy, Courage & Invincible Victory)',
    exactScripture: 'Valmiki Ramayana (वाल्मीकि रामायण)',
    sourceName: 'Valmiki Ramayana',
    chapterNumber: 6105,
    startVerse: 1,
    endVerse: 29,
    verseNumber: 1,
    coordinateText: 'Valmiki Ramayana • Yuddha Kanda, Sarga 105 (Verses 1–29)',
    canonicalRef: 'VR Yuddha Kanda 105.1–29',
    summary: 'The secret solar hymn imparted by Sage Agastya to Sri Rama on the battlefield of Lanka, awakening the all-conquering solar light to destroy all obstacles and negativity.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'ततो युद्धपरिश्रान्तं समरे चिन्तया स्थितम्।\nरावणं चाग्रतो दृष्ट्वा युध्दाय समुपस्थितम्॥',
        transliteration: 'tato yuddha-pariśrāntaṁ samare cintayā sthitam | rāvaṇaṁ cāgrato dṛṣṭvā yuddhāya samupasthitam ||',
        english: 'Seeing Sri Rama standing exhausted on the battlefield, deeply contemplating, with Ravana stationed before him ready for combat...',
        hindi: 'युद्ध से थके हुए और रणभूमि में चिंतामग्न खड़े श्रीराम को देखकर, तथा रावण को सामने युद्ध के लिए उपस्थित देखकर...'
      }
    ]
  },
  {
    id: 'vishnu-sahasranama',
    name: 'Vishnu Sahasranama Stotram',
    sanskritName: 'विष्णुसहस्रनाम स्तोत्रम् (महाभारत)',
    category: 'Puranic & Epic Stotram',
    deityOrTheme: 'The 1,000 Divine Names of Mahavishnu',
    exactScripture: 'Mahabharata (महाभारत)',
    sourceName: 'Mahabharata',
    chapterNumber: 13149,
    startVerse: 1,
    endVerse: 13,
    verseNumber: 1,
    coordinateText: 'Mahabharata • Anushasana Parva, Adhyaya 149 (Verses 1–13)',
    canonicalRef: 'MBH Anushasana Parva 149',
    summary: 'Grandfather Bhishma’s crowning teaching to Yudhishthira from the bed of arrows, revealing the 1,000 holy names of the Supreme Lord as the easiest path to liberation.',
    verses: [
      {
        verseNumber: 1,
        sanskrit: 'यस्य स्मरणमात्रेण जन्मसंसारबन्धनात्।\nविमुच्यते नमस्तस्मै विष्णवे प्रभविष्णवे॥',
        transliteration: 'yasya smaraṇa-mātreṇa janma-saṁsāra-bandhanāt | vimucyate namas-tasmai viṣṇave prabhaviṣṇave ||',
        english: 'Salutations to that all-pervading Lord Vishnu, by mere remembrance of whom one is released from the bondages of birth and samsara.',
        hindi: 'जिनके स्मरण मात्र से मनुष्य जन्म और संसार के बंधनों से मुक्त हो जाता है, उन सर्वसमर्थ भगवान विष्णु को नमस्कार है।'
      }
    ]
  },
  {
    id: 'patanjali-yoga-sutra-1-2',
    name: 'Yogas Chitta Vritti Nirodhah (Definition of Yoga)',
    sanskritName: 'योगश्चित्तवृत्तिनिरोधः (योगसूत्र)',
    category: 'Puranic & Epic Stotram',
    deityOrTheme: 'The Stillness of Consciousness & Self-Realization',
    exactScripture: 'Patanjali Yoga Sutras (पातञ्जल योगसूत्र)',
    sourceName: 'Patanjali Yoga Sutras',
    chapterNumber: 1,
    startVerse: 2,
    endVerse: 3,
    verseNumber: 2,
    coordinateText: 'Patanjali Yoga Sutras • Samadhi Pada, Sutra 1.2–1.3',
    canonicalRef: 'Yoga Sutras 1.2–1.3',
    summary: 'The foundational master-sutra of Indian psychology and meditation: Yoga is the intentional calming and resolution of the fluctuations of the mind-field.',
    verses: [
      {
        verseNumber: 2,
        sanskrit: 'योगश्चित्तवृत्तिनिरोधः॥\nतदा द्रष्टुः स्वरूपेऽवस्थानम्॥',
        transliteration: 'yogaś-citta-vṛtti-nirodhaḥ || tadā draṣṭuḥ sva-rūpe\'vasthānam ||',
        english: 'Yoga is the cessation of the modifications of the mind. Then the Seer abides in its own true transcendental nature.',
        hindi: 'चित्त की वृत्तियों का निरोध ही योग है। तब दृष्टा (आत्मा) अपने वास्तविक स्वरूप में प्रतिष्ठित हो जाता है।'
      }
    ]
  }
];
