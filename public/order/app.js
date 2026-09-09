/* Town Pizza Planet — Animated online ordering website — build 2026-09-03-v9 */
/* Town Pizza Planet — Animated online ordering website */

const I18N = {
  en: {
    selectLanguage:'Select your language', welcome:'Welcome to Town Pizza Planet!', startSubtitle:'Choose a language to start ordering.',
    home:'Home', bestsellers:'Best Sellers', menu:'Menu', combos:'Combo Deals', family:'Family Packs', cart:'Cart', language:'Language', lightMode:'Light', darkMode:'Dark',
    popularNow:'Popular now', viewAll:'View all →', fresh:'Your town’s favorite slice of the planet', freshFromKitchen:'Fresh from the kitchen',
    browseMenu:'Browse Menu', chooseCategory:'Choose a category', search:'Search pizza, burger, shake...', all:'All', veg:'Veg', nonVeg:'Non-Veg', under300:'Under ₹300',
    addToCart:'Add to Cart', add:'Add', added:'Added', extraCheese:'Extra Cheese', extraCheeseAdded:'Extra Cheese added', addWithCheese:'Add to Cart + Extra Cheese',
    quantity:'Quantity', cartEmpty:'Your cart is empty.', yourOrder:'Your Order', subtotal:'Subtotal', delivery:'Delivery', total:'Total',
    checkout:'Checkout', addMore:'Add More', clear:'Clear', secureCheckout:'Secure checkout', deliveryDetails:'Delivery Details',
    name:'Your name', enterName:'Enter your full name', mobile:'Mobile number', enterMobile:'Enter 10-digit mobile number', address:'Delivery address',
    enterAddress:'House / Shop, Street, Area, City', landmark:'Landmark (optional)', enterLandmark:'Nearby landmark',
    deliveryArea:'Delivery area', selectArea:'Select your delivery area', gpsTitle:'Accurate delivery location', gpsHint:'Use your phone’s GPS together with your typed address for accurate delivery.', useGPS:'Use My Current Location',
    gpsCaptured:'GPS location captured', allowGPS:'Please allow location access in your browser and try again.', map:'Open map ↗',
    payment:'Payment', cod:'Cash on Delivery', codHint:'Pay when your order arrives.', placeOrder:'Place Order', placing:'Placing order…',
    orderConfirmed:'Order Confirmed', wereOnIt:'We’re on it!', received:'Your order has been received by Town Pizza Planet.', arriving:'Estimated arrival', about:'About', minutes:'minutes',
    cashTotal:'Cash on Delivery', keepPhone:'Keep your phone nearby. Our team may call you if we need anything.', backHome:'Back to Home', trackOrder:'Track Order',
    orderStatus:'Order status', receivedStatus:'Order received', preparing:'Preparing', ready:'Ready', outForDelivery:'Out for delivery', delivered:'Delivered', cancelled:'Cancelled',
    recentOrders:'Recent Orders', reorder:'Order Again', favorites:'Favorites', recentlyViewed:'Recently Viewed', noRecent:'No previous orders yet.',
    favorite:'Favorite', unfavorite:'Remove favorite', soldOut:'Sold Out', open:'OPEN', closed:'CLOSED', orderingUnavailable:'Ordering is currently closed.', storeClosedTitle:'Currently unavailable', storeClosedBody:'Please try again later. For immediate help, please call the restaurant.',
    contact:'Call', callUs:'Call restaurant', share:'Share', downloadReceipt:'Download Receipt', printReceipt:'Print / Save PDF',
    completeMeal:'Complete your meal', popularPairing:'Popular with your order', deliveryFree:'FREE', minimum:'Minimum', freeAbove:'Free delivery above',
    extraNeeded:'more needed', chooseDelivery:'Choose a delivery area to see charges.', noGPS:'GPS not provided',
    orderLookupFailed:'Could not load this order.', retry:'Try again', thanks:'Thank you for ordering from Town Pizza Planet!',
    receiptTitle:'Town Pizza Planet Receipt', estimated:'Estimated arrival', deliveryTitle:'Delivery', deliveryOutside:'We deliver beyond Devara Hipparagi',
    deliveryRuleText:'Inside Devara Hipparagi: ₹30 delivery, free on orders ₹199+ (about 30 min). Outside villages: minimum order ₹399; free delivery on orders ₹999+ (about 45 min).',
    vegTag:'VEG', nonVegTag:'NON-VEG', noResults:'No results found.', noDishes:'No dishes match your search.', locating:'Locating…', searchTitle:'Search',
    customerFavourites:'Customer favourites', menuSub:'Pizza, burgers, sandwiches & drinks', comboSub:'Value meals and special offers', familySub:'Big meals for families',
    deliveryRules:'Delivery rules', orderPlacedTitle:'Order placed successfully!', contactRestaurant:'Need help? Contact the restaurant', noOrders:'No orders yet.', restaurantNote:'Note to restaurant (optional)', restaurantNotePlaceholder:'Any special request for the restaurant?', feedbackTitle:'How was your order experience?', feedbackSubtitle:'Optional — tell us how we did.', feedbackSubmit:'Submit feedback', feedbackThanks:'Thank you for your feedback!', feedbackSkip:'You can skip this.'
  },
  kn: {
    selectLanguage:'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ', welcome:'ಟೌನ್ ಪಿಜ್ಜಾ ಪ್ಲಾನೆಟ್‌ಗೆ ಸ್ವಾಗತ!', startSubtitle:'ಆರ್ಡರ್ ಮಾಡಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    home:'ಮುಖಪುಟ', bestsellers:'ಹೆಚ್ಚು ಜನಪ್ರಿಯ', menu:'ಮೆನು', combos:'ಕಾಂಬೊ ಡೀಲ್ಸ್', family:'ಫ್ಯಾಮಿಲಿ ಪ್ಯಾಕ್ಸ್', cart:'ಕಾರ್ಟ್', language:'ಭಾಷೆ', lightMode:'ಲೈಟ್', darkMode:'ಡಾರ್ಕ್',
    popularNow:'ಜನಪ್ರಿಯ', viewAll:'ಎಲ್ಲವನ್ನೂ ನೋಡಿ →', fresh:'ನಿಮ್ಮ ಊರಿನ ನೆಚ್ಚಿನ ಪಿಜ್ಜಾ ಜಗತ್ತು', freshFromKitchen:'ಅಡುಗೆಮನೆಯಿಂದ ತಾಜಾ',
    browseMenu:'ಮೆನು ನೋಡಿ', chooseCategory:'ವರ್ಗ ಆಯ್ಕೆಮಾಡಿ', search:'ಪಿಜ್ಜಾ, ಬರ್ಗರ್, ಶೇಕ್ ಹುಡುಕಿ...', all:'ಎಲ್ಲಾ', veg:'ವೆಜ್', nonVeg:'ನಾನ್-ವೆಜ್', under300:'₹300 ಒಳಗೆ',
    addToCart:'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ', add:'ಸೇರಿಸಿ', added:'ಸೇರಿಸಲಾಗಿದೆ', extraCheese:'ಎಕ್ಸ್ಟ್ರಾ ಚೀಸ್', extraCheeseAdded:'ಎಕ್ಸ್ಟ್ರಾ ಚೀಸ್ ಸೇರಿಸಲಾಗಿದೆ', addWithCheese:'ಎಕ್ಸ್ಟ್ರಾ ಚೀಸ್ ಜೊತೆಗೆ ಸೇರಿಸಿ',
    quantity:'ಪ್ರಮಾಣ', cartEmpty:'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ.', yourOrder:'ನಿಮ್ಮ ಆರ್ಡರ್', subtotal:'ಉಪಮೊತ್ತ', delivery:'ಡೆಲಿವರಿ', total:'ಒಟ್ಟು',
    checkout:'ಚೆಕ್ಔಟ್', addMore:'ಮತ್ತಷ್ಟು ಸೇರಿಸಿ', clear:'ತೆರವುಗೊಳಿಸಿ', secureCheckout:'ಸುರಕ್ಷಿತ ಚೆಕ್ಔಟ್', deliveryDetails:'ಡೆಲಿವರಿ ವಿವರಗಳು',
    name:'ನಿಮ್ಮ ಹೆಸರು', enterName:'ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ', mobile:'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', enterMobile:'10 ಅಂಕೆಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', address:'ಡೆಲಿವರಿ ವಿಳಾಸ',
    enterAddress:'ಮನೆ / ಅಂಗಡಿ, ರಸ್ತೆ, ಪ್ರದೇಶ, ನಗರ', landmark:'ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್ (ಐಚ್ಛಿಕ)', enterLandmark:'ಹತ್ತಿರದ ಲ್ಯಾಂಡ್‌ಮಾರ್ಕ್',
    deliveryArea:'ಡೆಲಿವರಿ ಪ್ರದೇಶ', selectArea:'ಡೆಲಿವರಿ ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ', gpsTitle:'ನಿಖರ ಡೆಲಿವರಿ ಸ್ಥಳ', gpsHint:'ನಿಖರ ಡೆಲಿವರಿಗಾಗಿ GPS ಮತ್ತು ಟೈಪ್ ಮಾಡಿದ ವಿಳಾಸವನ್ನು ಬಳಸಿ.', useGPS:'ನನ್ನ ಸ್ಥಳ ಬಳಸಿ',
    gpsCaptured:'GPS ಸ್ಥಳ ಸಿಕ್ಕಿದೆ', allowGPS:'ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳ ಅನುಮತಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', map:'ನಕ್ಷೆ ತೆರೆಯಿರಿ ↗',
    payment:'ಪಾವತಿ', cod:'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ', codHint:'ಆರ್ಡರ್ ಬಂದಾಗ ಪಾವತಿಸಿ.', placeOrder:'ಆರ್ಡರ್ ಮಾಡಿ', placing:'ಆರ್ಡರ್ ಮಾಡಲಾಗುತ್ತಿದೆ…',
    orderConfirmed:'ಆರ್ಡರ್ ದೃಢಪಟ್ಟಿದೆ', wereOnIt:'ನಾವು ಪ್ರಾರಂಭಿಸಿದ್ದೇವೆ!', received:'ನಿಮ್ಮ ಆರ್ಡರ್ ಟೌನ್ ಪಿಜ್ಜಾ ಪ್ಲಾನೆಟ್‌ಗೆ ಬಂದಿದೆ.', arriving:'ಅಂದಾಜು ಆಗಮನ', about:'ಸುಮಾರು', minutes:'ನಿಮಿಷಗಳು',
    cashTotal:'ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ', keepPhone:'ಫೋನ್ ಹತ್ತಿರ ಇಡಿ. ಅಗತ್ಯವಿದ್ದರೆ ತಂಡ ಕರೆ ಮಾಡಬಹುದು.', backHome:'ಮುಖಪುಟಕ್ಕೆ', trackOrder:'ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್',
    orderStatus:'ಆರ್ಡರ್ ಸ್ಥಿತಿ', receivedStatus:'ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ', preparing:'ತಯಾರಿಸಲಾಗುತ್ತಿದೆ', ready:'ಸಿದ್ಧವಾಗಿದೆ', outForDelivery:'ಡೆಲಿವರಿಗೆ ಹೊರಟಿದೆ', delivered:'ಡೆಲಿವರಿ ಆಗಿದೆ', cancelled:'ರದ್ದು',
    recentOrders:'ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು', reorder:'ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಿ', favorites:'ಮೆಚ್ಚಿನವು', recentlyViewed:'ಇತ್ತೀಚೆಗೆ ನೋಡಿದವು', noRecent:'ಇನ್ನೂ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ.',
    favorite:'ಮೆಚ್ಚಿನದು', unfavorite:'ಮೆಚ್ಚಿನದಿಂದ ತೆಗೆದುಹಾಕಿ', soldOut:'ಮಾರಾಟವಾಗಿದೆ', open:'ತೆರೆದಿದೆ', closed:'ಮುಚ್ಚಲಾಗಿದೆ', orderingUnavailable:'ಈಗ ಆರ್ಡರ್ ಮುಚ್ಚಲಾಗಿದೆ.', storeClosedTitle:'ಪ್ರಸ್ತುತ ಲಭ್ಯವಿಲ್ಲ', storeClosedBody:'ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. ತಕ್ಷಣದ ಸಹಾಯಕ್ಕಾಗಿ ರೆಸ್ಟೋರೆಂಟ್‌ಗೆ ಕರೆ ಮಾಡಿ.',
    contact:'ಕರೆ', callUs:'ರೆಸ್ಟೋರೆಂಟ್‌ಗೆ ಕರೆ', share:'ಹಂಚಿ', downloadReceipt:'ರಸೀದಿ ಡೌನ್‌ಲೋಡ್', printReceipt:'ಪ್ರಿಂಟ್ / PDF',
    completeMeal:'ನಿಮ್ಮ ಊಟವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ', popularPairing:'ನಿಮ್ಮ ಆರ್ಡರ್ ಜೊತೆ ಜನಪ್ರಿಯ', deliveryFree:'ಉಚಿತ', minimum:'ಕನಿಷ್ಠ', freeAbove:'ಇದಕ್ಕಿಂತ ಮೇಲೆ ಉಚಿತ ಡೆಲಿವರಿ',
    extraNeeded:'ಇನ್ನಷ್ಟು ಅಗತ್ಯ', chooseDelivery:'ಚಾರ್ಜ್ ನೋಡಲು ಡೆಲಿವರಿ ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ.', noGPS:'GPS ನೀಡಲಾಗಿಲ್ಲ',
    orderLookupFailed:'ಆರ್ಡರ್ ಲೋಡ್ ಆಗಲಿಲ್ಲ.', retry:'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ', thanks:'ಟೌನ್ ಪಿಜ್ಜಾ ಪ್ಲಾನೆಟ್ ಆಯ್ಕೆ ಮಾಡಿದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು!',
    receiptTitle:'ಟೌನ್ ಪಿಜ್ಜಾ ಪ್ಲಾನೆಟ್ ರಸೀದಿ', estimated:'ಅಂದಾಜು ಆಗಮನ', deliveryTitle:'ಡೆಲಿವರಿ', deliveryOutside:'ದೇವರ ಹಿಪ್ಪರಗಿಯ ಹೊರಗೂ ಡೆಲಿವರಿ',
    deliveryRuleText:'ದೇವರ ಹಿಪ್ಪರಗಿ ಒಳಗೆ: ₹30 ಡೆಲಿವರಿ, ₹199+ ಆರ್ಡರ್‌ಗೆ ಉಚಿತ (ಸುಮಾರು 30 ನಿಮಿಷ). ಹೊರಗಿನ ಹಳ್ಳಿಗಳು: ಕನಿಷ್ಠ ₹399; ₹999+ ಆರ್ಡರ್‌ಗೆ ಉಚಿತ (ಸುಮಾರು 45 ನಿಮಿಷ).',
    vegTag:'ವೆಜ್', nonVegTag:'ನಾನ್-ವೆಜ್', noResults:'ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ.', noDishes:'ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಡಿಶ್ ಹೊಂದಲಿಲ್ಲ.', locating:'ಲೊಕೇಶನ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ…', searchTitle:'ಹುಡುಕು',
    customerFavourites:'ಗ್ರಾಹಕರ ಮೆಚ್ಚಿನವು', menuSub:'ಪಿಜ್ಜಾ, ಬರ್ಗರ್, ಸ್ಯಾಂಡ್‌ವಿಚ್ ಮತ್ತು ಡ್ರಿಂಕ್ಸ್', comboSub:'ವ್ಯಾಲ್ಯೂ ಮೀಲ್ ಮತ್ತು ಆಫರ್‌ಗಳು', familySub:'ಕುಟುಂಬಕ್ಕೆ ದೊಡ್ಡ ಊಟ',
    deliveryRules:'ಡೆಲಿವರಿ ನಿಯಮಗಳು', orderPlacedTitle:'ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಮಾಡಲಾಗಿದೆ!', contactRestaurant:'ಸಹಾಯ ಬೇಕೇ? ರೆಸ್ಟೋರೆಂಟ್‌ಗೆ ಕರೆ ಮಾಡಿ', noOrders:'ಇನ್ನೂ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ.', restaurantNote:'ರೆಸ್ಟೋರೆಂಟ್‌ಗೆ ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)', restaurantNotePlaceholder:'ರೆಸ್ಟೋರೆಂಟ್‌ಗೆ ಯಾವುದಾದರೂ ವಿಶೇಷ ವಿನಂತಿ ಇದೆಯೇ?', feedbackTitle:'ನಿಮ್ಮ ಆರ್ಡರ್ ಅನುಭವ ಹೇಗಿತ್ತು?', feedbackSubtitle:'ಐಚ್ಛಿಕ — ನಿಮ್ಮ ಅಭಿಪ್ರಾಯ ತಿಳಿಸಿ.', feedbackSubmit:'ಅಭಿಪ್ರಾಯ ಕಳುಹಿಸಿ', feedbackThanks:'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯಕ್ಕೆ ಧನ್ಯವಾದಗಳು!', feedbackSkip:'ಇದನ್ನು ಬಿಟ್ಟುಬಿಡಬಹುದು.'
  },
  hi: {
    selectLanguage:'अपनी भाषा चुनें', welcome:'टाउन पिज़्ज़ा प्लैनेट में आपका स्वागत है!', startSubtitle:'ऑर्डर शुरू करने के लिए भाषा चुनें।',
    home:'होम', bestsellers:'बेस्ट सेलर्स', menu:'मेन्यू', combos:'कॉम्बो डील्स', family:'फैमिली पैक्स', cart:'कार्ट', language:'भाषा', lightMode:'लाइट', darkMode:'डार्क',
    popularNow:'लोकप्रिय', viewAll:'सभी देखें →', fresh:'आपके शहर का पसंदीदा पिज़्ज़ा अनुभव', freshFromKitchen:'किचन से ताज़ा',
    browseMenu:'मेन्यू देखें', chooseCategory:'कैटेगरी चुनें', search:'पिज़्ज़ा, बर्गर, शेक खोजें...', all:'सभी', veg:'वेज', nonVeg:'नॉन-वेज', under300:'₹300 के अंदर',
    addToCart:'कार्ट में जोड़ें', add:'जोड़ें', added:'जोड़ा गया', extraCheese:'एक्स्ट्रा चीज़', extraCheeseAdded:'एक्स्ट्रा चीज़ जोड़ी गई', addWithCheese:'एक्स्ट्रा चीज़ के साथ जोड़ें',
    quantity:'मात्रा', cartEmpty:'आपका कार्ट खाली है।', yourOrder:'आपका ऑर्डर', subtotal:'उप-योग', delivery:'डिलीवरी', total:'कुल',
    checkout:'चेकआउट', addMore:'और जोड़ें', clear:'साफ़ करें', secureCheckout:'सुरक्षित चेकआउट', deliveryDetails:'डिलीवरी विवरण',
    name:'आपका नाम', enterName:'पूरा नाम दर्ज करें', mobile:'मोबाइल नंबर', enterMobile:'10 अंकों का मोबाइल नंबर', address:'डिलीवरी पता',
    enterAddress:'घर / दुकान, सड़क, क्षेत्र, शहर', landmark:'लैंडमार्क (वैकल्पिक)', enterLandmark:'पास का लैंडमार्क',
    deliveryArea:'डिलीवरी क्षेत्र', selectArea:'डिलीवरी क्षेत्र चुनें', gpsTitle:'सटीक डिलीवरी लोकेशन', gpsHint:'सटीक डिलीवरी के लिए GPS और लिखा हुआ पता दोनों उपयोग करें।', useGPS:'मेरी वर्तमान लोकेशन लें',
    gpsCaptured:'GPS लोकेशन मिल गई', allowGPS:'ब्राउज़र में लोकेशन की अनुमति दें और फिर कोशिश करें।', map:'मैप खोलें ↗',
    payment:'भुगतान', cod:'कैश ऑन डिलीवरी', codHint:'ऑर्डर आने पर भुगतान करें।', placeOrder:'ऑर्डर करें', placing:'ऑर्डर भेजा जा रहा है…',
    orderConfirmed:'ऑर्डर कन्फर्म', wereOnIt:'हम तैयार हैं!', received:'आपका ऑर्डर टाउन पिज़्ज़ा प्लैनेट को मिल गया है।', arriving:'अनुमानित आगमन', about:'लगभग', minutes:'मिनट',
    cashTotal:'कैश ऑन डिलीवरी', keepPhone:'फोन पास रखें। ज़रूरत होने पर हमारी टीम कॉल कर सकती है।', backHome:'होम पर जाएँ', trackOrder:'ऑर्डर ट्रैक करें',
    orderStatus:'ऑर्डर स्टेटस', receivedStatus:'ऑर्डर प्राप्त', preparing:'तैयार हो रहा है', ready:'तैयार', outForDelivery:'डिलीवरी के लिए निकला', delivered:'डिलीवर हो गया', cancelled:'रद्द',
    recentOrders:'हाल के ऑर्डर', reorder:'फिर से ऑर्डर करें', favorites:'पसंदीदा', recentlyViewed:'हाल में देखा', noRecent:'अभी कोई पिछला ऑर्डर नहीं।',
    favorite:'पसंदीदा', unfavorite:'पसंदीदा से हटाएँ', soldOut:'बिक गया', open:'खुला', closed:'बंद', orderingUnavailable:'अभी ऑर्डर बंद हैं।', storeClosedTitle:'अभी उपलब्ध नहीं', storeClosedBody:'कृपया थोड़ी देर बाद फिर प्रयास करें। तुरंत सहायता के लिए रेस्टोरेंट को कॉल करें।',
    contact:'कॉल', callUs:'रेस्टोरेंट को कॉल करें', share:'शेयर', downloadReceipt:'रसीद डाउनलोड', printReceipt:'प्रिंट / PDF',
    completeMeal:'अपना मील पूरा करें', popularPairing:'आपके ऑर्डर के साथ लोकप्रिय', deliveryFree:'फ्री', minimum:'न्यूनतम', freeAbove:'इसके ऊपर फ्री डिलीवरी',
    extraNeeded:'और चाहिए', chooseDelivery:'चार्ज देखने के लिए डिलीवरी क्षेत्र चुनें।', noGPS:'GPS नहीं दिया गया',
    orderLookupFailed:'ऑर्डर लोड नहीं हो सका।', retry:'फिर कोशिश करें', thanks:'टाउन पिज़्ज़ा प्लैनेट से ऑर्डर करने के लिए धन्यवाद!',
    receiptTitle:'टाउन पिज़्ज़ा प्लैनेट रसीद', estimated:'अनुमानित आगमन', deliveryTitle:'डिलीवरी', deliveryOutside:'देवर हिप्परगी के बाहर भी डिलीवरी',
    deliveryRuleText:'देवर हिप्परगी के अंदर: ₹30 डिलीवरी, ₹199+ पर फ्री (लगभग 30 मिनट)। बाहर के गाँव: न्यूनतम ₹399; ₹999+ पर फ्री डिलीवरी (लगभग 45 मिनट)।',
    vegTag:'वेज', nonVegTag:'नॉन-वेज', noResults:'कोई परिणाम नहीं मिला।', noDishes:'आपकी खोज से कोई डिश नहीं मिली।', locating:'लोकेशन खोजी जा रही है…', searchTitle:'खोज',
    customerFavourites:'ग्राहकों की पसंद', menuSub:'पिज़्ज़ा, बर्गर, सैंडविच और ड्रिंक्स', comboSub:'वैल्यू मील और खास ऑफर', familySub:'परिवार के लिए बड़े मील',
    deliveryRules:'डिलीवरी नियम', orderPlacedTitle:'ऑर्डर सफलतापूर्वक हो गया!', contactRestaurant:'मदद चाहिए? रेस्टोरेंट को कॉल करें', noOrders:'अभी कोई ऑर्डर नहीं।', restaurantNote:'रेस्टोरेंट के लिए नोट (वैकल्पिक)', restaurantNotePlaceholder:'रेस्टोरेंट के लिए कोई खास अनुरोध?', feedbackTitle:'आपका ऑर्डर अनुभव कैसा रहा?', feedbackSubtitle:'वैकल्पिक — हमें बताएं।', feedbackSubmit:'फीडबैक भेजें', feedbackThanks:'आपके फीडबैक के लिए धन्यवाद!', feedbackSkip:'इसे छोड़ सकते हैं।'
  },
  ur: {
    selectLanguage:'اپنی زبان منتخب کریں', welcome:'ٹاؤن پیزا پلینیٹ میں خوش آمدید!', startSubtitle:'آرڈر شروع کرنے کے لیے زبان منتخب کریں۔',
    home:'ہوم', bestsellers:'بیسٹ سیلرز', menu:'مینو', combos:'کومبو ڈیلز', family:'فیملی پیکس', cart:'کارٹ', language:'زبان', lightMode:'لائٹ', darkMode:'ڈارک',
    popularNow:'مقبول', viewAll:'سب دیکھیں →', fresh:'آپ کے شہر کے پسندیدہ پیزا کی دنیا', freshFromKitchen:'کچن سے تازہ',
    browseMenu:'مینو دیکھیں', chooseCategory:'کیٹیگری منتخب کریں', search:'پیزا، برگر، شیک تلاش کریں...', all:'سب', veg:'ویج', nonVeg:'نان ویج', under300:'₹300 سے کم',
    addToCart:'کارٹ میں شامل کریں', add:'شامل کریں', added:'شامل ہوگیا', extraCheese:'ایکسٹرا چیز', extraCheeseAdded:'ایکسٹرا چیز شامل ہوگئی', addWithCheese:'ایکسٹرا چیز کے ساتھ شامل کریں',
    quantity:'مقدار', cartEmpty:'آپ کا کارٹ خالی ہے۔', yourOrder:'آپ کا آرڈر', subtotal:'ذیلی کل', delivery:'ڈیلیوری', total:'کل',
    checkout:'چیک آؤٹ', addMore:'مزید شامل کریں', clear:'خالی کریں', secureCheckout:'محفوظ چیک آؤٹ', deliveryDetails:'ڈیلیوری کی تفصیل',
    name:'آپ کا نام', enterName:'پورا نام لکھیں', mobile:'موبائل نمبر', enterMobile:'10 ہندسوں کا موبائل نمبر', address:'ڈیلیوری پتہ',
    enterAddress:'گھر / دکان، سڑک، علاقہ، شہر', landmark:'لینڈ مارک (اختیاری)', enterLandmark:'قریبی لینڈ مارک',
    deliveryArea:'ڈیلیوری علاقہ', selectArea:'ڈیلیوری علاقہ منتخب کریں', gpsTitle:'درست ڈیلیوری لوکیشن', gpsHint:'درست ڈیلیوری کے لیے GPS اور لکھا ہوا پتہ دونوں استعمال کریں۔', useGPS:'میری موجودہ لوکیشن استعمال کریں',
    gpsCaptured:'GPS لوکیشن حاصل ہوگئی', allowGPS:'براؤزر میں لوکیشن کی اجازت دیں اور دوبارہ کوشش کریں۔', map:'نقشہ کھولیں ↗',
    payment:'ادائیگی', cod:'کیش آن ڈیلیوری', codHint:'آرڈر آنے پر ادائیگی کریں۔', placeOrder:'آرڈر کریں', placing:'آرڈر بھیجا جا رہا ہے…',
    orderConfirmed:'آرڈر کی تصدیق ہوگئی', wereOnIt:'ہم کام شروع کر چکے ہیں!', received:'آپ کا آرڈر ٹاؤن پیزا پلینیٹ کو موصول ہوگیا ہے۔', arriving:'متوقع آمد', about:'تقریباً', minutes:'منٹ',
    cashTotal:'کیش آن ڈیلیوری', keepPhone:'فون قریب رکھیں۔ ضرورت ہونے پر ہماری ٹیم کال کر سکتی ہے۔', backHome:'ہوم پر جائیں', trackOrder:'آرڈر ٹریک کریں',
    orderStatus:'آرڈر اسٹیٹس', receivedStatus:'آرڈر موصول', preparing:'تیاری جاری ہے', ready:'تیار', outForDelivery:'ڈیلیوری کے لیے روانہ', delivered:'ڈیلیور ہوگیا', cancelled:'منسوخ',
    recentOrders:'حالیہ آرڈرز', reorder:'دوبارہ آرڈر کریں', favorites:'پسندیدہ', recentlyViewed:'حال ہی میں دیکھے گئے', noRecent:'ابھی کوئی پچھلا آرڈر نہیں۔',
    favorite:'پسندیدہ', unfavorite:'پسندیدہ سے ہٹائیں', soldOut:'فروخت ہوگیا', open:'کھلا', closed:'بند', orderingUnavailable:'اس وقت آرڈر بند ہیں۔',
    contact:'کال', callUs:'ریسٹورنٹ کو کال', share:'شیئر', downloadReceipt:'رسید ڈاؤن لوڈ', printReceipt:'پرنٹ / PDF',
    completeMeal:'اپنا کھانا مکمل کریں', popularPairing:'آپ کے آرڈر کے ساتھ مقبول', deliveryFree:'مفت', minimum:'کم از کم', freeAbove:'اس سے اوپر مفت ڈیلیوری',
    extraNeeded:'مزید درکار', chooseDelivery:'چارج دیکھنے کے لیے ڈیلیوری علاقہ منتخب کریں۔', noGPS:'GPS فراہم نہیں کیا گیا',
    orderLookupFailed:'آرڈر لوڈ نہیں ہوسکا۔', retry:'دوبارہ کوشش کریں', thanks:'ٹاؤن پیزا پلینیٹ سے آرڈر کرنے کا شکریہ!',
    receiptTitle:'ٹاؤن پیزا پلینیٹ رسید', estimated:'متوقع آمد', deliveryTitle:'ڈیلیوری', deliveryOutside:'دیورا ہپرگی سے باہر بھی ڈیلیوری',
    deliveryRuleText:'دیورا ہپرگی کے اندر: ₹30 ڈیلیوری، ₹199+ پر مفت (تقریباً 30 منٹ)۔ باہر کے گاؤں: کم از کم آرڈر ₹399؛ ₹999+ پر مفت ڈیلیوری (تقریباً 45 منٹ)۔',
    vegTag:'ویج', nonVegTag:'نان ویج', noResults:'کوئی نتیجہ نہیں ملا۔', noDishes:'آپ کی تلاش سے کوئی ڈش نہیں ملی۔', locating:'لوکیشن تلاش کی جا رہی ہے…', searchTitle:'تلاش',
    customerFavourites:'گاہکوں کی پسند', menuSub:'پیزا، برگر، سینڈوچ اور ڈرنکس', comboSub:'ویلیو میل اور خاص آفرز', familySub:'خاندان کے لیے بڑے میل',
    deliveryRules:'ڈیلیوری کے اصول', orderPlacedTitle:'آرڈر کامیابی سے ہوگیا!', contactRestaurant:'مدد چاہیے؟ ریسٹورنٹ کو کال کریں', noOrders:'ابھی کوئی آرڈر نہیں۔', restaurantNote:'ریسٹورینٹ کے لیے نوٹ (اختیاری)', restaurantNotePlaceholder:'ریسٹورینٹ کے لیے کوئی خاص درخواست؟', feedbackTitle:'آپ کا آرڈر کا تجربہ کیسا رہا؟', feedbackSubtitle:'اختیاری — ہمیں بتائیں۔', feedbackSubmit:'فیڈبیک بھیجیں', feedbackThanks:'آپ کے فیڈبیک کا شکریہ!', feedbackSkip:'آپ اسے چھوڑ سکتے ہیں۔'
  }
};

