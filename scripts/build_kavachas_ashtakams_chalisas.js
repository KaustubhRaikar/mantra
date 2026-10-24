// scripts/build_kavachas_ashtakams_chalisas.js
const fs = require('fs');
const path = require('path');

// 4. PROTECTIVE KAVACHAS (6)
const kavachas = [
  {
    stotra_name: 'Shri Narayana Kavacham (श्रीमन्नारायणकवचम्)',
    deity_name: 'Vishnu',
    language: 'Sanskrit',
    total_verses: 24,
    author: 'Srimad Bhagavatam (6.8) / Rishi Vishvarupa',
    description: 'श्रीमद्भागवत महापुराण के षष्ठ स्कन्ध के ८वें अध्याय का परम शक्तिशाली वैष्णव कवच। ऋषि विश्वरूप द्वारा इन्द्र को उपदेशित।',
    significance: 'सर्वभयनिवारक, आधि-व्याधि-शत्रु नाशक, अमोघ सुरक्षा कवच। इसके धारण और पाठ से साधक अभेद्य हो जाता है।',
    benefits: 'शारीरिक व मानसिक सुरक्षा, नकारात्मक ऊर्जा का समूल नाश, विजय और विष्णु लोक की प्राप्ति।',
    best_time: 'प्रातःकाल',
    recommended_day: 'गुरुवार, एकादशी, नित्य',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ हरिरविदध्यान्मम सर्वरक्षां न्यस्ताङ्घ्रिपद्मः पतगेन्द्रपृष्ठे। दरारिचर्मासिगदेषुचापपाशान् दधानोऽष्टगुणोऽष्टबाहुः॥',
        transliteration: 'Om Harir Vidadhyan Mama Sarvaraksham Nyastanghripadmah Patagendraprishthe. Dararicharmasigadeshuchapapashan Dadhano Ashtaguno Ashtabahuh.',
        translation_hindi: 'गरुड़ की पीठ पर चरण-कमल रखे हुए, शंख, चक्र, ढाल, तलवार, गदा, बाण, धनुष और पाश धारण किए हुए अष्टसिद्धियों से युक्त आठ भुजाओं वाले भगवान श्रीहरि सब ओर से मेरी रक्षा करें।',
        translation_english: 'May Lord Hari, resting His lotus feet upon the back of Garuda, endowed with eight mystic powers and eight arms wielding the conch, discus, shield, sword, mace, arrow, bow and noose, protect me from all directions.'
      },
      {
        verse_no: 2,
        sanskrit: 'जलेषु मां रक्षतु मत्स्यमूर्तिर्यादोगणेभ्यो वरदः कृपानिधिः। त्रिविक्रमोऽव्याद्भुवि वामनोऽव्यात्त्रिविष्टपे यस्य विचेष्टितं तत्॥',
        transliteration: 'Jaleshu Mam Rakshatu Matsyamurtir Yadoganebhyo Varadah Kripanidhih. Trivikramo Avyad Bhuvi Vamano Avyat Trivishtape Yasya Vicheshtitam Tat.',
        translation_hindi: 'जलचर जीवों एवं जल के संकटों से मत्स्यावतार भगवान मेरी रक्षा करें। पृथ्वी पर वामन रूपधारी त्रिविक्रम प्रभु और आकाश में अपने पराक्रम से तीनों लोकों को नापने वाले भगवान मेरी रक्षा करें।',
        translation_english: 'In water, may Lord Matsya protect me from aquatic perils; on earth, may the Trivikrama form of Vamana protect me; in the heavens, may the all-encompassing Lord preserve me.'
      },
      {
        verse_no: 3,
        sanskrit: 'दुर्गेष्वटव्याजिमुखादिषु प्रभुः पायान्नृसिंहोऽसुरयूथपारिः। विमुञ्चतो यस्य महाट्टहासं दिशो विनेदुः सहसा पतंश्च॥',
        transliteration: 'Durgeshv Atavy Aji Mukhadishu Prabhuh Payan Nrisimho Asurayuthaparih. Vimunchato Yasya Mahattahasam Disho Vineduh Sahasa Patanshcha.',
        translation_hindi: 'दुर्गम स्थानों में, वनों में तथा युद्ध के मोर्चे पर दैत्यों के संहारक भगवान नृसिंह मेरी रक्षा करें, जिनके अट्टहास मात्र से समस्त दिशाएं दहल उठी थीं और गर्भपात हो गए थे।',
        translation_english: 'In inaccessible fortresses, dense forests, and in battles, may Lord Narasimha, the terror of demon armies, protect me—He whose mighty roar causes all directions to tremble.'
      },
      {
        verse_no: 4,
        sanskrit: 'वराह इन्द्रियबलं क्षितौ मां नृसिंह रक्षत्वसुरादिभ्यः। रामोऽवतु व्योम्नि च लक्ष्मणश्च भरतः शत्रुघ्नश्च युधि सर्वतः॥',
        transliteration: 'Varaha Indriyabalam Kshitau Mam Nrisimha Rakshatv Asuradibhyah. Ramo Avatu Vyomni Cha Lakshmanashcha Bharata Shatrughnashcha Yudhi Sarvatah.',
        translation_hindi: 'वराह भगवान पृथ्वी पर मेरी इन्द्रियों की रक्षा करें। नृसिंह भगवान असुरों से रक्षा करें। आकाश में श्रीराम और लक्ष्मण रक्षा करें तथा युद्ध में भरत और शत्रुघ्न सब ओर से रक्षा करें।',
        translation_english: 'May Lord Varaha preserve my faculties on earth; may Lord Narasimha protect against demonic entities; may Rama and Lakshmana protect in aerial spaces, and Bharata and Shatrughna in conflict.'
      }
    ]
  },
  {
    stotra_name: 'Shri Narasimha Kavacham (श्रीनरसिंहकवचम्)',
    deity_name: 'Vishnu',
    language: 'Sanskrit',
    total_verses: 18,
    author: 'Brahmanda Purana / Prahlada Maharaja',
    description: 'ब्रह्माण्ड पुराणान्तर्गत भक्त प्रह्लाद द्वारा रचित परम कल्याणकारी नरसिंह कवच। भय, ग्रह दोष और असाध्य संकटों का महामंत्र।',
    significance: 'भूत, प्रेत, पिशाच, डाकनी-शाकनी, शत्रु और आकस्मिक संकटों से तत्काल रक्षा प्रदान करने वाला अमोघ कवच।',
    benefits: 'निर्भयता, आत्मविश्वास, असाध्य रोगों का शमन और सर्वत्र विजय।',
    best_time: 'सायंकाल अथवा सन्ध्याकाल',
    recommended_day: 'मंगलवार, शनिवार, नरसिंह जयन्ती',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ नृसिंहाय नमः। नृसिंहकवचं वक्ष्ये प्रह्लादेनोदितं पुरा। सर्वरक्षाकरं पुण्यं सर्वोपद्रवनाशनम्॥',
        transliteration: 'Om Nrisimhaya Namah. Nrisimha Kavacham Vakshye Prahladanoditam Pura. Sarvarakshakaram Punyam Sarvopadravanashanam.',
        translation_hindi: 'मैं उस नरसिंह कवच का वर्णन करता हूँ जिसे प्राचीन काल में भक्त प्रह्लाद ने कहा था। यह समस्त रक्षा करने वाला, परम पवित्र और समस्त उपद्रवों का नाश करने वाला है।',
        translation_english: 'I shall now utter the Narasimha Kavacha, narrated of old by Prahlada. It provides complete protection, is supremely holy, and destroys all calamities.'
      },
      {
        verse_no: 2,
        sanskrit: 'सर्वसम्पत्प्रदं चैव स्वर्गमोक्षप्रदायकम्। ध्यात्वा नृसिंहं देवेशं हेमसिंहासनस्थितम्॥',
        transliteration: 'Sarvasampatpradam Chaiva Svargamokshapradayakam. Dhyatva Nrisimham Devesham Hemasimhasanasthitam.',
        translation_hindi: 'यह समस्त सम्पत्तियों को देने वाला, स्वर्ग और मोक्ष प्रदान करने वाला है। स्वर्ण सिंहासन पर विराजमान देवाधिदेव भगवान नृसिंह का ध्यान करके इसका पाठ करें।',
        translation_english: 'It bestows all prosperity, heaven, and spiritual liberation. Meditating upon Lord Narasimha, the God of gods, seated upon a golden lion-throne.'
      },
      {
        verse_no: 3,
        sanskrit: 'उग्रं वीरं महाविष्णुं ज्वलन्तं सर्वतोमुखम्। नृसिंहं भीषणं भद्रं मृत्युमृत्युं नमाम्यहम्॥',
        transliteration: 'Ugram Veeram Mahavishnum Jvalantam Sarvatomukham. Nrisimham Bheeshanam Bhadram Mrityumrityum Namamyaham.',
        translation_hindi: 'जो उग्र हैं, वीर हैं, महाविष्णु हैं, सर्वतोमुख प्रज्वलित हैं, भीषण होते हुए भी कल्याणकारी (भद्र) हैं और मृत्यु की भी मृत्यु हैं—उन भगवान नृसिंह को मैं नमन करता हूँ।',
        translation_english: 'Fierce, heroic, the Great Vishnu, blazing in all directions, terrifying yet auspicious, the death of death itself—to that Lord Narasimha I bow.'
      }
    ]
  },
  {
    stotra_name: 'Shri Devi Kavacham (श्रीचण्डीकवचम्)',
    deity_name: 'Devi',
    language: 'Sanskrit',
    total_verses: 45,
    author: 'Markandeya Purana (Durga Saptashati)',
    description: 'दुर्गा सप्तशती का परम प्रसिद्ध एवं अनिवार्य प्रथम अंग। ब्रह्मा जी द्वारा मार्कण्डेय ऋषि को उपदेशित नौ दुर्गाओं का सुरक्षा कवच।',
    significance: 'दसों दिशाओं, शरीर के प्रत्येक अंग-प्रत्यंग और अन्तःकरण की आधिदैविक व आधिभौतिक सुरक्षा।',
    benefits: 'शत्रु पराजय, दुर्घटनाओं से रक्षा, दीर्घायु, तेजस्विता और माँ चण्डिका की अविचल कृपा।',
    best_time: 'प्रातः अथवा सन्ध्याकाल',
    recommended_day: 'शुक्रवार, मंगलवार, अष्टमी, नवमी, नवरात्रि',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ नमश्चण्डिकायै॥ मार्कण्डेय उवाच - यद्गुह्यं परमं लोके सर्वरक्षाकरं नृणाम्। यन्न कस्यचिदाख्यातं तन्मे ब्रूहि पितामह॥',
        transliteration: 'Om Namashchandikayai. Markandeya Uvacha - Yad Guhyam Paramam Loke Sarvarakshakaram Nrinam. Yan Na Kasyachidakhyatam Tan Me Broohi Pitamaha.',
        translation_hindi: 'मार्कण्डेय जी ने कहा: हे पितामह! संसार में जो परम गोपनीय तथा मनुष्यों की सब प्रकार से रक्षा करने वाला साधन हो और जो अब तक आपने किसी को न बतलाया हो, वह मुझे बताइए।',
        translation_english: 'Markandeya said: O Grandfather Brahma! Tell me that supreme secret in the world which grants total protection to humanity, which you have never disclosed to anyone before.'
      },
      {
        verse_no: 2,
        sanskrit: 'ब्रह्मोवाच - अस्ति गुह्यतमं विप्र सर्वभूतोपकारकम्। देव्यास्तु कवचं पुण्यं तच्छृणुष्व महामुने॥',
        transliteration: 'Brahmovacha - Asti Guhyatamam Vipra Sarvabhutopakarakam. Devyastu Kavacham Punyam Tach Chhrinushva Mahamune.',
        translation_hindi: 'ब्रह्मा जी बोले: हे विप्रवर! समस्त प्राणियों का उपकार करने वाला परम गोपनीय और पवित्र साधन देवी का कवच है, हे महामुने! उसे ध्यानपूर्वक सुनो।',
        translation_english: 'Brahma replied: O noble sage! There exists a most esoteric and holy armor of the Divine Mother which benefits all living beings. Hear that, O great ascetic!'
      },
      {
        verse_no: 3,
        sanskrit: 'प्रथमं शैलपुत्री च द्वितीयं ब्रह्मचारिणी। तृतीयं चन्द्रघण्टेति कूष्माण्डेति चतुर्थकम्॥ पञ्चमं स्कन्दमातेति षष्ठं कात्यायनीति च। सप्तमं कालरात्रीति महागौरीति चाष्टमम्॥ नवमं सिद्धिदात्री च नवदुर्गाः प्रकीर्तिताः॥',
        transliteration: 'Prathamam Shailaputree Cha Dvitiyam Brahmacharinee. Tritiyam Chandraghanteti Kushmandeti Chaturthakam. Panchamam Skandamateti Shashtham Katyayaneeti Cha. Saptamam Kalaratreeti Mahagaureeti Chashtamam. Navamam Siddhidaatree Cha Navadurgah Prakeertitah.',
        translation_hindi: 'प्रथम शैलपुत्री, द्वितीय ब्रह्मचारिणी, तृतीय चन्द्रघण्टा, चतुर्थ कूष्माण्डा, पञ्चम स्कन्दमाता, षष्ठ कात्यायनी, सप्तम कालरात्रि, अष्टम महागौरी और नवम सिद्धिदात्री—ये नौ दुर्गाएं कही गई हैं।',
        translation_english: 'First is Shailaputri, second Brahmacharini, third Chandraghanta, fourth Kushmanda, fifth Skandamata, sixth Katyayani, seventh Kalaratri, eighth Mahagauri, and ninth Siddhidatri—these are proclaimed as the Nine Durgas.'
      }
    ]
  },
  {
    stotra_name: 'Shri Shiva Kavacham (श्रीशिवकवचम्)',
    deity_name: 'Shiva',
    language: 'Sanskrit',
    total_verses: 25,
    author: 'Skanda Purana / Rishi Bharadvaja',
    description: 'स्कन्द पुराणान्तर्गत महर्षि भरद्वाज द्वारा उपदिष्ट परम तेजस्वी शिव कवच। भगवान साम्बसदाशिव की अभेद्य कृपा का मन्त्र।',
    significance: 'महामृत्युंजय तुल्य फल। अकाल मृत्यु, विष बाधा, भूत-प्रेत और असाध्य रोगों से परम संरक्षण।',
    benefits: 'अकाल मृत्यु से रक्षा, मानसिक स्थिरता, भय का नाश, आरोग्य और शिवलोक की प्राप्ति।',
    best_time: 'प्रातःकाल अथवा प्रदोष काल',
    recommended_day: 'सोमवार, प्रदोष, मासिक शिवरात्रि',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ अस्य श्रीशिवकवचस्तोत्रमन्त्रस्य ब्रह्मा ऋषिः। अनुष्टुप् छन्दः। श्रीसाम्बसदाशिवो देवता। ॐ बीजम्। नमः शक्तिः। शिवाय कीलकम्। मम साम्बसदाशिवप्रीत्यर्थे जपे विनियोगः॥',
        transliteration: 'Om Asya Shri Shiva Kavacha Stotra Mantrasya Brahma Rishih. Anushtup Chhandah. Shri Samba Sadashivo Devata. Om Beejam. Namah Shaktih. Shivaya Keelakam. Mama Samba Sadashiva Preetyarthe Jape Viniyogah.',
        translation_hindi: 'इस श्रीशिवकवच के ब्रह्मा ऋषि हैं, अनुष्टुप छन्द है, साम्बसदाशिव देवता हैं, ॐ बीज है, नमः शक्ति है और शिवाय कीलक है।',
        translation_english: 'For this Shiva Kavacha hymn, Brahma is the seer, Anushtup is the meter, Samba Sadashiva is the presiding deity. Om is the seed, Namah is the power, and Shivaya is the pin.'
      },
      {
        verse_no: 2,
        sanskrit: 'ध्यात्वा नीलग्रीवं त्रिनेत्रं शशिभूषणं पिनाकहस्तं वरदं सौम्यं सर्वलोकैकनाथम्। पातु मां सर्वदा शम्भुः पायान्मां सर्वतो हरः॥',
        transliteration: 'Dhyatva Neelagreevam Trinetram Shashibhushanam Pinakahastam Varadam Saumyam Sarvalokaikanatham. Patu Mam Sarvada Shambhuh Payan Mam Sarvato Harah.',
        translation_hindi: 'नीलकंठ, त्रिनेत्र, चन्द्रभूषण, हाथ में पिनाक धनुष लिए, वरदाता, सौम्य और सर्वलोकों के एकमात्र नाथ का ध्यान कर—शम्भु सदा मेरी रक्षा करें और हर सब ओर से मेरी रक्षा करें।',
        translation_english: 'Meditating on the blue-throated, three-eyed Lord, adorned with the crescent moon, holding the Pinaka bow, gracious and supreme master of all worlds—may Shambhu protect me at all times and Hara from every direction.'
      }
    ]
  },
  {
    stotra_name: 'Shri Hanuman Vadavanala Stotram & Bajrang Baan',
    deity_name: 'Hanuman',
    language: 'Sanskrit',
    total_verses: 20,
    author: 'Traditional (Vibhishana Kritam)',
    description: 'लंकापति विभीषण द्वारा विरचित श्रीहनुमद् वडवानल महास्तोत्र एवं अचूक बजरंग बाण। भीषण संकटों, तांत्रिक बाधाओं और महारोगों का संहारक।',
    significance: 'महाबली हनुमान का यह स्तोत्र दावानल के समान समस्त शत्रुओं, दुष्ट ग्रहों और भय को भस्म कर देता है।',
    benefits: 'असाध्य रोगों की शान्ति, भूत-प्रेत बाधा निवारण, न्यायालय में विजय और अदम्य साहस की प्राप्ति।',
    best_time: 'सायंकाल अथवा संकट के समय',
    recommended_day: 'मंगलवार, शनिवार, हनुमान जयन्ती',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ ह्रां ह्रीं ह्रूं हनुमते रामदूताय नमः। ॐ नमो भगवते श्रीहनुमते वडवानलप्रभाय सर्वशत्रुसंहारकाय महाबलाय॥',
        transliteration: 'Om Hram Hreem Hroom Hanumate Ramadutaya Namah. Om Namo Bhagavate Shri Hanumate Vadavanala Prabhaya Sarvashatru Samharakaya Mahabalaya.',
        translation_hindi: 'श्रीरामदूत हनुमान जी को नमन। वडवानल अग्नि के समान तेजस्वी, समस्त शत्रुओं का संहार करने वाले महाबली श्रीहनुमान जी को नमस्कार है।',
        translation_english: 'Salutations to the messenger of Rama, Lord Hanuman! Salutations to the supremely powerful Hanuman, effulgent like the submarine fire (Vadavanala), destroyer of all adversaries.'
      },
      {
        verse_no: 2,
        sanskrit: 'ॐ नमो भगवते आञ्जनेयाय महाबलाय स्वाहा। ॐ ह्रीं ह्रीं ह्रां ह्रूं ह्रें ह्रौं ह्रः सकलदुष्टग्रहान् निवारय निवारय स्वाहा॥',
        transliteration: 'Om Namo Bhagavate Anjaneyaya Mahabalaya Svaha. Om Hreem Hreem Hram Hroom Hrem Hraum Hrah Sakaladushtagrahan Nivaraya Nivaraya Svaha.',
        translation_hindi: 'महाबली अञ्जनीपुत्र भगवान हनुमान को स्वाहा! हे प्रभो! समस्त दुष्ट ग्रहों की पीड़ा को दूर कीजिए, निवारण कीजिए, स्वाहा।',
        translation_english: 'Om, salutations to the mighty son of Anjana, Svaha! Dispel, utterly dispel all afflictions caused by malignant planets, Svaha!'
      }
    ]
  },
  {
    stotra_name: 'Shri Surya Kavacham (श्रीसूर्य कवचम्)',
    deity_name: 'Surya',
    language: 'Sanskrit',
    total_verses: 16,
    author: 'Yajnavalkya Rishi (Skanda Purana)',
    description: 'महर्षि याज्ञवल्क्य द्वारा रचित भगवान भुवन-भास्कर सूर्य देव का दिव्य कवच। नेत्र रोग, त्वचा रोग और दुर्बलता का नाशक।',
    significance: 'रविवार को प्रातः तांबे के लोटे से सूर्य को अर्घ्य देकर इस कवच का पाठ करने से आरोग्य और राजसम्मान प्राप्त होता है।',
    benefits: 'नेत्र ज्योति में वृद्धि, शारीरिक ओज, हृदय रोग से मुक्ति, यश और सरकारी कार्यों में सफलता।',
    best_time: 'प्रातःकाल सूर्योदय के समय',
    recommended_day: 'रविवार, सप्तमी तिथि',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ॐ अस्य श्रीसूर्यप्रसादमन्त्रकवचस्य याज्ञवल्क्य ऋषिः। अनुष्टुप् छन्दः। श्रीसूर्यप्रसादो देवता। ॐ बीजम्। घृणिः शक्तिः। स्वाहा कीलकम्॥',
        transliteration: 'Om Asya Shri Surya Prasada Mantra Kavachasya Yajnavalkya Rishih. Anushtup Chhandah. Shri Surya Prasado Devata. Om Beejam. Ghrinih Shaktih. Svaha Keelakam.',
        translation_hindi: 'इस श्रीसूर्य कवच के याज्ञवल्क्य ऋषि हैं, अनुष्टुप छन्द है, सूर्य देव देवता हैं, ॐ बीज है और घृणि शक्ति है।',
        translation_english: 'For this Surya Kavacha, Yajnavalkya is the sage, Anushtup is the meter, and the Lord of light, Surya, is the deity.'
      },
      {
        verse_no: 2,
        sanskrit: 'शिरो मे भास्करः पातु ललाटं मेऽमिताशुचिः। नेत्रे दिनमणिः पातु श्रवणे वासरेश्वरः॥ घ्राणं पातु धर्मरश्मिर्वदनं वेदवाहनः॥',
        transliteration: 'Shiro Me Bhaskarah Patu Lalatam Me Amitashuchih. Netre Dinamanih Patu Shravane Vasareshvarah. Ghranam Patu Dharmarashmir Vadanam Vedavahanah.',
        translation_hindi: 'भगवान भास्कर मेरे सिर की रक्षा करें, परम पवित्र सूर्य मेरे ललाट की रक्षा करें। दिनमणि मेरे नेत्रों की और दिन के स्वामी मेरे कानों की रक्षा करें। धर्मरश्मि नासिका की और वेदवाहन मेरे मुख की रक्षा करें।',
        translation_english: 'May Bhaskara protect my head, and the infinitely pure Sun my forehead. May Dinamani protect my eyes, and the Lord of the day my ears. May Dharmarashmi protect my nose, and the rider of Vedas my mouth.'
      }
    ]
  }
];

