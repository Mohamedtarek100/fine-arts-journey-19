/**
 * =========================================================================
 *  AAA PHOTOREALISTIC PARIS METROPOLIS & MUSÉE DU LOUVRE 3D ENGINE (v27)
 *  - Real Poly Haven 1K HDRI IBL (RGBELoader + PMREMGenerator: Sunset & Night)
 *  - AssetManager with self-hosted WebAssembly DRACOLoader + GLTFLoader
 *  - Real Photogrammetry PBR Asphalt (4-map: Diff/Nor/Rough/AO) w/ Wet Shimmer
 *  - Real Drivable Draco-Compressed BMW Vision Sports Car (GTA Chase Cam,
 *    Steering & Rotating Wheels, Clearcoat HDRI Reflections, Volumetric Beams,
 *    Brake Lights, Speedometer & Live Clearcoat Paint Color Switcher)
 *  - Enterable 2-Story Parisian Apartment «Maison de Paris» w/ Walkable Stairs
 *    & Open 2nd-Floor Balcony Overlooking Champs-Élysées & Eiffel Tower
 *  - Real Modular CC0 City Building & 3D Tree GLBs + Volumetric Louvre Spotlights
 *  - 100% Collision-Free Guided Tour Corridor Pathing inside Louvre & Paris
 *  - Dual Custom 3D Tour Guides: القطة بوبس (default) & أنس حبيب (for يوسف)
 *  - Selective UnrealBloomPass + SMAAPass + ACESFilmicToneMapping
 *  - Designed & Developed by ENG / Mohamed Tarek • HEY Edition
 * =========================================================================
 */

import * as THREE from './vendor/three.module.min.js';
import * as SkeletonUtils from './vendor/SkeletonUtils.js';
import { EffectComposer } from './vendor/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from './vendor/postprocessing/SMAAPass.js';
import { OutputPass } from './vendor/postprocessing/OutputPass.js';
import { ASSET_MANIFEST } from './src/assets/assetManifest.js?v=27';
import { AssetManager } from './src/assets/AssetManager.js?v=27';
import {
  createGlowTexture,
  createLightBeamTexture,
  createCloudTexture,
  createHaussmannFacadePBR,
  createModernApartmentTowerPBR,
  createParisMallFacadePBR,
  createDistrictSignTexture,
  createAnasJerseyTexture,
  createGuideBadgeTexture,
  createLouvrePalacePBR,
  createMansardRoofPBR,
  createEiffelLatticeTexture,
  createLouvreWallPanelPBR,
  createParchmentTexture,
  createUVSecretOverlayTexture,
  createDefaultCustomLouvreCanvas,
  createLouvreSignTexture,
  createPawPrintTexture,
} from './louvre-assets.js?v=27';

export const BMW_PAINTS = [
  { id: 'sapphire', labelAr: 'أزرق ياقوتي BMW', hex: 0x0b3b78 },
  { id: 'crimson', labelAr: 'أحمر رياضي BMW', hex: 0x9e121e },
  { id: 'champagne', labelAr: 'ذهبي ملكي HEY', hex: 0xc99c3e },
  { id: 'obsidian', labelAr: 'أسود ليلي لامع', hex: 0x12141a },
  { id: 'alpine', labelAr: 'أبيض لؤلؤي نقي', hex: 0xe8edf4 },
];

