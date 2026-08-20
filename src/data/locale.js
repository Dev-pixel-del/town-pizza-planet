const LANGS = ['en', 'kn', 'hi', 'ur'];

const languagePrompt =
  '🍕 *WELCOME TO TOWN PIZZA PLANET!*\n\n' +
  '🚚 *FREE DELIVERY on orders ₹150+* 🎉\n' +
  '💵 *CASH ON DELIVERY*\n\n' +
  'Choose your language / ನಿಮ್ಮ ಭಾಷೆ / अपनी भाषा / اپنی زبان:\n\n' +
  '1️⃣ ಕನ್ನಡ\n2️⃣ English\n3️⃣ हिंदी\n4️⃣ اردو';

const t = {
  welcome: {
    en: name => `🍕 *Welcome ${name || 'to'}! to Town Pizza Planet*\n\n🚚 *FREE DELIVERY on orders ₹150+* 🎉\n💵 *Cash on Delivery*\n\nWhat would you like today?`,
    kn: name => `🍕 *Town Pizza Planet ಗೆ ಸ್ವಾಗತ ${name || ''}!*\n\n🚚 *₹150+ ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ಡೆಲಿವರಿ* 🎉\n💵 *ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ*\n\nಏನು ಬೇಕು?`,
    hi: name => `🍕 *Town Pizza Planet में आपका स्वागत है ${name || ''}!*\n\n🚚 *₹150+ के ऑर्डर पर FREE DELIVERY* 🎉\n💵 *कैश ऑन डिलीवरी*\n\nआप क्या लेना चाहेंगे?`,
    ur: name => `🍕 *Town Pizza Planet میں خوش آمدید ${name || ''}!*\n\n🚚 *₹150+ کے آرڈر پر مفت ڈیلیوری* 🎉\n💵 *کیش آن ڈیلیوری*\n\nآپ کیا لینا چاہیں گے؟`,
  },
  mainMenu: {
    en: 'Please choose a category:\n\n🍕 *Pizza*\n🍔 *Burgers*\n🥪 *Sandwiches*\n🍟 *Sides*\n🥤 *Shakes*\n🥤 *Cold Drinks & Water*\n🎁 *Combos*\n🛒 *My Cart*',
    kn: 'ವಿಭಾಗ ಆಯ್ಕೆ ಮಾಡಿ:\n\n🍕 *ಪಿಜ್ಜಾ*\n🍔 *ಬರ್ಗರ್*\n🥪 *ಸ್ಯಾಂಡ್‌ವಿಚ್*\n🍟 *ಸೈಡ್ಸ್*\n🥤 *ಶೇಕ್ಸ್*\n🥤 *ಕೋಲ್ಡ್ ಡ್ರಿಂಕ್ಸ್ & ವಾಟರ್*\n🎁 *ಕಾಂಬೊ*\n🛒 *ನನ್ನ ಕಾರ್ಟ್*',
    hi: 'एक कैटेगरी चुनें:\n\n🍕 *पिज़्ज़ा*\n🍔 *बर्गर*\n🥪 *सैंडविच*\n🍟 *साइड्स*\n🥤 *शेक्स*\n🥤 *कोल्ड ड्रिंक और पानी*\n🎁 *कॉम्बो*\n🛒 *मेरा कार्ट*',
    ur: 'ایک کیٹیگری منتخب کریں:\n\n🍕 *پیزا*\n🍔 *برگر*\n🥪 *سینڈوچ*\n🍟 *سائیڈز*\n🥤 *شیکس*\n🥤 *کولڈ ڈرنکس اور پانی*\n🎁 *کومبو*\n🛒 *میرا کارٹ*',
  },
  combosHeader: { en: '🎁 *COMBOS*', kn: '🎁 *ಕಾಂಬೋಗಳು*', hi: '🎁 *कॉम्बो*', ur: '🎁 *کومبو*' },
  cartEmpty: { en: '🛒 Your cart is empty. Type *menu* to start.', kn: '🛒 ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ. *menu* ಟೈಪ್ ಮಾಡಿ.', hi: '🛒 आपका कार्ट खाली है। *menu* टाइप करें.', ur: '🛒 آپ کا کارٹ خالی ہے۔ *menu* ٹائپ کریں.' },
  cartTitle: { en: '🛒 *YOUR CART*', kn: '🛒 *ನಿಮ್ಮ ಕಾರ್ಟ್*', hi: '🛒 *आपका कार्ट*', ur: '🛒 *آپ کا کارٹ*' },
  cartOptions: { en: 'Add more items, or type *checkout* to place your order.', kn: 'ಇನ್ನಷ್ಟು ಸೇರಿಸಿ ಅಥವಾ ಆರ್ಡರ್ ಮಾಡಲು *checkout* ಟೈಪ್ ಮಾಡಿ.', hi: 'और आइटम जोड़ें या ऑर्डर के लिए *checkout* टाइप करें.', ur: 'مزید آئٹمز شامل کریں یا آرڈر کے لیے *checkout* ٹائپ کریں.' },
  freeDelivery: { en: '🚚 *FREE DELIVERY UNLOCKED!* 🎉', kn: '🚚 *ಉಚಿತ ಡೆಲಿವರಿ ಲಭ್ಯ!* 🎉', hi: '🚚 *FREE DELIVERY मिल गई!* 🎉', ur: '🚚 *مفت ڈیلیوری ان لاک ہوگئی!* 🎉' },
  freeDeliveryGap: { en: amount => `🚚 You are only ₹${amount} away from *FREE DELIVERY*! 🎉\nAdd something to reach ₹150.`, kn: amount => `🚚 *ಉಚಿತ ಡೆಲಿವರಿ* ಪಡೆಯಲು ಇನ್ನೂ ₹${amount} ಮಾತ್ರ! 🎉\n₹150 ತಲುಪಲು ಏನಾದರೂ ಸೇರಿಸಿ.`, hi: amount => `🚚 *FREE DELIVERY* पाने के लिए सिर्फ ₹${amount} बाकी हैं! 🎉\n₹150 तक पहुंचने के लिए कुछ जोड़ें.`, ur: amount => `🚚 *مفت ڈیلیوری* کے لیے صرف ₹${amount} باقی ہیں! 🎉\n₹150 تک پہنچنے کے لیے کچھ شامل کریں.` },
  locationPrompt: { en: '📍 Please *share your current WhatsApp location* so we can deliver your order.\n\nTap 📎 → *Location* → *Send your current location*.', kn: '📍 ದಯವಿಟ್ಟು ನಿಮ್ಮ *WhatsApp ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು* ಹಂಚಿಕೊಳ್ಳಿ.\n\n📎 → *Location* → *Send your current location* ಆಯ್ಕೆ ಮಾಡಿ.', hi: '📍 कृपया अपना *WhatsApp current location* शेयर करें.\n\n📎 → *Location* → *Send your current location* चुनें.', ur: '📍 براہ کرم اپنی *WhatsApp موجودہ لوکیشن* شیئر کریں۔\n\n📎 → *Location* → *Send your current location* منتخب کریں.' },
  locationReceived: { en: '📍 *Location received!* ✅\n\nPlease send a nearby *landmark* so our delivery partner can find you easily.', kn: '📍 *ಲೊಕೇಶನ್ ಸಿಕ್ಕಿದೆ!* ✅\n\nಡೆಲಿವರಿ ಪಾರ್ಟ್ನರ್‌ಗೆ ಸುಲಭವಾಗಲು ಹತ್ತಿರದ *ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್* ಕಳುಹಿಸಿ.', hi: '📍 *लोकेशन मिल गई!* ✅\n\nडिलीवरी के लिए पास का कोई *लैंडमार्क* भेजें.', ur: '📍 *لوکیشن موصول ہوگئی!* ✅\n\nڈیلیوری آسان بنانے کے لیے قریب کا *لینڈ مارک* بھیجیں۔' },
  minOrder: { en: amount => `🚚 Free delivery is available on orders of *₹150 or more*.\n\nAdd ₹${amount} more to place a delivery order.`, kn: amount => `🚚 *₹150 ಅಥವಾ ಅದಕ್ಕಿಂತ ಹೆಚ್ಚು* ಆರ್ಡರ್‌ಗಳಿಗೆ ಉಚಿತ ಡೆಲಿವರಿ.\n\nಡೆಲಿವರಿ ಮಾಡಲು ಇನ್ನೂ ₹${amount} ಸೇರಿಸಿ.`, hi: amount => `🚚 *₹150 या उससे अधिक* के ऑर्डर पर FREE DELIVERY है.\n\nडिलीवरी के लिए ₹${amount} और जोड़ें.`, ur: amount => `🚚 *₹150 یا اس سے زیادہ* کے آرڈر پر مفت ڈیلیوری ہے۔\n\nڈیلیوری کے لیے ₹${amount} مزید شامل کریں۔` },
  orderSummary: { en: '🧾 *ORDER SUMMARY*', kn: '🧾 *ಆರ್ಡರ್ ಸಾರಾಂಶ*', hi: '🧾 *ऑर्डर सारांश*', ur: '🧾 *آرڈر کا خلاصہ*' },
  confirm: { en: 'Confirm your order?\n\n✅ *yes* to confirm\n✏️ *edit* to change\n❌ *no* to cancel', kn: 'ನಿಮ್ಮ ಆರ್ಡರ್ ದೃಢೀಕರಿಸಬೇಕೇ?\n\n✅ ದೃಢೀಕರಿಸಲು *yes*\n✏️ ಬದಲಾಯಿಸಲು *edit*\n❌ ರದ್ದು ಮಾಡಲು *no*', hi: 'ऑर्डर कन्फ़र्म करें?\n\n✅ पुष्टि के लिए *yes*\n✏️ बदलने के लिए *edit*\n❌ रद्द करने के लिए *no*', ur: 'آرڈر کنفرم کریں؟\n\n✅ کنفرم کے لیے *yes*\n✏️ تبدیلی کے لیے *edit*\n❌ منسوخ کرنے کے لیے *no*' },
  orderPlaced: { en: (id, total) => `🎉 *ORDER CONFIRMED!*\n\n📦 Order: *${id}*\n💵 Total: *₹${total}*\n🚚 *FREE DELIVERY*\n💵 Payment: *Cash on Delivery*\n\n👨‍🍳 Your order is being prepared.`, kn: (id, total) => `🎉 *ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!*\n\n📦 ಆರ್ಡರ್: *${id}*\n💵 ಒಟ್ಟು: *₹${total}*\n🚚 *ಉಚಿತ ಡೆಲಿವರಿ*\n💵 ಪಾವತಿ: *ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ*\n\n👨‍🍳 ನಿಮ್ಮ ಆರ್ಡರ್ ತಯಾರಾಗುತ್ತಿದೆ.`, hi: (id, total) => `🎉 *ऑर्डर कन्फ़र्म!*\n\n📦 ऑर्डर: *${id}*\n💵 कुल: *₹${total}*\n🚚 *FREE DELIVERY*\n💵 भुगतान: *कैश ऑन डिलीवरी*\n\n👨‍🍳 आपका ऑर्डर तैयार किया जा रहा है.`, ur: (id, total) => `🎉 *آرڈر کنفرم!*\n\n📦 آرڈر: *${id}*\n💵 کل: *₹${total}*\n🚚 *مفت ڈیلیوری*\n💵 ادائیگی: *کیش آن ڈیلیوری*\n\n👨‍🍳 آپ کا آرڈر تیار کیا جا رہا ہے۔` },
  status: {
    accepted: { en: id => `✅ Order *${id}* accepted.`, kn: id => `✅ ಆರ್ಡರ್ *${id}* ಸ್ವೀಕರಿಸಲಾಗಿದೆ.`, hi: id => `✅ ऑर्डर *${id}* स्वीकार कर लिया गया.`, ur: id => `✅ آرڈر *${id}* قبول کر لیا گیا۔` },
    preparing: { en: () => '👨‍🍳 Your order is being prepared.', kn: () => '👨‍🍳 ನಿಮ್ಮ ಆರ್ಡರ್ ತಯಾರಾಗುತ್ತಿದೆ.', hi: () => '👨‍🍳 आपका ऑर्डर तैयार किया जा रहा है.', ur: () => '👨‍🍳 آپ کا آرڈر تیار کیا جا رہا ہے۔' },
    ready: { en: () => '🍕 Your order is ready!', kn: () => '🍕 ನಿಮ್ಮ ಆರ್ಡರ್ ಸಿದ್ಧವಾಗಿದೆ!', hi: () => '🍕 आपका ऑर्डर तैयार है!', ur: () => '🍕 آپ کا آرڈر تیار ہے!' },
    out_for_delivery: { en: () => '🛵 Your order is out for delivery!', kn: () => '🛵 ನಿಮ್ಮ ಆರ್ಡರ್ ಡೆಲಿವರಿಗೆ ಹೊರಟಿದೆ!', hi: () => '🛵 आपका ऑर्डर डिलीवरी के लिए निकल गया है!', ur: () => '🛵 آپ کا آرڈر ڈیلیوری کے لیے روانہ ہوگیا ہے!' },
    delivered: { en: () => '🎉 Your order has been delivered. Thank you for ordering from Town Pizza Planet! ❤️', kn: () => '🎉 ನಿಮ್ಮ ಆರ್ಡರ್ ಡೆಲಿವರ್ ಆಗಿದೆ. Town Pizza Planet ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿದಕ್ಕೆ ಧನ್ಯವಾದ! ❤️', hi: () => '🎉 आपका ऑर्डर डिलीवर हो गया. Town Pizza Planet से ऑर्डर करने के लिए धन्यवाद! ❤️', ur: () => '🎉 آپ کا آرڈر ڈیلیور ہوگیا۔ Town Pizza Planet سے آرڈر کرنے کا شکریہ! ❤️' },
    cancelled: { en: () => '❌ Your order has been cancelled.', kn: () => '❌ ನಿಮ್ಮ ಆರ್ಡರ್ ರದ್ದು ಮಾಡಲಾಗಿದೆ.', hi: () => '❌ आपका ऑर्डर रद्द कर दिया गया है.', ur: () => '❌ آپ کا آرڈر منسوخ کردیا گیا ہے۔' },
  },
  generic: {
    unknown: { en: '🤔 I did not understand that. Type *menu* to browse, *cart* to view your order, or *help* for help.', kn: '🤔 ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. *menu*, *cart* ಅಥವಾ *help* ಟೈಪ್ ಮಾಡಿ.', hi: '🤔 मुझे समझ नहीं आया. *menu*, *cart* या *help* टाइप करें.', ur: '🤔 مجھے سمجھ نہیں آیا۔ *menu*، *cart* یا *help* ٹائپ کریں۔' },
    cancelled: { en: '❌ Cancelled.', kn: '❌ ರದ್ದು ಮಾಡಲಾಗಿದೆ.', hi: '❌ रद्द किया गया.', ur: '❌ منسوخ کردیا.' },
  },
};

function tr(key, lang = 'en') {
  const value = t[key];
  if (!value) return key;
  if (typeof value === 'string' || typeof value === 'function') return value;
  return value[lang] ?? value.en ?? key;
}

module.exports = { LANGS, languagePrompt, t, tr };