// 5. REVERED ASHTAKAMS (7)
const ashtakams = [
  {
    stotra_name: 'Madhurashtakam (मधुराष्टकम्)',
    deity_name: 'Krishna',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Jagadguru Shri Vallabhacharya',
    description: 'श्रीमद्वल्लभाचार्य जी विरचित भगवान श्रीकृष्ण की मधुरता का अमर स्तवन। मधुराधिपतेरखिलं मधुरम्।',
    significance: 'भक्तिमार्ग का सर्वोत्कृष्ट स्तोत्र। इसके पाठ से अंतःकरण में प्रेमाभक्ति, माधुर्य भाव और आनन्द का संचार होता है।',
    benefits: 'मानसिक तनाव की शान्ति, प्रेममय स्वभाव, वाणी में माधुर्य और श्रीकृष्ण सान्निध्य।',
    best_time: 'प्रातः अथवा शयन से पूर्व',
    recommended_day: 'बुधवार, गुरुवार, जन्माष्टमी',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'अधरं मधुरं वदनं मधुरं नयनं मधुरं हसितं मधुरम्। हृदयं मधुरं गमनं मधुरं मधुराधिपतेरखिलं मधुरम्॥',
        transliteration: 'Adharam Madhuram Vadanam Madhuram Nayanam Madhuram Hasitam Madhuram. Hridayam Madhuram Gamanam Madhuram Madhuradhipater Akhilam Madhuram.',
        translation_hindi: 'उनके होंठ मधुर हैं, मुख मधुर है, नेत्र मधुर हैं, मुस्कान मधुर है। उनका हृदय मधुर है, उनकी चाल मधुर है; मधुरता के अधिपति श्रीकृष्ण का सब कुछ मधुर है।',
        translation_english: 'His lips are sweet, His face is sweet, His eyes are sweet, His smile is sweet. His heart is sweet, His gait is sweet; everything about the Lord of sweetness is supremely sweet.'
      },
      {
        verse_no: 2,
        sanskrit: 'वचनं मधुरं चरितं मधुरं वसनं मधुरं वलितं मधुरम्। चलितं मधुरं भ्रमितं मधुरं मधुराधिपतेरखिलं मधुरम्॥',
        transliteration: 'Vachanam Madhuram Charitam Madhuram Vasanam Madhuram Valitam Madhuram. Chalitam Madhuram Bhramitam Madhuram Madhuradhipater Akhilam Madhuram.',
        translation_hindi: 'उनकी वाणी मधुर है, चरित्र मधुर है, वस्त्र मधुर हैं, त्रिभंगी मुद्रा मधुर है। उनका चलना मधुर है, उनका घूमना मधुर है; मधुराधिपति का सब कुछ मधुर है।',
        translation_english: 'His words are sweet, His character is sweet, His garments are sweet, His posture is sweet. His walking is sweet, His wandering is sweet; everything about the Lord of sweetness is sweet.'
      },
      {
        verse_no: 3,
        sanskrit: 'वेणुर्मधुरो रेणुर्मधुरः पाणिर्मधुरः पादौ मधुरौ। नृत्यं मधुरं सख्यं मधुरं मधुराधिपतेरखिलं मधुरम्॥',
        transliteration: 'Venur Madhuro Renur Madhurah Panir Madhurah Padau Madhurau. Nrityam Madhuram Sakhyam Madhuram Madhuradhipater Akhilam Madhuram.',
        translation_hindi: 'उनकी बांसुरी मधुर है, चरण-रज मधुर है, हाथ मधुर हैं, दोनों चरण मधुर हैं। उनका नृत्य मधुर है, उनकी मित्रता मधुर है; मधुराधिपति का सब कुछ मधुर है।',
        translation_english: 'His flute is sweet, His foot-dust is sweet, His hands are sweet, His feet are sweet. His dance is sweet, His friendship is sweet; everything about the Lord of sweetness is sweet.'
      }
    ]
  },
  {
    stotra_name: 'Lingashtakam (लिङ्गाष्टकम्)',
    deity_name: 'Shiva',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Traditional / Adi Shankaracharya',
    description: 'शिवलिंग की महिमा, पवित्रता और मुक्ति-प्रदाता स्वरूप का आठ श्लोकों में अद्वितीय स्तवन।',
    significance: 'प्रत्येक सोमवार एवं प्रदोष में शिवलिंग पर जल/दूध अभिषेक के समय इसका पाठ करने से शिव सायुज्य मिलता है।',
    benefits: 'समस्त पापों का क्षय, कुल की उन्नति, ज्ञान-वैराग्य और अंत समय में शिवलोक की प्राप्ति।',
    best_time: 'प्रातःकाल अभिषेक के समय',
    recommended_day: 'सोमवार, महाशिवरात्रि, प्रदोष',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'ब्रह्ममुरारिसुरार्चितलिङ्गं निर्मलभासितशोभितलिङ्गम्। जन्मजदुःखविनाशकलिङ्गं तत् प्रणमामि सदाशिवलिङ्गम्॥',
        transliteration: 'Brahma Murari Surarchita Lingam Nirmala Bhasita Shobhita Lingam. Janmaja Duhkha Vinashaka Lingam Tat Pranamami Sadashiva Lingam.',
        translation_hindi: 'ब्रह्मा, विष्णु और देवताओं द्वारा पूजित, निर्मल कान्ति से सुशोभित और जन्म-मरण के दुखों का नाश करने वाले उस सदाशिव लिंग को मैं प्रणाम करता हूँ।',
        translation_english: 'Worshipped by Brahma, Vishnu and the celestials, adorned with pure brilliance, destroyer of the sorrows of birth and rebirth—to that sacred Sadashiva Lingam, I bow.'
      },
      {
        verse_no: 2,
        sanskrit: 'देवमुनिप्रवरार्चितलिङ्गं कामदहं करुणाकरलिङ्गम्। रावणदर्पविनाशनलिङ्गं तत् प्रणमामि सदाशिवलिङ्गम्॥',
        transliteration: 'Deva Muni Pravararchita Lingam Kama Daham Karunakara Lingam. Ravana Darpa Vinashana Lingam Tat Pranamami Sadashiva Lingam.',
        translation_hindi: 'देवताओं और श्रेष्ठ मुनियों द्वारा पूजित, कामदेव को भस्म करने वाले, करुणा की खान और रावण के घमण्ड को चूर्ण करने वाले उस सदाशिव लिंग को मैं प्रणाम करता हूँ।',
        translation_english: 'Revered by sages and gods, incinerator of worldly passion, ocean of mercy, destroyer of Ravana’s pride—to that sacred Sadashiva Lingam, I bow.'
      }
    ]
  },
  {
    stotra_name: 'Bilvashtakam (बिल्वाष्टकम्)',
    deity_name: 'Shiva',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Traditional',
    description: 'भगवान शिव को त्रिनेत्र और त्रिगुणात्मक बिल्वपत्र समर्पित करने की अगाध महिमा का स्तोत्र। एकबिल्वं शिवार्पणम्।',
    significance: 'एक भी बिल्वपत्र इस स्तोत्र के साथ शिवलिंग पर अर्पित करने से कोटि पाप नष्ट हो जाते हैं।',
    benefits: 'अखंड सौभाग्य, कोटि कन्यादान तुल्य फल, पाप-मुक्ति और मोक्ष।',
    best_time: 'प्रातःकाल बिल्वपत्र समर्पण के समय',
    recommended_day: 'सोमवार, प्रदोष, सावन मास',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'त्रिदलं त्रिगुणाकारं त्रिनेत्रं च त्रियायुधम्। त्रिजन्मपापसंहारमेकबिल्वं शिवार्पणम्॥',
        transliteration: 'Tridalam Trigunakaram Trinetram Cha Triyayudham. Trijanma Papa Samharam Eka Bilvam Shivarpanam.',
        translation_hindi: 'तीन दलों वाला, तीनों गुणों (सत्व, रज, तम) का स्वरूप, शिव के त्रिनेत्र और त्रिशूल के समान, और तीन जन्मों के पापों का संहार करने वाला यह एक बिल्वपत्र मैं भगवान शिव को अर्पित करता हूँ।',
        translation_english: 'Possessing three leaves, representing the three gunas, resembling the three eyes and trident of Shiva, and destroying sins of three lifetimes—I offer this single Bilva leaf to Lord Shiva.'
      },
      {
        verse_no: 2,
        sanskrit: 'त्रिशाखैः बिल्वपत्रैश्च ह्यच्छिद्रैः कोमलैः शुभैः। तव पूजां करिष्यामि ह्येकबिल्वं शिवार्पणम्॥',
        transliteration: 'Trishakhaih Bilvapatraishcha Hyachhidraih Komalaih Shubhaih. Tava Poojam Karishyami Hyeka Bilvam Shivarpanam.',
        translation_hindi: 'तीन शाखाओं वाले, बिना छेद वाले, कोमल और शुभ बिल्वपत्रों से मैं आपकी पूजा करता हूँ; हे शिव! यह एक बिल्वपत्र आपको सादर समर्पित है।',
        translation_english: 'With three-branched leaves of the Bilva, unblemished, tender and auspicious, I worship You; this single Bilva leaf is dedicated to Lord Shiva.'
      }
    ]
  },
  {
    stotra_name: 'Achyutashtakam (अच्युताष्टकम्)',
    deity_name: 'Vishnu',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Adi Shankaracharya',
    description: 'आदिगुरु शंकराचार्य विरचित भगवान अच्युत, माधव, गोविन्द और वासुदेव के मधुर नामों का आठ श्लोकों में स्तवन।',
    significance: 'अच्युतं केशवं रामनारायणं - यह स्तोत्र हरिनाम संकीर्तन का प्राण है। प्रातः पाठ से दिन भर मन में प्रसन्नता बनी रहती है।',
    benefits: 'मन की एकाग्रता, भवभय नाश, पारिवारिक आनन्द और भगवान नारायण की कृपा।',
    best_time: 'प्रातःकाल अथवा सन्ध्याकाल',
    recommended_day: 'गुरुवार, एकादशी',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'अच्युतं केशवं रामनारायणं कृष्णदामोदरं वासुदेवं हरिम्। श्रीधरं माधवं गोपिकावल्लभं जानकीनायकं रामचन्द्रं भजे॥',
        transliteration: 'Achyutam Keshavam Rama Narayanam Krishna Damodaram Vasudevam Harim. Shreedharam Madhavam Gopikavallabham Janakeenayakam Ramachandram Bhaje.',
        translation_hindi: 'अच्युत, केशव, राम, नारायण, कृष्ण, दामोदर, वासुदेव, हरि, श्रीधर, माधव, गोपिकावल्लभ और जानकी के स्वामी श्रीरामचन्द्र जी का मैं भजन करता हूँ।',
        translation_english: 'I worship Lord Achyuta, Keshava, Rama, Narayana, Krishna, Damodara, Vasudeva, Hari, Shreedhara, Madhava, beloved of the Gopis, and the Lord of Janaki, Sri Ramachandra.'
      },
      {
        verse_no: 2,
        sanskrit: 'अच्युतं कल्पितं यस्य रूपं विभुं सर्वगं शान्तमव्यक्तरूपं परम्। निर्गुणं निष्कलं निर्मलं निष्प्रपञ्चं निराकारमीडे निरालम्बमीशम्॥',
        transliteration: 'Achyutam Kalpitam Yasya Roopam Vibhum Sarvagam Shantam Avyaktaroopam Param. Nirgunam Nishkalam Nirmalam Nishprapancham Nirakarameede Niralambameesham.',
        translation_hindi: 'जो सर्वव्यापी, शान्त, अव्यक्त, परम, निर्गुण, निष्कल, निर्मल, प्रपञ्चरहित, निराकार और निरालम्ब ईश्वर हैं, उन अच्युत प्रभु की मैं स्तुति करता हूँ।',
        translation_english: 'I extol that Lord Achyuta who is all-pervading, tranquil, transcendent, beyond form, pure, immaculate, self-supported and the supreme ruler.'
      }
    ]
  },
  {
    stotra_name: 'Kalabhairavashtakam (कालभैरवाष्टकम्)',
    deity_name: 'Shiva',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Adi Shankaracharya',
    description: 'काशी के कोतवाल भगवान कालभैरव का आदि शंकराचार्य कृत परम ओजस्वी अष्टक। काशीराजभजं कालभैरवं भजे।',
    significance: 'काल, भय, मृत्यु, शत्रु और शनि-राहु की महादशा का अचूक शमन करने वाला तांत्रिक-वैदिक स्तोत्र।',
    benefits: 'भय का नाश, कालसर्प दोष शान्ति, शत्रुओं का पराभव, आत्मविश्वास और काशीवास का पुण्य।',
    best_time: 'सायंकाल अथवा रात्रिकाल',
    recommended_day: 'रविवार, मंगलवार, कालाष्टमी',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'देवराजसेव्यमानपावनाङ्घ्रिपङ्कजं व्यालयज्ञसूत्रमिन्दुशेखरं कृपाकरम्। नारदादियोगिवृन्दवन्दितं दिगम्बरं काशिकापुराधिनाथकालभैरवं भजे॥',
        transliteration: 'Devarajasevyamana Pavananghripankajam Vyalayajnasootram Indushekharam Kripakaram. Naradadi Yogivrinda Vanditam Digambaram Kashika Puradhinatha Kalabhairavam Bhaje.',
        translation_hindi: 'जिनके पवित्र चरण-कमलों की सेवा देवराज इन्द्र करते हैं, जिन्होंने सर्प का यज्ञोपवीत धारण किया है, जिनके मस्तक पर चन्द्रमा है, जो कृपा की खान हैं, नारद आदि योगीजन जिनकी वन्दना करते हैं, जो दिगम्बर हैं—उन काशी के अधिपति कालभैरव को मैं भजता हूँ।',
        translation_english: 'Whose sacred lotus feet are served by Indra, who wears a serpent as his sacred thread, adorned with the moon, merciful, worshipped by Narada and the yogis, clad in space—I worship Kalabhairava, Lord of Kashi.'
      },
      {
        verse_no: 2,
        sanskrit: 'भानुकोटिभास्वरं भवाब्धितारकं परं नीलकण्ठमीप्सितार्थदायकं त्रिलोचनम्। कालकालमम्बुजाक्षमक्षशूलमक्षरं काशिकापुराधिनाथकालभैरवं भजे॥',
        transliteration: 'Bhanukoti Bhasvaram Bhavabdhi Tarakam Param Neelakantham Eepsitartha Dayakam Trilochanam. Kalakalam Ambujaksham Akshashoolam Aksharam Kashika Puradhinatha Kalabhairavam Bhaje.',
        translation_hindi: 'जो करोड़ों सूर्यों के समान तेजस्वी हैं, भवसागर से तारने वाले हैं, नीलकण्ठ, मनोवांछित फल देने वाले, त्रिनेत्र, काल के भी महाकाल, कमलनयन, त्रिशूलधारी और अविनाशी हैं—उन काशी के नाथ कालभैरव को मैं भजता हूँ।',
        translation_english: 'Radiant as ten million suns, deliverer across the worldly ocean, blue-necked, granter of cherished boons, three-eyed, death of time, lotus-eyed, trident-bearing and imperishable—I worship Kalabhairava, Lord of Kashi.'
      }
    ]
  },
  {
    stotra_name: 'Sankashtanashana Ganesha Stotram (सङ्कटनाशन गणेश स्तोत्रम्)',
    deity_name: 'Ganesh',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Narada Purana',
    description: 'नारद पुराण का प्रसिद्ध गणेश स्तोत्र। बारह नामों के स्मरण से समस्त घोर संकटों और विघ्नों का तत्काल नाश होता है।',
    significance: 'संकष्टी चतुर्थी तथा नित्य प्रातःकाल इसके पाठ से विद्यार्थी को विद्या, धनार्थी को धन और पुत्रार्थी को पुत्र प्राप्त होता है।',
    benefits: 'समस्त विघ्नों का नाश, कार्यों में सफलता, ऋण मुक्ति और मानसिक शान्ति।',
    best_time: 'प्रातःकाल स्नान के बाद',
    recommended_day: 'बुधवार, संकष्टी चतुर्थी',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम्। भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये॥',
        transliteration: 'Pranamya Shirasa Devam Gaureeputram Vinayakam. Bhaktavasam Smaren Nityam Ayuh Kamartha Siddhaye.',
        translation_hindi: 'सिर झुकाकर गौरीपुत्र भगवान विनायक को प्रणाम करके, अपनी आयु, कामना और धन की सिद्धि के लिए भक्तजनों के हृदय में वास करने वाले गणेश जी का प्रतिदिन स्मरण करें।',
        translation_english: 'Bowing with the head to the divine Vinayaka, the son of Gauri, let a devotee constantly remember Him who abides in the hearts of devotees, for the attainment of lifespan, desires, and prosperity.'
      },
      {
        verse_no: 2,
        sanskrit: 'प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम्। तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम्॥ लम्बोदरं पञ्चमं च षष्ठं विकटमेव च। सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम्॥',
        transliteration: 'Prathamam Vakratundam Cha Ekadantam Dviteeyakam. Tritiyam Krishnapingaksham Gajavaktram Chaturthakam. Lambodaram Panchamam Cha Shashtham Vikatameva Cha. Saptamam Vighnarajendram Dhoomravarnam Tathashtamam.',
        translation_hindi: 'पहला नाम वक्रतुण्ड, दूसरा एकदन्त, तीसरा कृष्णपिङ्गाक्ष, चौथा गजवक्त्र, पांचवां लम्बोदर, छठा विकट, सातवां विघ्नराजेन्द्र और आठवां धूम्रवर्ण है।',
        translation_english: 'First Vakratunda (curved trunk), second Ekadanta (single tusk), third Krishnapingaksha (dark yellowish-brown eyes), fourth Gajavaktra (elephant face), fifth Lambodara (broad belly), sixth Vikata (formidable), seventh Vighnarajendra (king of obstacles), and eighth Dhoomravarna (smoke-colored).'
      }
    ]
  },
  {
    stotra_name: 'Shri Annapurna Ashtakam (श्रीअन्नपूर्णाष्टकम्)',
    deity_name: 'Devi',
    language: 'Sanskrit',
    total_verses: 8,
    author: 'Adi Shankaracharya',
    description: 'आदि शंकराचार्य विरचित काशी की अन्नदात्री जगन्माता माँ अन्नपूर्णा का परम करुणामयी स्तोत्र। भिक्षां देहि कृपावलम्बनकरी।',
    significance: 'घर में कभी अन्न, धन और प्रेम की कमी नहीं होती। रसोई घर एवं भोजन से पूर्व इसका पाठ अक्षय भंडार देता है।',
    benefits: 'अक्षय अन्न-धन, भूख और दरिद्रता का नाश, आत्मज्ञान और वैराग्य की प्राप्ति।',
    best_time: 'प्रातः अथवा भोजन से पूर्व',
    recommended_day: 'शुक्रवार, नित्य',
    verses: [
      {
        verse_no: 1,
        sanskrit: 'नित्यानन्दकरी वराभयकरी सौन्दर्यरत्नाकरी निर्धूताखिलघोरपावनकरी प्रत्यक्षमाहेश्वरी। प्रालेयाचलवंशपावनकरी काशीपुराधीश्वरी भिक्षां देहि कृपावलम्बनकरी मातान्नपूर्णेश्वरी॥',
        transliteration: 'Nityanandakaree Varabhayakaree Saundaryaratnakaree Nirdhutakhilaghorapavanakaree Pratyakshamaheshvaree. Praleyachala Vamsha Pavanakaree Kasheepuradheeshvaree Bhiksham Dehi Kripavalambanakaree Mata Annapurneshvaree.',
        translation_hindi: 'सदा आनन्द देने वाली, वर और अभय देने वाली, सौन्दर्य की खान, समस्त घोर पापों को धोकर पवित्र करने वाली, साक्षात् माहेश्वरी, हिमालय वंश को पावन करने वाली, काशीपुरी की अधीश्वरी, कृपा का सहारा देने वाली हे माता अन्नपूर्णेश्वरी! मुझे ज्ञान-वैराग्य रूपी भिक्षा प्रदान कीजिए।',
        translation_english: 'Bestower of eternal bliss, granter of boons and fearlessness, ocean of beauty, cleanser of all terrible sins, manifest supreme goddess, sanctifier of the snowy mountain lineage, Empress of Kashi—O Mother Annapurneshwari, hold out Your hand of mercy and grant me the alms of spiritual sustenance!'
      },
      {
        verse_no: 2,
        sanskrit: 'नानात्नविचित्रभूषणकरी हेमाम्बराडम्बरी मुक्ताहारविडम्बमानविलसद्वक्षोजकुम्भान्तरी। काश्मीरागरुवासिता रुचिकरी काशीपुराधीश्वरी भिक्षां देहि कृपावलम्बनकरी मातान्नपूर्णेश्वरी॥',
        transliteration: 'Nanaratna Vichitrabhushanakaree Hemambaradambaree Muktahara Vidambamana Vilasad Vakshojakumbhantaree. Kashmeeragaru Vasita Ruchikaree Kasheepuradheeshvaree Bhiksham Dehi Kripavalambanakaree Mata Annapurneshvaree.',
        translation_hindi: 'नाना प्रकार के रत्नों से सुशोभित, सुवर्ण वस्त्र धारण करने वाली, मोतियों के हार से मण्डित, केशर और चन्दन की सुगन्ध से युक्त, काशीपुरी की स्वामिनी हे माँ अन्नपूर्णा! मुझे कृपापूर्वक भिक्षा दीजिए।',
        translation_english: 'Adorned with diverse gems, clothed in shining golden robes, wearing brilliant pearl necklaces, fragrant with saffron and sandalwood, Sovereign of Kashi—O Mother Annapurna, grant me the alms of divine grace!'
      }
    ]
  }
];