const CATEGORY_I18N = {
  en:{pizzas:'Pizza',burgers:'Burgers',sandwichesAndSides:'Sandwiches & Sides',milkshakes:'Shakes',drinks:'Drinks'},
  kn:{pizzas:'ಪಿಜ್ಜಾ',burgers:'ಬರ್ಗರ್',sandwichesAndSides:'ಸ್ಯಾಂಡ್‌ವಿಚ್ ಮತ್ತು ಸೈಡ್ಸ್',milkshakes:'ಶೇಕ್‌ಗಳು',drinks:'ಡ್ರಿಂಕ್ಸ್'},
  hi:{pizzas:'पिज़्ज़ा',burgers:'बर्गर',sandwichesAndSides:'सैंडविच और साइड्स',milkshakes:'शेक्स',drinks:'ड्रिंक्स'},
  ur:{pizzas:'پیزا',burgers:'برگر',sandwichesAndSides:'سینڈوچ اور سائیڈز',milkshakes:'شیکس',drinks:'ڈرنکس'}
};

const NAME_I18N = {
  kn:{
    P1:'ಮಾರ್ಗರಿಟಾ ಪಿಜ್ಜಾ',P2:'ಕ್ಲಾಸಿಕ್ ಪಿಜ್ಜಾ',P3:'ಮಶ್ರೂಮ್ ಪಿಜ್ಜಾ',P4:'ಸ್ವೀಟ್ ಕಾರ್ನ್ ಪಿಜ್ಜಾ',P5:'ಬೇಬಿ ಕಾರ್ನ್ ಪಿಜ್ಜಾ',P6:'ಮೆಕ್ಸಿಕನ್ ಪಿಜ್ಜಾ',P7:'ಪನೀರ್ ಪಿಜ್ಜಾ',P8:'ಪೆರಿ ಪೆರಿ ಚಿಕನ್ ಪಿಜ್ಜಾ',P9:'ಬಾರ್ಬಿಕ್ಯೂ ಚಿಕನ್ ಪಿಜ್ಜಾ',P10:'ಪನೀರ್ ಮಖಾನಿ ಪಿಜ್ಜಾ',
    B1:'ವೆಜ್ ಬರ್ಗರ್',B2:'ಚೀಸ್ ಬರ್ಗರ್',B3:'ಡಬಲ್ ವೆಜ್ ಬರ್ಗರ್',B4:'ಚಿಕನ್ ಬರ್ಗರ್',B5:'ಡಬಲ್ ಚಿಕನ್ ಬರ್ಗರ್',D1:'ನೀರು',D2:'ಸ್ಪ್ರೈಟ್',D3:'ಕೋಕಾ ಕೋಲಾ',D4:'ಡೈಲಿ ಪೈನಾಪಲ್',D5:'ಮೌಂಟನ್ ಡ್ಯೂ',D6:'7 ಅಪ್',D7:'ಟೈಗರ್ (ಪ್ರಿಡೇಟರ್)',D8:'ಬಿಂದು ಜೀರಿಗೆ',D9:'ಸ್ಟಿಂಗ್',S1:'ಫ್ರೆಂಚ್ ಫ್ರೈಸ್ (ರೆಗ್ಯುಲರ್)',S2:'ಮಸಾಲಾ ಸ್ಯಾಂಡ್‌ವಿಚ್',S3:'ಫ್ರೆಂಚ್ ಫ್ರೈಸ್ (ಲಾರ್ಜ್)',S4:'ಪನೀರ್ ಟಿಕ್ಕಾ ಸ್ಯಾಂಡ್‌ವಿಚ್',S5:'ಗಾರ್ಲಿಕ್ ಬ್ರೆಡ್',S6:'ಚಿಕನ್ ಸ್ಯಾಂಡ್‌ವಿಚ್',S7:'ಪನೀರ್ ಮಖಾನಿ',S8:'ರೆಗ್ಯುಲರ್ ಚೀಸ್ ಲೋಡೆಡ್ ಫ್ರೈಸ್',S9:'ಲಾರ್ಜ್ ಚೀಸ್ ಲೋಡೆಡ್ ಫ್ರೈಸ್',
    M1:'ವೆನಿಲ್ಲಾ ಶೇಕ್',M2:'ಸ್ಟ್ರಾಬೆರಿ ಶೇಕ್',M3:'ಆಪಲ್ ಶೇಕ್',M4:'ಚಾಕೊಲೇಟ್ ಶೇಕ್',M5:'ಪೈನಾಪಲ್ ಶೇಕ್',M6:'ಆರೆಂಜ್ ಶೇಕ್',M7:'ಕೋಲ್ಡ್ ಕಾಫಿ',M8:'ಒರಿಯೋ ಶೇಕ್',
    C1:'ಕ್ಲಾಸಿಕ್ ಚೀಜಿ ಮೀಲ್',C2:'ದೇಸಿ ಡಿಲೈಟ್ ಸೋಲೋ',C3:'ಫ್ಯಾಮಿಲಿ ಚಾಯ್ಸ್ ಮಿಕ್ಸ್',C4:'ದಿ ಹ್ಯಾಂಗೌಟ್ ಸ್ಪೆಷಲ್',C5:'ಮೆಕ್ಸಿಕನ್ ಮಹಾ ಕಾಂಬೊ',C6:'ಮೆಕ್ಸಿಕನ್ ಫಿಯೆಸ್ಟಾ ಸೋಲೋ',C7:'ವೆಜ್ ಬರ್ಗರ್ ಕಾಂಬೊ',C8:'ಚಿಕನ್ ಫೀಸ್ಟ್ ರಾಯಲ್',C9:'ಬೇಬಿ ಕಾರ್ನ್ ಬರ್ಗರ್ ಬ್ಲಾಸ್ಟ್',C10:'ಮೆಕ್ಸಿಕನ್ ವೆಜಿಟೇಬಲ್ ಫೀಸ್ಟ್',C11:'ಚಿಕನ್ ಬರ್ಗರ್ ಡಬಲ್ ಡಿಲೈಟ್',
    F1:'ಫ್ಯಾಮಿಲಿ ಚಾಯ್ಸ್ ಮಿಕ್ಸ್',F2:'ಮೆಕ್ಸಿಕನ್ ಮಹಾ ಕಾಂಬೊ',F3:'ನಾನ್-ವೆಜ್ ಮಹಾರಾಜಾ',F4:'ವೆಜ್ ಮಹಾರಾಜಾ'
  },
  hi:{
    P1:'मार्गेरिटा पिज़्ज़ा',P2:'क्लासिक पिज़्ज़ा',P3:'मशरूम पिज़्ज़ा',P4:'स्वीट कॉर्न पिज़्ज़ा',P5:'बेबी कॉर्न पिज़्ज़ा',P6:'मेक्सिकन पिज़्ज़ा',P7:'पनीर पिज़्ज़ा',P8:'पेरी पेरी चिकन पिज़्ज़ा',P9:'बार्बेक्यू चिकन पिज़्ज़ा',P10:'पनीर मखानी पिज़्ज़ा',
    B1:'वेज बर्गर',B2:'चीज़ बर्गर',B3:'डबल वेज बर्गर',B4:'चिकन बर्गर',B5:'डबल चिकन बर्गर',D1:'पानी',D2:'स्प्राइट',D3:'कोका कोला',D4:'डेली पाइनेपल',D5:'माउंटेन ड्यू',D6:'7 अप',D7:'टाइगर (प्रिडेटर)',D8:'बिंदु जीरा',D9:'स्टिंग',S1:'फ्रेंच फ्राइज (रेगुलर)',S2:'मसाला सैंडविच',S3:'फ्रेंच फ्राइज (लार्ज)',S4:'पनीर टिक्का सैंडविच',S5:'गार्लिक ब्रेड',S6:'चिकन सैंडविच',S7:'पनीर मखानी',S8:'रेगुलर चीज़ लोडेड फ्राइज',S9:'लार्ज चीज़ लोडेड फ्राइज',
    M1:'वनीला शेक',M2:'स्ट्रॉबेरी शेक',M3:'एप्पल शेक',M4:'चॉकलेट शेक',M5:'पाइनएप्पल शेक',M6:'ऑरेंज शेक',M7:'कोल्ड कॉफी',M8:'ओरियो शेक',
    C1:'क्लासिक चीज़ी मील',C2:'देसी डिलाइट सोलो',C3:'फैमिली चॉइस मिक्स',C4:'द हैंगआउट स्पेशल',C5:'मेक्सिकन महा कॉम्बो',C6:'मेक्सिकन फिएस्टा सोलो',C7:'वेज बर्गर कॉम्बो',C8:'चिकन फीस्ट रॉयल',C9:'बेबी कॉर्न बर्गर ब्लास्ट',C10:'मेक्सिकन वेजी फीस्ट',C11:'चिकन बर्गर डबल डिलाइट',
    F1:'फैमिली चॉइस मिक्स',F2:'मेक्सिकन महा कॉम्बो',F3:'नॉन-वेज महाराजा',F4:'वेज महाराजा'
  },
  ur:{
    P1:'مارگریٹا پیزا',P2:'کلاسک پیزا',P3:'مشروم پیزا',P4:'سویٹ کارن پیزا',P5:'بیبی کارن پیزا',P6:'میکسیکن پیزا',P7:'پنیر پیزا',P8:'پیری پیری چکن پیزا',P9:'باربی کیو چکن پیزا',P10:'پنیر مکھنی پیزا',
    B1:'ویج برگر',B2:'چیز برگر',B3:'ڈبل ویج برگر',B4:'چکن برگر',B5:'ڈبل چکن برگر',D1:'پانی',D2:'اسپرائٹ',D3:'کوکا کولا',D4:'ڈیلی پائن ایپل',D5:'ماؤنٹین ڈیو',D6:'7 اپ',D7:'ٹائیگر (پریڈیٹر)',D8:'بندو جیرا',D9:'اسٹنگ',S1:'فرینچ فرائز (ریگولر)',S2:'مسالا سینڈوچ',S3:'فرینچ فرائز (لارج)',S4:'پنیر ٹکا سینڈوچ',S5:'گارلک بریڈ',S6:'چکن سینڈوچ',S7:'پنیر مکھنی',S8:'ریگولر چیز لوڈڈ فرائز',S9:'لارج چیز لوڈڈ فرائز',
    M1:'ونیلا شیک',M2:'اسٹرابیری شیک',M3:'ایپل شیک',M4:'چاکلیٹ شیک',M5:'پائن ایپل شیک',M6:'اورنج شیک',M7:'کولڈ کافی',M8:'اوریو شیک',
    C1:'کلاسک چیز میِل',C2:'دیسی ڈیلائٹ سولو',C3:'فیملی چوائس مکس',C4:'دی ہینگ آؤٹ اسپیشل',C5:'میکسیکن مہا کومبو',C6:'میکسیکن فیسٹا سولو',C7:'ویج برگر کومبو',C8:'چکن فیسٹ رائل',C9:'بیبی کارن برگر بلاسٹ',C10:'میکسیکن ویجی فیسٹ',C11:'چکن برگر ڈبل ڈیلائٹ',
    F1:'فیملی چوائس مکس',F2:'میکسیکن مہا کومبو',F3:'نان ویج مہاراجہ',F4:'ویج مہاراجہ'
  }
};

