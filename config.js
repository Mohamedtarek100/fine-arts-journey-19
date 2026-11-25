/**
 * =========================================================================
 *  ملف الإعدادات السهل — Easy Personalization Config
 *  عدّل الاسم، التواريخ، الجمل، حقوق النشر، ومسارات الصور من هنا فقط!
 *  Edit her name, captions, copyright, and image paths right here.
 * =========================================================================
 */

export const SITE_CONFIG = {
  // 1. الاسم والتفاصيل الأساسية (غيّر "الفنانة" لاسمها الحقيقي مثل: "مريم" أو "سلمى")
  artistName: "الفنانة",
  artistNameEn: "The Young Artist",
  birthdayDateAr: "5 ديسمبر",
  birthdayDateEn: "5 DECEMBER",
  age: 19,
  ageRoman: "XIX",
  yearLabel: "العام التاسع عشر",

  // توقيع محترم وراقي يليق بالعائلة
  signatureAr: "بكل فخر وتقدير لموهبتكِ وطموحكِ — مع أطيب التمنيات بعامٍ سعيد ومستقبل مشرق",
  signatureEn: "Crafted with pride for a bright artistic future",

  // حقوق النشر الاحترافية
  copyright: {
    year: "2026",
    ownerAr: "معرض رحلة العام التاسع عشر — 5 ديسمبر",
    rightsAr: "جميع الحقوق محفوظة © 2026 • تجربة فنية ثلاثية الأبعاد وموشن جرافيك مُصمَّمة خصيصاً للاحتفاء برحلة الموهبة والطموح.",
    rightsEn: "ALL RIGHTS RESERVED • INTERACTIVE 3D FINE ARTS EXHIBITION • EDITION XIX",
    creditAr: "تصميم وتطوير بـ Three.js WebGL & Motion Graphics",
  },

  // 2. شاشة الافتتاحية (Hero)
  hero: {
    eyebrowEn: "3D INTERACTIVE EXHIBITION XIX  •  5 DECEMBER",
    badgeAr: "5 ديسمبر  •  إتمام العام التاسع عشر",
    titlePrefixAr: "رحلة",
    subtitleAr:
      "تسعة عشر عاماً من النور والموهبة والخطوات الواثقة.. من أول ألوان الطفولة، وصولاً إلى محطة تالتة ثانوي، وعلى بُعد خطوةٍ واحدة فقط من حلم كلية الفنون الجميلة.",
    ctaAr: "ابدئي الرحلة ثلاثية الأبعاد",
    ctaEn: "ENTER THE 3D ATELIER",
    guideBtnAr: "كيفية التعامل مع الموقع",
  },

  // 3. تعليمات كيفية التعامل مع الموقع (Exhibition Visitor Guide)
  guide: {
    eyebrowEn: "EXHIBITION VISITOR GUIDE • HOW TO EXPLORE",
    titleAr: "دليل التعامل مع المعرض ثلاثي الأبعاد",
    subtitleAr: "أربع خطوات بسيطة للاستمتاع بكل تفاصيل الـ 3D والموشن جرافيك والتفاعل داخل الموقع",
    steps: [
      {
        num: "01",
        icon: "scroll",
        titleAr: "التمرير السينمائي (Scroll)",
        titleEn: "3D Camera Journey",
        descAr: "مرّري للأسفل بهدوء لتتحرك الكاميرا ثلاثية الأبعاد تلقائياً عبر فصول الرحلة من الطفولة حتى بوابة الفنون الجميلة.",
      },
      {
        num: "02",
        icon: "orbit",
        titleAr: "تحريك وتدوير الـ 3D",
        titleEn: "Interactive 3D Orbit",
        descAr: "حرّكي الماوس أو اسحبي على الخلفية لتدوير المشاهد الـ 3D، ومرّري فوق اللوحات والبطاقة الذهبية لرؤية عمقها ثلاثي الأبعاد.",
      },
      {
        num: "03",
        icon: "touch",
        titleAr: "لمسات ومفاجآت تفاعلية",
        titleEn: "Interactive Exhibits",
        descAr: "افتحي مظروف التشجيع في فصل تالتة ثانوي، اضغطي على أي لوحة لتكبيرها، وارسمي توقيعكِ على لوحة العام الـ 19 واحفظيها.",
      },
      {
        num: "04",
        icon: "sound",
        titleAr: "الموسيقى والـ 19 شمعة",
        titleEn: "Audio & 19 Candles",
        descAr: "شغّلي موسيقى الأتيليه الهادئة من الشريط العلوي، وفي الخاتمة اضغطي إطفاء الـ 19 شمعة لإطلاق شرارات الذهب وكشف التهنئة.",
      },
    ],
  },

  // 4. قسم: أين هي الآن وما هو الهدف (Current Stage -> One Step to Fine Arts Goal)
  horizonGoal: {
    eyebrowEn: "CURRENT MILESTONE  →  THE ONE-STEP HORIZON",
    titleAr: "أين تقف الآن.. وإلى أين يتجه الحلم",
    subtitleAr:
      "رحلة تسعة عشر عاماً تلتقي اليوم عند أهم محطة؛ سنة تالتة ثانوي هي الجسر الأخير، وعلى بُعد خطوةٍ واحدة فقط تُفتح بوابة كلية الفنون الجميلة.",
    progressPercent: 90,
    stepsRemainingLabel: "خطوة واحدة فقط تفصل الحلم عن الحقيقة",
    currentStage: {
      badgeAr: "المحطة الحالية الآن • 5 ديسمبر",
      badgeEn: "CURRENT STAGE • NOW",
      titleAr: "الصف الثالث الثانوي (تالتة ثانوي)",
      ageTagAr: "العام التاسع عشر • مرحلة الإنجاز",
      descAr:
        "مرحلة التركيز، الاجتهاد، وإثبات الذات. كل ساعة مذاكرة وتعب هذا العام تبني الجسر الآمن نحو المستقبل الذي تحلمين به وتستحقينه.",
      highlightsAr: [
        "مثابرة وتركيز في عام التحدي الأهم",
        "الحفاظ على روح الفنانة وشغف الإبداع",
        "ثقة كاملة من العائلة في التفوق والنجاح",
      ],
    },
    goalStage: {
      badgeAr: "الهدف القادم بإذن الله",
      badgeEn: "THE GOAL • NEXT HORIZON",
      titleAr: "كلية الفنون الجميلة",
      titleEn: "Faculty of Fine Arts",
      descAr:
        "حيث تتحول الموهبة الفطرية إلى دراسة أكاديمية راقية، وأتيليه حقيقي، ولوحات ومعارض تحمل اسمكِ وتعبّر عن رؤيتكِ الفنية الفريدة.",
      milestonesAr: [
        { code: "01", label: "إنهاء تالتة ثانوي بتفوق وثقة" },
        { code: "02", label: "اجتياز امتحان قدرات الفنون الجميلة بإبداع" },
        { code: "03", label: "الخطوة الأولى داخل قاعات كلية الفنون الجميلة" },
      ],
    },
    timelineNodes: [
      { label: "البدايات والطفولة", state: "done" },
      { label: "اكتشاف شغف الفن", state: "done" },
      { label: "تالتة ثانوي (الآن)", state: "current" },
      { label: "كلية الفنون الجميلة", state: "goal" },
    ],
  },

  // 5. فصول الرحلة الأربعة (يمكنك تبديل أي صورة بوضع صورتها في assets/photos/ وتغيير المسار هنا)
  chapters: [
    {
      id: "childhood",
      number: "01",
      eraAr: "الفصل الأول • البدايات",
      titleAr: "من أول الألوان والخطوط",
      titleEn: "The First Colors of Childhood",
      yearTag: "الطفولة • Childhood",
      storyAr:
        "كل قصة عظيمة تبدأ بلمعة فضول صغيرة، وبأيدٍ بريئة تكتشف العالم بالألوان قبل الكلمات. منذ الصغر، كان واضحاً أن نظرتكِ للتفاصيل مختلفة؛ ترين الجمال في الأشياء البسيطة، وتصنعين من كل ورقة بيضاء عالماً مليئاً بالحياة والبهجة.",
      quoteAr: "«الفنان الحقيقي يُولد بعينٍ ترى النور في أبسط التفاصيل»",
      image: "./assets/art/chapter1-childhood.jpg",
      captionAr: "البدايات الأولى — حيث بدأت حكاية الألوان",
      captionEn: "ARCHIVE I — EARLY BEGINNINGS",
    },
    {
      id: "passion",
      number: "02",
      eraAr: "الفصل الثاني • الشغف",
      titleAr: "حين وجد الفن طريقه إليكِ",
      titleEn: "Where Art Found Its Voice",
      yearTag: "الشغف • The Spark",
      storyAr:
        "مع مرور السنين، لم يكن الرسم مجرد هواية عابرة في وقت الفراغ، بل تحوّل إلى لغةٍ صادقة تعبّرين بها عن إحساسكِ ورؤيتكِ للحياة. بين الرصاص والفحم والألوان، كبرت الموهبة بهدوءٍ وإصرار، وأصبح كل خطٍ ترسمينه يحمل بصمتكِ الخاصة وذوقكِ الراقي.",
      quoteAr: "«الفن ليس ما تراه العين فقط، بل ما تجعلين الآخرين يشعرون به»",
      image: "./assets/art/chapter2-passion.jpg",
      captionAr: "الأتيليه — مساحة الشغف والخطوط الصادقة",
      captionEn: "ARCHIVE II — THE ARTISTIC SOUL",
    },
    {
      id: "thanaweya",
      number: "03",
      eraAr: "الفصل الثالث • المحطة الحالية",
      titleAr: "تالتة ثانوي.. الجسر نحو الحلم",
      titleEn: "The Bridge Year — Strength & Grace",
      yearTag: "الآن • تالتة ثانوي",
      storyAr:
        "اليوم وأنتِ تتمين عامكِ التاسع عشر في محطة تالتة ثانوي، قد تبدو الأيام مزدحمة بالكتب والمذاكرة والضغط، لكنها ليست مجرد سنة دراسية؛ إنها الجسر الذي سيعبر بكِ إلى المكان الذي تنتمين إليه. كل ساعة تعبٍ ومثابرة اليوم هي لونٌ جديد تضيفينه للوحة مستقبلكِ.",
      quoteAr: "«الأحلام الكبيرة تحتاج إلى خطواتٍ ثابتة.. وأنتِ أهلٌ لها وبقوة»",
      image: "./assets/art/chapter3-thanaweya.jpg",
      captionAr: "ليالي الاجتهاد — حيث يُصنع المستقبل بهدوء",
      captionEn: "ARCHIVE III — PERSEVERANCE",
      encouragementTitleAr: "رسالة تشجيع لسنة تالتة ثانوي",
      encouragementBodyAr:
        "لا تدعي ضغط الأيام ينسيكِ كم أنتِ مجتهدة وموهوبة. خذي نفساً عميقاً في كل مرة تشعرين فيها بالتعب، وتذكري أن الله لا يضيع أجر من أحسن عملاً. عائلتكِ وكل من يعرفكِ يثقون بقدرتكِ ويفخرون بإصراركِ، وقريباً جداً ستفرحين بالنتيجة التي تليق بتعبكِ وحلمكِ.",
    },
    {
      id: "fine-arts",
      number: "04",
      eraAr: "الفصل الرابع • الهدف والحلم",
      titleAr: "بوابة كلية الفنون الجميلة",
      titleEn: "Faculty of Fine Arts — The Horizon",
      yearTag: "الهدف القادم • قريباً بإذن الله",
      storyAr:
        "هناك مكانٌ يشبهكِ وينتظركِ على بُعد خطوةٍ واحدة.. قاعاتٌ واسعة يدخلها ضوء الشمس، لوحاتٌ كبيرة، تماثيل كلاسيكية، وخطواتٌ واثقة نحو امتحان القدرات ثم أول يومٍ لكِ كطالبةٍ في كلية الفنون الجميلة. حلمكِ ليس بعيداً؛ إنه يقف أمامكِ مباشرةً وينتظر اجتهادكِ هذا العام.",
      quoteAr: "«المستقبل يبتسم لمن يمتلكون شغفاً حقيقياً وإرادةً لا تلين»",
      image: "./assets/art/chapter4-fine-arts.jpg",
      captionAr: "حيث تلتقي الموهبة بالدراسة — كلية الفنون الجميلة",
      captionEn: "ARCHIVE IV — FACULTY OF FINE ARTS",
    },
  ],

  // 6. بطاقة الحلم التفاعلية (Future Fine Arts Pass)
  dreamPass: {
    institutionAr: "كلية الفنون الجميلة",
    institutionEn: "FACULTY OF FINE ARTS",
    subtitleAr: "بطاقة الحلم القادم — بإذن الله",
    statusAr: "خطوة واحدة نحو التحقيق • بالتفوق والإبداع",
    batchAr: "دفعة المستقبل المشرق",
    serialNo: "FA-2026-19-DEC05",
  },

  // 7. معرض اللوحات التفاعلي (يمكنك إضافة رسوماتها الحقيقية هنا بسهولة!)
  gallery: [
    {
      titleAr: "نور البدايات",
      titleEn: "Light of Beginnings",
      year: "الفصل الأول",
      mediumAr: "ألوان مائية وذكريات",
      descriptionAr: "لمحة دافئة عن أول شغف بالألوان والخطوط في سنوات الطفولة.",
      image: "./assets/art/chapter1-childhood.jpg",
    },
    {
      titleAr: "روح الأتيليه",
      titleEn: "Soul of the Atelier",
      year: "الفصل الثاني",
      mediumAr: "زيت وفحم على كانفاس",
      descriptionAr: "تأمل فني في الأدوات التي تحوّل الخيال إلى لوحة ملموسة.",
      image: "./assets/art/chapter2-passion.jpg",
    },
    {
      titleAr: "أمل تحت النجوم",
      titleEn: "Hope Under the Stars",
      year: "تالتة ثانوي",
      mediumAr: "انطباعية ليلية دافئة",
      descriptionAr: "لحظات الاجتهاد الهادئة التي تمهّد الطريق نحو القمة.",
      image: "./assets/art/chapter3-thanaweya.jpg",
    },
    {
      titleAr: "قاعة الفنون الجميلة",
      titleEn: "Hall of Fine Arts",
      year: "الهدف القادم",
      mediumAr: "عمارة ونور كلاسيكي",
      descriptionAr: "المكان الذي يستحق موهبتكِ وشغفكِ.. على بُعد خطوة واحدة بإذن الله.",
      image: "./assets/art/chapter4-fine-arts.jpg",
    },
  ],

  // 8. الخاتمة — تهنئة عيد الميلاد الـ 19 (5 ديسمبر)
  finale: {
    eyebrowEn: "5 DECEMBER  •  HAPPY 19TH BIRTHDAY",
    titleAr: "كل عامٍ وأنتِ بخير وتألق",
    subtitleAr: "19 عاماً من الجمال، والأجمل على بُعد خطوة واحدة",
    buttonAr: "تمنّي أمنية وأطفئي الـ 19 شمعة ✨",
    buttonAfterAr: "أعيدي إشعال الشموع الذهبية ✨",
    wishHeadingAr: "عامكِ التاسع عشر.. عام تحقيق الأحلام بإذن الله",
    wishMessageAr:
      "في الخامس من ديسمبر، نتمنى لكِ عاماً مليئاً بالصحة والسكينة والنجاح الباهر. سنةٌ جديدة تُفتح فيها أمامكِ أبواب التوفيق في تالتة ثانوي، وتكلّل بتحقيق حلمكِ في كلية الفنون الجميلة، لتظلي دائماً مصدر فخرٍ وبهجةٍ لكل عائلتكِ. كل سنة وأنتِ طيبة وبألف خير يا فنانة.",
  },
};
