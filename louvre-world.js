/**
 * =========================================================================
 *  600M OPEN-WORLD PARIS BOULEVARD & MUSÉE DU LOUVRE 3D ENGINE (v26)
 *  - Zero Ground Z-Fighting: Strictly non-overlapping Z zones + polygonOffset
 *  - 525m+ Living Paris Metropolis: Arc de Triomphe, Champs-Élysées, Galeries
 *    Paris Luxury Mall, Apartments & Real Estate, Police Precinct, Metro Arch,
 *    128m Eiffel Tower Vista, 3 Working Traffic Light Intersections & 5 Real
 *    CC0 Kenney 3D Vehicles (Police w/ Flashing Strobes, Taxi, Sedans, SUV)
 *  - Dual Custom 3D Tour Guides:
 *      * القطة بوبس (40-Bone Golden Persian Cat) for family guests
 *      * أنس حبيب (Custom Curly-Hair & Striped-Jersey Mocap Guide) for يوسف
 *  - True Pause-and-Explain Guided Tour State Machine (walking -> explaining)
 *  - Live Paris Weather (Clear / Rain + Wet Road Shimmer / Spring Petals),
 *    Boulevard Express Cruise, 19 Sky Lanterns, Eiffel Sparkle Show & 5 Seals
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import * as SkeletonUtils from './vendor/SkeletonUtils.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';
import {
  loadRealPBRSet,
  createGlowTexture,
  createLightBeamTexture,
  createCloudTexture,
  createParisAsphaltRoadTexture,
  createHaussmannFacadePBR,
  createModernApartmentTowerPBR,
  createParisMallFacadePBR,
  createDistrictSignTexture,
  createAnasJerseyTexture,
  createGuideBadgeTexture,
  createLouvrePalacePBR,
  createMansardRoofPBR,
  createEiffelLatticeTexture,
  createTreeFoliageTexture,
  createLouvreWallPanelPBR,
  createParchmentTexture,
  createUVSecretOverlayTexture,
  createDefaultCustomLouvreCanvas,
  createLouvreSignTexture,
  createPawPrintTexture,
} from './louvre-assets.js?v=26';

export const STORY_WAYPOINTS = [
  {
    id: 'champs-elysees',
    zoneAr: 'الشانزليزيه • بداية جولة الـ 500 متر',
    labelAr: 'شارع الشانزليزيه وقوس النصر',
    x: 0, z: 378, guideX: -1.4, guideZ: 374, lookAtX: -12, lookAtY: 16, lookAtZ: 220,
    bobsSlides: [
      'أهلاً بك في قلب باريس، أنا القطة بوبس وسأرافقك خطوة بخطوة في جولة حقيقية بطول أكثر من 500 متر حتى قاعات متحف اللوفر.',
      'انظر حولك: خلفك قوس النصر، وأمامك بوليفارد الشانزليزيه بالسيارات وإشارات المرور الحية، وبرج إيفل يرتفع شامخاً في الأفق الغربي ليرافقنا طول الطريق.',
    ],
    anasSlides: [
      'أهلاً يا يوسف يا بطل، أنا أنس حبيب المرشد السياحي الخاص بك اليوم في باريس عشان نعمل أجمل جولة لعيد ميلاد يمنى الـ 19.',
      'خلفنا قوس النصر وقدامنا طريق باريس كله بالعربيات وإشارات المرور الحقيقية وبرج إيفل باين في السما. لما تخلص فرجة اضغط أكمل الجولة عشان نتحرك للمول.',
    ],
    funFactAr: 'معلومة باريسية: يمتد المحور التاريخي الشهير في باريس في خط مستقيم من قوس النصر عبر الشانزليزيه وحتى هرم متحف اللوفر.',
  },
  {
    id: 'paris-mall',
    zoneAr: 'حي التسوق والعقارات الباريسية',
    labelAr: 'جاليري باريس مول والعقارات الفاخرة',
    x: 2.2, z: 282, guideX: 3.4, guideZ: 278.5, lookAtX: 32, lookAtY: 9, lookAtZ: 285,
    bobsSlides: [
      'توقفنا هنا أمام «جاليري باريس مول» بقبته الزجاجية وواجهاته المضيئة، وحوله العمارات السكنية الباريسية والشقق الفاخرة ذات الشرفات الحديدية.',
      'لاحظ كيف تتوقف السيارات أمام إشارة المرور الحمراء في التقاطع وتتحرك بسلاسة فور إضاءة اللون الأخضر. كل تفصيلة هنا صُمّمت لتعيش أجواء باريس الحقيقية.',
    ],
    anasSlides: [
      'بص على يمينك يا يوسف: ده «جاليري باريس مول» بالقبة الزجاجية بتاعته، وقدامه الشقق والعقارات الباريسية الفاخرة والكافيهات.',
      'وركز في تقاطع الإشارات هنا، العربيات والتاكسيات بتقف أول ما الإشارة تحمر وتمشي لما تخضر. جاهز نكمل ناحية ميدان الكونكورد وشرطة باريس؟',
    ],
    funFactAr: 'معلومة معمارية: تتميز شقق باريس الهوسمانية بشرفات الحديد المشغول وأسقف الزنك المائلة التي تمنح المدينة هويتها الفريدة.',
  },
  {
    id: 'police-plaza',
    zoneAr: 'ميدان الكونكورد • شرطة باريس',
    labelAr: 'ميدان الكونكورد وقسم شرطة باريس',
    x: -2.2, z: 174, guideX: -3.4, guideZ: 170.5, lookAtX: -30, lookAtY: 7, lookAtZ: 170,
    bobsSlides: [
      'وصلنا إلى ميدان الكونكورد حيث يتمركز قسم شرطة باريس الوطني ودوريات الشرطة بأضوائها الحمراء والزرقاء لتنظيم حركة البوليفارد.',
      'من هنا أيضاً يقترب برج إيفل بوضوح ساحر على يسارك. يمكنك استخدام عدسة التقريب البصري لتأمل تفاصيله الهندسية الدقيقة.',
    ],
    anasSlides: [
      'هنا ميدان الكونكورد وقسم شرطة باريس على شمالك، وعربيات البوليس بتلف في الشارع بفلاشرها الأحمر والأزرق.',
      'ومن النقطة دي بالذات برج إيفل بقى واضح جداً قدامنا. لو حابب تشغّل عرض أضواء برج إيفل من قائمة الأحداث هيعجبك جداً قبل ما نكمل للوفر.',
    ],
    funFactAr: 'معلومة سياحية: يتجاوز ارتفاع برج إيفل 300 متر، ويتلألأ بآلاف المصابيح الذهبية كل مساء ليضيء سماء باريس.',
  },
  {
    id: 'rivoli-cafes',
    zoneAr: 'شارع ريفولي • مترو باريس',
    labelAr: 'شارع ريفولي ومترو باريس وبرج إيفل',
    x: 0, z: 68, guideX: -1.4, guideZ: 64.2, lookAtX: -18, lookAtY: 14, lookAtZ: 28,
    bobsSlides: [
      'هنا شارع ريفولي العريق بمدخل مترو باريس الأخضر التاريخي والمقاهي الدافئة، ولم يتبقَّ سوى خطوات قليلة حتى بوابة متحف اللوفر.',
      'تأمل الإطلالة المفتوحة على هرم اللوفر الزجاجي أمامك وبرج إيفل على يسارك. عند استعدادك اضغط لنعبر معاً إلى ساحة نابليون.',
    ],
    anasSlides: [
      'وصلنا شارع ريفولي ومدخل مترو باريس التاريخي، وكده فاضل لنا خطوات بسيطة ونكون قدام هرم متحف اللوفر مباشرة.',
      'الجو هنا حكاية بين الكافيهات والناس اللي بتتمشى في الشارع. يلا بينا ندخل ساحة نابليون ونجرب نافورة الأمنيات.',
    ],
    funFactAr: 'لمسة فنية: صُممت بوابات مترو باريس بأسلوب الفن الجديد «آرت نوفو» لتتحول شوارع المدينة نفسها إلى متحف مفتوح.',
  },
  {
    id: 'pyramid',
    zoneAr: 'ساحة نابليون • بوابة اللوفر',
    labelAr: 'ساحة نابليون، النافورة وبوابة الهرم',
    x: 0, z: 18, guideX: 0.4, guideZ: 14.5, lookAtX: 0, lookAtY: 5.5, lookAtZ: 6, interactId: 'fountain',
    bobsSlides: [
      'مرحباً بك في ساحة نابليون أمام الهرم الزجاجي الأيقوني لمتحف اللوفر. على يمينك نافورة الأمنيات الذهبية، وعلى يسارك أول ختم مخفي في التحدي.',
      'ألقِ عملة أمنية ليمنى في النافورة أو أطلق 19 فانوساً في سماء باريس، وعند الاقتراب من الهرم ستنفتح أبوابه الزجاجية تلقائياً لنعبر إلى القاعة الكبرى.',
    ],
    anasSlides: [
      'أهلاً بيك يا يوسف في ساحة هرم اللوفر الزجاجي. قبل ما ندخل القاعة الكبرى تقدر ترمي عملة أمنية ليمنى في النافورة على يمينك وتجمع الختم الذهبي على شمالك.',
      'وأول ما نقرب من باب الهرم الزجاجي هيفتح أوتوماتيك قدامنا عشان نبدأ رحلة قصة يمنى جوه المتحف.',
    ],
    funFactAr: 'معلومة عن اللوفر: يتكون هرم اللوفر الزجاجي الشهير من مئات الألواح الزجاجية المتماسكة بإطار معدني دقيق يعكس سماء باريس.',
  },
  {
    id: 'artifact-1',
    zoneAr: 'القاعة الكبرى • الجناح الأول',
    labelAr: 'التحفة 01 • البدايات والطفولة',
    x: -1.4, z: -19, guideX: -2.4, guideZ: -20.2, lookAtX: -6.5, lookAtY: 2.6, lookAtZ: -20, interactId: 'childhood',
    bobsSlides: [
      'دخلنا القاعة الكبرى لمتحف اللوفر، وهنا تقف التحفة الأولى في حكاية يمنى: «البدايات والطفولة» حيث وُلد حب الألوان والخطوط منذ الصغر.',
      'افتح الورقة الذهبية لاستعراض تفاصيل اللوحة والقصة، وجرّب عدسة الأسرار UV لتقرأ الرسالة السرية المضيئة فوق اللوحة.',
    ],
    anasSlides: [
      'جوه القاعة الكبرى دلوقتي يا يوسف، ودي أول تحفة في معرض يمنى: «البدايات والطفولة» اللي بدأت منها موهبتها في الرسم.',
      'اضغط على زر الاستكشاف عشان تفتح الورقة الذهبية وتقرأ الحكاية كاملة، وبعدها نكمل على المرسم الحي.',
    ],
    funFactAr: 'تلميح القيّم الفني: شغّل «عدسة الأسرار UV» من الشريط العلوي لتكشف رسائل خفية مضيئة على جميع اللوحات الأربع.',
  },
  {
    id: 'easel',
    zoneAr: 'القاعة الكبرى • مرسم الزوار الحي',
    labelAr: 'مرسم الزوار • علّق لوحتك باللوفر',
    x: 1.8, z: -26.8, guideX: 2.5, guideZ: -27.8, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -27, interactId: 'easel',
    bobsSlides: [
      'توقفنا أمام الحامل الذهبي لمرسم اللوفر التفاعلي. هنا لا تكتفي بالمشاهدة فقط، بل يمكنك أن تكون فناناً داخل المتحف.',
      'افتح المرسم وارسم زخرفة متماثلة أو اختم تهنئة تذكارية ليمنى، وستُعلّق لوحتك فوراً داخل الإطار الباروكي الذهبي على جدار اللوفر أمامك.',
    ],
    anasSlides: [
      'دي محطة جامدة جداً يا يوسف: الحامل الذهبي ده بيخليك ترسم أو توقّع لوحة تذكارية ليمنى وتلاقيها اتعلّقت فوراً على جدار متحف اللوفر بالـ 3D.',
      'جرّب افتح المرسم وارسم لمستك وعلّقها على الحائط، ولما تخلص اضغط نكمل للمحطة اللي بعدها.',
    ],
    funFactAr: 'ميزة تفاعلية: تُحفظ لوحتك المرسومة تلقائياً على جهازك وتظل معلّقة داخل الإطار الذهبي على جدار اللوفر.',
  },
  {
    id: 'artifact-2',
    zoneAr: 'القاعة الكبرى • جناح الأتيليه',
    labelAr: 'التحفة 02 • روح الأتيليه والشغف',
    x: 1.4, z: -34, guideX: 2.4, guideZ: -35.2, lookAtX: 6.5, lookAtY: 2.6, lookAtZ: -34, interactId: 'passion',
    bobsSlides: [
      'هنا التحفة الثانية: «روح الأتيليه والشغف»، حيث يتحول الرسم من هواية جميلة إلى هوية فنية تنضج بالهدوء والصبر والتمرين اليومي.',
      'تأمل المجسم الهندسي المذهب واللوحة المعلقة على اليمين، وافتح بطاقة التحفة لقراءة قصتها الكاملة.',
    ],
    anasSlides: [
      'المحطة دي بتحكي عن شغف يمنى الحقيقي بالرسم والأتيليه، إزاي الموهبة لما بتتغذّى بحب كل يوم بتكبر وتبقى أسلوب حياة.',
      'افتح تفاصيل التحفة دي واتفرج على اللوحة، وهتلاقي قريب منها ختم ذهبي مخفي لو دورت كويس.',
    ],
    funFactAr: 'حكمة فنية: الفنان الحقيقي لا ينتظر الإلهام فحسب، بل يصنعه بحبّه للتجربة والعمل اليومي الهادئ.',
  },
  {
    id: 'artifact-3',
    zoneAr: 'القاعة الكبرى • محطة الثبات',
    labelAr: 'التحفة 03 • تالتة ثانوي وبداية الطريق',
    x: -1.4, z: -48, guideX: -2.4, guideZ: -49.2, lookAtX: -6.5, lookAtY: 2.6, lookAtZ: -48, interactId: 'thanaweya',
    bobsSlides: [
      'أمامنا الساعة الرملية الذهبية التي ترمز لمحطة تالتة ثانوي: مرحلة عابرة يمر بها الإنسان بثقة وهدوء بينما يظل الشغف أكبر من أي رقم.',
      'افتح هذه التحفة لقراءة رسالة الطمأنينة المختومة والمخصّصة ليمنى في هذه السنة المهمة.',
    ],
    anasSlides: [
      'محطة تالتة ثانوي يا يوسف.. الساعة الرملية الذهبية دي بتفكّرنا إن السنة دي مجرد جسر قصير بيعدي، ودورنا كعيلة وإخوات نكون سند وهدوء ليمنى طول الطريق.',
      'افتح الورقة الذهبية هنا عشان تقرأ رسالة الطمأنينة المكتوبة لها.',
    ],
    funFactAr: 'تذكير مهم: الهدوء النفسي وتشجيع العائلة يمنحان الطالب طاقة أكبر بكثير من القلق أو الضغط.',
  },
  {
    id: 'artifact-4',
    zoneAr: 'القاعة الكبرى • أفق الفنون الجميلة',
    labelAr: 'التحفة 04 • تمثال الرخام وحلم الفنون الجميلة',
    x: 1.4, z: -62, guideX: 2.4, guideZ: -63.2, lookAtX: 6.5, lookAtY: 2.6, lookAtZ: -62, interactId: 'fine-arts',
    bobsSlides: [
      'وصلنا إلى المنحوتة الكلاسيكية من رخام كارارا وبوابة الأفق القادم: كلية الفنون الجميلة، حيث تتلاقى الموهبة مع الدراسة الأكاديمية.',
      'استعرض بطاقة الحلم الرسمية المخصّصة للفنانة يمنى، ثم ننتقل معاً إلى قلب المتحف: صندوق العائلة والرسالة الأهم.',
    ],
    anasSlides: [
      'هنا المنحوتة الكلاسيكية وحلم كلية الفنون الجميلة بإذن الله. افتح بطاقة الحلم الرسمية ليمنى وشوف تفاصيلها.',
      'فاضل محطتين بس في الجولة: صندوق رسائل العيلة السحابي والرسالة الأهم، وبعدها مفاجأة القبة الملكية وتورتة الـ 19.',
    ],
    funFactAr: 'تلميح القاعة: لا تنسَ تفقد الأختام الذهبية الخمسة المخفية للحصول على وسام أمينة متحف اللوفر الشرفي.',
  },
  {
    id: 'vault-manifesto',
    zoneAr: 'قلب المتحف • الصندوق والمسلّة',
    labelAr: 'صندوق العيلة والرسالة الأهم ★',
    x: 0, z: -74, guideX: -1.6, guideZ: -75.2, lookAtX: 0, lookAtY: 2.0, lookAtZ: -75, interactId: 'vault',
    bobsSlides: [
      'على يسارك صندوق رسائل العائلة السحابي المتصل لحظياً، حيث تصل كل تهنئة يكتبها الأهل إلى يمنى مباشرة داخل المتحف.',
      'وعلى يمينك مسلّة «الرسالة الأهم» التي يهمّنا أن يقرأها الجميع بتركيز في ختام هذه الرحلة مع كبسولة الطمأنينة اليومية.',
    ],
    anasSlides: [
      'وصلنا أهم وقفة في المتحف يا يوسف: على شمالك صندوق رسائل العيلة اللي تقدر تبعت فيه رسالتك ليمنى وتوصل لها فوراً، وعلى يمينك مسلّة الرسالة الأهم لكل العيلة.',
      'افتح الصندوق واكتب كلمتك الحلوة ليمنى، واقرأ الرسالة الأهم قبل ما ندخل تحت القبة الملكية.',
    ],
    funFactAr: 'رسالة سحابية: أي رسالة يرسلها فرد من العائلة تُحفظ لحظياً في صندوق يمنى وتظهر لها فور فتح المتحف.',
  },
  {
    id: 'cake',
    zoneAr: 'القبة الملكية • ختام العام التاسع عشر',
    labelAr: 'القبة الملكية وتورتة الـ 19',
    x: 0, z: -87.2, guideX: 2.2, guideZ: -90.4, lookAtX: 0, lookAtY: 2.9, lookAtZ: -93, interactId: 'cake',
    bobsSlides: [
      'وصلنا إلى ختام رحلتنا تحت القبة الملكية لمتحف اللوفر أمام تورتة العام التاسع عشر بشمعتي «1» و«9» المضيئتين.',
      'اضغط للاحتفال وإطفاء الشمعتين بالزر أو بالنفخ في المايكروفون وإطلاق الألعاب النارية وتحميل شهادة فخر العام الـ 19. كل عامٍ ويمنى بخير.',
    ],
    anasSlides: [
      'ختامها مسك يا يوسف تحت القبة الملكية لمتحف اللوفر قدام تورتة الـ 19 بشمعتي 1 و 9.',
      'تقدر تفتح الاحتفال وتولّع الألعاب النارية وتحفظ شهادة الفخر التذكارية ليمنى. شرّفتني جداً في الجولة النهارده يا بطل.',
    ],
    funFactAr: 'الختام الملكي: يمكنك إطفاء شمعتي 1 و 9 بالضغط على الزر أو بالنفخ الحقيقي في مايكروفون جهازك.',
  },
];

export const HIDDEN_SEALS_DATA = [
  { id: 'seal-1', x: 5.4, z: 282, labelAr: 'ختم جاليري باريس مول', quoteAr: 'المدن العظيمة تُلهم العين، والروح الشغوفة تحوّل كل مشهد إلى لوحة.' },
  { id: 'seal-2', x: -5.4, z: 10.6, labelAr: 'ختم ساحة هرم اللوفر', quoteAr: 'كل خطوة هادئة نحو الحلم تصنع أثراً يبقى مدى الحياة.' },
  { id: 'seal-3', x: -6.0, z: -15.5, labelAr: 'ختم ألوان البداية', quoteAr: 'الفن الحقيقي يبدأ بعينٍ تلاحظ الجمال حيث يغفل الآخرون.' },
  { id: 'seal-4', x: -6.0, z: -53.5, labelAr: 'ختم الطمأنينة والثبات', quoteAr: 'ثانوية عامة جسرٌ تعبرينه بهدوءٍ وثقة، وعائلتكِ سندكِ الدائم.' },
  { id: 'seal-5', x: 5.2, z: -90.5, labelAr: 'ختم القبة الملكية', quoteAr: 'عامكِ التاسع عشر بداية إشراقة جديدة نحو كلية الفنون الجميلة.' },
];

const TIME_PRESETS = {
  sunset: {
    labelAr: '🌇 غروب باريس',
    skyTop: 0x162244, skyMid: 0x724058, skyHorizon: 0xf4a05c, sunGlow: 0xffe49e,
    sunColor: 0xffc880, sunIntensity: 2.55, sunPos: new THREE.Vector3(-48, 28, -40),
    hemiSky: 0xffe2be, hemiGround: 0x2c2224, hemiIntensity: 1.2,
    fogColor: 0x2b2029, fogDensity: 0.0018, exposure: 1.08, bloomStrength: 0.34,
    starsOpacity: 0.4, cloudTint: 0xffd2a8, cloudOpacity: 0.56,
    windowEmissive: 0.85, lampOpacity: 0.82, showSun: true, showMoon: false, searchlightOpacity: 0.08,
  },
  day: {
    labelAr: '☀️ نهار باريس',
    skyTop: 0x286bc2, skyMid: 0x6ca6e4, skyHorizon: 0xd9ecfa, sunGlow: 0xfff8e2,
    sunColor: 0xfff4dd, sunIntensity: 3.05, sunPos: new THREE.Vector3(-34, 68, -20),
    hemiSky: 0xeaf4ff, hemiGround: 0x5c5348, hemiIntensity: 1.42,
    fogColor: 0xb7cde0, fogDensity: 0.0011, exposure: 1.02, bloomStrength: 0.2,
    starsOpacity: 0.0, cloudTint: 0xffffff, cloudOpacity: 0.78,
    windowEmissive: 0.12, lampOpacity: 0.14, showSun: true, showMoon: false, searchlightOpacity: 0.0,
  },
  night: {
    labelAr: '🌙 ليل باريس',
    skyTop: 0x050918, skyMid: 0x0f1a38, skyHorizon: 0x262542, sunGlow: 0xaac4ff,
    sunColor: 0x8eaef0, sunIntensity: 0.98, sunPos: new THREE.Vector3(36, 48, -50),
    hemiSky: 0x5571a8, hemiGround: 0x1b1614, hemiIntensity: 0.9,
    fogColor: 0x101426, fogDensity: 0.0021, exposure: 1.16, bloomStrength: 0.46,
    starsOpacity: 0.96, cloudTint: 0x4b5c82, cloudOpacity: 0.32,
    windowEmissive: 1.4, lampOpacity: 1.0, showSun: false, showMoon: true, searchlightOpacity: 0.52,
  },
  gallery: {
    labelAr: '🏛️ أتيليه دافئ',
    skyTop: 0x201512, skyMid: 0x4c2d22, skyHorizon: 0xc28149, sunGlow: 0xffdf99,
    sunColor: 0xffd28e, sunIntensity: 2.25, sunPos: new THREE.Vector3(-24, 44, -35),
    hemiSky: 0xffebd0, hemiGround: 0x332419, hemiIntensity: 1.32,
    fogColor: 0x231813, fogDensity: 0.0015, exposure: 1.12, bloomStrength: 0.3,
    starsOpacity: 0.25, cloudTint: 0xf4c28e, cloudOpacity: 0.44,
    windowEmissive: 1.05, lampOpacity: 0.92, showSun: true, showMoon: false, searchlightOpacity: 0.16,
  },
};

export class LouvreParisWorld3D {
  constructor(canvas, config, callbacks = {}) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;

    this.isMobile = window.innerWidth < 900;
    this.qualityMode = 'smooth60';
    this.timeOfDay = 'sunset';
    this.weatherMode = 'clear'; // 'clear' | 'rain' | 'petals'
    this.uvMode = false;
    this.zoomed = false;
    this.portalPaused = true;
    this.portalTickAccum = 0;

    // Guide & Tour State Machine ('bobs' | 'anas', phase: 'idle' | 'walking' | 'explaining')
    this.activeGuideType = 'bobs';
    this.guidePhase = 'idle';
    this.cruiseFast = false;
    this.cabRideActive = false;

    this.droneActive = false;
    this.droneTime = 0;
    this.sparkleShowTimer = 0;
    this.disposed = false;
    this.isHidden = false;

    // Start on Champs-Élysées 525m Boulevard looking straight toward Louvre & Eiffel Tower!
    this.playerPos = new THREE.Vector3(0, 1.68, 384);
    this.playerYaw = 0;
    this.playerPitch = 0.03;
    this.targetYaw = 0;
    this.targetPitch = 0.03;
    this.baseFov = window.innerWidth / Math.max(1, window.innerHeight) < 0.85 ? 64 : 53;
    this.walkBobPhase = 0;
    this.footstepAccum = 0;
    this.moveInput = { forward: 0, strafe: 0 };
    this.keys = {};
    this.currentWaypointIdx = 0;
    this.enteredLouvreOnce = false;

    this.circleColliders = [];
    this.boxColliders = [];
    this.pyramidDoors = [];
    this.flyingCoins = [];
    this.skyLanterns = [];
    this.hiddenSeals = [];
    this.uvSecretMeshes = [];

    // Live Paris Traffic & Intersections
    this.intersections = [];
    this.trafficVehicles = [];
    this.policeLightBars = [];
    this.asphaltMat = null;
    this.cobbleMat = null;

    this.isLooking = false;
    this.lookStart = { x: 0, y: 0 };
    this.dragMoved = 0;
    this.interactables = [];
    this.nearestInteractable = null;

    // Unified Tour Guide Root (contains bobsGroup & anasGroup — seamlessly swapped!)
    this.guideRoot = new THREE.Group();
    this.guidePos = new THREE.Vector3(-1.4, 0, 378);
    this.guideYaw = Math.PI;
    this.bobsGroup = new THREE.Group();
    this.anasGroup = new THREE.Group();
    this.anasGroup.visible = false;

    // Bobs Cat 40-bone rig
    this.catMixer = null;
    this.catBoneInfo = {};
    this.catLoaded = false;
    this.catStride = 0;
    this.catStepAccum = 0;
    this.catState = 'guide';
    this.catStateTimer = 0;
    this.catStateDur = 10;
    this.pawPrints = [];
    this.pawIdx = 0;

    // Anas Habib Mocap Human Guide rig
    this.anasMixer = null;
    this.anasWalkAction = null;
    this.anasIdleAction = null;
    this.anasCurAnim = 'idle';
    this.anasLoaded = false;

    this.humanVisitors = [];
    this.candlesLit = true;
    this.candleWind = 0;
    this.cakeFlames = [];
    this.smokePuffs = [];
    this.smokeTime = -1;
    this.fireworksTime = -1;

    this.floatingProps = [];
    this.parchments = [];
    this.lampHalos = [];
    this.cloudSprites = [];
    this.fallingLeaves = [];
    this.rainDrops = null;
    this.rainPositions = null;
    this.eiffelSparkles = [];
    this.fountainRings = [];
    this.emissiveBuildingMats = [];

    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._qDelta = new THREE.Quaternion();
    this._tmpLook = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.init();
  }

  /* ==================== INIT SILKY 60FPS ZERO-Z-FIGHTING RENDERER ==================== */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x2b2029, 0.0018);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.baseFov = aspect < 0.85 ? 64 : 53;
    // Near=0.30 gives ~2.5x stronger depth precision across 600m -> zero ground flicker!
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.3, 1050);

    this.composer = null;
    this.bloomPass = null;
    this.applyQualitySettings();

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.texLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    const aniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), this.isMobile ? 2 : 6);

    this.cobbleScan = loadRealPBRSet(this.texLoader, './assets/textures/cobble_diff.jpg', './assets/textures/cobble_nor.jpg', './assets/textures/cobble_rough.jpg', 5, 110, aniso);
    this.plazaCobbleScan = loadRealPBRSet(this.texLoader, './assets/textures/cobble_diff.jpg', './assets/textures/cobble_nor.jpg', './assets/textures/cobble_rough.jpg', 14, 14, aniso);
    this.parquetScan = loadRealPBRSet(this.texLoader, './assets/textures/parquet_diff.jpg', './assets/textures/parquet_nor.jpg', './assets/textures/parquet_rough.jpg', 6, 24, aniso);
    this.marbleScan = loadRealPBRSet(this.texLoader, './assets/textures/marble_diff.jpg', './assets/textures/marble_nor.jpg', null, 2, 2, aniso);
    this.stoneScan = loadRealPBRSet(this.texLoader, './assets/textures/stone_diff.jpg', './assets/textures/stone_nor.jpg', null, 4, 2, aniso);

    this.glowTex = createGlowTexture();
    this.beamTex = createLightBeamTexture();
    this.cloudTex = createCloudTexture();
    this.pawTex = createPawPrintTexture();
    this.asphaltTex = createParisAsphaltRoadTexture(aniso);
    this.haussmannPBR = createHaussmannFacadePBR(aniso);
    this.modernAptPBR = createModernApartmentTowerPBR(aniso);
    this.mallPBR = createParisMallFacadePBR(aniso);
    this.louvrePBR = createLouvrePalacePBR(aniso);
    this.mansardTex = createMansardRoofPBR(aniso);
    this.eiffelLatticeTex = createEiffelLatticeTexture(aniso);
    this.foliageTex = createTreeFoliageTexture();
    this.wallPanelTex = createLouvreWallPanelPBR(aniso);

    // Helper for zero-z-fighting floor overlay materials (carpets, stripes, shadows, runners)
    const overlayMat = (opts) => new THREE.MeshStandardMaterial({
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
      ...opts,
    });

    this.mats = {
      gold: new THREE.MeshStandardMaterial({ color: 0xefc86a, metalness: 0.9, roughness: 0.18 }),
      goldOverlay: overlayMat({ color: 0xefc86a, metalness: 0.85, roughness: 0.22 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: 0xfff0be, emissive: 0xe6a02e, emissiveIntensity: 0.82, metalness: 0.7, roughness: 0.2 }),
      waxCrimson: new THREE.MeshStandardMaterial({ color: 0xa11e2b, emissive: 0x5c0e16, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.2 }),
      marble: new THREE.MeshStandardMaterial({ map: this.marbleScan.map, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.35, 0.35), color: 0xfbf6ef, roughness: 0.18, metalness: 0.04 }),
      limestoneScanned: new THREE.MeshStandardMaterial({ map: this.stoneScan.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.45, 0.45), color: 0xe4d4bc, roughness: 0.74, metalness: 0.02 }),
      haussmann: new THREE.MeshStandardMaterial({
        map: this.haussmannPBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.25, 0.25),
        emissive: new THREE.Color(0xffc773), emissiveMap: this.haussmannPBR.emissiveMap, emissiveIntensity: 0.85, roughness: 0.72, metalness: 0.04,
      }),
      modernApt: new THREE.MeshStandardMaterial({
        map: this.modernAptPBR.map, emissive: new THREE.Color(0xffce7a), emissiveMap: this.modernAptPBR.emissiveMap,
        emissiveIntensity: 0.85, roughness: 0.42, metalness: 0.18,
      }),
      mallFacade: new THREE.MeshStandardMaterial({
        map: this.mallPBR.map, emissive: new THREE.Color(0xffd486), emissiveMap: this.mallPBR.emissiveMap,
        emissiveIntensity: 0.92, roughness: 0.22, metalness: 0.35,
      }),
      louvrePalace: new THREE.MeshStandardMaterial({
        map: this.louvrePBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.3, 0.3),
        emissive: new THREE.Color(0xffc975), emissiveMap: this.louvrePBR.emissiveMap, emissiveIntensity: 0.82, roughness: 0.66, metalness: 0.05,
      }),
      mansard: new THREE.MeshStandardMaterial({ map: this.mansardTex, roughness: 0.44, metalness: 0.36 }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x232428, metalness: 0.84, roughness: 0.3 }),
      metroGreen: new THREE.MeshStandardMaterial({ color: 0x1e5c45, metalness: 0.65, roughness: 0.32 }),
      policeBlue: new THREE.MeshStandardMaterial({ color: 0x163875, roughness: 0.42, metalness: 0.28 }),
      eiffelSteel: new THREE.MeshStandardMaterial({ color: 0x5d483a, metalness: 0.76, roughness: 0.34 }),
      eiffelLattice: new THREE.MeshStandardMaterial({ map: this.eiffelLatticeTex, alphaTest: 0.35, side: THREE.DoubleSide, metalness: 0.74, roughness: 0.36 }),
      velvetRed: overlayMat({ color: 0x6f1623, roughness: 0.88 }),
      runnerOverlay: overlayMat({ color: 0x3b2316, roughness: 0.68 }),
      crosswalkStripe: overlayMat({ color: 0xf0eadc, roughness: 0.72 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.5 }),
      lampGlow: new THREE.MeshBasicMaterial({ color: 0xfff2c6 }),
      lanternPaper: new THREE.MeshStandardMaterial({ color: 0xffdca0, emissive: 0xffa638, emissiveIntensity: 1.25, roughness: 0.4, transparent: true, opacity: 0.92 }),
      glassPyramid: new THREE.MeshPhysicalMaterial({
        color: 0xdaf0f7, emissive: 0x7c551e, emissiveIntensity: 0.2, transparent: true, opacity: 0.44,
        roughness: 0.06, metalness: 0.16, reflectivity: 1.0, clearcoat: 1.0, side: THREE.DoubleSide,
      }),
      glassDoor: new THREE.MeshPhysicalMaterial({
        color: 0xe6f7fc, transparent: true, opacity: 0.52, roughness: 0.04, metalness: 0.2, clearcoat: 1.0, side: THREE.DoubleSide,
      }),
      waterPool: new THREE.MeshPhysicalMaterial({
        color: 0x13263a, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.16, 0.16),
        roughness: 0.04, metalness: 0.45, clearcoat: 1.0, reflectivity: 0.98,
      }),
      cakeCream: new THREE.MeshStandardMaterial({ color: 0xfbf3e4, roughness: 0.5 }),
      cakeFrosting: new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.38 }),
      cakeGanache: new THREE.MeshStandardMaterial({ color: 0x351a0f, roughness: 0.16, metalness: 0.16 }),
      strawberry: new THREE.MeshStandardMaterial({ color: 0xc22b38, roughness: 0.26 }),
      macaronRose: new THREE.MeshStandardMaterial({ color: 0xe2988d, roughness: 0.38 }),
      macaronGold: new THREE.MeshStandardMaterial({ color: 0xe6be68, roughness: 0.3, metalness: 0.38 }),
      candleNumber: new THREE.MeshStandardMaterial({ color: 0xfff4d9, emissive: 0x5c370c, emissiveIntensity: 0.28, roughness: 0.26, metalness: 0.24 }),
    };
    this.emissiveBuildingMats.push(this.mats.haussmann, this.mats.modernApt, this.mats.mallFacade, this.mats.louvrePalace);

    this.setupLighting();
    this.buildDynamicParisSkySunMoonClouds();
    this.buildGrand525mParisBoulevardAndDistricts();
    this.buildWorkingTrafficLightsAndIntersections();
    this.buildArchitecturalEiffelTower();
    this.buildOpenPortalLouvrePyramidAndFountain();
    this.buildLouvreGrandGalleryInterior();
    this.buildFourInteractiveArtifactsAndSculpture();
    this.buildLiveLouvreWallPaintingEasel();
    this.buildFiveHiddenMuseumSeals();
    this.buildRoyalFamilyVaultAndManifesto();
    this.buildGrandRotundaAndRealisticCake();
    this.loadRealCC0ParisTrafficVehicles();
    this.loadOptimizedMocapHumanVisitorsAndAnasGuide();
    this.buildWeatherParticles();
    this.buildPawPrintPool();
    this.loadAnatomicallyFixedBobsPersianCat();

    this.setTimeOfDay('sunset');
    this.bindEvents();
    if (this.callbacks.onReady) this.callbacks.onReady();
    this.animate();
  }

  ensureUltraComposer() {
    if (this.composer) return;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.34, 0.55, 0.86);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  applyQualitySettings() {
    const dpr = window.devicePixelRatio || 1;
    let targetDpr = Math.min(dpr, this.isMobile ? 1.15 : 1.45);
    if (this.qualityMode === 'eco') targetDpr = Math.min(dpr, 1.0);
    else if (this.qualityMode === 'ultra') {
      targetDpr = Math.min(dpr, 1.75);
      this.ensureUltraComposer();
    }
    this.renderer.setPixelRatio(targetDpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isMobile && this.qualityMode !== 'eco';
    this.renderer.shadowMap.needsUpdate = true;
    if (this.composer) {
      this.composer.setPixelRatio(targetDpr);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    this.applyQualitySettings();
    if (this.leafInst) this.leafInst.visible = mode !== 'eco' && this.weatherMode !== 'rain';
  }

  setPortalPaused(paused) {
    this.portalPaused = Boolean(paused);
    if (!paused) this.renderer.shadowMap.needsUpdate = true;
  }

  setZoom(enabled) {
    this.zoomed = Boolean(enabled);
    if (this.callbacks.onZoomChange) this.callbacks.onZoomChange(this.zoomed);
  }

  setActiveGuide(type) {
    this.activeGuideType = type === 'anas' ? 'anas' : 'bobs';
    this.bobsGroup.visible = this.activeGuideType === 'bobs';
    this.anasGroup.visible = this.activeGuideType === 'anas';
    if (this.callbacks.onGuideTypeChange) this.callbacks.onGuideTypeChange(this.activeGuideType);
  }

  setCruiseFast(fast) {
    this.cruiseFast = Boolean(fast);
  }

  setWeather(mode) {
    this.weatherMode = ['clear', 'rain', 'petals'].includes(mode) ? mode : 'clear';
    const isRain = this.weatherMode === 'rain';
    if (this.rainDrops) this.rainDrops.visible = isRain;
    if (this.leafInst) {
      this.leafInst.visible = !isRain && this.qualityMode !== 'eco';
      this.leafInst.material.color.setHex(this.weatherMode === 'petals' ? 0xffb7cf : 0xf6cf76);
    }
    if (this.asphaltMat) {
      this.asphaltMat.roughness = isRain ? 0.14 : 0.72;
      this.asphaltMat.metalness = isRain ? 0.36 : 0.08;
    }
    if (this.cobbleMat) {
      this.cobbleMat.roughness = isRain ? 0.2 : 0.78;
      this.cobbleMat.metalness = isRain ? 0.28 : 0.08;
    }
    if (this.callbacks.onWeatherChange) this.callbacks.onWeatherChange(this.weatherMode);
  }

  /* ==================== LIGHTING + BAKED STATIC SHADOWS ==================== */
  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffe2be, 0x2c2224, 1.2);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffc880, 2.55);
    this.sunLight.position.set(-60, 48, 120);
    this.sunLight.castShadow = !this.isMobile;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 360;
    this.sunLight.shadow.camera.left = -90;
    this.sunLight.shadow.camera.right = 90;
    this.sunLight.shadow.camera.top = 180;
    this.sunLight.shadow.camera.bottom = -120;
    this.sunLight.shadow.bias = -0.0007;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0x8ea8e6, 0.56);
    this.fillLight.position.set(55, 28, 180);
    this.scene.add(this.fillLight);

    this.playerLantern = new THREE.PointLight(0xffdca0, 15, 28, 1.45);
    this.scene.add(this.playerLantern);
  }

  updateEnvironmentReflections(preset) {
    if (this.envRenderTarget) this.envRenderTarget.dispose();
    const envScene = new THREE.Scene();
    const envSky = new THREE.Mesh(
      new THREE.SphereGeometry(20, 14, 10),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: { uTop: { value: new THREE.Color(preset.skyTop) }, uMid: { value: new THREE.Color(preset.skyMid) }, uHorizon: { value: new THREE.Color(preset.skyHorizon) } },
        vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop,uMid,uHorizon; varying vec3 vD; void main(){ float h=clamp(vD.y,0.0,1.0); vec3 c=mix(uHorizon,uMid,smoothstep(0.0,0.3,h)); c=mix(c,uTop,smoothstep(0.25,0.8,h)); gl_FragColor=vec4(c*1.28,1.0); }`,
      })
    );
    envScene.add(envSky);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), new THREE.MeshBasicMaterial({ color: preset.sunGlow }));
    orb.position.copy(preset.sunPos).normalize().multiplyScalar(14);
    envScene.add(orb);
    this.envRenderTarget = this.pmremGenerator.fromScene(envScene, 0.04);
    this.scene.environment = this.envRenderTarget.texture;
    envSky.geometry.dispose(); envSky.material.dispose(); orb.geometry.dispose(); orb.material.dispose();
  }

  buildDynamicParisSkySunMoonClouds() {
    this.skyGroup = new THREE.Group();
    this.skyUniforms = {
      uTop: { value: new THREE.Color(0x162244) },
      uMid: { value: new THREE.Color(0x724058) },
      uHorizon: { value: new THREE.Color(0xf4a05c) },
      uSunGlow: { value: new THREE.Color(0xffe49e) },
      uSunDir: { value: new THREE.Vector3(-0.46, 0.24, -0.85).normalize() },
    };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false, uniforms: this.skyUniforms,
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform vec3 uTop, uMid, uHorizon, uSunGlow, uSunDir;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y, 0.0, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.26, h));
          col = mix(col, uTop, smoothstep(0.22, 0.72, h));
          float sunDot = max(dot(d, normalize(uSunDir)), 0.0);
          col += uSunGlow * pow(sunDot, 12.0) * 0.55;
          col += uSunGlow * pow(sunDot, 140.0) * 1.25;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    this.skyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(520, 28, 18), skyMat));

    this.sunGroup = new THREE.Group();
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(12, 18, 14), new THREE.MeshBasicMaterial({ color: 0xfff9e6, fog: false }));
    const sunCorona = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd282, transparent: true, opacity: 0.94, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    sunCorona.scale.set(95, 95, 1);
    this.sunGroup.add(sunDisc, sunCorona);
    this.skyGroup.add(this.sunGroup);

    this.moonGroup = new THREE.Group();
    const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(9, 18, 14), new THREE.MeshBasicMaterial({ color: 0xf4f7ff, fog: false }));
    const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x9ec0ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    moonHalo.scale.set(60, 60, 1);
    this.moonGroup.add(moonDisc, moonHalo);
    this.moonGroup.position.set(110, 140, -320);
    this.skyGroup.add(this.moonGroup);

    const starCount = this.isMobile ? 200 : 360;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2, ph = 0.16 + Math.random() * 1.15;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 460;
      pos[i * 3 + 1] = Math.sin(ph) * 380 + 24;
      pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 460;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.starsMat = new THREE.PointsMaterial({ size: 3.6, map: this.glowTex, color: 0xfff5dc, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.skyGroup.add(new THREE.Points(sGeo, this.starsMat));

    const cloudCount = this.isMobile ? 10 : 16;
    for (let i = 0; i < cloudCount; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cloudTex, color: 0xffd2a8, transparent: true, opacity: 0.56, depthWrite: false, fog: false }));
      const ang = (i / cloudCount) * Math.PI * 2 + Math.random() * 0.25;
      const dist = 240 + (i % 3) * 58, h = 68 + (i % 4) * 28, w = 96 + (i % 5) * 30;
      sp.position.set(Math.cos(ang) * dist, h, Math.sin(ang) * dist);
      sp.scale.set(w, w * 0.42, 1);
      this.skyGroup.add(sp);
      this.cloudSprites.push({ sprite: sp, ang, dist, h, speed: 0.003 + (i % 4) * 0.0012 });
    }
    this.scene.add(this.skyGroup);
  }

  setTimeOfDay(mode) {
    const p = TIME_PRESETS[mode] || TIME_PRESETS.sunset;
    this.timeOfDay = mode;
    this.skyUniforms.uTop.value.setHex(p.skyTop);
    this.skyUniforms.uMid.value.setHex(p.skyMid);
    this.skyUniforms.uHorizon.value.setHex(p.skyHorizon);
    this.skyUniforms.uSunGlow.value.setHex(p.sunGlow);
    this.skyUniforms.uSunDir.value.copy(p.sunPos).normalize();
    this.sunGroup.visible = p.showSun;
    this.sunGroup.position.copy(p.sunPos).normalize().multiplyScalar(430);
    this.moonGroup.visible = p.showMoon;
    this.starsMat.opacity = p.starsOpacity;
    this.cloudSprites.forEach((c) => { c.sprite.material.color.setHex(p.cloudTint); c.sprite.material.opacity = p.cloudOpacity; });

    this.sunLight.color.setHex(p.sunColor);
    this.sunLight.intensity = this.uvMode ? 0.4 : p.sunIntensity;
    this.hemiLight.color.setHex(p.hemiSky);
    this.hemiLight.groundColor.setHex(p.hemiGround);
    this.hemiLight.intensity = this.uvMode ? 0.35 : p.hemiIntensity;
    this.scene.fog.color.setHex(p.fogColor);
    this.scene.fog.density = p.fogDensity;
    this.renderer.toneMappingExposure = p.exposure;
    if (this.bloomPass) this.bloomPass.strength = this.uvMode ? 0.62 : p.bloomStrength;

    this.emissiveBuildingMats.forEach((m) => { m.emissiveIntensity = p.windowEmissive; });
    this.lampHalos.forEach((h) => { h.material.opacity = p.lampOpacity; });
    if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = this.sparkleShowTimer > 0 ? 0.56 : p.searchlightOpacity;

    this.updateEnvironmentReflections(p);
    this.renderer.shadowMap.needsUpdate = true;
    if (this.callbacks.onTimeChange) this.callbacks.onTimeChange(mode, p.labelAr);
  }

  setUVMode(enabled) {
    this.uvMode = Boolean(enabled);
    this.uvSecretMeshes.forEach((m) => { m.visible = this.uvMode; });
    this.playerLantern.color.setHex(this.uvMode ? 0x6ce2ff : 0xffdca0);
    this.playerLantern.intensity = this.uvMode ? 22 : 15;
    this.setTimeOfDay(this.timeOfDay);
  }

  releaseBirthdayLanterns() {
    const geo = new THREE.CylinderGeometry(0.36, 0.26, 0.64, 10);
    const centerZ = Math.max(16, this.playerPos.z - 12);
    for (let i = 0; i < 19; i++) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(geo, this.mats.lanternPaper);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc660, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.set(2.4, 2.4, 1);
      grp.add(body, halo);
      const ang = (i / 19) * Math.PI * 2 + Math.random() * 0.25;
      const rad = 5.5 + Math.random() * 16;
      grp.position.set(Math.cos(ang) * rad, 1.8 + Math.random() * 4, centerZ + Math.sin(ang) * rad);
      this.scene.add(grp);
      this.skyLanterns.push({
        mesh: grp, baseX: grp.position.x, vy: 1.1 + Math.random() * 0.85,
        phase: Math.random() * Math.PI * 2, life: 0, maxLife: 24 + Math.random() * 6,
      });
    }
  }

  triggerEiffelSparkleShow() {
    this.sparkleShowTimer = 18.0;
    if (this.timeOfDay === 'day') this.setTimeOfDay('night');
    else if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = 0.58;
    this.releaseBirthdayLanterns();
  }

  /* ==================== 525M PARIS GRAND BOULEVARD, MALL, APARTMENTS & POLICE ==================== */
  buildGrand525mParisBoulevardAndDistricts() {
    // STRICTLY NON-OVERLAPPING GROUND SURFACES (z: +456 down to +32 -> zero z-fighting!)
    const len = 424; // z = +32 to +456 (center z = +244)
    const midZ = 244;

    this.cobbleMat = new THREE.MeshStandardMaterial({
      map: this.cobbleScan.map, normalMap: this.cobbleScan.normalMap, normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: this.cobbleScan.roughnessMap, roughness: 0.78, metalness: 0.08,
    });
    const centralPromenade = new THREE.Mesh(new THREE.PlaneGeometry(16, len), this.cobbleMat);
    centralPromenade.rotation.x = -Math.PI / 2;
    centralPromenade.position.set(0, 0, midZ);
    centralPromenade.receiveShadow = true;
    this.scene.add(centralPromenade);

    // Golden-trimmed Royal Pedestrian Runner (polygonOffset + clean y=0.045 -> ZERO flicker!)
    const runner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, len - 8), this.mats.runnerOverlay);
    runner.rotation.x = -Math.PI / 2; runner.position.set(0, 0.045, midZ);
    this.scene.add(runner);
    [-1.68, 1.68].forEach((x) => {
      const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.1, len - 8), this.mats.goldOverlay);
      trim.rotation.x = -Math.PI / 2; trim.position.set(x, 0.052, midZ);
      this.scene.add(trim);
    });

    // Two-Way Parisian Asphalt Avenues flanking BOTH sides of the Promenade (x = -24..-8 & +8..+24)
    this.asphaltMat = new THREE.MeshStandardMaterial({ map: this.asphaltTex, roughness: 0.72, metalness: 0.08 });
    [-16, 16].forEach((rx) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(16, len), this.asphaltMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(rx, 0, midZ);
      road.receiveShadow = true;
      this.scene.add(road);
    });

    // Outer District Sidewalks (x = -64..-24 and +24..+64, strictly non-overlapping!)
    [-44, 44].forEach((sx) => {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(40, len), this.mats.limestoneScanned);
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(sx, 0, midZ);
      sw.receiveShadow = true;
      this.scene.add(sw);
    });

    // Raised Stone Curbs separating Promenade & Avenues
    [-8.1, 8.1, -24.1, 24.1].forEach((cx) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, len), this.mats.limestoneScanned);
      curb.position.set(cx, 0.11, midZ);
      this.scene.add(curb);
    });

    // ---- ICONIC ARC DE TRIOMPHE AT SOUTH CHAMS-ÉLYSÉES HORIZON (z = +444) ----
    const arc = new THREE.Group();
    arc.position.set(0, 0, 444);
    [-10, 10].forEach((px) => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(9.5, 28, 12), this.mats.limestoneScanned);
      pier.position.set(px, 14, 0);
      arc.add(pier);
    });
    const arcTop = new THREE.Mesh(new THREE.BoxGeometry(30, 11, 12.6), this.mats.limestoneScanned);
    arcTop.position.set(0, 33, 0);
    const arcCornice = new THREE.Mesh(new THREE.BoxGeometry(31.5, 1.4, 13.4), this.mats.gold);
    arcCornice.position.set(0, 38.6, 0);
    const arcRing = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.48, 10, 32, Math.PI), this.mats.goldGlow);
    arcRing.position.set(0, 22, -6.1);
    const arcSign = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.6), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('قوس النصر • بوليفارد باريس', 'ARC DE TRIOMPHE • CHAMPS-ÉLYSÉES • HEY') }));
    arcSign.position.set(0, 33, -6.45);
    arcSign.rotation.y = Math.PI;
    arc.add(arcTop, arcCornice, arcRing, arcSign);
    this.scene.add(arc);

    // ---- GALERIES PARIS LUXURY SHOPPING MALL (East Side z = +290, x = +35) ----
    const mall = new THREE.Group();
    mall.position.set(35, 0, 290);
    const mallBody = new THREE.Mesh(new THREE.BoxGeometry(16, 19, 44), this.mats.mallFacade);
    mallBody.position.set(0, 9.5, 0);
    const mallRoofFrame = new THREE.Mesh(new THREE.BoxGeometry(16.8, 1.1, 45), this.mats.gold);
    mallRoofFrame.position.set(0, 19.3, 0);
    const mallDome = new THREE.Mesh(new THREE.SphereGeometry(11.5, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), this.mats.glassPyramid);
    mallDome.position.set(-1, 19.6, 0);
    const mallDomeRibs = new THREE.Mesh(new THREE.SphereGeometry(11.7, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0xe8c268, metalness: 0.85, roughness: 0.25, wireframe: true }));
    mallDomeRibs.position.copy(mallDome.position);
    const mallCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 26), this.mats.goldGlow);
    mallCanopy.position.set(-9.5, 5.2, 0);
    const mallSign = new THREE.Mesh(new THREE.PlaneGeometry(24, 5.0), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('جاليري باريس مول • تسوّق وأزياء', 'GALERIES PARIS MALL • LUXURY BOUTIQUES') }));
    mallSign.position.set(-8.2, 16.2, 0);
    mallSign.rotation.y = -Math.PI / 2;
    mall.add(mallBody, mallRoofFrame, mallDome, mallDomeRibs, mallCanopy, mallSign);
    this.scene.add(mall);

    // ---- COMMISSARIAT DE POLICE (Paris Police Precinct, West Side z = +170, x = -34) ----
    const policeHQ = new THREE.Group();
    policeHQ.position.set(-34, 0, 170);
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(14, 14.5, 28), this.mats.limestoneScanned);
    pBody.position.set(0, 7.25, 0);
    const pBand = new THREE.Mesh(new THREE.BoxGeometry(14.4, 2.4, 28.4), this.mats.policeBlue);
    pBand.position.set(0, 13.6, 0);
    const pRoof = new THREE.Mesh(new THREE.BoxGeometry(13.6, 3.2, 27.6), this.mats.mansard);
    pRoof.position.set(0, 16.4, 0);
    const pSign = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.8), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('قسم شرطة باريس الوطني', 'COMMISSARIAT DE POLICE • PARIS', '#6bb6ff', '#0c1b36') }));
    pSign.position.set(7.25, 11.2, 0);
    pSign.rotation.y = Math.PI / 2;
    // French tricolor pillars on police entrance
    const triColors = [0x1c4ed8, 0xf8fafc, 0xdc2626];
    triColors.forEach((hex, idx) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.6, 0.9), new THREE.MeshBasicMaterial({ color: hex }));
      strip.position.set(7.15, 2.8, -5.5 + idx * 0.95);
      policeHQ.add(strip);
    });
    const pAwning = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 12), this.mats.policeBlue);
    pAwning.position.set(8.4, 4.6, 0);
    policeHQ.add(pBody, pBand, pRoof, pSign, pAwning);
    this.scene.add(policeHQ);

    // ---- PARIS HAUSSMANN APARTMENTS & MODERN REAL-ESTATE TOWERS (z = +415 .. +45) ----
    // Leave a deliberate open Eiffel Tower vista gap on West side around z = 115..152 & z = 205..240!
    const buildApartmentBlock = (x, z, rotY, isModern = false, hasRealEstateSign = false) => {
      const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = rotY;
      const h = isModern ? 22 : 14.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(24, h, 11), isModern ? this.mats.modernApt : this.mats.haussmann);
      body.position.y = h * 0.5;
      b.add(body);
      if (isModern) {
        const crown = new THREE.Mesh(new THREE.BoxGeometry(24.6, 0.8, 11.6), this.mats.gold);
        crown.position.y = h + 0.4;
        const penthouse = new THREE.Mesh(new THREE.BoxGeometry(16, 3.6, 8), this.mats.glassPyramid);
        penthouse.position.y = h + 2.2;
        b.add(crown, penthouse);
      } else {
        const cornice = new THREE.Mesh(new THREE.BoxGeometry(24.8, 0.55, 11.8), this.mats.limestoneScanned);
        cornice.position.y = h + 0.25;
        const roof = new THREE.Mesh(new THREE.BoxGeometry(23.4, 3.6, 9.6), this.mats.mansard);
        roof.position.y = h + 2.1;
        b.add(cornice, roof);
      }
      if (hasRealEstateSign) {
        const reSign = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 2.9), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('عقارات وشقق باريس الفاخرة', 'IMMOBILIER PARIS • RÉSIDENCE ROYALE') }));
        reSign.position.set(0, 5.2, 5.7);
        b.add(reSign);
      }
      this.scene.add(b);
    };

    const eastSlots = [
      { z: 405, modern: false, sign: false },
      { z: 365, modern: true, sign: true },
      { z: 332, modern: false, sign: false },
      // z=290 reserved for Galeries Paris Mall!
      { z: 242, modern: true, sign: true },
      { z: 205, modern: false, sign: false },
      { z: 168, modern: true, sign: false },
      { z: 130, modern: false, sign: true },
      { z: 92, modern: false, sign: false },
      { z: 54, modern: false, sign: false },
    ];
    eastSlots.forEach((s) => buildApartmentBlock(34, s.z, -Math.PI / 2, s.modern, s.sign));

    const westSlots = [
      { z: 405, modern: true, sign: true },
      { z: 365, modern: false, sign: false },
      { z: 326, modern: true, sign: false },
      { z: 286, modern: false, sign: true },
      { z: 248, modern: false, sign: false },
      // z=170 reserved for Paris Police Precinct, z=205..215 & z=118..140 open skyline vista toward Eiffel Tower!
      { z: 96, modern: false, sign: false },
      { z: 56, modern: false, sign: false },
    ];
    westSlots.forEach((s) => buildApartmentBlock(-34, s.z, Math.PI / 2, s.modern, s.sign));

    // ---- ART NOUVEAU MÉTRO PARISIEN ENTRANCE AT RUE DE RIVOLI (z = +64, x = +6.4) ----
    const metro = new THREE.Group();
    metro.position.set(5.8, 0, 64);
    [-1.4, 1.4].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 10), this.mats.metroGreen);
      post.position.set(px, 1.6, 0);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), this.mats.lampGlow);
      globe.position.set(px, 3.3, 0);
      metro.add(post, globe);
    });
    const mArch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.72, 0.18), this.mats.metroGreen);
    mArch.position.set(0, 3.05, 0);
    const mSign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.56), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('مترو باريس • ريفولي', 'MÉTROPOLITAIN', '#ffdf86', '#164533') }));
    mSign.position.set(0, 3.05, 0.11);
    const mSignBack = mSign.clone(); mSignBack.position.z = -0.11; mSignBack.rotation.y = Math.PI;
    metro.add(mArch, mSign, mSignBack);
    this.circleColliders.push({ x: 5.8, z: 64, r: 1.5 });
    this.scene.add(metro);

    // ---- INSTANCED PARIS STREET LAMPS & TREES ACROSS ALL 525 METERS (SINGLE DRAW CALLS!) ----
    const lampPositions = [];
    for (let z = 420; z >= 40; z -= 24) {
      lampPositions.push([-7.2, z], [7.2, z], [-25.2, z], [25.2, z]);
    }
    const postInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.12, 4.6, 8), this.mats.ironDark, lampPositions.length);
    const globeInst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), this.mats.lampGlow, lampPositions.length);
    const dummy = new THREE.Object3D();
    lampPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 2.3, z); dummy.updateMatrix(); postInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 4.7, z); dummy.updateMatrix(); globeInst.setMatrixAt(i, dummy.matrix);
      if (i % 2 === 0) {
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd584, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(3.4, 3.4, 1); halo.position.set(x, 4.7, z);
        this.scene.add(halo); this.lampHalos.push(halo);
      }
    });
    this.scene.add(postInst, globeInst);

    const treePositions = [];
    for (let z = 412; z >= 48; z -= 28) {
      if (Math.abs(z - 290) < 16 || Math.abs(z - 170) < 16 || Math.abs(z - 65) < 14) continue;
      treePositions.push([-6.2, z], [6.2, z]);
    }
    const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 3.4, 8), this.mats.woodDark, treePositions.length);
    const leafMat = new THREE.MeshStandardMaterial({ map: this.foliageTex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.8 });
    const leafPlaneGeo = new THREE.PlaneGeometry(4.8, 4.8);
    treePositions.forEach(([x, z], i) => {
      dummy.position.set(x, 1.7, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
      trunkInst.setMatrixAt(i, dummy.matrix);
      const canopy = new THREE.Group(); canopy.position.set(x, 4.7, z);
      for (let k = 0; k < 2; k++) {
        const card = new THREE.Mesh(leafPlaneGeo, leafMat);
        card.rotation.y = (k * Math.PI) / 2 + i * 0.4;
        canopy.add(card);
      }
      this.scene.add(canopy);
      this.circleColliders.push({ x, z, r: 0.55 });
    });
    this.scene.add(trunkInst);
  }

  /* ==================== 3 WORKING TRAFFIC LIGHT INTERSECTIONS (RED / YELLOW / GREEN) ==================== */
  buildWorkingTrafficLightsAndIntersections() {
    const interZList = [
      { z: 290, offset: 0 },
      { z: 170, offset: 6.5 },
      { z: 65, offset: 12.2 },
    ];
    const redOff = new THREE.MeshBasicMaterial({ color: 0x3b1010 });
    const yelOff = new THREE.MeshBasicMaterial({ color: 0x3f300c });
    const grnOff = new THREE.MeshBasicMaterial({ color: 0x0d361c });

    interZList.forEach(({ z, offset }) => {
      // Zebra crosswalk stripes on BOTH West & East boulevards (polygonOffset -> ZERO flicker!)
      [-16, 16].forEach((rx) => {
        for (let sx = -6.2; sx <= 6.2; sx += 1.8) {
          const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 3.8), this.mats.crosswalkStripe);
          stripe.rotation.x = -Math.PI / 2;
          stripe.position.set(rx + sx, 0.048, z);
          this.scene.add(stripe);
        }
      });

      const rMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const yMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const gMat = new THREE.MeshBasicMaterial({ color: 0x22e568 });
      const lights = [];

      // Place Parisian traffic light poles on BOTH sides of West & East avenues
      [[-8.3, -1], [8.3, 1]].forEach(([px, dir]) => {
        const pole = new THREE.Group();
        pole.position.set(px, 0, z + dir * 4.5);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 5.8, 10), this.mats.ironDark);
        mast.position.y = 2.9;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.14, 0.14), this.mats.ironDark);
        arm.position.set(dir * 2.7, 5.55, 0);
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.85, 0.55), this.mats.ironDark);
        box.position.set(dir * 4.5, 5.0, 0);

        const makeLens = (ly, mat, sideZ) => {
          const m = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), mat);
          m.position.set(dir * 4.5, 5.0 + ly, sideZ);
          if (sideZ < 0) m.rotation.y = Math.PI;
          return m;
        };
        const r1 = makeLens(0.54, rMat, 0.29), r2 = makeLens(0.54, rMat, -0.29);
        const y1 = makeLens(0.0, yMat, 0.29), y2 = makeLens(0.0, yMat, -0.29);
        const g1 = makeLens(-0.54, gMat, 0.29), g2 = makeLens(-0.54, gMat, -0.29);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x22e568, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(2.4, 2.4, 1);
        halo.position.set(dir * 4.5, 4.46, 0);

        pole.add(mast, arm, box, r1, r2, y1, y2, g1, g2, halo);
        this.scene.add(pole);
        lights.push({ r: [r1, r2], y: [y1, y2], g: [g1, g2], halo, baseY: 5.0 });
      });

      this.intersections.push({
        z,
        timer: offset,
        state: 'green', // 'green' (9.5s) -> 'yellow' (2.2s) -> 'red' (7.5s)
        lights,
        mats: { rMat, yMat, gMat, redOff, yelOff, grnOff },
      });
    });
  }

  /* ==================== REAL CC0 KENNEY 3D CARS & FLASHING PARIS POLICE CRUISERS ==================== */
  loadRealCC0ParisTrafficVehicles() {
    const modelPaths = {
      police: './assets/models/cars/police.glb',
      taxi: './assets/models/cars/taxi.glb',
      sedan: './assets/models/cars/sedan.glb',
      sports: './assets/models/cars/sedan-sports.glb',
      suv: './assets/models/cars/suv.glb',
    };
    const keys = Object.keys(modelPaths);
    Promise.all(keys.map((k) => this.gltfLoader.loadAsync(modelPaths[k]))).then((gltfs) => {
      const bank = {};
      keys.forEach((k, i) => { bank[k] = gltfs[i].scene; });

      const shadowGeo = new THREE.PlaneGeometry(2.3, 4.4);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xfff3cc });
      const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2b2b });

      const spawnCar = (type, laneX, z, dirZ, maxSpeed, parked = false) => {
        const root = new THREE.Group();
        const mesh = bank[type].clone(true);
        const wheels = [];
        mesh.traverse((o) => {
          if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; }
          if (/wheel/i.test(o.name || '')) wheels.push(o);
        });
        mesh.scale.setScalar(1.48);
        root.add(mesh);

        const sh = new THREE.Mesh(shadowGeo, shadowMat);
        sh.rotation.x = -Math.PI / 2; sh.position.y = 0.04;
        root.add(sh);

        // Headlights (+Z front) & Taillights (-Z back)
        [-0.62, 0.62].forEach((lx) => {
          const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), hlMat);
          hl.position.set(lx, 0.62, 1.98);
          const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), tlMat);
          tl.position.set(lx, 0.65, -1.96);
          root.add(hl, tl);
        });

        // Flashing Red & Blue Roof Strobe Lightbars on Police Nationale Cruisers!
        if (type === 'police') {
          const redGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff2838, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
          redGlow.scale.set(2.4, 2.4, 1); redGlow.position.set(-0.36, 2.05, 0.15);
          const blueGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x2884ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
          blueGlow.scale.set(2.4, 2.4, 1); blueGlow.position.set(0.36, 2.05, 0.15);
          root.add(redGlow, blueGlow);
          this.policeLightBars.push({ redGlow, blueGlow, phase: Math.random() * 6 });
        }

        root.position.set(laneX, 0, z);
        root.rotation.y = dirZ > 0 ? 0 : Math.PI;
        this.scene.add(root);
        if (!parked) {
          this.trafficVehicles.push({ root, wheels, laneX, z, dirZ, speed: maxSpeed * 0.7, maxSpeed });
        }
      };

      // Parked Flashing Police Cruiser right outside Paris Police Station (z = +176, x = -25.8)
      spawnCar('police', -25.8, 176, -1, 0, true);
      // Parked Parisian Taxi right outside Galeries Paris Mall (z = +296, x = +25.8)
      spawnCar('taxi', 25.8, 296, 1, 0, true);

      // 4 Live Moving Lanes (14 cars Desktop / 8 Mobile) obeying Red/Yellow/Green Traffic Lights!
      const allSpecs = [
        // West Ave Northbound (x = -19.5, dirZ = -1)
        ['police', -19.5, 415, -1, 13.5],
        ['taxi', -19.5, 315, -1, 11.8],
        ['sedan', -19.5, 200, -1, 11.2],
        ['suv', -19.5, 95, -1, 12.0],
        // West Ave Southbound (x = -12.6, dirZ = +1)
        ['sports', -12.6, 65, 1, 13.8],
        ['sedan', -12.6, 190, 1, 11.5],
        ['taxi', -12.6, 330, 1, 12.2],
        // East Ave Northbound (x = +12.6, dirZ = -1)
        ['sedan', 12.6, 420, -1, 12.0],
        ['sports', 12.6, 265, -1, 13.6],
        ['police', 12.6, 130, -1, 13.2],
        // East Ave Southbound (x = +19.5, dirZ = +1)
        ['taxi', 19.5, 58, 1, 11.8],
        ['suv', 19.5, 165, 1, 12.2],
        ['sedan', 19.5, 285, 1, 11.4],
        ['sports', 19.5, 385, 1, 13.4],
      ];
      const chosen = this.isMobile ? allSpecs.filter((_, idx) => idx % 2 === 0) : allSpecs;
      chosen.forEach(([t, lx, z, dz, spd]) => spawnCar(t, lx, z, dz, spd, false));
    }).catch(() => { /* ignore if offline */ });
  }

  /* ==================== MASSIVE 128M EIFFEL TOWER SKYLINE LANDMARK ==================== */
  buildArchitecturalEiffelTower() {
    // Positioned at (-86, 0, +135) & scaled grandly (128m tall!) so Eiffel Tower is CLEARLY visible across ALL 500m!
    const tower = new THREE.Group();
    tower.position.set(-86, 0, 135);
    tower.scale.setScalar(1.42);
    const legs = [[-10.5, -10.5], [10.5, -10.5], [10.5, 10.5], [-10.5, 10.5]];

    legs.forEach(([lx, lz]) => {
      const p0 = new THREE.Vector3(lx, 0, lz), p1 = new THREE.Vector3(lx * 0.48, 22, lz * 0.48), p2 = new THREE.Vector3(lx * 0.24, 42, lz * 0.24);
      [[p0, p1, 1.35, 0.92], [p1, p2, 0.88, 0.54]].forEach(([a, b, r1, r2]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), 6), this.mats.eiffelSteel);
        leg.position.copy(a).lerp(b, 0.5);
        leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        tower.add(leg);
      });
    });

    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 21), this.mats.eiffelLattice);
      panel.position.set(Math.sin(rot) * 7.6, 11, Math.cos(rot) * 7.6);
      panel.rotation.y = rot;
      panel.rotation.x = -0.22;
      tower.add(panel);
      const arch = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.45, 8, 24, Math.PI), this.mats.eiffelSteel);
      arch.position.set(Math.sin(rot) * 9.8, 5.2, Math.cos(rot) * 9.8);
      arch.rotation.y = rot;
      tower.add(arch);
    });

    const d1 = new THREE.Mesh(new THREE.BoxGeometry(14.8, 2.2, 14.8), this.mats.eiffelSteel); d1.position.y = 22.4;
    const d1Rim = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.36, 15.2), this.mats.goldGlow); d1Rim.position.y = 23.6;
    const d2 = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.8, 8.6), this.mats.eiffelSteel); d2.position.y = 42.4;
    const d2Rim = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.32, 9.0), this.mats.goldGlow); d2Rim.position.y = 43.4;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 3.2, 36, 4), this.mats.eiffelLattice); spire.rotation.y = Math.PI / 4; spire.position.y = 61;
    const d3 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.1, 3.5), this.mats.goldGlow); d3.position.y = 80;
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.42, 11, 8), this.mats.gold); ant.position.y = 86;
    tower.add(d1, d1Rim, d2, d2Rim, spire, d3, ant);

    const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe49e, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false }));
    beacon.scale.set(10, 10, 1); beacon.position.y = 89.5;
    this.eiffelBeacon = beacon; tower.add(beacon);

    this.eiffelSearchlightRig = new THREE.Group(); this.eiffelSearchlightRig.position.y = 88.5;
    this.eiffelSearchlightMat = new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xfff1c4, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    [0, Math.PI].forEach((rot) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(16, 145, 16, 1, true), this.eiffelSearchlightMat);
      cone.rotation.z = Math.PI / 2 - 0.14; cone.rotation.y = rot;
      cone.position.set(Math.cos(rot) * 70, -8, Math.sin(rot) * 70);
      this.eiffelSearchlightRig.add(cone);
    });
    tower.add(this.eiffelSearchlightRig);

    for (let i = 0; i < 36; i++) {
      const h = 10 + (i / 36) * 72, r = THREE.MathUtils.lerp(9.6, 1.3, h / 82), ang = i * 1.45;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe6a6, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.position.set(Math.cos(ang) * r, h, Math.sin(ang) * r); sp.scale.set(1.5, 1.5, 1);
      tower.add(sp);
      this.eiffelSparkles.push({ sprite: sp, phase: i * 0.7, speed: 3.0 + (i % 4) * 1.2 });
    }
    this.scene.add(tower);
  }

  /* ==================== COUR NAPOLÉON, OPEN-PORTAL PYRAMID & FOUNTAIN ==================== */
  buildOpenPortalLouvrePyramidAndFountain() {
    // Strictly non-overlapping Cour Napoléon Cobble Plaza: z = +32 down to z = -6 (length 38, center z = +13)
    const plazaMat = new THREE.MeshStandardMaterial({
      map: this.plazaCobbleScan.map, normalMap: this.plazaCobbleScan.normalMap, normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: this.plazaCobbleScan.roughnessMap, roughness: 0.76, metalness: 0.08,
    });
    const plazaFloor = new THREE.Mesh(new THREE.PlaneGeometry(76, 38), plazaMat);
    plazaFloor.rotation.x = -Math.PI / 2;
    plazaFloor.position.set(0, 0, 13);
    plazaFloor.receiveShadow = true;
    this.scene.add(plazaFloor);

    // Royal central runner cleanly continuing through Cour Napoléon to Louvre door (z = +32..-6)
    const plazaRunner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 38), this.mats.runnerOverlay);
    plazaRunner.rotation.x = -Math.PI / 2; plazaRunner.position.set(0, 0.045, 13);
    this.scene.add(plazaRunner);

    // Reflecting Pools + Wishing Coin Fountain
    [-10.2, 10.2].forEach((px) => {
      const pool = new THREE.Group(); pool.position.set(px, 0, 9.4);
      const basin = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.36, 12.0), this.mats.marble); basin.position.y = 0.18;
      const water = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 11.4), this.mats.waterPool); water.rotation.x = -Math.PI / 2; water.position.y = 0.37;
      pool.add(basin, water);
      for (let r = 0; r < 2; r++) {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 24), new THREE.MeshBasicMaterial({ color: 0xffe49e, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
        ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.385, -1.5 + r * 3.0);
        pool.add(ring); this.fountainRings.push({ mesh: ring, phase: r * 1.6 + (px > 0 ? 0.5 : 0) });
      }
      this.boxColliders.push({ minX: px - 3.6, maxX: px + 3.6, minZ: 3.2, maxZ: 15.6 });
      this.scene.add(pool);
    });

    const fHit = new THREE.Mesh(new THREE.BoxGeometry(6.6, 2.4, 6.6), new THREE.MeshBasicMaterial({ visible: false }));
    fHit.position.set(9.8, 1.2, 10.0); fHit.userData.interactId = 'fountain'; this.scene.add(fHit);
    this.interactables.push({
      id: 'fountain', titleAr: 'نافورة أمنيات ساحة اللوفر',
      badgeAr: '🪙 اضغط لإلقاء عملة أمنية ليمنى في نافورة اللوفر',
      mesh: fHit, worldPos: new THREE.Vector3(6.8, 1.2, 11.2), radius: 7.4,
    });

    // Open-Portal Louvre Glass Pyramid with Automatic Sliding Glass Doors
    const B = 5.4, H = 7.9, doorHW = 1.65, doorH = 3.35;
    const pyrGroup = new THREE.Group(); pyrGroup.position.set(0, 0, 7.0);

    [-1, 1].forEach((signX) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([signX * B, 0, B, signX * B, 0, -B, 0, H, 0], 3));
      geo.computeVertexNormals();
      pyrGroup.add(new THREE.Mesh(geo, this.mats.glassPyramid));
    });
    this.boxColliders.push({ minX: -5.4, maxX: -1.65, minZ: 1.7, maxZ: 12.3 }, { minX: 1.65, maxX: 5.4, minZ: 1.7, maxZ: 12.3 });

    [1, -1].forEach((signZ) => {
      const zB = signZ * B, frac = doorH / H, zTop = zB * (1 - frac), xSlopeAtDoorTop = B * (1 - frac);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([
        -B, 0, zB, -doorHW, 0, zB, -doorHW, doorH, zTop,
        -B, 0, zB, -doorHW, doorH, zTop, -xSlopeAtDoorTop, doorH, zTop,
        doorHW, 0, zB, B, 0, zB, xSlopeAtDoorTop, doorH, zTop,
        doorHW, 0, zB, xSlopeAtDoorTop, doorH, zTop, doorHW, doorH, zTop,
        -xSlopeAtDoorTop, doorH, zTop, xSlopeAtDoorTop, doorH, zTop, 0, H, 0,
      ], 3));
      geo.computeVertexNormals();
      pyrGroup.add(new THREE.Mesh(geo, this.mats.glassPyramid));

      const portalZ = signZ * (B - 0.15);
      const frameGrp = new THREE.Group(); frameGrp.position.set(0, 0, portalZ);
      [-doorHW, doorHW].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.16, doorH + 0.1, 0.24), this.mats.gold);
        pillar.position.set(px, doorH * 0.5, 0); frameGrp.add(pillar);
      });
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorHW * 2 + 0.36, 0.2, 0.3), this.mats.goldGlow);
      lintel.position.set(0, doorH + 0.05, 0); frameGrp.add(lintel);

      const makeDoorLeaf = (side) => {
        const leaf = new THREE.Group();
        const pane = new THREE.Mesh(new THREE.BoxGeometry(doorHW - 0.06, doorH - 0.08, 0.05), this.mats.glassDoor); pane.position.y = doorH * 0.5;
        const border = new THREE.Mesh(new THREE.BoxGeometry(doorHW - 0.02, 0.1, 0.07), this.mats.gold); border.position.y = doorH - 0.08;
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), this.mats.goldGlow); handle.position.set(-side * (doorHW * 0.38), 1.35, 0.05);
        leaf.add(pane, border, handle); leaf.position.x = side * (doorHW * 0.5);
        return leaf;
      };
      const leftDoor = makeDoorLeaf(-1), rightDoor = makeDoorLeaf(1);
      frameGrp.add(leftDoor, rightDoor); pyrGroup.add(frameGrp);
      this.pyramidDoors.push({ leftDoor, rightDoor, closedLeftX: -doorHW * 0.5, closedRightX: doorHW * 0.5, worldZ: 7.0 + portalZ, openAmt: 0 });
    });

    [[-B, -B], [B, -B], [B, B], [-B, B]].forEach(([cx, cz]) => {
      const p0 = new THREE.Vector3(cx, 0, cz), p1 = new THREE.Vector3(0, H, 0);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, p0.distanceTo(p1), 8), this.mats.gold);
      beam.position.copy(p0).lerp(p1, 0.5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
      pyrGroup.add(beam);
    });
    const apexHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd88a, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    apexHalo.scale.set(7.5, 7.5, 1); apexHalo.position.y = 4.2; pyrGroup.add(apexHalo);
    this.scene.add(pyrGroup);

    const facade = new THREE.Group(); facade.position.set(0, 0, -7);
    [-14.5, 14.5].forEach((x) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(19, 13.8, 3.6), this.mats.louvrePalace);
      wing.position.set(x, 6.9, 0);
      const wingRoof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 3.2, 3.1), this.mats.mansard); wingRoof.position.set(x, 15.4, -0.1);
      facade.add(wing, wingRoof);
      for (let cx = -7.5; cx <= 7.5; cx += 5.0) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 12.8, 12), this.mats.marble);
        col.position.set(x + cx, 6.6, 1.92); facade.add(col);
      }
    });
    const topEntablature = new THREE.Mesh(new THREE.BoxGeometry(11.4, 6.8, 4.0), this.mats.louvrePalace); topEntablature.position.set(0, 10.4, 0.15);
    const goldCornice = new THREE.Mesh(new THREE.BoxGeometry(49, 0.42, 4.2), this.mats.gold); goldCornice.position.set(0, 13.9, 0.15);
    const pedShape = new THREE.Shape(); pedShape.moveTo(-6.0, 0); pedShape.lineTo(0, 2.55); pedShape.lineTo(6.0, 0); pedShape.closePath();
    const pediment = new THREE.Mesh(new THREE.ExtrudeGeometry(pedShape, { depth: 0.65, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }), this.mats.marble); pediment.position.set(0, 13.95, 1.85);
    const pavDomeGeo = new THREE.CylinderGeometry(3.4, 5.4, 4.8, 4); pavDomeGeo.rotateY(Math.PI / 4);
    const pavDome = new THREE.Mesh(pavDomeGeo, this.mats.mansard); pavDome.scale.set(1.48, 1, 0.58); pavDome.position.set(0, 16.4, 0);
    const pavCrown = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 2.2), this.mats.goldGlow); pavCrown.position.set(0, 18.88, 0);
    const archTrim = new THREE.Mesh(new THREE.TorusGeometry(4.75, 0.24, 12, 44, Math.PI), this.mats.goldGlow); archTrim.position.set(0, 3.2, 2.15);
    const signPlaque = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 1.75), new THREE.MeshBasicMaterial({ map: createLouvreSignTexture() })); signPlaque.position.set(0, 9.7, 2.24);
    facade.add(topEntablature, goldCornice, pediment, pavDome, pavCrown, archTrim, signPlaque);

    [-22.5, 22.5].forEach((wx) => {
      const sideWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13.6, 28), this.mats.louvrePalace);
      sideWing.position.set(wx, 6.8, 14);
      const sideRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 28), this.mats.mansard); sideRoof.position.set(wx, 15.1, 14);
      facade.add(sideWing, sideRoof);
    });
    this.scene.add(facade);
    this.boxColliders.push({ minX: -24, maxX: -3.4, minZ: -9.0, maxZ: -4.8 }, { minX: 3.4, maxX: 24, minZ: -9.0, maxZ: -4.8 });
  }

  tossWishingCoin() {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.035, 18), this.mats.goldGlow);
    coin.position.set(5.6, 1.65, 11.2);
    this.scene.add(coin);
    this.flyingCoins.push({ mesh: coin, t: 0, p0: new THREE.Vector3(5.6, 1.65, 11.2), p1: new THREE.Vector3(9.8, 0.32, 9.4) });
  }

  /* ==================== LOUVRE GRANDE GALERIE INTERIOR (STRICTLY z: -6 .. -80.4) ==================== */
  buildLouvreGrandGalleryInterior() {
    const hallLen = 74.4; // z = -6.0 down to z = -80.4 (center z = -43.2) -> ZERO overlap with Cour Napoléon OR Rotunda!
    const hallMidZ = -43.2;

    const parquetMat = new THREE.MeshStandardMaterial({
      map: this.parquetScan.map, normalMap: this.parquetScan.normalMap, normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: this.parquetScan.roughnessMap, roughness: 0.42, metalness: 0.06,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, hallLen), parquetMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, hallMidZ); floor.receiveShadow = true;
    this.scene.add(floor);

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.2, hallLen - 0.6), this.mats.velvetRed);
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.045, hallMidZ);
    this.scene.add(carpet);
    [-1.66, 1.66].forEach((x) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, hallLen - 0.6), this.mats.goldOverlay);
      b.rotation.x = -Math.PI / 2; b.position.set(x, 0.052, hallMidZ); this.scene.add(b);
    });

    // Raised Gilded Marble Threshold Beams cleanly framing the floor transitions at z=-6 and z=-80.4
    [-6.0, -80.4].forEach((tz) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.08, 0.36), this.mats.gold);
      bar.position.set(0, 0.04, tz);
      this.scene.add(bar);
    });

    const galleryWallMat = new THREE.MeshStandardMaterial({ map: this.wallPanelTex, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.22, 0.22), roughness: 0.65 });
    const wallGeo = new THREE.BoxGeometry(0.8, 9.8, hallLen + 1);
    [-8.8, 8.8].forEach((x) => {
      const wall = new THREE.Mesh(wallGeo, galleryWallMat); wall.position.set(x, 4.9, hallMidZ);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, hallLen + 1), this.mats.gold); cornice.position.set(x, 9.45, hallMidZ);
      this.scene.add(wall, cornice);
    });

    [-6.0, 6.0].forEach((x) => {
      const ceilSide = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, hallLen + 1), this.mats.marble); ceilSide.position.set(x, 9.7, hallMidZ); this.scene.add(ceilSide);
    });
    const skylight = new THREE.Mesh(new THREE.PlaneGeometry(5.6, hallLen), new THREE.MeshBasicMaterial({ color: 0xffe8b8, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    skylight.rotation.x = Math.PI / 2; skylight.position.set(0, 9.85, hallMidZ); this.scene.add(skylight);

    const colPositions = [];
    for (let z = -12; z >= -78; z -= 9.5) colPositions.push([-7.5, z], [7.5, z]);
    const shaftMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.32, 0.38, 8.8, 14), this.mats.marble, colPositions.length);
    const capMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.46, 1.08), this.mats.gold, colPositions.length);
    const baseMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.46, 1.08), this.mats.marble, colPositions.length);
    const dummy = new THREE.Object3D();
    colPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 4.6, z); dummy.updateMatrix(); shaftMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 9.15, z); dummy.updateMatrix(); capMesh.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.23, z); dummy.updateMatrix(); baseMesh.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(shaftMesh, capMesh, baseMesh);

    [-41, -55, -68].forEach((z) => {
      const bench = new THREE.Group(); bench.position.set(0, 0, z);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.14, 0.78), this.mats.velvetRed); seat.position.y = 0.52;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.08, 0.84), this.mats.woodDark); trim.position.y = 0.44;
      [-0.9, 0.9].forEach((lx) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.68), this.mats.woodDark); leg.position.set(lx, 0.21, 0); bench.add(leg); });
      bench.add(seat, trim);
      this.boxColliders.push({ minX: -1.35, maxX: 1.35, minZ: z - 0.65, maxZ: z + 0.65 });
      this.scene.add(bench);
    });

    [-19, -34, -48, -62, -75].forEach((z) => {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 10.8), new THREE.MeshBasicMaterial({ map: this.beamTex, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      beam.position.set(0, 5.0, z); beam.rotation.z = 0.14; this.scene.add(beam);
    });
  }

  /* ==================== 5 HIDDEN COLLECTIBLE GOLDEN WAX SEALS ==================== */
  buildFiveHiddenMuseumSeals() {
    const discGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 22);
    const rimGeo = new THREE.TorusGeometry(0.32, 0.035, 8, 28);
    HIDDEN_SEALS_DATA.forEach((s, i) => {
      const grp = new THREE.Group();
      grp.position.set(s.x, 1.35, s.z);
      const disc = new THREE.Mesh(discGeo, this.mats.waxCrimson); disc.rotation.x = Math.PI / 2;
      const rim = new THREE.Mesh(rimGeo, this.mats.goldGlow);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe084, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.set(1.3, 1.3, 1);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.interactId = s.id;
      grp.add(disc, rim, glow, hit);
      this.scene.add(grp);

      const entry = { ...s, mesh: grp, hit, collected: false, phase: i * 1.3 };
      this.hiddenSeals.push(entry);
      this.interactables.push({
        id: s.id, titleAr: s.labelAr,
        badgeAr: `🏅 اضغط لجمع الختم الذهبي المخفي — ${s.labelAr}`,
        mesh: hit, worldPos: new THREE.Vector3(s.x, 1.35, s.z), radius: 5.0,
      });
    });
  }

  collectHiddenSeal(sealId) {
    const s = this.hiddenSeals.find((it) => it.id === sealId);
    if (!s || s.collected) return null;
    s.collected = true;
    s.mesh.visible = false;
    this.interactables = this.interactables.filter((it) => it.id !== sealId);
    if (this.nearestInteractable?.id === sealId) {
      this.nearestInteractable = null;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(null);
    }
    return s;
  }

  /* ==================== 4 ARTIFACTS, SCULPTED CARRARA MARBLE & LIVE EASEL ==================== */
  createFramedGalleryPainting(imagePath, secretAr, code, w = 3.7, h = 2.75) {
    const group = new THREE.Group();
    const border = 0.22;
    const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(w + border * 2, h + border * 2, 0.18), this.mats.gold);
    const innerLip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.22), this.mats.woodDark);
    const tex = this.texLoader.load(imagePath); tex.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38 }));
    art.position.z = 0.115;

    if (secretAr) {
      const uvMesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.96), new THREE.MeshBasicMaterial({ map: createUVSecretOverlayTexture(secretAr, code), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      uvMesh.position.z = 0.14; uvMesh.visible = false; group.add(uvMesh); this.uvSecretMeshes.push(uvMesh);
    }

    const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.65), this.mats.gold); lampArm.position.set(0, h * 0.5 + 0.34, 0.35);
    const lampHood = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.35, 10), this.mats.gold); lampHood.rotation.z = Math.PI / 2; lampHood.position.set(0, h * 0.5 + 0.34, 0.66);
    const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe4a0, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
    lampGlow.scale.set(2.2, 1.2, 1); lampGlow.position.set(0, h * 0.5 + 0.15, 0.58);
    group.add(outerFrame, innerLip, art, lampArm, lampHood, lampGlow);
    return group;
  }

  buildFourInteractiveArtifactsAndSculpture() {
    const chapters = this.config.chapters || [];
    const uvSecrets = [
      '«موهبتكِ بدأت منذ أول لونٍ رسمتِه بطفولتكِ البريئة ✦»',
      '«كل خطٍ ترسمينه يحمل روح فنانةٍ حقيقية لا تتكرر ✦»',
      '«تالتة ثانوي مجرد جسرٍ قصير، وعائلتكِ كلها سندكِ ✦»',
      '«كلية الفنون الجميلة تنتظر اسمكِ المشرق بإذن الله ✦»',
    ];
    const stations = [
      { id: 'childhood', x: -4.5, z: -20, wallX: -8.24, rotY: Math.PI / 2, num: '01', shortAr: 'البدايات', ch: chapters[0] },
      { id: 'passion', x: 4.5, z: -34, wallX: 8.24, rotY: -Math.PI / 2, num: '02', shortAr: 'الشغف', ch: chapters[1] },
      { id: 'thanaweya', x: -4.5, z: -48, wallX: -8.24, rotY: Math.PI / 2, num: '03', shortAr: 'تالتة ثانوي', ch: chapters[2] },
      { id: 'fine-arts', x: 4.5, z: -62, wallX: 8.24, rotY: -Math.PI / 2, num: '04', shortAr: 'فنون جميلة', ch: chapters[3] },
    ];

    stations.forEach((st, idx) => {
      const grp = new THREE.Group(); grp.position.set(st.x, 0, st.z);
      const pedBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, 1.5), this.mats.gold); pedBase.position.y = 0.09;
      const pedCol = new THREE.Mesh(new THREE.BoxGeometry(1.16, 1.16, 1.16), this.mats.marble); pedCol.position.y = 0.74;
      const pedTop = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.12, 1.34), this.mats.gold); pedTop.position.y = 1.36;
      grp.add(pedBase, pedCol, pedTop);
      this.circleColliders.push({ x: st.x, z: st.z, r: 1.45 });

      [[-1.18, 1.18], [1.18, 1.18], [1.18, -1.18], [-1.18, -1.18]].forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 0.88, 8), this.mats.gold); post.position.set(px, 0.44, pz);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), this.mats.goldGlow); knob.position.set(px, 0.9, pz);
        grp.add(post, knob);
      });
      const frontRope = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.36, 8), this.mats.velvetRed);
      frontRope.rotation.z = Math.PI / 2; frontRope.position.set(0, 0.76, 1.18); grp.add(frontRope);

      const ring = new THREE.Mesh(new THREE.RingGeometry(1.32, 1.44, 32), new THREE.MeshBasicMaterial({ color: 0xf7d882, transparent: true, opacity: 0.56, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.055; grp.add(ring);

      const artCenter = new THREE.Group(); artCenter.position.y = 2.08;
      if (idx === 0) {
        artCenter.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), this.mats.goldGlow));
        [0xf0c05a, 0xd97854, 0x6f98bd, 0x86ad7e, 0xe095a4].forEach((hex, pi) => {
          const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.86, 6), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.38 }));
          const a = (pi / 5) * Math.PI * 2; pen.position.set(Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46); pen.rotation.set(0.35, a, 0.3); artCenter.add(pen);
        });
      } else if (idx === 1) {
        artCenter.add(
          new THREE.Mesh(new THREE.IcosahedronGeometry(0.54, 0), new THREE.MeshStandardMaterial({ color: 0xf5d076, emissive: 0x9e6f1e, emissiveIntensity: 0.4, metalness: 0.85, roughness: 0.2, wireframe: true })),
          new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), this.mats.marble)
        );
      } else if (idx === 2) {
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.2, clearcoat: 1 });
        const topC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 16), glassMat); topC.position.y = 0.26; topC.rotation.x = Math.PI;
        const botC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 16), glassMat); botC.position.y = -0.26;
        const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 18), this.mats.goldGlow); cap1.position.y = 0.52;
        const cap2 = cap1.clone(); cap2.position.y = -0.52; artCenter.add(topC, botC, cap1, cap2);
      } else {
        const pts = [
          new THREE.Vector2(0.0, -0.48), new THREE.Vector2(0.24, -0.48), new THREE.Vector2(0.20, -0.40),
          new THREE.Vector2(0.09, -0.32), new THREE.Vector2(0.14, -0.16), new THREE.Vector2(0.28, 0.04),
          new THREE.Vector2(0.24, 0.22), new THREE.Vector2(0.11, 0.31), new THREE.Vector2(0.15, 0.44),
          new THREE.Vector2(0.12, 0.54), new THREE.Vector2(0.0, 0.56),
        ];
        artCenter.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), this.mats.marble), new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.022, 10, 44), this.mats.goldGlow));
      }
      grp.add(artCenter);
      this.floatingProps.push({ mesh: artCenter, baseY: 2.08, speed: 1.2 + idx * 0.2 });

      const parchment = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.0), new THREE.MeshBasicMaterial({ map: createParchmentTexture(`التحفة ${st.num}`, st.shortAr), side: THREE.DoubleSide }));
      parchment.position.set(st.x < 0 ? 0.96 : -0.96, 1.58, 0.56); parchment.rotation.y = st.x < 0 ? 0.42 : -0.42;
      grp.add(parchment); this.parchments.push({ mesh: parchment, baseY: 1.58, phase: idx * 1.4 });

      const wallArt = this.createFramedGalleryPainting(st.ch?.image || './assets/art/chapter1-childhood.jpg', uvSecrets[idx], `CH-0${idx + 1}`);
      wallArt.position.set(st.wallX, 3.7, st.z); wallArt.rotation.y = st.rotY; this.scene.add(wallArt);

      const hitbox = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.5, 2.7), new THREE.MeshBasicMaterial({ visible: false }));
      hitbox.position.y = 1.7; hitbox.userData.interactId = st.id; grp.add(hitbox);

      this.interactables.push({
        id: st.id, titleAr: st.ch?.titleAr || st.shortAr,
        badgeAr: `📜 اضغط لفتح التحفة ${st.num} — ${st.shortAr}`,
        mesh: hitbox, worldPos: new THREE.Vector3(st.x, 1.5, st.z), radius: 7.5,
      });
      this.scene.add(grp);
    });
  }

  buildLiveLouvreWallPaintingEasel() {
    this.customPaintingCanvas = createDefaultCustomLouvreCanvas();
    this.customPaintingTex = new THREE.CanvasTexture(this.customPaintingCanvas);
    this.customPaintingTex.colorSpace = THREE.SRGBColorSpace;

    const wallGrp = new THREE.Group(); wallGrp.position.set(8.24, 3.75, -27); wallGrp.rotation.y = -Math.PI / 2;
    const outer = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.15, 0.2), this.mats.goldGlow);
    const canvasPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.75, 2.75), new THREE.MeshStandardMaterial({ map: this.customPaintingTex, roughness: 0.35 }));
    canvasPlane.position.z = 0.12; wallGrp.add(outer, canvasPlane); this.scene.add(wallGrp);

    const easel = new THREE.Group(); easel.position.set(4.2, 0, -27); easel.rotation.y = -0.55;
    [-0.38, 0.38].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.35, 8), this.mats.woodDark);
      leg.position.set(lx, 1.12, 0); leg.rotation.z = -lx * 0.22; leg.rotation.x = -0.14; easel.add(leg);
    });
    const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.3, 8), this.mats.woodDark); backLeg.position.set(0, 1.08, -0.45); backLeg.rotation.x = 0.32;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.18), this.mats.gold); tray.position.set(0, 0.98, 0.14);
    const miniBoard = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.88, 0.05), this.mats.gold); miniBoard.position.set(0, 1.46, 0.04); miniBoard.rotation.x = -0.14;
    const miniArt = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.78), new THREE.MeshBasicMaterial({ map: this.customPaintingTex })); miniArt.position.set(0, 1.46, 0.072); miniArt.rotation.x = -0.14;
    const eRing = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.18, 30), new THREE.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    eRing.rotation.x = -Math.PI / 2; eRing.position.y = 0.055;
    const eHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), new THREE.MeshBasicMaterial({ visible: false })); eHit.position.y = 1.4; eHit.userData.interactId = 'easel';
    easel.add(backLeg, tray, miniBoard, miniArt, eRing, eHit);
    this.circleColliders.push({ x: 4.2, z: -27, r: 0.95 }); this.scene.add(easel);

    this.interactables.push({
      id: 'easel', titleAr: 'مرسم اللوفر التفاعلي',
      badgeAr: '🎨 اضغط لرسم لوحة وتعليقها على جدار متحف اللوفر',
      mesh: eHit, worldPos: new THREE.Vector3(4.2, 1.5, -27), radius: 7.5,
    });
  }

  updateCustomLouvreWallPainting(sourceCanvas) {
    const ctx = this.customPaintingCanvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0, this.customPaintingCanvas.width, this.customPaintingCanvas.height);
    this.customPaintingTex.needsUpdate = true;
  }

  buildRoyalFamilyVaultAndManifesto() {
    const vaultGrp = new THREE.Group(); vaultGrp.position.set(-4.0, 0, -75);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.05, 1.42), this.mats.marble); ped.position.y = 0.525;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.48), this.mats.velvetRed); cloth.position.y = 1.06;
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.62, 0.86), this.mats.woodDark); boxBody.position.y = 1.42;
    const boxRim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.1, 0.92), this.mats.goldGlow); boxRim.position.y = 1.72;
    const boxLid = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1.26, 14, 1, false, 0, Math.PI), this.mats.gold); boxLid.rotation.z = Math.PI / 2; boxLid.position.y = 1.74;

    const envOrbit = new THREE.Group(); envOrbit.position.y = 2.48;
    for (let i = 0; i < 4; i++) {
      const env = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), this.mats.goldGlow);
      const a = (i / 4) * Math.PI * 2; env.position.set(Math.cos(a) * 0.64, Math.sin(i * 1.4) * 0.12, Math.sin(a) * 0.64); env.rotation.y = -a; envOrbit.add(env);
    }
    this.floatingProps.push({ mesh: envOrbit, baseY: 2.48, speed: 1.5 });

    const vRing = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.48, 32), new THREE.MeshBasicMaterial({ color: 0xffd87a, transparent: true, opacity: 0.72, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    vRing.rotation.x = -Math.PI / 2; vRing.position.y = 0.055;
    const vHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 2.5), new THREE.MeshBasicMaterial({ visible: false })); vHit.position.y = 1.6; vHit.userData.interactId = 'vault';
    vaultGrp.add(ped, cloth, boxBody, boxRim, boxLid, envOrbit, vRing, vHit);
    this.circleColliders.push({ x: -4.0, z: -75, r: 1.3 }); this.scene.add(vaultGrp);
    this.interactables.push({ id: 'vault', titleAr: 'صندوق رسائل العائلة ليمنى', badgeAr: '💌 اضغط لفتح صندوق رسائل العائلة السحابي', mesh: vHit, worldPos: new THREE.Vector3(-4.0, 1.6, -75), radius: 7.5 });

    const manGrp = new THREE.Group(); manGrp.position.set(4.0, 0, -75);
    const mPed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 1.12), this.mats.marble); mPed.position.y = 0.25;
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.62, 0.28), this.mats.marble); stele.position.y = 1.8;
    const steleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.75, 0.2), this.mats.goldGlow); steleFrame.position.y = 1.8;
    const manTex = createParchmentTexture('الرسالة الأهم ★', 'ثانوية عامة البداية');
    const manFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.28), new THREE.MeshBasicMaterial({ map: manTex })); manFace.position.set(0, 1.8, 0.155);
    const manFaceBack = manFace.clone(); manFaceBack.position.z = -0.155; manFaceBack.rotation.y = Math.PI;
    const mHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.4, 2.3), new THREE.MeshBasicMaterial({ visible: false })); mHit.position.y = 1.7; mHit.userData.interactId = 'manifesto';
    manGrp.add(mPed, steleFrame, stele, manFace, manFaceBack, vRing.clone(), mHit);
    this.circleColliders.push({ x: 4.0, z: -75, r: 1.3 }); this.scene.add(manGrp);
    this.interactables.push({ id: 'manifesto', titleAr: 'الرسالة الأهم في ختام الرحلة', badgeAr: '★ اضغط لقراءة الرسالة الأهم وكبسولة الطمأنينة', mesh: mHit, worldPos: new THREE.Vector3(4.0, 1.7, -75), radius: 7.5 });
  }

  /* ==================== GRAND ROTUNDA & REALISTIC 3D CAKE ("1" & "9") ==================== */
  createExtrudedDigit1() {
    const s = new THREE.Shape();
    s.moveTo(-0.22, 0); s.lineTo(0.24, 0); s.lineTo(0.24, 0.13); s.lineTo(0.09, 0.13); s.lineTo(0.09, 0.92); s.lineTo(-0.07, 0.92);
    s.lineTo(-0.26, 0.71); s.lineTo(-0.17, 0.61); s.lineTo(-0.06, 0.73); s.lineTo(-0.06, 0.13); s.lineTo(-0.22, 0.13); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -0.055); return geo;
  }

  createExtrudedDigit9() {
    const s = new THREE.Shape();
    s.moveTo(-0.18, 0.02); s.quadraticCurveTo(0.18, 0.0, 0.28, 0.28); s.quadraticCurveTo(0.34, 0.56, 0.25, 0.76);
    s.quadraticCurveTo(0.14, 0.95, -0.04, 0.94); s.quadraticCurveTo(-0.28, 0.93, -0.31, 0.66); s.quadraticCurveTo(-0.33, 0.4, -0.06, 0.37);
    s.quadraticCurveTo(0.08, 0.36, 0.15, 0.44); s.quadraticCurveTo(0.13, 0.18, -0.14, 0.15); s.lineTo(-0.22, 0.15); s.closePath();
    const hole = new THREE.Path(); hole.absellipse(-0.02, 0.65, 0.125, 0.145, 0, Math.PI * 2, true, 0); s.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.11, bevelEnabled: true, bevelThickness: 0.024, bevelSize: 0.02, bevelSegments: 3 });
    geo.translate(0, 0, -0.055); return geo;
  }

  createCandleFlame(x, y, z) {
    const holder = new THREE.Group(); holder.position.set(x, y, z);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.11, 8), this.mats.woodDark); wick.position.y = 0.04; holder.add(wick);
    const fGrp = new THREE.Group(); fGrp.position.y = 0.14;
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 12), new THREE.MeshBasicMaterial({ color: 0xffa834, transparent: true, opacity: 0.94 })); outer.position.y = 0.06;
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.16, 10), new THREE.MeshBasicMaterial({ color: 0xfff8dc })); inner.position.y = 0.03;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc858, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.2, 1.2, 1); glow.position.y = 0.08; fGrp.add(outer, inner, glow); holder.add(fGrp);
    const smoke = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xcfc7be, transparent: true, opacity: 0, depthWrite: false }));
    smoke.scale.set(0.45, 0.45, 1); smoke.position.y = 0.16; holder.add(smoke);
    this.cakeFlames.push({ group: fGrp, glow, phase: x * 4 + 1.2 }); this.smokePuffs.push({ sprite: smoke, baseY: 0.16 });
    return holder;
  }

  buildGrandRotundaAndRealisticCake() {
    // Strictly meets Grande Galerie at z = -80.4 (center z = -93, radius 12.6 -> ZERO coplanar overlap!)
    const rotunda = new THREE.Group(); rotunda.position.set(0, 0, -93);
    this.circleColliders.push({ x: 0, z: -93, r: 3.3 });

    const floor = new THREE.Mesh(new THREE.CircleGeometry(12.6, 44), this.mats.marble); floor.rotation.x = -Math.PI / 2; floor.position.y = 0;
    const goldInlay = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.48, 44), this.mats.goldOverlay); goldInlay.rotation.x = -Math.PI / 2; goldInlay.position.y = 0.05;
    const rotWall = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 10.6, 32, 1, true, Math.PI * 0.18, Math.PI * 1.64), new THREE.MeshStandardMaterial({ map: this.wallPanelTex, roughness: 0.65, side: THREE.BackSide })); rotWall.position.y = 5.3;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(12.6, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: 0xf4cf7c, metalness: 0.78, roughness: 0.22, wireframe: true, transparent: true, opacity: 0.48 })); dome.position.y = 9.6;
    rotunda.add(floor, goldInlay, rotWall, dome);

    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2; if (Math.cos(a) > 0.72) continue;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 9.6, 12), this.mats.marble); col.position.set(Math.sin(a) * 10.8, 4.8, Math.cos(a) * 10.8); rotunda.add(col);
    }

    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.24, 36), this.mats.marble); dais1.position.y = 0.12;
    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.85, 36), this.mats.marble); dais2.position.y = 0.65;
    const daisRim = new THREE.Mesh(new THREE.TorusGeometry(2.32, 0.045, 10, 42), this.mats.goldGlow); daisRim.rotation.x = Math.PI / 2; daisRim.position.y = 1.07;
    rotunda.add(dais1, dais2, daisRim);

    const cake = new THREE.Group(); cake.position.y = 2.48; cake.scale.setScalar(1.06);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 0.16, 24), this.mats.gold); foot.position.y = -1.28;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.48, 18), this.mats.marble); stem.position.y = -0.98;
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.72, 0.12, 34), this.mats.marble); platter.position.y = -0.7;
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.5, 0.88, 34), this.mats.cakeCream); tier1.position.y = -0.2;
    const tier1Glaze = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.07, 34), this.mats.cakeGanache); tier1Glaze.position.y = 0.23;
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.98, 0.74, 30), this.mats.cakeCream); tier2.position.y = 0.63;
    const tier2Glaze = new THREE.Mesh(new THREE.CylinderGeometry(0.975, 0.975, 0.06, 30), this.mats.cakeGanache); tier2Glaze.position.y = 1.0;
    cake.add(foot, stem, platter, tier1, tier1Glaze, tier2, tier2Glaze);

    const dripGeo = new THREE.CapsuleGeometry(0.055, 0.26, 6, 8), pearlGeo = new THREE.SphereGeometry(0.085, 8, 8);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, len = 0.72 + ((i * 7) % 5) * 0.2;
      const d = new THREE.Mesh(dripGeo, this.mats.cakeGanache); d.scale.set(1, len, 1); d.position.set(Math.cos(a) * 1.485, 0.15 - len * 0.13, Math.sin(a) * 1.485);
      const p = new THREE.Mesh(pearlGeo, this.mats.cakeFrosting); p.scale.set(1.15, 0.78, 1.15); p.position.set(Math.cos(a) * 1.54, -0.59, Math.sin(a) * 1.54);
      cake.add(d, p);
    }
    const berryGeo = new THREE.SphereGeometry(0.125, 10, 8), macGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.11, 14);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      if (i % 2 === 0) { const fruit = new THREE.Mesh(berryGeo, this.mats.strawberry); fruit.scale.set(1, 1.25, 1); fruit.position.set(Math.cos(a) * 1.24, 0.36, Math.sin(a) * 1.24); cake.add(fruit); }
      else { const mac = new THREE.Mesh(macGeo, i % 4 === 1 ? this.mats.macaronRose : this.mats.macaronGold); mac.position.set(Math.cos(a) * 1.24, 0.34, Math.sin(a) * 1.24); cake.add(mac); }
    }

    const c1 = new THREE.Group(); c1.position.set(-0.34, 1.12, 0.02);
    const d1 = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.candleNumber);
    const d1Trim = new THREE.Mesh(this.createExtrudedDigit1(), this.mats.gold); d1Trim.scale.set(1.06, 1.04, 0.72); d1Trim.position.z = -0.02;
    c1.add(d1, d1Trim, this.createCandleFlame(0.02, 0.94, 0));

    const c9 = new THREE.Group(); c9.position.set(0.34, 1.12, 0.02);
    const d9 = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.candleNumber);
    const d9Trim = new THREE.Mesh(this.createExtrudedDigit9(), this.mats.gold); d9Trim.scale.set(1.06, 1.04, 0.72); d9Trim.position.z = -0.02;
    c9.add(d9, d9Trim, this.createCandleFlame(-0.02, 0.95, 0));
    cake.add(c1, c9);
    this.cakeGroup = cake; rotunda.add(cake);

    const fCount = this.isMobile ? 160 : 280, fPos = new Float32Array(fCount * 3), fCol = new Float32Array(fCount * 3);
    this.fireworkVels = [];
    const fPal = [new THREE.Color(0xffe89e), new THREE.Color(0xf2b94c), new THREE.Color(0xffffff), new THREE.Color(0xe07b58), new THREE.Color(0x98c494)];
    for (let i = 0; i < fCount; i++) {
      const c = fPal[i % fPal.length]; fCol[i * 3] = c.r; fCol[i * 3 + 1] = c.g; fCol[i * 3 + 2] = c.b;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), spd = 2.8 + Math.random() * 5.8;
      this.fireworkVels.push({ x: Math.sin(ph) * Math.cos(th) * spd, y: Math.abs(Math.cos(ph)) * spd + 2.2, z: Math.sin(ph) * Math.sin(th) * spd });
    }
    const fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); fGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
    this.fireworksPoints = new THREE.Points(fGeo, new THREE.PointsMaterial({ size: 0.45, map: this.glowTex, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.fireworksPoints.position.set(0, 3.8, -93); this.scene.add(this.fireworksPoints);

    const cakeHit = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 4.6, 14), new THREE.MeshBasicMaterial({ visible: false }));
    cakeHit.position.y = 2.3; cakeHit.userData.interactId = 'cake'; rotunda.add(cakeHit);
    this.interactables.push({ id: 'cake', titleAr: 'تورتة العام التاسع عشر', badgeAr: '🎂 اضغط على التورتة للاحتفال وإطفاء شمعتي 1 و 9', mesh: cakeHit, worldPos: new THREE.Vector3(0, 2.2, -93), radius: 12.5 });
    this.scene.add(rotunda);
  }

  /* ==================== REAL MOCAP VISITORS, PARIS POLICE OFFICER & CUSTOM ANAS HABIB 3D GUIDE ==================== */
  loadOptimizedMocapHumanVisitorsAndAnasGuide() {
    Promise.all([
      this.gltfLoader.loadAsync('./assets/models/visitor-rpm.glb'),
      this.gltfLoader.loadAsync('./assets/models/anim-walk.glb'),
      this.gltfLoader.loadAsync('./assets/models/anim-idle.glb'),
    ]).then(([avatarGltf, walkGltf, idleGltf]) => {
      const walkClip = walkGltf.animations[0];
      const idleClip = idleGltf.animations[0];
      if (walkClip) {
        walkClip.tracks.forEach((tr) => {
          if (tr.name === 'Hips.position') {
            const vals = tr.values, x0 = vals[0], z0 = vals[2];
            for (let i = 0; i < vals.length; i += 3) { vals[i] = x0; vals[i + 2] = z0; }
          }
        });
      }

      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.36, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const shadowGeo = new THREE.CircleGeometry(0.42, 14);

      // ---- 1. BUILD CUSTOM 3D «أنس حبيب» TOUR GUIDE FOR يوسف (Curly Hair + Chinstrap Beard + White Striped Jersey!) ----
      const anas = SkeletonUtils.clone(avatarGltf.scene);
      const jerseyTex = createAnasJerseyTexture();
      let headBone = null;

      anas.traverse((o) => {
        if (o.isBone && o.name === 'Head') headBone = o;
        if (o.isMesh) {
          o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false;
          // Hide cap/hat so his iconic voluminous curly hair crown is clearly visible!
          if (o.name === 'Mesh' || o.material?.name === 'Wolf3D_Headwear') o.visible = false;
          // Distinctive slim dark chinstrap beard along his jawline (matching all 3 photos!)
          if (o.name === 'Wolf3D_Beard') {
            o.visible = true;
            o.material = o.material.clone();
            o.material.color.setHex(0x1f1713);
            o.material.roughness = 0.85;
          }
          // Light-olive youthful skin tone
          if (o.material?.name === 'Wolf3D_Skin') {
            o.material = o.material.clone();
            o.material.color.setHex(0xf2d4bd);
          }
          // Crisp white athletic jersey with black collar & 3 dark shoulder stripes (Photo 3!)
          if (o.material?.name === 'Wolf3D_Outfit_Top') {
            o.material = o.material.clone();
            o.material.map = jerseyTex;
            o.material.color.setHex(0xffffff);
            o.material.roughness = 0.65;
            o.material.needsUpdate = true;
          }
          // Dark charcoal slim jeans
          if (o.material?.name === 'Wolf3D_Outfit_Bottom') {
            o.material = o.material.clone();
            o.material.color.setHex(0x1a1d24);
          }
          // Crisp white streetwear sneakers
          if (o.material?.name === 'Wolf3D_Outfit_Footwear') {
            o.material = o.material.clone();
            o.material.color.setHex(0xf4f5f7);
          }
        }
      });

      // Attach sculpted 34-ringlet dark brown Curly Hair cluster directly to Anas's Head bone!
      if (headBone) {
        const curlGrp = new THREE.Group();
        const curlMat = new THREE.MeshStandardMaterial({ color: 0x1b130e, roughness: 0.92, metalness: 0.04 });
        const curlGeo = new THREE.IcosahedronGeometry(0.036, 1);
        const curlCoords = [
          // Top voluminous curly crown
          [0, 0.21, 0.02, 1.25], [-0.05, 0.20, 0.03, 1.15], [0.05, 0.20, 0.03, 1.15],
          [-0.08, 0.17, 0.01, 1.1], [0.08, 0.17, 0.01, 1.1], [0, 0.21, -0.04, 1.2],
          [-0.06, 0.19, -0.05, 1.15], [0.06, 0.19, -0.05, 1.15], [-0.09, 0.15, -0.04, 1.05],
          [0.09, 0.15, -0.04, 1.05], [0, 0.17, -0.09, 1.15], [-0.05, 0.15, -0.09, 1.05],
          [0.05, 0.15, -0.09, 1.05], [-0.09, 0.11, -0.06, 0.95], [0.09, 0.11, -0.06, 0.95],
          [0, 0.12, -0.10, 1.0], [-0.06, 0.11, -0.09, 0.92], [0.06, 0.11, -0.09, 0.92],
          // Signature loose forehead curls falling softly over brow (just like his 3 photos!)
          [-0.055, 0.175, 0.082, 1.0], [-0.015, 0.185, 0.092, 1.05], [0.025, 0.182, 0.090, 1.02],
          [0.062, 0.172, 0.078, 0.98], [-0.035, 0.152, 0.098, 0.85], [0.015, 0.154, 0.102, 0.82],
          [0.048, 0.148, 0.094, 0.8], [-0.082, 0.145, 0.055, 0.92], [0.082, 0.145, 0.055, 0.92],
          [-0.094, 0.12, 0.015, 0.85], [0.094, 0.12, 0.015, 0.85], [-0.02, 0.22, 0.06, 1.05],
          [0.03, 0.22, 0.05, 1.05], [-0.07, 0.20, 0.06, 0.95], [0.07, 0.20, 0.06, 0.95],
          [0, 0.23, -0.01, 1.1],
        ];
        curlCoords.forEach(([x, y, z, s], idx) => {
          const m = new THREE.Mesh(curlGeo, curlMat);
          m.position.set(x, y, z);
          m.scale.set(s, s * 0.92, s);
          m.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4);
          curlGrp.add(m);
        });
        headBone.add(curlGrp);
      }

      // Floating VIP Guide Nameplate above Anas Habib
      const anasBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('أنس حبيب', 'المرشد السياحي الخاص ليوسف', '#76d0ff'), transparent: true, depthWrite: false }));
      anasBadge.scale.set(1.55, 0.44, 1);
      anasBadge.position.set(0, 2.28, 0);
      const anasLight = new THREE.PointLight(0xfff1d6, 2.6, 5.5, 1.4);
      anasLight.position.set(0, 1.9, 1.1);
      const anasDisc = new THREE.Mesh(shadowGeo, shadowMat);
      anasDisc.rotation.x = -Math.PI / 2; anasDisc.position.y = 0.045;
      anas.scale.setScalar(1.04);
      this.anasGroup.add(anas, anasBadge, anasLight, anasDisc);

      this.anasMixer = new THREE.AnimationMixer(anas);
      if (walkClip) {
        this.anasWalkAction = this.anasMixer.clipAction(walkClip);
        this.anasWalkAction.setEffectiveTimeScale(1.12);
      }
      if (idleClip) {
        this.anasIdleAction = this.anasMixer.clipAction(idleClip);
        this.anasIdleAction.play();
      }
      this.anasLoaded = true;

      // ---- 2. PARIS PEDESTRIANS + UNIFORMED POLICE OFFICER (DISTANCE-CULLED FOR 60FPS!) ----
      const outfits = [
        { top: 0x163875, bot: 0x0f1a33, hat: true, beard: false }, // Paris Police Officer outside Precinct!
        { top: 0x5c202a, bot: 0x1d1f26, hat: false, beard: false },
        { top: 0x9c7b56, bot: 0x24201c, hat: false, beard: true },
        { top: 0x2e4238, bot: 0x212328, hat: true, beard: true },
        { top: 0xd8cfc2, bot: 0x2a3140, hat: false, beard: false },
        { top: 0x222c3d, bot: 0x181a20, hat: false, beard: false },
      ];
      const allSpecs = [
        { x: -24.8, z0: 169, z1: 169, rotY: Math.PI * 0.5, walking: false, scale: 1.02 }, // Police Officer!
        { x: 5.0, z0: 365, z1: 270, speed: 1.35, walking: true, scale: 0.99 },
        { x: -5.2, z0: 255, z1: 155, speed: 1.25, walking: true, scale: 0.98 },
        { x: 5.0, z0: 110, z1: 22, speed: 1.2, walking: true, scale: 0.97 },
        { x: -6.1, z0: -19.5, z1: -19.5, rotY: -Math.PI * 0.48, walking: false, scale: 0.97 },
        { x: 6.1, z0: -61.5, z1: -61.5, rotY: Math.PI * 0.5, walking: false, scale: 0.96 },
      ];
      const specs = this.isMobile ? [allSpecs[0], allSpecs[1], allSpecs[3], allSpecs[4]] : allSpecs;

      specs.forEach((sp, idx) => {
        const clone = SkeletonUtils.clone(avatarGltf.scene);
        const style = outfits[idx % outfits.length];
        clone.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false;
            if (o.name === 'Wolf3D_Beard') o.visible = style.beard;
            if (o.name === 'Mesh' || o.material?.name === 'Wolf3D_Headwear') o.visible = style.hat;
            if (o.material?.name === 'Wolf3D_Outfit_Top') { o.material = o.material.clone(); o.material.color.setHex(style.top); }
            else if (o.material?.name === 'Wolf3D_Outfit_Bottom') { o.material = o.material.clone(); o.material.color.setHex(style.bot); }
          }
        });
        const disc = new THREE.Mesh(shadowGeo, shadowMat);
        disc.rotation.x = -Math.PI / 2; disc.position.y = 0.045;
        clone.add(disc);
        clone.scale.setScalar(sp.scale);
        clone.position.set(sp.x, 0, sp.z0);
        if (!sp.walking && sp.rotY !== undefined) clone.rotation.y = sp.rotY;

        const mixer = new THREE.AnimationMixer(clone);
        const clip = sp.walking ? walkClip : idleClip;
        if (clip) {
          const action = mixer.clipAction(clip);
          action.time = (idx * 0.47) % clip.duration;
          action.setEffectiveTimeScale(sp.walking ? sp.speed * 0.85 : 0.9);
          action.play();
        }
        this.scene.add(clone);
        this.humanVisitors.push({ root: clone, mixer, ...sp, progress: (idx * 0.31) % 1, dir: 1 });
      });
    }).catch(() => { /* ignore if offline */ });
  }

  /* ==================== LIVE WEATHER PARTICLES (AUTUMN LEAVES / SPRING PETALS / PARIS RAIN) ==================== */
  buildWeatherParticles() {
    const count = this.isMobile ? 32 : 64;
    this.leafInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ color: 0xf6cf76, side: THREE.DoubleSide, transparent: true, opacity: 0.72 }), count);
    this.leafDummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      this.fallingLeaves.push({ x: (Math.random() - 0.5) * 34, y: 1 + Math.random() * 14, z: (Math.random() - 0.5) * 60, spd: 0.4 + Math.random() * 0.65, ph: Math.random() * Math.PI * 2 });
    }
    this.scene.add(this.leafInst);

    // 3D Parisian Raindrops (follows camera smoothly!)
    const rCount = this.isMobile ? 220 : 420;
    const rPos = new Float32Array(rCount * 6); // 2 vertices per rain streak
    for (let i = 0; i < rCount; i++) {
      const rx = (Math.random() - 0.5) * 44, ry = Math.random() * 22, rz = (Math.random() - 0.5) * 44;
      rPos[i * 6] = rx; rPos[i * 6 + 1] = ry; rPos[i * 6 + 2] = rz;
      rPos[i * 6 + 3] = rx; rPos[i * 6 + 4] = ry - 0.55; rPos[i * 6 + 5] = rz;
    }
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
    this.rainPositions = rPos;
    this.rainDrops = new THREE.LineSegments(rGeo, new THREE.LineBasicMaterial({ color: 0xbcdcf5, transparent: true, opacity: 0.48 }));
    this.rainDrops.visible = false;
    this.scene.add(this.rainDrops);
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.34, 0.34);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.pawTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.rotation.x = -Math.PI / 2; m.visible = false; this.scene.add(m);
      this.pawPrints.push({ mesh: m, life: 0 });
    }
  }

  spawnPawPrint(pos, yaw) {
    if (this.activeGuideType !== 'bobs') return;
    const slot = this.pawPrints[this.pawIdx];
    this.pawIdx = (this.pawIdx + 1) % this.pawPrints.length;
    const side = (this.pawIdx % 2 === 0 ? 1 : -1) * 0.13;
    slot.mesh.position.set(pos.x + Math.cos(yaw) * side, 0.058, pos.z - Math.sin(yaw) * side);
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw);
    slot.life = 1.0; slot.mesh.visible = true;
  }

  /* ==================== 40-BONE GOLDEN PERSIAN CAT «القطة بوبس» ==================== */
  loadAnatomicallyFixedBobsPersianCat() {
    this.guideRoot.position.copy(this.guidePos);
    this.guideRoot.add(this.bobsGroup, this.anasGroup);
    this.scene.add(this.guideRoot);

    const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.56, 0.66, 32), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    beaconRing.rotation.x = -Math.PI / 2; beaconRing.position.y = 0.055;
    this.guideBeaconRing = beaconRing;
    this.guideRoot.add(beaconRing);

    const gHit = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.0, 10), new THREE.MeshBasicMaterial({ visible: false }));
    gHit.position.y = 1.0; gHit.userData.interactId = 'guide';
    this.guideRoot.add(gHit); this.guideHitMesh = gHit;

    // Bobs Cat specific visuals
    const catShadow = new THREE.Mesh(new THREE.CircleGeometry(0.46, 18), new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    catShadow.rotation.x = -Math.PI / 2; catShadow.position.y = 0.045;
    const bobsBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('القطة بوبس', 'مرشدة جولة باريس واللوفر', '#f2cf78'), transparent: true, depthWrite: false }));
    bobsBadge.scale.set(1.32, 0.38, 1); bobsBadge.position.set(0, 1.25, 0);
    const catLight = new THREE.PointLight(0xffe9c2, 2.8, 5.4, 1.4); catLight.position.set(0, 1.25, 0.85);
    this.bobsGroup.add(catShadow, bobsBadge, catLight);

    this.catYarn = new THREE.Group();
    this.catYarn.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: 0xe8b954, roughness: 0.72 })));
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.132, 0.016, 8, 18), this.mats.goldGlow); b.rotation.set(i * 0.8, i * 1.1, i * 0.5); this.catYarn.add(b); }
    this.catYarn.position.set(0.28, 0.13, 0.62); this.catYarn.visible = false; this.bobsGroup.add(this.catYarn);

    const coatTex = this.texLoader.load('./assets/models/persian-cat-coat.jpg'); coatTex.colorSpace = THREE.SRGBColorSpace; coatTex.flipY = false;

    this.gltfLoader.load('./assets/models/persian-cat.glb', (gltf) => {
      const model = gltf.scene;
      const animatedBoneNames = new Set();
      if (gltf.animations?.[0]) gltf.animations[0].tracks.forEach((tr) => animatedBoneNames.add(tr.name.split('.')[0]));

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 0.86 / Math.max(0.01, size.y);
      model.scale.setScalar(scale);
      const box2 = new THREE.Box3().setFromObject(model);
      const c2 = box2.getCenter(new THREE.Vector3());
      model.position.set(-c2.x, -box2.min.y, -c2.z);
      this.bobsGroup.add(model);
      model.updateMatrixWorld(true);

      const invWorldQ = new THREE.Quaternion(), worldQ = new THREE.Quaternion();
      model.traverse((obj) => {
        if (obj.isBone) {
          obj.getWorldQuaternion(worldQ);
          invWorldQ.copy(worldQ).invert();
          this.catBoneInfo[obj.name] = {
            bone: obj,
            restQuat: obj.quaternion.clone(),
            isStatic: !animatedBoneNames.has(obj.name),
            axisRight: new THREE.Vector3(1, 0, 0).applyQuaternion(invWorldQ).normalize(),
            axisUp: new THREE.Vector3(0, 1, 0).applyQuaternion(invWorldQ).normalize(),
            axisFwd: new THREE.Vector3(0, 0, 1).applyQuaternion(invWorldQ).normalize(),
          };
        }
        if (obj.isMesh) {
          obj.frustumCulled = false;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (!m) return;
            const isEye = m.name === 'material';
            m.map = coatTex; m.roughness = isEye ? 0.08 : 0.76; m.metalness = isEye ? 0.12 : 0.02;
            if (!isEye) { m.emissive = new THREE.Color(0x523418); m.emissiveIntensity = 0.2; }
            m.needsUpdate = true;
          });
        }
      });

      const jawInfo = this.catBoneInfo.Wolf_Head_JawSHJnt_12;
      if (jawInfo) {
        this.catTongue = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.028, 6, 8), new THREE.MeshStandardMaterial({ color: 0xec808d, roughness: 0.35 }));
        this.catTongue.position.set(0, 0.048, 0.042); this.catTongue.rotation.x = Math.PI * 0.42; this.catTongue.scale.setScalar(0.001); jawInfo.bone.add(this.catTongue);
      }
      const neckInfo = this.catBoneInfo.Wolf_Neck_01SHJnt_16;
      if (neckInfo) { const bell = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), this.mats.goldGlow); bell.position.set(0, 0.036, 0.09); neckInfo.bone.add(bell); }

      if (gltf.animations?.length) {
        this.catMixer = new THREE.AnimationMixer(model);
        const act = this.catMixer.clipAction(gltf.animations[0]); act.setEffectiveTimeScale(0.88); act.play();
      }
      this.catLoaded = true;
    });
  }

  applyWorldBoneRot(name, pitchRad = 0, yawRad = 0, rollRad = 0) {
    const info = this.catBoneInfo[name];
    if (!info) return;
    if (pitchRad) { this._qDelta.setFromAxisAngle(info.axisRight, pitchRad); info.bone.quaternion.multiply(this._qDelta); }
    if (yawRad) { this._qDelta.setFromAxisAngle(info.axisUp, yawRad); info.bone.quaternion.multiply(this._qDelta); }
    if (rollRad) { this._qDelta.setFromAxisAngle(info.axisFwd, rollRad); info.bone.quaternion.multiply(this._qDelta); }
  }

  resolveCollisions(pos) {
    const playerR = 0.55;
    const inRotunda = pos.z < -81, inLouvre = pos.z < -6 && !inRotunda, inPlaza = pos.z >= -6 && pos.z <= 32;
    // On the 525m Boulevard, keep pedestrian safely on the 15m wide Champs-Élysées promenade (x: -7.2..+7.2) so cars don't hit you!
    const maxW = inRotunda ? 9.6 : inLouvre ? 6.3 : inPlaza ? 12.6 : 7.0;
    pos.x = Math.max(-maxW, Math.min(maxW, pos.x));
    pos.z = Math.max(-101, Math.min(428, pos.z));

    for (const b of this.boxColliders) {
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX)), cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < playerR * playerR) {
        if (d2 > 0.00001) { const d = Math.sqrt(d2); pos.x = cx + (dx / d) * playerR; pos.z = cz + (dz / d) * playerR; }
        else { pos.x = Math.abs(pos.x - b.minX) < Math.abs(b.maxX - pos.x) ? b.minX - playerR : b.maxX + playerR; }
      }
    }
    for (const c of this.circleColliders) {
      const dx = pos.x - c.x, dz = pos.z - c.z, minDist = c.r + playerR, d = Math.hypot(dx, dz);
      if (d < minDist && d > 0.0001) { pos.x = c.x + (dx / d) * minDist; pos.z = c.z + (dz / d) * minDist; }
    }
  }

  /* ==================== TRUE PAUSE-AND-EXPLAIN GUIDED TOUR API ==================== */
  setGuidePhase(phase) {
    this.guidePhase = phase;
    if (phase !== 'idle') this.stopDroneTour();
    if (this.callbacks.onGuidePhaseChange) this.callbacks.onGuidePhaseChange(phase, this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
  }

  startGuidedTour() {
    this.cabRideActive = false;
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const dist = Math.hypot(wp.x - this.playerPos.x, wp.z - this.playerPos.z);
    if (dist < 4.5 && this.guidePhase !== 'explaining') {
      // Already at this landmark -> pause & explain immediately!
      this.enterExplainState(this.currentWaypointIdx);
    } else {
      this.setGuidePhase('walking');
    }
  }

  advanceGuidedTour() {
    this.cabRideActive = false;
    if (this.currentWaypointIdx < STORY_WAYPOINTS.length - 1) {
      this.currentWaypointIdx++;
      if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
      this.setGuidePhase('walking');
    } else {
      this.setGuidePhase('idle');
    }
  }

  pauseGuidedTour() {
    this.cabRideActive = false;
    this.setGuidePhase('idle');
  }

  enterExplainState(idx) {
    const wp = STORY_WAYPOINTS[idx];
    this.setGuidePhase('explaining');
    // Smoothly orient camera toward the landmark & guide!
    if (wp) {
      const lx = wp.lookAtX !== undefined ? wp.lookAtX : wp.guideX;
      const lz = wp.lookAtZ !== undefined ? wp.lookAtZ : wp.z - 5;
      this.targetYaw = Math.atan2(-(lx - this.playerPos.x), -(lz - this.playerPos.z));
      this.targetPitch = idx <= 4 ? 0.06 : -0.01;
      if (this.callbacks.onTourStopArrive) this.callbacks.onTourStopArrive(idx, wp);
    }
  }

  startBoulevardCabRide() {
    this.stopDroneTour();
    this.setGuidePhase('idle');
    this.cabRideActive = true;
    if (this.playerPos.z < 55) this.playerPos.set(0, 1.68, 392);
    this.targetYaw = 0; this.targetPitch = 0.04;
    if (this.callbacks.onCabRideChange) this.callbacks.onCabRideChange(true);
  }

  stopBoulevardCabRide() {
    if (!this.cabRideActive) return;
    this.cabRideActive = false;
    if (this.callbacks.onCabRideChange) this.callbacks.onCabRideChange(false);
  }

  startDroneTour() { this.stopBoulevardCabRide(); this.setGuidePhase('idle'); this.droneActive = true; this.droneTime = 0; if (this.callbacks.onDroneChange) this.callbacks.onDroneChange(true); }
  stopDroneTour() { if (!this.droneActive) return; this.droneActive = false; if (this.callbacks.onDroneChange) this.callbacks.onDroneChange(false); }

  setJoystickInput(forward, strafe) {
    this.moveInput.forward = forward; this.moveInput.strafe = strafe;
    if (Math.abs(forward) > 0.12 || Math.abs(strafe) > 0.12) {
      if (this.guidePhase === 'walking') this.setGuidePhase('idle');
      this.stopDroneTour();
      this.stopBoulevardCabRide();
    }
  }

  teleportToWaypoint(idx, triggerExplain = true) {
    this.stopDroneTour();
    this.stopBoulevardCabRide();
    const safeIdx = Math.max(0, Math.min(STORY_WAYPOINTS.length - 1, idx));
    const wp = STORY_WAYPOINTS[safeIdx];
    if (!wp) return;
    this.currentWaypointIdx = safeIdx;
    const zOffset = safeIdx <= 3 ? 6.0 : safeIdx === 4 ? 4.5 : safeIdx === STORY_WAYPOINTS.length - 1 ? 2.6 : 3.2;
    this.playerPos.set(wp.x, 1.68, wp.z + zOffset);
    this.resolveCollisions(this.playerPos);
    this.guidePos.set(wp.guideX, 0, wp.guideZ);
    this.guideRoot.position.copy(this.guidePos);
    const lx = wp.lookAtX !== undefined ? wp.lookAtX : wp.guideX;
    const lz = wp.lookAtZ !== undefined ? wp.lookAtZ : wp.z - 4;
    this.targetYaw = Math.atan2(-(lx - this.playerPos.x), -(lz - this.playerPos.z));
    this.playerYaw = this.targetYaw;
    this.targetPitch = safeIdx <= 4 ? 0.05 : -0.01;
    this.playerPitch = this.targetPitch;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(safeIdx, wp);
    if (triggerExplain) this.enterExplainState(safeIdx);
    else this.setGuidePhase('idle');
  }

  triggerCatAction(action) { this.catState = action; this.catStateTimer = 0; this.catStateDur = action === 'groom' ? 5.5 : action === 'play' ? 6.2 : 3.4; }
  triggerCakeCelebration(blowOut = true) { this.candlesLit = !blowOut; this.candleWind = 0; if (blowOut) { this.smokeTime = 0; this.launchFireworks(); } else this.smokeTime = -1; }
  setCandleWind(lvl) { this.candleWind = Math.max(0, Math.min(1, Number(lvl) || 0)); }

  launchFireworks() {
    this.fireworksTime = 0;
    const pos = this.fireworksPoints.geometry.attributes.position.array;
    for (let i = 0; i < this.fireworkVels.length; i++) { pos[i * 3] = (Math.random() - 0.5) * 1.4; pos[i * 3 + 1] = (Math.random() - 0.5) * 0.6; pos[i * 3 + 2] = (Math.random() - 0.5) * 1.4; }
    this.fireworksPoints.geometry.attributes.position.needsUpdate = true; this.fireworksPoints.material.opacity = 1;
  }

  captureLouvrePostcard(filterCss = 'none') {
    this.renderFrame();
    const out = document.createElement('canvas'); out.width = 1280; out.height = 760;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#0f0b08'; ctx.fillRect(0, 0, 1280, 760);
    ctx.save();
    if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
    ctx.drawImage(this.canvas, 34, 34, 1212, 620);
    ctx.restore();
    ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 1240, 720);
    ctx.fillStyle = 'rgba(13, 9, 6, 0.92)'; ctx.fillRect(24, 654, 1232, 84);
    ctx.textAlign = 'center';
    ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 28px Amiri, Georgia, serif';
    ctx.fillText('جولة باريس ومتحف اللوفر 3D — رحلة يمنى (العام التاسع عشر) ✦ HEY', 640, 695);
    ctx.direction = 'ltr'; ctx.fillStyle = '#d6ab52'; ctx.font = '600 13px Cinzel, Georgia, serif';
    ctx.fillText('PARIS GRAND BOULEVARD & MUSÉE DU LOUVRE  •  ENG / MOHAMED TAREK', 640, 723);
    const a = document.createElement('a'); a.download = `Yomna-Paris-Louvre-3D-${Date.now()}.png`; a.href = out.toDataURL('image/png'); a.click();
  }

  getMiniMapTelemetry() {
    const distToLouvre = Math.max(0, Math.round(this.playerPos.z - 7));
    const deg = (((-this.playerYaw * 180) / Math.PI) % 360 + 360) % 360;
    const headingAr = deg < 45 || deg >= 315 ? 'شمال • نحو اللوفر' : deg < 135 ? 'شرق • جاليري مول' : deg < 225 ? 'جنوب • قوس النصر' : 'غرب • برج إيفل';
    return {
      px: this.playerPos.x, pz: this.playerPos.z, yaw: this.playerYaw,
      gx: this.guidePos.x, gz: this.guidePos.z, guideType: this.activeGuideType,
      seals: this.hiddenSeals, distToLouvre, headingAr,
      weather: this.weatherMode, guidePhase: this.guidePhase,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 900;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.aspect = aspect;
      this.baseFov = aspect < 0.85 ? 64 : 53;
      this.camera.updateProjectionMatrix();
      this.applyQualitySettings();
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      this.keys[e.code] = true;
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (this.guidePhase === 'walking') this.setGuidePhase('idle');
        this.stopDroneTour();
        this.stopBoulevardCabRide();
      }
      if (e.code === 'KeyE' && this.nearestInteractable && this.callbacks.onInteract) this.callbacks.onInteract(this.nearestInteractable.id);
      if (e.code === 'KeyZ') this.setZoom(!this.zoomed);
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });

    this.canvas.addEventListener('pointerdown', (e) => { this.isLooking = true; this.dragMoved = 0; this.lookStart.x = e.clientX; this.lookStart.y = e.clientY; });
    window.addEventListener('pointermove', (e) => {
      if (!this.isLooking) return;
      const dx = e.clientX - this.lookStart.x, dy = e.clientY - this.lookStart.y;
      this.dragMoved += Math.hypot(dx, dy); this.lookStart.x = e.clientX; this.lookStart.y = e.clientY;
      this.targetYaw -= dx * 0.004; this.targetPitch = Math.max(-0.48, Math.min(0.62, this.targetPitch - dy * 0.003));
    }, { passive: true });

    const endLook = (e) => {
      if (!this.isLooking) return; this.isLooking = false;
      if (this.dragMoved < 10 && e && typeof e.clientX === 'number') {
        this._ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        this.raycaster.setFromCamera(this._ndc, this.camera);
        const targets = this.interactables.map((it) => it.mesh);
        if (this.guideHitMesh) targets.push(this.guideHitMesh);
        const hits = this.raycaster.intersectObjects(targets, false);
        if (hits.length > 0 && hits[0].object.userData.interactId) {
          const id = hits[0].object.userData.interactId;
          if (id === 'guide') {
            this.triggerCatAction('pet');
            if (this.callbacks.onGuideTap) this.callbacks.onGuideTap(this.activeGuideType);
          } else if (this.callbacks.onInteract) this.callbacks.onInteract(id);
        }
      }
    };
    window.addEventListener('pointerup', endLook);
    window.addEventListener('pointercancel', endLook);
    document.addEventListener('visibilitychange', () => { this.isHidden = document.hidden; });
  }

  renderFrame() {
    if (this.qualityMode === 'ultra' && this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  /* ==================== SILKY 60FPS SIMULATION LOOP ==================== */
  animate() {
    if (this.disposed) return;
    requestAnimationFrame(() => this.animate());
    if (this.isHidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (this.portalPaused) {
      this.portalTickAccum += dt;
      if (this.portalTickAccum < 0.066) return;
      this.portalTickAccum = 0;
    }

    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-9.0 * dt);

    // Smooth Telephoto Zoom FOV
    const desiredFov = this.zoomed ? 24 : this.baseFov;
    if (Math.abs(this.camera.fov - desiredFov) > 0.08) {
      this.camera.fov += (desiredFov - this.camera.fov) * damp;
      this.camera.updateProjectionMatrix();
    }

    // ---- 1. UPDATE 3 WORKING TRAFFIC LIGHT INTERSECTIONS (GREEN -> YELLOW -> RED) ----
    for (const inter of this.intersections) {
      inter.timer = (inter.timer + dt) % 19.2;
      const nextState = inter.timer < 9.5 ? 'green' : inter.timer < 11.7 ? 'yellow' : 'red';
      if (nextState !== inter.state) {
        inter.state = nextState;
        const { rMat, yMat, gMat, redOff, yelOff, grnOff } = inter.mats;
        for (const l of inter.lights) {
          l.r[0].material = l.r[1].material = nextState === 'red' ? rMat : redOff;
          l.y[0].material = l.y[1].material = nextState === 'yellow' ? yMat : yelOff;
          l.g[0].material = l.g[1].material = nextState === 'green' ? gMat : grnOff;
          l.halo.material.color.setHex(nextState === 'red' ? 0xff3b30 : nextState === 'yellow' ? 0xffcc00 : 0x22e568);
          l.halo.position.y = l.baseY + (nextState === 'red' ? 0.54 : nextState === 'yellow' ? 0 : -0.54);
        }
      }
    }

    // ---- 2. UPDATE LIVE AI CARS & FLASHING PARIS POLICE LIGHTBARS ----
    for (const pb of this.policeLightBars) {
      const flash = Math.sin(t * 14 + pb.phase) > 0;
      pb.redGlow.material.opacity = flash ? 0.98 : 0.08;
      pb.blueGlow.material.opacity = flash ? 0.08 : 0.98;
    }

    for (let i = 0; i < this.trafficVehicles.length; i++) {
      const v = this.trafficVehicles[i];
      let targetSpd = v.maxSpeed;

      // Check upcoming Red / Yellow traffic light before crosswalk!
      for (const inter of this.intersections) {
        if (inter.state === 'green') continue;
        const distAhead = (inter.z - v.z) * v.dirZ;
        if (distAhead > 3.5 && distAhead < 19) {
          targetSpd = distAhead < 7.5 ? 0 : Math.min(targetSpd, v.maxSpeed * ((distAhead - 6.5) / 12.5));
        }
      }
      // Maintain safe following gap behind other cars in the same lane
      for (let j = 0; j < this.trafficVehicles.length; j++) {
        if (i === j) continue;
        const other = this.trafficVehicles[j];
        if (Math.abs(other.laneX - v.laneX) > 1.5 || other.dirZ !== v.dirZ) continue;
        const gap = (other.z - v.z) * v.dirZ;
        if (gap > 0 && gap < 14) {
          targetSpd = gap < 8.5 ? 0 : Math.min(targetSpd, other.speed);
        }
      }

      const accel = targetSpd < v.speed ? 14 : 6.5;
      v.speed += (targetSpd - v.speed) * Math.min(1, accel * dt);
      v.z += v.dirZ * v.speed * dt;
      if (v.dirZ < 0 && v.z < 38) v.z = 444;
      if (v.dirZ > 0 && v.z > 444) v.z = 38;
      v.root.position.z = v.z;

      // Spin all 4 real wheels smoothly proportional to speed
      if (v.speed > 0.1 && Math.abs(v.z - this.camera.position.z) < 130) {
        const spin = v.speed * dt * 2.1;
        for (const w of v.wheels) w.rotation.x += spin;
      }
    }

    // ---- 3. PLAYER / CAMERA / PAUSE-AND-EXPLAIN GUIDED TOUR MOVEMENT ----
    if (this.droneActive) {
      this.droneTime += dt;
      const p = Math.min(1, this.droneTime / 28.0);
      const z = THREE.MathUtils.lerp(405, -86, p);
      const y = z > 18 ? THREE.MathUtils.lerp(24, 3.2, (405 - z) / 387) : 2.2 + Math.sin(p * Math.PI * 5) * 0.2;
      const x = z > 20 ? Math.sin(p * Math.PI * 2.5) * 9.5 : Math.sin(p * Math.PI * 6) * 1.1;
      this.camera.position.set(x, y, z);
      this._tmpLook.set(z > 40 ? -12 : 0, z > 40 ? 10 : 2.3, z - 24);
      this.camera.lookAt(this._tmpLook);
      this.playerPos.set(0, 1.68, Math.max(-87, Math.min(410, z)));
      if (p >= 1) this.stopDroneTour();
    } else if (!this.portalPaused) {
      let fwd = this.moveInput.forward, str = this.moveInput.strafe;
      if (this.keys.KeyW || this.keys.ArrowUp) fwd += 1;
      if (this.keys.KeyS || this.keys.ArrowDown) fwd -= 1;
      if (this.keys.KeyD || this.keys.ArrowRight) str += 1;
      if (this.keys.KeyA || this.keys.ArrowLeft) str -= 1;

      let movedStep = 0;
      if (this.cabRideActive) {
        // Smooth scenic Champs-Élysées Express Boulevard Cruise toward Louvre!
        const destZ = 18;
        const rem = this.playerPos.z - destZ;
        if (rem > 1.2) {
          movedStep = Math.min(rem, 24.0 * dt);
          this.playerPos.z -= movedStep;
          this.playerPos.x += (0 - this.playerPos.x) * Math.min(1, 3 * dt);
          if (!this.isLooking) {
            this.targetYaw += (0 - this.targetYaw) * Math.min(1, 2.5 * dt);
            this.targetPitch += (0.04 - this.targetPitch) * Math.min(1, 2.5 * dt);
          }
        } else {
          this.stopBoulevardCabRide();
          this.currentWaypointIdx = 4;
          this.enterExplainState(4);
        }
      } else if (this.guidePhase === 'walking') {
        const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
        const dx = wp.x - this.playerPos.x, dz = wp.z - this.playerPos.z, dist = Math.hypot(dx, dz);
        if (!this.isLooking) {
          const desiredYaw = Math.atan2(-dx, -dz);
          let diff = desiredYaw - this.targetYaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.targetYaw += diff * (1 - Math.exp(-3.6 * dt));
          this.targetPitch += (0.02 - this.targetPitch) * (1 - Math.exp(-3.0 * dt));
        }
        // Smart outdoor/indoor speed: brisk 14.5m/s along the 500m boulevard (or 22m/s fast), smooth 5.6m/s inside Louvre!
        const outdoorSpd = this.cruiseFast ? 23.0 : 14.5;
        const indoorSpd = this.cruiseFast ? 8.5 : 5.6;
        const moveRate = this.playerPos.z > 24 ? outdoorSpd : indoorSpd;
        if (dist > 2.2) {
          movedStep = Math.min(dist, moveRate * dt);
          this.playerPos.x += (dx / dist) * movedStep;
          this.playerPos.z += (dz / dist) * movedStep;
        } else {
          // TRUE PAUSE-AND-EXPLAIN: STOP at the landmark, turn to player, and wait for user to read & click Next!
          this.enterExplainState(this.currentWaypointIdx);
        }
      } else {
        const mag = Math.hypot(fwd, str);
        if (mag > 0.05) {
          const normF = fwd / Math.max(1, mag), normS = str / Math.max(1, mag);
          const freeSpd = this.playerPos.z > 24 ? (this.cruiseFast ? 18.0 : 10.5) : (this.cruiseFast ? 8.0 : 6.2);
          movedStep = freeSpd * dt;
          const sinY = Math.sin(this.playerYaw), cosY = Math.cos(this.playerYaw);
          this.playerPos.x += (-sinY * normF + cosY * normS) * movedStep;
          this.playerPos.z += (-cosY * normF - sinY * normS) * movedStep;
        }
      }

      if (movedStep > 0) {
        this.walkBobPhase += movedStep * (this.playerPos.z > 24 ? 1.15 : 2.1);
        this.footstepAccum += movedStep;
        if (this.footstepAccum > (this.playerPos.z > 24 ? 3.2 : 2.1)) {
          this.footstepAccum = 0;
          if (this.callbacks.onFootstep) this.callbacks.onFootstep(this.playerPos.z < -6 ? 'wood' : 'stone');
        }
      }
      this.resolveCollisions(this.playerPos);
      this.playerYaw += (this.targetYaw - this.playerYaw) * damp;
      this.playerPitch += (this.targetPitch - this.playerPitch) * damp;
      this.camera.position.set(this.playerPos.x, this.playerPos.y + Math.sin(this.walkBobPhase) * 0.025, this.playerPos.z);
      this.camera.rotation.order = 'YXZ'; this.camera.rotation.y = this.playerYaw; this.camera.rotation.x = this.playerPitch;
    } else {
      this.camera.position.set(this.playerPos.x, this.playerPos.y, this.playerPos.z);
      this.camera.rotation.order = 'YXZ'; this.camera.rotation.y = Math.sin(t * 0.25) * 0.04; this.camera.rotation.x = 0.03;
    }

    // Automatic Sliding Glass Doors of the Louvre Pyramid
    for (const d of this.pyramidDoors) {
      const near = (Math.abs(this.playerPos.z - d.worldZ) < 9.0 && Math.abs(this.playerPos.x) < 4.5) || Math.abs(this.guidePos.z - d.worldZ) < 8.5 || (this.droneActive && Math.abs(this.camera.position.z - d.worldZ) < 14);
      d.openAmt += ((near ? 1 : 0) - d.openAmt) * (1 - Math.exp(-5.5 * dt));
      d.leftDoor.position.x = d.closedLeftX - d.openAmt * 1.55;
      d.rightDoor.position.x = d.closedRightX + d.openAmt * 1.55;
    }

    if (!this.enteredLouvreOnce && this.playerPos.z < -7.5) {
      this.enteredLouvreOnce = true;
      if (this.callbacks.onEnterLouvre) this.callbacks.onEnterLouvre();
    }

    this.playerLantern.position.set(this.camera.position.x, 3.2, this.camera.position.z - 2.4);
    if (this.skyGroup) this.skyGroup.position.set(this.camera.position.x, 0, this.camera.position.z);

    if (this.guidePhase === 'idle' && !this.droneActive && !this.portalPaused) {
      let bestIdx = this.currentWaypointIdx, bestD = Infinity;
      for (let i = 0; i < STORY_WAYPOINTS.length; i++) {
        const d = Math.abs(this.playerPos.z - STORY_WAYPOINTS[i].z);
        if (d < bestD) { bestD = d; bestIdx = i; }
      }
      if (bestIdx !== this.currentWaypointIdx) {
        this.currentWaypointIdx = bestIdx;
        if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(bestIdx, STORY_WAYPOINTS[bestIdx]);
      }
    }

    let closest = null, minD = Infinity;
    for (const it of this.interactables) {
      const d = Math.hypot(this.playerPos.x - it.worldPos.x, this.playerPos.z - it.worldPos.z);
      if (d < it.radius && d < minD) { minD = d; closest = it; }
    }
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(closest);
    }

    // ---- 4. UNIFIED DUAL 3D TOUR GUIDE (القطة بوبس OR أنس حبيب) ----
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const targetGX = wp.guideX;
    const targetGZ = this.guidePhase === 'explaining'
      ? wp.guideZ
      : Math.max(wp.guideZ, this.playerPos.z - 6.8);
    const gdx = targetGX - this.guidePos.x, gdz = targetGZ - this.guidePos.z, gDist = Math.hypot(gdx, gdz);
    let guideSpd = 0;
    if (gDist > 0.35 && !this.portalPaused) {
      const maxGSpd = this.playerPos.z > 24 ? (this.cruiseFast ? 24 : 15.5) : 7.5;
      const step = Math.min(gDist, Math.max(2.8, gDist * 1.65) * dt, maxGSpd * dt);
      this.guidePos.x += (gdx / gDist) * step;
      this.guidePos.z += (gdz / gDist) * step;
      guideSpd = step / Math.max(0.001, dt);
      this.catStride += step * 3.8;
      this.catStepAccum += step;
      if (this.catStepAccum > 0.62) { this.catStepAccum = 0; this.spawnPawPrint(this.guidePos, this.guideYaw); }
    }
    this.guideRoot.position.copy(this.guidePos);
    if (this.guideBeaconRing) {
      this.guideBeaconRing.rotation.z = t * 1.1;
      this.guideBeaconRing.scale.setScalar(1 + Math.sin(t * 3.2) * 0.07);
      this.guideBeaconRing.material.color.setHex(this.activeGuideType === 'anas' ? 0x76d0ff : 0xffe08a);
    }

    const guideMoving = guideSpd > 0.3;
    // When stopped / explaining, guide faces DIRECTLY toward the player so it feels like a genuine live tour!
    const desiredGuideYaw = guideMoving
      ? Math.atan2(gdx, gdz)
      : Math.atan2(this.playerPos.x - this.guidePos.x, this.playerPos.z - this.guidePos.z) + (this.activeGuideType === 'bobs' && this.guidePhase !== 'explaining' ? 0.35 : 0);
    let gyDiff = desiredGuideYaw - this.guideYaw;
    while (gyDiff > Math.PI) gyDiff -= Math.PI * 2; while (gyDiff < -Math.PI) gyDiff += Math.PI * 2;
    this.guideYaw += gyDiff * (1 - Math.exp(-6.2 * dt));
    this.guideRoot.rotation.y = this.guideYaw;

    // Update Anas Habib Mocap Walk / Idle crossfade
    if (this.anasLoaded && this.activeGuideType === 'anas') {
      this.anasMixer.update(dt);
      const want = guideMoving ? 'walk' : 'idle';
      if (want !== this.anasCurAnim && this.anasWalkAction && this.anasIdleAction) {
        this.anasCurAnim = want;
        if (want === 'walk') {
          this.anasWalkAction.reset().fadeIn(0.22).play();
          this.anasIdleAction.fadeOut(0.22);
        } else {
          this.anasIdleAction.reset().fadeIn(0.25).play();
          this.anasWalkAction.fadeOut(0.25);
        }
      }
    }

    // Update Bobs Cat 40-bone animations
    this.catStateTimer += dt;
    if (!guideMoving && this.guidePhase !== 'explaining') {
      if (this.catState !== 'guide' && this.catStateTimer > this.catStateDur) { this.catState = 'guide'; this.catStateTimer = 0; this.catStateDur = 9 + Math.random() * 5; }
      else if (this.catState === 'guide' && this.catStateTimer > this.catStateDur) { this.catState = Math.random() < 0.5 ? 'groom' : 'play'; this.catStateTimer = 0; this.catStateDur = 5.4; }
    } else if (this.guidePhase === 'explaining') {
      this.catState = 'guide';
    }
    this.catYarn.visible = this.activeGuideType === 'bobs' && this.catState === 'play' && !guideMoving;
    if (this.catYarn.visible) { this.catYarn.position.x = Math.sin(t * 3.0) * 0.28; this.catYarn.position.y = 0.13 + Math.abs(Math.sin(t * 4.8)) * 0.18; this.catYarn.rotation.z += dt * 3.8; }

    if (this.catLoaded && this.activeGuideType === 'bobs') {
      if (this.catMixer) this.catMixer.update(dt);
      for (const name in this.catBoneInfo) { const info = this.catBoneInfo[name]; if (info.isStatic) info.bone.quaternion.copy(info.restQuat); }
      const w = guideMoving ? Math.min(1, guideSpd / 2.4) : 0;
      if (w > 0.05) {
        const s = this.catStride, fl = Math.sin(s), fr = Math.sin(s + Math.PI), hl = Math.sin(s + Math.PI * 0.92), hr = Math.sin(s - Math.PI * 0.08);
        this.applyWorldBoneRot('Wolf_Spine_02SHJnt_20', Math.sin(s) * 0.04 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_Spine_04SHJnt_18', -Math.sin(s) * 0.045 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_FrontLeg_HipSHJnt_4', -fl * 0.28 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_FrontLeg_KneeSHJnt_3', Math.max(0, Math.cos(s)) * 0.34 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -fr * 0.28 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', Math.max(0, Math.cos(s + Math.PI)) * 0.34 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_HindLeg_HipSHJnt_27', -hl * 0.25 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_l_HindLeg_Knee2SHJnt_25', -Math.max(0, Math.cos(s + Math.PI * 0.92)) * 0.32 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_HindLeg_HipSHJnt_33', -hr * 0.25 * w, 0, 0);
        this.applyWorldBoneRot('Wolf_r_HindLeg_Knee2SHJnt_31', -Math.max(0, Math.cos(s - Math.PI * 0.08)) * 0.32 * w, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.catState === 'groom') {
        const smoothIn = Math.min(1, this.catStateTimer * 2.2), lk = Math.sin(t * 5.6);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -0.58 * smoothIn, 0.1 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', 0.48 * smoothIn, 0, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_AnkleSHJnt_8', 0.28 * smoothIn, 0, 0);
        this.applyWorldBoneRot('Wolf_Neck_01SHJnt_16', 0.16 * smoothIn, -0.1 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', (0.14 + lk * 0.045) * smoothIn, -0.06 * smoothIn, 0);
        this.applyWorldBoneRot('Wolf_Head_JawSHJnt_12', (0.06 + Math.max(0, lk) * 0.06) * smoothIn, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(Math.max(0.001, Math.max(0, lk) * smoothIn));
      } else if (this.catState === 'play') {
        const bat = Math.max(0, Math.sin(t * 4.8));
        this.applyWorldBoneRot('Wolf_r_FrontLeg_HipSHJnt_10', -bat * 0.48, 0.08 * bat, 0);
        this.applyWorldBoneRot('Wolf_r_FrontLeg_KneeSHJnt_9', bat * 0.36, 0, 0);
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', 0.14, Math.sin(t * 3.0) * 0.18, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else if (this.guidePhase === 'explaining') {
        // Expressive explaining head-nods & attentive ear posture!
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.08 + Math.sin(t * 2.6) * 0.06, Math.sin(t * 1.4) * 0.1, 0);
        this.applyWorldBoneRot('Wolf_Head_JawSHJnt_12', Math.max(0, Math.sin(t * 5.2)) * 0.045, 0, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else {
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.04, -0.16 + Math.sin(t * 1.2) * 0.06, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      }
      ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bn, i) => {
        this.applyWorldBoneRot(bn, i === 0 ? -0.1 : -0.04, Math.sin(t * (guideMoving ? 4.8 : 2.1) - i * 0.55) * (guideMoving ? 0.16 : 0.12), 0);
      });
    }

    for (const p of this.pawPrints) {
      if (p.life > 0) { p.life -= dt * 0.35; p.mesh.material.opacity = Math.max(0, p.life * 0.82); if (p.life <= 0) p.mesh.visible = false; }
    }

    // Distance-Culled Mocap Visitors & Police Officer
    for (const v of this.humanVisitors) {
      const nearCam = Math.abs(this.camera.position.z - v.root.position.z) < 62;
      if (nearCam) v.mixer.update(dt);
      if (v.walking) {
        const span = Math.max(1, Math.abs(v.z1 - v.z0));
        v.progress += (v.speed * dt * v.dir) / span;
        if (v.progress >= 1) { v.progress = 1; v.dir = -1; }
        else if (v.progress <= 0) { v.progress = 0; v.dir = 1; }
        v.root.position.z = THREE.MathUtils.lerp(v.z0, v.z1, v.progress);
        const movingPlusZ = (v.z1 > v.z0 ? v.dir > 0 : v.dir < 0);
        v.root.rotation.y = movingPlusZ ? 0 : Math.PI;
      }
    }

    for (const s of this.hiddenSeals) {
      if (!s.collected) { s.mesh.rotation.y += dt * 1.4; s.mesh.position.y = 1.35 + Math.sin(t * 2.2 + s.phase) * 0.12; }
    }

    for (let i = this.skyLanterns.length - 1; i >= 0; i--) {
      const ln = this.skyLanterns[i]; ln.life += dt; ln.mesh.position.y += ln.vy * dt;
      ln.mesh.position.x = ln.baseX + Math.sin(t * 0.7 + ln.phase) * 1.2; ln.mesh.rotation.y += dt * 0.4;
      if (ln.life > ln.maxLife) { this.scene.remove(ln.mesh); this.skyLanterns.splice(i, 1); }
    }

    for (let i = this.flyingCoins.length - 1; i >= 0; i--) {
      const fc = this.flyingCoins[i]; fc.t += dt * 1.15; const p = Math.min(1, fc.t);
      fc.mesh.position.lerpVectors(fc.p0, fc.p1, p); fc.mesh.position.y += Math.sin(p * Math.PI) * 2.4;
      fc.mesh.rotation.x += dt * 14; fc.mesh.rotation.y += dt * 9;
      if (fc.t >= 1) { this.scene.remove(fc.mesh); this.flyingCoins.splice(i, 1); }
    }

    // Eiffel Sparkle, Clouds, Rain / Petals / Leaves, Props, Cake
    if (this.sparkleShowTimer > 0) this.sparkleShowTimer = Math.max(0, this.sparkleShowTimer - dt);
    const sparkleBoost = this.sparkleShowTimer > 0;
    for (const cl of this.cloudSprites) { cl.ang += cl.speed * dt; cl.sprite.position.set(Math.cos(cl.ang) * cl.dist, cl.h, Math.sin(cl.ang) * cl.dist); }
    if (this.eiffelBeacon) this.eiffelBeacon.scale.setScalar((sparkleBoost ? 13 : 9.5) + Math.sin(t * (sparkleBoost ? 7 : 3.5)) * 1.8);
    if (this.eiffelSearchlightRig) this.eiffelSearchlightRig.rotation.y = t * (sparkleBoost ? 1.1 : 0.55);
    for (const sp of this.eiffelSparkles) {
      const spd = sparkleBoost ? sp.speed * 2.6 : sp.speed;
      const baseOp = sparkleBoost ? 0.35 : (this.timeOfDay === 'day' ? 0.08 : 0.25);
      sp.sprite.material.opacity = baseOp + Math.max(0, Math.sin(t * spd + sp.phase)) * (sparkleBoost ? 0.65 : 0.6);
      sp.sprite.scale.setScalar(sparkleBoost ? 2.4 : 1.5);
    }

    for (const fr of this.fountainRings) { const f = (t * 0.55 + fr.phase) % 1; fr.mesh.scale.setScalar(0.6 + f * 3.6); fr.mesh.material.opacity = (1 - f) * 0.48; }
    for (const fp of this.floatingProps) { fp.mesh.position.y = fp.baseY + Math.sin(t * fp.speed) * 0.09; fp.mesh.rotation.y += dt * 0.4; }
    for (const pc of this.parchments) pc.mesh.position.y = pc.baseY + Math.sin(t * 1.8 + pc.phase) * 0.07;

    if (this.rainDrops && this.rainDrops.visible) {
      this.rainDrops.position.set(this.camera.position.x, 0, this.camera.position.z);
      const rPos = this.rainPositions;
      const dropDy = 24 * dt;
      for (let i = 0; i < rPos.length; i += 6) {
        rPos[i + 1] -= dropDy; rPos[i + 4] -= dropDy;
        if (rPos[i + 1] < 0.2) { rPos[i + 1] = 22; rPos[i + 4] = 21.45; }
      }
      this.rainDrops.geometry.attributes.position.needsUpdate = true;
    }

    if (this.leafInst && this.leafInst.visible) {
      const camZ = this.camera.position.z;
      for (let i = 0; i < this.fallingLeaves.length; i++) {
        const lf = this.fallingLeaves[i]; lf.y -= lf.spd * dt; if (lf.y < 0.2) lf.y = 14;
        this.leafDummy.position.set(lf.x + Math.sin(t + lf.ph) * 0.45, lf.y, camZ + lf.z);
        this.leafDummy.rotation.set(t + lf.ph, t * 0.7, lf.ph);
        this.leafDummy.updateMatrix(); this.leafInst.setMatrixAt(i, this.leafDummy.matrix);
      }
      this.leafInst.instanceMatrix.needsUpdate = true;
    }

    if (this.cakeGroup) this.cakeGroup.rotation.y = Math.sin(t * 0.52) * 0.24;
    for (const f of this.cakeFlames) {
      f.group.visible = this.candlesLit;
      if (this.candlesLit) {
        const fl = Math.sin(t * 13 + f.phase) * 0.1 + Math.sin(t * 21 + f.phase) * 0.06;
        f.group.scale.set(1 + fl * 0.45, Math.max(0.45, 1 + fl - this.candleWind * 0.35), 1 + fl * 0.45);
        f.group.rotation.z = Math.sin(t * 9 + f.phase) * 0.08 + this.candleWind * 0.55;
        f.glow.material.opacity = 0.85 + fl * 0.5;
      }
    }
    if (this.smokeTime >= 0) {
      this.smokeTime += dt;
      for (const sm of this.smokePuffs) { const p = Math.min(1, this.smokeTime / 3.0); sm.sprite.position.y = sm.baseY + p * 1.4; sm.sprite.scale.setScalar(0.35 + p * 1.1); sm.sprite.material.opacity = Math.sin(p * Math.PI) * 0.45; }
      if (this.smokeTime >= 3.0) this.smokeTime = -1;
    }
    if (this.fireworksTime >= 0) {
      this.fireworksTime += dt;
      const arr = this.fireworksPoints.geometry.attributes.position.array;
      for (let i = 0; i < this.fireworkVels.length; i++) { const v = this.fireworkVels[i]; arr[i * 3] += v.x * dt; arr[i * 3 + 1] += (v.y - 3.6 * this.fireworksTime) * dt; arr[i * 3 + 2] += v.z * dt; }
      this.fireworksPoints.geometry.attributes.position.needsUpdate = true;
      this.fireworksPoints.material.opacity = Math.max(0, 1 - this.fireworksTime / 3.6);
      if (this.fireworksTime > 3.6) this.fireworksTime = -1;
    }

    this.renderFrame();
  }
}
