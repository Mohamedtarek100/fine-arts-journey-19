/**
 * =========================================================================
 *  PHOTOREALISTIC PARIS HAUSSMANN & MUSÉE DU LOUVRE 3D ENGINE (v28)
 *  - ZERO cartoon/Kenney assets: Real 1K Poly Haven HDRI Skyboxes directly
 *    as scene.background & scene.environment (Sunset, Day, Night)
 *  - Authentic 6-Story Parisian Haussmann Limestone Buildings w/ Extruded
 *    Cornices, 2nd/5th Floor Wrought-Iron Balconies, Recessed HDRI-Reflecting
 *    Glass Windows, Steep Slate Mansard Roofs, Dormers, Chimneys & Awnings
 *  - Beaux-Arts Galeries Lafayette / Grand Palais + Eiffel Bronze Tower
 *  - Slim Cast-Iron Parisian Réverbères Streetlamps + Multi-Layered Plane Trees
 *  - Hero Drivable BMW Vision Showcase Right at Station 1 + Guide Rides in
 *    Passenger Seat With You & Steps Out Beside You at the Louvre
 *  - Realistic Metallic Automotive Traffic (Zero Toy Cars) + Wet PBR Asphalt
 *  - Auto-Cinematic Quality on Desktop (2048px Shadows + Subtle Bloom + SMAA)
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
import { ASSET_MANIFEST } from './src/assets/assetManifest.js?v=28';
import { AssetManager } from './src/assets/AssetManager.js?v=28';
import {
  createGlowTexture,
  createLightBeamTexture,
  createWetAsphaltPatchMap,
  createHaussmannFacadePBR,
  createGrandPalaisFacadePBR,
  createAwningStripeTexture,
  createPlaneTreeBarkTexture,
  createRealisticPlaneLeafClusterTexture,
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
} from './louvre-assets.js?v=28';

export const BMW_PAINTS = [
  { id: 'sapphire', labelAr: 'أزرق ياقوتي BMW', hex: 0x0b3b78 },
  { id: 'champagne', labelAr: 'ذهبي ملكي HEY', hex: 0xc99c3e },
  { id: 'crimson', labelAr: 'أحمر رياضي BMW', hex: 0x92121e },
  { id: 'obsidian', labelAr: 'أسود ليلي لامع', hex: 0x12141a },
  { id: 'alpine', labelAr: 'أبيض لؤلؤي نقي', hex: 0xe8edf4 },
];

export const STORY_WAYPOINTS = [
  {
    id: 'champs-elysees',
    zoneAr: 'الشانزليزيه • بداية الرحلة',
    labelAr: 'الشانزليزيه، سيارة BMW وقوس النصر',
    x: -1.2, z: 377.7, guideX: -1.45, guideZ: 376.2, lookAtX: -3.0, lookAtY: 1.5, lookAtZ: 369.0, interactId: 'bmw',
    bobsSlides: [
      'أهلاً بك بهدوء في شوارع باريس وقت الغروب. أنا القطة بوبس، وسأكون معك في كل لحظة من هذه الرحلة، سواء مشياً على الأقدام أو راكبةً بجانبك داخل سيارة الـ BMW.',
      'أمامك على يسار الرصيف سيارة الـ BMW جاهزة للانطلاق بطول الشانزليزيه نحو متحف اللوفر، وخلفها يرتفع برج إيفل وسط سماء الغروب. خذ وقتك في التأمل، وعندما ترتاح نكمل معاً.',
    ],
    anasSlides: [
      'أهلاً يا يوسف يا بطل، منوّر باريس. أنا أنس حبيب هكون معاك طول الجولة، ولو ركبت الـ BMW اللي قدامك على الشمال هركب جنبك ونوصل سوا لحد باب اللوفر.',
      'خد راحتك واتفرج على الشانزليزيه والمباني الهوسمانية وبرج إيفل في الأفق، ولما تحب نتحرك سوا اضغط أكمل الجولة أو اركب الـ BMW.',
    ],
    funFactAr: 'معلومة هادئة: يمكنك ركوب الـ BMW وسأركب معك مباشرة في المقعد المجاور، وعند نزولك أمام اللوفر أنزل معك لاستكمال الجولة.',
  },
  {
    id: 'paris-mall',
    zoneAr: 'جاليري باريس ومنزل باريس المفتوح',
    labelAr: 'منزل باريس المفتوح وجاليري لافاييت',
    x: 0, z: 298, guideX: 2.0, guideZ: 294, lookAtX: -18, lookAtY: 5.0, lookAtZ: 300, interactId: 'house-stairs',
    bobsSlides: [
      'هنا يتقابل جمال العمارة الباريسية على جانبي الطريق: على يمينك واجهة جاليري باريس الحجرية بقبتها الزجاجية، وعلى يسارك منزل باريس المفتوح الذي يمكنك دخوله والصعود إلى شرفته العلوية.',
      'تأمل الشرفات الحديدية السوداء والأسقف المائلة الهادئة، وإذا رغبت في إطلالة بانورامية على الشارع وبرج إيفل جرّب الصعود إلى الشرفة قبل أن نواصل المسير.',
    ],
    anasSlides: [
      'بص الجمال هنا يا يوسف: على يمينك قصر جاليري باريس الحجري بقبته الزجاجية، وعلى شمالك منزل باريس اللي تقدر تدخله وتطلع البلكونة في الدور التاني.',
      'المكان هادي ومريح جداً للتأمل والتصوير، ولما تكون جاهز نكمل ناحية ميدان الكونكورد.',
    ],
    funFactAr: 'لمسة معمارية: تتميز مباني هوسمان في باريس بالحجر الجيري الكريمي والشرفات الحديدية الممتدة في الطابقين الثاني والخامس.',
  },
  {
    id: 'police-plaza',
    zoneAr: 'ميدان الكونكورد • شرطة باريس',
    labelAr: 'ميدان الكونكورد وإطلالة برج إيفل',
    x: 0, z: 174, guideX: -2.2, guideZ: 170, lookAtX: -24, lookAtY: 12, lookAtZ: 160,
    bobsSlides: [
      'نقف الآن في ميدان الكونكورد الهادئ بجانب قسم شرطة باريس الوطني. من هذه النقطة ينكشف برج إيفل البرونزي بوضوح رائع وسط ضباب الغروب الدافئ.',
      'انظر لانعكاس المصابيح الباريسية الهادئة على الأسفلت الرطب. كل خطوة تقرّبنا أكثر من بوابة متحف اللوفر وحكاية يمنى.',
    ],
    anasSlides: [
      'وصلنا ميدان الكونكورد يا يوسف، وهنا قسم شرطة باريس وإشارة المرور، وبرج إيفل البرونزي بقى واضح قدامنا وسط جو الغروب.',
      'لو حابب تقرّب الصورة على برج إيفل بعدسة التقريب أو تشغّل عرض الأضواء المتلألئة هيبقى مشهد رهيب قبل ما نروح اللوفر.',
    ],
    funFactAr: 'معلومة باريسية: يُطلى برج إيفل بلون برونزي خاص يتدرج في ثلاثة ظلال ليبدو متناسقاً مع السماء من كل زاوية.',
  },
  {
    id: 'rivoli-cafes',
    zoneAr: 'شارع ريفولي • مترو باريس',
    labelAr: 'شارع ريفولي وبوابة المترو التاريخي',
    x: 0, z: 68, guideX: -1.6, guideZ: 64, lookAtX: -12, lookAtY: 10, lookAtZ: 28,
    bobsSlides: [
      'وصلنا إلى شارع ريفولي حيث تطل بوابة مترو باريس التاريخية الخضراء بين أشجار الدلب العتيقة والمقاهي الدافئة.',
      'أمامنا مباشرة تبدأ ساحة نابليون وهرم اللوفر الزجاجي الذي يعكس ألوان الغروب. نكمل معاً بهدوء نحو المدخل.',
    ],
    anasSlides: [
      'ده شارع ريفولي يا يوسف وبوابة المترو الباريسية، وخلاص خطوات بسيطة وندخل ساحة متحف اللوفر.',
      'لو كنت سايق الـ BMW تقدر تركنها بهدوء قدام الساحة وننزل سوا نستمتع بجولة المتحف.',
    ],
    funFactAr: 'لمسة فنية: أشجار الدلب الباريسية المصطفة على طول الشوارع تُعد جزءاً أساسياً من الطابع الفني والجمالي لباريس.',
  },
  {
    id: 'pyramid',
    zoneAr: 'ساحة نابليون • بوابة اللوفر',
    labelAr: 'ساحة نابليون، النافورة وبوابة الهرم',
    x: 0, z: 18, guideX: 0.8, guideZ: 14.5, lookAtX: 0, lookAtY: 5.5, lookAtZ: 6, interactId: 'fountain',
    bobsSlides: [
      'مرحباً بك في ساحة نابليون أمام الهرم الزجاجي لمتحف اللوفر. هنا تبدأ القصة الحقيقية التي أُعدّ هذا المتحف من أجلها: رحلة يمنى في عامها التاسع عشر.',
      'يمكنك إلقاء عملة أمنية هادئة في النافورة على يمينك، وعندما نخطو نحو الهرم تنفتح أبوابه الزجاجية تلقائياً لنعبر معاً إلى القاعة الكبرى.',
    ],
    anasSlides: [
      'أهلاً بيك يا يوسف قدام هرم اللوفر الزجاجي. هنا بتبدأ الحكاية الحقيقية لعيد ميلاد يمنى الـ 19.',
      'ارمِ لها أمنية حلوة في النافورة على يمينك، وتعالى ندخل من باب الهرم الأوتوماتيك للقاعة الكبرى.',
    ],
    funFactAr: 'بوابة القصة: صُمّم مسار القاعة الكبرى ليكون مفتوحاً ومريحاً بالكامل بدون أي عوائق أثناء مرافقتك للمرشد.',
  },
  {
    id: 'artifact-1',
    zoneAr: 'القاعة الكبرى • الفصل الأول',
    labelAr: 'التحفة 01 • البدايات والطفولة',
    x: 0, z: -20, guideX: -1.8, guideZ: -21.2, lookAtX: -7.5, lookAtY: 3.1, lookAtZ: -20, interactId: 'childhood',
    bobsSlides: [
      'تحت أضواء القاعة الهادئة، يبدأ الفصل الأول من قصة يمنى: «البدايات والطفولة»، حيث كانت الألوان الأولى مجرد لعب بريء، لكنها كانت تخبّئ عين فنانة ترى التفاصيل بصدق.',
      'افتح الورقة الذهبية عندما تحب لتقرأ القصة كاملة، وجرّب عدسة الأسرار UV لتشاهد الرسالة الخفية المضيئة فوق اللوحة.',
    ],
    anasSlides: [
      'ده الفصل الأول في معرض يمنى يا يوسف: «البدايات والطفولة»، من أول ما مسكت الألوان وبدأت موهبتها تبان.',
      'افتح الورقة الذهبية براحتك واقرأ القصة، ولما تخلص نتحرك للمرسم التفاعلي.',
    ],
    funFactAr: 'همسة فنية: كل لوحة في القاعة تحمل رسالة خفية يمكن قراءتها بتفعيل «عدسة الأسرار UV».',
  },
  {
    id: 'easel',
    zoneAr: 'القاعة الكبرى • مرسم الزوار الحي',
    labelAr: 'مرسم الزوار • علّق لوحتك باللوفر',
    x: 0, z: -27, guideX: 1.8, guideZ: -28.2, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -27, interactId: 'easel',
    bobsSlides: [
      'هنا وقفة لطيفة ومختلفة أمام الحامل الذهبي. يتيح لك المتحف أن تترك بصمتك الخاصة وترسم أو توقّع لوحة تذكارية ليمنى.',
      'بمجرد الانتهاء تُعلّق لوحتك مباشرة داخل الإطار المذهب على جدار اللوفر أمامك لتكون جزءاً من المعرض.',
    ],
    anasSlides: [
      'هنا تقدر تسيب بصمتك يا يوسف وترسم أو تختم تهنئة ليمنى وتلاقيها اتعلقت فوراً جوه الإطار الذهبي على حائط اللوفر.',
      'جرّبها براحتك وبعدها نكمل للفصل التاني في الحكاية.',
    ],
    funFactAr: 'ذكرى حية: تُحفظ لوحتك تلقائياً وتبقى معلّقة على جدار المتحف طوال زيارتك.',
  },
  {
    id: 'artifact-2',
    zoneAr: 'القاعة الكبرى • الفصل الثاني',
    labelAr: 'التحفة 02 • روح الأتيليه والشغف',
    x: 0, z: -34, guideX: 1.8, guideZ: -35.2, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -34, interactId: 'passion',
    bobsSlides: [
      'في الفصل الثاني نرى كيف نضج شغف يمنى بالرسم، وتحوّلت الساعات الهادئة بين الورق والألوان إلى مساحة راحة وصدق تعبّر فيها عن روحها.',
      'تأمل اللوحة والمجسم الذهبي على يمينك، وافتح تفاصيل التحفة لقراءة كلماتها.',
    ],
    anasSlides: [
      'الفصل التاني بيحكي عن شغف يمنى الحقيقي بالرسم والأتيليه، وإزاي الموهبة بتكبر بالصبر والهدوء كل يوم.',
      'افتح تفاصيل اللوحة واتفرج عليها براحتك قبل ما نوصل لمحطة تالتة ثانوي.',
    ],
    funFactAr: 'حكمة فنية: الشغف الحقيقي هو الشيء الذي يمنحك طاقة وراحة كلما عدت إليه.',
  },
  {
    id: 'artifact-3',
    zoneAr: 'القاعة الكبرى • الفصل الثالث',
    labelAr: 'التحفة 03 • تالتة ثانوي وبداية الطريق',
    x: 0, z: -48, guideX: -1.8, guideZ: -49.2, lookAtX: -7.5, lookAtY: 3.1, lookAtZ: -48, interactId: 'thanaweya',
    bobsSlides: [
      'أمامنا الساعة الرملية الذهبية التي تذكّرنا بأن تالتة ثانوي مجرد مرحلة عابرة وهادئة، وليست نهاية الطريق أبداً، بل بداية جميلة لرحلة أكبر.',
      'افتح هذه الورقة الذهبية لتقرأ رسالة الطمأنينة المخصّصة ليمنى في هذه السنة.',
    ],
    anasSlides: [
      'هنا محطة تالتة ثانوي يا يوسف.. تذكير هادي وجميل إن السنة دي مجرد محطة بتعدي بهدوء وبدعم العيلة، ومش هي اللي بتقيس قيمة الإنسان ولا حلمه.',
      'افتح الورقة الذهبية هنا واقرأ رسالة الطمأنينة المكتوبة لها.',
    ],
    funFactAr: 'كلمة طمأنينة: الدعم الهادئ من العائلة يهوّن أصعب الخطوات ويجعل الرحلة أجمل.',
  },
  {
    id: 'artifact-4',
    zoneAr: 'القاعة الكبرى • الفصل الرابع',
    labelAr: 'التحفة 04 • تمثال الرخام وحلم الفنون الجميلة',
    x: 0, z: -62, guideX: 1.8, guideZ: -63.2, lookAtX: 7.5, lookAtY: 3.1, lookAtZ: -62, interactId: 'fine-arts',
    bobsSlides: [
      'نقف أمام المنحوتة الكلاسيكية من رخام كارارا؛ رمزاً للأفق القادم الذي تسعى إليه يمنى بحب: كلية الفنون الجميلة.',
      'افتح بطاقة الحلم الرسمية، ثم نتجه معاً بهدوء إلى قلب المتحف حيث تنتظرنا رسائل العائلة والرسالة الأهم.',
    ],
    anasSlides: [
      'ودي المنحوتة الكلاسيكية وحلم كلية الفنون الجميلة بإذن الله. افتح بطاقة الحلم الرسمية ليمنى وشوف تفاصيلها.',
      'بعدها خطوتين ونوصل لصندوق رسائل العيلة والرسالة الأهم وتورتة الـ 19.',
    ],
    funFactAr: 'أفق جديد: كل فنان عظيم بدأ يوماً بحلم صغير آمن به واشتغل عليه بفرح.',
  },
  {
    id: 'vault-manifesto',
    zoneAr: 'قلب المتحف • الصندوق والمسلّة',
    labelAr: 'صندوق العيلة والرسالة الأهم ★',
    x: 0, z: -74, guideX: -1.6, guideZ: -75.4, lookAtX: 0, lookAtY: 2.0, lookAtZ: -75, interactId: 'vault',
    bobsSlides: [
      'وصلنا إلى أصدق محطة في المتحف: على يسارك صندوق رسائل العائلة السحابي الذي يحفظ كل كلمة محبة تصل ليمنى لحظياً، وعلى يمينك مسلّة الرسالة الأهم لكل العائلة.',
      'توقف هنا بهدوء لقراءة الرسالة الأهم وتصفّح كبسولة الطمأنينة، أو إرسال تهنئتك إلى صندوق يمنى.',
    ],
    anasSlides: [
      'أهم وقفة في الرحلة يا يوسف: على شمالك صندوق رسائل العيلة السحابي، وعلى يمينك مسلّة الرسالة الأهم لكل العيلة وليمنى.',
      'ابعت كلمتك الحلوة ليمنى في الصندوق واقرأ الرسالة الأهم قبل ختام القبة الملكية.',
    ],
    funFactAr: 'رسالة سحابية: كل رسالة تُكتب هنا تُحفظ لحظياً وتظهر ليمنى داخل صندوقها الخاص في المتحف.',
  },
  {
    id: 'cake',
    zoneAr: 'القبة الملكية • ختام العام التاسع عشر',
    labelAr: 'القبة الملكية وتورتة الـ 19',
    x: 0, z: -87.2, guideX: 2.2, guideZ: -90.4, lookAtX: 0, lookAtY: 2.9, lookAtZ: -93, interactId: 'cake',
    bobsSlides: [
      'وصلنا معاً إلى القبة الملكية في ختام رحلتنا، حيث تتألق تورتة العام التاسع عشر بشمعتي «1» و«9» المضيئتين.',
      'اضغط للاحتفال وإطفاء الشمعتين بالزر أو بالنفخ في المايكروفون، وإطلاق الألعاب النارية وحفظ شهادة الفخر. كل عامٍ ويمنى بألف خير.',
    ],
    anasSlides: [
      'وصلنا الختام يا يوسف تحت القبة الملكية قدام تورتة الـ 19 بشمعتي 1 و 9.',
      'تقدر تفتح الاحتفال وتولّع الألعاب النارية وتحفظ شهادة الفخر ليمنى. كانت جولة جميلة ومريحة جداً معاك يا بطل.',
    ],
    funFactAr: 'الختام الملكي: يمكنك إطفاء شمعتي 1 و 9 بالزر أو بالنفخ الحقيقي في المايكروفون.',
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
    labelAr: '🌇 غروب باريس', hdriKey: 'sunset', bgBlur: 0.012, bgIntensity: 0.86, envIntensity: 1.05, bgRotY: 1.05,
    sunColor: 0xffc685, sunIntensity: 2.55, sunPos: new THREE.Vector3(-55, 28, -32),
    hemiSky: 0xffe4c4, hemiGround: 0x302420, hemiIntensity: 0.88,
    fogColor: 0xc98a63, fogDensity: 0.0019, exposure: 0.96, bloomStrength: 0.2,
    windowEmissive: 0.95, lampFilament: 3.4, searchlightOpacity: 0.12,
  },
  day: {
    labelAr: '☀️ نهار باريس', hdriKey: 'day', bgBlur: 0.006, bgIntensity: 1.0, envIntensity: 1.2, bgRotY: 0.6,
    sunColor: 0xfff5e4, sunIntensity: 3.1, sunPos: new THREE.Vector3(-34, 72, -18),
    hemiSky: 0xdcecff, hemiGround: 0x5c5348, hemiIntensity: 1.15,
    fogColor: 0x9bb7d6, fogDensity: 0.0014, exposure: 0.98, bloomStrength: 0.16,
    windowEmissive: 0.08, lampFilament: 0.4, searchlightOpacity: 0.0,
  },
  night: {
    labelAr: '🌙 ليل باريس', hdriKey: 'night', bgBlur: 0.01, bgIntensity: 0.95, envIntensity: 0.95, bgRotY: 1.2,
    sunColor: 0x8eaef0, sunIntensity: 0.95, sunPos: new THREE.Vector3(36, 48, -50),
    hemiSky: 0x3b4f7a, hemiGround: 0x161210, hemiIntensity: 0.68,
    fogColor: 0x0a1020, fogDensity: 0.0025, exposure: 1.12, bloomStrength: 0.42,
    windowEmissive: 1.48, lampFilament: 4.5, searchlightOpacity: 0.52,
  },
  gallery: {
    labelAr: '🏛️ أتيليه دافئ', hdriKey: 'sunset', bgBlur: 0.014, bgIntensity: 0.88, envIntensity: 1.05, bgRotY: 2.45,
    sunColor: 0xffd28e, sunIntensity: 2.35, sunPos: new THREE.Vector3(-28, 42, -30),
    hemiSky: 0xffebd0, hemiGround: 0x332419, hemiIntensity: 1.05,
    fogColor: 0x6b4d3a, fogDensity: 0.0018, exposure: 1.08, bloomStrength: 0.26,
    windowEmissive: 1.1, lampFilament: 3.4, searchlightOpacity: 0.16,
  },
};

export class LouvreParisWorld3D {
  constructor(canvas, config, callbacks = {}) {
    this.canvas = canvas;
    this.config = config;
    this.callbacks = callbacks;

    this.isMobile = window.innerWidth < 900;
    // Auto-enable Cinematic Quality (2048px Shadows + Subtle Bloom + SMAA) on Desktop; lightweight 60FPS on Mobile!
    this.qualityMode = this.isMobile ? 'smooth60' : 'ultra';
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

    // HERO DRIVABLE BMW SHOWCASE UNOBSTRUCTED LEFT-OF-CENTER AT STATION 1!
    this.drivingBmw = false;
    this.bmwRoot = null;
    this.bmwPassengerSlot = new THREE.Group();
    this.bmwWheels = [];
    this.bmwPaintMats = [];
    this.bmwBrakeMats = [];
    this.bmwPaintIdx = 0;
    this.bmwPos = new THREE.Vector3(-4.8, 0, 369.0);
    this.bmwYaw = 0.56; // Iconic 3/4 front-quarter showcase showing kidney grille, glowing headlights & clearcoat reflections!
    this.bmwSpeed = 0;
    this.bmwSteer = 0;
    this.bmwBraking = false;
    this.bmwLoaded = false;

    this.playerFloorY = 0;
    this.inHouseUpperFloor = false;

    this.droneActive = false;
    this.droneTime = 0;
    this.sparkleShowTimer = 0;
    this.disposed = false;
    this.isHidden = false;

    // Start on Champs-Élysées framing Hero BMW (unobstructed left), Bobs (center), Haussmann Buildings, Plane Trees, Eiffel Tower & Sunset HDRI!
    this.playerPos = new THREE.Vector3(-1.2, 1.68, 383.2);
    this.playerYaw = 0.06;
    this.playerPitch = 0.015;
    this.targetYaw = 0.06;
    this.targetPitch = 0.015;
    this.baseFov = window.innerWidth / Math.max(1, window.innerHeight) < 0.85 ? 64 : 52;
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
    this.treeCanopyGroups = [];
    this.asphaltMat = null;
    this.cobbleMat = null;
    this.lampFilamentMat = null;
    this.hdriMaps = { sunset: null, day: null, night: null };

    this.isLooking = false;
    this.lookStart = { x: 0, y: 0 };
    this.dragMoved = 0;
    this.interactables = [];
    this.nearestInteractable = null;

    this.guideRoot = new THREE.Group();
    this.guidePos = new THREE.Vector3(-1.45, 0, 376.2);
    this.guideYaw = 0.16;
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

    this.floatingProps = []; this.parchments = [];
    this.fallingLeaves = []; this.rainDrops = null; this.rainPositions = null;
    this.eiffelSparkles = []; this.fountainRings = []; this.emissiveBuildingMats = [];

    this.raycaster = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._qDelta = new THREE.Quaternion();
    this._tmpLook = new THREE.Vector3();

    this.clock = new THREE.Clock();
    this.init();
  }

  /* ==================== INIT PHOTOREALISTIC HDRI & POST-PROCESSING RENDERER ==================== */
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
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2d201a); // Replaced immediately by real 1K HDRI photograph!
    this.scene.fog = new THREE.FogExp2(0xc98a63, 0.0021);

    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.baseFov = aspect < 0.85 ? 64 : 52;
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

    // Real Poly Haven Photogrammetry PBR Sets
    this.asphaltScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.asphalt, 3, 64, aniso);
    this.cobbleScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.cobble, 5, 110, aniso);
    this.flagstoneScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.stone, 2, 130, aniso);
    this.plazaCobbleScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.cobble, 14, 14, aniso);
    this.parquetScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.parquet, 6, 24, aniso);
    this.marbleScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.marble, 2, 2, aniso);
    this.stoneScan = this.assets.loadPBRSet(ASSET_MANIFEST.pbrTextures.stone, 4, 2, aniso);

    this.glowTex = createGlowTexture();
    this.beamTex = createLightBeamTexture();
    this.pawTex = createPawPrintTexture();
    this.wetAsphaltPatchMap = createWetAsphaltPatchMap(aniso);
    this.haussmannPBR0 = createHaussmannFacadePBR(aniso, 0);
    this.haussmannPBR1 = createHaussmannFacadePBR(aniso, 1);
    this.haussmannPBR2 = createHaussmannFacadePBR(aniso, 2);
    this.grandPalaisPBR = createGrandPalaisFacadePBR(aniso);
    this.awningBurgundyTex = createAwningStripeTexture('#5e1923', '#ece2ce');
    this.awningNavyTex = createAwningStripeTexture('#19283e', '#ece2ce');
    this.barkTex = createPlaneTreeBarkTexture();
    this.planeLeafTex = createRealisticPlaneLeafClusterTexture();
    this.louvrePBR = createLouvrePalacePBR(aniso);
    this.mansardTex = createMansardRoofPBR(aniso);
    this.eiffelLatticeTex = createEiffelLatticeTexture(aniso);
    this.wallPanelTex = createLouvreWallPanelPBR(aniso);

    const overlayMat = (opts) => new THREE.MeshStandardMaterial({
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...opts,
    });

    const makeHaussmannMat = (pbr) => new THREE.MeshPhysicalMaterial({
      map: pbr.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.35, 0.35),
      roughnessMap: pbr.roughnessMap, roughness: 0.82, metalness: 0.08, clearcoat: 0.12,
      emissive: new THREE.Color(0xffc773), emissiveMap: pbr.emissiveMap, emissiveIntensity: 0.92,
    });

    this.lampFilamentMat = new THREE.MeshStandardMaterial({
      color: 0xfff5d6, emissive: 0xffcf7a, emissiveIntensity: 3.2, roughness: 0.1,
    });

    this.mats = {
      gold: new THREE.MeshStandardMaterial({ color: 0xdfc06c, metalness: 0.9, roughness: 0.2 }),
      goldOverlay: overlayMat({ color: 0xdfc06c, metalness: 0.85, roughness: 0.24 }),
      goldGlow: new THREE.MeshStandardMaterial({ color: 0xfff0be, emissive: 0xe6a02e, emissiveIntensity: 0.95, metalness: 0.72, roughness: 0.2 }),
      waxCrimson: new THREE.MeshStandardMaterial({ color: 0xa11e2b, emissive: 0x5c0e16, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.2 }),
      marble: new THREE.MeshStandardMaterial({ map: this.marbleScan.map, normalMap: this.marbleScan.normalMap, normalScale: new THREE.Vector2(0.35, 0.35), color: 0xf6f0e6, roughness: 0.16, metalness: 0.06 }),
      limestone: new THREE.MeshStandardMaterial({ map: this.stoneScan.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.55, 0.55), color: 0xd8ccb8, roughness: 0.76, metalness: 0.02 }),
      limestoneTrim: new THREE.MeshStandardMaterial({ map: this.stoneScan.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.35, 0.35), color: 0xe6dac5, roughness: 0.68, metalness: 0.03 }),
      haussmann0: makeHaussmannMat(this.haussmannPBR0),
      haussmann1: makeHaussmannMat(this.haussmannPBR1),
      haussmann2: makeHaussmannMat(this.haussmannPBR2),
      grandPalais: new THREE.MeshPhysicalMaterial({
        map: this.grandPalaisPBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.3, 0.3),
        roughnessMap: this.grandPalaisPBR.roughnessMap, roughness: 0.68, metalness: 0.14, clearcoat: 0.25,
        emissive: new THREE.Color(0xffd284), emissiveMap: this.grandPalaisPBR.emissiveMap, emissiveIntensity: 0.92,
      }),
      louvrePalace: new THREE.MeshStandardMaterial({
        map: this.louvrePBR.map, normalMap: this.stoneScan.normalMap, normalScale: new THREE.Vector2(0.3, 0.3),
        emissive: new THREE.Color(0xffc975), emissiveMap: this.louvrePBR.emissiveMap, emissiveIntensity: 0.85, roughness: 0.64, metalness: 0.06,
      }),
      mansard: new THREE.MeshStandardMaterial({ map: this.mansardTex, color: 0x3a424d, roughness: 0.52, metalness: 0.42 }),
      terracotta: new THREE.MeshStandardMaterial({ color: 0x99583e, roughness: 0.78, metalness: 0.04 }),
      ironDark: new THREE.MeshStandardMaterial({ color: 0x1a1c20, metalness: 0.86, roughness: 0.28 }),
      parisGreenIron: new THREE.MeshStandardMaterial({ color: 0x182620, metalness: 0.82, roughness: 0.32 }),
      awningBurgundy: new THREE.MeshStandardMaterial({ map: this.awningBurgundyTex, roughness: 0.85 }),
      awningNavy: new THREE.MeshStandardMaterial({ map: this.awningNavyTex, roughness: 0.85 }),
      metroGreen: new THREE.MeshStandardMaterial({ color: 0x1d523d, metalness: 0.68, roughness: 0.3 }),
      policeBlue: new THREE.MeshStandardMaterial({ color: 0x152f5e, roughness: 0.42, metalness: 0.28 }),
      eiffelBronze: new THREE.MeshStandardMaterial({ color: 0x4a4138, metalness: 0.82, roughness: 0.3 }),
      eiffelLattice: new THREE.MeshStandardMaterial({ map: this.eiffelLatticeTex, color: 0x625649, alphaTest: 0.32, side: THREE.DoubleSide, metalness: 0.82, roughness: 0.3 }),
      bark: new THREE.MeshStandardMaterial({ map: this.barkTex, roughness: 0.88, metalness: 0.02 }),
      planeLeaf: new THREE.MeshStandardMaterial({ map: this.planeLeafTex, alphaTest: 0.32, side: THREE.DoubleSide, roughness: 0.72, metalness: 0.02 }),
      velvetRed: overlayMat({ color: 0x6b1522, roughness: 0.86 }),
      runnerOverlay: overlayMat({ color: 0x3b2316, roughness: 0.65 }),
      promenadeFlagstone: overlayMat({
        map: this.flagstoneScan.map, normalMap: this.flagstoneScan.normalMap, normalScale: new THREE.Vector2(0.42, 0.42),
        roughnessMap: this.flagstoneScan.roughnessMap, color: 0xd6cab6, roughness: 0.66, metalness: 0.06,
      }),
      crosswalkStripe: overlayMat({ color: 0xeae4d6, roughness: 0.72 }),
      laneDash: overlayMat({ color: 0xede7d8, roughness: 0.68 }),
      woodDark: new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.46, metalness: 0.06 }),
      lanternPaper: new THREE.MeshStandardMaterial({ color: 0xffdca0, emissive: 0xffa638, emissiveIntensity: 1.4, roughness: 0.38, transparent: true, opacity: 0.94 }),
      glassLantern: new THREE.MeshPhysicalMaterial({ color: 0xfff3d8, transparent: true, opacity: 0.42, roughness: 0.08, metalness: 0.1, ior: 1.5, clearcoat: 1.0 }),
      glassPyramid: new THREE.MeshPhysicalMaterial({
        color: 0xdaf2fa, emissive: 0x6e4a18, emissiveIntensity: 0.14, transparent: true, opacity: 0.38,
        roughness: 0.04, metalness: 0.14, ior: 1.5, reflectivity: 1.0, clearcoat: 1.0, clearcoatRoughness: 0.04, side: THREE.DoubleSide,
      }),
      glassDoor: new THREE.MeshPhysicalMaterial({
        color: 0xe8f9ff, transparent: true, opacity: 0.44, roughness: 0.03, metalness: 0.18, ior: 1.5, clearcoat: 1.0, side: THREE.DoubleSide,
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
    this.emissiveBuildingMats.push(this.mats.haussmann0, this.mats.haussmann1, this.mats.haussmann2, this.mats.grandPalais, this.mats.louvrePalace);

    this.setupLighting();
    this.buildGrand525mWetBoulevardAndHaussmannCity();
    this.buildEnterableParisianHaussmannHouse();
    this.buildOrnateParisianStreetlampsAndPlaneTrees();
    this.buildWorkingTrafficLightsAndIntersections();
    this.buildBronzeEiffelTower();
    this.buildOpenPortalLouvrePyramidAndFountain();
    this.buildLouvreGrandGalleryInterior();
    this.buildFourInteractiveArtifactsAndSculpture();
    this.buildLiveLouvreWallPaintingEasel();
    this.buildFiveHiddenMuseumSeals();
    this.buildRoyalFamilyVaultAndManifesto();
    this.buildGrandRotundaAndRealisticCake();
    this.buildWeatherParticles();
    this.buildPawPrintPool();

    // Load Real Photographic HDRI Skyboxes (Sunset, Day, Night) + Draco Hero BMW & Realistic Traffic + Rigged Guides
    this.loadRealHDRISkyboxes();
    this.loadHeroBMWAndRealisticTraffic();
    this.loadOptimizedMocapHumanVisitorsAndAnasGuide();
    this.loadAnatomicallyFixedBobsPersianCat();

    this.setTimeOfDay('sunset');
    this.bindEvents();
    if (this.callbacks.onReady) this.callbacks.onReady();
    this.animate();
  }

  async loadRealHDRISkyboxes() {
    const sunsetEnv = await this.assets.loadHDRI(ASSET_MANIFEST.hdris.sunset, 'تحميل سماء غروب باريس الحقيقية HDRI');
    if (sunsetEnv) {
      this.hdriMaps.sunset = sunsetEnv;
      if (this.timeOfDay === 'sunset' || this.timeOfDay === 'gallery') this.applyCurrentHDRI();
    }
    const dayEnv = await this.assets.loadHDRI(ASSET_MANIFEST.hdris.day, 'تحميل سماء نهار باريس HDRI');
    if (dayEnv) {
      this.hdriMaps.day = dayEnv;
      if (this.timeOfDay === 'day') this.applyCurrentHDRI();
    }
    const nightEnv = await this.assets.loadHDRI(ASSET_MANIFEST.hdris.night, 'تحميل سماء ليل باريس HDRI');
    if (nightEnv) {
      this.hdriMaps.night = nightEnv;
      if (this.timeOfDay === 'night') this.applyCurrentHDRI();
    }
  }

  applyCurrentHDRI() {
    const p = TIME_PRESETS[this.timeOfDay] || TIME_PRESETS.sunset;
    const tex = this.hdriMaps[p.hdriKey] || this.hdriMaps.sunset || this.hdriMaps.day || this.hdriMaps.night;
    if (!tex) return;
    this.scene.background = tex;
    this.scene.environment = tex;
    if ('backgroundBlurriness' in this.scene) this.scene.backgroundBlurriness = p.bgBlur;
    if ('backgroundIntensity' in this.scene) this.scene.backgroundIntensity = p.bgIntensity;
    if ('environmentIntensity' in this.scene) this.scene.environmentIntensity = p.envIntensity;
    if (this.scene.backgroundRotation) this.scene.backgroundRotation.y = p.bgRotY || 0;
    if (this.scene.environmentRotation) this.scene.environmentRotation.y = p.bgRotY || 0;
  }

  ensureUltraComposer() {
    if (this.composer) return;
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Subtle selective UnrealBloomPass (high threshold 1.18 so ONLY headlights, lamp filaments & lanterns bloom — never the HDRI sky!)
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.2, 0.35, 1.18);
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
    let targetDpr = Math.min(dpr, this.isMobile ? 1.15 : 1.5);
    if (this.qualityMode === 'eco') targetDpr = Math.min(dpr, 1.0);
    else if (this.qualityMode === 'ultra') {
      targetDpr = Math.min(dpr, this.isMobile ? 1.25 : 1.65);
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
    if (this.drivingBmw) this.seatGuideInsideBmw();
    if (this.callbacks.onGuideTypeChange) this.callbacks.onGuideTypeChange(this.activeGuideType);
  }

  setWeather(mode) {
    this.weatherMode = ['clear', 'rain', 'petals'].includes(mode) ? mode : 'clear';
    const isRain = this.weatherMode === 'rain';
    if (this.rainDrops) this.rainDrops.visible = isRain;
    if (this.leafInst) {
      this.leafInst.visible = !isRain && this.qualityMode !== 'eco';
      this.leafInst.material.color.setHex(this.weatherMode === 'petals' ? 0xffb7cf : 0xe4be6c);
    }
    if (this.asphaltMat) {
      this.asphaltMat.roughness = isRain ? 0.16 : 0.62;
      this.asphaltMat.metalness = isRain ? 0.42 : 0.12;
      this.asphaltMat.clearcoat = isRain ? 0.95 : 0.34;
    }
    if (this.cobbleMat) {
      this.cobbleMat.roughness = isRain ? 0.2 : 0.72;
      this.cobbleMat.metalness = isRain ? 0.28 : 0.08;
    }
    if (this.callbacks.onWeatherChange) this.callbacks.onWeatherChange(this.weatherMode);
  }

  /* ==================== 2048px DIRECTIONAL SUNSET SHADOWS & LIGHTING ==================== */
  setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffe4c4, 0x302420, 0.92);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xffc685, 2.75);
    this.sunLight.position.set(-55, 28, 340);
    this.sunLight.target.position.set(0, 0, 340);
    this.sunLight.castShadow = !this.isMobile;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.camera.near = 10; this.sunLight.shadow.camera.far = 280;
    this.sunLight.shadow.camera.left = -95; this.sunLight.shadow.camera.right = 95;
    this.sunLight.shadow.camera.top = 135; this.sunLight.shadow.camera.bottom = -135;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight, this.sunLight.target);

    this.fillLight = new THREE.DirectionalLight(0x88a2d8, 0.48);
    this.fillLight.position.set(55, 32, 320);
    this.scene.add(this.fillLight);

    this.playerLantern = new THREE.PointLight(0xffdca0, 14, 28, 1.45);
    this.scene.add(this.playerLantern);
  }

  setTimeOfDay(mode) {
    const p = TIME_PRESETS[mode] || TIME_PRESETS.sunset;
    this.timeOfDay = mode;
    this.sunLight.color.setHex(p.sunColor);
    this.sunLight.intensity = this.uvMode ? 0.4 : p.sunIntensity;
    this.hemiLight.color.setHex(p.hemiSky);
    this.hemiLight.groundColor.setHex(p.hemiGround);
    this.hemiLight.intensity = this.uvMode ? 0.35 : p.hemiIntensity;
    this.scene.fog.color.setHex(p.fogColor);
    this.scene.fog.density = p.fogDensity;
    this.renderer.toneMappingExposure = p.exposure;
    if (this.bloomPass) this.bloomPass.strength = this.uvMode ? 0.56 : p.bloomStrength;

    this.applyCurrentHDRI();
    this.emissiveBuildingMats.forEach((m) => { m.emissiveIntensity = p.windowEmissive; });
    if (this.lampFilamentMat) this.lampFilamentMat.emissiveIntensity = p.lampFilament;
    if (this.eiffelSearchlightMat) this.eiffelSearchlightMat.opacity = this.sparkleShowTimer > 0 ? 0.56 : p.searchlightOpacity;

    this.renderer.shadowMap.needsUpdate = true;
    if (this.callbacks.onTimeChange) this.callbacks.onTimeChange(mode, p.labelAr);
  }

  setUVMode(enabled) {
    this.uvMode = Boolean(enabled);
    this.uvSecretMeshes.forEach((m) => { m.visible = this.uvMode; });
    this.playerLantern.color.setHex(this.uvMode ? 0x6ce2ff : 0xffdca0);
    this.playerLantern.intensity = this.uvMode ? 22 : 14;
    this.setTimeOfDay(this.timeOfDay);
  }

  releaseBirthdayLanterns() {
    const geo = new THREE.CylinderGeometry(0.36, 0.26, 0.64, 10);
    const centerZ = Math.max(16, this.playerPos.z - 14);
    for (let i = 0; i < 19; i++) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(geo, this.mats.lanternPaper);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffc660, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.scale.set(2.0, 2.0, 1); grp.add(body, halo);
      const ang = (i / 19) * Math.PI * 2 + Math.random() * 0.25, rad = 5.5 + Math.random() * 16;
      grp.position.set(Math.cos(ang) * rad, 2.2 + Math.random() * 4, centerZ + Math.sin(ang) * rad);
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

  /* ==================== 525M WET CHAMPS-ÉLYSÉES & AUTHENTIC 6-STORY HAUSSMANN PARIS ==================== */
  buildGrand525mWetBoulevardAndHaussmannCity() {
    const len = 424, midZ = 244;

    this.cobbleMat = new THREE.MeshStandardMaterial({
      map: this.cobbleScan.map, normalMap: this.cobbleScan.normalMap, normalScale: new THREE.Vector2(0.88, 0.88),
      roughnessMap: this.cobbleScan.roughnessMap, roughness: 0.72, metalness: 0.08,
    });
    const centralPromenade = new THREE.Mesh(new THREE.PlaneGeometry(16, len), this.cobbleMat);
    centralPromenade.rotation.x = -Math.PI / 2; centralPromenade.position.set(0, 0, midZ); centralPromenade.receiveShadow = true;
    this.scene.add(centralPromenade);

    const runner = new THREE.Mesh(new THREE.PlaneGeometry(3.2, len - 8), this.mats.promenadeFlagstone);
    runner.rotation.x = -Math.PI / 2; runner.position.set(0, 0.042, midZ); runner.receiveShadow = true;
    this.scene.add(runner);
    [-1.66, 1.66].forEach((x) => {
      const trim = new THREE.Mesh(new THREE.PlaneGeometry(0.08, len - 8), this.mats.goldOverlay);
      trim.rotation.x = -Math.PI / 2; trim.position.set(x, 0.048, midZ); this.scene.add(trim);
    });

    // Wet-Asphalt Reflective Champs-Élysées Avenues (Poly Haven asphalt_03 + wet reflection patch roughnessMap!)
    this.asphaltMat = new THREE.MeshPhysicalMaterial({
      map: this.asphaltScan.map, normalMap: this.asphaltScan.normalMap, normalScale: new THREE.Vector2(0.95, 0.95),
      roughnessMap: this.wetAsphaltPatchMap, aoMap: this.asphaltScan.aoMap, aoMapIntensity: 0.85,
      color: 0x343840, roughness: 0.62, metalness: 0.12, clearcoat: 0.34, clearcoatRoughness: 0.22,
    });
    [-16, 16].forEach((rx) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(16, len), this.asphaltMat);
      road.rotation.x = -Math.PI / 2; road.position.set(rx, 0, midZ); road.receiveShadow = true;
      this.scene.add(road);
    });

    // Crisp White Dashed Lane Markings & Edge Lines (polygonOffset -> ZERO z-fighting!)
    const dashPositions = [];
    for (let z = 446; z >= 38; z -= 10) dashPositions.push([-16, z], [16, z]);
    const dashInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.24, 4.4), this.mats.laneDash, dashPositions.length);
    const dummy = new THREE.Object3D();
    dashPositions.forEach(([x, z], i) => {
      dummy.position.set(x, 0.046, z); dummy.rotation.set(-Math.PI / 2, 0, 0); dummy.updateMatrix();
      dashInst.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(dashInst);

    // Outer Limestone Parisian Sidewalks (strictly non-overlapping!)
    [-44, 44].forEach((sx) => {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(40, len), this.mats.limestone);
      sw.rotation.x = -Math.PI / 2; sw.position.set(sx, 0, midZ); sw.receiveShadow = true;
      this.scene.add(sw);
    });

    // Chamfered Parisian Stone Curbs
    [8.1, 24.1].forEach((cx) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, len), this.mats.limestoneTrim);
      curb.position.set(cx, 0.1, midZ); curb.receiveShadow = true; this.scene.add(curb);
    });
    [-8.1, -24.1].forEach((cx) => {
      const cNorth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 260), this.mats.limestoneTrim); cNorth.position.set(cx, 0.1, 162); cNorth.receiveShadow = true;
      const cSouth = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 148), this.mats.limestoneTrim); cSouth.position.set(cx, 0.1, 382); cSouth.receiveShadow = true;
      this.scene.add(cNorth, cSouth);
    });

    // ---- AUTHENTIC 6-STORY PARISIAN HAUSSMANN BUILDING BUILDER ----
    // Real warm cream limestone + extruded stone cornices + 2nd & 5th floor wrought-iron balconies +
    // sloped dark zinc mansard roof + protruding dormer windows (lucarnes) + terracotta chimney pots + café awnings!
    const mansardGeo = new THREE.CylinderGeometry(14.6, 17.5, 4.6, 4);
    mansardGeo.rotateY(Math.PI / 4);
    const haussmannMats = [this.mats.haussmann0, this.mats.haussmann1, this.mats.haussmann2];

    const buildSixStoryHaussmannBlock = (x, z, rotY, variant = 0) => {
      const grp = new THREE.Group();
      grp.position.set(x, 0, z);
      grp.rotation.y = rotY;

      const W = 24.0, H = 19.6, D = 13.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), haussmannMats[variant % 3]);
      body.position.y = H * 0.5;
      body.castShadow = true; body.receiveShadow = true;
      grp.add(body);

      // Extruded Horizontal Parisian Limestone Cornices (Mezzanine, Floor 2, Floor 5, Main Entablature)
      [4.5, 8.6, 15.6, H].forEach((cy, ci) => {
        const depth = ci === 3 ? D + 0.85 : D + 0.42;
        const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 0.35, ci === 3 ? 0.65 : 0.36, depth), this.mats.limestoneTrim);
        cornice.position.y = cy;
        grp.add(cornice);
      });

      // Vertical Corner Stone Pilasters for genuine 3D facade relief
      [-11.6, -3.9, 3.9, 11.6].forEach((px) => {
        const pil = new THREE.Mesh(new THREE.BoxGeometry(0.65, H, 0.32), this.mats.limestoneTrim);
        pil.position.set(px, H * 0.5, D * 0.5 + 0.12);
        grp.add(pil);
      });

      // Continuous Protruding 3D Wrought-Iron Parisian Balconies on 2nd Floor (y=8.6) & 5th Floor (y=15.6)!
      [8.6, 15.6].forEach((by) => {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.24, 1.15), this.mats.limestoneTrim);
        slab.position.set(0, by + 0.08, D * 0.5 + 0.52);
        const railTop = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.07, 0.07), this.mats.ironDark);
        railTop.position.set(0, by + 1.05, D * 0.5 + 1.02);
        const railMid = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.05, 0.05), this.mats.ironDark);
        railMid.position.set(0, by + 0.56, D * 0.5 + 1.02);
        grp.add(slab, railTop, railMid);
        for (let bx = -11.2; bx <= 11.2; bx += 2.24) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.92, 0.05), this.mats.ironDark);
          post.position.set(bx, by + 0.6, D * 0.5 + 1.02);
          grp.add(post);
        }
      });

      // Ground-Floor Luxury Striped Parisian Café / Boutique Awnings
      const awningMat = variant % 2 === 0 ? this.mats.awningBurgundy : this.mats.awningNavy;
      [-6.0, 6.0].forEach((ax) => {
        const awn = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.14, 2.3), awningMat);
        awn.position.set(ax, 3.85, D * 0.5 + 0.98);
        awn.rotation.x = 0.34;
        grp.add(awn);
      });

      // Steep Dark Zinc/Slate Parisian Mansard Roof (#2c323b)
      const mansard = new THREE.Mesh(mansardGeo, this.mats.mansard);
      mansard.scale.set(W / 24.4, 1.0, D / 24.4);
      mansard.position.y = H + 2.3;
      mansard.castShadow = true;
      grp.add(mansard);

      // Protruding 3D Dormer Windows (Lucarnes) along the Mansard Roof
      [-8.4, -2.8, 2.8, 8.4].forEach((dx, di) => {
        const dormer = new THREE.Group();
        dormer.position.set(dx, H + 1.65, D * 0.5 - 0.45);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.1, 1.3), this.mats.limestoneTrim);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.32, 10, 1, false, 0, Math.PI), this.mats.mansard);
        cap.rotation.z = Math.PI / 2; cap.rotation.y = Math.PI / 2; cap.position.y = 1.05;
        const paneMat = (di + variant) % 2 === 0
          ? new THREE.MeshStandardMaterial({ color: 0xffd68c, emissive: 0xe69f42, emissiveIntensity: 0.75, roughness: 0.15 })
          : new THREE.MeshPhysicalMaterial({ color: 0x1b2430, roughness: 0.08, metalness: 0.25, clearcoat: 1.0 });
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.22, 1.55), paneMat);
        pane.position.z = 0.67;
        dormer.add(frame, cap, pane);
        grp.add(dormer);
      });

      // Classic Parisian Limestone Chimney Stacks & Terracotta Chimney Pots
      [-6.5, 6.5].forEach((cx) => {
        const stack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.1, 1.0), this.mats.limestone);
        stack.position.set(cx, H + 5.2, -1.2);
        grp.add(stack);
        [-0.45, 0.45].forEach((px) => {
          const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 8), this.mats.terracotta);
          pot.position.set(cx + px, H + 6.5, -1.2);
          grp.add(pot);
        });
      });

      this.scene.add(grp);
    };

    // Line BOTH sides of the 525m Champs-Élysées Boulevard with authentic 6-Story Parisian Haussmann blocks!
    // East Side (z=290 reserved for Beaux-Arts Galeries Lafayette / Grand Palais!)
    [412, 386, 360, 334, 242, 216, 190, 164, 138, 112, 86, 60].forEach((z, i) => {
      buildSixStoryHaussmannBlock(35.0, z, -Math.PI / 2, i);
    });
    // West Side (z=300 Enterable Haussmann House, z=170 Paris Police HQ, open Eiffel skyline vista at z=120..150 & z=210..240!)
    [412, 386, 360, 334, 262, 198, 96, 68].forEach((z, i) => {
      buildSixStoryHaussmannBlock(-35.0, z, Math.PI / 2, i + 1);
    });

    // ---- BEAUX-ARTS GALERIES LAFAYETTE / GRAND PALAIS PARIS (East Side x=+35, z=290 — ZERO BLACK BOX!) ----
    const palais = new THREE.Group(); palais.position.set(35.0, 0, 290);
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(16, 20.5, 44), this.mats.grandPalais);
    pBody.position.set(0, 10.25, 0); pBody.castShadow = true; pBody.receiveShadow = true;
    const pCornice = new THREE.Mesh(new THREE.BoxGeometry(17.0, 0.85, 45.2), this.mats.limestoneTrim); pCornice.position.set(0, 20.7, 0);
    const pAttic = new THREE.Mesh(new THREE.BoxGeometry(15.6, 2.4, 43.4), this.mats.mansard); pAttic.position.set(0, 22.2, 0);
    // Real Glass-and-Bronze Art Nouveau Beaux-Arts Cupola reflecting HDRI Sky!
    const cupolaGlass = new THREE.Mesh(new THREE.SphereGeometry(11.2, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.48), this.mats.glassPyramid);
    cupolaGlass.scale.set(0.72, 0.88, 1.45); cupolaGlass.position.set(-0.5, 22.8, 0);
    // Classical bronze structural arch ribs (not cheap wireframe!)
    for (let r = 0; r < 4; r++) {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(11.3, 0.16, 8, 28, Math.PI), this.mats.gold);
      rib.position.set(-0.5, 22.8, -11 + r * 7.3); rib.scale.set(0.72, 0.88, 1);
      palais.add(rib);
    }
    const pSign = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.2), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('جاليري باريس • قصر الفنون والأزياء', 'GALERIES PARIS • BEAUX-ARTS PALAIS') }));
    pSign.position.set(-8.2, 18.2, 0); pSign.rotation.y = -Math.PI / 2;
    palais.add(pBody, pCornice, pAttic, cupolaGlass, pSign);
    this.scene.add(palais);

    // ---- PARIS POLICE PRECINCT (West Side x=-35, z=170 — Authentic Haussmann Limestone Architecture!) ----
    const policeHQ = new THREE.Group(); policeHQ.position.set(-35, 0, 170);
    const polBody = new THREE.Mesh(new THREE.BoxGeometry(14, 15.6, 26), this.mats.haussmann1);
    polBody.position.y = 7.8; polBody.castShadow = true; polBody.receiveShadow = true;
    const polCornice = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.6, 26.8), this.mats.limestoneTrim); polCornice.position.y = 15.8;
    const polRoof = new THREE.Mesh(mansardGeo, this.mats.mansard); polRoof.scale.set(0.58, 0.85, 1.05); polRoof.position.y = 17.8;
    const polSign = new THREE.Mesh(new THREE.PlaneGeometry(16, 3.4), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('شرطة باريس الوطنية', 'COMMISSARIAT DE POLICE • PARIS', '#88c5ff', '#10203a') }));
    polSign.position.set(7.25, 11.4, 0); polSign.rotation.y = Math.PI / 2;
    [0x1a3e8c, 0xf2f4f8, 0xb8242e].forEach((hex, idx) => {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.8, 0.72), new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5 }));
      strip.position.set(7.15, 2.4, -4.6 + idx * 0.75); policeHQ.add(strip);
    });
    policeHQ.add(polBody, polCornice, polRoof, polSign); this.scene.add(policeHQ);

    // ---- ARC DE TRIOMPHE MONUMENT (z = +444) ----
    const arc = new THREE.Group(); arc.position.set(0, 0, 444);
    [-10, 10].forEach((px) => { const pier = new THREE.Mesh(new THREE.BoxGeometry(9.5, 28, 12), this.mats.limestone); pier.position.set(px, 14, 0); pier.castShadow = true; arc.add(pier); });
    const arcTop = new THREE.Mesh(new THREE.BoxGeometry(30, 11, 12.6), this.mats.limestone); arcTop.position.set(0, 33, 0);
    const arcCornice = new THREE.Mesh(new THREE.BoxGeometry(31.5, 1.4, 13.4), this.mats.limestoneTrim); arcCornice.position.set(0, 38.6, 0);
    const arcRing = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.48, 10, 32, Math.PI), this.mats.gold); arcRing.position.set(0, 22, -6.1);
    const arcSign = new THREE.Mesh(new THREE.PlaneGeometry(18, 3.6), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('قوس النصر • بوليفارد الشانزليزيه', 'ARC DE TRIOMPHE • CHAMPS-ÉLYSÉES • HEY') }));
    arcSign.position.set(0, 33, -6.45); arcSign.rotation.y = Math.PI;
    arc.add(arcTop, arcCornice, arcRing, arcSign); this.scene.add(arc);

    // ---- ART NOUVEAU MÉTRO PARISIEN ENTRANCE (z = +64, x = +5.8) ----
    const metro = new THREE.Group(); metro.position.set(5.8, 0, 64);
    [-1.4, 1.4].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.2, 10), this.mats.metroGreen); post.position.set(px, 1.6, 0);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), this.lampFilamentMat); globe.position.set(px, 3.3, 0);
      metro.add(post, globe);
    });
    const mArch = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.68, 0.16), this.mats.metroGreen); mArch.position.set(0, 3.05, 0);
    const mSign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.54), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('مترو باريس • ريفولي', 'MÉTROPOLITAIN', '#ffdf86', '#164533') }));
    mSign.position.set(0, 3.05, 0.1); const mSignBack = mSign.clone(); mSignBack.position.z = -0.1; mSignBack.rotation.y = Math.PI;
    metro.add(mArch, mSign, mSignBack); this.circleColliders.push({ x: 5.8, z: 64, r: 1.5 }); this.scene.add(metro);
  }

  /* ==================== ENTERABLE 2-STORY PARIS HAUSSMANN APARTMENT «منزل باريس المفتوح» ==================== */
  buildEnterableParisianHaussmannHouse() {
    const house = new THREE.Group();
    house.position.set(-33, 0, 300);

    const walkCarpet = new THREE.Mesh(new THREE.PlaneGeometry(24, 5.2), this.mats.velvetRed);
    walkCarpet.rotation.x = -Math.PI / 2; walkCarpet.position.set(20, 0.055, 0);
    house.add(walkCarpet);

    const gfFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 18), new THREE.MeshStandardMaterial({ map: this.parquetScan.map, roughness: 0.36 }));
    gfFloor.rotation.x = -Math.PI / 2; gfFloor.position.set(0, 0.055, 0);
    house.add(gfFloor);

    const wallMat = this.mats.limestone;
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 11.2, 18), wallMat); backWall.position.set(-8, 5.6, 0);
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(16, 11.2, 0.6), wallMat); northWall.position.set(0, 5.6, -9);
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(16, 11.2, 0.6), wallMat); southWall.position.set(0, 5.6, 9);
    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6, 11.2, 5.5), wallMat); frontLeft.position.set(8, 5.6, 6.25);
    const frontRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 11.2, 5.5), wallMat); frontRight.position.set(8, 5.6, -6.25);
    const frontLintel = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.2, 7.2), this.mats.limestoneTrim); frontLintel.position.set(8, 4.4, 0);
    const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.6, 19.2), this.mats.limestoneTrim); roofCornice.position.set(0, 11.2, 0);
    const mansardGeo = new THREE.CylinderGeometry(11.4, 13.8, 3.8, 4); mansardGeo.rotateY(Math.PI / 4);
    const mansardRoof = new THREE.Mesh(mansardGeo, this.mats.mansard); mansardRoof.scale.set(0.88, 1, 0.98); mansardRoof.position.set(0, 13.3, 0);
    const houseSign = new THREE.Mesh(new THREE.PlaneGeometry(13.2, 2.7), new THREE.MeshBasicMaterial({ map: createDistrictSignTexture('منزل باريس المفتوح • ادخل واصعد للشرفة', 'MAISON DE PARIS • 2ND FLOOR BALCONY') }));
    houseSign.position.set(8.45, 9.6, 0); houseSign.rotation.y = Math.PI / 2;
    house.add(backWall, northWall, southWall, frontLeft, frontRight, frontLintel, roofCornice, mansardRoof, houseSign);

    const f2Floor = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.35, 17.6), new THREE.MeshStandardMaterial({ map: this.parquetScan.map, roughness: 0.35 }));
    f2Floor.position.set(2.0, 4.45, 0);
    const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 12.6), this.mats.limestoneTrim); balconySlab.position.set(9.8, 4.45, 0);
    const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 12.4), this.mats.ironDark); railTop.position.set(11.45, 5.65, 0);
    for (let rz = -6.0; rz <= 6.0; rz += 0.8) {
      const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 6), this.mats.ironDark); bal.position.set(11.45, 5.05, rz); house.add(bal);
    }
    house.add(f2Floor, balconySlab, railTop);

    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 0.72), this.mats.marble);
      step.position.set(-5.6, 0.15 + i * (4.55 / steps), 5.8 - i * 0.68); house.add(step);
    }
    const landing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.32, 3.4), this.mats.marble); landing.position.set(-5.5, 4.45, -6.5);
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 3.8), this.mats.velvetRed); sofa.position.set(2.2, 0.45, -4.5);
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 2.2), this.mats.woodDark); table.position.set(4.1, 0.3, -4.5);
    const lamp1 = new THREE.PointLight(0xffd796, 16, 20, 1.4); lamp1.position.set(1.5, 3.6, 0);
    const lamp2 = new THREE.PointLight(0xffdfa8, 16, 22, 1.4); lamp2.position.set(3.5, 8.6, 0);
    const artDesk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 2.6), this.mats.woodDark); artDesk.position.set(4.6, 5.0, 3.8);
    const chandelier = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.08, 8, 24), this.mats.goldGlow); chandelier.rotation.x = Math.PI / 2; chandelier.position.set(2.0, 8.8, 0);
    house.add(landing, sofa, table, lamp1, lamp2, artDesk, chandelier);

    const stairHit = new THREE.Mesh(new THREE.BoxGeometry(5.5, 4.2, 6.5), new THREE.MeshBasicMaterial({ visible: false }));
    stairHit.position.set(6.5, 2.0, 0); stairHit.userData.interactId = 'house-stairs'; house.add(stairHit);
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
      this.inHouseUpperFloor = true; this.playerFloorY = 4.65;
      this.playerPos.set(-22.8, 4.65 + 1.68, 300);
      this.targetYaw = -Math.PI * 0.42; this.playerYaw = this.targetYaw;
      this.targetPitch = -0.06; this.playerPitch = -0.06;
    } else {
      this.inHouseUpperFloor = false; this.playerFloorY = 0;
      this.playerPos.set(-6.0, 1.68, 300);
      this.targetYaw = 0; this.playerYaw = 0;
    }
  }

  /* ==================== ORNATE PARISIAN CAST-IRON RÉVERBÈRES & MULTI-LAYERED PLANE TREES ==================== */
  buildOrnateParisianStreetlampsAndPlaneTrees() {
    const lampPositions = [];
    for (let z = 420; z >= 40; z -= 26) {
      if (Math.abs(z - 300) < 12) continue;
      lampPositions.push([-7.3, z], [7.3, z], [-25.1, z], [25.1, z]);
    }
    const n = lampPositions.length;
    // Slim tapered Parisian cast-iron Réverbères (NO thick black cylinders, NO white spheres, NO yellow flare sprites!)
    const baseInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.11, 0.19, 0.9, 8), this.mats.parisGreenIron, n);
    const poleInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.045, 0.085, 3.8, 8), this.mats.parisGreenIron, n);
    const collarInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.06, 0.22, 8), this.mats.gold, n);
    const glassInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.14, 0.56, 6), this.mats.glassLantern, n);
    const capInst = new THREE.InstancedMesh(new THREE.ConeGeometry(0.26, 0.28, 6), this.mats.parisGreenIron, n);
    const bulbInst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 8, 6), this.lampFilamentMat, n);
    poleInst.castShadow = !this.isMobile;

    const dummy = new THREE.Object3D();
    lampPositions.forEach(([x, z], i) => {
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(x, 0.45, z); dummy.updateMatrix(); baseInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 2.75, z); dummy.updateMatrix(); poleInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 4.66, z); dummy.updateMatrix(); collarInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 5.04, z); dummy.updateMatrix(); glassInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 5.45, z); dummy.updateMatrix(); capInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 5.02, z); dummy.updateMatrix(); bulbInst.setMatrixAt(i, dummy.matrix);
    });
    this.scene.add(baseInst, poleInst, collarInst, glassInst, capInst, bulbInst);

    // ---- MULTI-LAYERED PARISIAN BOULEVARD PLANE TREES (NO LOLLIPOP BLOBS!) ----
    const treePositions = [];
    for (let z = 414; z >= 46; z -= 26) {
      if (Math.abs(z - 300) < 16 || Math.abs(z - 170) < 16 || Math.abs(z - 65) < 14) continue;
      // Leave clean sightline around Hero BMW at Station 1 (x=+5.3, z=371.5)
      if (z > 358 && z < 382) treePositions.push([-6.5, z]);
      else treePositions.push([-6.5, z], [6.5, z]);
    }
    const tCount = treePositions.length;
    const trunkInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.28, 3.8, 9), this.mats.bark, tCount);
    const grateInst = new THREE.InstancedMesh(new THREE.RingGeometry(0.32, 0.92, 12), this.mats.ironDark, tCount);
    trunkInst.castShadow = !this.isMobile;
    const branchGeo = new THREE.CylinderGeometry(0.07, 0.14, 2.1, 7);
    const branchInst = new THREE.InstancedMesh(branchGeo, this.mats.bark, tCount * 3);
    const leafGeo = new THREE.PlaneGeometry(4.4, 4.2);

    treePositions.forEach(([x, z], i) => {
      dummy.position.set(x, 1.9, z); dummy.rotation.set(0, i * 0.8, 0); dummy.updateMatrix(); trunkInst.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.055, z); dummy.rotation.set(-Math.PI / 2, 0, 0); dummy.updateMatrix(); grateInst.setMatrixAt(i, dummy.matrix);

      for (let b = 0; b < 3; b++) {
        const ang = (b / 3) * Math.PI * 2 + i * 0.5;
        dummy.position.set(x + Math.cos(ang) * 0.48, 4.25, z + Math.sin(ang) * 0.48);
        dummy.rotation.set(Math.sin(ang) * 0.45, ang, -Math.cos(ang) * 0.45);
        dummy.updateMatrix();
        branchInst.setMatrixAt(i * 3 + b, dummy.matrix);
      }

      // Dense 3-tier multi-angle alpha-mapped real leaf foliage canopy with subtle wind sway
      const canopy = new THREE.Group();
      canopy.position.set(x, 5.4, z);
      const offsets = [[0, 0.5, 0, 1.1], [0.9, -0.35, 0.5, 0.86], [-0.85, -0.3, -0.45, 0.88]];
      offsets.forEach(([ox, oy, oz, sc], oi) => {
        for (let k = 0; k < 2; k++) {
          const card = new THREE.Mesh(leafGeo, this.mats.planeLeaf);
          card.position.set(ox, oy, oz);
          card.scale.setScalar(sc);
          card.rotation.y = (k * Math.PI) / 2 + i * 0.6 + oi * 0.4;
          card.rotation.x = (oi - 1) * 0.14;
          card.castShadow = !this.isMobile && oi === 0;
          canopy.add(card);
        }
      });
      this.scene.add(canopy);
      this.treeCanopyGroups.push({ grp: canopy, phase: i * 0.9 });
      this.circleColliders.push({ x, z, r: 0.6 });
    });
    this.scene.add(trunkInst, grateInst, branchInst);
  }

  /* ==================== HERO BMW AT STATION 1 + REALISTIC AUTOMOTIVE TRAFFIC (ZERO TOYS!) ==================== */
  async loadHeroBMWAndRealisticTraffic() {
    const gltf = await this.assets.loadGLB(ASSET_MANIFEST.models.heroBmw, 'جاري تحميل سيارة BMW والمركبات الواقعية');
    if (!gltf) return;

    const baseModel = gltf.scene;
    const rawBox = new THREE.Box3().setFromObject(baseModel);
    const rawSize = rawBox.getSize(new THREE.Vector3());
    const scale = 4.68 / Math.max(0.01, Math.max(rawSize.x, rawSize.z));
    baseModel.scale.setScalar(scale);
    if (rawSize.x > rawSize.z) baseModel.rotation.y = Math.PI / 2;

    baseModel.updateMatrixWorld(true);
    let farZ = null, tailZ = null;
    const tmpBox = new THREE.Box3(), tmpCtr = new THREE.Vector3();
    baseModel.traverse((o) => {
      if (!o.isMesh) return;
      const mName = (Array.isArray(o.material) ? o.material.map((m) => m?.name).join(' ') : o.material?.name) || '';
      if (/far/i.test(mName)) { tmpBox.setFromObject(o).getCenter(tmpCtr); farZ = tmpCtr.z; }
      if (/led red/i.test(mName)) { tmpBox.setFromObject(o).getCenter(tmpCtr); tailZ = tmpCtr.z; }
    });
    if (farZ !== null && tailZ !== null && farZ < tailZ) {
      baseModel.rotation.y += Math.PI;
      baseModel.updateMatrixWorld(true);
    }
    const fitBox = new THREE.Box3().setFromObject(baseModel);
    const fitCtr = fitBox.getCenter(new THREE.Vector3());
    baseModel.position.set(-fitCtr.x, -fitBox.min.y + 0.02, -fitCtr.z);

    // Helper to build a realistic clearcoat car instance sharing baseModel's GPU geometry buffers!
    const buildRealisticCarInstance = (paintHex, isHero = false, isPolice = false) => {
      const wrapper = new THREE.Group();
      const clone = baseModel.clone(true);

      const paintMat = new THREE.MeshPhysicalMaterial({
        color: paintHex, metalness: 0.9, roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.5,
      });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0d141e, metalness: 0.12, roughness: 0.04, transparent: true, opacity: 0.72, ior: 1.5, clearcoat: 1.0, envMapIntensity: 1.6,
      });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe8edf5, metalness: 0.98, roughness: 0.08 });
      const headLightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2cc, emissiveIntensity: 3.4, roughness: 0.08 });
      const tailLightMat = new THREE.MeshStandardMaterial({ color: 0xff1c24, emissive: 0xff141e, emissiveIntensity: 2.3, roughness: 0.14 });

      if (isHero) { this.bmwPaintMats.push(paintMat); this.bmwBrakeMats.push(tailLightMat); }

      const wheels = [];
      clone.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = isHero && !this.isMobile;
        o.receiveShadow = false;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const nextMats = mats.map((m) => {
          if (!m) return m;
          const n = m.name || '';
          if (/car paint/i.test(n)) return paintMat;
          if (/glass|stuklo/i.test(n)) return glassMat;
          if (/chrome|rims|steel/i.test(n)) return chromeMat;
          if (/^far$/i.test(n)) return headLightMat;
          if (/led red/i.test(n)) return tailLightMat;
          if (/tyre/i.test(n)) { const tm = m.clone(); tm.roughness = 0.82; tm.metalness = 0.05; return tm; }
          return m;
        });
        o.material = Array.isArray(o.material) ? nextMats : nextMats[0];
        if (/guma|wheel|rim/i.test(o.name || '')) wheels.push(o);
      });
      wrapper.add(clone);

      // Soft realistic dark contact shadow directly under chassis
      const contactSh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 5.1),
        new THREE.MeshBasicMaterial({ color: 0x040303, transparent: true, opacity: 0.58, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })
      );
      contactSh.rotation.x = -Math.PI / 2; contactSh.position.y = 0.04;
      wrapper.add(contactSh);

      // Subtle glowing headlights & red LED taillights (+ volumetric headlight beams on Hero BMW!)
      [-0.7, 0.7].forEach((hx) => {
        const hGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xfff2cc, transparent: true, opacity: isHero ? 0.85 : 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
        hGlow.scale.set(isHero ? 1.25 : 0.9, isHero ? 1.25 : 0.9, 1); hGlow.position.set(hx, 0.65, 2.34);
        const tGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff2230, transparent: true, opacity: isHero ? 0.78 : 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
        tGlow.scale.set(isHero ? 1.05 : 0.82, isHero ? 1.05 : 0.82, 1); tGlow.position.set(hx, 0.72, -2.32);
        wrapper.add(hGlow, tGlow);
        if (isHero) {
          const beam = new THREE.Mesh(new THREE.ConeGeometry(1.1, 7.0, 12, 1, true), new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xfff2cc, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
          beam.rotation.x = -Math.PI / 2 + 0.08; beam.position.set(hx, 0.44, 5.7);
          wrapper.add(beam);
        }
      });

      if (isPolice) {
        const barBase = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.22), this.mats.ironDark);
        barBase.position.set(0, 1.38, 0.05);
        const redGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xff2838, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
        redGlow.scale.set(1.5, 1.5, 1); redGlow.position.set(-0.28, 1.44, 0.05);
        const blueGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0x2884ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
        blueGlow.scale.set(1.5, 1.5, 1); blueGlow.position.set(0.28, 1.44, 0.05);
        wrapper.add(barBase, redGlow, blueGlow);
        this.policeLightBars.push({ redGlow, blueGlow, phase: Math.random() * 6 });
      }
      return { wrapper, wheels };
    };

    // ---- 1. HERO DRIVABLE BMW PARKED PROMINENTLY AT STATION 1 ----
    const hero = buildRealisticCarInstance(BMW_PAINTS[0].hex, true, false);
    this.bmwRoot = hero.wrapper;
    this.bmwWheels = hero.wheels;

    // Open-Top Cockpit Passenger Anchor so Bobs / Anas literally rides BESIDE you!
    this.bmwPassengerSlot.position.set(0.42, 0.34, -0.18);
    this.bmwRoot.add(this.bmwPassengerSlot);

    const bmwBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('سيارة BMW الرياضية', 'اضغط للقيادة مع المرشد في باريس', '#78d2ff'), transparent: true, depthWrite: false }));
    bmwBadge.scale.set(2.05, 0.56, 1); bmwBadge.position.set(0, 2.05, 0);
    this.bmwBadge = bmwBadge; this.bmwRoot.add(bmwBadge);

    const bmwHit = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 5.2), new THREE.MeshBasicMaterial({ visible: false }));
    bmwHit.position.y = 1.1; bmwHit.userData.interactId = 'bmw'; this.bmwRoot.add(bmwHit);

    this.bmwRoot.position.copy(this.bmwPos);
    this.bmwRoot.rotation.y = this.bmwYaw;
    this.bmwLoaded = true;
    this.scene.add(this.bmwRoot);
    this.renderer.shadowMap.needsUpdate = true;

    this.interactables.push({
      id: 'bmw', titleAr: 'سيارة BMW الرياضية في باريس',
      badgeAr: '🚗 اضغط لركوب وقيادة سيارة BMW مع المرشد في باريس',
      mesh: bmwHit, worldPos: this.bmwPos, radius: 12.0,
    });

    // ---- 2. REALISTIC METALLIC PARISIAN BOULEVARD TRAFFIC (ZERO KENNEY TOYS!) ----
    const trafficSpecs = [
      // Parked realistic Police Nationale Metallic Navy Interceptor outside Police HQ!
      { hex: 0x132c5c, laneX: -25.8, z: 176, dirZ: -1, spd: 0, police: true, parked: true },
      // Moving realistic metallic luxury sedans/roadsters across all 4 boulevard lanes
      { hex: 0x132c5c, laneX: -19.5, z: 410, dirZ: -1, spd: 13.5, police: true },
      { hex: 0x262930, laneX: -19.5, z: 270, dirZ: -1, spd: 11.8, police: false },
      { hex: 0xbcc4cf, laneX: -19.5, z: 125, dirZ: -1, spd: 12.2, police: false },
      { hex: 0x0e1014, laneX: -12.6, z: 80, dirZ: 1, spd: 13.0, police: false },
      { hex: 0xe6eaf0, laneX: -12.6, z: 255, dirZ: 1, spd: 11.5, police: false },
      { hex: 0x18253a, laneX: 12.6, z: 240, dirZ: -1, spd: 12.6, police: false },
      { hex: 0x2f333b, laneX: 19.5, z: 95, dirZ: 1, spd: 12.0, police: false },
      { hex: 0xc2c8d2, laneX: 19.5, z: 310, dirZ: 1, spd: 12.8, police: false },
    ];
    const picked = this.isMobile ? trafficSpecs.filter((_, idx) => idx === 0 || idx % 2 === 1) : trafficSpecs;
    picked.forEach((sp) => {
      const inst = buildRealisticCarInstance(sp.hex, false, sp.police);
      inst.wrapper.position.set(sp.laneX, 0, sp.z);
      inst.wrapper.rotation.y = sp.dirZ > 0 ? 0 : Math.PI;
      this.scene.add(inst.wrapper);
      if (!sp.parked) {
        this.trafficVehicles.push({ root: inst.wrapper, wheels: inst.wheels, laneX: sp.laneX, z: sp.z, dirZ: sp.dirZ, speed: sp.spd * 0.7, maxSpeed: sp.spd });
      }
    });
  }

  /* ==================== PASSENGER RIDE: GUIDE HOPS INTO BMW & STEPS OUT BESIDE YOU AT LOUVRE! ==================== */
  seatGuideInsideBmw() {
    if (!this.bmwRoot) return;
    // Reparent guideRoot directly inside BMW open-top passenger seat!
    this.bmwPassengerSlot.add(this.guideRoot);
    if (this.activeGuideType === 'anas') {
      this.guideRoot.position.set(0.05, -0.38, -0.05);
      this.guideRoot.scale.setScalar(0.84);
    } else {
      this.guideRoot.position.set(0.02, 0.24, 0.08);
      this.guideRoot.scale.setScalar(0.82);
    }
    this.guideRoot.rotation.set(0, 0, 0);
    if (this.guideBeaconRing) this.guideBeaconRing.visible = false;
    if (this.bobsShadowDisc) this.bobsShadowDisc.visible = false;
    if (this.anasShadowDisc) this.anasShadowDisc.visible = false;
    if (this.bobsBadge) this.bobsBadge.visible = false;
    if (this.anasBadge) this.anasBadge.visible = false;
  }

  unseatGuideFromBmw(landX, landZ) {
    this.scene.add(this.guideRoot);
    this.guideRoot.scale.setScalar(1.0);
    this.guidePos.set(landX, 0, landZ);
    this.guideRoot.position.copy(this.guidePos);
    if (this.guideBeaconRing) this.guideBeaconRing.visible = true;
    if (this.bobsShadowDisc) this.bobsShadowDisc.visible = true;
    if (this.anasShadowDisc) this.anasShadowDisc.visible = true;
    if (this.bobsBadge) this.bobsBadge.visible = true;
    if (this.anasBadge) this.anasBadge.visible = true;
  }

  enterBmwDrive() {
    if (!this.bmwLoaded) return false;
    this.stopDroneTour(); this.stopBoulevardCabRide(); this.setGuidePhase('idle');
    this.inHouseUpperFloor = false; this.playerFloorY = 0;
    this.drivingBmw = true;
    this.bmwSpeed = 0;
    // If BMW was parked in front-3/4 showcase pose at Station 1, orient cleanly North toward the Louvre!
    if (this.bmwPos.z > 362 && Math.cos(this.bmwYaw) > 0) {
      this.bmwYaw = Math.PI;
      if (this.bmwRoot) this.bmwRoot.rotation.y = this.bmwYaw;
    }
    if (this.bmwBadge) this.bmwBadge.visible = false;
    // Guide hops right into the BMW passenger seat beside you!
    this.seatGuideInsideBmw();
    if (this.callbacks.onBmwDriveChange) this.callbacks.onBmwDriveChange(true);
    return true;
  }

  exitBmwDrive() {
    if (!this.drivingBmw) return;
    this.drivingBmw = false;
    this.bmwSpeed = 0;
    if (this.bmwBadge) this.bmwBadge.visible = true;

    // Step out onto the Champs-Élysées promenade or Louvre Plaza right beside the parked BMW!
    const exitZ = Math.max(18.5, Math.min(420, this.bmwPos.z));
    const exitX = exitZ <= 32 ? Math.max(-5.0, Math.min(5.0, this.bmwPos.x > 0 ? 3.0 : -3.0)) : (this.bmwPos.x > 0 ? 4.4 : -4.4);
    this.playerPos.set(exitX, 1.68, exitZ);
    this.resolveCollisions(this.playerPos);

    // Sync currentWaypointIdx to closest landmark so arriving at the Louvre immediately puts you & guide at Station 5!
    let bestIdx = 0, bestD = Infinity;
    for (let i = 0; i < STORY_WAYPOINTS.length; i++) {
      const d = Math.abs(exitZ - STORY_WAYPOINTS[i].z);
      if (d < bestD) { bestD = d; bestIdx = i; }
    }
    this.currentWaypointIdx = bestIdx;

    // Guide steps right out beside you on the sidewalk!
    const gLandX = Math.max(-5.8, Math.min(5.8, exitX + (exitX >= 0 ? -1.8 : 1.8)));
    const gLandZ = Math.max(14.0, exitZ - 2.6);
    this.unseatGuideFromBmw(gLandX, gLandZ);

    this.targetYaw = 0; this.playerYaw = 0; this.targetPitch = 0.03; this.playerPitch = 0.03;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(bestIdx, STORY_WAYPOINTS[bestIdx]);
    if (this.callbacks.onBmwDriveChange) this.callbacks.onBmwDriveChange(false, bestIdx, STORY_WAYPOINTS[bestIdx]);
  }

  cycleBmwPaint() {
    this.bmwPaintIdx = (this.bmwPaintIdx + 1) % BMW_PAINTS.length;
    const p = BMW_PAINTS[this.bmwPaintIdx];
    this.bmwPaintMats.forEach((m) => m.color.setHex(p.hex));
    return p;
  }

  /* ==================== WORKING PARISIAN TRAFFIC LIGHTS ==================== */
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

      const rMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff2820, emissiveIntensity: 3.2 });
      const yMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffb800, emissiveIntensity: 3.2 });
      const gMat = new THREE.MeshStandardMaterial({ color: 0x22e568, emissive: 0x1ed860, emissiveIntensity: 3.0 });
      const lights = [];

      [[-8.3, -1], [8.3, 1]].forEach(([px, dir]) => {
        const pole = new THREE.Group(); pole.position.set(px, 0, z + dir * 4.5);
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 5.6, 8), this.mats.parisGreenIron); mast.position.y = 2.8;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 0.1), this.mats.parisGreenIron); arm.position.set(dir * 2.5, 5.4, 0);
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.52, 1.55, 0.44), this.mats.ironDark); box.position.set(dir * 4.2, 4.9, 0);
        const makeLens = (ly, mat, sideZ) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.16, 14), mat); m.position.set(dir * 4.2, 4.9 + ly, sideZ); if (sideZ < 0) m.rotation.y = Math.PI; return m; };
        const r1 = makeLens(0.46, rMat, 0.23), r2 = makeLens(0.46, rMat, -0.23);
        const y1 = makeLens(0.0, yMat, 0.23), y2 = makeLens(0.0, yMat, -0.23);
        const g1 = makeLens(-0.46, gMat, 0.23), g2 = makeLens(-0.46, gMat, -0.23);
        pole.add(mast, arm, box, r1, r2, y1, y2, g1, g2); this.scene.add(pole);
        lights.push({ r: [r1, r2], y: [y1, y2], g: [g1, g2] });
      });

      this.intersections.push({ z, timer: offset, state: 'green', lights, mats: { rMat, yMat, gMat, redOff, yelOff, grnOff } });
    });
  }

  /* ==================== REFINED DARK BRONZE 128M EIFFEL TOWER ==================== */
  buildBronzeEiffelTower() {
    const tower = new THREE.Group(); tower.position.set(-86, 0, 135); tower.scale.setScalar(1.42);
    [[-10.5, -10.5], [10.5, -10.5], [10.5, 10.5], [-10.5, 10.5]].forEach(([lx, lz]) => {
      const p0 = new THREE.Vector3(lx, 0, lz), p1 = new THREE.Vector3(lx * 0.48, 22, lz * 0.48), p2 = new THREE.Vector3(lx * 0.24, 42, lz * 0.24);
      [[p0, p1, 1.15, 0.78], [p1, p2, 0.74, 0.46]].forEach(([a, b, r1, r2]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, a.distanceTo(b), 6), this.mats.eiffelBronze);
        leg.position.copy(a).lerp(b, 0.5); leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        tower.add(leg);
      });
    });
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(15.2, 21), this.mats.eiffelLattice);
      panel.position.set(Math.sin(rot) * 7.6, 11, Math.cos(rot) * 7.6); panel.rotation.y = rot; panel.rotation.x = -0.22;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.36, 8, 24, Math.PI), this.mats.eiffelBronze);
      arch.position.set(Math.sin(rot) * 9.8, 5.2, Math.cos(rot) * 9.8); arch.rotation.y = rot;
      tower.add(panel, arch);
    });
    const d1 = new THREE.Mesh(new THREE.BoxGeometry(14.4, 2.0, 14.4), this.mats.eiffelBronze); d1.position.y = 22.4;
    const d1Rim = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.32, 14.8), this.mats.goldGlow); d1Rim.position.y = 23.5;
    const d2 = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.6, 8.2), this.mats.eiffelBronze); d2.position.y = 42.4;
    const d2Rim = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.28, 8.6), this.mats.goldGlow); d2Rim.position.y = 43.3;
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 3.0, 36, 4), this.mats.eiffelLattice); spire.rotation.y = Math.PI / 4; spire.position.y = 61;
    const d3 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 3.2), this.mats.goldGlow); d3.position.y = 80;
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.36, 11, 8), this.mats.gold); ant.position.y = 86;
    tower.add(d1, d1Rim, d2, d2Rim, spire, d3, ant);

    const beacon = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe49e, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false }));
    beacon.scale.set(9.0, 9.0, 1); beacon.position.y = 89.5; this.eiffelBeacon = beacon; tower.add(beacon);

    this.eiffelSearchlightRig = new THREE.Group(); this.eiffelSearchlightRig.position.y = 88.5;
    this.eiffelSearchlightMat = new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xfff1c4, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false });
    [0, Math.PI].forEach((rot) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(16, 145, 16, 1, true), this.eiffelSearchlightMat);
      cone.rotation.z = Math.PI / 2 - 0.14; cone.rotation.y = rot; cone.position.set(Math.cos(rot) * 70, -8, Math.sin(rot) * 70);
      this.eiffelSearchlightRig.add(cone);
    });
    tower.add(this.eiffelSearchlightRig);

    for (let i = 0; i < 40; i++) {
      const h = 10 + (i / 40) * 72, r = THREE.MathUtils.lerp(9.6, 1.2, h / 82), ang = i * 1.45;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe6a6, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
      sp.position.set(Math.cos(ang) * r, h, Math.sin(ang) * r); sp.scale.set(1.2, 1.2, 1); tower.add(sp);
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

  /* ==================== OBSTRUCTION-FREE LOUVRE GRANDE GALERIE ==================== */
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
    [-1.76, 1.76].forEach((x) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, hallLen - 0.6), this.mats.goldOverlay); b.rotation.x = -Math.PI / 2; b.position.set(x, 0.052, hallMidZ); this.scene.add(b); });
    [-6.0, -80.4].forEach((tz) => { const bar = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.08, 0.36), this.mats.gold); bar.position.set(0, 0.04, tz); this.scene.add(bar); });

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
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 10.8), new THREE.MeshBasicMaterial({ map: this.beamTex, transparent: true, opacity: 0.26, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
      beam.position.set(0, 5.0, z); beam.rotation.z = 0.14; this.scene.add(beam);
    });
  }

  buildFiveHiddenMuseumSeals() {
    const discGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 22);
    const rimGeo = new THREE.TorusGeometry(0.32, 0.035, 8, 28);
    HIDDEN_SEALS_DATA.forEach((s, i) => {
      const baseY = s.y || 1.35;
      const grp = new THREE.Group(); grp.position.set(s.x, baseY, s.z);
      const disc = new THREE.Mesh(discGeo, this.mats.waxCrimson); disc.rotation.x = Math.PI / 2;
      const rim = new THREE.Mesh(rimGeo, this.mats.goldGlow);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: 0xffe084, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.scale.set(1.2, 1.2, 1);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.95, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.interactId = s.id; grp.add(disc, rim, glow, hit); this.scene.add(grp);
      this.hiddenSeals.push({ ...s, baseY, mesh: grp, hit, collected: false, phase: i * 1.3 });
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

  createFramedGalleryPainting(imagePath, secretAr, code, w = 3.7, h = 2.75) {
    const group = new THREE.Group(); const border = 0.22;
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
    const spotCone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 4.2, 14, 1, true), new THREE.MeshBasicMaterial({ map: this.beamTex, color: 0xffe6b0, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
    spotCone.position.set(0, 0.1, 0.65); spotCone.rotation.x = 0.14;
    group.add(outerFrame, innerLip, art, lampArm, lampHood, spotCone);
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

      if (!this.isMobile) {
        const spot = new THREE.SpotLight(0xffe7b8, 22, 16, Math.PI / 5, 0.5, 1.4);
        spot.position.set(st.wallX * 0.42, 8.6, st.z); spot.target.position.set(st.wallX, 3.7, st.z);
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
    const eHit = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 2.6), new THREE.MeshBasicMaterial({ visible: false })); eHit.position.y = 1.4; eHit.userData.interactId = 'easel';
    easel.add(backLeg, tray, miniBoard, miniArt, eHit);
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
    const vHit = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 2.5), new THREE.MeshBasicMaterial({ visible: false })); vHit.position.y = 1.6; vHit.userData.interactId = 'vault';
    vaultGrp.add(ped, cloth, boxBody, boxRim, boxLid, envOrbit, vHit);
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
    manGrp.add(mPed, steleFrame, stele, manFace, manFaceBack, mHit);
    this.circleColliders.push({ x: 4.6, z: -75, r: 1.3 }); this.scene.add(manGrp);
    this.interactables.push({ id: 'manifesto', titleAr: 'الرسالة الأهم في ختام الرحلة', badgeAr: '★ اضغط لقراءة الرسالة الأهم وكبسولة الطمأنينة', mesh: mHit, worldPos: new THREE.Vector3(4.6, 1.7, -75), radius: 7.8 });
  }

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

      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      const shadowGeo = new THREE.CircleGeometry(0.44, 14);

      const anas = SkeletonUtils.clone(avatarGltf.scene);
      const jerseyTex = createAnasJerseyTexture();
      let headBone = null;

      anas.traverse((o) => {
        if (o.isBone && o.name === 'Head') headBone = o;
        if (o.isMesh) {
          o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false;
          if (o.name === 'Mesh' || o.material?.name === 'Wolf3D_Headwear') o.visible = false;
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
          const m = new THREE.Mesh(curlGeo, curlMat); m.position.set(x, y, z); m.scale.set(s, s * 0.92, s); m.rotation.set(idx * 0.7, idx * 1.1, idx * 0.4); curlGrp.add(m);
        });
        const chinArc = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.006, 6, 14, Math.PI * 0.82), curlMat);
        chinArc.rotation.set(Math.PI * 0.56, 0, Math.PI * 0.09); chinArc.position.set(0, -0.026, 0.052);
        curlGrp.add(chinArc); headBone.add(curlGrp);
      }

      this.anasBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('أنس حبيب', 'المرشد السياحي الخاص ليوسف', '#76d0ff'), transparent: true, depthWrite: false }));
      this.anasBadge.scale.set(1.5, 0.42, 1); this.anasBadge.position.set(0, 2.26, 0);
      this.anasShadowDisc = new THREE.Mesh(shadowGeo, shadowMat); this.anasShadowDisc.rotation.x = -Math.PI / 2; this.anasShadowDisc.position.y = 0.045;
      anas.scale.setScalar(1.04); this.anasGroup.add(anas, this.anasBadge, this.anasShadowDisc);

      this.anasMixer = new THREE.AnimationMixer(anas);
      if (walkClip) { this.anasWalkAction = this.anasMixer.clipAction(walkClip); this.anasWalkAction.setEffectiveTimeScale(1.12); }
      if (idleClip) { this.anasIdleAction = this.anasMixer.clipAction(idleClip); this.anasIdleAction.play(); }
      this.anasLoaded = true;

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
        { x: -4.8, z0: 368, z1: 272, speed: 1.32, walking: true, scale: 0.99 },
        { x: 4.8, z0: 255, z1: 155, speed: 1.24, walking: true, scale: 0.98 },
        { x: -5.0, z0: 110, z1: 22, speed: 1.2, walking: true, scale: 0.97 },
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
    const count = this.isMobile ? 28 : 56;
    this.leafInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 0.14), new THREE.MeshBasicMaterial({ color: 0xe4be6c, side: THREE.DoubleSide, transparent: true, opacity: 0.65 }), count);
    this.leafDummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) this.fallingLeaves.push({ x: (Math.random() - 0.5) * 34, y: 1 + Math.random() * 14, z: (Math.random() - 0.5) * 60, spd: 0.38 + Math.random() * 0.55, ph: Math.random() * Math.PI * 2 });
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
    this.rainDrops = new THREE.LineSegments(rGeo, new THREE.LineBasicMaterial({ color: 0xbcdcf5, transparent: true, opacity: 0.45 }));
    this.rainDrops.visible = false; this.scene.add(this.rainDrops);
  }

  buildPawPrintPool() {
    const geo = new THREE.PlaneGeometry(0.32, 0.32);
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.pawTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.rotation.x = -Math.PI / 2; m.visible = false; this.scene.add(m); this.pawPrints.push({ mesh: m, life: 0 });
    }
  }

  spawnPawPrint(pos, yaw) {
    if (this.activeGuideType !== 'bobs' || this.drivingBmw) return;
    const slot = this.pawPrints[this.pawIdx]; this.pawIdx = (this.pawIdx + 1) % this.pawPrints.length;
    const side = (this.pawIdx % 2 === 0 ? 1 : -1) * 0.13;
    slot.mesh.position.set(pos.x + Math.cos(yaw) * side, 0.058, pos.z - Math.sin(yaw) * side);
    slot.mesh.rotation.set(-Math.PI / 2, 0, yaw); slot.life = 1.0; slot.mesh.visible = true;
  }

  /* ==================== 40-BONE GOLDEN PERSIAN CAT «القطة بوبس» (SUBTLE REFINED GROUNDING) ==================== */
  loadAnatomicallyFixedBobsPersianCat() {
    this.guideRoot.position.copy(this.guidePos);
    this.guideRoot.add(this.bobsGroup, this.anasGroup);
    this.scene.add(this.guideRoot);

    // Subtle ultra-refined translucent aura (no thick cartoon white ring!)
    const beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.53, 32), new THREE.MeshBasicMaterial({ color: 0xe6c16a, transparent: true, opacity: 0.24, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    beaconRing.rotation.x = -Math.PI / 2; beaconRing.position.y = 0.054;
    this.guideBeaconRing = beaconRing; this.guideRoot.add(beaconRing);

    const gHit = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.0, 10), new THREE.MeshBasicMaterial({ visible: false }));
    gHit.position.y = 1.0; gHit.userData.interactId = 'guide'; this.guideRoot.add(gHit); this.guideHitMesh = gHit;

    // Soft realistic contact shadow right under Bobs' paws
    this.bobsShadowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.48, 20), new THREE.MeshBasicMaterial({ color: 0x050302, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    this.bobsShadowDisc.rotation.x = -Math.PI / 2; this.bobsShadowDisc.position.y = 0.045;
    this.bobsBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: createGuideBadgeTexture('القطة بوبس', 'مرشدة جولة باريس واللوفر', '#f2cf78'), transparent: true, depthWrite: false }));
    this.bobsBadge.scale.set(1.25, 0.36, 1); this.bobsBadge.position.set(0, 1.22, 0);
    this.bobsGroup.add(this.bobsShadowDisc, this.bobsBadge);

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
            m.map = coatTex; m.roughness = isEye ? 0.08 : 0.78; m.metalness = isEye ? 0.12 : 0.02;
            if (!isEye) { m.emissive = new THREE.Color(0x3a2410); m.emissiveIntensity = 0.12; }
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

  resolveCollisions(pos) {
    const playerR = 0.55;
    const inHouseFootprint = pos.x < -7.2 && pos.x >= -40.5 && pos.z >= 291.6 && pos.z <= 308.4;
    if (inHouseFootprint) {
      pos.x = Math.max(-40.2, Math.min(-7.2, pos.x));
      pos.z = Math.max(291.8, Math.min(308.2, pos.z));
      if (pos.x < -36.5 && pos.z <= 306.5 && pos.z >= 293.0) {
        const stairT = Math.max(0, Math.min(1, (306.0 - pos.z) / 11.5));
        this.playerFloorY = stairT * 4.65; this.inHouseUpperFloor = stairT > 0.72;
      } else if (this.inHouseUpperFloor) {
        pos.x = Math.max(-40.2, Math.min(-21.8, pos.x)); this.playerFloorY = 4.65;
      } else this.playerFloorY = 0;
      pos.y = this.playerFloorY + 1.68; return;
    }

    this.inHouseUpperFloor = false; this.playerFloorY = 0; pos.y = 1.68;
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

  /* ==================== CALM, SERENE PAUSE-AND-EXPLAIN GUIDED TOUR ==================== */
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
    if (dist < 6.5 && this.guidePhase !== 'explaining') this.enterExplainState(this.currentWaypointIdx, false);
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

  enterExplainState(idx, gentleLook = true) {
    const wp = STORY_WAYPOINTS[idx];
    this.setGuidePhase('explaining');
    if (wp) {
      // Gentle, comfortable camera drift ONLY (never jarring snap!)
      if (gentleLook && !this.isLooking) {
        const lx = wp.lookAtX !== undefined ? wp.lookAtX : wp.guideX;
        const lz = wp.lookAtZ !== undefined ? wp.lookAtZ : wp.z - 5;
        this.targetYaw = Math.atan2(-(lx - this.playerPos.x), -(lz - this.playerPos.z));
        this.targetPitch = idx <= 4 ? 0.04 : 0.0;
      }
      if (this.callbacks.onTourStopArrive) this.callbacks.onTourStopArrive(idx, wp);
    }
  }

  startBoulevardCabRide() {
    this.stopDroneTour(); if (this.drivingBmw) this.exitBmwDrive(); this.setGuidePhase('idle');
    this.inHouseUpperFloor = false; this.playerFloorY = 0; this.cabRideActive = true;
    if (this.playerPos.z < 55) this.playerPos.set(0, 1.68, 392);
    this.targetYaw = 0; this.targetPitch = 0.03;
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
    const zOffset = safeIdx === 0 ? 5.5 : safeIdx <= 3 ? 6.0 : safeIdx === 4 ? 4.5 : safeIdx === STORY_WAYPOINTS.length - 1 ? 2.6 : 3.2;
    this.playerPos.set(safeIdx === 0 ? -1.2 : wp.x, 1.68, wp.z + zOffset);
    this.resolveCollisions(this.playerPos);
    this.guidePos.set(wp.guideX, 0, wp.guideZ); this.guideRoot.position.copy(this.guidePos);
    const lx = wp.lookAtX !== undefined ? wp.lookAtX : wp.guideX;
    const lz = wp.lookAtZ !== undefined ? wp.lookAtZ : wp.z - 4;
    this.targetYaw = safeIdx === 0 ? 0.06 : Math.atan2(-(lx - this.playerPos.x), -(lz - this.playerPos.z));
    this.playerYaw = this.targetYaw;
    this.targetPitch = safeIdx <= 4 ? 0.015 : 0.0; this.playerPitch = this.targetPitch;
    if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(safeIdx, wp);
    if (triggerExplain) this.enterExplainState(safeIdx, false); else this.setGuidePhase('idle');
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
    const gx = this.drivingBmw ? this.bmwPos.x : this.guidePos.x;
    const gz = this.drivingBmw ? this.bmwPos.z : this.guidePos.z;
    const yaw = this.drivingBmw ? this.bmwYaw - Math.PI : this.playerYaw;
    const distToLouvre = Math.max(0, Math.round(pz - 7));
    const deg = (((-yaw * 180) / Math.PI) % 360 + 360) % 360;
    const headingAr = deg < 45 || deg >= 315 ? 'شمال • نحو اللوفر' : deg < 135 ? 'شرق • جاليري باريس' : deg < 225 ? 'جنوب • قوس النصر' : 'غرب • برج إيفل';
    return {
      px, pz, yaw, gx, gz, guideType: this.activeGuideType,
      seals: this.hiddenSeals, distToLouvre, headingAr, weather: this.weatherMode,
      guidePhase: this.guidePhase, drivingBmw: this.drivingBmw, bmwKmh: Math.round(Math.abs(this.bmwSpeed) * 3.6),
      inHouseUpperFloor: this.inHouseUpperFloor,
    };
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 900;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      this.camera.aspect = aspect; this.baseFov = aspect < 0.85 ? 64 : 52;
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
        if (this.guideHitMesh && !this.drivingBmw) targets.push(this.guideHitMesh);
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
    const damp = 1 - Math.exp(-7.2 * dt);

    const speedFovBoost = this.drivingBmw ? Math.min(12, Math.abs(this.bmwSpeed) * 0.35) : 0;
    const desiredFov = this.zoomed ? 24 : this.baseFov + speedFovBoost;
    if (Math.abs(this.camera.fov - desiredFov) > 0.08) {
      this.camera.fov += (desiredFov - this.camera.fov) * damp;
      this.camera.updateProjectionMatrix();
    }

    // ---- 1. TRAFFIC LIGHTS & REALISTIC METALLIC TRAFFIC ----
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
        }
      }
    }

    for (const pb of this.policeLightBars) {
      const flash = Math.sin(t * 14 + pb.phase) > 0;
      pb.redGlow.material.opacity = flash ? 0.96 : 0.08;
      pb.blueGlow.material.opacity = flash ? 0.08 : 0.96;
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
        if (gap > 0 && gap < 15) targetSpd = gap < 9.5 ? 0 : Math.min(targetSpd, other.speed);
      }
      v.speed += (targetSpd - v.speed) * Math.min(1, (targetSpd < v.speed ? 14 : 6.5) * dt);
      v.z += v.dirZ * v.speed * dt;
      if (v.dirZ < 0 && v.z < 38) v.z = 444;
      if (v.dirZ > 0 && v.z > 444) v.z = 38;
      v.root.position.z = v.z;
      if (v.speed > 0.1 && Math.abs(v.z - this.camera.position.z) < 130) {
        const spin = v.speed * dt * 2.1;
        for (const w of v.wheels) w.rotation.x += spin;
      }
    }

    // ---- 2. GTA-STYLE DRIVABLE HERO BMW WITH PASSENGER GUIDE! ----
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
      else if (Math.abs(throttle) > 0.05) this.bmwSpeed = Math.max(-10, Math.min(34, this.bmwSpeed + throttle * (throttle > 0 ? 18.5 : 14.0) * dt));
      else { this.bmwSpeed *= Math.max(0, 1 - 1.9 * dt); if (Math.abs(this.bmwSpeed) < 0.08) this.bmwSpeed = 0; }

      const steerFactor = Math.min(1, Math.abs(this.bmwSpeed) / 3.5);
      this.bmwSteer += (-steerIn * 0.45 - this.bmwSteer) * Math.min(1, 8 * dt);
      this.bmwYaw += this.bmwSteer * (this.bmwSpeed >= 0 ? 1 : -1) * steerFactor * 2.4 * dt;

      this.bmwPos.x = Math.max(-22.2, Math.min(22.2, this.bmwPos.x + Math.sin(this.bmwYaw) * this.bmwSpeed * dt));
      this.bmwPos.z = Math.max(20.0, Math.min(426.0, this.bmwPos.z + Math.cos(this.bmwYaw) * this.bmwSpeed * dt));

      this.bmwRoot.position.copy(this.bmwPos);
      this.bmwRoot.rotation.y = this.bmwYaw;
      this.bmwBrakeMats.forEach((m) => { m.emissiveIntensity = this.bmwBraking ? 4.8 : 2.3; });
      if (Math.abs(this.bmwSpeed) > 0.1) { const wSpin = this.bmwSpeed * dt * 2.4; for (const w of this.bmwWheels) w.rotation.x += wSpin; }

      const desiredCamX = this.bmwPos.x - Math.sin(this.bmwYaw) * 7.2;
      const desiredCamZ = this.bmwPos.z - Math.cos(this.bmwYaw) * 7.2;
      this.camera.position.lerp(this._tmpLook.set(desiredCamX, 2.85, desiredCamZ), 1 - Math.exp(-7.5 * dt));
      this.camera.lookAt(this.bmwPos.x + Math.sin(this.bmwYaw) * 6, 1.32, this.bmwPos.z + Math.cos(this.bmwYaw) * 6);
      this.playerPos.set(this.bmwPos.x, 1.68, this.bmwPos.z);

      // Update live station while driving so passenger guide always knows where you are!
      let bestIdx = this.currentWaypointIdx, bestD = Infinity;
      for (let i = 0; i <= 4; i++) { const d = Math.abs(this.bmwPos.z - STORY_WAYPOINTS[i].z); if (d < bestD) { bestD = d; bestIdx = i; } }
      if (bestIdx !== this.currentWaypointIdx) {
        this.currentWaypointIdx = bestIdx;
        if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(bestIdx, STORY_WAYPOINTS[bestIdx]);
      }
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
          movedStep = Math.min(rem, 24.0 * dt); this.playerPos.z -= movedStep;
          this.playerPos.x += (0 - this.playerPos.x) * Math.min(1, 3 * dt);
          if (!this.isLooking) { this.targetYaw += (0 - this.targetYaw) * Math.min(1, 2.5 * dt); this.targetPitch += (0.03 - this.targetPitch) * Math.min(1, 2.5 * dt); }
        } else { this.stopBoulevardCabRide(); this.currentWaypointIdx = 4; this.enterExplainState(4, true); }
      } else if (this.guidePhase === 'walking') {
        const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
        const targetX = Math.abs(wp.z - this.playerPos.z) > 4.0 ? 0 : wp.x;
        const dx = targetX - this.playerPos.x, dz = wp.z - this.playerPos.z, dist = Math.hypot(dx, dz);
        if (!this.isLooking) {
          const desiredYaw = Math.atan2(-dx, -dz);
          let diff = desiredYaw - this.targetYaw;
          while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
          this.targetYaw += diff * (1 - Math.exp(-3.2 * dt));
          this.targetPitch += (0.015 - this.targetPitch) * (1 - Math.exp(-2.8 * dt));
        }
        const moveRate = this.playerPos.z > 24 ? (this.cruiseFast ? 22.0 : 13.5) : (this.cruiseFast ? 8.2 : 5.4);
        if (dist > 2.2) {
          movedStep = Math.min(dist, moveRate * dt);
          this.playerPos.x += (dx / dist) * movedStep; this.playerPos.z += (dz / dist) * movedStep;
        } else this.enterExplainState(this.currentWaypointIdx, true);
      } else {
        const mag = Math.hypot(fwd, str);
        if (mag > 0.05) {
          const normF = fwd / Math.max(1, mag), normS = str / Math.max(1, mag);
          movedStep = (this.playerPos.z > 24 ? (this.cruiseFast ? 18.0 : 10.2) : (this.cruiseFast ? 8.0 : 6.0)) * dt;
          const sinY = Math.sin(this.playerYaw), cosY = Math.cos(this.playerYaw);
          this.playerPos.x += (-sinY * normF + cosY * normS) * movedStep;
          this.playerPos.z += (-cosY * normF - sinY * normS) * movedStep;
        }
      }

      if (movedStep > 0) {
        this.walkBobPhase += movedStep * (this.playerPos.z > 24 ? 1.1 : 2.0);
        this.footstepAccum += movedStep;
        if (this.footstepAccum > (this.playerPos.z > 24 ? 3.2 : 2.1)) {
          this.footstepAccum = 0;
          if (this.callbacks.onFootstep) this.callbacks.onFootstep(this.playerPos.z < -6 ? 'wood' : 'stone');
        }
      }
      this.resolveCollisions(this.playerPos);
      this.playerYaw += (this.targetYaw - this.playerYaw) * damp;
      this.playerPitch += (this.targetPitch - this.playerPitch) * damp;
      this.camera.position.set(this.playerPos.x, this.playerPos.y + Math.sin(this.walkBobPhase) * 0.022, this.playerPos.z);
      this.camera.rotation.order = 'YXZ'; this.camera.rotation.y = this.playerYaw; this.camera.rotation.x = this.playerPitch;
    } else {
      // Calm golden-hour framing of Hero BMW, Haussmann Avenue & Eiffel Tower behind Portal!
      this.camera.position.set(this.playerPos.x, this.playerPos.y, this.playerPos.z);
      this.camera.rotation.order = 'YXZ'; this.camera.rotation.y = -0.06 + Math.sin(t * 0.22) * 0.025; this.camera.rotation.x = 0.025;
    }

    for (const d of this.pyramidDoors) {
      const near = (Math.abs(this.playerPos.z - d.worldZ) < 12.0 && Math.abs(this.playerPos.x) < 5.5) || Math.abs(this.guidePos.z - d.worldZ) < 10.5 || (this.droneActive && Math.abs(this.camera.position.z - d.worldZ) < 14);
      d.openAmt += ((near ? 1 : 0) - d.openAmt) * (1 - Math.exp(-6.0 * dt));
      d.leftDoor.position.x = d.closedLeftX - d.openAmt * 1.75;
      d.rightDoor.position.x = d.closedRightX + d.openAmt * 1.75;
    }

    if (!this.enteredLouvreOnce && this.playerPos.z < -7.5) {
      this.enteredLouvreOnce = true; if (this.callbacks.onEnterLouvre) this.callbacks.onEnterLouvre();
    }
    this.playerLantern.position.set(this.camera.position.x, this.camera.position.y + 1.5, this.camera.position.z - 2.4);

    if (this.guidePhase === 'idle' && !this.droneActive && !this.portalPaused && !this.drivingBmw) {
      let bestIdx = this.currentWaypointIdx, bestD = Infinity;
      for (let i = 0; i < STORY_WAYPOINTS.length; i++) { const d = Math.abs(this.playerPos.z - STORY_WAYPOINTS[i].z); if (d < bestD) { bestD = d; bestIdx = i; } }
      if (bestIdx !== this.currentWaypointIdx) {
        this.currentWaypointIdx = bestIdx; if (this.callbacks.onWaypointChange) this.callbacks.onWaypointChange(bestIdx, STORY_WAYPOINTS[bestIdx]);
      }
    }

    let closest = null, minD = Infinity;
    for (const it of this.interactables) {
      if (this.drivingBmw && it.id === 'bmw') continue;
      const d = Math.hypot(this.playerPos.x - it.worldPos.x, this.playerPos.z - it.worldPos.z);
      const dy = Math.abs(this.playerPos.y - it.worldPos.y);
      if (d < it.radius && dy < 3.4 && d < minD) { minD = d; closest = it; }
    }
    if (closest?.id !== this.nearestInteractable?.id) {
      this.nearestInteractable = closest; if (this.callbacks.onProximityChange) this.callbacks.onProximityChange(closest);
    }

    // ---- 3. UNIFIED DUAL 3D TOUR GUIDE (SIDEWALK WALKING OR SEATED IN BMW PASSENGER SEAT!) ----
    let guideMoving = false, guideSpd = 0;
    if (!this.drivingBmw) {
      const wp = STORY_WAYPOINTS[this.currentWaypointIdx];
      const targetGX = this.guidePhase === 'walking' && Math.abs(wp.guideZ - this.guidePos.z) > 4.0 ? 0 : wp.guideX;
      const targetGZ = this.guidePhase === 'explaining' ? wp.guideZ : Math.max(wp.guideZ, this.playerPos.z - 6.8);
      const gdx = targetGX - this.guidePos.x, gdz = targetGZ - this.guidePos.z, gDist = Math.hypot(gdx, gdz);
      if (gDist > 0.35 && !this.portalPaused) {
        const maxGSpd = this.playerPos.z > 24 ? (this.cruiseFast ? 24 : 15.5) : 7.5;
        const step = Math.min(gDist, Math.max(2.8, gDist * 1.65) * dt, maxGSpd * dt);
        this.guidePos.x += (gdx / gDist) * step; this.guidePos.z += (gdz / gDist) * step;
        guideSpd = step / Math.max(0.001, dt);
        this.catStride += step * 3.8; this.catStepAccum += step;
        if (this.catStepAccum > 0.62) { this.catStepAccum = 0; this.spawnPawPrint(this.guidePos, this.guideYaw); }
      }
      this.guideRoot.position.copy(this.guidePos);
      guideMoving = guideSpd > 0.3;
      const desiredGuideYaw = guideMoving
        ? Math.atan2(gdx, gdz)
        : Math.atan2(this.playerPos.x - this.guidePos.x, this.playerPos.z - this.guidePos.z) + (this.activeGuideType === 'bobs' && this.guidePhase !== 'explaining' ? 0.35 : 0);
      let gyDiff = desiredGuideYaw - this.guideYaw;
      while (gyDiff > Math.PI) gyDiff -= Math.PI * 2; while (gyDiff < -Math.PI) gyDiff += Math.PI * 2;
      this.guideYaw += gyDiff * (1 - Math.exp(-6.2 * dt));
      this.guideRoot.rotation.y = this.guideYaw;
      if (this.guideBeaconRing) {
        this.guideBeaconRing.rotation.z = t * 0.9;
        this.guideBeaconRing.material.color.setHex(this.activeGuideType === 'anas' ? 0x76d0ff : 0xe6c16a);
      }
    }

    if (this.anasLoaded && this.activeGuideType === 'anas') {
      this.anasMixer.update(dt);
      const want = guideMoving && !this.drivingBmw ? 'walk' : 'idle';
      if (want !== this.anasCurAnim && this.anasWalkAction && this.anasIdleAction) {
        this.anasCurAnim = want;
        if (want === 'walk') { this.anasWalkAction.reset().fadeIn(0.22).play(); this.anasIdleAction.fadeOut(0.22); }
        else { this.anasIdleAction.reset().fadeIn(0.25).play(); this.anasWalkAction.fadeOut(0.25); }
      }
    }

    this.catStateTimer += dt;
    if (!guideMoving && this.guidePhase !== 'explaining' && !this.drivingBmw) {
      if (this.catState !== 'guide' && this.catStateTimer > this.catStateDur) { this.catState = 'guide'; this.catStateTimer = 0; this.catStateDur = 9 + Math.random() * 5; }
      else if (this.catState === 'guide' && this.catStateTimer > this.catStateDur) { this.catState = Math.random() < 0.5 ? 'groom' : 'play'; this.catStateTimer = 0; this.catStateDur = 5.4; }
    } else this.catState = 'guide';
    this.catYarn.visible = this.activeGuideType === 'bobs' && this.catState === 'play' && !guideMoving && !this.drivingBmw;
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
      } else if (this.guidePhase === 'explaining' || this.drivingBmw) {
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.05 + Math.sin(t * 2.2) * 0.04, Math.sin(t * 1.1) * 0.08, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      } else {
        this.applyWorldBoneRot('Wolf_Neck_02SHJnt_15', -0.04, -0.14 + Math.sin(t * 1.2) * 0.06, 0);
        if (this.catTongue) this.catTongue.scale.setScalar(0.001);
      }
      ['Wolf_Tail_01_02SHJnt_37', 'Wolf_Tail_01_03SHJnt_36', 'Wolf_Tail_01_04SHJnt_35', 'Wolf_Tail_01_05SHJnt_34'].forEach((bn, i) => {
        this.applyWorldBoneRot(bn, i === 0 ? -0.1 : -0.04, Math.sin(t * (guideMoving ? 4.8 : 2.0) - i * 0.55) * (guideMoving ? 0.16 : 0.1), 0);
      });
    }

    for (const p of this.pawPrints) {
      if (p.life > 0) { p.life -= dt * 0.35; p.mesh.material.opacity = Math.max(0, p.life * 0.65); if (p.life <= 0) p.mesh.visible = false; }
    }

    // Subtle organic wind sway on Plane Tree canopies
    for (const tc of this.treeCanopyGroups) {
      tc.grp.rotation.z = Math.sin(t * 1.1 + tc.phase) * 0.018;
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
    if (this.eiffelBeacon) this.eiffelBeacon.scale.setScalar((sparkleBoost ? 12 : 8.5) + Math.sin(t * (sparkleBoost ? 7 : 3.5)) * 1.5);
    if (this.eiffelSearchlightRig) this.eiffelSearchlightRig.rotation.y = t * (sparkleBoost ? 1.1 : 0.55);
    for (const sp of this.eiffelSparkles) {
      const spd = sparkleBoost ? sp.speed * 2.6 : sp.speed;
      const baseOp = sparkleBoost ? 0.35 : (this.timeOfDay === 'day' ? 0.04 : 0.2);
      sp.sprite.material.opacity = baseOp + Math.max(0, Math.sin(t * spd + sp.phase)) * (sparkleBoost ? 0.65 : 0.55);
      sp.sprite.scale.setScalar(sparkleBoost ? 2.1 : 1.15);
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
