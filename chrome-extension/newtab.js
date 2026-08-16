const CURATED_SHLOKAS = [
  {
    source_name: 'Bhagavad Gita',
    chapter_number: 2,
    verse_number: 47,
    sanskrit_text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥',
    transliteration: 'karmaṇy-evādhikāras te mā phaleṣu kadācana |\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi ||',
    translation_english: 'You have a right only to work, never to its fruits; let not the fruits of action be your motive, nor let your attachment be to inaction.',
    translation_hindi: 'तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए कर्मफल के हेतु मत बनो और न ही तुम्हारी अकर्मण्यता में आसक्ति हो।',
    modern_reflection: 'Focus fully on craftsmanship and duty in the present moment without mental exhaustion over future outcomes.',
    audio_path: 'https://dharma-pragya.vercel.app/api/audio/2/47.mp3'
  },
  {
    source_name: 'Bhagavad Gita',
    chapter_number: 6,
    verse_number: 5,
    sanskrit_text: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥',
    transliteration: 'uddhared ātmanātmānaṁ nātmānam avasādayet |\nātmaiva hy ātmano bandhur ātmaiva ripur ātmanaḥ ||',
    translation_english: 'Let a person elevate themselves by their own mind, and not degrade themselves; for the mind alone is the friend of the self, and the mind alone is the enemy of the self.',
    translation_hindi: 'मनुष्य को चाहिए कि वह अपने मन द्वारा अपना उद्धार करे, अपना पतन न होने दे; क्योंकि मन ही स्वयं का मित्र है और मन ही स्वयं का शत्रु है।',
    modern_reflection: 'Self-mastery begins within. Train your intellect to be an unshakeable ally rather than your harshest critic.',
    audio_path: 'https://dharma-pragya.vercel.app/api/audio/6/5.mp3'
  },
  {
    source_name: 'Bhagavad Gita',
    chapter_number: 2,
    verse_number: 14,
    sanskrit_text: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः ।\nआगमापायिनोऽनित्यास्तांस्तितिक्षस्व भारत ॥',
    transliteration: 'mātrā-sparśās tu kaunteya śītoṣṇa-sukha-duḥkha-dāḥ |\nāgamāpāyino \'nityās tāṁs titikṣasva bhārata ||',
    translation_english: 'The contacts of the senses with their objects give rise to cold and heat, pleasure and pain. They have a beginning and an end, and are impermanent. Endure them bravely.',
    translation_hindi: 'हे कुन्तीपुत्र! इन्द्रियों और उनके विषयों का संयोग सर्दी-गर्मी और सुख-दुःख देने वाला है। ये आने-जाने वाले और अनित्य हैं, अतः इन्हें धैर्यपूर्वक सहन करो।',
    modern_reflection: 'Emotional resilience (Titiksha) is cultivating quiet composure amid temporary external praise and criticism.',
    audio_path: 'https://dharma-pragya.vercel.app/api/audio/2/14.mp3'
  },
  {
    source_name: 'Isha Upanishad',
    chapter_number: 1,
    verse_number: 1,
    sanskrit_text: 'ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् ।\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम् ॥',
    transliteration: 'īśā vāsyam idaṁ sarvaṁ yat kiñca jagatyāṁ jagat |\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam ||',
    translation_english: 'All this, whatever moves in this moving world, is pervaded by the Divine. Enjoy through renunciation; do not covet anyone\'s wealth.',
    translation_hindi: 'इस गतिशील जगत में जो कुछ भी है, वह सब ईश्वर से व्याप्त है। त्यागपूर्वक उसका उपभोग करो; किसी के धन का लोभ मत करो।',
    modern_reflection: 'Live with deep gratitude and conscious awareness rather than obsessive possessiveness.',
    audio_path: ''
  },
  {
    source_name: 'Patanjali Yoga Sutras',
    chapter_number: 1,
    verse_number: 2,
    sanskrit_text: 'योगश्चित्तवृत्तिनिरोधः ॥',
    transliteration: 'yogaś citta-vṛtti-nirodhaḥ ||',
    translation_english: 'Yoga is the stilling of the fluctuations and patterns of consciousness.',
    translation_hindi: 'चित्त की वृत्तियों (मन के चंचल विचारों) का निरोध ही योग है।',
    modern_reflection: 'True peace is not the absence of external noise, but the quiet center of an unruffled mind.',
    audio_path: ''
  }
];

function getDailyIndex() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % CURATED_SHLOKAS.length;
}

const currentShloka = CURATED_SHLOKAS[getDailyIndex()];
let currentLang = 'english';
let audio = null;
let isPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('date-display').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  renderShloka();

  document.getElementById('lang-btn').addEventListener('click', () => {
    currentLang = currentLang === 'english' ? 'hindi' : 'english';
    document.getElementById('lang-btn').textContent = currentLang === 'english' ? 'हिन्दी' : 'English';
    renderShloka();
  });

  const chantBtn = document.getElementById('chant-btn');
  if (currentShloka.audio_path) {
    chantBtn.addEventListener('click', toggleAudio);
  } else {
    chantBtn.style.display = 'none';
  }

  const exploreLink = document.getElementById('explore-link');
  exploreLink.href = `https://dharma-pragya.vercel.app/?mode=read&source=${encodeURIComponent(currentShloka.source_name)}&chapter=${currentShloka.chapter_number}&verse=${currentShloka.verse_number}`;
});

function renderShloka() {
  document.getElementById('coordinate').textContent = `${currentShloka.source_name} — Chapter ${currentShloka.chapter_number}, Verse ${currentShloka.verse_number}`;
  document.getElementById('sanskrit').textContent = currentShloka.sanskrit_text;
  document.getElementById('transliteration').textContent = currentShloka.transliteration;
  document.getElementById('translation').textContent = currentLang === 'english' ? currentShloka.translation_english : currentShloka.translation_hindi;
  document.getElementById('reflection').textContent = currentShloka.modern_reflection;
}

function toggleAudio() {
  if (isPlaying && audio) {
    audio.pause();
    isPlaying = false;
    document.getElementById('chant-btn').textContent = '▶ Play Chant';
  } else {
    if (!audio) {
      audio = new Audio(currentShloka.audio_path);
      audio.onended = () => {
        isPlaying = false;
        document.getElementById('chant-btn').textContent = '▶ Play Chant';
      };
    }
    audio.play().then(() => {
      isPlaying = true;
      document.getElementById('chant-btn').textContent = '❚❚ Pause';
    }).catch(() => {});
  }
}