const ZONE_I18N = {
  en:{'devara-hipparagi':'Devara Hipparagi','devoor':'Devoor','ingalagi':'Ingalagi','padaganur':'Padaganur','mulasavalagi':'Mulasavalagi','kannolli':'Kannolli','shivanagi':'Shivanagi','nivalkhed':'Nivalkhed'},
  kn:{'devara-hipparagi':'ದೇವರ ಹಿಪ್ಪರಗಿ','devoor':'ದೇವೂರ','ingalagi':'ಇಂಗಳಗಿ','padaganur':'ಪಡಗಾನೂರ','mulasavalagi':'ಮುಳಸಾವಳಗಿ','kannolli':'ಕನ್ನೊಳ್ಳಿ','shivanagi':'ಶಿವಣಗಿ','nivalkhed':'ನಿವಾಳಖೇಡ'},
  hi:{'devara-hipparagi':'देवर हिप्परगी','devoor':'देवूर','ingalagi':'इंगळगी','padaganur':'पडगानूर','mulasavalagi':'मूलसावलगी','kannolli':'कण्णोल्ली','shivanagi':'शिवणगी','nivalkhed':'निवाळखेड'},
  ur:{'devara-hipparagi':'دیورا ہپرگی','devoor':'دیوور','ingalagi':'انگلاگی','padaganur':'پڈگانور','mulasavalagi':'مولاساولگی','kannolli':'کنولی','shivanagi':'شیوانیگی','nivalkhed':'نیوالکھیڑا'}
};

const LANG_LABEL = {en:'English',kn:'ಕನ್ನಡ',hi:'हिंदी',ur:'اردو'};

const state = {
  catalog:null,
  view:'home',
  category:null,
  filter:'all',
  search:'',
  language:['en','kn','hi','ur'].includes(localStorage.getItem('tpp_language')) ? localStorage.getItem('tpp_language') : 'en',
  cart:loadJson('tpp_cart',[]),
  favorites:new Set(loadJson('tpp_favorites',[])),
  recentViewed:loadJson('tpp_recent_viewed',[]),
  phone:normalizePhone(new URLSearchParams(location.search).get('phone') || ''),
  location:null,
  selectedZone:'devara-hipparagi',
  lastOrder:loadJson('tpp_last_order',null),
  orderParam:new URLSearchParams(location.search).get('order') || '',
  statusTimer:null,
  etaTimer:null,
  vegMode:localStorage.getItem('tpp_veg_mode')==='true',
  nonVegMode:localStorage.getItem('tpp_nonveg_mode')==='true',
  theme:localStorage.getItem('tpp_theme')==='light'?'light':'dark',
  pizzaCustomizerId:null,
  menuSpecial:null
};