// 6. 5 MISSING CHALISAS (into chalisa table)
const chalisas = [
  {
    chalisa_name: 'Shri Krishna Chalisa',
    deity_name: 'Krishna',
    language: 'Hindi',
    total_verses: 40,
    author: 'Traditional',
    description: 'श्री कृष्ण चालीसा भगवान श्रीकृष्ण को समर्पित ४० चौपाइयों का परम मधुर स्तोत्र है।',
    significance: 'भगवान श्रीकृष्ण की कृपा, सन्तान प्राप्ति, गृहक्लेश निवारण और भक्ति-रस की प्राप्ति हेतु प्रसिद्ध।',
    benefits: 'पारिवारिक सौहार्द, सुख-समृद्धि, संकट-मुक्ति और अंतःकरण की पवित्रता।',
    best_time: 'प्रातःकाल अथवा सन्ध्याकाल',
    recommended_day: 'बुधवार, गुरुवार, जन्माष्टमी',
    verses: [
      { verse_no: 1, text: 'दोहा: बंशी शोभित कर मधुर, नील जलद तन श्याम। अरुण अधर जनु बिम्बफल, नयन कमल अभिराम॥' },
      { verse_no: 2, text: 'पूर्ण इन्दु अरविन्द मुख, पीताम्बर शुभ साज। जय मनमोहन मदन छवि, कृष्णचन्द्र महाराज॥' },
      { verse_no: 3, text: 'चौपाई: जय यदुनन्दन जय जगवन्दन। जय वसुदेव देवकी नन्दन॥' },
      { verse_no: 4, text: 'जय यदुराज कंस अरि हन्ता। आनन्द घन सब भक्तन त्राता॥' },
      { verse_no: 5, text: 'भुवन चारु कर मुरली सोहै। सुर मुनि नर नागिन मन मोहै॥' },
      { verse_no: 6, text: 'मस्तक मुकुट कुण्डल कर कान। निरखि रूप मुनि तजत ध्यान॥' },
      { verse_no: 7, text: 'नटवर वेश मनोहर सोहै। देखत कोटि काम मन मोहै॥' },
      { verse_no: 8, text: 'कंसहि मारि असुर दल संहारा। उग्रसेन को राज सम्हारा॥' },
      { verse_no: 9, text: 'पाण्डव के तुम बने सहाई। अर्जुन को गीता बतलाई॥' },
      { verse_no: 10, text: 'जो यह पढ़े कृष्ण चालीसा। होय सिद्ध साक्षी जगदीशा॥' }
    ]
  },
  {
    chalisa_name: 'Shri Shani Chalisa',
    deity_name: 'Shani',
    language: 'Hindi',
    total_verses: 40,
    author: 'Traditional',
    description: 'श्री शनि चालीसा न्याय के देवता सूर्यपुत्र भगवान शनिदेव को समर्पित ४० चौपाइयों का स्तोत्र है।',
    significance: 'शनि की साढ़ेसाती, ढैय्या एवं महादशा के कुप्रभावों को शांत कर शुभ फल प्रदान करता है।',
    benefits: 'अन्याय और संकटों से रक्षा, मानसिक संताप की शान्ति, रोगमुक्ति और कार्य में सफलता।',
    best_time: 'सायंकाल',
    recommended_day: 'शनिवार, शनि जयन्ती, अमावस्या',
    verses: [
      { verse_no: 1, text: 'दोहा: जय गणेश गिरिजा सुवन, मंगल करण कृपाल। दीनन के दुख दूर करि, कीजै नाथ निहाल॥' },
      { verse_no: 2, text: 'जय जय श्री शनिदेव प्रभु, सुनहु विनय महाराज। कृपा करहु हे रवि सुवन, राखहु जन की लाज॥' },
      { verse_no: 3, text: 'चौपाई: जयति जयति शनिदेव दयाला। करत सदा भक्तन प्रतिपाला॥' },
      { verse_no: 4, text: 'चारि भुजा तनु श्याम विराहै। माथे रतन मुकुट छवि छाजै॥' },
      { verse_no: 5, text: 'परम विशाल मनोहर भाला। टेढ़ी दृष्टि भृकुटि विकराला॥' },
      { verse_no: 6, text: 'कुण्डल श्रवण चमाचम चमके। हिय माल मुक्तन मनि दमके॥' },
      { verse_no: 7, text: 'कर में गदा त्रिशूल कुठारा। पल बिच करैं अरिहिं संहारा॥' },
      { verse_no: 8, text: 'पिंगल मन्द रौद्र यम नामा। संवर्तक शुभ शनि सुख धामा॥' },
      { verse_no: 9, text: 'शनि चालीसा जो नित गावै। जाहि विपति सब दूर नसावै॥' },
      { verse_no: 10, text: 'दोहा: पाठ शनैश्चर देव को, कीन्हों विमल तैयार। करत पाठ चालीस दिन, हो भवसागर पार॥' }
    ]
  },
  {
    chalisa_name: 'Shri Saraswati Chalisa',
    deity_name: 'Saraswati',
    language: 'Hindi',
    total_verses: 40,
    author: 'Traditional',
    description: 'विद्या, बुद्धि, वाणी और संगीत की अधिष्ठात्री भगवती माँ सरस्वती की चालीसा।',
    significance: 'अध्ययन में सफलता, एकाग्रता, अज्ञान-विनाश और वाक-सिद्धि हेतु अत्यंत फलदायी।',
    benefits: 'स्मृति शक्ति में वृद्धि, बौद्धिक विकास, परीक्षा में सफलता और कला-संगीत में निपुणता।',
    best_time: 'प्रातःकाल',
    recommended_day: 'बुधवार, गुरुवार, वसंत पंचमी',
    verses: [
      { verse_no: 1, text: 'दोहा: जनक जननि पद कमल रज, निज मस्तक पर धारि। बन्दौं मातु सरस्वती, बुद्धि बल दे दातारि॥' },
      { verse_no: 2, text: 'पूर्ण जगत में व्याप्त तव, महिमा अमित अनन्तु। दुष्टजनों के पाप को, मातु सदा तुम हन्तु॥' },
      { verse_no: 3, text: 'चौपाई: जय श्री सकल बुद्धि बलरासी। जय सर्वज्ञ अमर अविनाशी॥' },
      { verse_no: 4, text: 'जय जय जय वीणाकर धारी। करती सदा सुहंस सवारी॥' },
      { verse_no: 5, text: 'रूप चतुर्भुज धारी माता। सकल विश्व अन्दर विख्याता॥' },
      { verse_no: 6, text: 'जग में पाप बुद्धि जो उपजे। माता तुरन्त हरत है लज के॥' },
      { verse_no: 7, text: 'विद्या बुद्धि देहु मोहि माता। तुम ही जग की भाग्य विधाता॥' },
      { verse_no: 8, text: 'जो यह पाठ करे मन लाई। ताके कष्ट दूर हो जाई॥' }
    ]
  },
  {
    chalisa_name: 'Shri Surya Chalisa',
    deity_name: 'Surya',
    language: 'Hindi',
    total_verses: 40,
    author: 'Traditional',
    description: 'प्रत्यक्ष देवता भगवान सूर्य नारायण को समर्पित ४० चौपाइयों का पावन स्तोत्र।',
    significance: 'आरोग्य, दीर्घायु, आत्मबल और तेजस्विता की प्राप्ति हेतु नित्य पाठ योग्य।',
    benefits: 'नेत्र ज्योति, शारीरिक ओज, हृदय रोग निवारण और मान-सम्मान में वृद्धि।',
    best_time: 'प्रातःकाल सूर्योदय के समय',
    recommended_day: 'रविवार, सप्तमी',
    verses: [
      { verse_no: 1, text: 'दोहा: कनक बदन कुण्डल मकर, मुकुट शीश पर सोह। करुणामय दीपक प्रभा, जग को डारत मोह॥' },
      { verse_no: 2, text: 'चौपाई: जय जय जय भास्कर अविनाशी। त्रिभुवन की हरते सब हाँसी॥' },
      { verse_no: 3, text: 'सप्त अश्व रथ पर असवारा। छिन महं करत जगत उजियारा॥' },
      { verse_no: 4, text: 'किरण मनोहर छवि सुखदायी। देखि छिनहिं सब विपति नसाई॥' },
      { verse_no: 5, text: 'अंग अंग पर कान्ति अनूपा। त्रिभुवन वन्दित दिव्य स्वरूपा॥' },
      { verse_no: 6, text: 'सूर्य चालीसा जो नित ध्यावै। सुख सम्पत्ति आरोग्य सुपावै॥' }
    ]
  },
  {
    chalisa_name: 'Shri Bhairav Chalisa',
    deity_name: 'Shiva',
    language: 'Hindi',
    total_verses: 40,
    author: 'Traditional',
    description: 'भगवान कालभैरव एवं बटुक भैरव को समर्पित ४० चौपाइयों का रक्षा स्तोत्र।',
    significance: 'भूत-प्रेत, तंत्र-बाधा, शत्रु भय और आकस्मिक संकटों का समूल नाश करने वाला।',
    benefits: 'अखंड सुरक्षा, अदम्य साहस, ग्रह शांति और कार्यों में आने वाली रुकावटों का निवारण।',
    best_time: 'सायंकाल अथवा रात्रिकाल',
    recommended_day: 'रविवार, मंगलवार, कालाष्टमी',
    verses: [
      { verse_no: 1, text: 'दोहा: श्री गणपति गुरु गौरिपद, प्रेम सहित धरि माथ। भैरव चालीसा कहत, कृपा करहु यदुनाथ॥' },
      { verse_no: 2, text: 'चौपाई: जय जय भैरव बटुक अनूपा। संकट हरण सुहवन स्वरूपा॥' },
      { verse_no: 3, text: 'झांझ झमीका बाजत आगे। कांपत असुर देखि भय जागे॥' },
      { verse_no: 4, text: 'कर त्रिशूल डमरू विराजै। नाद गगन पातालहिं गाजै॥' },
      { verse_no: 5, text: 'काल भैरव जो ध्यावै मन में। पावै सुख सम्पत्ति हर छिन में॥' }
    ]
  }
];

