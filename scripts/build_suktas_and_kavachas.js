// scripts/build_suktas_and_kavachas.js
const fs = require('fs');
const path = require('path');

// 3. MAHA VEDIC SUKTAS (7)
const vedic_suktas = [
  {
    stotra_name: 'Purusha Suktam (पुरुषसूक्तम्)',
    deity_name: 'Vedic',
    language: 'Sanskrit',
    total_verses: 16,
    author: 'Rigveda (10.90) / Rishi Narayana',
    description: 'ऋग्वेद के १०वें मण्डल का ९०वां सूक्त। विराट् परम पुरुष परमात्मा के स्वरूप, ब्रह्माण्ड की उत्पत्ति और यज्ञीय सृष्टि का विशद वैदिक गान।',
    significance: 'समस्त वैदिक मन्त्रों में पुरुषसूक्त को शिरोमणि माना गया है। यह सर्वयज्ञमय, पापविनाशक और आत्मसाक्षात्कार प्रदायक है।',
    benefits: 'ब्रह्मज्ञान, कुण्डलिनी जागरण, वास्तुदोष निवारण, ऐश्वर्य और समस्त पापों का समूल नाश।',
    best_time: 'प्रातःकाल सूर्योदय के समय',
    recommended_day: 'रविवार, पूर्णिमा, दैनिक ब्रह्ममुहूर्त',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ सहस्रशीर्षा पुरुषः सहस्राक्षः सहस्रपात्। स भूमिं विश्वतो वृत्वात्यतिष्ठद्दशाङ्गुलम्॥',
        transliteration: 'Om Sahasrasheersha Purushah Sahasrakshah Sahasrapat. Sa Bhumim Vishvato Vritva Atyatishthad Dashangulam.',
        translation_hindi: 'उस विराट् पुरुष के सहस्रों (अनन्त) सिर हैं, सहस्रों आंखें हैं और सहस्रों पैर हैं। वह सम्पूर्ण ब्रह्माण्ड एवं पृथ्वी को सब ओर से व्याप्त करके दस अंगुल परिमाण ऊपर (इन्द्रियातीत सत्ता में) स्थित है।',
        translation_english: 'The Supreme Cosmic Person has thousands of heads, thousands of eyes, and thousands of feet. Pervading the cosmos on all sides, He extends beyond it by ten finger-breadths into transcendent infinity.'
      },
      {
        verse_no: 2,
        sanskrit: 'पुरुष एवेदं सर्वं यद्भूतं यच्च भव्यम्। उतामृतत्वस्येशानो यदन्नेनातिरोहति॥',
        transliteration: 'Purusha Evedam Sarvam Yad Bhutam Yachcha Bhavyam. Utamritatvasyeshano Yadannenatirohati.',
        translation_hindi: 'जो कुछ भूतकाल में था, और जो कुछ भविष्य में होगा, वह सब विराट् पुरुष ही है। वह अमृतत्व (अमरता) का भी स्वामी है, जो अन्न (भोग) द्वारा इस दृश्य जगत के रूप में वर्धमान होता है।',
        translation_english: 'The Cosmic Being alone is all this—what has been and what is yet to be. He is the Lord of immortality, growing transcendent through material sustenance.'
      },
      {
        verse_no: 3,
        sanskrit: 'एतावानस्य महिमातो ज्यायांश्च पूरुषः। पादोऽस्य विश्वा भूतानि त्रिपादस्यामृतं दिवि॥',
        transliteration: 'Etavanasya Mahimato Jyayanshcha Purushah. Padosya Vishva Bhutani Tripadasyamritam Divi.',
        translation_hindi: 'यह दृश्य जगत तो उसकी महिमा का एक अंश मात्र है, वह विराट् पुरुष इससे भी कहीं महान है। समस्त चर-अचर प्राणी उसका केवल एक पाद (चौथाई भाग) हैं, उसका तीन पाद अविनाशी अमृत स्वरूप दिव्य धाम में स्थित है।',
        translation_english: 'Such is His radiant glory, but the Cosmic Person is greater still. All beings comprise only one quarter of Him; three quarters of His immortal nature abide in the luminous heaven.'
      },
      {
        verse_no: 4,
        sanskrit: 'तस्माद्यज्ञात्सर्वहुतः सम्भृतं पृषदाज्यम्। पशून् तांश्चक्रे वायव्यानारण्यान् ग्राम्याश्च ये॥',
        transliteration: 'Tasmad Yajnatsarvahutah Sambhritam Prishadajyam. Pashun Tanshchakre Vayavyan Aranyan Gramyashcha Ye.',
        translation_hindi: 'उस सर्वहुत महायज्ञ से दधि-मिश्रित घृत प्रकट हुआ। उससे वायु सम्बन्धी पक्षी, वनवासी वन्य जीव और गांवों में रहने वाले पशु उत्पन्न हुए।',
        translation_english: 'From that all-encompassing cosmic sacrifice came the offerings of clarified butter. From it were fashioned the creatures of the air, the wild beasts of the forest, and the domestic animals of the village.'
      },
      {
        verse_no: 5,
        sanskrit: 'ब्राह्मणोऽस्य मुखमासीद् बाहू राजन्यः कृतः। ऊरू तदस्य यद्वैश्यः पद्भ्यां शूद्रो अजायत॥',
        transliteration: 'Brahmanosya Mukhamaseed Bahu Rajanyah Kritah. Uru Tadasya Yad Vaishyah Padbhyam Shudro Ajayata.',
        translation_hindi: 'उस विराट् पुरुष के मुख से ज्ञानी ब्राह्मण, बाहुओं से क्षत्रिय, जंघाओं से वैश्य और चरणों से सेवाभावी शूद्र उत्पन्न हुए (यह सामाजिक अंगों के समन्वय का आध्यात्मिक रूपक है)।',
        translation_english: 'The seekers of wisdom (Brahmins) were His mouth, the defenders of virtue (Kshatriyas) His arms, the sustainers of commerce (Vaishyas) His thighs, and from His lotus feet arose the foundational servers (Shudras).'
      },
      {
        verse_no: 6,
        sanskrit: 'चन्द्रमा मनसो जातश्चक्षोः सूर्यो अजायत। मुखादिन्द्रश्चाग्निश्च प्राणाद्वायुरजायत॥',
        transliteration: 'Chandrama Manaso Jatas Chakshoh Suryo Ajayata. Mukhad Indrashchagnishcha Pranad Vayur Ajayata.',
        translation_hindi: 'उस विराट् पुरुष के मन से चन्द्रमा उत्पन्न हुए, नेत्रों से सूर्य प्रकट हुए, मुख से देवराज इन्द्र और अग्निदेव प्रकट हुए और उनके प्राण से वायु का जन्म हुआ।',
        translation_english: 'The moon was born from His mind; from His eyes the radiant sun was produced. From His mouth came Indra and Agni, and from His vital breath the cosmic wind was generated.'
      },
      {
        verse_no: 7,
        sanskrit: 'नाभ्या आसीदन्तरिक्षं शीर्ष्णो द्यौः समवर्तत। पद्भ्यां भूमिर्दिशः श्रोत्रात्तथा लोकाँ अकल्पयन्॥',
        transliteration: 'Nabhya Aseed Antariksham Sheershno Dyouh Samavartata. Padbhyam Bhumirdishah Shrotrattatha Lokan Akalpayan.',
        translation_hindi: 'उनकी नाभि से अन्तरिक्ष, सिर से द्युलोक (स्वर्ग), चरणों से पृथ्वी और कानों से समस्त दिशाएं प्रकट हुईं। इस प्रकार ऋषियों ने समस्त लोकों की व्यवस्था की।',
        translation_english: 'From His navel arose the intermediate realm, from His head the heavens evolved, from His feet the earth, and from His ears the cardinal directions. Thus were all the worlds established.'
      },
      {
        verse_no: 8,
        sanskrit: 'वेदाहमेतं पुरुषं महान्तमादित्यवर्णं तमसः परस्तात्। तमेव विदित्वाति मृत्युमेति नान्यः पन्था विद्यतेऽयनाय॥',
        transliteration: 'Vedahametam Purusham Mahantam Adityavarnam Tamasah Parastat. Tameva Viditvati Mrityumeti Nanyah Pantha Vidyateyanaya.',
        translation_hindi: 'मैं उस सूर्य के समान तेजस्वी, अज्ञानान्धकार से परे, महान विराट् पुरुष परमात्मा को जानता हूँ। केवल उसे जानकर ही मनुष्य मृत्यु के बन्धन को पार कर सकता है, इसके अतिरिक्त मुक्ति का कोई दूसरा मार्ग नहीं है।',
        translation_english: 'I know this Supreme Mighty Person, effulgent like the sun, far beyond the darkness of ignorance. Knowing Him alone does one transcend mortality; there is no other path for spiritual liberation.'
      },
      {
        verse_no: 9,
        sanskrit: 'यज्ञेन यज्ञमयजन्त देवास्तानि धर्माणि प्रथमान्यासन्। ते ह नाकं महिमानः सचन्त यत्र पूर्वे साध्याः सन्ति देवाः॥ ॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'Yajnena Yajnamayajanta Devastani Dharmani Prathamanyasan. Te Ha Nakam Mahimanah Sachanta Yatra Purve Sadhyah Santi Devah. Om Shantih Shantih Shantih.',
        translation_hindi: 'देवताओं ने यज्ञ द्वारा यज्ञस्वरूप परमेश्वर का पूजन किया। वे धर्म के प्रथम सनातन नियम बने। वे पुण्यात्मा देव उस स्वर्गलोक को प्राप्त हुए जहाँ पूर्वकाल के सिद्ध देवता निवास करते हैं। ॐ त्रिविध तापों की शान्ति हो।',
        translation_english: 'With cosmic sacrifice the celestials revered the Supreme. These were the earliest primary ordinances of Dharma. These sublime souls attain the highest celestial realm where dwell the ancient enlightened beings. Om Peace, Peace, Peace.'
      }
    ]
  },
  {
    stotra_name: 'Sri Suktam (श्रीसूक्तम्)',
    deity_name: 'Lakshmi',
    language: 'Sanskrit',
    total_verses: 16,
    author: 'Rigveda Khila / Rishi Ananda-Chiklita',
    description: 'ऋग्वेद का सुप्रसिद्ध खिल सूक्त। भगवती महालक्ष्मी के स्वर्णमयी स्वरूप, ऐश्वर्य, यश और अलक्ष्मी नाश का दिव्य वैदिक आवाहन।',
    significance: 'दीपावली, शुक्रवार तथा नित्य सन्ध्या में श्रीसूक्त का पाठ दारिद्र्य का समूल नाश कर कुबेर तुल्य ऐश्वर्य और सद्बुद्धि प्रदान करता है।',
    benefits: 'अखण्ड लक्ष्मी कृपा, ऋणमुक्ति, व्यवसाय में वृद्धि, तेजस्विता और घर में श्री का वास।',
    best_time: 'प्रातःकाल अथवा सन्ध्याकाल (प्रदोष)',
    recommended_day: 'शुक्रवार, धनतेरस, दीपावली, पूर्णिमा',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ हिरण्यवर्णां हरिणीं सुवर्णरजतस्रजाम्। चन्द्रां हिरण्मयीं लक्ष्मीं जातवेदो म आवह॥',
        transliteration: 'Om Hiranyavarnam Harineem Suvarnarajatasrajam. Chandram Hiranmayeem Lakshmeem Jatavedo Ma Aavaha.',
        translation_hindi: 'हे अग्निदेव (जातवेदा)! सोने के समान कान्ति वाली, हिरणी के समान चपल, सुवर्ण और चांदी के हार धारण करने वाली, चन्द्रमा के समान शीतल और स्वर्णमयी भगवती महालक्ष्मी को मेरे लिए यहाँ आवाह्ति कीजिए।',
        translation_english: 'O Agni, all-knowing fire! Invoke for me Goddess Lakshmi, of golden hue, deer-like graceful, adorned with garlands of gold and silver, luminous as the moon, resplendent with divine abundance.'
      },
      {
        verse_no: 2,
        sanskrit: 'तां म आवह जातवेदो लक्ष्मीमनपगामिनीम्। यस्यां हिरण्यं विन्देयं गामश्वं पुरुषानहम्॥',
        transliteration: 'Tam Ma Aavaha Jatavedo Lakshmeem Anapagamineem. Yasyam Hiranyam Vindeyam Gamashvam Purushan Aham.',
        translation_hindi: 'हे अग्निदेव! उन कभी साथ न छोड़ने वाली (स्थिर) लक्ष्मी का मेरे लिए आवाहन कीजिए, जिनके आगमन से मैं सुवर्ण, गौएं, अश्व और उत्तम बन्धु-बान्धवों को प्राप्त करूँ।',
        translation_english: 'Invoke for me, O Agni, that Lakshmi who never departs, through whom I may obtain enduring wealth, cattle, horses, family and companions.'
      },
      {
        verse_no: 3,
        sanskrit: 'अश्वपूर्वां रथमध्यां हस्तिनादप्रमोदिनीम्। श्रियं देवीमुपह्वये श्रीर्मा देवी जुषताम्॥',
        transliteration: 'Ashvapoorvam Rathamadhyam Hastinadapramodineem. Shriyam Deveem Upahvaye Shreerma Devee Jushatam.',
        translation_hindi: 'जिनके आगे-आगे अश्व दौड़ते हैं, मध्य में दिव्य रथ है, जो हाथियों के जयघोष (चिंघाड़) से प्रसन्न होती हैं, उन भगवती श्रीलक्ष्मी का मैं आवाहन करता हूँ; वे परमेश्वरी मेरे घर में प्रसन्नतापूर्वक निवास करें।',
        translation_english: 'Preceded by noble steeds, seated in the center of the chariot, delighted by the royal trumpeting of elephants—I invoke that radiant goddess Sri. May that divine Goddess be gracious unto me.'
      },
      {
        verse_no: 4,
        sanskrit: 'कांसोस्मि तां हिरण्यप्राकारामार्द्रां ज्वलन्तीं तृप्तां तर्पयन्तीम्। पद्मे स्थितां पद्मवर्णां तामिहोपह्वये श्रियम्॥',
        transliteration: 'Kamsosmitaam Hiranyaprakaram Aardram Jvalanteem Triptam Tarpayanteem. Padme Sthitam Padmavarnam Tam Ihopahvaye Shriyam.',
        translation_hindi: 'जो मन्द मुस्कान वाली हैं, स्वर्ण की चहारदीवारी के मध्य स्थित हैं, दया से आर्द्र हैं, तेजोमयी हैं, स्वयं तृप्त हैं और भक्तों को तृप्त करने वाली हैं, कमल पर विराजमान और कमल जैसे वर्ण वाली उन श्रीलक्ष्मी का मैं यहाँ आवाहन करता हूँ।',
        translation_english: 'Smiling gently, enveloped in golden ramparts, moist with divine compassion, brilliantly shining, ever-content and fulfilling all desires, seated upon the lotus, lotus-hued—her, Goddess Sri, do I invoke here.'
      },
      {
        verse_no: 5,
        sanskrit: 'चन्द्रां प्रभासां यशसा ज्वलन्तीं श्रियं लोके देवजुष्टामुदाराम्। तां पद्मिनीमीं शरणमहं प्रपद्येऽलक्ष्मीर्मे नश्यतां त्वां वृणे॥',
        transliteration: 'Chandram Prabhasam Yashasa Jvalanteem Shriyam Loke Devajushtam Udaram. Tam Padminimeem Sharanam Aham Prapadye Alakshmeerme Nashyatam Tvam Vrine.',
        translation_hindi: 'चन्द्रमा के समान आह्लादकारिणी, परम प्रकाशमान, यश से देदीप्यमान, तीनों लोकों में देवताओं द्वारा पूजित, परम उदार, कमल धारिणी उन श्रीलक्ष्मी की मैं शरण ग्रहण करता हूँ। हे माँ! मेरी अलक्ष्मी (दरिद्रता) का नाश हो, मैं आपका वरण करता हूँ।',
        translation_english: 'Luminous like the moon, shining with celestial renown, worshipped by the gods, supremely generous—in that lotus-bearing Goddess do I seek refuge. May my misfortune and poverty perish; I choose You alone!'
      },
      {
        verse_no: 6,
        sanskrit: 'आदित्यवर्णे तपसोऽधिजातो वनस्पतिस्तव वृक्षोऽथ बिल्वः। तस्य फलानि तपसानुदन्तु मायान्तरायाश्च बाह्या अलक्ष्मीः॥',
        transliteration: 'Adityavarne Tapasodhijato Vanaspatistava Vrikshotha Bilvah. Tasya Phalani Tapasanudantu Mayantarayashcha Bahya Alakshmeeh.',
        translation_hindi: 'हे सूर्य के समान तेजोमयी माँ! आपकी तपस्या से वनस्पतियों में श्रेष्ठ पवित्र बिल्व वृक्ष उत्पन्न हुआ। उस वृक्ष के फल हमारी अन्तःकरण की अविद्या-माया और बाहर की दरिद्रता को भस्म कर दें।',
        translation_english: 'O Sun-radiant Mother! Born of your penance is the king of trees, the sacred Bilva. May its fruits and blessings dispel through spiritual austerity the internal illusions of the mind and external afflictions of penury.'
      },
      {
        verse_no: 7,
        sanskrit: 'उपैतु मां देवसखः कीर्तिश्च मणिना सह। प्रादुर्भूतोऽस्मि राष्ट्रेऽस्मिन् कीर्तिमृद्धिं ददातु मे॥',
        transliteration: 'Upaitu Mam Devasakhah Keertishcha Manina Saha. Pradurbhutosmi Rashtresmin Keertim Riddhim Dadatu Me.',
        translation_hindi: 'देवों के सखा कुबेर और यश मणि (चिन्तामणि) के साथ मेरे पास पधारें। मैं इस राष्ट्र में उत्पन्न हुआ हूँ, मुझे यश, ऐश्वर्य और ऋद्धि-सिद्धि प्रदान करें।',
        translation_english: 'May Kubera, friend of the gods, along with Fame and the wish-yielding jewel, approach me. Born in this sacred land, grant me unblemished renown and boundless spiritual and material prosperity.'
      },
      {
        verse_no: 8,
        sanskrit: 'मनसः काममाकूतिं वाचः सत्यमशीमहि। पशूनां रूपमन्नस्य मयि श्रीः श्रयतां यशः॥ ॐ महालक्ष्म्यै च विद्महे विष्णुपत्नी च धीमहि। तन्नो लक्ष्मीः प्रचोदयात्॥',
        transliteration: 'Manasah Kamam Akutim Vachah Satyam Asheemahi. Pashunam Roopam Annasya Mayi Shreeh Shrayatam Yashah. Om Mahalakshmyai Cha Vidmahe Vishnupatnee Cha Dheemahi. Tanno Lakshmih Prachodayat.',
        translation_hindi: 'हमारे मन की शुभ कामनाएं, सत्य संकल्प और सत्य वाणी हमें प्राप्त हों। गौ आदि पशुओं का धन, अन्न की प्रचुरता, यश और श्री मेरे कुल में सदा निवास करें। हम महालक्ष्मी को जानते हैं, विष्णुपत्नी का ध्यान करते हैं; वे माँ लक्ष्मी हमारी बुद्धि को सन्मार्ग में प्रेरित करें।',
        translation_english: 'May we attain our righteous desires, purity of intention, and truthful speech. May abundant cattle, food, glory and auspiciousness rest with me. We meditate on Mahalakshmi, consort of Vishnu; may that Divine Mother inspire our intellect.'
      }
    ]
  },
  {
    stotra_name: 'Sri Rudram - Namakam & Chamakam (श्रीरुद्रम्)',
    deity_name: 'Shiva',
    language: 'Sanskrit',
    total_verses: 11,
    author: 'Krishna Yajurveda Taittiriya Samhita',
    description: 'कृष्ण यजुर्वेदीय तैत्तिरीय संहिता का परम तेजस्वी मन्त्र संग्रह। भगवान रुद्र के सौम्य एवं रौद्र रूपों का स्तवन और अभीष्ट कामनाओं (चमकम्) की पूर्ति।',
    significance: 'महामृत्युंजय तुल्य फलदायी। समस्त पापों का भस्म होना, कालसर्प एवं ग्रह बाधाओं की शान्ति, रोगमुक्ति और शिवसायुज्य।',
    benefits: 'अकाल मृत्यु से अभय, असीम आत्मिक शक्ति, शारीरिक स्वास्थ्य, सुख-समृद्धि और ज्ञान वैराग्य।',
    best_time: 'प्रातःकाल अथवा प्रदोष काल',
    recommended_day: 'सोमवार, प्रदोष, महाशिवरात्रि',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ नमो भगवते रुद्राय॥ नमस्ते रुद्र मन्यव उतो त इषवे नमः। नमस्ते अस्तु धन्वने बाहुभ्यामुत ते नमः॥',
        transliteration: 'Om Namo Bhagavate Rudraya. Namaste Rudra Manyava Uto Ta Ishave Namah. Namaste Astu Dhanvane Bahubhyamuta Te Namah.',
        translation_hindi: 'हे रुद्र! आपके क्रोध को नमस्कार है। आपके बाण को नमस्कार है। आपके धनुष को नमस्कार है और आपकी दोनों भुजाओं को नमस्कार है।',
        translation_english: 'Salutations to the Supreme Lord Rudra! O Rudra, salutations to Your righteous wrath, and salutations to Your arrow! Salutations to Your sacred bow, and salutations to Your mighty arms!'
      },
      {
        verse_no: 2,
        sanskrit: 'या ते रुद्र शिवा तनूरघोराऽपापकाशिनी। तया नस्तनुवा शन्ततया गिरिशन्ताभिचाकशीहि॥',
        transliteration: 'Ya Te Rudra Shiva Tanoor Aghorapapakashinee. Taya Nastanuva Shantataya Girishantabhichakasheehi.',
        translation_hindi: 'हे रुद्र! आपका जो कल्याणकारी (शिवा), सौम्य (अघोरा) और पापों का नाश करने वाला स्वरूप है, उस परम शान्तिप्रद रूप से, हे कैलासपति! हमारी ओर कृपापूर्वक दृष्टिपात कीजिए।',
        translation_english: 'O Rudra, that form of Yours which is auspicious (Shiva), non-terrifying (Aghora), and revealer of pure holiness—with that most tranquil form, O dweller of the sacred mountain, look graciously upon us!'
      },
      {
        verse_no: 3,
        sanskrit: 'यामिषुं गिरिशन्त हस्ते बिभर्ष्यस्तवे। शिवां गिरित्र तां कुरु मा हिंसीः पुरुषं जगत्॥',
        transliteration: 'Yam Ishum Girishanta Haste Bibharshyastave. Shivam Giritra Tam Kuru Ma Himseeh Purusham Jagat.',
        translation_hindi: 'हे कैलासवासी प्रभु! दुष्टों पर प्रहार के लिए आपने जो बाण हाथ में धारण कर रखा है, हे पर्वत-रक्षक! उस बाण को हमारे लिए कल्याणकारी बना दीजिए, हमारे परिवार और संसार को कोई पीड़ा न पहुँचाइए।',
        translation_english: 'O Lord of mountains! That arrow which You hold in Your hand ready to discharge, O guardian of hills, make it peaceful and benign for us; do not harm our people or the world.'
      },
      {
        verse_no: 4,
        sanskrit: 'शिवेन वचसा त्वा गिरिशाच्छावदामसि। यथा नः सर्वमिज्जगदयक्ष्मं सुमना असत्॥',
        transliteration: 'Shivena Vachasa Tva Girishachhavadamasi. Yatha Nah Sarvamij Jagad Ayakshmam Sumana Asat.',
        translation_hindi: 'हे पर्वत पर निवास करने वाले शिव! हम कल्याणकारी वचनों से आपकी स्तुति करते हैं, जिससे हमारा सम्पूर्ण संसार रोगरहित, स्वस्थ और प्रसन्नचित्त हो जाए।',
        translation_english: 'With auspicious prayers do we address You, O dweller of the mountain peaks, so that all beings in our world may be free from illness and endowed with joyful minds.'
      },
      {
        verse_no: 5,
        sanskrit: 'नमो भवाय च रुद्राय च नमः शर्वाय च पशुपतये च। नमो नीलग्रीवाय च शितिकण्ठाय च॥',
        transliteration: 'Namo Bhavaya Cha Rudraya Cha Namah Sharvaya Cha Pashupataye Cha. Namo Neelagreevaya Cha Shitikanthaya Cha.',
        translation_hindi: 'सृष्टि के उद्भव स्वरूप भव और दुखहर्ता रुद्र को नमस्कार! पापसंहारक शर्व और समस्त जीवों के स्वामी पशुपति को नमस्कार! विषपान से नीले कंठ वाले नीलग्रीव और श्वेत प्रभा वाले शितिकंठ को नमस्कार!',
        translation_english: 'Salutations to the Source of existence (Bhava) and the dispeller of sorrows (Rudra)! Salutations to the destroyer of ignorance (Sharva) and the Lord of all souls (Pashupati)! Salutations to the blue-necked one (Nilagreeva) and the fair-throated one!'
      },
      {
        verse_no: 6,
        sanskrit: 'नमः कपर्दिने च व्युप्तकेशाय च नमः सहस्राक्षाय च शतधन्वने च। नमो गिरिशयाय च शिपिविष्टाय च॥ ॐ शं च मे मयश्च मे प्रियं च मेऽनुकामश्च मे कामश्च मे सौमनसश्च मे... ॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'Namah Kapardine Cha Vyuptakeshaya Cha Namah Sahasrakshaya Cha Shatadhanvane Cha. Namo Girishayaya Cha Shipivishtaya Cha. Om Sham Cha Me Mayashcha Me Priyam Cha Me Anukamashcha Me Kamashcha Me Saumanasashcha Me... Om Shantih Shantih Shantih.',
        translation_hindi: 'जटाधारी और मुण्डित दोनों रूपों को नमस्कार! सहस्र नेत्रों और सैकड़ों धनुष धारण करने वाले को नमस्कार! पर्वत पर शयन करने वाले और किरणों में व्याप्त शिव को नमस्कार! (चमकम्): हमें इस लोक का सुख, परलोक का कल्याण, प्रिय वस्तुएं, अनुकूल कामनाएं और निर्मल मन प्राप्त हो। ॐ शान्तिः शान्तिः शान्तिः।',
        translation_english: 'Salutations to Him with matted locks, and to Him with shaved head! Salutations to the thousand-eyed one, and to Him who bears a hundred bows! Salutations to Him resting upon the mountains and pervading the rays of light! (Chamakam): May peace, bliss, beloved aspirations, and harmony be granted unto us. Om Peace, Peace, Peace.'
      }
    ]
  },
  {
    stotra_name: 'Narayana Suktam (नारायणसूक्तम्)',
    deity_name: 'Vishnu',
    language: 'Sanskrit',
    total_verses: 12,
    author: 'Taittiriya Aranyaka (Mahanarayana Upanishad)',
    description: 'तैत्तिरीय आरण्यक के महानारायण उपनिषद् का मर्मस्पर्शी सूक्त। हृदय-कमल में ज्योतिर्मय परम नारायण के ध्यान और अन्तश्चेतना का वेदमंत्र।',
    significance: 'ध्यान, प्राणायाम तथा आत्मसाक्षात्कार हेतु सर्वश्रेष्ठ वैदिक पाठ। यह साधक को देहबुद्धि से ऊपर उठाकर ब्रह्मसाक्षात्कार कराता है।',
    benefits: 'गहरा ध्यान, चित्त की एकाग्रता, अज्ञान-नाश, भय-मुक्ति और मोक्ष की अनुभूति।',
    best_time: 'ब्रह्ममुहूर्त अथवा संध्या ध्यान',
    recommended_day: 'गुरुवार, एकादशी, पूर्णिमा',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ सहस्रशीर्षं देवं विश्वाक्षं विश्वशम्भुवम्। विश्वं नारायणं देवमक्षरं परमं पदम्॥',
        transliteration: 'Om Sahasrasheersham Devam Vishvaksham Vishvashambhuvam. Vishvam Narayanam Devam Aksharam Paramam Padam.',
        translation_hindi: 'सहस्रों सिरों वाले, सम्पूर्ण विश्व पर दृष्टि रखने वाले, जगत को आनन्द देने वाले, विश्वरूप, परम प्रकाशमान, अविनाशी और परम पद स्वरूप भगवान श्रीनारायण को हम नमस्कार करते हैं।',
        translation_english: 'We revere the Supreme Being Narayana, who has thousands of heads, whose eyes behold all creation, the source of universal bliss, who is the universe itself, imperishable, and the supreme destination.'
      },
      {
        verse_no: 2,
        sanskrit: 'विश्वतः परमान्नित्यं विश्वं नारायणं हरिम्। विश्वमेवेदं पुरुषस्तद्विश्वमुपजीवति॥',
        transliteration: 'Vishvatah Paraman Nityam Vishvam Narayanam Harim. Vishvam Evedam Purushas Tad Vishvam Upajeevati.',
        translation_hindi: 'जो सम्पूर्ण विश्व से परे हैं, नित्य हैं, विश्वरूप नारायण हैं, समस्त दुखों को हरने वाले हरि हैं। यह सम्पूर्ण जगत विराट् पुरुष परमात्मा ही है और सारा जगत उन्हीं के सहारे जीवित है।',
        translation_english: 'He is transcendent beyond the universe, eternal, the cosmic Narayana, Hari the remover of sorrows. This universe is indeed the Supreme Being Himself, and the entire cosmos lives sustained by Him.'
      },
      {
        verse_no: 3,
        sanskrit: 'पद्मकोशप्रतीकाशं हृदयं चाप्यधोमुखम्। अधो निष्ट्या वितस्त्यान्ते नाभ्यामुपरि तिष्ठति॥',
        transliteration: 'Padmakoshapratikasham Hridayam Chapyadhomukham. Adho Nishtya Vitastyante Nabhyamupari Tishthati.',
        translation_hindi: 'कमल की कली के समान नीचे की ओर मुख वाला हृदय कंठ के नीचे और नाभि से एक बित्ता (१२ अंगुल) ऊपर स्थित है।',
        translation_english: 'Resembling an inverted lotus bud, the heart cavity hangs downward, located below the throat and a span above the navel.'
      },
      {
        verse_no: 4,
        sanskrit: 'तस्य मध्ये महानग्निर्विश्वार्चिर्विश्वतोमुखः। सोऽग्रभुग्विभजन्तिष्ठन्नाहारमजरः कविः॥',
        transliteration: 'Tasya Madhye Mahan Agnir Vishvarchir Vishvatomukhah. So Agrabhug Vibhajan Tishthan Aaharam Ajarah Kavih.',
        translation_hindi: 'उस हृदय के मध्य में समस्त दिशाओं में ज्वालाएं फैलाने वाली महान वैश्वानर अग्नि स्थित है। वह भोजन को पचाने वाली, अजर और सर्वज्ञ ज्ञानस्वरूप है।',
        translation_english: 'In the center of that heart burns a great fire, radiating flames in all directions. It digests sustenance, dividing it through the body, ageless and all-seeing.'
      },
      {
        verse_no: 5,
        sanskrit: 'तस्याः शिखाया मध्ये परमात्मा व्यवस्थितः। स ब्रह्मा स शिवः स हरिः सेन्द्रः सोऽक्षरः परमः स्वराट्॥ ॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'Tasyah Shikhaya Madhye Paramatma Vyavasthitah. Sa Brahma Sa Shivah Sa Harih Sendrah Soksharah Paramah Svarat. Om Shantih Shantih Shantih.',
        translation_hindi: 'उस अग्नि-शिखा के मध्य में साक्षात् परमात्मा विराजमान हैं। वही ब्रह्मा हैं, वही शिव हैं, वही विष्णु (हरि) हैं, वही इन्द्र हैं, वही अविनाशी अक्षर ब्रह्म और परम स्वराट् हैं। ॐ शान्तिः शान्तिः शान्तिः।',
        translation_english: 'In the center of that luminous flame is situated the Supreme Soul. He is Brahma, He is Shiva, He is Hari, He is Indra; He is the Imperishable, Transcendent, Self-luminous Lord. Om Peace, Peace, Peace.'
      }
    ]
  },
  {
    stotra_name: 'Medha Suktam (मेधासूक्तम्)',
    deity_name: 'Saraswati',
    language: 'Sanskrit',
    total_verses: 6,
    author: 'Rigveda / Taittiriya Aranyaka',
    description: 'तीक्ष्ण बुद्धि, धारणा शक्ति, स्मृति, विद्या और सत्य-ज्ञान की प्राप्ति हेतु ऋषियों द्वारा उपदिष्ट पावन मेधा सूक्त।',
    significance: 'विद्यार्थियों, विद्वानों तथा ध्यान-साधकों के लिए अमोघ मन्त्र। यह बुद्धि को निर्मल और ग्रहणशील बनाता है।',
    benefits: 'स्मरण शक्ति में वृद्धि, बौद्धिक एकाग्रता, वाणी की सिद्धि और परीक्षा में सफलता।',
    best_time: 'प्रातःकाल अध्ययन से पूर्व',
    recommended_day: 'बुधवार, गुरुवार, वसंत पंचमी',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ मेधां मे वरुणो ददातु मेधामग्निः प्रजापतिः। मेधामिन्द्रश्च वायुश्च मेधां धाता ददातु मे स्वाहा॥',
        transliteration: 'Om Medham Me Varuno Dadatu Medham Agnih Prajapatih. Medham Indrashcha Vayushcha Medham Dhata Dadatu Me Svaha.',
        translation_hindi: 'वरुण देव मुझे श्रेष्ठ मेधा (धारणावती बुद्धि) प्रदान करें, अग्निदेव और प्रजापति मुझे मेधा दें। इन्द्र और वायुदेव मुझे मेधा प्रदान करें और विधाता धाता मुझे मेधा प्रदान करें, यह आहुति समर्पित है।',
        translation_english: 'May Varuna grant me sharp intellect; may Agni and Prajapati grant me intellect. May Indra and Vayu bestow intellect upon me, and may the Creator Dhata grant me deep discernment. Svaha!'
      },
      {
        verse_no: 2,
        sanskrit: 'यां मेधां देवगणाः पितरश्चोपासते। तया मामद्य मेधयाऽग्ने मेधाविनं कुरु स्वाहा॥',
        transliteration: 'Yam Medham Devaganah Pitarashchopasate. Taya Mamadya Medhaya Agne Medhavinam Kuru Svaha.',
        translation_hindi: 'जिस मेधा की देवगण और पितृगण सदा उपासना करते हैं, हे अग्निदेव! आज उसी दिव्य मेधा द्वारा मुझे परम बुद्धिमान और मेधावी बना दीजिए, स्वाहा।',
        translation_english: 'That divine intellect which celestials and venerable ancestors revere, with that very intellect, O Agni, make me endowed with boundless wisdom today. Svaha!'
      },
      {
        verse_no: 3,
        sanskrit: 'मेधां सायं मेधां प्रातर्मेधां मध्यन्दिनं परि। मेधां सूर्यस्य रश्मिभिर्मनसाऽऽवेशयामहे॥ ॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'Medham Sayam Medham Pratar Medham Madhyandinam Pari. Medham Suryasya Rashmibhir Manasaveshayamaye. Om Shantih Shantih Shantih.',
        translation_hindi: 'प्रातःकाल, मध्याह्न और सायंकाल में हम मेधा का आवाहन करते हैं। सूर्य की प्रखर किरणों के साथ उस बुद्धि को हम अपने मन में प्रतिष्ठित करते हैं। ॐ शान्तिः शान्तिः शान्तिः।',
        translation_english: 'At dawn, at noon, and in the evening, we invoke wisdom. Through the luminous rays of the sun, we infuse our minds with divine intelligence. Om Peace, Peace, Peace.'
      }
    ]
  },
  {
    stotra_name: 'Durga Suktam (दुर्गासूक्तम्)',
    deity_name: 'Devi',
    language: 'Sanskrit',
    total_verses: 7,
    author: 'Mahanarayana Upanishad / Rigveda',
    description: 'महानारायण उपनिषद् का परम तेजस्वी अग्नि-दुर्गा सूक्त। जीवन के समस्त दुर्गम संकटों से पार लगाने वाली पराशक्ति का वैदिक मन्त्र।',
    significance: 'शत्रु भय, विपत्ति, असाध्य रोग तथा घोर बाधाओं के निवारण हेतु नौका तुल्य उद्धारक सूक्त।',
    benefits: 'दुर्गम संकटों से रक्षा, आत्मबल, भयमुक्ति, विजय और पाप-तापों का शमन।',
    best_time: 'प्रातः अथवा सन्ध्याकाल',
    recommended_day: 'मंगलवार, शुक्रवार, अष्टमी, नवमी',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ जातवेदसे सुनवाम सोममरातीयतो निदहाति वेदः। स नः पर्षदति दुर्गाणि विश्वा नावेव सिन्धुं दुरितात्यग्निः॥',
        transliteration: 'Om Jatavedase Sunavama Somam Arateeyato Nidahati Vedah. Sa Nah Parshadati Durgani Vishva Naveva Sindhum Duritatyagnih.',
        translation_hindi: 'हम सर्वज्ञ अग्निदेव (जातवेदा) के निमित्त सोमरस प्रस्तुत करते हैं; वे हमारे शत्रुओं के अनिष्टकारी ज्ञान को भस्म कर दें। जिस प्रकार नाव द्वारा समुद्र पार किया जाता है, उसी प्रकार वह अग्निदेव हमें समस्त दुर्गम संकटों और पापों से पार लगा दें।',
        translation_english: 'We press Soma for the all-knowing Fire; may He consume the malice of those who wish us harm. Just as a boat carries one across the ocean, may Agni deliver us safely across all perilous difficulties and sins.'
      },
      {
        verse_no: 2,
        sanskrit: 'तामग्निवर्णां तपसा ज्वलन्तीं वैरोचनीं कर्मफलेषु जुष्टाम्। दुर्गां देवीं शरणमहं प्रपद्ये सुतरसि तरसे नमः॥',
        transliteration: 'Tam Agnivarnam Tapasa Jvalanteem Vairochaneem Karmaphaleshu Jushtam. Durgam Deveem Sharanam Aham Prapadye Sutarasi Tarase Namah.',
        translation_hindi: 'अग्नि के समान देदीप्यमान वर्ण वाली, तपोमयी, सूर्यपुत्री जैसी प्रकाशमयी, कर्मफलों को प्रदान करने वाली भगवती दुर्गा देवी की मैं शरण ग्रहण करता हूँ। हे कष्टों से भली-भांति पार लगाने वाली देवी! आपको नमस्कार है।',
        translation_english: 'She who is radiant as blazing fire, shining with spiritual penance, luminous, sought after in the fruits of righteous actions—in that Goddess Durga do I take refuge. Salutations to You who ferry us across all trials!'
      },
      {
        verse_no: 3,
        sanskrit: 'अग्ने त्वं पारया नव्यो अस्मान्त्स्वस्तिभिरति दुर्गाणि विश्वा। पूश्च पृथ्वी बहुला न उर्वी भवा तोकाय तनयाय शं योः॥ ॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'Agne Tvam Paraya Navyo Asman Svastibhirati Durgani Vishva. Pooshcha Prithvi Bahula Na Urvee Bhava Tokaya Tanayaya Sham Yoh. Om Shantih Shantih Shantih.',
        translation_hindi: 'हे अग्निदेव! आप नवीन स्तुतियों से प्रसन्न होकर समस्त कल्याणकारी साधनों द्वारा हमें सब संकटों से पार कीजिए। हमारे नगर, पृथ्वी और संतान-संतति के लिए सुख और कल्याण की वृद्धि कीजिए। ॐ शान्तिः शान्तिः शान्तिः।',
        translation_english: 'O Agni! Praised anew, carry us safely with Your blessings across all hardships. May our lands, towns, and descendants be blessed with peace and auspicious prosperity. Om Peace, Peace, Peace.'
      }
    ]
  },
  {
    stotra_name: 'Ayushya Suktam (आयुष्यसूक्तम्)',
    deity_name: 'Vedic',
    language: 'Sanskrit',
    total_verses: 6,
    author: 'Rigveda / Taittiriya Aranyaka',
    description: 'दीर्घायु, आरोग्य, ओज, तेज और जीवन-रक्षा हेतु परम कल्याणकारी वैदिक आयुष्य सूक्त।',
    significance: 'जन्मदिन, रोग-निवारण तथा नित्य स्वास्थ्य रक्षा हेतु इस वैदिक सूक्त का पाठ अकाल मृत्यु से रक्षा करता है।',
    benefits: 'दीर्घायुष्य, शारीरिक बल, प्राण शक्ति की वृद्धि, रोग-मुक्ति और चिरयौवन।',
    best_time: 'प्रातःकाल स्नान के पश्चात',
    recommended_day: 'रविवार, जन्मदिन, दैनिक',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ आयुष्यं वर्चस्यं रायस्पोषमौद्भिदम्। इदं हिरण्यं वर्चस्वज्जैत्रायाविशतान्मम॥',
        transliteration: 'Om Ayushyam Varchasyam Rayasposham Audbhidam. Idam Hiranyam Varchasvaj Jaitrayavishatan Mama.',
        translation_hindi: 'यह मन्त्र आयुष्य (दीर्घायु), वर्चस्व (तेज), धन-सम्पदा की पुष्टि और सर्वांगीण उन्नति प्रदान करने वाला है। यह सुवर्णवत् तेजस्वी मन्त्र मुझे विजय दिलाने के लिए मुझमें प्रविष्ट हो।',
        translation_english: 'This hymn bestows longevity, vitality, nourishing wealth, and continuous ascent. May this golden effulgence enter into me for perpetual triumph.'
      },
      {
        verse_no: 2,
        sanskrit: 'शतमानं भवति शतायुः पुरुषः शतेन्द्रियः। आयुष्येवेन्द्रिये प्रतितिष्ठति॥ ॐ शान्तिः शान्तिः शान्तिः॥',
        transliteration: 'Shatamanam Bhavati Shatayuh Purushah Shatendriyah. Ayushyevendriye Pratitishthati. Om Shantih Shantih Shantih.',
        translation_hindi: 'मनुष्य सौ वर्ष की पूर्ण आयु वाला हो, सौ सामर्थ्यों और सौ इन्द्रियों की शक्ति से युक्त हो। वह जीवनपर्यन्त अपनी इन्द्रिय-शक्ति और तेज में प्रतिष्ठित रहे। ॐ शान्तिः शान्तिः शान्तिः।',
        translation_english: 'May a person live for a full hundred years, endowed with a hundred-fold vigor and keen sensory faculties. Established firmly in lifespan and vitality. Om Peace, Peace, Peace.'
      }
    ]
  }
];

console.log('Vedic Suktas prepared:', vedic_suktas.length);
fs.writeFileSync(path.join(__dirname, 'temp_suktas.json'), JSON.stringify(vedic_suktas, null, 2), 'utf8');
console.log('Saved temp_suktas.json');