export const STORY_WAYPOINTS = [
  {
    id: 'champs-elysees',
    zoneAr: 'الشانزليزيه • بداية جولة الـ 500 متر',
    labelAr: 'الشانزليزيه، سيارة BMW وقوس النصر',
    x: 0, z: 378, guideX: -1.6, guideZ: 374, lookAtX: -10, lookAtY: 14, lookAtZ: 240, interactId: 'bmw',
    bobsSlides: [
      'أهلاً بك في باريس بإضاءة HDRI الواقعية، أنا القطة بوبس. بجانبك سيارة BMW الرياضية الحقيقية التي يمكنك ركوبها وقيادتها بنفسك بطول شارع الشانزليزيه.',
      'وأمامك على اليسار «منزل باريس المفتوح» الذي يمكنك دخوله والصعود إلى طابقه الثاني وشرفة الأتيليه المطلة على برج إيفل، ثم نكمل معاً حتى متحف اللوفر.',
    ],
    anasSlides: [
      'أهلاً يا يوسف يا بطل، أنا أنس حبيب المرشد السياحي بتاعك النهارده في باريس. بص جنبك على اليمين: سيارة BMW حقيقية تقدر تركبها وتسوقها بنفسك في الشانزليزيه.',
      'وكمان قدامنا البيت الباريسي اللي تقدر تدخله وتطلع الدور التاني والبلكونة تتفرج منها على برج إيفل والعربيات. جاهز نبدأ الجولة؟',
    ],
    funFactAr: 'تلميح القيادة: يمكنك ركوب سيارة BMW في أي وقت من الزر العلوي أو بالضغط عليها وقيادتها بـ WASD أو عصا التحكم.',
  },
  {
    id: 'paris-mall',
    zoneAr: 'منزل باريس المفتوح وجاليري مول',
    labelAr: 'منزل باريس القابل للدخول وجاليري مول',
    x: 0, z: 298, guideX: 2.2, guideZ: 294, lookAtX: -22, lookAtY: 5.5, lookAtZ: 300, interactId: 'house-stairs',
    bobsSlides: [
      'على يسارك «منزل باريس المفتوح» بمدخله المقوّس المفتوح: يمكنك الدخول إلى الصالون الباريسي والصعود على الدرج الرخامي إلى الطابق الثاني والشرفة المطلة على باريس.',
      'وعلى يمينك «جاليري باريس مول» بقبته الزجاجية ومباني الشارع المعمارية الحقيقية وإشارات المرور التي تنظم حركة السيارات.',
    ],
    anasSlides: [
      'هنا يا يوسف على شمالك «منزل باريس المفتوح» تقدر تدخل فيه فعلياً وتطلع على السلم للدور التاني وتقف في البلكونة فوق الشارع، وعلى يمينك «جاليري باريس مول».',
      'ولما تخلص جولة البيت والمول اضغط «أكمل الجولة» عشان نروح ميدان الكونكورد وقسم شرطة باريس.',
    ],
    funFactAr: 'ميزة استكشافية: ادخل القوس الذهبي لمنزل باريس واصعد السلم أو اضغط زر الطابق الثاني للاستمتاع بإطلالة البلكونة العلوية.',
  },
  {
    id: 'police-plaza',
    zoneAr: 'ميدان الكونكورد • شرطة باريس',
    labelAr: 'ميدان الكونكورد وقسم شرطة باريس',
    x: 0, z: 174, guideX: -2.4, guideZ: 170, lookAtX: -30, lookAtY: 7, lookAtZ: 170,
    bobsSlides: [
      'وصلنا إلى ميدان الكونكورد حيث يتمركز قسم شرطة باريس الوطني ودوريات الشرطة بأضوائها الحمراء والزرقاء وإشارة المرور الحية.',
      'من هنا يقترب برج إيفل بوضوح ساحر على يسارك. يمكنك استخدام عدسة التقريب البصري لتأمل تفاصيله الهندسية الدقيقة.',
    ],
    anasSlides: [
      'هنا ميدان الكونكورد وقسم شرطة باريس على شمالك، وعربيات البوليس بتلف في الشارع بفلاشرها الأحمر والأزرق.',
      'ومن النقطة دي برج إيفل واضح جداً في السما. لو حابب تشغّل عرض أضواء برج إيفل من قائمة الأحداث هيكون تحفة قبل ما ندخل اللوفر.',
    ],
    funFactAr: 'معلومة سياحية: يتجاوز ارتفاع برج إيفل 300 متر، ويتلألأ بآلاف المصابيح الذهبية كل مساء ليضيء سماء باريس.',
  },
  {
    id: 'rivoli-cafes',
    zoneAr: 'شارع ريفولي • مترو باريس',
    labelAr: 'شارع ريفولي ومترو باريس وبرج إيفل',
    x: 0, z: 68, guideX: -1.6, guideZ: 64, lookAtX: -18, lookAtY: 14, lookAtZ: 28,
    bobsSlides: [
      'هنا شارع ريفولي العريق بمدخل مترو باريس الأخضر التاريخي والمقاهي الدافئة، ولم يتبقَّ سوى خطوات قليلة حتى بوابة متحف اللوفر.',
      'تأمل الإطلالة المفتوحة على هرم اللوفر الزجاجي أمامك وبرج إيفل على يسارك. عند استعدادك اضغط لنعبر معاً إلى ساحة نابليون.',
    ],
    anasSlides: [
      'وصلنا شارع ريفولي ومدخل مترو باريس التاريخي، وفاضل خطوات بسيطة ونكون قدام هرم متحف اللوفر مباشرة.',
      'تقدر تركن الـ BMW لو كنت سايقها هنا وتكمل معايا على رجلك جوه ساحة نابليون ومتحف اللوفر.',
    ],
    funFactAr: 'لمسة فنية: صُممت بوابات مترو باريس بأسلوب الفن الجديد «آرت نوفو» لتتحول شوارع المدينة نفسها إلى متحف مفتوح.',
  },
  {
    id: 'pyramid',
    zoneAr: 'ساحة نابليون • بوابة اللوفر',
    labelAr: 'ساحة نابليون، النافورة وبوابة الهرم',
    x: 0, z: 18, guideX: 0.6, guideZ: 14.5, lookAtX: 0, lookAtY: 5.5, lookAtZ: 6, interactId: 'fountain',
    bobsSlides: [
      'مرحباً بك في ساحة نابليون أمام الهرم الزجاجي الفيزيائي لمتحف اللوفر الذي يعكس سماء باريس الحقيقية. على يمينك نافورة الأمنيات الذهبية.',
      'ألقِ عملة أمنية ليمنى أو أطلق 19 فانوساً في السماء، ثم تابع المسير عبر الأبواب الزجاجية الأوتوماتيكية إلى القاعة الكبرى بمسار مفتوح بالكامل.',
    ],
    anasSlides: [
      'أهلاً بيك يا يوسف في ساحة هرم اللوفر الزجاجي. ارمِ عملة أمنية ليمنى في النافورة على يمينك، وأول ما نقرب من الهرم الأبواب الزجاجية هتفتح أوتوماتيك.',
      'ومسار المشي جوه القاعة الكبرى مفتوح بالكامل ومجهز عشان نمشي بسلاسة تامة قدام كل لوحة بدون أي عوائق.',
    ],
    funFactAr: 'تطوير بصري: هرم اللوفر يستخدم خامة زجاج فيزيائية (`ior: 1.5`) تعكس خريطة السماء HDRI الواقعية.',
  },
  {
    id: 'artifact-1',
    zoneAr: 'القاعة الكبرى • الجناح الأول',
    labelAr: 'التحفة 01 • البدايات والطفولة',
    x: 0, z: -20, guideX: -1.8, guideZ: -21.2, lookAtX: -7.5, lookAtY: 3.1, lookAtZ: -20, interactId: 'childhood',
    bobsSlides: [
      'دخلنا القاعة الكبرى لمتحف اللوفر تحت أضواء السبوت لايت المتحفية، وهنا التحفة الأولى في حكاية يمنى: «البدايات والطفولة».',
      'افتح الورقة الذهبية لاستعراض تفاصيل اللوحة والقصة، وجرّب عدسة الأسرار UV لقراءة الرسالة السرية المضيئة فوق اللوحة.',
    ],
    anasSlides: [
      'جوه القاعة الكبرى دلوقتي يا يوسف تحت أضواء المعرض الحقيقية، ودي أول تحفة في رحلة يمنى: «البدايات والطفولة».',
      'اضغط على زر الاستكشاف عشان تفتح الورقة الذهبية وتقرأ الحكاية كاملة، وبعدها نكمل على المرسم الحي.',
    ],
    funFactAr: 'تلميح القيّم الفني: شغّل «عدسة الأسرار UV» من الشريط العلوي لتكشف رسائل خفية مضيئة على جميع اللوحات الأربع.',
  },
  {
    id: 'easel',
    zoneAr: 'القاعة الكبرى • مرسم الزوار الحي',
    labelAr: 'مرسم الزوار • علّق لوحتك باللوفر',
    x: 0, z: -27, guideX: 1.8, guideZ: -28.2, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -27, interactId: 'easel',
    bobsSlides: [
      'توقفنا أمام الحامل الذهبي لمرسم اللوفر التفاعلي. هنا يمكنك أن ترسم وتوقّع لوحة فنية بيدك داخل المتحف.',
      'افتح المرسم وارسم زخرفة متماثلة أو اختم تهنئة ليمنى، وستُعلّق لوحتك فوراً داخل الإطار الباروكي الذهبي على جدار اللوفر أمامك.',
    ],
    anasSlides: [
      'الحامل الذهبي ده بيخليك ترسم أو توقّع لوحة تذكارية ليمنى وتلاقيها اتعلّقت فوراً على جدار متحف اللوفر بالـ 3D.',
      'جرّب افتح المرسم وارسم لمستك وعلّقها على الحائط، ولما تخلص اضغط نكمل للمحطة اللي بعدها.',
    ],
    funFactAr: 'ميزة تفاعلية: تُحفظ لوحتك المرسومة تلقائياً وتظل معلّقة داخل الإطار الذهبي على جدار اللوفر.',
  },
  {
    id: 'artifact-2',
    zoneAr: 'القاعة الكبرى • جناح الأتيليه',
    labelAr: 'التحفة 02 • روح الأتيليه والشغف',
    x: 0, z: -34, guideX: 1.8, guideZ: -35.2, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -34, interactId: 'passion',
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
    x: 0, z: -48, guideX: -1.8, guideZ: -49.2, lookAtX: -7.5, lookAtY: 3.1, lookAtZ: -48, interactId: 'thanaweya',
    bobsSlides: [
      'أمامنا الساعة الرملية الذهبية التي ترمز لمحطة تالتة ثانوي: مرحلة عابرة يمر بها الإنسان بثقة وهدوء بينما يظل الشغف أكبر من أي رقم.',
      'افتح هذه التحفة لقراءة رسالة الطمأنينة المختومة والمخصّصة ليمنى في هذه السنة المهمة.',
    ],
    anasSlides: [
      'محطة تالتة ثانوي يا يوسف.. الساعة الرملية الذهبية دي بتفكّرنا إن السنة دي مجرد جسر قصير بيعدي، ودورنا كعيلة نكون سند وهدوء ليمنى طول الطريق.',
      'افتح الورقة الذهبية هنا عشان تقرأ رسالة الطمأنينة المكتوبة لها.',
    ],
    funFactAr: 'تذكير مهم: الهدوء النفسي وتشجيع العائلة يمنحان الطالب طاقة أكبر بكثير من القلق أو الضغط.',
  },
  {
    id: 'artifact-4',
    zoneAr: 'القاعة الكبرى • أفق الفنون الجميلة',
    labelAr: 'التحفة 04 • تمثال الرخام وحلم الفنون الجميلة',
    x: 0, z: -62, guideX: 1.8, guideZ: -63.2, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -62, interactId: 'fine-arts',
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
    x: 0, z: -74, guideX: -1.6, guideZ: -75.4, lookAtX: 0, lookAtY: 2.0, lookAtZ: -75, interactId: 'vault',
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
  { id: 'seal-1', x: -24.5, z: 300, y: 5.9, labelAr: 'ختم شرفة منزل باريس', quoteAr: 'من شرفة باريس العالية تبدو الأحلام قريبة وواضحة لمن يؤمن بشغفه.' },
  { id: 'seal-2', x: -5.4, z: 10.6, y: 1.35, labelAr: 'ختم ساحة هرم اللوفر', quoteAr: 'كل خطوة هادئة نحو الحلم تصنع أثراً يبقى مدى الحياة.' },
  { id: 'seal-3', x: -6.0, z: -15.5, y: 1.35, labelAr: 'ختم ألوان البداية', quoteAr: 'الفن الحقيقي يبدأ بعينٍ تلاحظ الجمال حيث يغفل الآخرون.' },
  { id: 'seal-4', x: -6.0, z: -53.5, y: 1.35, labelAr: 'ختم الطمأنينة والثبات', quoteAr: 'ثانوية عامة جسرٌ تعبرينه بهدوءٍ وثقة، وعائلتكِ سندكِ الدائم.' },
  { id: 'seal-5', x: 5.2, z: -90.5, y: 1.35, labelAr: 'ختم القبة الملكية', quoteAr: 'عامكِ التاسع عشر بداية إشراقة جديدة نحو كلية الفنون الجميلة.' },
];

const TIME_PRESETS = {
  sunset: {
    labelAr: '🌇 غروب باريس', hdriKey: 'sunset', envIntensity: 1.05,
    skyTop: 0x162244, skyMid: 0x724058, skyHorizon: 0xf4a05c, sunGlow: 0xffe49e,
    sunColor: 0xffc880, sunIntensity: 2.5, sunPos: new THREE.Vector3(-48, 28, -40),
    hemiSky: 0xffe2be, hemiGround: 0x2c2224, hemiIntensity: 1.12,
    fogColor: 0x2b2029, fogDensity: 0.0017, exposure: 1.06, bloomStrength: 0.36,
    starsOpacity: 0.4, cloudTint: 0xffd2a8, cloudOpacity: 0.56,
    windowEmissive: 0.88, lampOpacity: 0.85, showSun: true, showMoon: false, searchlightOpacity: 0.1,
  },
  day: {
    labelAr: '☀️ نهار باريس', hdriKey: 'sunset', envIntensity: 1.25,
    skyTop: 0x286bc2, skyMid: 0x6ca6e4, skyHorizon: 0xd9ecfa, sunGlow: 0xfff8e2,
    sunColor: 0xfff4dd, sunIntensity: 3.0, sunPos: new THREE.Vector3(-34, 68, -20),
    hemiSky: 0xeaf4ff, hemiGround: 0x5c5348, hemiIntensity: 1.35,
    fogColor: 0xb7cde0, fogDensity: 0.001, exposure: 1.0, bloomStrength: 0.22,
    starsOpacity: 0.0, cloudTint: 0xffffff, cloudOpacity: 0.78,
    windowEmissive: 0.12, lampOpacity: 0.14, showSun: true, showMoon: false, searchlightOpacity: 0.0,
  },
  night: {
    labelAr: '🌙 ليل باريس', hdriKey: 'night', envIntensity: 0.95,
    skyTop: 0x050918, skyMid: 0x0f1a38, skyHorizon: 0x262542, sunGlow: 0xaac4ff,
    sunColor: 0x8eaef0, sunIntensity: 0.95, sunPos: new THREE.Vector3(36, 48, -50),
    hemiSky: 0x5571a8, hemiGround: 0x1b1614, hemiIntensity: 0.85,
    fogColor: 0x101426, fogDensity: 0.002, exposure: 1.14, bloomStrength: 0.48,
    starsOpacity: 0.96, cloudTint: 0x4b5c82, cloudOpacity: 0.32,
    windowEmissive: 1.45, lampOpacity: 1.0, showSun: false, showMoon: true, searchlightOpacity: 0.54,
  },
  gallery: {
    labelAr: '🏛️ أتيليه دافئ', hdriKey: 'sunset', envIntensity: 0.92,
    skyTop: 0x201512, skyMid: 0x4c2d22, skyHorizon: 0xc28149, sunGlow: 0xffdf99,
    sunColor: 0xffd28e, sunIntensity: 2.2, sunPos: new THREE.Vector3(-24, 44, -35),
    hemiSky: 0xffebd0, hemiGround: 0x332419, hemiIntensity: 1.25,
    fogColor: 0x231813, fogDensity: 0.0014, exposure: 1.1, bloomStrength: 0.32,
    starsOpacity: 0.25, cloudTint: 0xf4c28e, cloudOpacity: 0.44,
    windowEmissive: 1.08, lampOpacity: 0.92, showSun: true, showMoon: false, searchlightOpacity: 0.18,
  },
};

export class LouvreParisWorld3D {
  constructor(canvas, config, callbacks = {}) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;

    this.isMobile = window.innerWidth < 900;
    this.qualityMode = 'smooth60'; // 'smooth60' | 'eco' | 'ultra' (UnrealBloom + SMAA)
    this.timeOfDay = 'sunset';
    this.weatherMode = 'clear';
    this.uvMode = false;
    this.zoomed = false;
    this.portalPaused = true;
    this.portalTickAccum = 0;

    this.activeGuideType = 'bobs';
    this.guidePhase = 'idle';
    this.cruiseFast = false;
    this.cabRideActive = false;

    // REAL DRIVABLE HERO BMW STATE
    this.drivingBmw = false;
    this.bmwRoot = null;
    this.bmwWheels = [];
    this.bmwPaintMats = [];
    this.bmwBrakeMats = [];
    this.bmwPaintIdx = 0;
    this.bmwPos = new THREE.Vector3(12.2, 0, 368); // Parked right beside Champs-Élysées start!
    this.bmwYaw = Math.PI; // Facing North (-Z) toward Louvre!
    this.bmwSpeed = 0;
    this.bmwSteer = 0;
    this.bmwBraking = false;
    this.bmwLoaded = false;

    // ENTERABLE PARIS APARTMENT ELEVATION STATE
    this.playerFloorY = 0;
    this.inHouseUpperFloor = false;

    this.droneActive = false;
    this.droneTime = 0;
    this.sparkleShowTimer = 0;
    this.disposed = false;
    this.isHidden = false;

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

    this.intersections = [];
    this.trafficVehicles = [];
    this.policeLightBars = [];
    this.asphaltMat = null;
    this.cobbleMat = null;
    this.hdriMaps = { sunset: null, night: null };

    this.isLooking = false;
    this.lookStart = { x: 0, y: 0 };
    this.dragMoved = 0;
    this.interactables = [];
    this.nearestInteractable = null;

    this.guideRoot = new THREE.Group();
    this.guidePos = new THREE.Vector3(-1.6, 0, 378);
    this.guideYaw = Math.PI;
    this.bobsGroup = new THREE.Group();
    this.anasGroup = new THREE.Group();
    this.anasGroup.visible = false;

    this.catMixer = null; this.catBoneInfo = {}; this.catLoaded = false;
    this.catStride = 0; this.catStepAccum = 0; this.catState = 'guide'; this.catStateTimer = 0; this.catStateDur = 10;
    this.pawPrints = []; this.pawIdx = 0;

    this.anasMixer = null; this.anasWalkAction = null; this.anasIdleAction = null; this.anasCurAnim = 'idle'; this.anasLoaded = false;

    this.humanVisitors = [];
    this.candlesLit = true; this.candleWind = 0;
    this.cakeFlames = []; this.smokePuffs = []; this.smokeTime = -1; this.fireworksTime = -1;

    this.floatingProps = []; this.parchments = []; this.lampHalos = [];
    this.cloudSprites = []; this.fallingLeaves = []; this.rainDrops = null; this.rainPositions = null;
    this.eiffelSparkles = []; this.fountainRings = []; this.emissiveBuildingMats = [];

    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._qDelta = new THREE.Quaternion();
    this._tmpLook = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.init();
  }

  /* ==================== INIT AAA RENDERER + ASSET MANAGER + REAL HDRIs ==================== */
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
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x2b2029, 0.0017);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.baseFov = aspect < 0.85 ? 64 : 53;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.3, 1050);

    this.assets = new AssetManager(this.renderer, (pct, labelAr) => {
      if (this.callbacks.onLoadProgress) this.callbacks.onLoadProgress(pct, labelAr);
    });
    this.texLoader = this.assets.texLoader;

    this.composer = null;
    this.bloomPass = null;
    this.smaaPass = null;
    this.applyQualitySettings();

    const aniso = Math.min(this.renderer.capabilities.getMaxAnisotropy(), this.isMobile ? 2 : 8);

    // Real Poly Haven Photogrammetry PBR Sets (Asphalt 4-map + Cobble + Parquet + Marble + Stone!)
    this.asphaltScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.asphalt, 3, 64, aniso);
    this.cobbleScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.cobble, 5, 110, aniso);
    this.plazaCobbleScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.cobble, 14, 14, aniso);
    this.parquetScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.parquet, 6, 24, aniso);
    this.marbleScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.marble, 2, 2, aniso);
    this.stoneScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.stone, 4, 2, aniso);

    this.glowTex = createGlowTexture();
    this.beamTex = createLightBeamTexture();
    this.cloudTex = createCloudTexture();
    this.pawTex = createPawPrintTexture();
    this.haussmannPBR = createHaussmannFacadePBR(aniso);
    this.modernAptPBR = createModernApartmentTowerPBR(aniso);
    this.mallPBR = createParisMallFacadePBR(aniso);
    this.louvrePBR = createLouvrePalacePBR(aniso);
    this.mansardTex = createMansardRoofPBR(aniso);
    this.eiffelLatticeTex = createEiffelLatticeTexture(aniso);
    this.wallPanelTex = createLouvreWallPanelPBR(aniso);

    const overlayMat = (opts) => new THREE.MeshStandardMaterial({
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...opts,
    });

    this.mats = {
      gold: new THREE.MeshStandardMaterial({ color: 0xefc86a, metalness: 0.92, roughness: 0.16 }),
      goldOverlay: overlayMat({ color: 0xefc86a, metalness: 0.85, roughness: 0.22 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: 0xfff0be, emissive: 0xe6a02e, emissiveIntensity: 0.88, metalness: 0.72, roughness: 0.18 }),
      waxCrimson: new THREE.MeshStandardMaterial({ color: 0xa11e2b, emissive: 0x5c0e16, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.2 }),
      marble: new THREE.MeshStandardMaterial({ map: this.marbleScan.map, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.35, 0.35), color: 0xfbf6ef, roughness: 0.15, metalness: 0.06 }),
      limestoneScanned: new THREE.MeshStandardMaterial({ map: this.stoneScan.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.45, 0.45), color: 0xe4d4bc, roughness: 0.72, metalness: 0.02 }),
      haussmann: new THREE.MeshStandardMaterial({
        map: this.haussmannPBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.25, 0.25),
        emissive: new THREE.Color(0xffc773), emissiveMap: this.haussmannPBR.emissiveMap, emissiveIntensity: 0.88, roughness: 0.68, metalness: 0.05,
      }),
      modernApt: new THREE.MeshStandardMaterial({
        map: this.modernAptPBR.map, emissive: new THREE.Color(0xffce7a), emissiveMap: this.modernAptPBR.emissiveMap,
        emissiveIntensity: 0.88, roughness: 0.36, metalness: 0.24,
      }),
      mallFacade: new THREE.MeshStandardMaterial({
        map: this.mallPBR.map, emissive: new THREE.Color(0xffd486), emissiveMap: this.mallPBR.emissiveMap,
        emissiveIntensity: 0.94, roughness: 0.18, metalness: 0.42,
      }),
      louvrePalace: new THREE.MeshStandardMaterial({
        map: this.louvrePBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.3, 0.3),
        emissive: new THREE.Color(0xffc975), emissiveMap: this.louvrePBR.emissiveMap, emissiveIntensity: 0.82, roughness: 0.64, metalness: 0.06,
      }),
      mansard: new THREE.MeshStandardMaterial({ map: this.mansardTex, roughness: 0.4, metalness: 0.42 }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x202226, metalness: 0.88, roughness: 0.26 }),
      metroGreen: new THREE.MeshStandardMaterial({ color: 0x1e5c45, metalness: 0.68, roughness: 0.28 }),
      policeBlue: new THREE.MeshStandardMaterial({ color: 0x163875, roughness: 0.38, metalness: 0.32 }),
      eiffelSteel: new THREE.MeshStandardMaterial({ color: 0x5d483a, metalness: 0.78, roughness: 0.32 }),
      eiffelLattice: new THREE.MeshStandardMaterial({ map: this.eiffelLatticeTex, alphaTest: 0.35, side: THREE.DoubleSide, metalness: 0.76, roughness: 0.34 }),
      velvetRed: overlayMat({ color: 0x6f1623, roughness: 0.86 }),
      runnerOverlay: overlayMat({ color: 0x3b2316, roughness: 0.65 }),
      crosswalkStripe: overlayMat({ color: 0xf2ece0, roughness: 0.7 }),
      laneDash: overlayMat({ color: 0xf0e8d4, roughness: 0.65 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.46, metalness: 0.06 }),
      lampGlow: new THREE.MeshBasicMaterial({ color: 0xfff2c6 }),
      lanternPaper: new THREE.MeshStandardMaterial({ color: 0xffdca0, emissive: 0xffa638, emissiveIntensity: 1.35, roughness: 0.38, transparent: true, opacity: 0.94 }),
      // Physically accurate Louvre Glass Pyramid material (ior: 1.5, clearcoat: 1.0, HDRI reflections!)
      glassPyramid: new THREE.MeshPhysicalMaterial({
        color: 0xdaf2fa, emissive: 0x7c551e, emissiveIntensity: 0.16, transparent: true, opacity: 0.42,
        roughness: 0.04, metalness: 0.14, ior: 1.5, reflectivity: 1.0, clearcoat: 1.0, clearcoatRoughness: 0.04, side: THREE.DoubleSide,
      }),
      glassDoor: new THREE.MeshPhysicalMaterial({
        color: 0xe8f9ff, transparent: true, opacity: 0.48, roughness: 0.03, metalness: 0.18, ior: 1.5, clearcoat: 1.0, side: THREE.DoubleSide,
      }),
      waterPool: new THREE.MeshPhysicalMaterial({
        color: 0x102236, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.16, 0.16),
        roughness: 0.03, metalness: 0.55, clearcoat: 1.0, reflectivity: 1.0,
      }),
      cakeCream: new THREE.MeshStandardMaterial({ color: 0xfbf3e4, roughness: 0.48 }),
      cakeFrosting: new THREE.MeshStandardMaterial({ color: 0xfff8ed, roughness: 0.36 }),
      cakeGanache: new THREE.MeshStandardMaterial({ color: 0x351a0f, roughness: 0.14, metalness: 0.18 }),
      strawberry: new THREE.MeshStandardMaterial({ color: 0xc22b38, roughness: 0.24 }),
      macaronRose: new THREE.MeshStandardMaterial({ color: 0xe2988d, roughness: 0.36 }),
      macaronGold: new THREE.MeshStandardMaterial({ color: 0xe6be68, roughness: 0.28, metalness: 0.4 }),
      candleNumber: new THREE.MeshStandardMaterial({ color: 0xfff4d9, emissive: 0x5c370c, emissiveIntensity: 0.28, roughness: 0.24, metalness: 0.25 }),
    };
    this.emissiveBuildingMats.push(this.mats.haussmann, this.mats.modernApt, this.mats.mallFacade, this.mats.louvrePalace);

    this.setupLighting();
    this.buildDynamicParisSkySunMoonClouds();
    this.buildGrand525mParisBoulevard();
    this.buildEnterableParisianApartmentHouse();
    this.buildWorkingTrafficLightsAndIntersections();
    this.buildArchitecturalEiffelTower();
    this.buildOpenPortalLouvrePyramidAndFountain();
    this.buildLouvreGrandGalleryInterior();
    this.buildFourInteractiveArtifactsAndSculpture();
    this.buildLiveLouvreWallPaintingEasel();
    this.buildFiveHiddenMuseumSeals();
    this.buildRoyalFamilyVaultAndManifesto();
    this.buildGrandRotundaAndRealisticCake();
    this.buildWeatherParticles();
    this.buildPawPrintPool();

    // Load Real Poly Haven HDRIs + Draco BMW Hero Car + CC0 Modular City Buildings/Trees + Traffic + Rigged Characters!
    this.loadRealHDRIEnvironments();
    this.loadModularCC0CityBuildingsAndTrees();
    this.loadRealDrivableHeroBMW();
    this.loadRealCC0ParisTrafficVehicles();
    this.loadOptimizedMocapHumanVisitorsAndAnasGuide();
    this.loadAnatomicallyFixedBobsPersianCat();

    this.setTimeOfDay('sunset');
    this.bindEvents();
    if (this.callbacks.onReady) this.callbacks.onReady();
    this.animate();
  }

  async loadRealHDRIEnvironments() {
    const sunsetEnv = await this.assets.loadHDRI(ASSET_MANIFEST.hdris.sunset, 'جاري تحميل إضاءة غروب باريس الواقعية HDRI');
    if (sunsetEnv) {
      this.hdriMaps.sunset = sunsetEnv;
      if (this.timeOfDay !== 'night') this.scene.environment = sunsetEnv;
    }
    const nightEnv = await this.assets.loadHDRI(ASSET_MANIFEST.hdris.night, 'جاري تحميل إضاءة ليل باريس الواقعية HDRI');
    if (nightEnv) {
      this.hdriMaps.night = nightEnv;
      if (this.timeOfDay === 'night') this.scene.environment = nightEnv;
    }
  }

  ensureUltraComposer() {
    if (this.composer) return;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.36, 0.55, 0.85);
    this.composer.addPass(this.bloomPass);
    if (!this.isMobile) {
      const dpr = this.renderer.getPixelRatio();
      this.smaaPass = new SMAAPass(window.innerWidth * dpr, window.innerHeight * dpr);
      this.composer.addPass(this.smaaPass);
    }
    this.composer.addPass(new OutputPass());
  }

  applyQualitySettings() {
    const dpr = window.devicePixelRatio || 1;
    let targetDpr = Math.min(dpr, this.isMobile ? 1.15 : 1.45);
    if (this.qualityMode === 'eco') targetDpr = Math.min(dpr, 1.0);
    else if (this.qualityMode === 'ultra') {
      targetDpr = Math.min(dpr, 1.65);
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

  setQualityMode(mode) { this.qualityMode = mode; this.applyQualitySettings(); if (this.leafInst) this.leafInst.visible = mode !== 'eco' && this.weatherMode !== 'rain'; }
  setPortalPaused(paused) { this.portalPaused = Boolean(paused); if (!paused) this.renderer.shadowMap.needsUpdate = true; }
  setZoom(enabled) { this.zoomed = Boolean(enabled); if (this.callbacks.onZoomChange) this.callbacks.onZoomChange(this.zoomed); }
  setCruiseFast(fast) { this.cruiseFast = Boolean(fast); }

  setActiveGuide(type) {
    this.activeGuideType = type === 'anas' ? 'anas' : 'bobs';
    this.bobsGroup.visible = this.activeGuideType === 'bobs';
    this.anasGroup.visible = this.activeGuideType === 'anas';
    if (this.callbacks.onGuideTypeChange) this.callbacks.onGuideTypeChange(this.activeGuideType);
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
      this.asphaltMat.roughness = isRain ? 0.1 : 0.68;
      this.asphaltMat.metalness = isRain ? 0.44 : 0.1;
      this.asphaltMat.clearcoat = isRain ? 0.92 : 0.18;
    }
    if (this.cobbleMat) {
      this.cobbleMat.roughness = isRain ? 0.18 : 0.72;
      this.cobbleMat.metalness = isRain ? 0.3 : 0.08;
    }
    if (this.callbacks.onWeatherChange) this.callbacks.onWeatherChange(this.weatherMode);
  }

  /* ==================== LIGHTING & REAL HDRI ENVIRONMENT ==================== */
  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffe2be, 0x2c2224, 1.12);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffc880, 2.5);
    this.sunLight.position.set(-60, 48, 120);
    this.sunLight.castShadow = !this.isMobile;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 10; this.sunLight.shadow.camera.far = 360;
    this.sunLight.shadow.camera.left = -90; this.sunLight.shadow.camera.right = 90;
    this.sunLight.shadow.camera.top = 180; this.sunLight.shadow.camera.bottom = -120;
    this.sunLight.shadow.bias = -0.0007;
    this.scene.add(this.sunLight);

    this.fillLight = new THREE.DirectionalLight(0x8ea8e6, 0.56);
    this.fillLight.position.set(55, 28, 180);
    this.scene.add(this.fillLight);

    this.playerLantern = new THREE.PointLight(0xffdca0, 15, 28, 1.45);
    this.scene.add(this.playerLantern);
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
    sunCorona.scale.set(95, 95, 1); this.sunGroup.add(sunDisc, sunCorona); this.skyGroup.add(this.sunGroup);

    this.moonGroup = new THREE.Group();
    const moonDisc = new THREE.Mesh(new THREE.SphereGeometry(9, 18, 14), new THREE.MeshBasicMaterial({ color: 0xf4f7ff, fog: false }));
    const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x9ec0ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    moonHalo.scale.set(60, 60, 1); this.moonGroup.add(moonDisc, moonHalo);
    this.moonGroup.position.set(110, 140, -320); this.skyGroup.add(this.moonGroup);

    const starCount = this.isMobile ? 200 : 360;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const th = Math.random() * Math.PI * 2, ph = 0.16 + Math.random() * 1.15;
      pos[i * 3] = Math.cos(th) * Math.cos(ph) * 460; pos[i * 3 + 1] = Math.sin(ph) * 380 + 24; pos[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 460;
    }
    const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.starsMat = new THREE.PointsMaterial({ size: 3.6, map: this.glowTex, color: 0xfff5dc, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    this.skyGroup.add(new THREE.Points(sGeo, this.starsMat));

    const cloudCount = this.isMobile ? 10 : 16;
    for (let i = 0; i < cloudCount; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.cloudTex, color: 0xffd2a8, transparent: true, opacity: 0.56, depthWrite: false, fog: false }));
      const ang = (i / cloudCount) * Math.PI * 2 + Math.random() * 0.25;
      const dist = 240 + (i % 3) * 58, h = 68 + (i % 4) * 28, w = 96 + (i % 5) * 30;
      sp.position.set(Math.cos(ang) * dist, h, Math.sin(ang) * dist); sp.scale.set(w, w * 0.42, 1);
      this.skyGroup.add(sp); this.cloudSprites.push({ sprite: sp, ang, dist, h, speed: 0.003 + (i % 4) * 0.0012 });
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
    this.sunGroup.visible = p.showSun; this.sunGroup.position.copy(p.sunPos).normalize().multiplyScalar(430);
    this.moonGroup.visible = p.showMoon; this.starsMat.opacity = p.starsOpacity;
    this.cloudSprites.forEach((c) => { c.sprite.material.color.setHex(p.cloudTint); c.sprite.material.opacity = p.cloudOpacity; });

    this.sunLight.color.setHex(p.sunColor); this.sunLight.intensity = this.uvMode ? 0.4 : p.sunIntensity;
    this.hemiLight.color.setHex(p.hemiSky); this.hemiLight.groundColor.setHex(p.hemiGround); this.hemiLight.intensity = this.uvMode ? 0.35 : p.hemiIntensity;
    this.scene.fog.color.setHex(p.fogColor); this.scene.fog.density = p.fogDensity;
    this.renderer.toneMappingExposure = p.exposure;
    if (this.bloomPass) this.bloomPass.strength = this.uvMode ? 0.62 : p.bloomStrength;

    // Bind real Poly Haven HDRI IBL map!
    const targetHdri = this.hdriMaps[p.hdriKey] || this.hdriMaps.sunset || this.hdriMaps.night;
    if (targetHdri) {
      this.scene.environment = targetHdri;
      if ('environmentIntensity' in this.scene) this.scene.environmentIntensity = p.envIntensity;
    }

    this.emissiveBuildingMats.forEach((m) => { m.emissiveIntensity = p.windowEmissive; });
    this.lampHalos.forEach((h) => { h.material.opacity = p.lampOpacity; });
    if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = this.sparkleShowTimer > 0 ? 0.56 : p.searchlightOpacity;

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
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc660, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.set(2.4, 2.4, 1); grp.add(body, halo);
      const ang = (i / 19) * Math.PI * 2 + Math.random() * 0.25, rad = 5.5 + Math.random() * 16;
      grp.position.set(Math.cos(ang) * rad, 1.8 + Math.random() * 4, centerZ + Math.sin(ang) * rad);
      this.scene.add(grp);
      this.skyLanterns.push({ mesh: grp, baseX: grp.position.x, vy: 1.1 + Math.random() * 0.85, phase: Math.random() * Math.PI * 2, life: 0, maxLife: 24 + Math.random() * 6 });
    }
  }

  triggerEiffelSparkleShow() {
    this.sparkleShowTimer = 18.0;
    if (this.timeOfDay === 'day') this.setTimeOfDay('night');
    else if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = 0.58;
    this.releaseBirthdayLanterns();
  }

  /* ==================== 525M PARIS GRAND BOULEVARD (4-MAP SCANNED PBR ASPHALT + ZERO Z-FIGHTING) ==================== */
  buildGrand525mParisBoulevard() {
    const len = 424, midZ = 244;

    this.cobbleMat = new THREE.MeshStandardMaterial({
      map: this.cobbleScan.map, normalMap: this.cobbleScan.normalMap, normalScale: new THREE.Vector2(0.85, 0.85),
      roughnessMap: this.cobbleScan.roughnessMap, roughness: 0.72, metalness: 0.08,
    });
    const centralPromenade = new THREE.Mesh(new THREE.PlaneGeometry(16, len), this.cobbleMat);
    centralPromenade.rotation.x = -Math.PI / 2; centralPromenade.position.set(0, 0, midZ); centralPromenade.receiveShadow = true;
    this.scene.add(centralPromenade);

    const runner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, len - 8), this.mats.runnerOverlay);
    runner.rotation.x = -Math.PI / 2; runner.position.set(0, 0.045, midZ); this.scene.add(runner);
    [-1.68, 1.68].forEach((x) => {
      const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.1, len - 8), this.mats.goldOverlay);
      trim.rotation.x = -Math.PI / 2; trim.position.set(x, 0.052, midZ); this.scene.add(trim);
    });

    // Real Poly Haven 4-Map Photogrammetry Scanned Asphalt w/ Clearcoat Rain-Slick Reflections!
    this.asphaltMat = new THREE.MeshPhysicalMaterial({
      map: this.asphaltScan.map, normalMap: this.asphaltScan.normalMap, normalScale: new THREE.Vector2(0.9, 0.9),
      roughnessMap: this.asphaltScan.roughnessMap, aoMap: this.asphaltScan.aoMap, aoMapIntensity: 0.8,
      color: 0x3b3e46, roughness: 0.68, metalness: 0.1, clearcoat: 0.18, clearcoatRoughness: 0.25,
    });
    [-16, 16].forEach((rx) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(16, len), this.asphaltMat);
      road.rotation.x = -Math.PI / 2; road.position.set(rx, 0, midZ); road.receiveShadow = true;
      this.scene.add(road);
    });

    // Instanced Crisp White Lane Dashes (polygonOffset -> ZERO flicker!)
    const dashPositions = [];
    for (let z = 446; z >= 38; z -= 10) dashPositions.push([-16, z], [16, z]);
    const dashInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.24, 4.4), this.mats.laneDash, dashPositions.length);
    const dummy = new THREE.Object3D();
    dashPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 0.046, z); dummy.rotation.set(-Math.PI / 2, 0, 0); dummy.updateMatrix();
      dashInst.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(dashInst);

    // Outer District Sidewalks (strictly non-overlapping!)
    [-44, 44].forEach((sx) => {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(40, len), this.mats.limestoneScanned);
      sw.rotation.x = -Math.PI / 2; sw.position.set(sx, 0, midZ); sw.receiveShadow = true;
      this.scene.add(sw);
    });

    // Raised Curbs (with clean walkway gap at z=294..306 on West side for entering Maison de Paris!)
    [8.1, 24.1].forEach((cx) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, len), this.mats.limestoneScanned);
      curb.position.set(cx, 0.11, midZ); this.scene.add(curb);
    });
    [-8.1, -24.1].forEach((cx) => {
      const cNorth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 260), this.mats.limestoneScanned); cNorth.position.set(cx, 0.11, 162);
      const cSouth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 148), this.mats.limestoneScanned); cSouth.position.set(cx, 0.11, 382);
      this.scene.add(cNorth, cSouth);
    });

    // ---- ARC DE TRIOMPHE MONUMENT (z = +444) ----
    const arc = new THREE.Group(); arc.position.set(0, 0, 444);
    [-10, 10].forEach((px) => { const pier = new THREE.Mesh(new THREE.BoxGeometry(9.5, 28, 12), this.mats.limestoneScanned); pier.position.set(px, 14, 0); arc.add(pier); });
    const arcTop = new THREE.Mesh(new THREE.BoxGeometry(30, 11, 12.6), this.mats.limestoneScanned); arcTop.position.set(0, 33, 0);
    const arcCornice = new THREE.Mesh(new THREE.BoxGeometry(31.5, 1.4, 13.4), this.mats.gold); arcCornice.position.set(0, 38.6, 0);
    const arcRing = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.48, 10, 32, Math.PI), this.mats.goldGlow); arcRing.position.set(0, 22, -6.1);
    const arcSign = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.6), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('قوس النصر • بوليفارد باريس', 'ARC DE TRIOMPHE • CHAMPS-ÉLYSÉES • HEY') }));
    arcSign.position.set(0, 33, -6.45); arcSign.rotation.y = Math.PI;
    arc.add(arcTop, arcCornice, arcRing, arcSign); this.scene.add(arc);

    // ---- GALERIES PARIS LUXURY SHOPPING MALL (East Side z = +290, x = +35) ----
    const mall = new THREE.Group(); mall.position.set(35, 0, 290);
    const mallBody = new THREE.Mesh(new THREE.BoxGeometry(16, 19, 44), this.mats.mallFacade); mallBody.position.set(0, 9.5, 0);
    const mallRoofFrame = new THREE.Mesh(new THREE.BoxGeometry(16.8, 1.1, 45), this.mats.gold); mallRoofFrame.position.set(0, 19.3, 0);
    const mallDome = new THREE.Mesh(new THREE.SphereGeometry(11.5, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), this.mats.glassPyramid); mallDome.position.set(-1, 19.6, 0);
    const mallDomeRibs = new THREE.Mesh(new THREE.SphereGeometry(11.7, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0xe8c268, metalness: 0.85, roughness: 0.25, wireframe: true })); mallDomeRibs.position.copy(mallDome.position);
    const mallCanopy = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 26), this.mats.goldGlow); mallCanopy.position.set(-9.5, 5.2, 0);
    const mallSign = new THREE.Mesh(new THREE.PlaneGeometry(24, 5.0), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('جاليري باريس مول • تسوّق وأزياء', 'GALERIES PARIS MALL • LUXURY BOUTIQUES') }));
    mallSign.position.set(-8.2, 16.2, 0); mallSign.rotation.y = -Math.PI / 2;
    mall.add(mallBody, mallRoofFrame, mallDome, mallDomeRibs, mallCanopy, mallSign); this.scene.add(mall);

    // ---- COMMISSARIAT DE POLICE (West Side z = +170, x = -34) ----
    const policeHQ = new THREE.Group(); policeHQ.position.set(-34, 0, 170);
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(14, 14.5, 28), this.mats.limestoneScanned); pBody.position.set(0, 7.25, 0);
    const pBand = new THREE.Mesh(new THREE.BoxGeometry(14.4, 2.4, 28.4), this.mats.policeBlue); pBand.position.set(0, 13.6, 0);
    const pRoof = new THREE.Mesh(new THREE.BoxGeometry(13.6, 3.2, 27.6), this.mats.mansard); pRoof.position.set(0, 16.4, 0);
    const pSign = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.8), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('قسم شرطة باريس الوطني', 'COMMISSARIAT DE POLICE • PARIS', '#6bb6ff', '#0c1b36') }));
    pSign.position.set(7.25, 11.2, 0); pSign.rotation.y = Math.PI / 2;
    [0x1c4ed8, 0xf8fafc, 0xdc2626].forEach((hex, idx) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.6, 0.9), new THREE.MeshBasicMaterial({ color: hex }));
      strip.position.set(7.15, 2.8, -5.5 + idx * 0.95); policeHQ.add(strip);
    });
    const pAwning = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 12), this.mats.policeBlue); pAwning.position.set(8.4, 4.6, 0);
    policeHQ.add(pBody, pBand, pRoof, pSign, pAwning); this.scene.add(policeHQ);

    // ---- ART NOUVEAU MÉTRO PARISIEN ENTRANCE (z = +64, x = +5.8) ----
    const metro = new THREE.Group(); metro.position.set(5.8, 0, 64);
    [-1.4, 1.4].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 10), this.mats.metroGreen); post.position.set(px, 1.6, 0);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), this.mats.lampGlow); globe.position.set(px, 3.3, 0);
      metro.add(post, globe);
    });
    const mArch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.72, 0.18), this.mats.metroGreen); mArch.position.set(0, 3.05, 0);
    const mSign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.56), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('مترو باريس • ريفولي', 'MÉTROPOLITAIN', '#ffdf86', '#164533') }));
    mSign.position.set(0, 3.05, 0.11);
    const mSignBack = mSign.clone(); mSignBack.position.z = -0.11; mSignBack.rotation.y = Math.PI;
    metro.add(mArch, mSign, mSignBack);
    this.circleColliders.push({ x: 5.8, z: 64, r: 1.5 }); this.scene.add(metro);

    // ---- INSTANCED PARISIAN STREETLAMPS ACROSS 525M ----
    const lampPositions = [];
    for (let z = 420; z >= 40; z -= 24) {
      if (Math.abs(z - 300) < 12) continue; // Keep Maison de Paris open entrance clear!
      lampPositions.push([-7.2, z], [7.2, z], [-25.2, z], [25.2, z]);
    }
    const postInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.12, 4.6, 8), this.mats.ironDark, lampPositions.length);
    const globeInst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), this.mats.lampGlow, lampPositions.length);
    lampPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 2.3, z); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); postInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 4.7, z); dummy.updateMatrix(); globeInst.setMatrixAt(i, dummy.matrix);
      if (i % 2 === 0) {
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffd584, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(3.6, 3.6, 1); halo.position.set(x, 4.7, z);
        this.scene.add(halo); this.lampHalos.push(halo);
      }
    });
    this.scene.add(postInst, globeInst);
  }

  /* ==================== ENTERABLE 2-STORY PARIS APARTMENT & BALCONY «منزل باريس المفتوح» ==================== */
  buildEnterableParisianApartmentHouse() {
    // Positioned at West Side x = -33, z = 300 with open pedestrian crosswalk bridge from promenade!
    const house = new THREE.Group();
    house.position.set(-33, 0, 300);

    // Red-gold VIP entrance walkway across to the open arched doorway
    const walkCarpet = new THREE.Mesh(new THREE.PlaneGeometry(24, 5.2), this.mats.velvetRed);
    walkCarpet.rotation.x = -Math.PI / 2; walkCarpet.position.set(20, 0.055, 0);
    house.add(walkCarpet);

    // Ground Floor Luxury Parquet Salon (16m wide × 18m deep)
    const gfFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 18), new THREE.MeshStandardMaterial({ map: this.parquetScan.map, roughness: 0.36 }));
    gfFloor.rotation.x = -Math.PI / 2; gfFloor.position.set(0, 0.055, 0);
    house.add(gfFloor);

    // Exterior & Interior Limestone Walls WITH WIDE OPEN FRONT ARCHWAY (z: -3.5..+3.5 open!)
    const wallMat = this.mats.limestoneScanned;
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 10.6, 18), wallMat); backWall.position.set(-8, 5.3, 0);
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(16, 10.6, 0.6), wallMat); northWall.position.set(0, 5.3, -9);
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(16, 10.6, 0.6), wallMat); southWall.position.set(0, 5.3, 9);
    // Front wall with open grand entrance on Ground Floor (x = +8)
    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6, 10.6, 5.5), wallMat); frontLeft.position.set(8, 5.3, 6.25);
    const frontRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 10.6, 5.5), wallMat); frontRight.position.set(8, 5.3, -6.25);
    const frontLintel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.4, 7.2), this.mats.gold); frontLintel.position.set(8, 4.4, 0);
    // Open Balcony Arch on 2nd Floor!
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.6, 19.2), this.mats.mansard); roofSlab.position.set(0, 10.7, 0);
    const houseSign = new THREE.Mesh(new THREE.PlaneGeometry(13.5, 2.8), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('منزل باريس المفتوح • ادخل واصعد للشرفة', 'MAISON DE PARIS • WALKABLE 2ND FLOOR BALCONY') }));
    houseSign.position.set(8.45, 9.2, 0); houseSign.rotation.y = Math.PI / 2;
    house.add(backWall, northWall, southWall, frontLeft, frontRight, frontLintel, roofSlab, houseSign);

    // 2nd Floor Luxury Parquet Slab (y = 4.6m) + Protruding Open Parisian Balcony (x = +8..+11.2!)
    const f2Floor = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.35, 17.6), new THREE.MeshStandardMaterial({ map: this.parquetScan.map, roughness: 0.35 }));
    f2Floor.position.set(2.0, 4.45, 0);
    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 12.6), this.mats.marble);
    balconySlab.position.set(9.8, 4.45, 0);
    // Wrought-iron Parisian Balcony Railing
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 12.4), this.mats.gold); railTop.position.set(11.45, 5.65, 0);
    for (let rz = -6.0; rz <= 6.0; rz += 0.8) {
      const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.15, 6), this.mats.ironDark);
      bal.position.set(11.45, 5.05, rz); house.add(bal);
    }
    house.add(f2Floor, balconySlab, railTop);

    // Real Walkable Marble Staircase rising along West interior (x = -5.8, z = +6 -> -5.5 -> y = 0..4.6m!)
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 0.72), this.mats.marble);
      step.position.set(-5.6, 0.15 + i * (4.55 / steps), 5.8 - i * 0.68);
      house.add(step);
    }
    const landing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.32, 3.4), this.mats.marble);
    landing.position.set(-5.5, 4.45, -6.5);
    house.add(landing);

    // Luxury Parisian Interior Furniture (Ground Salon Sofa + Table + Chandelier + 2nd-Floor Artist Easel Desk!)
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 3.8), this.mats.velvetRed); sofa.position.set(2.2, 0.45, -4.5);
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 2.2), this.mats.woodDark); table.position.set(4.1, 0.3, -4.5);
    const lamp1 = new THREE.PointLight(0xffd796, 18, 20, 1.4); lamp1.position.set(1.5, 3.6, 0);
    const lamp2 = new THREE.PointLight(0xffdfa8, 18, 22, 1.4); lamp2.position.set(3.5, 8.6, 0);
    // 2nd Floor Artist Table overlooking Paris!
    const artDesk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 2.6), this.mats.woodDark); artDesk.position.set(4.6, 5.0, 3.8);
    const chandelier = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 8, 24), this.mats.goldGlow);
    chandelier.rotation.x = Math.PI / 2; chandelier.position.set(2.0, 8.8, 0);
    house.add(sofa, table, lamp1, lamp2, artDesk, chandelier);

    // Interactive House Stair/Balcony Teleport Trigger (works BOTH by walking up the stairs OR clicking 1 button!)
    const stairHit = new THREE.Mesh(new THREE.BoxGeometry(5.5, 4.2, 6.5), new THREE.MeshBasicMaterial({ visible: false }));
    stairHit.position.set(6.5, 2.0, 0); stairHit.userData.interactId = 'house-stairs';
    house.add(stairHit);
    this.interactables.push({
      id: 'house-stairs', titleAr: 'منزل باريس المفتوح (الطابق الثاني والشرفة)',
      badgeAr: '🏠 اضغط للدخول والصعود لشرفة منزل باريس العلوية',
      mesh: stairHit, worldPos: new THREE.Vector3(-25, 1.6, 300), radius: 14.0,
    });

    this.scene.add(house);
  }

  enterParisHouseBalcony(goUp = true) {
    if (this.drivingBmw) this.exitBmwDrive();
    this.stopDroneTour(); this.stopBoulevardCabRide(); this.setGuidePhase('idle');
    if (goUp) {
      this.inHouseUpperFloor = true;
      this.playerFloorY = 4.65;
      this.playerPos.set(-22.8, 4.65 + 1.68, 300); // Standing right on the open 2nd-floor Parisian balcony!
      this.targetYaw = -Math.PI * 0.42; // Looking straight out over Champs-Élysées, Galeries Mall & traffic!
      this.playerYaw = this.targetYaw;
      this.targetPitch = -0.06; this.playerPitch = -0.06;
    } else {
      this.inHouseUpperFloor = false;
      this.playerFloorY = 0;
      this.playerPos.set(-6.0, 1.68, 300);
      this.targetYaw = 0; this.playerYaw = 0;
    }
  }

  /* ==================== REAL MODULAR CC0 CITY BUILDINGS & 3D TREES (.GLB) ==================== */
  loadModularCC0CityBuildingsAndTrees() {
    const bUrls = [
      ASSET_MANIFEST.models.city.buildingA,
      ASSET_MANIFEST.models.city.buildingB,
      ASSET_MANIFEST.models.city.buildingC,
      ASSET_MANIFEST.models.city.buildingD,
      ASSET_MANIFEST.models.city.buildingE,
      ASSET_MANIFEST.models.city.buildingF,
    ];
    Promise.all([
      ...bUrls.map((u) => this.assets.loadGLB(u, 'تحميل مباني باريس ثلاثية الأبعاد')),
      this.assets.loadGLB(ASSET_MANIFEST.models.city.treeLarge, 'تحميل أشجار الشانزليزيه 3D'),
      this.assets.loadGLB(ASSET_MANIFEST.models.city.treeSmall),
    ]).then((loaded) => {
      const buildings = loaded.slice(0, 6).filter(Boolean).map((g) => g.scene);
      const treeLarge = loaded[6]?.scene;
      const treeSmall = loaded[7]?.scene;

      // Place real modular architectural 3D GLB buildings along BOTH sides of the 525m Champs-Élysées!
      if (buildings.length > 0) {
        const placeBuilding = (x, z, rotY, idx, scaleY = 10.5) => {
          const clone = buildings[idx % buildings.length].clone(true);
          clone.traverse((o) => {
            if (o.isMesh) {
              o.castShadow = false; o.receiveShadow = true;
              if (o.material) { o.material.roughness = 0.62; o.material.metalness = 0.08; }
            }
          });
          clone.scale.set(9.8, scaleY, 9.8);
          clone.position.set(x, 0, z);
          clone.rotation.y = rotY;
          this.scene.add(clone);
        };

        const eastZ = [410, 384, 358, 334, 244, 218, 192, 166, 140, 114, 88, 60];
        eastZ.forEach((z, i) => placeBuilding(35, z, -Math.PI / 2, i, i % 3 === 0 ? 12.8 : 9.8));

        // West side keeps open spaces at z=300 (Enterable Maison de Paris), z=170 (Police HQ) & Eiffel skyline gap!
        const westZ = [410, 384, 358, 334, 260, 234, 96, 66];
        westZ.forEach((z, i) => placeBuilding(-35, z, Math.PI / 2, i + 2, i % 2 === 0 ? 11.4 : 9.2));
      }

      // Place real 3D GLB boulevard trees along BOTH sides of the promenade (zero flat cards!)
      if (treeLarge && treeSmall) {
        for (let z = 414; z >= 46; z -= 26) {
          if (Math.abs(z - 300) < 16 || Math.abs(z - 170) < 16 || Math.abs(z - 65) < 14) continue;
          [-6.4, 6.4].forEach((tx, sideIdx) => {
            const tClone = ((z + sideIdx) % 2 === 0 ? treeLarge : treeSmall).clone(true);
            tClone.scale.setScalar(2.65);
            tClone.position.set(tx, 0, z);
            tClone.rotation.y = (z * 0.37) % (Math.PI * 2);
            this.scene.add(tClone);
            this.circleColliders.push({ x: tx, z, r: 0.6 });
          });
        }
      }
    });
  }

  /* ==================== REAL DRACO-COMPRESSED DRIVABLE HERO BMW SPORTS CAR ==================== */
  async loadRealDrivableHeroBMW() {
    const gltf = await this.assets.loadGLB(ASSET_MANIFEST.models.heroBmw, 'جاري تحميل سيارة BMW الرياضية الحقيقية');
    if (!gltf) return;

    const wrapper = new THREE.Group();
    const model = gltf.scene;

    // Auto-normalize size to exact real-world BMW length (~4.68m) & orient headlights to +Z!
    const rawBox = new THREE.Box3().setFromObject(model);
    const rawSize = rawBox.getSize(new THREE.Vector3());
    const maxHoriz = Math.max(rawSize.x, rawSize.z);
    const scale = 4.68 / Math.max(0.01, maxHoriz);
    model.scale.setScalar(scale);
    if (rawSize.x > rawSize.z) model.rotation.y = Math.PI / 2;

    model.updateMatrixWorld(true);
    // Check world Z of headlight ('Far') vs taillight ('Led red') to guarantee forward = +Z!
    let farZ = null, tailZ = null;
    const tmpBox = new THREE.Box3();
    const tmpCtr = new THREE.Vector3();
    model.traverse((o) => {
      if (!o.isMesh) return;
      const mName = (Array.isArray(o.material) ? o.material.map((m) => m?.name).join(' ') : o.material?.name) || '';
      if (/far/i.test(mName)) { tmpBox.setFromObject(o).getCenter(tmpCtr); farZ = tmpCtr.z; }
      if (/led red/i.test(mName)) { tmpBox.setFromObject(o).getCenter(tmpCtr); tailZ = tmpCtr.z; }
    });
    if (farZ !== null && tailZ !== null && farZ < tailZ) {
      model.rotation.y += Math.PI;
      model.updateMatrixWorld(true);
    }

    const fitBox = new THREE.Box3().setFromObject(model);
    const fitCtr = fitBox.getCenter(new THREE.Vector3());
    model.position.set(-fitCtr.x, -fitBox.min.y + 0.02, -fitCtr.z);

    // Upgrade ALL BMW materials to photorealistic AAA automotive MeshPhysicalMaterial!
    const paintMat = new THREE.MeshPhysicalMaterial({
      color: BMW_PAINTS[0].hex,
      metalness: 0.9, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.45,
    });
    this.bmwPaintMats.push(paintMat);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d141e, metalness: 0.12, roughness: 0.04, transparent: true, opacity: 0.72,
      ior: 1.5, clearcoat: 1.0, clearcoatRoughness: 0.03, envMapIntensity: 1.6,
    });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe8edf5, metalness: 0.98, roughness: 0.08 });
    const headLightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0c8, emissiveIntensity: 3.2, roughness: 0.1 });
    const tailLightMat = new THREE.MeshStandardMaterial({ color: 0xff1c24, emissive: 0xff141e, emissiveIntensity: 2.2, roughness: 0.15 });
    this.bmwBrakeMats.push(tailLightMat);

    model.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = false; o.receiveShadow = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const nextMats = mats.map((m) => {
        if (!m) return m;
        const n = m.name || '';
        if (/car paint/i.test(n)) return paintMat;
        if (/glass|stuklo/i.test(n)) return glassMat;
        if (/chrome|rims|steel/i.test(n)) return chromeMat;
        if (/^far$/i.test(n)) return headLightMat;
        if (/led red/i.test(n)) return tailLightMat;
        if (/tyre/i.test(n)) { m.roughness = 0.82; m.metalness = 0.05; return m; }
        return m;
      });
      o.material = Array.isArray(o.material) ? nextMats : nextMats[0];
      if (/guma|wheel|rim/i.test(o.name || '')) this.bmwWheels.push(o);
    });

    wrapper.add(model);

    // Realistic dark ground contact shadow under BMW chassis (zero z-fighting!)
    const contactSh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.55, 5.2),
      new THREE.MeshBasicMaterial({ color: 0x030202, transparent: true, opacity: 0.56, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
    );
    contactSh.rotation.x = -Math.PI / 2; contactSh.position.y = 0.04;
    wrapper.add(contactSh);

    // Volumetric Headlight Beams & Taillight Glow Halos!
    [-0.72, 0.72].forEach((hx) => {
      const hGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xfff1cc, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false }));
      hGlow.scale.set(1.4, 1.4, 1); hGlow.position.set(hx, 0.66, 2.34);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(1.15, 7.2, 12, 1, true), new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xfff2cc, transparent: true, opacity: 0.24, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      beam.rotation.x = -Math.PI / 2 + 0.08; beam.position.set(hx, 0.45, 5.8);
      const tGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff2230, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false }));
      tGlow.scale.set(1.2, 1.2, 1); tGlow.position.set(hx, 0.72, -2.32);
      wrapper.add(hGlow, beam, tGlow);
    });

    // Floating Showroom Badge above BMW
    const bmwBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('سيارة BMW الرياضية', 'اضغط للقيادة في شوارع باريس', '#78d2ff'), transparent: true, depthWrite: false }));
    bmwBadge.scale.set(2.2, 0.62, 1); bmwBadge.position.set(0, 2.15, 0);
    this.bmwBadge = bmwBadge;
    wrapper.add(bmwBadge);

    const bmwHit = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 5.2), new THREE.MeshBasicMaterial({ visible: false }));
    bmwHit.position.y = 1.1; bmwHit.userData.interactId = 'bmw';
    wrapper.add(bmwHit);

    wrapper.position.copy(this.bmwPos);
    wrapper.rotation.y = this.bmwYaw;
    this.bmwRoot = wrapper;
    this.bmwLoaded = true;
    this.scene.add(wrapper);

    this.interactables.push({
      id: 'bmw', titleAr: 'سيارة BMW الرياضية في باريس',
      badgeAr: '🚗 اضغط لركوب وقيادة سيارة BMW في شوارع باريس',
      mesh: bmwHit, worldPos: this.bmwPos, radius: 11.5,
    });
  }

  enterBmwDrive() {
    if (!this.bmwLoaded) return false;
    this.stopDroneTour(); this.stopBoulevardCabRide(); this.setGuidePhase('idle');
    this.inHouseUpperFloor = false; this.playerFloorY = 0;
    this.drivingBmw = true;
    this.bmwSpeed = 0;
    if (this.bmwBadge) this.bmwBadge.visible = false;
    if (this.callbacks.onBmwDriveChange) this.callbacks.onBmwDriveChange(true);
    return true;
  }

  exitBmwDrive() {
    if (!this.drivingBmw) return;
    this.drivingBmw = false;
    this.bmwSpeed = 0;
    if (this.bmwBadge) this.bmwBadge.visible = true;
    // Step out cleanly onto the Champs-Élysées promenade right beside the parked BMW!
    const exitX = Math.max(-6.4, Math.min(6.4, this.bmwPos.x > 0 ? 5.6 : -5.6));
    this.playerPos.set(exitX, 1.68, Math.max(24, Math.min(420, this.bmwPos.z)));
    this.resolveCollisions(this.playerPos);
    this.targetYaw = 0; this.playerYaw = 0; this.targetPitch = 0.03; this.playerPitch = 0.03;
    if (this.callbacks.onBmwDriveChange) this.callbacks.onBmwDriveChange(false);
  }

  cycleBmwPaint() {
    this.bmwPaintIdx = (this.bmwPaintIdx + 1) % BMW_PAINTS.length;
    const p = BMW_PAINTS[this.bmwPaintIdx];
    this.bmwPaintMats.forEach((m) => m.color.setHex(p.hex));
    return p;
  }

  /* ==================== WORKING TRAFFIC LIGHTS & CC0 PARIS TRAFFIC ==================== */
  buildWorkingTrafficLightsAndIntersections() {
    const interZList = [{ z: 290, offset: 0 }, { z: 170, offset: 6.5 }, { z: 65, offset: 12.2 }];
    const redOff = new THREE.MeshBasicMaterial({ color: 0x3b1010 });
    const yelOff = new THREE.MeshBasicMaterial({ color: 0x3f300c });
    const grnOff = new THREE.MeshBasicMaterial({ color: 0x0d361c });

    interZList.forEach(({ z, offset }) => {
      [-16, 16].forEach((rx) => {
        for (let sx = -6.2; sx <= 6.2; sx += 1.8) {
          const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 3.8), this.mats.crosswalkStripe);
          stripe.rotation.x = -Math.PI / 2; stripe.position.set(rx + sx, 0.048, z); this.scene.add(stripe);
        }
      });

      const rMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const yMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
      const gMat = new THREE.MeshBasicMaterial({ color: 0x22e568 });
      const lights = [];

      [[-8.3, -1], [8.3, 1]].forEach(([px, dir]) => {
        const pole = new THREE.Group(); pole.position.set(px, 0, z + dir * 4.5);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 5.8, 10), this.mats.ironDark); mast.position.y = 2.9;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.14, 0.14), this.mats.ironDark); arm.position.set(dir * 2.7, 5.55, 0);
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.85, 0.55), this.mats.ironDark); box.position.set(dir * 4.5, 5.0, 0);
        const makeLens = (ly, mat, sideZ) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), mat); m.position.set(dir * 4.5, 5.0 + ly, sideZ); if (sideZ < 0) m.rotation.y = Math.PI; return m; };
        const r1 = makeLens(0.54, rMat, 0.29), r2 = makeLens(0.54, rMat, -0.29);
        const y1 = makeLens(0.0, yMat, 0.29), y2 = makeLens(0.0, yMat, -0.29);
        const g1 = makeLens(-0.54, gMat, 0.29), g2 = makeLens(-0.54, gMat, -0.29);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x22e568, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(2.4, 2.4, 1); halo.position.set(dir * 4.5, 4.46, 0);
        pole.add(mast, arm, box, r1, r2, y1, y2, g1, g2, halo); this.scene.add(pole);
        lights.push({ r: [r1, r2], y: [y1, y2], g: [g1, g2], halo, baseY: 5.0 });
      });

      this.intersections.push({ z, timer: offset, state: 'green', lights, mats: { rMat, yMat, gMat, redOff, yelOff, grnOff } });
    });
  }

  loadRealCC0ParisTrafficVehicles() {
    const entries = Object.entries(ASSET_MANIFEST.models.traffic);
    Promise.all(entries.map(([, url]) => this.assets.loadGLB(url, 'تحميل سيارات شوارع باريس'))).then((gltfs) => {
      const bank = {};
      entries.forEach(([k], i) => { if (gltfs[i]) bank[k] = gltfs[i].scene; });
      if (!bank.police) return;

      const shadowGeo = new THREE.PlaneGeometry(2.3, 4.4);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.44, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xfff3cc });
      const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2b2b });

      const spawnCar = (type, laneX, z, dirZ, maxSpeed, parked = false) => {
        if (!bank[type]) return;
        const root = new THREE.Group();
        const mesh = bank[type].clone(true);
        const wheels = [];
        mesh.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = false; o.receiveShadow = false;
            if (o.material) { o.material.metalness = 0.45; o.material.roughness = 0.24; }
          }
          if (/wheel/i.test(o.name || '')) wheels.push(o);
        });
        mesh.scale.setScalar(1.48); root.add(mesh);

        const sh = new THREE.Mesh(shadowGeo, shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.04; root.add(sh);
        [-0.62, 0.62].forEach((lx) => {
          const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), hlMat); hl.position.set(lx, 0.62, 1.98);
          const tl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), tlMat); tl.position.set(lx, 0.65, -1.96);
          root.add(hl, tl);
        });

        if (type === 'police') {
          const redGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff2838, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
          redGlow.scale.set(2.4, 2.4, 1); redGlow.position.set(-0.36, 2.05, 0.15);
          const blueGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x2884ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
          blueGlow.scale.set(2.4, 2.4, 1); blueGlow.position.set(0.36, 2.05, 0.15);
          root.add(redGlow, blueGlow);
          this.policeLightBars.push({ redGlow, blueGlow, phase: Math.random() * 6 });
        }

        root.position.set(laneX, 0, z); root.rotation.y = dirZ > 0 ? 0 : Math.PI;
        this.scene.add(root);
        if (!parked) this.trafficVehicles.push({ root, wheels, laneX, z, dirZ, speed: maxSpeed * 0.7, maxSpeed });
      };

      spawnCar('police', -25.8, 176, -1, 0, true);
      spawnCar('taxi', 25.8, 296, 1, 0, true);

      // Keep East inner lane (x=+12.2) around z=368 clean for parked Hero BMW!
      const allSpecs = [
        ['police', -19.5, 415, -1, 13.5], ['taxi', -19.5, 315, -1, 11.8], ['sedan', -19.5, 200, -1, 11.2], ['suv', -19.5, 95, -1, 12.0],
        ['sports', -12.6, 65, 1, 13.8], ['sedan', -12.6, 190, 1, 11.5], ['taxi', -12.6, 330, 1, 12.2],
        ['taxi', 19.5, 58, 1, 11.8], ['suv', 19.5, 165, 1, 12.2], ['sedan', 19.5, 285, 1, 11.4], ['sports', 19.5, 385, 1, 13.4],
        ['police', 12.6, 130, -1, 13.0],
      ];
      const chosen = this.isMobile ? allSpecs.filter((_, idx) => idx % 2 === 0) : allSpecs;
      chosen.forEach(([t, lx, z, dz, spd]) => spawnCar(t, lx, z, dz, spd, false));
    });
  }

  /* ==================== MASSIVE 128M EIFFEL TOWER ==================== */
  buildArchitecturalEiffelTower() {
    const tower = new THREE.Group(); tower.position.set(-86, 0, 135); tower.scale.setScalar(1.42);
    [[-10.5, -10.5], [10.5, -10.5], [10.5, 10.5], [-10.5, 10.5]].forEach(([lx, lz]) => {
      const p0 = new THREE.Vector3(lx, 0, lz), p1 = new THREE.Vector3(lx * 0.48, 22, lz * 0.48), p2 = new THREE.Vector3(lx * 0.24, 42, lz * 0.24);
      [[p0, p1, 1.35, 0.92], [p1, p2, 0.88, 0.54]].forEach(([a, b, r1, r2]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), 6), this.mats.eiffelSteel);
        leg.position.copy(a).lerp(b, 0.5); leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        tower.add(leg);
      });
    });
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 21), this.mats.eiffelLattice);
      panel.position.set(Math.sin(rot) * 7.6, 11, Math.cos(rot) * 7.6); panel.rotation.y = rot; panel.rotation.x = -0.22;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.45, 8, 24, Math.PI), this.mats.eiffelSteel);
      arch.position.set(Math.sin(rot) * 9.8, 5.2, Math.cos(rot) * 9.8); arch.rotation.y = rot;
      tower.add(panel, arch);
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
    beacon.scale.set(10, 10, 1); beacon.position.y = 89.5; this.eiffelBeacon = beacon; tower.add(beacon);

    this.eiffelSearchlightRig = new THREE.Group(); this.eiffelSearchlightRig.position.y = 88.5;
    this.eiffelSearchlightMat = new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xfff1c4, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    [0, Math.PI].forEach((rot) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(16, 145, 16, 1, true), this.eiffelSearchlightMat);
      cone.rotation.z = Math.PI / 2 - 0.14; cone.rotation.y = rot; cone.position.set(Math.cos(rot) * 70, -8, Math.sin(rot) * 70);
      this.eiffelSearchlightRig.add(cone);
    });
    tower.add(this.eiffelSearchlightRig);

    for (let i = 0; i < 36; i++) {
      const h = 10 + (i / 36) * 72, r = THREE.MathUtils.lerp(9.6, 1.3, h / 82), ang = i * 1.45;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe6a6, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.position.set(Math.cos(ang) * r, h, Math.sin(ang) * r); sp.scale.set(1.5, 1.5, 1); tower.add(sp);
      this.eiffelSparkles.push({ sprite: sp, phase: i * 0.7, speed: 3.0 + (i % 4) * 1.2 });
    }
    this.scene.add(tower);
  }

  /* ==================== COUR NAPOLÉON, PHYSICAL GLASS PYRAMID & FOUNTAIN ==================== */
  buildOpenPortalLouvrePyramidAndFountain() {
    const plazaMat = new THREE.MeshStandardMaterial({
      map: this.plazaCobbleScan.map, normalMap: this.plazaCobbleScan.normalMap, normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: this.plazaCobbleScan.roughnessMap, roughness: 0.72, metalness: 0.08,
    });
    const plazaFloor = new THREE.Mesh(new THREE.PlaneGeometry(76, 38), plazaMat);
    plazaFloor.rotation.x = -Math.PI / 2; plazaFloor.position.set(0, 0, 13); plazaFloor.receiveShadow = true;
    this.scene.add(plazaFloor);

    const plazaRunner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 38), this.mats.runnerOverlay);
    plazaRunner.rotation.x = -Math.PI / 2; plazaRunner.position.set(0, 0.045, 13); this.scene.add(plazaRunner);

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
    this.interactables.push({ id: 'fountain', titleAr: 'نافورة أمنيات ساحة اللوفر', badgeAr: '🪙 اضغط لإلقاء عملة أمنية ليمنى في نافورة اللوفر', mesh: fHit, worldPos: new THREE.Vector3(6.8, 1.2, 11.2), radius: 7.8 });

    const B = 5.4, H = 7.9, doorHW = 1.85, doorH = 3.45;
    const pyrGroup = new THREE.Group(); pyrGroup.position.set(0, 0, 7.0);
    [-1, 1].forEach((signX) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute([signX * B, 0, B, signX * B, 0, -B, 0, H, 0], 3));
      geo.computeVertexNormals(); pyrGroup.add(new THREE.Mesh(geo, this.mats.glassPyramid));
    });
    this.boxColliders.push({ minX: -5.4, maxX: -1.85, minZ: 1.7, maxZ: 12.3 }, { minX: 1.85, maxX: 5.4, minZ: 1.7, maxZ: 12.3 });

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
      geo.computeVertexNormals(); pyrGroup.add(new THREE.Mesh(geo, this.mats.glassPyramid));

      const portalZ = signZ * (B - 0.15);
      const frameGrp = new THREE.Group(); frameGrp.position.set(0, 0, portalZ);
      [-doorHW, doorHW].forEach((px) => { const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.16, doorH + 0.1, 0.24), this.mats.gold); pillar.position.set(px, doorH * 0.5, 0); frameGrp.add(pillar); });
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(doorHW * 2 + 0.36, 0.2, 0.3), this.mats.goldGlow); lintel.position.set(0, doorH + 0.05, 0); frameGrp.add(lintel);

      const makeDoorLeaf = (side) => {
        const leaf = new THREE.Group();
        const pane = new THREE.Mesh(new THREE.BoxGeometry(doorHW - 0.06, doorH - 0.08, 0.05), this.mats.glassDoor); pane.position.y = doorH * 0.5;
        const border = new THREE.Mesh(new THREE.BoxGeometry(doorHW - 0.02, 0.1, 0.07), this.mats.gold); border.position.y = doorH - 0.08;
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), this.mats.goldGlow); handle.position.set(-side * (doorHW * 0.38), 1.35, 0.05);
        leaf.add(pane, border, handle); leaf.position.x = side * (doorHW * 0.5); return leaf;
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
      const wing = new THREE.Mesh(new THREE.BoxGeometry(19, 13.8, 3.6), this.mats.louvrePalace); wing.position.set(x, 6.9, 0);
      const wingRoof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 3.2, 3.1), this.mats.mansard); wingRoof.position.set(x, 15.4, -0.1);
      facade.add(wing, wingRoof);
      for (let cx = -7.5; cx <= 7.5; cx += 5.0) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 12.8, 12), this.mats.marble); col.position.set(x + cx, 6.6, 1.92); facade.add(col); }
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
      const sideWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 13.6, 28), this.mats.louvrePalace); sideWing.position.set(wx, 6.8, 14);
      const sideRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.0, 28), this.mats.mansard); sideRoof.position.set(wx, 15.1, 14);
      facade.add(sideWing, sideRoof);
    });
    this.scene.add(facade);
    this.boxColliders.push({ minX: -24, maxX: -3.4, minZ: -9.0, maxZ: -4.8 }, { minX: 3.4, maxX: 24, minZ: -9.0, maxZ: -4.8 });
  }

  tossWishingCoin() {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.035, 18), this.mats.goldGlow);
    coin.position.set(5.6, 1.65, 11.2); this.scene.add(coin);
    this.flyingCoins.push({ mesh: coin, t: 0, p0: new THREE.Vector3(5.6, 1.65, 11.2), p1: new THREE.Vector3(9.8, 0.32, 9.4) });
  }

  /* ==================== OBSTRUCTION-FREE LOUVRE GRANDE GALERIE (BENCHES MOVED TO SIDE ALCOVES!) ==================== */
  buildLouvreGrandGalleryInterior() {
    const hallLen = 74.4, hallMidZ = -43.2;

    const parquetMat = new THREE.MeshStandardMaterial({
      map: this.parquetScan.map, normalMap: this.parquetScan.normalMap, normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: this.parquetScan.roughnessMap, roughness: 0.34, metalness: 0.1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, hallLen), parquetMat);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, hallMidZ); floor.receiveShadow = true;
    this.scene.add(floor);

    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(3.4, hallLen - 0.6), this.mats.velvetRed);
    carpet.rotation.x = -Math.PI / 2; carpet.position.set(0, 0.045, hallMidZ); this.scene.add(carpet);
    [-1.76, 1.76].forEach((x) => {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, hallLen - 0.6), this.mats.goldOverlay);
      b.rotation.x = -Math.PI / 2; b.position.set(x, 0.052, hallMidZ); this.scene.add(b);
    });

    [-6.0, -80.4].forEach((tz) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.08, 0.36), this.mats.gold); bar.position.set(0, 0.04, tz); this.scene.add(bar);
    });

    const galleryWallMat = new THREE.MeshStandardMaterial({ map: this.wallPanelTex, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.22, 0.22), roughness: 0.62 });
    const wallGeo = new THREE.BoxGeometry(0.8, 9.8, hallLen + 1);
    [-8.8, 8.8].forEach((x) => {
      const wall = new THREE.Mesh(wallGeo, galleryWallMat); wall.position.set(x, 4.9, hallMidZ);
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.4, hallLen + 1), this.mats.gold); cornice.position.set(x, 9.45, hallMidZ);
      this.scene.add(wall, cornice);
    });

    [-6.0, 6.0].forEach((x) => { const ceilSide = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, hallLen + 1), this.mats.marble); ceilSide.position.set(x, 9.7, hallMidZ); this.scene.add(ceilSide); });
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

    // Velvet museum benches neatly placed in SIDE ALCOVES (x = ±5.8) -> 100% CLEAR CENTRAL WALKING CORRIDOR!
    [[-5.8, -41], [5.8, -55], [-5.8, -68]].forEach(([bx, bz]) => {
      const bench = new THREE.Group(); bench.position.set(bx, 0, bz); bench.rotation.y = Math.PI / 2;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.72), this.mats.velvetRed); seat.position.y = 0.52;
      const trim = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 0.78), this.mats.woodDark); trim.position.y = 0.44;
      [-0.85, 0.85].forEach((lx) => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.64), this.mats.woodDark); leg.position.set(lx, 0.21, 0); bench.add(leg); });
      bench.add(seat, trim);
      this.boxColliders.push({ minX: bx - 0.55, maxX: bx + 0.55, minZ: bz - 1.25, maxZ: bz + 1.25 });
      this.scene.add(bench);
    });

    [-19, -34, -48, -62, -75].forEach((z) => {
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 10.8), new THREE.MeshBasicMaterial({ map: this.beamTex, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      beam.position.set(0, 5.0, z); beam.rotation.z = 0.14; this.scene.add(beam);
    });
  }

  /* ==================== 5 HIDDEN COLLECTIBLE GOLDEN WAX SEALS ==================== */
  buildFiveHiddenMuseumSeals() {
    const discGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 22);
    const rimGeo = new THREE.TorusGeometry(0.32, 0.035, 8, 28);
    HIDDEN_SEALS_DATA.forEach((s, i) => {
      const baseY = s.y || 1.35;
      const grp = new THREE.Group(); grp.position.set(s.x, baseY, s.z);
      const disc = new THREE.Mesh(discGeo, this.mats.waxCrimson); disc.rotation.x = Math.PI / 2;
      const rim = new THREE.Mesh(rimGeo, this.mats.goldGlow);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe084, transparent: true, opacity: 0.76, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.set(1.35, 1.35, 1);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.interactId = s.id;
      grp.add(disc, rim, glow, hit); this.scene.add(grp);

      const entry = { ...s, baseY, mesh: grp, hit, collected: false, phase: i * 1.3 };
      this.hiddenSeals.push(entry);
      this.interactables.push({ id: s.id, titleAr: s.labelAr, badgeAr: `🏅 اضغط لجمع الختم الذهبي المخفي — ${s.labelAr}`, mesh: hit, worldPos: new THREE.Vector3(s.x, baseY, s.z), radius: 5.2 });
    });
  }

  collectHiddenSeal(sealId) {
    const s = this.hiddenSeals.find((it) => it.id === sealId);
    if (!s || s.collected) return null;
    s.collected = true; s.mesh.visible = false;
    this.interactables = this.interactables.filter((it) => it.id !== sealId);
    if (this.nearestInteractable?.id === sealId) { this.nearestInteractable = null; if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(null); }
    return s;
  }

  /* ==================== 4 ARTIFACTS WITH REAL VOLUMETRIC MUSEUM SPOTLIGHTS ==================== */
  createFramedGalleryPainting(imagePath, secretAr, code, w = 3.7, h = 2.75) {
    const group = new THREE.Group();
    const border = 0.22;
    const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(w + border * 2, h + border * 2, 0.18), this.mats.gold);
    const innerLip = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.22), this.mats.woodDark);
    const tex = this.texLoader.load(imagePath); tex.colorSpace = THREE.SRGBColorSpace;
    const art = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.34, metalness: 0.04 }));
    art.position.z = 0.115;

    if (secretAr) {
      const uvMesh = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.96), new THREE.MeshBasicMaterial({ map: createUVSecretOverlayTexture(secretAr, code), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      uvMesh.position.z = 0.14; uvMesh.visible = false; group.add(uvMesh); this.uvSecretMeshes.push(uvMesh);
    }

    const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.65), this.mats.gold); lampArm.position.set(0, h * 0.5 + 0.34, 0.35);
    const lampHood = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.35, 10), this.mats.gold); lampHood.rotation.z = Math.PI / 2; lampHood.position.set(0, h * 0.5 + 0.34, 0.66);
    const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe4a0, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false }));
    lampGlow.scale.set(2.4, 1.3, 1); lampGlow.position.set(0, h * 0.5 + 0.15, 0.58);
    // Volumetric spotlight cone illuminating each painting!
    const spotCone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 4.2, 14, 1, true), new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xffe6b0, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
    spotCone.position.set(0, 0.1, 0.65); spotCone.rotation.x = 0.14;
    group.add(outerFrame, innerLip, art, lampArm, lampHood, lampGlow, spotCone);
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
    // Pedestals positioned neatly at x = ±4.8 leaving an ultra-wide 6.6m unobstructed central corridor!
    const stations = [
      { id: 'childhood', x: -4.8, z: -20, wallX: -8.24, rotY: Math.PI / 2, num: '01', shortAr: 'البدايات', ch: chapters[0] },
      { id: 'passion', x: 4.8, z: -34, wallX: 8.24, rotY: -Math.PI / 2, num: '02', shortAr: 'الشغف', ch: chapters[1] },
      { id: 'thanaweya', x: -4.8, z: -48, wallX: -8.24, rotY: Math.PI / 2, num: '03', shortAr: 'تالتة ثانوي', ch: chapters[2] },
      { id: 'fine-arts', x: 4.8, z: -62, wallX: 8.24, rotY: -Math.PI / 2, num: '04', shortAr: 'فنون جميلة', ch: chapters[3] },
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
        artCenter.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.54, 0), new THREE.MeshStandardMaterial({ color: 0xf5d076, emissive: 0x9e6f1e, emissiveIntensity: 0.4, metalness: 0.85, roughness: 0.2, wireframe: true })), new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), this.mats.marble));
      } else if (idx === 2) {
        const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffe6a8, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.2, clearcoat: 1 });
        const topC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 16), glassMat); topC.position.y = 0.26; topC.rotation.x = Math.PI;
        const botC = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 16), glassMat); botC.position.y = -0.26;
        const cap1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 18), this.mats.goldGlow); cap1.position.y = 0.52;
        const cap2 = cap1.clone(); cap2.position.y = -0.52; artCenter.add(topC, botC, cap1, cap2);
      } else {
        const pts = [new THREE.Vector2(0.0, -0.48), new THREE.Vector2(0.24, -0.48), new THREE.Vector2(0.20, -0.40), new THREE.Vector2(0.09, -0.32), new THREE.Vector2(0.14, -0.16), new THREE.Vector2(0.28, 0.04), new THREE.Vector2(0.24, 0.22), new THREE.Vector2(0.11, 0.31), new THREE.Vector2(0.15, 0.44), new THREE.Vector2(0.12, 0.54), new THREE.Vector2(0.0, 0.56)];
        artCenter.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), this.mats.marble), new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.022, 10, 44), this.mats.goldGlow));
      }
      grp.add(artCenter); this.floatingProps.push({ mesh: artCenter, baseY: 2.08, speed: 1.2 + idx * 0.2 });

      const parchment = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 1.0), new THREE.MeshBasicMaterial({ map: createParchmentTexture(`التحفة ${st.num}`, st.shortAr), side: THREE.DoubleSide }));
      parchment.position.set(st.x < 0 ? 0.96 : -0.96, 1.58, 0.56); parchment.rotation.y = st.x < 0 ? 0.42 : -0.42;
      grp.add(parchment); this.parchments.push({ mesh: parchment, baseY: 1.58, phase: idx * 1.4 });

      const wallArt = this.createFramedGalleryPainting(st.ch?.image || './assets/art/chapter1-childhood.jpg', uvSecrets[idx], `CH-0${idx + 1}`);
      wallArt.position.set(st.wallX, 3.7, st.z); wallArt.rotation.y = st.rotY; this.scene.add(wallArt);

      // Real SpotLight focusing warmly on Yomna's painting (Desktop)
      if (!this.isMobile) {
        const spot = new THREE.SpotLight(0xffe7b8, 22, 16, Math.PI / 5, 0.5, 1.4);
        spot.position.set(st.wallX * 0.42, 8.6, st.z);
        spot.target.position.set(st.wallX, 3.7, st.z);
        this.scene.add(spot, spot.target);
      }

      const hitbox = new THREE.Mesh(new THREE.BoxGeometry(2.9, 3.5, 2.7), new THREE.MeshBasicMaterial({ visible: false }));
      hitbox.position.y = 1.7; hitbox.userData.interactId = st.id; grp.add(hitbox);

      this.interactables.push({ id: st.id, titleAr: st.ch?.titleAr || st.shortAr, badgeAr: `📜 اضغط لفتح التحفة ${st.num} — ${st.shortAr}`, mesh: hitbox, worldPos: new THREE.Vector3(st.x, 1.5, st.z), radius: 7.8 });
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

    const easel = new THREE.Group(); easel.position.set(4.8, 0, -27); easel.rotation.y = -0.55;
    [-0.38, 0.38].forEach((lx) => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.35, 8), this.mats.woodDark); leg.position.set(lx, 1.12, 0); leg.rotation.z = -lx * 0.22; leg.rotation.x = -0.14; easel.add(leg); });
    const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.3, 8), this.mats.woodDark); backLeg.position.set(0, 1.08, -0.45); backLeg.rotation.x = 0.32;
    const tray = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.18), this.mats.gold); tray.position.set(0, 0.98, 0.14);
    const miniBoard = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.88, 0.05), this.mats.gold); miniBoard.position.set(0, 1.46, 0.04); miniBoard.rotation.x = -0.14;
    const miniArt = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.78), new THREE.MeshBasicMaterial({ map: this.customPaintingTex })); miniArt.position.set(0, 1.46, 0.072); miniArt.rotation.x = -0.14;
    const eRing = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.18, 30), new THREE.MeshBasicMaterial({ color: 0xffe28a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    eRing.rotation.x = -Math.PI / 2; eRing.position.y = 0.055;
    const eHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), new THREE.MeshBasicMaterial({ visible: false })); eHit.position.y = 1.4; eHit.userData.interactId = 'easel';
    easel.add(backLeg, tray, miniBoard, miniArt, eRing, eHit);
    this.circleColliders.push({ x: 4.8, z: -27, r: 0.95 }); this.scene.add(easel);

    this.interactables.push({ id: 'easel', titleAr: 'مرسم اللوفر التفاعلي', badgeAr: '🎨 اضغط لرسم لوحة وتعليقها على جدار متحف اللوفر', mesh: eHit, worldPos: new THREE.Vector3(4.8, 1.5, -27), radius: 7.8 });
  }

  updateCustomLouvreWallPainting(sourceCanvas) {
    const ctx = this.customPaintingCanvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0, this.customPaintingCanvas.width, this.customPaintingCanvas.height);
    this.customPaintingTex.needsUpdate = true;
  }

  buildRoyalFamilyVaultAndManifesto() {
    const vaultGrp = new THREE.Group(); vaultGrp.position.set(-4.6, 0, -75);
    const ped = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.05, 1.42), this.mats.marble); ped.position.y = 0.525;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.14, 1.48), this.mats.velvetRed); cloth.position.y = 1.06;
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.62, 0.86), this.mats.woodDark); boxBody.position.y = 1.42;
    const boxRim = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.1, 0.92), this.mats.goldGlow); boxRim.position.y = 1.72;
    const boxLid = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 1.26, 14, 1, false, 0, Math.PI), this.mats.gold); boxLid.rotation.z = Math.PI / 2; boxLid.position.y = 1.74;
    const envOrbit = new THREE.Group(); envOrbit.position.y = 2.48;
    for (let i = 0; i < 4; i++) { const env = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.04), this.mats.goldGlow); const a = (i / 4) * Math.PI * 2; env.position.set(Math.cos(a) * 0.64, Math.sin(i * 1.4) * 0.12, Math.sin(a) * 0.64); env.rotation.y = -a; envOrbit.add(env); }
    this.floatingProps.push({ mesh: envOrbit, baseY: 2.48, speed: 1.5 });

    const vRing = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.48, 32), new THREE.MeshBasicMaterial({ color: 0xffd87a, transparent: true, opacity: 0.72, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    vRing.rotation.x = -Math.PI / 2; vRing.position.y = 0.055;
    const vHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 2.5), new THREE.MeshBasicMaterial({ visible: false })); vHit.position.y = 1.6; vHit.userData.interactId = 'vault';
    vaultGrp.add(ped, cloth, boxBody, boxRim, boxLid, envOrbit, vRing, vHit);
    this.circleColliders.push({ x: -4.6, z: -75, r: 1.3 }); this.scene.add(vaultGrp);
    this.interactables.push({ id: 'vault', titleAr: 'صندوق رسائل العائلة ليمنى', badgeAr: '💌 اضغط لفتح صندوق رسائل العائلة السحابي', mesh: vHit, worldPos: new THREE.Vector3(-4.6, 1.6, -75), radius: 7.8 });

    const manGrp = new THREE.Group(); manGrp.position.set(4.6, 0, -75);
    const mPed = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 1.12), this.mats.marble); mPed.position.y = 0.25;
    const stele = new THREE.Mesh(new THREE.BoxGeometry(1.56, 2.62, 0.28), this.mats.marble); stele.position.y = 1.8;
    const steleFrame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.75, 0.2), this.mats.goldGlow); steleFrame.position.y = 1.8;
    const manTex = createParchmentTexture('الرسالة الأهم ★', 'ثانوية عامة البداية');
    const manFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.28), new THREE.MeshBasicMaterial({ map: manTex })); manFace.position.set(0, 1.8, 0.155);
    const manFaceBack = manFace.clone(); manFaceBack.position.z = -0.155; manFaceBack.rotation.y = Math.PI;
    const mHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.4, 2.3), new THREE.MeshBasicMaterial({ visible: false })); mHit.position.y = 1.7; mHit.userData.interactId = 'manifesto';
    manGrp.add(mPed, steleFrame, stele, manFace, manFaceBack, vRing.clone(), mHit);
    this.circleColliders.push({ x: 4.6, z: -75, r: 1.3 }); this.scene.add(manGrp);
    this.interactables.push({ id: 'manifesto', titleAr: 'الرسالة الأهم في ختام الرحلة', badgeAr: '★ اضغط لقراءة الرسالة الأهم وكبسولة الطمأنينة', mesh: mHit, worldPos: new THREE.Vector3(4.6, 1.7, -75), radius: 7.8 });
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
    cake.add(c1, c9); this.cakeGroup = cake; rotunda.add(cake);

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

  /* ==================== RIGGED MOCAP HUMANS & CUSTOM ANAS HABIB 3D GUIDE ==================== */
  loadOptimizedMocapHumanVisitorsAndAnasGuide() {
    Promise.all([
      this.assets.loadGLB(ASSET_MANIFEST.models.characters.humanAvatar, 'تحميل الشخصيات الواقعية 3D'),
      this.assets.loadGLB(ASSET_MANIFEST.models.characters.humanWalkAnim),
      this.assets.loadGLB(ASSET_MANIFEST.models.characters.humanIdleAnim),
    ]).then(([avatarGltf, walkGltf, idleGltf]) => {
      if (!avatarGltf) return;
      const walkClip = walkGltf?.animations?.[0];
      const idleClip = idleGltf?.animations?.[0];
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

      // ---- 1. CUSTOM ANAS HABIB 3D TOUR GUIDE (Curly Hair + Clean Upper Lip + Chinstrap + Striped Jersey!) ----
      const anas = SkeletonUtils.clone(avatarGltf.scene);
      const jerseyTex = createAnasJerseyTexture();
      let headBone = null;

      anas.traverse((o) => {
        if (o.isBone && o.name === 'Head') headBone = o;
        if (o.isMesh) {
          o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false;
          if (o.name === 'Mesh' || o.material?.name === 'Wolf3D_Headwear') o.visible = false;
          // Hide full mustache beard mesh -> we sculpt a clean jawline-only chinstrap matching Anas's exact photos!
          if (o.name === 'Wolf3D_Beard') o.visible = false;
          if (o.material?.name === 'Wolf3D_Skin') { o.material = o.material.clone(); o.material.color.setHex(0xf2d4bd); }
          if (o.material?.name === 'Wolf3D_Outfit_Top') {
            o.material = o.material.clone(); o.material.map = jerseyTex; o.material.color.setHex(0xffffff); o.material.roughness = 0.65; o.material.needsUpdate = true;
          }
          if (o.material?.name === 'Wolf3D_Outfit_Bottom') { o.material = o.material.clone(); o.material.color.setHex(0x1a1d24); }
          if (o.material?.name === 'Wolf3D_Outfit_Footwear') { o.material = o.material.clone(); o.material.color.setHex(0xf4f5f7); }
        }
      });

      if (headBone) {
        const curlGrp = new THREE.Group();
        const curlMat = new THREE.MeshStandardMaterial({ color: 0x1b130e, roughness: 0.92, metalness: 0.04 });
        const curlGeo = new THREE.IcosahedronGeometry(0.036, 1);
        const curlCoords = [
          [0, 0.21, 0.02, 1.25], [-0.05, 0.20, 0.03, 1.15], [0.05, 0.20, 0.03, 1.15],
          [-0.08, 0.17, 0.01, 1.1], [0.08, 0.17, 0.01, 1.1], [0, 0.21, -0.04, 1.2],
          [-0.06, 0.19, -0.05, 1.15], [0.06, 0.19, -0.05, 1.15], [-0.09, 0.15, -0.04, 1.05],
          [0.09, 0.15, -0.04, 1.05], [0, 0.17, -0.09, 1.15], [-0.05, 0.15, -0.09, 1.05],
          [0.05, 0.15, -0.09, 1.05], [-0.09, 0.11, -0.06, 0.95], [0.09, 0.11, -0.06, 0.95],
          [0, 0.12, -0.10, 1.0], [-0.06, 0.11, -0.09, 0.92], [0.06, 0.11, -0.09, 0.92],
          [-0.055, 0.175, 0.082, 1.0], [-0.015, 0.185, 0.092, 1.05], [0.025, 0.182, 0.090, 1.02],
          [0.062, 0.172, 0.078, 0.98], [-0.035, 0.152, 0.098, 0.85], [0.015, 0.154, 0.102, 0.82],
          [0.048, 0.148, 0.094, 0.8], [-0.082, 0.145, 0.055, 0.92], [0.082, 0.145, 0.055, 0.92],
          [-0.094, 0.12, 0.015, 0.85], [0.094, 0.12, 0.015, 0.85], [-0.02, 0.22, 0.06, 1.05],
          [0.03, 0.22, 0.05, 1.05], [-0.07, 0.20, 0.06, 0.95], [0.07, 0.20, 0.06, 0.95], [0, 0.23, -0.01, 1.1],
        ];
        curlCoords.forEach(([x, y, z, s], idx) => {
          const m = new THREE.Mesh(curlGeo, curlMat);
          m.position.set(x, y, z); m.scale.set(s, s * 0.92, s); m.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4);
          curlGrp.add(m);
        });
        // Subtle jawline-only chinstrap beard arc (clean upper lip, matching all 3 uploaded photos!)
        const chinArc = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.006, 6, 14, Math.PI * 0.82), curlMat);
        chinArc.rotation.set(Math.PI * 0.56, 0, Math.PI * 0.09);
        chinArc.position.set(0, -0.026, 0.052);
        curlGrp.add(chinArc);
        headBone.add(curlGrp);
      }

      const anasBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('أنس حبيب', 'المرشد السياحي الخاص ليوسف', '#76d0ff'), transparent: true, depthWrite: false }));
      anasBadge.scale.set(1.55, 0.44, 1); anasBadge.position.set(0, 2.28, 0);
      const anasLight = new THREE.PointLight(0xfff1d6, 2.6, 5.5, 1.4); anasLight.position.set(0, 1.9, 1.1);
      const anasDisc = new THREE.Mesh(shadowGeo, shadowMat); anasDisc.rotation.x = -Math.PI / 2; anasDisc.position.y = 0.045;
      anas.scale.setScalar(1.04); this.anasGroup.add(anas, anasBadge, anasLight, anasDisc);

      this.anasMixer = new THREE.AnimationMixer(anas);
      if (walkClip) { this.anasWalkAction = this.anasMixer.clipAction(walkClip); this.anasWalkAction.setEffectiveTimeScale(1.12); }
      if (idleClip) { this.anasIdleAction = this.anasMixer.clipAction(idleClip); this.anasIdleAction.play(); }
      this.anasLoaded = true;

      // ---- 2. PARIS PEDESTRIANS + UNIFORMED POLICE OFFICER ----
      const outfits = [
        { top: 0x163875, bot: 0x0f1a33, hat: true, beard: false },
        { top: 0x5c202a, bot: 0x1d1f26, hat: false, beard: false },
        { top: 0x9c7b56, bot: 0x24201c, hat: false, beard: true },
        { top: 0x2e4238, bot: 0x212328, hat: true, beard: true },
        { top: 0xd8cfc2, bot: 0x2a3140, hat: false, beard: false },
        { top: 0x222c3d, bot: 0x181a20, hat: false, beard: false },
      ];
      const allSpecs = [
        { x: -24.8, z0: 169, z1: 169, rotY: Math.PI * 0.5, walking: false, scale: 1.02 },
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
        const disc = new THREE.Mesh(shadowGeo, shadowMat); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.045;
        clone.add(disc); clone.scale.setScalar(sp.scale); clone.position.set(sp.x, 0, sp.z0);
        if (!sp.walking && sp.rotY !== undefined) clone.rotation.y = sp.rotY;

        const mixer = new THREE.AnimationMixer(clone);
        const clip = sp.walking ? walkClip : idleClip;
        if (clip) { const action = mixer.clipAction(clip); action.time = (idx * 0.47) % clip.duration; action.setEffectiveTimeScale(sp.walking ? sp.speed * 0.85 : 0.9); action.play(); }
        this.scene.add(clone);
        this.humanVisitors.push({ root: clone, mixer, ...sp, progress: (idx * 0.31) % 1, dir: 1 });
      });
    });
  }

  /* ==================== WEATHER PARTICLES & PAW PRINTS ==================== */
  buildWeatherParticles() {
    const count = this.isMobile ? 32 : 64;
    this.leafInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ color: 0xf6cf76, side: THREE.DoubleSide, transparent: true, opacity: 0.72 }), count);
    this.leafDummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) this.fallingLeaves.push({ x: (Math.random() - 0.5) * 34, y: 1 + Math.random() * 14, z: (Math.random() - 0.5) * 60, spd: 0.4 + Math.random() * 0.65, ph: Math.random() * Math.PI * 2 });
    this.scene.add(this.leafInst);

    const rCount = this.isMobile ? 220 : 420;
    const rPos = new Float32Array(rCount * 6);
    for (let i = 0; i < rCount; i++) {
      const rx = (Math.random() - 0.5) * 44, ry = Math.random() * 22, rz = (Math.random() - 0.5) * 44;
      rPos[i * 6] = rx; rPos[i * 6 + 1] = ry; rPos[i * 6 + 2] = rz;
      rPos[i * 6 + 3] = rx; rPos[i * 6 + 4] = ry - 0.55; rPos[i * 6 + 5] = rz;
    }
    const rGeo = new THREE.BufferGeometry(); rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
    this.rainPositions = rPos;
    this.rainDrops = new THREE.LineSegments(rGeo, new THREE.LineBasicMaterial({ color: 0xbcdcf5, transparent: true, opacity: 0.48 }));
    this.rainDrops.visible = false; this.scene.add(this.rainDrops);
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.34, 0.34);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.pawTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.rotation.x = -Math.PI / 2; m.visible = false; this.scene.add(m); this.pawPrints.push({ mesh: m, life: 0 });
    }
  }

  spawnPawPrint(pos, yaw) {
    if (this.activeGuideType !== 'bobs') return;
    const slot = this.pawPrints[this.pawIdx]; this.pawIdx = (this.pawIdx + 1) % this.pawPrints.length;
    const side = (this.pawIdx % 2 === 0 ? 1 : -1) * 0.13;
    slot.mesh.position.set(pos.x + Math.cos(yaw) * side, 0.058, pos.z - Math.sin(yaw) * side);
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw); slot.life = 1.0; slot.mesh.visible = true;
  }

  /* ==================== 40-BONE GOLDEN PERSIAN CAT «القطة بوبس» ==================== */
  loadAnatomicallyFixedBobsPersianCat() {
    this.guideRoot.position.copy(this.guidePos);
    this.guideRoot.add(this.bobsGroup, this.anasGroup);
    this.scene.add(this.guideRoot);

    const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.56, 0.66, 32), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.65, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    beaconRing.rotation.x = -Math.PI / 2; beaconRing.position.y = 0.055;
    this.guideBeaconRing = beaconRing; this.guideRoot.add(beaconRing);

    const gHit = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.0, 10), new THREE.MeshBasicMaterial({ visible: false }));
    gHit.position.y = 1.0; gHit.userData.interactId = 'guide'; this.guideRoot.add(gHit); this.guideHitMesh = gHit;

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

    const coatTex = this.texLoader.load(ASSET_MANIFEST.models.characters.bobsCoat); coatTex.colorSpace = THREE.SRGBColorSpace; coatTex.flipY = false;

    this.assets.loadGLB(ASSET_MANIFEST.models.characters.bobsCat, 'تحميل القطة بوبس 3D').then((gltf) => {
      if (!gltf) return;
      const model = gltf.scene;
      const animatedBoneNames = new Set();
      if (gltf.animations?.[0]) gltf.animations[0].tracks.forEach((tr) => animatedBoneNames.add(tr.name.split('.')[0]));

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      model.scale.setScalar(0.86 / Math.max(0.01, size.y));
      const box2 = new THREE.Box3().setFromObject(model);
      const c2 = box2.getCenter(new THREE.Vector3());
      model.position.set(-c2.x, -box2.min.y, -c2.z);
      this.bobsGroup.add(model);
      model.updateMatrixWorld(true);

      const invWorldQ = new THREE.Quaternion(), worldQ = new THREE.Quaternion();
      model.traverse((obj) => {
        if (obj.isBone) {
          obj.getWorldQuaternion(worldQ); invWorldQ.copy(worldQ).invert();
          this.catBoneInfo[obj.name] = {
            bone: obj, restQuat: obj.quaternion.clone(), isStatic: !animatedBoneNames.has(obj.name),
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
      if (gltf.animations?.length) { this.catMixer = new THREE.AnimationMixer(model); const act = this.catMixer.clipAction(gltf.animations[0]); act.setEffectiveTimeScale(0.88); act.play(); }
      this.catLoaded = true;
    });
  }

  applyWorldBoneRot(name, pitchRad = 0, yawRad = 0, rollRad = 0) {
    const info = this.catBoneInfo[name]; if (!info) return;
    if (pitchRad) { this._qDelta.setFromAxisAngle(info.axisRight, pitchRad); info.bone.quaternion.multiply(this._qDelta); }
    if (yawRad) { this._qDelta.setFromAxisAngle(info.axisUp, yawRad); info.bone.quaternion.multiply(this._qDelta); }
    if (rollRad) { this._qDelta.setFromAxisAngle(info.axisFwd, rollRad); info.bone.quaternion.multiply(this._qDelta); }
  }

  /* ==================== WALKABLE COLLISIONS & MAISON DE PARIS STAIR ELEVATION ==================== */
  resolveCollisions(pos) {
    const playerR = 0.55;
    // Check if inside Enterable Maison de Paris zone (x: -40.2..-21.5, z: 291.6..308.4)
    const inHouseFootprint = pos.x < -7.2 && pos.x >= -40.5 && pos.z >= 291.6 && pos.z <= 308.4;
    if (inHouseFootprint) {
      pos.x = Math.max(-40.2, Math.min(-7.2, pos.x));
      pos.z = Math.max(291.8, Math.min(308.2, pos.z));
      // Smoothly climb marble staircase along x: -40..-36.5, z: 306 -> 294!
      if (pos.x < -36.5 && pos.z <= 306.5 && pos.z >= 293.0) {
        const stairT = Math.max(0, Math.min(1, (306.0 - pos.z) / 11.5));
        this.playerFloorY = stairT * 4.65;
        this.inHouseUpperFloor = stairT > 0.72;
      } else if (this.inHouseUpperFloor) {
        // Upper floor + open Parisian Balcony (x: -40..-21.8, z: 292..308)
        pos.x = Math.max(-40.2, Math.min(-21.8, pos.x));
        this.playerFloorY = 4.65;
      } else {
        this.playerFloorY = 0;
      }
      pos.y = this.playerFloorY + 1.68;
      return;
    }

    this.inHouseUpperFloor = false;
    this.playerFloorY = 0;
    pos.y = 1.68;

    const inRotunda = pos.z < -81, inLouvre = pos.z < -6 && !inRotunda, inPlaza = pos.z >= -6 && pos.z <= 32;
    const allowWestHouseDoor = pos.z >= 296.5 && pos.z <= 303.5;
    const minX = allowWestHouseDoor ? -40.2 : (inRotunda ? -9.6 : inLouvre ? -6.3 : inPlaza ? -12.6 : -7.0);
    const maxX = inRotunda ? 9.6 : inLouvre ? 6.3 : inPlaza ? 12.6 : 7.0;
    pos.x = Math.max(minX, Math.min(maxX, pos.x));
    pos.z = Math.max(-101, Math.min(428, pos.z));

    for (const b of this.boxColliders) {
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX)), cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      const dx = pos.x - cx, dz = pos.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < playerR * playerR) {
        if (d2 > 0.00001) { const d = Math.sqrt(d2); pos.x = cx + (dx / d) * playerR; pos.z = cz + (dz / d) * playerR; }
        else pos.x = Math.abs(pos.x - b.minX) < Math.abs(b.maxX - pos.x) ? b.minX - playerR : b.maxX + playerR;
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
    if (phase !== 'idle') { this.stopDroneTour(); if (this.drivingBmw) this.exitBmwDrive(); }
    if (this.callbacks.onGuidePhaseChange) this.callbacks.onGuidePhaseChange(phase, this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
  }

  startGuidedTour() {
    this.cabRideActive = false;
    if (this.drivingBmw) this.exitBmwDrive();
    if (this.inHouseUpperFloor) this.enterParisHouseBalcony(false);
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const dist = Math.hypot(wp.x - this.playerPos.x, wp.z - this.playerPos.z);
    if (dist < 4.5 && this.guidePhase !== 'explaining') this.enterExplainState(this.currentWaypointIdx);
    else this.setGuidePhase('walking');
  }

  advanceGuidedTour() {
    this.cabRideActive = false;
    if (this.drivingBmw) this.exitBmwDrive();
    if (this.inHouseUpperFloor) this.enterParisHouseBalcony(false);
    if (this.currentWaypointIdx < STORY_WAYPOINTS.length - 1) {
      this.currentWaypointIdx++;
      if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(this.currentWaypointIdx, STORY_WAYPOINTS[this.currentWaypointIdx]);
      this.setGuidePhase('walking');
    } else this.setGuidePhase('idle');
  }

  pauseGuidedTour() { this.cabRideActive = false; this.setGuidePhase('idle'); }

  enterExplainState(idx) {
    const wp = STORY_WAYPOINTS[idx];
    this.setGuidePhase('explaining');
    if (wp) {
      const lx = wp.lookAtX !== undefined ? wp.lookAtX : wp.guideX;
      const lz = wp.lookAtZ !== undefined ? wp.lookAtZ : wp.z - 5;
      this.targetYaw = Math.atan2(-(lx - this.playerPos.x), -(lz - this.playerPos.z));
      this.targetPitch = idx <= 4 ? 0.06 : -0.01;
      if (this.callbacks.onTourStopArrive) this.callbacks.onTourStopArrive(idx, wp);
    }
  }

  startBoulevardCabRide() {
    this.stopDroneTour(); if (this.drivingBmw) this.exitBmwDrive(); this.setGuidePhase('idle');
    this.inHouseUpperFloor = false; this.playerFloorY = 0; this.cabRideActive = true;
    if (this.playerPos.z < 55) this.playerPos.set(0, 1.68, 392);
    this.targetYaw = 0; this.targetPitch = 0.04;
    if (this.callbacks.onCabRideChange) this.callbacks.onCabRideChange(true);
  }
  stopBoulevardCabRide() { if (!this.cabRideActive) return; this.cabRideActive = false; if (this.callbacks.onCabRideChange) this.callbacks.onCabRideChange(false); }
  startDroneTour() { this.stopBoulevardCabRide(); if (this.drivingBmw) this.exitBmwDrive(); this.setGuidePhase('idle'); this.droneActive = true; this.droneTime = 0; if (this.callbacks.onDroneChange) this.callbacks.onDroneChange(true); }
  stopDroneTour() { if (!this.droneActive) return; this.droneActive = false; if (this.callbacks.onDroneChange) this.callbacks.onDroneChange(false); }

  setJoystickInput(forward, strafe) {
    this.moveInput.forward = forward; this.moveInput.strafe = strafe;
    if (!this.drivingBmw && (Math.abs(forward) > 0.12 || Math.abs(strafe) > 0.12)) {
      if (this.guidePhase === 'walking') this.setGuidePhase('idle');
      this.stopDroneTour(); this.stopBoulevardCabRide();
    }
  }

  teleportToWaypoint(idx, triggerExplain = true) {
    this.stopDroneTour(); this.stopBoulevardCabRide(); if (this.drivingBmw) this.exitBmwDrive();
    this.inHouseUpperFloor = false; this.playerFloorY = 0;
    const safeIdx = Math.max(0, Math.min(STORY_WAYPOINTS.length - 1, idx));
    const wp = STORY_WAYPOINTS[safeIdx]; if (!wp) return;
    this.currentWaypointIdx = safeIdx;
    const zOffset = safeIdx <= 3 ? 6.0 : safeIdx === 4 ? 4.5 : safeIdx === STORY_WAYPOINTS.length - 1 ? 2.6 : 3.2;
    this.playerPos.set(wp.x, 1.68, wp.z + zOffset);
    this.resolveCollisions(this.playerPos);
    this.guidePos.set(wp.guideX, 0, wp.guideZ); this.guideRoot.position.copy(this.guidePos);
    const lx = wp.lookAtX !== undefined ? wp.lookAtX : wp.guideX;
    const lz = wp.lookAtZ !== undefined ? wp.lookAtZ : wp.z - 4;
    this.targetYaw = Math.atan2(-(lx - this.playerPos.x), -(lz - this.playerPos.z)); this.playerYaw = this.targetYaw;
    this.targetPitch = safeIdx <= 4 ? 0.05 : -0.01; this.playerPitch = this.targetPitch;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(safeIdx, wp);
    if (triggerExplain) this.enterExplainState(safeIdx); else this.setGuidePhase('idle');
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
    const ctx = out.getContext('2d'); ctx.fillStyle = '#0f0b08'; ctx.fillRect(0, 0, 1280, 760);
    ctx.save(); if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
    ctx.drawImage(this.canvas, 34, 34, 1212, 620); ctx.restore();
    ctx.strokeStyle = '#e8c268'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 1240, 720);
    ctx.fillStyle = 'rgba(13, 9, 6, 0.92)'; ctx.fillRect(24, 654, 1232, 84);
    ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = '#fbf0cf'; ctx.font = '700 28px Amiri, Georgia, serif';
    ctx.fillText('جولة باريس ومتحف اللوفر 3D — رحلة يمنى (العام التاسع عشر) ✦ HEY', 640, 695);
    ctx.direction = 'ltr'; ctx.fillStyle = '#d6ab52'; ctx.font = '600 13px Cinzel, Georgia, serif';
    ctx.fillText('PARIS GRAND BOULEVARD & MUSÉE DU LOUVRE  •  ENG / MOHAMED TAREK', 640, 723);
    const a = document.createElement('a'); a.download = `Yomna-Paris-Louvre-3D-${Date.now()}.png`; a.href = out.toDataURL('image/png'); a.click();
  }

  getMiniMapTelemetry() {
    const px = this.drivingBmw ? this.bmwPos.x : this.playerPos.x;
    const pz = this.drivingBmw ? this.bmwPos.z : this.playerPos.z;
    const yaw = this.drivingBmw ? this.bmwYaw - Math.PI : this.playerYaw;
    const distToLouvre = Math.max(0, Math.round(pz - 7));
    const deg = (((-yaw * 180) / Math.PI) % 360 + 360) % 360;
    const headingAr = deg < 45 || deg >= 315 ? 'شمال • نحو اللوفر' : deg < 135 ? 'شرق • جاليري مول' : deg < 225 ? 'جنوب • قوس النصر' : 'غرب • برج إيفل';
    return {
      px, pz, yaw, gx: this.guidePos.x, gz: this.guidePos.z, guideType: this.activeGuideType,
      seals: this.hiddenSeals, distToLouvre, headingAr, weather: this.weatherMode,
      guidePhase: this.guidePhase, drivingBmw: this.drivingBmw, bmwKmh: Math.round(Math.abs(this.bmwSpeed) * 3.6),
      inHouseUpperFloor: this.inHouseUpperFloor,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 900;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.aspect = aspect; this.baseFov = aspect < 0.85 ? 64 : 53;
      this.camera.updateProjectionMatrix(); this.applyQualitySettings();
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      this.keys[e.code] = true;
      if (!this.drivingBmw && ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (this.guidePhase === 'walking') this.setGuidePhase('idle');
        this.stopDroneTour(); this.stopBoulevardCabRide();
      }
      if (e.code === 'KeyE' && this.nearestInteractable && this.callbacks.onInteract) this.callbacks.onInteract(this.nearestInteractable.id);
      if (e.code === 'KeyF' && this.drivingBmw) this.exitBmwDrive();
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
          if (id === 'guide') { this.triggerCatAction('pet'); if (this.callbacks.onGuideTap) this.callbacks.onGuideTap(this.activeGuideType); }
          else if (this.callbacks.onInteract) this.callbacks.onInteract(id);
        }
      }
    };
    window.addEventListener('pointerup', endLook); window.addEventListener('pointercancel', endLook);
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
      this.portalTickAccum += dt; if (this.portalTickAccum < 0.066) return; this.portalTickAccum = 0;
    }

    const t = this.clock.getElapsedTime();
    const damp = 1 - Math.exp(-9.0 * dt);

    // Velocity-reactive FOV when driving BMW + Telephoto Zoom!
    const speedFovBoost = this.drivingBmw ? Math.min(12, Math.abs(this.bmwSpeed) * 0.35) : 0;
    const desiredFov = this.zoomed ? 24 : this.baseFov + speedFovBoost;
    if (Math.abs(this.camera.fov - desiredFov) > 0.08) {
      this.camera.fov += (desiredFov - this.camera.fov) * damp;
      this.camera.updateProjectionMatrix();
    }

    // ---- 1. TRAFFIC LIGHTS & LIVE AI VEHICLES ----
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

    for (const pb of this.policeLightBars) {
      const flash = Math.sin(t * 14 + pb.phase) > 0;
      pb.redGlow.material.opacity = flash ? 0.98 : 0.08;
      pb.blueGlow.material.opacity = flash ? 0.08 : 0.98;
    }

    for (let i = 0; i < this.trafficVehicles.length; i++) {
      const v = this.trafficVehicles[i];
      let targetSpd = v.maxSpeed;
      for (const inter of this.intersections) {
        if (inter.state === 'green') continue;
        const distAhead = (inter.z - v.z) * v.dirZ;
        if (distAhead > 3.5 && distAhead < 19) targetSpd = distAhead < 7.5 ? 0 : Math.min(targetSpd, v.maxSpeed * ((distAhead - 6.5) / 12.5));
      }
      for (let j = 0; j < this.trafficVehicles.length; j++) {
        if (i === j) continue;
        const other = this.trafficVehicles[j];
        if (Math.abs(other.laneX - v.laneX) > 1.5 || other.dirZ !== v.dirZ) continue;
        const gap = (other.z - v.z) * v.dirZ;
        if (gap > 0 && gap < 14) targetSpd = gap < 8.5 ? 0 : Math.min(targetSpd, other.speed);
      }
      const accel = targetSpd < v.speed ? 14 : 6.5;
      v.speed += (targetSpd - v.speed) * Math.min(1, accel * dt);
      v.z += v.dirZ * v.speed * dt;
      if (v.dirZ < 0 && v.z < 38) v.z = 444;
      if (v.dirZ > 0 && v.z > 444) v.z = 38;
      v.root.position.z = v.z;
      if (v.speed > 0.1 && Math.abs(v.z - this.camera.position.z) < 130) {
        const spin = v.speed * dt * 2.1;
        for (const w of v.wheels) w.rotation.x += spin;
      }
    }

    // ---- 2. GTA-STYLE DRIVABLE HERO BMW PHYSICS & CHASE CAMERA ----
    if (this.drivingBmw && this.bmwRoot && !this.portalPaused) {
      let throttle = this.moveInput.forward, steerIn = this.moveInput.strafe;
      if (this.keys.KeyW || this.keys.ArrowUp) throttle += 1;
      if (this.keys.KeyS || this.keys.ArrowDown) throttle -= 1;
      if (this.keys.KeyD || this.keys.ArrowRight) steerIn += 1;
      if (this.keys.KeyA || this.keys.ArrowLeft) steerIn -= 1;
      throttle = Math.max(-1, Math.min(1, throttle));
      steerIn = Math.max(-1, Math.min(1, steerIn));

      const brakeKey = this.keys.Space;
      this.bmwBraking = brakeKey || (throttle < -0.1 && this.bmwSpeed > 1.5);
      if (brakeKey) this.bmwSpeed *= Math.max(0, 1 - 6.5 * dt);
      else if (Math.abs(throttle) > 0.05) {
        const accel = throttle > 0 ? 18.5 : 14.0;
        this.bmwSpeed = Math.max(-10, Math.min(34, this.bmwSpeed + throttle * accel * dt));
      } else {
        this.bmwSpeed *= Math.max(0, 1 - 1.9 * dt);
        if (Math.abs(this.bmwSpeed) < 0.08) this.bmwSpeed = 0;
      }

      const steerFactor = Math.min(1, Math.abs(this.bmwSpeed) / 3.5);
      this.bmwSteer += (-steerIn * 0.45 - this.bmwSteer) * Math.min(1, 8 * dt);
      this.bmwYaw += this.bmwSteer * (this.bmwSpeed >= 0 ? 1 : -1) * steerFactor * 2.4 * dt;

      this.bmwPos.x += Math.sin(this.bmwYaw) * this.bmwSpeed * dt;
      this.bmwPos.z += Math.cos(this.bmwYaw) * this.bmwSpeed * dt;
      // Keep BMW cleanly within the 525m Champs-Élysées Boulevard roads & forecourt (x: -22..+22, z: 24..426)!
      this.bmwPos.x = Math.max(-22.2, Math.min(22.2, this.bmwPos.x));
      this.bmwPos.z = Math.max(24.0, Math.min(426.0, this.bmwPos.z));

      this.bmwRoot.position.copy(this.bmwPos);
      this.bmwRoot.rotation.y = this.bmwYaw;
      this.bmwBrakeMats.forEach((m) => { m.emissiveIntensity = this.bmwBraking ? 4.8 : 2.1; });
      if (Math.abs(this.bmwSpeed) > 0.1) {
        const wSpin = this.bmwSpeed * dt * 2.4;
        for (const w of this.bmwWheels) w.rotation.x += wSpin;
      }

      // Smooth Cinematic GTA 3rd-Person Chase Camera!
      const camBack = 7.4, camH = 2.95;
      const desiredCamX = this.bmwPos.x - Math.sin(this.bmwYaw) * camBack;
      const desiredCamZ = this.bmwPos.z - Math.cos(this.bmwYaw) * camBack;
      this.camera.position.lerp(this._tmpLook.set(desiredCamX, camH, desiredCamZ), 1 - Math.exp(-7.5 * dt));
      this.camera.lookAt(this.bmwPos.x + Math.sin(this.bmwYaw) * 6, 1.35, this.bmwPos.z + Math.cos(this.bmwYaw) * 6);
      this.playerPos.set(this.bmwPos.x, 1.68, this.bmwPos.z);
    } else if (this.droneActive) {
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
        const destZ = 18, rem = this.playerPos.z - destZ;
        if (rem > 1.2) {
          movedStep = Math.min(rem, 24.0 * dt);
          this.playerPos.z -= movedStep;
          this.playerPos.x += (0 - this.playerPos.x) * Math.min(1, 3 * dt);
          if (!this.isLooking) { this.targetYaw += (0 - this.targetYaw) * Math.min(1, 2.5 * dt); this.targetPitch += (0.04 - this.targetPitch) * Math.min(1, 2.5 * dt); }
        } else { this.stopBoulevardCabRide(); this.currentWaypointIdx = 4; this.enterExplainState(4); }
      } else if (this.guidePhase === 'walking') {
        const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
        // OBSTRUCTION-FREE CORRIDOR PATHING: Keep X smoothly centered at 0 until within 3m of destination!
        const targetX = Math.abs(wp.z - this.playerPos.z) > 4.0 ? 0 : wp.x;
        const dx = targetX - this.playerPos.x, dz = wp.z - this.playerPos.z, dist = Math.hypot(dx, dz);
        if (!this.isLooking) {
          const desiredYaw = Math.atan2(-dx, -dz);
          let diff = desiredYaw - this.targetYaw;
          while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
          this.targetYaw += diff * (1 - Math.exp(-3.6 * dt));
          this.targetPitch += (0.02 - this.targetPitch) * (1 - Math.exp(-3.0 * dt));
        }
        const outdoorSpd = this.cruiseFast ? 23.0 : 14.5;
        const indoorSpd = this.cruiseFast ? 8.5 : 5.8;
        const moveRate = this.playerPos.z > 24 ? outdoorSpd : indoorSpd;
        if (dist > 2.2) {
          movedStep = Math.min(dist, moveRate * dt);
          this.playerPos.x += (dx / dist) * movedStep;
          this.playerPos.z += (dz / dist) * movedStep;
        } else {
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

    // Automatic Sliding Glass Doors of the Louvre Pyramid (wide 12m early open!)
    for (const d of this.pyramidDoors) {
      const near = (Math.abs(this.playerPos.z - d.worldZ) < 12.0 && Math.abs(this.playerPos.x) < 5.5) || Math.abs(this.guidePos.z - d.worldZ) < 10.5 || (this.droneActive && Math.abs(this.camera.position.z - d.worldZ) < 14);
      d.openAmt += ((near ? 1 : 0) - d.openAmt) * (1 - Math.exp(-6.0 * dt));
      d.leftDoor.position.x = d.closedLeftX - d.openAmt * 1.75;
      d.rightDoor.position.x = d.closedRightX + d.openAmt * 1.75;
    }

    if (!this.enteredLouvreOnce && this.playerPos.z < -7.5) {
      this.enteredLouvreOnce = true;
      if (this.callbacks.onEnterLouvre) this.callbacks.onEnterLouvre();
    }

    this.playerLantern.position.set(this.camera.position.x, this.camera.position.y + 1.5, this.camera.position.z - 2.4);
    if (this.skyGroup) this.skyGroup.position.set(this.camera.position.x, 0, this.camera.position.z);

    if (this.guidePhase === 'idle' && !this.droneActive && !this.portalPaused && !this.drivingBmw) {
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

    // Proximity Interactables (skip BMW prompt while already driving!)
    let closest = null, minD = Infinity;
    for (const it of this.interactables) {
      if (this.drivingBmw && it.id === 'bmw') continue;
      const d = Math.hypot(this.playerPos.x - it.worldPos.x, this.playerPos.z - it.worldPos.z);
      const dy = Math.abs(this.playerPos.y - it.worldPos.y);
      if (d < it.radius && dy < 3.4 && d < minD) { minD = d; closest = it; }
    }
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest;
      if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(closest);
    }

    // ---- 3. UNIFIED DUAL 3D TOUR GUIDE (القطة بوبس OR أنس حبيب) ----
    const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
    const targetGX = this.guidePhase === 'walking' && Math.abs(wp.guideZ - this.guidePos.z) > 4.0 ? 0 : wp.guideX;
    const targetGZ = this.guidePhase === 'explaining' ? wp.guideZ : Math.max(wp.guideZ, this.playerPos.z - 6.8);
    const gdx = targetGX - this.guidePos.x, gdz = targetGZ - this.guidePos.z, gDist = Math.hypot(gdx, gdz);
    let guideSpd = 0;
    if (gDist > 0.35 && !this.portalPaused && !this.drivingBmw) {
      const maxGSpd = this.playerPos.z > 24 ? (this.cruiseFast ? 24 : 15.5) : 7.5;
      const step = Math.min(gDist, Math.max(2.8, gDist * 1.65) * dt, maxGSpd * dt);
      this.guidePos.x += (gdx / gDist) * step; this.guidePos.z += (gdz / gDist) * step;
      guideSpd = step / Math.max(0.001, dt);
      this.catStride += step * 3.8; this.catStepAccum += step;
      if (this.catStepAccum > 0.62) { this.catStepAccum = 0; this.spawnPawPrint(this.guidePos, this.guideYaw); }
    }
    this.guideRoot.position.copy(this.guidePos);
    if (this.guideBeaconRing) {
      this.guideBeaconRing.rotation.z = t * 1.1; this.guideBeaconRing.scale.setScalar(1 + Math.sin(t * 3.2) * 0.07);
      this.guideBeaconRing.material.color.setHex(this.activeGuideType === 'anas' ? 0x76d0ff : 0xffe08a);
    }

    const guideMoving = guideSpd > 0.3;
    const desiredGuideYaw = guideMoving
      ? Math.atan2(gdx, gdz)
      : Math.atan2(this.playerPos.x - this.guidePos.x, this.playerPos.z - this.guidePos.z) + (this.activeGuideType === 'bobs' && this.guidePhase !== 'explaining' ? 0.35 : 0);
    let gyDiff = desiredGuideYaw - this.guideYaw;
    while (gyDiff > Math.PI) gyDiff -= Math.PI * 2; while (gyDiff < -Math.PI) gyDiff += Math.PI * 2;
    this.guideYaw += gyDiff * (1 - Math.exp(-6.2 * dt));
    this.guideRoot.rotation.y = this.guideYaw;

    if (this.anasLoaded && this.activeGuideType === 'anas') {
      this.anasMixer.update(dt);
      const want = guideMoving ? 'walk' : 'idle';
      if (want !== this.anasCurAnim && this.anasWalkAction && this.anasIdleAction) {
        this.anasCurAnim = want;
        if (want === 'walk') { this.anasWalkAction.reset().fadeIn(0.22).play(); this.anasIdleAction.fadeOut(0.22); }
        else { this.anasIdleAction.reset().fadeIn(0.25).play(); this.anasWalkAction.fadeOut(0.25); }
      }
    }

    this.catStateTimer += dt;
    if (!guideMoving && this.guidePhase !== 'explaining') {
      if (this.catState !== 'guide' && this.catStateTimer > this.catStateDur) { this.catState = 'guide'; this.catStateTimer = 0; this.catStateDur = 9 + Math.random() * 5; }
      else if (this.catState === 'guide' && this.catStateTimer > this.catStateDur) { this.catState = Math.random() < 0.5 ? 'groom' : 'play'; this.catStateTimer = 0; this.catStateDur = 5.4; }
    } else if (this.guidePhase === 'explaining') this.catState = 'guide';
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

    for (const v of this.humanVisitors) {
      const nearCam = Math.abs(this.camera.position.z - v.root.position.z) < 62;
      if (nearCam) v.mixer.update(dt);
      if (v.walking) {
        const span = Math.max(1, Math.abs(v.z1 - v.z0));
        v.progress += (v.speed * dt * v.dir) / span;
        if (v.progress >= 1) { v.progress = 1; v.dir = -1; }
        else if (v.progress <= 0) { v.progress = 0; v.dir = 1; }
        v.root.position.z = THREE.MathUtils.lerp(v.z0, v.z1, v.progress);
        v.root.rotation.y = (v.z1 > v.z0 ? v.dir > 0 : v.dir < 0) ? 0 : Math.PI;
      }
    }

    for (const s of this.hiddenSeals) {
      if (!s.collected) { s.mesh.rotation.y += dt * 1.4; s.mesh.position.y = s.baseY + Math.sin(t * 2.2 + s.phase) * 0.12; }
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
      const rPos = this.rainPositions, dropDy = 24 * dt;
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