const app = document.getElementById('app');
const cartDrawer = document.getElementById('cartDrawer');
const scrim = document.getElementById('scrim');
const cartCountEl = document.getElementById('cartCount');
const mobileCartBar = document.getElementById('mobileCartBar');
const mobileCartCountEl = document.getElementById('mobileCartCount');
const mobileCartTotalEl = document.getElementById('mobileCartTotal');
const languageHeaderBtn = document.getElementById('languageHeaderBtn');
const vegModeBtn = document.getElementById('vegModeBtn');
const nonVegModeBtn = document.getElementById('nonVegModeBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

function loadJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value ?? fallback;}catch{return fallback;}}
function saveJson(key,value){localStorage.setItem(key,JSON.stringify(value));}
function normalizePhone(value){return String(value||'').replace(/\D/g,'').slice(-15);}
const EXTRA_I18N = {
  en:{
    vegMode:'VEG',vegModeOn:'Veg mode is ON',vegModeOff:'Show all dishes',vegModeHint:'Showing only pure-veg dishes',nonVegMode:'NON-VEG',nonVegModeOn:'Non-veg mode is ON',nonVegModeOff:'Show all dishes',nonVegModeHint:'Showing only non-veg dishes',waterSize:'Choose water size',waterSizeHint:'Select ½ litre, 1 litre or 2 litre',addWaterToCart:'Add Water to Cart',drinksHint:'Cold drinks & water',
    marketingEyebrow:'WE DELIVER BEYOND DEVARA HIPPARGI',marketingTitle:'Your pizza, now reaching 7 nearby villages',marketingBody:'Fresh, hot and reachable — Town Pizza Planet now delivers beyond Devara Hipparagi to 7 nearby villages too.',
    marketingClaim:'The only pizza house in the whole Devara Hipparagi taluka',marketingQuality:'Best taste • quality • reachable',outsideVillages:'OUTSIDE VILLAGES',marketingVillages:'Serving Devoor • Ingalagi • Padaganur • Mulasavalagi • Kannolli • Shivanagi • Nivalkhed',
    customizePizza:'Customize your pizza',customizeSubtitle:'Choose your add-ons',extraCheeseShort:'Extra Cheese',extraCheesePrice:'+ ₹30',customizedTotal:'Your total',addPizzaToCart:'Add Pizza to Cart',plainPizza:'Regular Pizza',
    pizzaCustomizationHint:'Make it extra cheesy or keep it classic.'
  },
  kn:{
    vegMode:'VEG',vegModeOn:'ವೆಜ್ ಮೋಡ್ ಆನ್ ಆಗಿದೆ',vegModeOff:'ಎಲ್ಲಾ ಡಿಶ್‌ಗಳನ್ನು ತೋರಿಸಿ',vegModeHint:'ಶುದ್ಧ ವೆಜ್ ಡಿಶ್‌ಗಳನ್ನು ಮಾತ್ರ ತೋರಿಸಲಾಗುತ್ತಿದೆ',
    marketingEyebrow:'ದೇವರ ಹಿಪ್ಪರಗಿ ಹೊರಗೂ ಡೆಲಿವರಿ',marketingTitle:'ನಿಮ್ಮ ಪಿಜ್ಜಾ ಈಗ 7 ಹಳ್ಳಿಗಳಿಗೂ',marketingBody:'ತಾಜಾ, ಬಿಸಿ ಮತ್ತು ತಲುಪುವಂತೆ — ದೇವರ ಹಿಪ್ಪರಗಿಯ ಹೊರಗಿನ 7 ಹಳ್ಳಿಗಳಿಗೂ ಟೌನ್ ಪಿಜ್ಜಾ ಪ್ಲಾನೆಟ್ ಡೆಲಿವರಿ.',
    marketingClaim:'ಇಡೀ ದೇವರ ಹಿಪ್ಪರಗಿ ತಾಲೂಕಿನಲ್ಲಿ ಒಂದೇ ಪಿಜ್ಜಾ ಹೌಸ್',marketingQuality:'ಅತ್ಯುತ್ತಮ ರುಚಿ • ಗುಣಮಟ್ಟ • ತಲುಪುವಿಕೆ',outsideVillages:'ಹೊರಗಿನ ಹಳ್ಳಿಗಳು',marketingVillages:'ದೇವೂರ • ಇಂಗಳಗಿ • ಪಡಗಾನೂರ • ಮುಳಸಾವಳಗಿ • ಕನ್ನೊಳ್ಳಿ • ಶಿವಣಗಿ • ನಿವಾಳಖೇಡ',
    customizePizza:'ನಿಮ್ಮ ಪಿಜ್ಜಾವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ',customizeSubtitle:'ಆಡ್-ಆನ್ ಆಯ್ಕೆಮಾಡಿ',extraCheeseShort:'ಎಕ್ಸ್ಟ್ರಾ ಚೀಸ್',extraCheesePrice:'+ ₹30',customizedTotal:'ಒಟ್ಟು',addPizzaToCart:'ಪಿಜ್ಜಾವನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ',plainPizza:'ರೆಗ್ಯುಲರ್ ಪಿಜ್ಜಾ',
    pizzaCustomizationHint:'ಹೆಚ್ಚು ಚೀಸ್ ಅಥವಾ ಕ್ಲಾಸಿಕ್ ರುಚಿ — ನಿಮ್ಮ ಆಯ್ಕೆ.'
  },
  hi:{
    vegMode:'VEG',vegModeOn:'वेज मोड चालू है',vegModeOff:'सभी डिश दिखाएँ',vegModeHint:'सिर्फ शुद्ध वेज डिश दिखाई जा रही हैं',
    marketingEyebrow:'देवर हिप्परगी से बाहर भी डिलीवरी',marketingTitle:'आपका पिज़्ज़ा अब 7 पास के गाँवों तक',marketingBody:'ताज़ा, गरम और आसानी से पहुँचने वाला — टाउन पिज़्ज़ा प्लैनेट 7 बाहरी गाँवों में भी डिलीवरी करता है।',
    marketingClaim:'पूरे देवर हिप्परगी तालुका का एकमात्र पिज़्ज़ा हाउस',marketingQuality:'बेहतरीन स्वाद • गुणवत्ता • पहुँच',outsideVillages:'बाहरी गाँव',marketingVillages:'देवूर • इंगळगी • पडगानूर • मूलसावलगी • कण्णोल्ली • शिवणगी • निवाळखेड',
    customizePizza:'अपना पिज़्ज़ा कस्टमाइज़ करें',customizeSubtitle:'अपना ऐड-ऑन चुनें',extraCheeseShort:'एक्स्ट्रा चीज़',extraCheesePrice:'+ ₹30',customizedTotal:'कुल',addPizzaToCart:'पिज़्ज़ा कार्ट में जोड़ें',plainPizza:'रेगुलर पिज़्ज़ा',
    pizzaCustomizationHint:'एक्स्ट्रा चीज़ या क्लासिक स्वाद — आपकी पसंद।'
  },
  ur:{
    vegMode:'VEG',vegModeOn:'ویج موڈ آن ہے',vegModeOff:'تمام ڈشز دکھائیں',vegModeHint:'صرف خالص ویج ڈشز دکھائی جا رہی ہیں',
    marketingEyebrow:'دیورا ہپرگی سے باہر بھی ڈیلیوری',marketingTitle:'آپ کا پیزا اب 7 قریبی دیہات تک',marketingBody:'تازہ، گرم اور آسانی سے پہنچنے والا — ٹاؤن پیزا پلینیٹ 7 بیرونی دیہات میں بھی ڈیلیوری کرتا ہے۔',
    marketingClaim:'پورے دیورا ہپرگی تعلقہ کا واحد پیزا ہاؤس',marketingQuality:'بہترین ذائقہ • معیار • رسائی',outsideVillages:'بیرونی دیہات',marketingVillages:'دیوور • انگلاگی • پڈگانور • مولاساولگی • کنولی • شیوانیگی • نیوالکھیڑا',
    customizePizza:'اپنا پیزا کسٹمائز کریں',customizeSubtitle:'اپنا ایڈ آن منتخب کریں',extraCheeseShort:'ایکسٹرا چیز',extraCheesePrice:'+ ₹30',customizedTotal:'کل',addPizzaToCart:'پیزا کارٹ میں شامل کریں',plainPizza:'ریگولر پیزا',
    pizzaCustomizationHint:'ایکسٹرا چیز یا کلاسک ذائقہ — آپ کی پسند۔'
  }
};
function t(key){return I18N[state.language]?.[key] ?? I18N.en[key] ?? EXTRA_I18N[state.language]?.[key] ?? EXTRA_I18N.en[key] ?? key;}
function catName(key){
  const catalogCat = state.catalog?.categories?.find(c=>String(c.key)===String(key));
  if(catalogCat?.name) return catalogCat.name;
  return CATEGORY_I18N[state.language]?.[key]||CATEGORY_I18N.en[key]||key;
}
function localizedName(id,english){if(state.language==='en')return english;const entry=state.catalog?.categories?.flatMap(c=>c.items||[]).find(x=>x.id===id)||state.catalog?.bestsellers?.find(x=>x.id===id)||state.catalog?.combos?.find(x=>x.id===id)||state.catalog?.familyPacks?.find(x=>x.id===id);return entry?.translations?.[state.language] || NAME_I18N[state.language]?.[id] || english;}
function nameMarkup(id,english,cls='product-name'){const local=localizedName(id,english);return state.language==='en'?`<div class="${cls}">${escapeHtml(english)}</div>`:`<div class="${cls} local-name">${escapeHtml(local)}</div><div class="english-name">${escapeHtml(english)}</div>`;}
function localizedZoneName(zone){return ZONE_I18N[state.language]?.[zone.id] || zone.name;}
function money(n){return `₹${Number(n||0).toLocaleString('en-IN')}`;}
function img(name){const v=String(name||'');return v.startsWith('/')?v:`/product-images/${encodeURIComponent(v)}`;}
function packImg(name,type){const v=String(name||'');if(v.startsWith('/'))return v;return type==='family'?`/family-packs/${encodeURIComponent(v)}`:`/combo-images/${encodeURIComponent(v)}`;}
function cartCount(){return state.cart.reduce((sum,x)=>sum+Number(x.qty||0),0);}
function cartSubtotal(){return state.cart.reduce((sum,x)=>sum+Number(x.price||0)*Number(x.qty||0),0);}
function saveCart(){saveJson('tpp_cart',state.cart);updateCartBadge();}
function captureCheckoutDraft(){
  if(state.view!=='checkout')return;
  const draft={
    name:document.getElementById('customerName')?.value||'',
    phone:document.getElementById('customerPhone')?.value||state.phone||'',
    address:document.getElementById('customerAddress')?.value||'',
    landmark:document.getElementById('customerLandmark')?.value||'',
    restaurantNote:document.getElementById('restaurantNote')?.value||'',
    zone:document.getElementById('deliveryZone')?.value||state.selectedZone,
  };
  sessionStorage.setItem('tpp_checkout_draft',JSON.stringify(draft));
}
function restoreCheckoutDraft(){
  if(state.view!=='checkout')return;
  let draft={};
  try{draft=JSON.parse(sessionStorage.getItem('tpp_checkout_draft')||'{}')||{};}catch{}
  const set=(id,val)=>{const el=document.getElementById(id);if(el&&val!=null)el.value=val;};
  set('customerName',draft.name);set('customerPhone',draft.phone);set('customerAddress',draft.address);set('customerLandmark',draft.landmark);set('restaurantNote',draft.restaurantNote);
  const z=document.getElementById('deliveryZone');if(z&&draft.zone&&[...z.options].some(o=>o.value===draft.zone))z.value=draft.zone;
  if(z){state.selectedZone=z.value;updateDeliverySummary();}
}
function updateCartBadge(){const count=cartCount();const total=cartSubtotal();if(cartCountEl)cartCountEl.textContent=String(count);if(mobileCartCountEl)mobileCartCountEl.textContent=String(count);if(mobileCartTotalEl)mobileCartTotalEl.textContent=money(total);if(mobileCartBar){mobileCartBar.classList.toggle('visible',count>0);mobileCartBar.setAttribute('aria-hidden',String(count===0));}}
function saveFavorites(){saveJson('tpp_favorites',[...state.favorites]);}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function preserveRender(html){const y=window.scrollY;app.innerHTML=`<div class="view-enter">${html}</div>`;updateCartBadge();requestAnimationFrame(()=>window.scrollTo({top:y,behavior:'instant'}));}
function applyTheme(){document.documentElement.dataset.theme=state.theme;document.documentElement.style.colorScheme=state.theme;updateThemeHeader();}
function updateThemeHeader(){if(themeToggleBtn){const light=state.theme==='light';themeToggleBtn.setAttribute('aria-pressed',String(light));themeToggleBtn.title=light?t('darkMode'):t('lightMode');themeToggleBtn.innerHTML=`<span class="theme-icon">${light?'🌙':'☀️'}</span><span>${escapeHtml(light?t('darkMode'):t('lightMode'))}</span>`;}const meta=document.getElementById('themeColorMeta');if(meta)meta.content=state.theme==='light'?'#f5ecdc':'#120f0d';}
function toggleTheme(){state.theme=state.theme==='light'?'dark':'light';localStorage.setItem('tpp_theme',state.theme);applyTheme();}
function applyLanguageDir(){document.documentElement.lang=state.language==='kn'?'kn':state.language==='hi'?'hi':state.language==='ur'?'ur':'en';document.documentElement.dir=state.language==='ur'?'rtl':'ltr';}
function render(html,preserveScroll=false){const gate=(!orderingOpen()&&state.view!=='language'&&state.view!=='tracking')?closedOrderingBanner():'';const full=gate+html;if(preserveScroll)preserveRender(full);else{app.innerHTML=`<div class="view-enter">${full}</div>`;updateCartBadge();requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'instant'}));} applyLanguageDir(); applyTheme(); updateLanguageHeader(); updateVegHeader(); updateNonVegHeader();}
function setView(view,preserveScroll=false){state.view=view;renderView(preserveScroll);}
function openCart(){renderCartDrawer();cartDrawer.classList.add('open');scrim.classList.add('open');cartDrawer.setAttribute('aria-hidden','false');}
function closeCart(){cartDrawer.classList.remove('open');scrim.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true');}
function getAllProducts(){return state.catalog?.categories?.flatMap(c=>c.items)||[];}
function itemById(id){return getAllProducts().find(x=>x.id===id)||state.catalog?.bestsellers?.find(x=>x.id===id)||null;}
function packById(id){return state.catalog?.combos?.find(x=>x.id===id)||state.catalog?.familyPacks?.find(x=>x.id===id)||null;}
function getEntry(id){return itemById(id)||packById(id);}
function isNonVeg(item){return /chicken|non.?veg/i.test(item?.name||'');}
function isVeg(item){return !isNonVeg(item);}
function isVegPack(pack){if(!pack)return false;const nonVegIds=new Set(['C2','C8','C11','F1','F3']);return !nonVegIds.has(String(pack.id||'').toUpperCase());}
function isNonVegPack(pack){if(!pack)return false;const nonVegIds=new Set(['C2','C8','C11','F1','F3']);return nonVegIds.has(String(pack.id||'').toUpperCase());}
function isVisible(entry){if(entry?.isCombo)return state.nonVegMode?isNonVegPack(entry):state.vegMode?isVegPack(entry):true;return state.nonVegMode?isNonVeg(entry):state.vegMode?isVeg(entry):true;}
function isVegVisible(entry){return isVisible(entry);}
function filterVegItems(items){return state.nonVegMode?items.filter(isNonVeg):state.vegMode?items.filter(isVeg):items;}
function filterVegPacks(items){return state.nonVegMode?items.filter(isNonVegPack):state.vegMode?items.filter(isVegPack):items;}
function recentItemIds(){return state.recentViewed.filter(id=>itemById(id)&&isVegVisible(itemById(id))).slice(0,6);}
function noteViewed(id){state.recentViewed=[id,...state.recentViewed.filter(x=>x!==id)].slice(0,12);saveJson('tpp_recent_viewed',state.recentViewed);}
function isAvailable(entry){return entry?.available!==false;}
function orderingOpen(){return state.catalog?.ordering?.open!==false;}
function statusText(){return orderingOpen()?t('open'):t('closed');}
function closedOrderingBanner(){
  if(orderingOpen()) return '';
  const reason=String(state.catalog?.ordering?.reason||'').trim();
  const phones=(state.catalog?.phone||['9448769098','6362648283']).filter(Boolean);
  return `<section class="ordering-closed-banner" role="alert"><div class="ordering-closed-icon">⏸</div><div><strong>${escapeHtml(t('storeClosedTitle'))}</strong><p>${escapeHtml(reason||t('orderingUnavailable'))}</p><p>${escapeHtml(t('storeClosedBody'))}</p><div class="ordering-closed-calls">${phones.slice(0,2).map(ph=>`<a href="tel:${escapeHtml(ph)}">📞 ${escapeHtml(ph)}</a>`).join('')}</div></div></section>`;
}
function updateLanguageHeader(){if(languageHeaderBtn){languageHeaderBtn.innerHTML=`🌐 <span>${escapeHtml(t('language'))}</span><small>${escapeHtml(LANG_LABEL[state.language]||'English')}</small>`;languageHeaderBtn.title=t('selectLanguage');}}
function updateVegHeader(){if(!vegModeBtn)return;vegModeBtn.classList.toggle('active',state.vegMode);vegModeBtn.setAttribute('aria-pressed',String(state.vegMode));vegModeBtn.title=state.vegMode?t('vegModeOn'):t('vegModeOff');vegModeBtn.innerHTML=`<span class="veg-toggle-word">${escapeHtml(t('vegMode'))}</span><span class="veg-switch"><i></i></span>`;}
function updateNonVegHeader(){if(!nonVegModeBtn)return;nonVegModeBtn.classList.toggle('active',state.nonVegMode);nonVegModeBtn.setAttribute('aria-pressed',String(state.nonVegMode));nonVegModeBtn.title=state.nonVegMode?t('nonVegModeOn'):t('nonVegModeOff');nonVegModeBtn.innerHTML=`<span class="veg-toggle-word">${escapeHtml(t('nonVegMode'))}</span><span class="veg-switch nonveg-switch"><i></i></span>`;}
function toggleVegMode(){state.vegMode=!state.vegMode;if(state.vegMode)state.nonVegMode=false;localStorage.setItem('tpp_veg_mode',String(state.vegMode));localStorage.setItem('tpp_nonveg_mode',String(state.nonVegMode));updateVegHeader();updateNonVegHeader();notifyToast(state.vegMode?'🥬 '+t('vegModeOn'):'🍽️ '+t('vegModeOff'));renderView(true);}
function toggleNonVegMode(){state.nonVegMode=!state.nonVegMode;if(state.nonVegMode)state.vegMode=false;localStorage.setItem('tpp_nonveg_mode',String(state.nonVegMode));localStorage.setItem('tpp_veg_mode',String(state.vegMode));updateVegHeader();updateNonVegHeader();notifyToast(state.nonVegMode?'🍗 '+t('nonVegModeOn'):'🍽️ '+t('nonVegModeOff'));renderView(true);}

function languageModalCopy(){
  const copy={
    en:{sub:'Choose the language you want to use.',items:[['en','English','Continue in English'],['kn','ಕನ್ನಡ','ಮುಂದುವರಿಸಿ ಕನ್ನಡದಲ್ಲಿ'],['hi','हिंदी','हिंदी में जारी रखें'],['ur','اردو','اردو میں جاری رکھیں']]},
    kn:{sub:'ನೀವು ಬಳಸಲು ಬಯಸುವ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',items:[['en','English','ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮುಂದುವರಿಸಿ'],['kn','ಕನ್ನಡ','ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಸಿ'],['hi','हिंदी','ಹಿಂದಿಯಲ್ಲಿ ಮುಂದುವರಿಸಿ'],['ur','اردو','ಉರ್ದುವಿನಲ್ಲಿ ಮುಂದುವರಿಸಿ']]},
    hi:{sub:'आप जिस भाषा में उपयोग करना चाहते हैं उसे चुनें।',items:[['en','English','अंग्रेज़ी में जारी रखें'],['kn','ಕನ್ನಡ','कन्नड़ में जारी रखें'],['hi','हिंदी','हिंदी में जारी रखें'],['ur','اردو','उर्दू में जारी रखें']]},
    ur:{sub:'وہ زبان منتخب کریں جس میں آپ استعمال کرنا چاہتے ہیں۔',items:[['en','English','انگریزی میں جاری رکھیں'],['kn','ಕನ್ನಡ','کنڑ میں جاری رکھیں'],['hi','हिंदी','ہندی میں جاری رکھیں'],['ur','اردو','اردو میں جاری رکھیں']]},
  };
  return copy[state.language]||copy.en;
}
function openLanguageModal(){
  closeCart();
  let modal=document.getElementById('languageModal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='languageModal';
    modal.className='language-modal';
    document.body.appendChild(modal);
  }
  const copy=languageModalCopy();
  modal.innerHTML=`<div class="language-modal-backdrop" data-language-close></div><div class="language-modal-card" role="dialog" aria-modal="true" aria-labelledby="languageModalTitle"><button class="modal-close" type="button" data-language-close aria-label="Close">✕</button><p class="eyebrow">LANGUAGE / ಭಾಷೆ / भाषा / زبان</p><h2 id="languageModalTitle">${escapeHtml(t('selectLanguage'))}</h2><p class="muted">${escapeHtml(copy.sub)}</p><div class="language-modal-grid">${copy.items.map(([id,label,sub])=>`<button type="button" class="language-btn ${state.language===id?'active':''}" data-lang="${id}"><strong>${escapeHtml(label)}</strong><small>${escapeHtml(sub)}</small><span>${state.language===id?'✓':'→'}</span></button>`).join('')}</div></div>`;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('language-open');
  requestAnimationFrame(()=>modal.querySelector('button[data-lang]')?.focus());
}
function closeLanguageModal(){const modal=document.getElementById('languageModal');if(modal){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}document.body.classList.remove('language-open');}
function languageScreen(){
  render(`<div class="loading-state"><div class="loader-ring"></div><p>${escapeHtml(t('freshFromKitchen'))}</p></div>`);
}


function comboOfDayCard(){
  const c=state.catalog?.comboOfDay;
  if(!c)return '';
  const sold=!c.available||c.autoUnavailable;
  const inCart=state.cart.find(x=>x.id===c.packId&&x.comboOfDay);
  return `<section class="combo-day-card"><div class="combo-day-badge">⭐ COMBO OF THE DAY · 10% OFF</div><div class="combo-day-inner"><div class="combo-day-media"><img src="${c.packType==='family'?packImg(c.image,'family'):packImg(c.image,'combo')}" alt="${escapeHtml(c.name)}"></div><div class="combo-day-copy"><p class="eyebrow">TODAY'S SPECIAL</p><h2>${escapeHtml(c.name)}</h2><p>${escapeHtml(c.description||'')}</p><div class="combo-day-price"><del>${money(c.originalPrice)}</del><strong>${money(c.price)}</strong><span>Save ${money(c.discount)}</span></div>${sold?`<button class="disabled-btn wide" disabled>${escapeHtml(t('soldOut'))}</button>`:inCart?`<div class="combo-day-added">✓ ${escapeHtml(t('added'))} × ${inCart.qty}</div>`:`<button class="primary-btn wide" data-add-combo-day>Add to Cart</button>`}</div></div></section>`;
}

function home(preserve=false){
  const b=filterVegItems(state.catalog.bestsellers.filter(Boolean)).slice(0,4).map(productCard).join('');
  const recent=state.phone?recentOrdersSection():''; const fav=favoritesSection(); const viewed=recentViewedSection();
  render(`<section class="hero">
    <div class="hero-copy"><div class="store-status"><span class="live-dot"></span>${escapeHtml(statusText())}</div><p class="eyebrow">${escapeHtml(t('freshFromKitchen'))}</p><h1>${escapeHtml(state.catalog.storeName)}</h1><p class="hero-tagline">${escapeHtml(t('fresh'))}</p>
      <div class="hero-actions"><button class="primary-btn" data-view="menu">🍽️ ${escapeHtml(t('browseMenu'))}</button><button class="ghost-btn boxed" data-view="bestsellers">🔥 ${escapeHtml(t('bestsellers'))}</button></div>
      <div class="quick-search"><span>⌕</span><input id="globalSearch" value="${escapeHtml(state.search)}" placeholder="${escapeHtml(t('search'))}"/><button data-search-go>→</button></div>
    </div>
    <div class="hero-card"><div class="floating-orbit"></div><strong>${escapeHtml(t('fresh'))}</strong><span>~30–45 min delivery</span><div class="hero-stamp">30<br><small>MIN</small></div><div class="hero-pizza">🍕</div></div>
  </section>
  ${customerAdminNotices()}
  ${marketingBanner()}
  ${comboOfDayCard()}
  <section class="home-grid">
    ${homeBtn('🔥',t('bestsellers'),t('customerFavourites'),'bestsellers')}
    ${homeBtn('🍽️',t('menu'),t('menuSub'),'menu')}
    ${homeBtn('🎁',t('combos'),t('comboSub'),'combos')}
    ${homeBtn('👨‍👩‍👧‍👦',t('family'),t('familySub'),'family')}
  </section>
  <section class="delivery-info"><div><p class="eyebrow">${escapeHtml(t('deliveryTitle'))}</p><h3>${escapeHtml(t('deliveryOutside'))}</h3><p>${escapeHtml(t('deliveryRuleText'))}</p></div><div class="zone-pills">${state.catalog.deliveryZones.map(z=>`<span>${escapeHtml(localizedZoneName(z))} · ${z.deliveryCharge===0?escapeHtml(t('deliveryFree')):money(z.deliveryCharge)}</span>`).join('')}</div></section>
  ${recent}${fav}${viewed}
  <div class="section-head"><div><p class="eyebrow">${escapeHtml(t('popularNow'))}</p><h2>${escapeHtml(t('bestsellers'))}</h2></div><button class="ghost-btn" data-view="bestsellers">${escapeHtml(t('viewAll'))}</button></div>
  <div class="product-grid">${b}</div>`,preserve);
}

function customerAdminNotices(){
  const blocks=[];
  const a=state.catalog?.announcement; if(a?.enabled && a.text) blocks.push(`<section class="delivery-info" style="margin-top:12px"><div><p class="eyebrow">ANNOUNCEMENT</p><h3>${escapeHtml(a.text)}</h3></div></section>`);
  const c=state.catalog?.campaign; if(c?.enabled && c.title) blocks.push(`<section class="delivery-info" style="margin-top:12px"><div><p class="eyebrow">SPECIAL EVENT</p><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.body||'')}</p></div></section>`);
  const ds=state.catalog?.daySpecials||[]; if(ds.length) blocks.push(`<section class="delivery-info" style="margin-top:12px"><div><p class="eyebrow">TODAY'S SPECIAL</p><h3>🔥 ${ds.map(i=>escapeHtml(localizedName(i.id,i.name))).join(' • ')}</h3></div></section>`);
  return blocks.join('');
}

function marketingBanner(){
  const villages=state.catalog.deliveryZones.filter(z=>z.type==='outside');
  return `<section class="marketing-banner">
    <div class="marketing-glow one"></div><div class="marketing-glow two"></div>
    <div class="marketing-topline"><span class="pulse-dot"></span>${escapeHtml(t('marketingEyebrow'))}<span class="pulse-dot"></span></div>${state.catalog.comboOfDay?`<div class="marketing-combo-day">⭐ TODAY: ${escapeHtml(state.catalog.comboOfDay.name)} · ${money(state.catalog.comboOfDay.price)} (was ${money(state.catalog.comboOfDay.originalPrice)})</div>`:''}
    <div class="marketing-main"><div><p class="eyebrow">${escapeHtml(t('marketingQuality'))}</p><h2>${escapeHtml(t('marketingTitle'))}</h2><p>${escapeHtml(t('marketingBody'))}</p><div class="marketing-claim">⭐ ${escapeHtml(t('marketingClaim'))}</div></div><div class="marketing-badge"><strong>${villages.length}</strong><span>${escapeHtml(t('outsideVillages'))}</span><i>🚚</i></div></div>
    <div class="village-track"><div class="village-track-inner">${villages.map(z=>`<span class="village-pill">📍 ${escapeHtml(localizedZoneName(z))}</span>`).join('')}<span class="village-pill duplicate">📍 ${escapeHtml(localizedZoneName(villages[0]))}</span><span class="village-pill duplicate">📍 ${escapeHtml(localizedZoneName(villages[1]))}</span></div></div>
  </section>`;
}
function homeBtn(icon,title,sub,action){return `<button class="home-btn" data-view="${action}"><span class="emoji">${icon}</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(sub)}</small><span class="arrow">→</span></button>`;}

function productCard(item){
  const isWater=item.id==='D1' && Array.isArray(item.variants) && item.variants.length;
  const plain=state.cart.find(x=>x.id===item.id&&!x.extraCheese&&!x.isCombo&&!x.variantKey);
  const cheese=state.cart.find(x=>x.id===item.id&&x.extraCheese);
  const variantQty=state.cart.filter(x=>x.id===item.id&&!x.isCombo).reduce((sum,x)=>sum+Number(x.qty||0),0);
  const favorite=state.favorites.has(item.id); const sold=!isAvailable(item); const closed=!orderingOpen(); const badge=state.catalog.bestsellers.some(x=>x.id===item.id)?`<span class="badge best">🔥 ${escapeHtml(t('bestsellers'))}</span>`:'';
  const vegBadge=isNonVeg(item)?`<span class="badge nonveg">${escapeHtml(t('nonVegTag'))}</span>`:`<span class="badge veg">${escapeHtml(t('vegTag'))}</span>`;
  const qty=isWater?variantQty:(plain?.qty||0);
  let actionHtml='';
  if(sold) actionHtml=`<button class="disabled-btn wide" disabled>${escapeHtml(t('soldOut'))}</button>`;
  else if(closed) actionHtml=`<button class="disabled-btn wide" disabled>Restaurant closed</button>`;
  else if(isWater){
    actionHtml=`${qty?`<div class="qty-line"><div class="qty"><span>${qty} ${escapeHtml(t('quantity'))}</span></div><button class="primary-btn" data-water-customize="${item.id}" ${closed?'disabled':''}>${closed?'Restaurant closed':escapeHtml(t('add'))}</button></div>`:`<button class="primary-btn wide" data-water-customize="${item.id}" ${closed?'disabled':''}>${closed?'Restaurant closed':escapeHtml(t('addToCart'))}</button>`}<div class="inline-note">💧 ${escapeHtml(t('waterSizeHint'))}</div>`;
  } else {
    const mainAction=qty?`<div class="qty-line"><div class="qty"><button data-change="${item.id}" data-delta="-1" ${closed?'disabled':''}>−</button><span>${qty}</span><button data-change="${item.id}" data-delta="1" ${closed?'disabled':''}>+</button></div><button class="primary-btn" ${closed?'disabled':''} ${item.id.startsWith('P')?`data-pizza-customize="${item.id}"`: `data-add="${item.id}"`}>${closed?'Restaurant closed':escapeHtml(t('add'))}</button></div>`:`<button class="primary-btn wide" ${closed?'disabled':''} ${item.id.startsWith('P')?`data-pizza-customize="${item.id}"`:`data-add="${item.id}"`}>${closed?'Restaurant closed':escapeHtml(t('addToCart'))}</button>`;
    const pizzaNote=item.id.startsWith('P')?`<div class="inline-note">🧀 ${escapeHtml(t('extraCheeseShort'))} ${escapeHtml(t('extraCheesePrice'))}${cheese?` • ✓ ${escapeHtml(t('added'))}`:''}</div>`:'';
    actionHtml=`${mainAction}${pizzaNote}`;
  }
  return `<article class="product-card ${sold?'sold':''}" data-card-id="${item.id}">
    <div class="card-media"><img class="product-img" src="${img(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"><div class="badges">${badge}${vegBadge}</div><button class="fav-btn ${favorite?'active':''}" aria-label="${favorite?escapeHtml(t('unfavorite')):escapeHtml(t('favorite'))}" data-fav="${item.id}">${favorite?'♥':'♡'}</button>${sold?`<div class="sold-overlay">${escapeHtml(t('soldOut'))}</div>`:''}</div>
    <div class="product-body"><div>${nameMarkup(item.id,item.name)}<div class="price">${isWater?`From ${money(Math.min(...item.variants.map(v=>Number(v.price))))}`:money(item.price)}</div></div><div class="product-actions">${actionHtml}</div></div>
  </article>`;
}

function openPizzaCustomizer(id){
  const item=itemById(id); if(!item||!item.id.startsWith('P')||!isAvailable(item))return;
  state.pizzaCustomizerId=id;
  const existing=document.getElementById('pizzaCustomizerModal');
  if(existing)existing.remove();
  const price=Number(item.price||0); const cheesePrice=Number(state.catalog.extraCheesePrice||30);
  const modal=document.createElement('div'); modal.id='pizzaCustomizerModal'; modal.className='pizza-customizer-modal open'; modal.setAttribute('aria-hidden','false');
  modal.innerHTML=`<div class="pizza-modal-backdrop" data-pizza-modal-close></div><div class="pizza-modal-card" role="dialog" aria-modal="true" aria-labelledby="pizzaCustomizerTitle"><button class="modal-close" type="button" data-pizza-modal-close aria-label="Close">✕</button><div class="pizza-modal-head"><img src="${img(item.image)}" alt="${escapeHtml(item.name)}"><div><p class="eyebrow">${escapeHtml(t('customizePizza'))}</p><h2 id="pizzaCustomizerTitle">${escapeHtml(localizedName(item.id,item.name))}</h2>${state.language!=='en'?`<small class="english-name">${escapeHtml(item.name)}</small>`:''}<p>${escapeHtml(t('customizeSubtitle'))}</p></div></div><div class="pizza-option-box"><div class="pizza-option-row"><div><strong>🧀 ${escapeHtml(t('extraCheeseShort'))}</strong><span>${escapeHtml(t('pizzaCustomizationHint'))}</span></div><span class="pizza-option-price">${escapeHtml(t('extraCheesePrice'))}</span><label class="custom-check"><input type="checkbox" id="pizzaExtraCheeseCheck"><span></span></label></div></div><div class="pizza-modal-footer"><div><small>${escapeHtml(t('customizedTotal'))}</small><strong id="pizzaCustomizeTotal">${money(price)}</strong></div><button class="primary-btn" data-pizza-modal-add>${escapeHtml(t('addPizzaToCart'))} <span>→</span></button></div></div>`;
  document.body.appendChild(modal); document.body.classList.add('pizza-modal-open');
  const check=modal.querySelector('#pizzaExtraCheeseCheck'); const total=modal.querySelector('#pizzaCustomizeTotal');
  check.addEventListener('change',()=>{total.textContent=money(price+(check.checked?cheesePrice:0));});
  requestAnimationFrame(()=>check.focus());
}
function closePizzaCustomizer(){const modal=document.getElementById('pizzaCustomizerModal');if(modal)modal.remove();state.pizzaCustomizerId=null;document.body.classList.remove('pizza-modal-open');}
function addCustomizedPizza(){if(!orderingOpen()){closePizzaCustomizer();return;}const id=state.pizzaCustomizerId;const check=document.getElementById('pizzaExtraCheeseCheck');const cheese=Boolean(check?.checked);if(id){addItem(id,cheese);refreshVisibleProductCard(id);}closePizzaCustomizer();noteViewed(id);openCartToast();}

function openWaterCustomizer(id){
  const item=itemById(id); if(!item||!Array.isArray(item.variants)||!isAvailable(item))return;
  state.waterCustomizerId=id;
  const existing=document.getElementById('waterCustomizerModal'); if(existing)existing.remove();
  const modal=document.createElement('div'); modal.id='waterCustomizerModal'; modal.className='pizza-customizer-modal open'; modal.setAttribute('aria-hidden','false');
  const currentCounts={}; state.cart.filter(x=>x.id===id&&x.variantKey).forEach(x=>currentCounts[x.variantKey]=(currentCounts[x.variantKey]||0)+Number(x.qty||0));
  modal.innerHTML=`<div class="pizza-modal-backdrop" data-water-modal-close></div><div class="pizza-modal-card water-modal-card" role="dialog" aria-modal="true" aria-labelledby="waterCustomizerTitle"><button class="modal-close" type="button" data-water-modal-close aria-label="Close">✕</button><div class="pizza-modal-head"><img src="${img(item.image)}" alt="${escapeHtml(item.name)}"><div><p class="eyebrow">${escapeHtml(t('customizeSubtitle'))}</p><h2 id="waterCustomizerTitle">💧 Water</h2><p>${escapeHtml(t('waterSizeHint'))}</p></div></div><div class="pizza-option-box water-option-box">${item.variants.map(v=>`<button type="button" class="pizza-option-row water-option ${currentCounts[v.key]?'selected':''}" data-water-variant="${escapeHtml(v.key)}" aria-pressed="${currentCounts[v.key]?'true':'false'}"><span class="water-option-copy"><strong>💧 ${escapeHtml(v.label)}</strong><span>${currentCounts[v.key]?`${currentCounts[v.key]} already in cart`:'Select this size'}</span></span><span class="pizza-option-price">${money(v.price)}</span><span class="water-radio" aria-hidden="true"></span></button>`).join('')}</div><div class="pizza-modal-footer"><div><small>${escapeHtml(t('drinksHint'))}</small><strong id="waterSelectedPrice">${escapeHtml(t('waterSize'))}</strong></div><button class="primary-btn" data-water-modal-add disabled>${escapeHtml(t('addWaterToCart'))} <span>→</span></button></div></div>`;
  document.body.appendChild(modal); document.body.classList.add('pizza-modal-open');
  modal.querySelectorAll('[data-water-variant]').forEach(btn=>btn.addEventListener('click',()=>{modal.querySelectorAll('[data-water-variant]').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});btn.classList.add('selected');btn.setAttribute('aria-pressed','true');const v=item.variants.find(x=>x.key===btn.dataset.waterVariant);modal.querySelector('#waterSelectedPrice').textContent=money(v.price);modal.querySelector('[data-water-modal-add]').disabled=false;modal.dataset.selectedVariant=v.key;}));
}
function closeWaterCustomizer(){const modal=document.getElementById('waterCustomizerModal');if(modal)modal.remove();state.waterCustomizerId=null;if(!document.getElementById('pizzaCustomizerModal'))document.body.classList.remove('pizza-modal-open');}
function addWaterToCart(){if(!orderingOpen()){closeWaterCustomizer();return;}const modal=document.getElementById('waterCustomizerModal');const id=state.waterCustomizerId;const key=modal?.dataset.selectedVariant;if(!id||!key)return;addItem(id,false,1,key);closeWaterCustomizer();noteViewed(id);refreshVisibleProductCard(id);openCartToast();}

