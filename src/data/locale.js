// ============================================================
// Town Pizza Planet — Lightweight translations
// ============================================================
// Supports: English, Kannada, Hindi, Urdu
// ============================================================

const MESSAGES = {
  en: {
    langChanged: 'Language updated to English.',
    sessionReset: 'Your session has been reset.',
    cartCleared: '🗑️ Your cart has been cleared.',
    cancelled: '❌ Cancelled.',
    orderCancelled: '❌ Order cancelled.',
    confirmPlease: 'Please reply YES to place the order or NO to cancel.',
    addressTooShort:
      'Please enter your complete delivery address (at least 5 characters).',
    invalidRemove: 'I could not find that item in your cart.',
    sizeCancelHint: 'Size selection cancelled.',
    removed: (name) => `✅ Removed ${name} from your cart.`,
  },

  kn: {
    langChanged: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
    sessionReset: 'ನಿಮ್ಮ ಸೆಷನ್ ಅನ್ನು ಮರುಹೊಂದಿಸಲಾಗಿದೆ.',
    cartCleared: '🗑️ ನಿಮ್ಮ ಕಾರ್ಟ್ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ.',
    cancelled: '❌ ರದ್ದುಪಡಿಸಲಾಗಿದೆ.',
    orderCancelled: '❌ ಆರ್ಡರ್ ರದ್ದುಪಡಿಸಲಾಗಿದೆ.',
    confirmPlease:
      'ಆರ್ಡರ್ ಮಾಡಲು YES ಅಥವಾ ರದ್ದು ಮಾಡಲು NO ಎಂದು ಕಳುಹಿಸಿ.',
    addressTooShort:
      'ದಯವಿಟ್ಟು ಸಂಪೂರ್ಣ ಡೆಲಿವರಿ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 5 ಅಕ್ಷರಗಳು).',
    invalidRemove: 'ನಿಮ್ಮ ಕಾರ್ಟ್‌ನಲ್ಲಿ ಆ ಐಟಂ ಕಂಡುಬಂದಿಲ್ಲ.',
    sizeCancelHint: 'ಸೈಸ್ ಆಯ್ಕೆ ರದ್ದುಪಡಿಸಲಾಗಿದೆ.',
    removed: (name) => `✅ ${name} ಅನ್ನು ಕಾರ್ಟ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`,
  },

  hi: {
    langChanged: 'भाषा हिंदी में बदल दी गई है।',
    sessionReset: 'आपका सेशन रीसेट कर दिया गया है।',
    cartCleared: '🗑️ आपका कार्ट खाली कर दिया गया है।',
    cancelled: '❌ रद्द किया गया।',
    orderCancelled: '❌ ऑर्डर रद्द कर दिया गया।',
    confirmPlease:
      'ऑर्डर करने के लिए YES और रद्द करने के लिए NO भेजें।',
    addressTooShort:
      'कृपया पूरा डिलीवरी पता लिखें (कम से कम 5 अक्षर)।',
    invalidRemove: 'आपके कार्ट में यह आइटम नहीं मिला।',
    sizeCancelHint: 'साइज़ चयन रद्द किया गया।',
    removed: (name) => `✅ ${name} को कार्ट से हटा दिया गया।`,
  },

  ur: {
    langChanged: 'زبان اردو میں تبدیل کر دی گئی ہے۔',
    sessionReset: 'آپ کا سیشن ری سیٹ کر دیا گیا ہے۔',
    cartCleared: '🗑️ آپ کی کارٹ صاف کر دی گئی ہے۔',
    cancelled: '❌ منسوخ کر دیا گیا۔',
    orderCancelled: '❌ آرڈر منسوخ کر دیا گیا۔',
    confirmPlease:
      'آرڈر کرنے کے لیے YES اور منسوخ کرنے کے لیے NO بھیجیں۔',
    addressTooShort:
      'براہ کرم مکمل ڈیلیوری ایڈریس لکھیں (کم از کم 5 حروف)۔',
    invalidRemove: 'آپ کی کارٹ میں یہ آئٹم نہیں ملا۔',
    sizeCancelHint: 'سائز کا انتخاب منسوخ کر دیا گیا۔',
    removed: (name) => `✅ ${name} کو کارٹ سے ہٹا دیا گیا۔`,
  },
};

function tr(key, lang = 'en') {
  const selected = MESSAGES[lang] || MESSAGES.en;

  if (Object.prototype.hasOwnProperty.call(selected, key)) {
    return selected[key];
  }

  if (Object.prototype.hasOwnProperty.call(MESSAGES.en, key)) {
    return MESSAGES.en[key];
  }

  return String(key);
}

module.exports = {
  tr,
  MESSAGES,
};