// 7. NITYA KARMA DAILY MANTRAS (7 into mantras table)
const nitya_mantras = [
  {
    name: 'Pratah Karadarshanam (प्रातः करदर्शनम्)',
    sanskrit_text: 'कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती। करमूले तु गोविन्दः प्रभाते करदर्शनम्॥',
    transliteration: 'Karagre Vasate Lakshmih Karamadhye Sarasvati. Karamule Tu Govindah Prabhate Karadarshanam.',
    translation_hindi: 'हाथ के अग्रभाग में माता लक्ष्मी, मध्य में सरस्वती और मूल में भगवान गोविन्द का निवास है। अतः प्रातः उठकर दोनों हथेलियों के दर्शन करने चाहिए।',
    translation_english: 'At the tip of the hand resides Lakshmi, in the center resides Saraswati, and at the base dwells Govinda. Therefore, one should behold one’s palms upon waking at dawn.',
    category_id: 6
  },
  {
    name: 'Prithvi Kshama Prarthana (पृथ्वी क्षमा प्रार्थना)',
    sanskrit_text: 'समुद्रवसने देवि पर्वतस्तनमण्डले। विष्णुपत्नि नमस्तुभ्यं पादस्पर्शं क्षमस्व मे॥',
    transliteration: 'Samudravasane Devi Parvatastanamandale. Vishnupatni Namastubhyam Padasparsham Kshamasva Me.',
    translation_hindi: 'हे समुद्र रूपी वस्त्रों को धारण करने वाली, पर्वतों रूपी वक्षस्थल वाली, भगवान श्रीविष्णु की पत्नी माता पृथ्वी! आपको नमस्कार है; मेरे द्वारा पाँव रखने का अपराध क्षमा करें।',
    translation_english: 'O Mother Earth, clothed by the oceans, adorned with mountain ranges, consort of Vishnu! Salutations unto You; forgive the touch of my feet as I step upon You today.',
    category_id: 6
  },
  {
    name: 'Snana Mantra (स्नान मन्त्र)',
    sanskrit_text: 'गङ्गे च यमुने चैव गोदावरि सरस्वति। नर्मदे सिन्धु कावेरि जलेऽस्मिन् सन्निधिं कुरु॥',
    transliteration: 'Gange Cha Yamune Chaiva Godavari Sarasvati. Narmade Sindhu Kaveri Jalesmin Sannidhim Kuru.',
    translation_hindi: 'हे गंगा, यमुना, गोदावरी, सरस्वती, नर्मदा, सिन्धु और कावेरी पवित्र नदियों! आप सभी इस स्नान-जल में उपस्थित होकर इसे परम पावन बना दें।',
    translation_english: 'O sacred waters of Ganga, Yamuna, Godavari, Saraswati, Narmada, Sindhu and Kaveri! Please abide in this bath water and sanctify my body and spirit.',
    category_id: 6
  },
  {
    name: 'Deepa Jyoti Mantra (दीप दर्शन मन्त्र)',
    sanskrit_text: 'शुभं करोति कल्याणमारोग्यं धनसम्पदाम्। शत्रुबुद्धिविनाशाय दीपज्योतिर्नमोऽस्तु ते॥',
    transliteration: 'Shubham Karoti Kalyanam Aarogyam Dhanasampadam. Shatrubuddhivinashaya Deepajyotir Namostu Te.',
    translation_hindi: 'शुभ करने वाली, कल्याण, आरोग्य और धन-सम्पदा देने वाली तथा मन के दुर्विचारों (शत्रु-बुद्धि) का नाश करने वाली दीपज्योति को मेरा नमस्कार है।',
    translation_english: 'Salutations to the luminous light of the lamp, which brings auspiciousness, well-being, health, and abundant wealth, and dispels negative and adversarial thoughts.',
    category_id: 6
  },
  {
    name: 'Bhojana Mantra (भोजन मन्त्र)',
    sanskrit_text: 'ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्। ब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥',
    transliteration: 'Brahmarpanam Brahma Havir Brahmagnau Brahmana Hutam. Brahmaiva Tena Gantavyam Brahmakarmasamadhina.',
    translation_hindi: 'अर्पण ब्रह्म है, हविष्य ब्रह्म है, ब्रह्म रूपी अग्नि में ब्रह्म द्वारा आहुति दी जा रही है। जो कर्म में ब्रह्म को ही देखता है, वह ब्रह्म को ही प्राप्त होता है।',
    translation_english: 'The offering is Brahman, the oblation is Brahman, poured by Brahman into the sacrificial fire of Brahman. One who perceives Brahman in every action attains Brahman alone.',
    category_id: 6
  },
  {
    name: 'Sarve Bhavantu Sukhinah (विश्व शान्ति पाठ)',
    sanskrit_text: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः। सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्॥ ॐ शान्तिः शान्तिः शान्तिः॥',
    transliteration: 'Sarve Bhavantu Sukhinah Sarve Santu Niramayah. Sarve Bhadrani Pashyantu Ma Kashchid Duhkhabhag Bhavet. Om Shantih Shantih Shantih.',
    translation_hindi: 'सभी सुखी हों, सभी रोगमुक्त (स्वस्थ) हों, सभी का कल्याण हो और कोई भी दुःख का भागी न बने। ॐ त्रिविध तापों की शान्ति हो।',
    translation_english: 'May all beings be happy, may all be free from illness. May all behold what is auspicious and good, and may no one suffer grief. Om Peace, Peace, Peace.',
    category_id: 6
  },
  {
    name: 'Shayan Mantra (शयन / रात्रि मन्त्र)',
    sanskrit_text: 'अच्युताय नमः अनन्ताय नमः गोविन्दाय नमः। जले रक्षतु नारायणः स्थले रक्षतु माधवः॥',
    transliteration: 'Achyutaya Namah Anantaya Namah Govindaya Namah. Jale Rakshatu Narayanah Sthale Rakshatu Madhavah.',
    translation_hindi: 'अच्युत, अनन्त और गोविन्द को नमन। जल में नारायण मेरी रक्षा करें और थल पर माधव मेरी रक्षा करें; सुखद निद्रा प्रदान करें।',
    translation_english: 'Salutations to Achyuta, Ananta, and Govinda. May Narayana protect in water and Madhava protect on land; grant peaceful and holy rest.',
    category_id: 6
  }
];

fs.writeFileSync(path.join(__dirname, 'temp_kavachas.json'), JSON.stringify(kavachas, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'temp_ashtakams.json'), JSON.stringify(ashtakams, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'temp_chalisas.json'), JSON.stringify(chalisas, null, 2), 'utf8');
fs.writeFileSync(path.join(__dirname, 'temp_nitya.json'), JSON.stringify(nitya_mantras, null, 2), 'utf8');

console.log('All remaining canonical modules generated successfully!');