function menu(preserve=false){
  const cats=state.catalog.categories.map(c=>`<button class="cat-chip ${!state.menuSpecial&&state.category===c.key?'active':''}" data-category="${c.key}">${c.emoji} ${escapeHtml(catName(c.key))}</button>`).join('');
  const menuPacks=`<button class="cat-chip menu-pack-chip ${state.menuSpecial==='combos'?'active':''}" data-menu-pack="combos">🎁 ${escapeHtml(t('combos'))}</button><button class="cat-chip menu-pack-chip ${state.menuSpecial==='family'?'active':''}" data-menu-pack="family">👨‍👩‍👧‍👦 ${escapeHtml(t('family'))}</button>`;
  const cat=state.catalog.categories.find(c=>c.key===state.category)||state.catalog.categories[0]; if(!cat)return;

  if(state.menuSpecial){
    const list=state.menuSpecial==='family'?filterVegPacks(state.catalog.familyPacks):filterVegPacks(state.catalog.combos);
    const title=state.menuSpecial==='family'?`👨‍👩‍👧‍👦 ${escapeHtml(t('family'))}`:`🎁 ${escapeHtml(t('combos'))}`;
    const subtitle=state.menuSpecial==='family'?t('familySub'):t('comboSub');
    render(`<div class="section-head"><div><button class="back-btn" data-menu-all>← ${escapeHtml(t('viewAll'))}</button><p class="eyebrow">${escapeHtml(t('browseMenu'))}</p><h2>${title}</h2><p class="muted menu-special-subtitle">${escapeHtml(subtitle)}</p></div><div class="store-status"><span class="live-dot"></span>${escapeHtml(statusText())}</div></div><div class="quick-search menu-search"><span>⌕</span><input id="globalSearch" value="${escapeHtml(state.search)}" placeholder="${escapeHtml(t('search'))}"/><button data-search-go>→</button></div><div class="menu-category-sticky"><div class="category-row">${cats}${menuPacks}</div></div><div class="menu-pack-note">${state.menuSpecial==='family'?'👨‍👩‍👧‍👦':'🎁'} ${escapeHtml(t('completeMeal'))}</div><div class="packs menu-special-grid">${list.length?list.map(packCard).join(''):`<div class="empty-state"><div style="font-size:48px">🔎</div><p>${escapeHtml(t('noDishes'))}</p></div>`}</div>`,preserve);
    return;
  }

  state.category=cat.key; let items=cat.items.slice(); const q=state.search.trim().toLowerCase(); if(q)items=items.filter(i=>`${i.name} ${(localizedName(i.id,i.name))}`.toLowerCase().includes(q));
  if(state.nonVegMode)items=items.filter(isNonVeg); else if(state.vegMode)items=items.filter(isVeg); else { if(state.filter==='veg')items=items.filter(isVeg); if(state.filter==='nonveg')items=items.filter(isNonVeg); } if(state.filter==='under300')items=items.filter(i=>Number(i.price)<300);
  const filters=[['all',t('all')],['veg',t('veg')],['nonveg',t('nonVeg')],['under300',t('under300')]].map(([id,label])=>`<button class="filter-chip ${state.filter===id?'active':''}" data-filter="${id}">${escapeHtml(label)}</button>`).join('');
  render(`<div class="section-head"><div><button class="back-btn" data-view="home">← ${escapeHtml(t('home'))}</button><p class="eyebrow">${escapeHtml(t('browseMenu'))}</p><h2>${escapeHtml(t('menu'))}</h2></div><div class="store-status"><span class="live-dot"></span>${escapeHtml(statusText())}</div></div><div class="quick-search menu-search"><span>⌕</span><input id="globalSearch" value="${escapeHtml(state.search)}" placeholder="${escapeHtml(t('search'))}"/><button data-search-go>→</button></div><div class="menu-category-sticky"><div class="category-row">${cats}${menuPacks}</div></div><div class="filter-row">${filters}</div>${state.vegMode?`<div class="veg-mode-banner">🥬 ${escapeHtml(t('vegModeHint'))}</div>`:''}<div class="section-head"><div><p class="eyebrow">${cat.emoji} ${escapeHtml(t('chooseCategory'))}</p><h2>${escapeHtml(catName(cat.key))}</h2></div></div><div class="product-grid">${items.length?items.map(productCard).join(''):`<div class="empty-state"><div style="font-size:48px">🔎</div><p>${escapeHtml(t('noDishes'))}</p><button class="ghost-btn boxed" data-clear-search>${escapeHtml(t('viewAll'))}</button></div>`}</div>`,preserve);
}
function bestsellers(preserve=false){const cards=filterVegItems(state.catalog.bestsellers).map(productCard).join('');render(`<div class="section-head"><div><button class="back-btn" data-view="home">← ${escapeHtml(t('home'))}</button><p class="eyebrow">${escapeHtml(t('popularNow'))}</p><h2>🔥 ${escapeHtml(t('bestsellers'))}</h2></div></div><div class="product-grid">${cards}</div>`,preserve);}
function packs(type,preserve=false){const all=type==='family'?state.catalog.familyPacks:state.catalog.combos;const arr=filterVegPacks(all);render(`<div class="section-head"><div><button class="back-btn" data-view="home">← ${escapeHtml(t('home'))}</button><p class="eyebrow">${escapeHtml(t('popularNow'))}</p><h2>${type==='family'?'👨‍👩‍👧‍👦 '+escapeHtml(t('family')):'🎁 '+escapeHtml(t('combos'))}</h2></div></div><div class="packs">${arr.map(packCard).join('')}</div>`,preserve);}
function packCard(pack){const type=state.catalog.familyPacks.some(x=>x.id===pack.id)?'family':'combo';const existing=state.cart.find(x=>x.id===pack.id&&x.isCombo);const sold=!isAvailable(pack); const closed=!orderingOpen();return `<article class="pack-card ${sold?'sold':''}" data-pack-card-id="${escapeHtml(pack.id)}"><div class="pack-media"><img src="${packImg(pack.image,type)}" alt="${escapeHtml(pack.name)}" loading="lazy"><span class="pack-tag">${type==='family'?'FAMILY':'COMBO'}</span>${sold?`<div class="sold-overlay">${escapeHtml(t('soldOut'))}</div>`:''}</div><div class="pack-body">${nameMarkup(pack.id,pack.name,'pack-name')}<p>${escapeHtml(pack.description||'')}</p><div class="price">${money(pack.price)}</div>${existing?`<div class="pack-added">✓ ${escapeHtml(t('added'))} × ${existing.qty}</div><div class="qty-line pack-qty"><div class="qty"><button data-pack-change="${pack.id}" data-delta="-1" ${closed?'disabled':''}>−</button><span>${existing.qty}</span><button class="primary-btn" data-add-pack="${pack.id}" ${closed?'disabled':''}>${closed?'Restaurant closed':escapeHtml(t('add'))}</button></div></div>`:`<button class="primary-btn wide" data-add-pack="${pack.id}" ${sold||closed?'disabled':''}>${sold?escapeHtml(t('soldOut')):(closed?'Restaurant closed':escapeHtml(t('addToCart')))}</button>`}</div></article>`;}

function refreshVisibleProductCard(id){
  const card=document.querySelector(`[data-card-id="${CSS.escape(String(id))}"]`); if(!card)return;
  const item=itemById(id); if(!item)return;
  const sold=!isAvailable(item);
  card.classList.toggle('sold',sold);
  const imgEl=card.querySelector('.product-img'); if(imgEl && item.image) imgEl.src=img(item.image);
  const priceEl=card.querySelector('.product-body .price');
  if(priceEl) priceEl.textContent=(id==='D1'&&item.variants?.length)?`From ${money(Math.min(...item.variants.map(v=>Number(v.price))))}`:money(item.price);
  const actions=card.querySelector('.product-actions'); if(actions){
    const tmp=document.createElement('template'); const fresh=productCard(item).trim(); tmp.innerHTML=fresh;
    const freshAction=tmp.content.firstElementChild?.querySelector('.product-actions');
    if(freshAction) actions.replaceWith(freshAction);
  }
  const overlay=card.querySelector('.sold-overlay');
  if(sold && !overlay){const o=document.createElement('div');o.className='sold-overlay';o.textContent=t('soldOut');card.querySelector('.card-media')?.appendChild(o);}
  if(!sold && overlay)overlay.remove();
}
function refreshVisiblePackCard(id){
  const card=document.querySelector(`[data-pack-card-id="${CSS.escape(String(id))}"]`); if(!card)return;
  const pack=packById(id); if(!pack)return;
  card.classList.toggle('sold',!isAvailable(pack));
  const body=card.querySelector('.pack-body'); const tmp=document.createElement('template');tmp.innerHTML=packCard(pack).trim();
  const freshBody=tmp.content.firstElementChild?.querySelector('.pack-body');if(body&&freshBody)body.replaceWith(freshBody);
  const media=card.querySelector('.pack-media'); const freshMedia=tmp.content.firstElementChild?.querySelector('.pack-media');if(media&&freshMedia)media.replaceWith(freshMedia);
}

function refreshOpenCart(){if(cartDrawer?.classList.contains('open'))renderCartDrawer();}
function addItem(id,cheese=false,qty=1,variantKey=null){
  if(!orderingOpen()) return;
  const item=itemById(id);if(!item||!isAvailable(item))return;
  const variant=Array.isArray(item.variants)?item.variants.find(v=>String(v.key)===String(variantKey||'')):null;
  if(item.variants?.length&&!variant)return;
  const key=variant?`${id}:${variant.key}`:`${id}:${cheese?'cheese':'plain'}`;
  const found=state.cart.find(x=>x.key===key);
  const price=Number(variant?variant.price:item.price)+(cheese?Number(state.catalog.extraCheesePrice):0);
  const name=variant?`${item.name} - ${variant.label}`:(cheese?`${item.name} + Extra Cheese`:item.name);
  if(found)found.qty+=qty;else state.cart.push({key,id,name,englishName:item.name,price,qty,image:item.image,extraCheese:cheese,isCombo:false,variantKey:variant?.key||null,variantLabel:variant?.label||null});
  saveCart();refreshOpenCart();
}
function addComboOfDay(){const c=state.catalog?.comboOfDay;if(!c||!c.available||c.autoUnavailable||!orderingOpen())return;const key=`${c.packId}:comboDay`;const found=state.cart.find(x=>x.key===key);if(found)found.qty+=1;else state.cart.push({key,id:c.packId,name:`${c.name} — Combo of the Day`,englishName:c.name,price:Number(c.price),originalPrice:Number(c.originalPrice),discount:Number(c.discount),qty:1,image:c.image,extraCheese:false,isCombo:true,packType:c.packType,comboOfDay:true});saveCart();refreshOpenCart();openCartToast();}
function addPack(id,qty=1){if(!orderingOpen())return;const pack=packById(id);if(!pack||!isAvailable(pack))return;const key=`${id}:pack`;const found=state.cart.find(x=>x.key===key);const family=state.catalog.familyPacks.some(x=>x.id===id);if(found)found.qty+=qty;else state.cart.push({key,id,name:pack.name,englishName:pack.name,price:Number(pack.price),qty,image:pack.image,extraCheese:false,isCombo:true,packType:family?'family':'combo'});saveCart();refreshOpenCart();}
function changeCartItem(key,delta){const i=state.cart.findIndex(x=>x.key===key);if(i<0)return;state.cart[i].qty+=delta;if(state.cart[i].qty<=0){state.cart.splice(i,1);}saveCart();}
function renderView(preserve=false){updateCartBadge();if(!state.catalog)return languageScreen();if(state.view==='language')return languageScreen();if(state.view==='home')return home(preserve);if(state.view==='menu')return menu(preserve);if(state.view==='bestsellers')return bestsellers(preserve);if(state.view==='combos')return packs('combo',preserve);if(state.view==='family')return packs('family',preserve);if(state.view==='checkout')return checkout();if(state.view==='tracking')return trackingPage();if(state.view==='search')return searchPage(preserve);return home(preserve);}
function productSearchResults(query){const q=query.trim().toLowerCase();if(!q)return{items:[],packs:[]};const items=filterVegItems(getAllProducts()).filter(x=>x.name.toLowerCase().includes(q)||localizedName(x.id,x.name).toLowerCase().includes(q));const packsArr=filterVegPacks([...state.catalog.combos,...state.catalog.familyPacks].filter(x=>x.name.toLowerCase().includes(q)||localizedName(x.id,x.name).toLowerCase().includes(q)));return{items,packs:packsArr};}
function searchPage(preserve=false){const r=productSearchResults(state.search);render(`<div class="section-head"><div><button class="back-btn" data-view="home">← ${escapeHtml(t('home'))}</button><p class="eyebrow">${escapeHtml(t('searchTitle'))}</p><h2>“${escapeHtml(state.search)}”</h2></div></div><div class="product-grid">${r.items.map(productCard).join('')}</div><div class="packs">${r.packs.map(packCard).join('')}</div>${(!r.items.length&&!r.packs.length)?`<div class="empty-state"><div style="font-size:48px">🔎</div><p>${escapeHtml(t('noResults'))}</p></div>`:''}`,preserve);}

function renderCartDrawer(){const suggested=cartRecommendations();document.getElementById('cartItems').innerHTML=state.cart.length?`${state.cart.map(cartRow).join('')}${suggested?`<div class="recommendations"><p class="eyebrow">${escapeHtml(t('completeMeal'))}</p><h3>${escapeHtml(t('popularPairing'))}</h3><div class="rec-grid">${suggested.map(recommendationCard).join('')}</div></div>`:''}`:`<div class="empty-state"><div style="font-size:52px">🛒</div><p>${escapeHtml(t('cartEmpty'))}</p><button class="primary-btn" data-view="menu">${escapeHtml(t('browseMenu'))}</button></div>`;document.getElementById('cartTotal').textContent=money(cartSubtotal());const checkoutBtn=document.querySelector('[data-checkout]');if(checkoutBtn)checkoutBtn.disabled=!state.cart.length||!orderingOpen();}
function cartRow(x){const english=x.englishName||x.name.replace(/ \+ Extra Cheese$/,'');const name=state.language==='en'?x.name:localizedName(x.id,english)+(x.extraCheese?` + ${t('extraCheese')}`:'');return `<div class="cart-row"><img src="${x.isCombo?packImg(x.image,x.packType):img(x.image)}" alt="${escapeHtml(name)}"><div class="cart-info">${state.language==='en'?`<h4>${escapeHtml(name)}</h4>`:`<h4 class="local-name">${escapeHtml(name)}</h4><small class="english-name">${escapeHtml(english)}</small>`}<small>${money(x.price)} each</small><div class="qty cart-qty"><button data-cart-change="${x.key}" data-delta="-1">−</button><span>${x.qty}</span><button data-cart-change="${x.key}" data-delta="1">+</button></div></div><strong>${money(x.price*x.qty)}</strong></div>`;}
function clearCart(){state.cart=[];saveCart();renderCartDrawer();}
function cartRecommendations(){if(!state.catalog||!state.cart.length)return[];const ids=new Set(state.cart.map(x=>x.id));const want=[];if(state.cart.some(x=>/^P/.test(x.id)))want.push(...getAllProducts().filter(x=>/^S(1|8|9)$/.test(x.id)));if(state.cart.some(x=>/^S/.test(x.id)))want.push(...getAllProducts().filter(x=>/^M(4|7|8)$/.test(x.id)));if(state.cart.some(x=>/^B/.test(x.id)))want.push(...getAllProducts().filter(x=>/^S(1|2|8)$/.test(x.id)));if(!want.length)want.push(...getAllProducts().filter(x=>/^M(4|8)$/.test(x.id)));return filterVegItems(want).filter(x=>!ids.has(x.id)&&isAvailable(x)).slice(0,3);}
function recommendationCard(item){return `<div class="rec-card"><img src="${img(item.image)}" alt=""><div>${nameMarkup(item.id,item.name,'rec-name')}<span>${money(item.price)}</span></div><button data-add="${item.id}">+</button></div>`;}

function calculateClientDelivery(zoneId=state.selectedZone,subtotal=cartSubtotal()){const z=state.catalog.deliveryZones.find(x=>x.id===zoneId);if(!z)return{valid:false,charge:0,total:subtotal,error:t('chooseDelivery')};const amount=Number(subtotal)||0;if(amount<z.minOrder)return{valid:false,charge:z.deliveryCharge,total:amount+z.deliveryCharge,error:`${t('minimum')}: ${money(z.minOrder)} (${money(z.minOrder-amount)} ${t('extraNeeded')})`,zone:z,amountToFree:Math.max(0,Number(z.freeAbove||0)-amount)};const free=amount>=z.freeAbove;const amountToFree=Math.max(0,Number(z.freeAbove||0)-amount);const charge=free?0:z.deliveryCharge;return{valid:true,charge,total:amount+charge,free,zone:z,amountToFree};}

function checkout(){
  if(!state.cart.length){openCart();return;}
  const calc=calculateClientDelivery();
  const zones=state.catalog.deliveryZones.map(z=>`<option value="${z.id}" ${z.id===state.selectedZone?'selected':''}>${escapeHtml(localizedZoneName(z))}${z.type==='outside'?` — MOV ₹${z.minOrder}`:''}</option>`).join('');
  const loc=state.location;
  render(`<section class="checkout"><div class="section-head"><div><button class="back-btn" data-view="home">← ${escapeHtml(t('home'))}</button><p class="eyebrow">${escapeHtml(t('secureCheckout'))}</p><h2>${escapeHtml(t('deliveryDetails'))}</h2></div><div class="store-status"><span class="live-dot"></span>${escapeHtml(statusText())}</div></div>
    <div class="checkout-layout"><div class="form-card glow-card"><div class="form-head"><div class="form-icon">🍕</div><div><h2>${escapeHtml(t('deliveryDetails'))}</h2><p class="muted">${escapeHtml(t('keepPhone'))}</p></div></div>
      <div class="field"><label>${escapeHtml(t('name'))}</label><input id="customerName" placeholder="${escapeHtml(t('enterName'))}" autocomplete="name"></div>
      <div class="field"><label>${escapeHtml(t('mobile'))}</label><input id="customerPhone" inputmode="numeric" maxlength="15" value="${escapeHtml(state.phone)}" placeholder="${escapeHtml(t('enterMobile'))}" autocomplete="tel"></div>
      <div class="field"><label>${escapeHtml(t('deliveryArea'))}</label><select id="deliveryZone">${zones}</select><div id="deliveryHint" class="delivery-hint"></div></div>
      <div class="field"><label>${escapeHtml(t('address'))}</label><textarea id="customerAddress" placeholder="${escapeHtml(t('enterAddress'))}" autocomplete="street-address"></textarea></div>
      <div class="field"><label>${escapeHtml(t('landmark'))}</label><input id="customerLandmark" placeholder="${escapeHtml(t('enterLandmark'))}"></div>
      <div class="field"><label>${escapeHtml(t('restaurantNote'))}</label><textarea id="restaurantNote" class="restaurant-note" maxlength="300" placeholder="${escapeHtml(t('restaurantNotePlaceholder'))}" rows="2"></textarea></div>
      <div class="gps-card ${loc?'captured':''}"><div class="gps-icon">📍</div><div class="gps-copy"><strong>${escapeHtml(t('gpsTitle'))}</strong><p>${loc?`${escapeHtml(t('gpsCaptured'))} • ±${Math.round(loc.accuracy||0)} m`:escapeHtml(t('gpsHint'))}</p>${loc?`<small>${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)} · <a href="https://maps.google.com/?q=${loc.latitude},${loc.longitude}" target="_blank" rel="noopener">${escapeHtml(t('map'))}</a></small>`:''}<div id="gpsError" class="gps-error"></div></div><button type="button" class="primary-btn gps-btn" data-get-gps>📍 ${escapeHtml(t('useGPS'))}</button></div>
      <div class="payment-card"><span>💵</span><div><strong>${escapeHtml(t('cod'))}</strong><div class="inline-note">${escapeHtml(t('codHint'))}</div></div><span class="check">✓</span></div>
      <div class="order-summary"><p class="eyebrow">${escapeHtml(t('yourOrder'))}</p>${state.cart.map(x=>`<div class="summary-line"><span>${escapeHtml(x.name)} × ${x.qty}</span><strong>${money(x.price*x.qty)}</strong></div>`).join('')}<div class="summary-line"><span>${escapeHtml(t('subtotal'))}</span><strong>${money(cartSubtotal())}</strong></div><div class="summary-line"><span>${escapeHtml(t('delivery'))} <small id="deliveryZoneName">${calc.zone?escapeHtml(localizedZoneName(calc.zone)):''}</small></span><strong id="deliveryCharge">${calc.valid?(calc.charge?money(calc.charge):t('deliveryFree')):'—'}</strong></div><div class="summary-line total-line"><span>${escapeHtml(t('total'))}</span><strong id="checkoutTotal">${calc.valid?money(calc.total):money(cartSubtotal())}</strong></div></div>
      <button type="button" class="primary-btn wide place-btn" data-place-order ${(!orderingOpen()||!calc.valid)?'disabled':''}>${!orderingOpen()?escapeHtml(t('closed')):escapeHtml(t('placeOrder'))} <span>✓</span></button><p class="form-footnote">${!orderingOpen()?escapeHtml(t('orderingUnavailable')):''}</p>
    </div><div class="checkout-side"><div class="side-card"><p class="eyebrow">${escapeHtml(t('yourOrder'))}</p><div class="mini-total">${money(cartSubtotal())}</div><span>${state.cart.length} ${escapeHtml(t('cart'))}</span></div><div class="side-card"><p class="eyebrow">${escapeHtml(t('deliveryRules'))}</p>${state.catalog.deliveryZones.map(z=>`<div class="rule"><span>${escapeHtml(localizedZoneName(z))}</span><strong>${z.deliveryCharge===0?'FREE':money(z.deliveryCharge)}</strong><small>${z.minOrder?`MOV ₹${z.minOrder} • `:''}${z.freeAbove?`Free ≥ ₹${z.freeAbove}`:''} • ${z.estimatedMinutes||30} min</small></div>`).join('')}</div></div></div>
  </section>`);
  updateDeliverySummary();
  restoreCheckoutDraft();
}

function getGPS(){
  const error=document.getElementById('gpsError');if(error)error.textContent='';
  if(!('geolocation' in navigator)){if(error)error.textContent=escapeHtml(t('allowGPS'));return;}
  const btn=document.querySelector('[data-get-gps]');if(btn){btn.disabled=true;btn.innerHTML=`📍 ${escapeHtml(t('locating'))}`;}
  navigator.geolocation.getCurrentPosition(pos=>{
    state.location={latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,capturedAt:new Date().toISOString()};
    const card=document.querySelector('.gps-card');card?.classList.add('captured');
    const copy=card?.querySelector('.gps-copy');
    if(copy)copy.innerHTML=`<strong>${escapeHtml(t('gpsTitle'))}</strong><p>${escapeHtml(t('gpsCaptured'))} • ±${Math.round(pos.coords.accuracy||0)} m</p><small>${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} · <a href="https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}" target="_blank" rel="noopener">${escapeHtml(t('map'))}</a></small><div id="gpsError" class="gps-error"></div>`;
    if(btn){btn.disabled=false;btn.innerHTML=`📍 ${escapeHtml(t('gpsCaptured'))}`;}
  },err=>{
    if(error)error.textContent=`${escapeHtml(t('allowGPS'))} (${escapeHtml(err.message||'permission denied')})`;
    const b=document.querySelector('[data-get-gps]');if(b){b.disabled=false;b.innerHTML=`📍 ${escapeHtml(t('useGPS'))}`;}
  },{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}

async function placeOrder(){
  const name=document.getElementById('customerName')?.value.trim();const phone=normalizePhone(document.getElementById('customerPhone')?.value||'');const address=document.getElementById('customerAddress')?.value.trim();const landmark=document.getElementById('customerLandmark')?.value.trim();const restaurantNote=document.getElementById('restaurantNote')?.value.trim()||'';const deliveryZone=document.getElementById('deliveryZone')?.value||state.selectedZone;const calc=calculateClientDelivery(deliveryZone);
  if(!orderingOpen()){alert(state.catalog?.ordering?.reason||t('orderingUnavailable'));renderView(true);return;}if(!name||name.length<2){alert(t('enterName'));return;}if(phone.length<10){alert(t('enterMobile'));return;}if(!address||address.length<5){alert(t('enterAddress'));return;}if(!calc.valid){alert(calc.error);return;}
  state.phone=phone;state.selectedZone=deliveryZone;
  const payload={name,address,landmark,phone,language:state.language,paymentMethod:'COD',deliveryZone,location:state.location,items:state.cart.map(x=>({id:x.id,qty:x.qty,price:x.price,extraCheese:x.extraCheese,variantKey:x.variantKey||null,isCombo:x.isCombo,packType:x.packType,comboOfDay:Boolean(x.comboOfDay)})),restaurantNote};
  const btn=document.querySelector('[data-place-order]');if(btn){btn.disabled=true;btn.innerHTML=`${escapeHtml(t('placing'))}`;}
  try{
    const r=await fetch('/api/order/place',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),cache:'no-store'});
    const data=await r.json();
    if(!r.ok||!data.success)throw new Error(data.error||'Order failed');
    const etaMinutes=Number(data.estimatedMinutes||calc.zone?.estimatedMinutes||30);
    state.lastOrder=data.order||{order_id:data.orderId,total:data.total,subtotal:data.subtotal,delivery_charge:data.deliveryCharge,delivery_zone:data.deliveryZone,user_name:name,address,landmark,location:state.location,items:payload.items,payment_method:'COD',status:'received',created_at:new Date().toISOString(),estimated_minutes:etaMinutes,user_id:`${phone}@web`,language:state.language};
    state.lastOrder.order_id=data.orderId;state.lastOrder.phone=phone;state.lastOrder.estimated_minutes=etaMinutes;
    saveJson('tpp_last_order',state.lastOrder);
    sessionStorage.removeItem('tpp_checkout_draft');
    state.cart=[];saveCart();requestNotificationPermission();
    // Every successful web order ends on a fresh page load. The order/phone query lets init()
    // rebuild the tracking page from the server instead of showing stale client state.
    const freshUrl=`/order?phone=${encodeURIComponent(phone)}&order=${encodeURIComponent(data.orderId)}&refresh=${Date.now()}`;
    window.location.replace(freshUrl);
  }
  catch(err){alert(err.message||'Could not place the order.');const b=document.querySelector('[data-place-order]');if(b){b.disabled=false;b.innerHTML=`${escapeHtml(t('placeOrder'))} <span>✓</span>`;}}
}

function updateDeliverySummary(){const zone=document.getElementById('deliveryZone');if(!zone||!state.catalog)return;state.selectedZone=zone.value;const calc=calculateClientDelivery(state.selectedZone);const hint=document.getElementById('deliveryHint');if(hint){if(!calc.valid)hint.innerHTML=`⚠️ ${escapeHtml(calc.error)}`;else if(calc.free)hint.innerHTML=`✅ ${escapeHtml(t('deliveryFree'))}`;else hint.innerHTML=`🚚 ${money(calc.charge)} delivery • ${escapeHtml(t('freeAbove'))} ${money(calc.zone.freeAbove)} · <strong>Add ${money(calc.amountToFree)}</strong> more to get free delivery`;}const dc=document.getElementById('deliveryCharge');if(dc)dc.textContent=calc.valid?(calc.charge?money(calc.charge):t('deliveryFree')):'—';const tn=document.getElementById('checkoutTotal');if(tn)tn.textContent=money(calc.valid?calc.total:cartSubtotal());const zn=document.getElementById('deliveryZoneName');if(zn)zn.textContent=calc.zone?localizedZoneName(calc.zone):'';const btn=document.querySelector('[data-place-order]');if(btn)btn.disabled=!calc.valid||!orderingOpen();}
function trackingPage(){
  const o=state.lastOrder;if(!o?.order_id)return home();
  const minutes=Number(o.estimated_minutes||30); const eta=new Date(new Date(o.created_at||Date.now()).getTime()+minutes*60000);
  const status=o.status||'received'; const steps=[['received',t('receivedStatus'),'✓'],['preparing',t('preparing'),'🔥'],['ready',t('ready'),'🍕'],['out_for_delivery',t('outForDelivery'),'🛵'],['delivered',t('delivered'),'✓']]; const idx=Math.max(0,steps.findIndex(s=>s[0]===status));
  clearInterval(state.etaTimer);
  render(`<section class="success"><div class="success-card glow-card tracking-card"><div class="order-seal" aria-label="Town Pizza Planet sealed logo"><div class="order-seal-ring"></div><div class="order-seal-glow"></div><div class="order-seal-plate"><img src="/order/logo.jpg" alt="Town Pizza Planet logo"></div><span>SEALED</span></div><div class="success-icon">✓</div><p class="eyebrow">${escapeHtml(t('orderConfirmed'))}</p><h1>${escapeHtml(t('wereOnIt'))} 🍕</h1><p class="success-copy">${escapeHtml(t('received'))}</p><div class="order-id">${escapeHtml(o.order_id)}</div><div class="eta-card"><div class="eta-ring"><strong id="etaTime">--:--</strong><small>min : sec</small></div><div><p class="eyebrow">${escapeHtml(t('arriving'))}</p><strong>${escapeHtml(t('about'))} ${minutes} ${escapeHtml(t('minutes'))}</strong><span>${escapeHtml(t('estimated'))} ${escapeHtml(`${minutes} ${t('minutes')}`)}</span></div></div><div class="timeline">${steps.map((s,i)=>`<div class="timeline-step ${i<=idx?'done':''} ${s[0]===status?'current':''}"><span>${s[2]}</span><div><strong>${escapeHtml(s[1])}</strong>${i===idx?`<small>${escapeHtml(t('orderStatus'))}</small>`:''}</div></div>`).join('')}</div><div class="tracking-meta"><span>💵 ${escapeHtml(t('cashTotal'))}</span><strong>${money(o.total)}</strong></div>${o.admin?.driver?`<div class="driver-tracking-card"><div><p class="eyebrow">DELIVERY DRIVER</p><strong>🛵 ${escapeHtml(o.admin.driver)}</strong><span>${escapeHtml(o.admin.driverPhone||'')}</span></div><a class="contact-btn" href="tel:${escapeHtml(o.admin.driverPhone||'')}">📞 Call Driver</a></div>`:''}<div class="tracking-actions"><button class="primary-btn" data-share-order>${escapeHtml(t('share'))}</button><button class="ghost-btn boxed" data-receipt>${escapeHtml(t('downloadReceipt'))}</button><button class="ghost-btn boxed" data-print-receipt>${escapeHtml(t('printReceipt'))}</button></div><div class="contact-panel"><p class="eyebrow">${escapeHtml(t('contactRestaurant'))}</p><div class="contact-actions"><a class="contact-btn" href="tel:9448769098">📞 9448769098</a><a class="contact-btn" href="tel:6362648283">📞 6362648283</a></div></div><section class="feedback-card">
  <p class="eyebrow">${escapeHtml(t('feedbackTitle'))}</p>
  <p class="muted feedback-subtitle">${escapeHtml(t('feedbackSubtitle'))}</p>
  <div class="star-rating" role="radiogroup" aria-label="5 star rating">
    ${[1,2,3,4,5].map(n=>`<button type="button" class="star-btn" data-feedback-rating="${n}" aria-label="${n} star${n>1?'s':''}">☆</button>`).join('')}
  </div>
  <textarea id="feedbackText" maxlength="500" rows="3" placeholder="${escapeHtml(t('feedbackSubtitle'))}"></textarea>
  <button class="primary-btn feedback-submit" type="button" data-submit-feedback disabled>${escapeHtml(t('feedbackSubmit'))}</button>
  <div id="feedbackResult" class="feedback-result"></div>
  <small class="muted">${escapeHtml(t('feedbackSkip'))}</small>
</section><div class="tracking-actions"><button class="ghost-btn boxed" data-view="home">${escapeHtml(t('backHome'))}</button></div></div></section>`);
  initFeedbackControls(o.order_id);
  const tick=()=>{const el=document.getElementById('etaTime'); if(!el)return; const diff=Math.max(0,eta-Date.now());const totalSec=Math.floor(diff/1000);const mm=Math.floor(totalSec/60);const ss=totalSec%60;el.textContent=`${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;};
  tick(); state.etaTimer=setInterval(tick,1000); startStatusPolling(o.order_id);
}

let selectedFeedbackRating = 0;
let feedbackSubmitting = false;
function initFeedbackControls(orderId){
  selectedFeedbackRating = 0;
  const buttons=[...document.querySelectorAll('[data-feedback-rating]')];
  const submit=document.querySelector('[data-submit-feedback]');
  const result=document.getElementById('feedbackResult');
  const existing=loadJson(`tpp_feedback_${orderId}`,null);
  if(existing){
    buttons.forEach(b=>{const n=Number(b.dataset.feedbackRating);b.disabled=true;b.textContent=n<=Number(existing.rating||0)?'★':'☆';b.classList.toggle('selected',n<=Number(existing.rating||0));});
    if(submit) submit.disabled=true;
    const ta=document.getElementById('feedbackText'); if(ta){ta.value=existing.feedback||'';ta.disabled=true;}
    if(result) result.textContent=t('feedbackThanks');
    return;
  }
  buttons.forEach(btn=>btn.addEventListener('click',()=>{
    selectedFeedbackRating=Number(btn.dataset.feedbackRating)||0;
    buttons.forEach(b=>{const n=Number(b.dataset.feedbackRating);b.textContent=n<=selectedFeedbackRating?'★':'☆';b.classList.toggle('selected',n<=selectedFeedbackRating);});
    if(submit) submit.disabled=false;
  }));
  if(submit) submit.addEventListener('click',async()=>{
    if(feedbackSubmitting || !selectedFeedbackRating) return;
    feedbackSubmitting=true; submit.disabled=true;
    try{
      const feedback=document.getElementById('feedbackText')?.value.trim()||'';
      const phone=normalizePhone(state.phone||'');
      const r=await fetch(`/api/order/feedback/${encodeURIComponent(orderId)}`,{
        method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',
        body:JSON.stringify({phone,rating:selectedFeedbackRating,feedback})
      });
      const d=await r.json();
      if(!r.ok||!d.success) throw new Error(d.error||'Could not submit feedback');
      saveJson(`tpp_feedback_${orderId}`,{rating:selectedFeedbackRating,feedback});
      buttons.forEach(b=>b.disabled=true);
      const ta=document.getElementById('feedbackText');if(ta)ta.disabled=true;
      if(result) result.textContent=t('feedbackThanks');
    }catch(err){
      if(result) result.textContent=err.message||'Could not submit feedback.';
      feedbackSubmitting=false;submit.disabled=false;
    }
  });
}

function startStatusPolling(orderId){clearInterval(state.statusTimer);if(!state.phone)return;state.statusTimer=setInterval(async()=>{try{const r=await fetch(`/api/order/status/${encodeURIComponent(orderId)}?phone=${encodeURIComponent(state.phone)}`,{cache:'no-store'});const d=await r.json();if(d.success&&d.order){const old=state.lastOrder?.status;const oldDriver=state.lastOrder?.admin?.driver||'';state.lastOrder=d.order;saveJson('tpp_last_order',state.lastOrder);const newDriver=d.order?.admin?.driver||'';if((old&&old!==d.order.status)||(oldDriver!==newDriver)){ notifyStatus(d.order.status,orderId);if(state.view==='tracking')trackingPage();}if(d.order.status==='delivered'||d.order.status==='cancelled')clearInterval(state.statusTimer);}}catch{}},15000);}
async function loadOrderHistory(){if(!state.phone)return[];try{const r=await fetch(`/api/order/history?phone=${encodeURIComponent(state.phone)}`,{cache:'no-store'});const d=await r.json();return d.success?(d.orders||[]):[];}catch{return[];}}
let historyCache=[];
function recentOrdersSection(){if(!historyCache.length)return '';return `<section class="mini-section"><div class="section-head"><div><p class="eyebrow">${escapeHtml(t('recentOrders'))}</p><h2>${escapeHtml(t('recentOrders'))}</h2></div></div><div class="history-row">${historyCache.slice(0,3).map(orderHistoryCard).join('')}</div></section>`;}
function statusLabel(status){return({received:t('receivedStatus'),preparing:t('preparing'),ready:t('ready'),out_for_delivery:t('outForDelivery'),delivered:t('delivered'),cancelled:t('cancelled')}[status]||status);}
function orderHistoryCard(o){return `<article class="history-card"><div><span>${escapeHtml(o.order_id)}</span><strong>${money(o.total)}</strong></div><p>${escapeHtml(new Date(o.created_at).toLocaleDateString('en-IN'))} • ${escapeHtml(statusLabel(o.status))}</p><button class="primary-btn wide" data-reorder="${o.order_id}">${escapeHtml(t('reorder'))}</button></article>`;}
async function reorder(orderId){const o=historyCache.find(x=>x.order_id===orderId);if(!o)return;state.cart=[];for(const x of o.items||[]){if(x.isCombo)addPack(x.id,Number(x.qty)||1);else addItem(x.id,Boolean(x.extraCheese),Number(x.qty)||1,x.variantKey||null);}saveCart();openCart();}
function favoritesSection(){const items=getAllProducts().filter(x=>state.favorites.has(x.id)&&isVegVisible(x)).slice(0,4);return items.length?`<section class="mini-section"><div class="section-head"><div><p class="eyebrow">♥</p><h2>${escapeHtml(t('favorites'))}</h2></div></div><div class="product-grid compact">${items.map(productCard).join('')}</div></section>`:'';}
function recentViewedSection(){const items=recentItemIds().map(itemById).filter(Boolean).slice(0,4);return items.length?`<section class="mini-section"><div class="section-head"><div><p class="eyebrow">↶</p><h2>${escapeHtml(t('recentlyViewed'))}</h2></div></div><div class="product-grid compact">${items.map(productCard).join('')}</div></section>`:'';}
function toggleFavorite(id){if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);saveFavorites();if(state.view==='menu')menu();else if(state.view==='bestsellers')bestsellers();else home();}
async function requestNotificationPermission(){try{if('Notification' in window&&Notification.permission==='default')await Notification.requestPermission();}catch{}}
function notifyStatus(status,orderId){try{if(!('Notification' in window)||Notification.permission!=='granted')return;const msg={received:t('receivedStatus'),preparing:t('preparing'),ready:t('ready'),out_for_delivery:t('outForDelivery'),delivered:t('delivered'),cancelled:t('cancelled')}[status]||status;new Notification(`Town Pizza Planet • ${orderId}`,{body:msg});}catch{}}
function shareOrder(){const o=state.lastOrder;if(!o)return;const shareUrl=`${location.origin}${location.pathname}?order=${encodeURIComponent(o.order_id)}&phone=${encodeURIComponent(state.phone)}`;const text=`Town Pizza Planet\nOrder ${o.order_id}\nTotal ${money(o.total)}\nStatus ${statusLabel(o.status||'received')}\n${shareUrl}`;if(navigator.share)navigator.share({title:'Town Pizza Planet Order',text}).catch(()=>{});else navigator.clipboard?.writeText(text).then(()=>alert('Order details copied.')).catch(()=>{});}
function receiptHtml(o){const rows=(o.items||[]).map(x=>`<tr><td>${escapeHtml(x.name||x.id)}</td><td>${x.qty}</td><td>${money((x.price||0)*x.qty)}</td></tr>`).join('');return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(t('receiptTitle'))}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#222}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left}.total{font-size:20px;font-weight:700;margin-top:18px}.muted{color:#666}</style></head><body><h1>🍕 Town Pizza Planet</h1><div class="muted">${escapeHtml(t('receiptTitle'))}</div><p><strong>Order:</strong> ${escapeHtml(o.order_id)}<br><strong>Name:</strong> ${escapeHtml(o.user_name||'Customer')}<br><strong>Mobile:</strong> ${escapeHtml(o.phone||o.user_id||'').replace(/@web/g,'')}<br><strong>Area:</strong> ${escapeHtml(o.delivery_zone||'')}<br><strong>Address:</strong> ${escapeHtml(o.address||'')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><p>Subtotal: ${money(o.subtotal)}<br>Delivery: ${o.delivery_charge?money(o.delivery_charge):'FREE'}</p><div class="total">Total: ${money(o.total)}</div><p>Payment: Cash on Delivery</p><p class="muted">${escapeHtml(t('estimated'))}: ${Number(o.estimated_minutes||30)} ${escapeHtml(t('minutes'))}</p></body></html>`;}
function downloadReceipt(){if(!state.lastOrder)return;const blob=new Blob([receiptHtml(state.lastOrder)],{type:'text/html'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${state.lastOrder.order_id}.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function printReceipt(){if(!state.lastOrder)return;const w=window.open('','_blank','width=720,height=900');if(!w)return;w.document.write(receiptHtml(state.lastOrder));w.document.close();w.focus();setTimeout(()=>w.print(),300);}

app.addEventListener('input',e=>{
  if(e.target.id==='globalSearch')state.search=e.target.value;
  if(['customerName','customerPhone','customerAddress','customerLandmark','restaurantNote'].includes(e.target.id))captureCheckoutDraft();
});
app.addEventListener('change',e=>{
  if(e.target.id==='deliveryZone'){state.selectedZone=e.target.value;captureCheckoutDraft();updateDeliverySummary();return;}
});

// Bind the header language control directly as well as through delegation. This makes the
// language control reliable even when another interactive element is layered over the page.
if(vegModeBtn){vegModeBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleVegMode();});}
if(nonVegModeBtn){nonVegModeBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleNonVegMode();});}
if(themeToggleBtn){themeToggleBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleTheme();});}
if(languageHeaderBtn){
  languageHeaderBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openLanguageModal();});
  languageHeaderBtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();openLanguageModal();}});
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLanguageModal();closePizzaCustomizer();closeWaterCustomizer();}});
document.addEventListener('click',async e=>{
  if(e.target?.matches?.('.language-modal-backdrop')){closeLanguageModal();return;}
  if(e.target?.closest?.('[data-pizza-modal-close]')){closePizzaCustomizer();return;}
  if(e.target?.closest?.('[data-water-modal-close]')){closeWaterCustomizer();return;}
  const btn=e.target.closest('button,a');if(!btn)return;
  if(btn.dataset.lang){
    captureCheckoutDraft();
    state.language=btn.dataset.lang;localStorage.setItem('tpp_language',state.language);closeLanguageModal();applyLanguageDir();historyCache=state.phone?await loadOrderHistory():[];renderView(true);return;
  }
  if(btn===vegModeBtn){return;}
  if(btn===nonVegModeBtn){return;}
  if(btn===themeToggleBtn){return;}
  if(btn===languageHeaderBtn){return;}
  if(btn.hasAttribute('data-menu-pack')){state.view='menu';state.menuSpecial=btn.dataset.menuPack;state.search='';state.filter='all';renderView();return;}
  if(btn.hasAttribute('data-pizza-modal-close')){closePizzaCustomizer();return;}
  if(btn.hasAttribute('data-pizza-modal-add')){e.preventDefault();addCustomizedPizza();return;}
  if(btn.hasAttribute('data-water-modal-add')){e.preventDefault();addWaterToCart();return;}
  if(btn.hasAttribute('data-water-customize')){if(!orderingOpen())return;openWaterCustomizer(btn.dataset.waterCustomize);return;}
  if(btn.hasAttribute('data-pizza-customize')){if(!orderingOpen())return;openPizzaCustomizer(btn.dataset.pizzaCustomize);return;}
  if(btn.hasAttribute('data-language-change')){openLanguageModal();return;}
  if(btn.hasAttribute('data-menu-all')){state.menuSpecial=null;state.category=null;state.search='';state.filter='all';renderView();return;}
  if(btn.hasAttribute('data-language-close')){closeLanguageModal();return;}
  if(btn.hasAttribute('data-home')){setView('home');return;}
  if(btn.hasAttribute('data-cart')){openCart();return;}
  if(btn.hasAttribute('data-close-cart')){closeCart();return;}
  if(btn===scrim){closeCart();return;}
  if(btn.hasAttribute('data-checkout')){e.preventDefault();e.stopPropagation();if(!state.cart.length){notifyToast('🛒 '+t('cartEmpty'));return;}closeCart();setView('checkout');return;}
  if(btn.hasAttribute('data-place-order')){e.preventDefault();e.stopPropagation();if(btn.disabled||btn.dataset.submitting==='1')return;btn.dataset.submitting='1';try{await placeOrder();}finally{if(document.querySelector('[data-place-order]')===btn)delete btn.dataset.submitting;}return;}
  if(btn.hasAttribute('data-get-gps')){e.preventDefault();e.stopPropagation();if(btn.disabled)return;getGPS();return;}
  if(btn.hasAttribute('data-view')){const v=btn.dataset.view;if(v==='menu'){state.category=null;state.menuSpecial=null;state.search='';state.filter='all';}setView(v);return;}
  if(btn.hasAttribute('data-category')){state.menuSpecial=null;state.category=btn.dataset.category;state.search='';state.filter='all';renderView();return;}
  if(btn.hasAttribute('data-filter')){state.filter=btn.dataset.filter;renderView(true);return;}
  if(btn.hasAttribute('data-clear-search')){state.search='';state.filter='all';renderView();return;}
  if(btn.hasAttribute('data-search-go')){state.view=state.search.trim()?'search':'menu';renderView();return;}
  if(btn.hasAttribute('data-fav')){toggleFavorite(btn.dataset.fav);return;}
  if(btn.hasAttribute('data-add')){if(!orderingOpen())return;const id=btn.dataset.add;addItem(id,false);noteViewed(id);refreshVisibleProductCard(id);openCartToast();return;}
  if(btn.hasAttribute('data-change')){const id=btn.dataset.change;changeCartItem(`${id}:plain`,Number(btn.dataset.delta));refreshVisibleProductCard(id);return;}
  if(btn.hasAttribute('data-add-pack')){if(!orderingOpen())return;const id=btn.dataset.addPack;addPack(id);refreshVisiblePackCard(id);openCartToast();return;}
  if(btn.hasAttribute('data-pack-change')){const id=btn.dataset.packChange;changeCartItem(`${id}:pack`,Number(btn.dataset.delta));refreshVisiblePackCard(id);return;}
  if(btn.hasAttribute('data-cart-change')){changeCartItem(btn.dataset.cartChange,Number(btn.dataset.delta));renderCartDrawer();return;}
  if(btn.hasAttribute('data-reorder')){await reorder(btn.dataset.reorder);return;}
  if(btn.hasAttribute('data-share-order')){shareOrder();return;}
  if(btn.hasAttribute('data-receipt')){downloadReceipt();return;}
  if(btn.hasAttribute('data-print-receipt')){printReceipt();return;}
  if(btn.hasAttribute('data-reload')){location.reload();return;}
});
if(scrim)scrim.addEventListener('click',closeCart);
if(cartDrawer)cartDrawer.setAttribute('aria-hidden','true');
function notifyToast(msg){let el=document.getElementById('tppToast');if(!el){el=document.createElement('div');el.id='tppToast';document.body.appendChild(el);}el.textContent=msg;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(window.__tppToastTimer);window.__tppToastTimer=setTimeout(()=>el.classList.remove('show'),2200);}
function openCartToast(){ /* intentionally no visual page/cart pulse on add; avoids customer-facing flashes */ }
window.addEventListener('online',()=>document.body.classList.remove('offline'));window.addEventListener('offline',()=>document.body.classList.add('offline'));

function ensureUxStyles(){if(document.getElementById('tpp-v6-ux-styles'))return;const st=document.createElement('style');st.id='tpp-v6-ux-styles';st.textContent=`.ordering-closed-banner{display:flex;gap:14px;align-items:flex-start;margin:12px 0 18px;padding:16px 18px;border:1px solid rgba(255,120,90,.35);background:linear-gradient(145deg,rgba(255,120,90,.12),rgba(255,179,71,.06));border-radius:20px}.ordering-closed-icon{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:rgba(255,120,90,.16);font-size:20px;flex:0 0 auto}.ordering-closed-banner strong{font-size:17px}.ordering-closed-banner p{margin:4px 0;color:var(--muted)}.ordering-closed-calls{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.ordering-closed-calls a{display:inline-block;padding:8px 11px;border-radius:999px;border:1px solid var(--line);background:var(--panel);text-decoration:none;font-weight:800;font-size:12px}.gps-btn,.place-btn{pointer-events:auto!important;touch-action:manipulation!important;user-select:none;-webkit-tap-highlight-color:transparent;position:relative;z-index:20}.eta-ring{overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box}.eta-ring strong#etaTime{font-size:27px;letter-spacing:.02em;line-height:1;white-space:nowrap;display:block;min-width:74px;text-align:center;font-variant-numeric:tabular-nums}@media(max-width:680px){.ordering-closed-banner{padding:13px}.ordering-closed-banner strong{font-size:15px}}`;st.textContent += `.combo-day-card{margin:16px 0;border:1px solid rgba(255,179,71,.5);border-radius:22px;padding:14px;background:linear-gradient(135deg,rgba(255,179,71,.11),rgba(255,111,44,.04));box-shadow:0 14px 40px rgba(255,140,40,.08)}.combo-day-badge{font-size:11px;font-weight:900;letter-spacing:.12em;color:#ffb34f;margin-bottom:10px}.combo-day-inner{display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center}.combo-day-media img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:16px}.combo-day-copy h2{margin:0 0 6px}.combo-day-copy p{margin:0 0 8px}.combo-day-price{display:flex;align-items:center;gap:8px;margin:10px 0}.combo-day-price del{opacity:.6}.combo-day-price strong{font-size:25px;color:#ffb34f}.combo-day-price span{font-size:11px;color:#86efac}.combo-day-added{padding:10px 12px;border-radius:12px;background:rgba(34,197,94,.12);color:#bbf7d0;font-weight:800}.marketing-combo-day{margin:8px auto 0;text-align:center;padding:8px 12px;border:1px solid rgba(255,179,71,.35);border-radius:999px;max-width:max-content;font-weight:800;color:#ffcf76}.driver-tracking-card{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:14px 0;padding:13px;border:1px solid rgba(255,179,71,.35);border-radius:16px;background:rgba(255,179,71,.07)}.driver-tracking-card div{display:grid;gap:3px}.driver-tracking-card strong{font-size:17px}.driver-tracking-card span{font-size:12px;opacity:.75}@media(max-width:680px){.combo-day-inner{grid-template-columns:1fr}.combo-day-media img{max-height:190px}.driver-tracking-card{align-items:flex-start;flex-direction:column}.driver-tracking-card .contact-btn{width:100%;text-align:center}}`;document.head.appendChild(st)}

async function init(){
  try{ensureUxStyles();applyTheme();
    const r=await fetch('/api/order/catalog',{cache:'no-store'});const data=await r.json();if(!data.success)throw new Error('Catalog unavailable');state.catalog=data.catalog;updateCartBadge();updateLanguageHeader();updateVegHeader();updateNonVegHeader();
    if(state.orderParam&&state.phone){try{const r0=await fetch(`/api/order/status/${encodeURIComponent(state.orderParam)}?phone=${encodeURIComponent(state.phone)}`,{cache:'no-store'});const d0=await r0.json();if(d0.success){state.lastOrder=d0.order;saveJson('tpp_last_order',state.lastOrder);state.view='tracking';trackingPage();}}catch{}}
    if(state.lastOrder?.order_id&&state.phone&&state.view!=='tracking'){try{const r2=await fetch(`/api/order/status/${encodeURIComponent(state.lastOrder.order_id)}?phone=${encodeURIComponent(state.phone)}`,{cache:'no-store'});const d=await r2.json();if(d.success)state.lastOrder=d.order;}catch{}}
    if(state.view!=='tracking'){
      state.view='home';
      historyCache=await loadOrderHistory();
      home();
    }
  }catch(err){render(`<div class="empty-state"><h2>Unable to load the menu</h2><p>${escapeHtml(err.message)}</p><button class="primary-btn" data-reload>${escapeHtml(t('retry'))}</button></div>`);}
}
setInterval(async()=>{try{if(!state.catalog||state.view==='language'||state.view==='tracking')return;const r=await fetch('/api/order/catalog',{cache:'no-store'});const d=await r.json();if(!d.success)return;const was=orderingOpen();const now=d.catalog?.ordering?.open!==false;state.catalog=d.catalog;if(was!==now)renderView(true);else{updateCartBadge();if(state.view==='checkout')updateDeliverySummary();}}catch{}},15000);
init();
