/**
 * Sacred Vedic Panchang & Astronomical Muhurta Engine
 * Calculates authentic local solar/lunar astronomical timings completely on-device
 * with zero external API dependencies or privacy tracking.
 */

export interface PanchangInfo {
  date: string; // YYYY-MM-DD
  tithiName: string;
  tithiNumber: number; // 1 to 30
  paksha: 'Shukla' | 'Krishna';
  nakshatra: string;
  yoga: string;
  sunriseTime: string;
  sunsetTime: string;
  solarNoon: string;
  brahmaMuhurta: { start: string; end: string };
  pratahSandhya: { start: string; end: string };
  abhijitMuhurta: { start: string; end: string };
  sayamSandhya: { start: string; end: string };
  rahuKaal: { start: string; end: string };
  yamaganda: { start: string; end: string };
  gulikaKaal: { start: string; end: string };
  currentMuhurtaStatus: {
    name: string;
    isAuspicious: boolean;
    description: string;
    windowText: string;
  };
  fastingToday?: string;
  choghadiya: Array<{
    period: string;
    name: string;
    type: 'Shubh' | 'Amrit' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
    isAuspicious: boolean;
  }>;
}

const TITHI_NAMES = [
  'प्रतिपदा (Pratipada)',
  'द्वितीया (Dwitiya)',
  'तृतीया (Tritiya)',
  'चतुर्थी (Chaturthi)',
  'पंचमी (Panchami)',
  'षष्ठी (Shashthi)',
  'सप्तमी (Saptami)',
  'अष्टमी (Ashtami)',
  'नवमी (Navami)',
  'दशमी (Dashami)',
  'एकादशी (Ekadashi)',
  'द्वादशी (Dwadashi)',
  'त्रयोदशी (Trayodashi)',
  'चतुर्दशी (Chaturdashi)',
  'पूर्णिमा (Purnima)',
  // Krishna Paksha 16-30
  'प्रतिपदा (Pratipada)',
  'द्वितीया (Dwitiya)',
  'तृतीया (Tritiya)',
  'चतुर्थी (Chaturthi)',
  'पंचमी (Panchami)',
  'षष्ठी (Shashthi)',
  'सप्तमी (Saptami)',
  'अष्टमी (Ashtami)',
  'नवमी (Navami)',
  'दशमी (Dashami)',
  'एकादशी (Ekadashi)',
  'द्वादशी (Dwadashi)',
  'त्रयोदशी (Trayodashi)',
  'चतुर्दशी (Chaturdashi)',
  'अमावस्या (Amavasya)',
];

const NAKSHATRAS = [
  'अश्विनी (Ashwini)',
  'भरणी (Bharani)',
  'कृत्तिका (Krittika)',
  'रोहिणी (Rohini)',
  'मृगशिरा (Mrigashirsha)',
  'आर्द्रा (Ardra)',
  'पुनर्वसु (Punarvasu)',
  'पुष्य (Pushya)',
  'आश्लेषा (Ashlesha)',
  'मघा (Magha)',
  'पूर्वा फाल्गुनी (Purva Phalguni)',
  'उत्तरा फाल्गुनी (Uttara Phalguni)',
  'हस्त (Hasta)',
  'चित्रा (Chitra)',
  'स्वाती (Swati)',
  'विशाखा (Vishakha)',
  'अनुराधा (Anuradha)',
  'ज्येष्ठा (Jyeshtha)',
  'मूल (Mula)',
  'पूर्वाषाढ़ा (Purva Ashadha)',
  'उत्तराषाढ़ा (Uttara Ashadha)',
  'श्रवण (Shravana)',
  'धनिष्ठा (Dhanishta)',
  'शतभिषा (Shatabhisha)',
  'पूर्वा भाद्रपद (Purva Bhadrapada)',
  'उत्तरा भाद्रपद (Uttara Bhadrapada)',
  'रेवती (Revati)',
];

const YOGAS = [
  'विष्कुम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा',
  'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र',
  'सिद्धि', 'व्यतीपात', 'वरीयान्', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ',
  'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'
];

// Reference standard coordinates for Bharat (New Delhi / Varanasi median)
export const DEFAULT_LAT = 28.6139;
export const DEFAULT_LON = 77.2090;

function formatMinutesToTime(minutes: number): string {
  let m = Math.floor(minutes) % 1440;
  if (m < 0) m += 1440;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(displayHours)}:${pad(mins)} ${period}`;
}

export function calculatePanchang(
  date: Date = new Date(),
  lat: number = DEFAULT_LAT,
  lon: number = DEFAULT_LON
): PanchangInfo {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Julian Day calculation
  const a = Math.floor((14 - (month + 1)) / 12);
  const y = year + 4800 - a;
  const m = month + 1 + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // Day of year and solar calculation
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Approximate Solar Declination (degrees)
  const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
  const decRad = (declination * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Hour angle for sunrise/sunset (zenith 90.833 deg)
  const zenithRad = (90.833 * Math.PI) / 180;
  let cosH =
    (Math.cos(zenithRad) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));
  cosH = Math.max(-1, Math.min(1, cosH));
  const hourAngleDeg = (Math.acos(cosH) * 180) / Math.PI;

  // Solar noon in local minutes
  const timezoneOffsetMinutes = -date.getTimezoneOffset();
  const eqTime =
    9.87 * Math.sin((4 * Math.PI / 365) * (dayOfYear - 81)) -
    7.53 * Math.cos((2 * Math.PI / 365) * (dayOfYear - 81)) -
    1.5 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));

  const solarNoonMin = 720 - 4 * lon + timezoneOffsetMinutes - eqTime;
  const halfDayMin = hourAngleDeg * 4;

  const sunriseMin = solarNoonMin - halfDayMin;
  const sunsetMin = solarNoonMin + halfDayMin;
  const dayLengthMin = sunsetMin - sunriseMin;

  // 1. Brahma Muhurta: 96 to 48 minutes before sunrise (2 Muhurtas)
  const brahmaStartMin = sunriseMin - 96;
  const brahmaEndMin = sunriseMin - 48;

  // 2. Pratah Sandhya: 48 minutes before sunrise to sunrise
  const pratahSandhyaStartMin = sunriseMin - 48;
  const pratahSandhyaEndMin = sunriseMin;

  // 3. Abhijit Muhurta: 48-minute auspicious window centered at solar noon
  const abhijitStartMin = solarNoonMin - 24;
  const abhijitEndMin = solarNoonMin + 24;

  // 4. Sayam Sandhya: Sunset to 48 mins after sunset
  const sayamStartMin = sunsetMin;
  const sayamEndMin = sunsetMin + 48;

  // 5. Rahu Kaal, Yamaganda, Gulika Kaal (based on day of week 0 = Sun, 1 = Mon...)
  const dayOfWeek = date.getDay();
  const segmentLength = dayLengthMin / 8;

  // Rahu Kaal segments: Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3 (1-indexed)
  const rahuSegments = [8, 2, 7, 5, 6, 4, 3];
  const rahuSeg = rahuSegments[dayOfWeek] - 1;
  const rahuStartMin = sunriseMin + rahuSeg * segmentLength;
  const rahuEndMin = rahuStartMin + segmentLength;

  // Yamaganda segments: Sun=5, Mon=4, Tue=3, Wed=2, Thu=1, Fri=7, Sat=6
  const yamaSegments = [5, 4, 3, 2, 1, 7, 6];
  const yamaSeg = yamaSegments[dayOfWeek] - 1;
  const yamaStartMin = sunriseMin + yamaSeg * segmentLength;
  const yamaEndMin = yamaStartMin + segmentLength;

  // Gulika Kaal segments: Sun=7, Mon=6, Tue=5, Wed=4, Thu=3, Fri=2, Sat=1
  const gulikaSegments = [7, 6, 5, 4, 3, 2, 1];
  const gulikaSeg = gulikaSegments[dayOfWeek] - 1;
  const gulikaStartMin = sunriseMin + gulikaSeg * segmentLength;
  const gulikaEndMin = gulikaStartMin + segmentLength;

  // 6. Lunar Tithi & Nakshatra Calculation
  // Days since New Moon epoch (Jan 11, 2024 approx JD 2460321)
  const synodicMonth = 29.53058867;
  const daysSinceEpoch = (jd - 2460321) + (date.getHours() * 60 + date.getMinutes()) / 1440;
  const moonPhaseAngle = ((daysSinceEpoch % synodicMonth) / synodicMonth) * 360;

  const tithiIndex = Math.floor(moonPhaseAngle / 12) % 30;
  const tithiNumber = tithiIndex + 1;
  const tithiName = TITHI_NAMES[tithiIndex];
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';

  // Nakshatra (Moon travels 360 degrees in sidereal month of 27.32166 days)
  const siderealMonth = 27.32166;
  const moonSiderealAngle = ((daysSinceEpoch % siderealMonth) / siderealMonth) * 360;
  const nakshatraIndex = Math.floor(moonSiderealAngle / (360 / 27)) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  // Yoga
  const yogaIndex = (tithiIndex + nakshatraIndex) % 27;
  const yoga = YOGAS[yogaIndex];

  // Fasting / Vrats detection
  let fastingToday: string | undefined = undefined;
  if (tithiNumber === 11 || tithiNumber === 26) {
    fastingToday = 'पवित्र एकादशी व्रत (Ekadashi Fast)';
  } else if (tithiNumber === 13 || tithiNumber === 28) {
    fastingToday = 'प्रदोष व्रत (Pradosh Vrat)';
  } else if (tithiNumber === 15) {
    fastingToday = 'सत्यनारायण पूर्णिमा (Purnima)';
  } else if (tithiNumber === 30) {
    fastingToday = 'अमावस्या (Amavasya)';
  } else if (tithiNumber === 19) {
    fastingToday = 'संकष्टी चतुर्थी व्रत (Sankashti)';
  } else if (tithiNumber === 4) {
    fastingToday = 'विनायक चतुर्थी (Vinayaka)';
  }

  // Current Time evaluation
  const nowMin = date.getHours() * 60 + date.getMinutes();

  let currentMuhurtaStatus = {
    name: 'सामान्य काल (Normal Time)',
    isAuspicious: true,
    description: 'दैनिक कार्यों एवं स्मरण के लिए शुभ।',
    windowText: '',
  };

  if (nowMin >= brahmaStartMin && nowMin < brahmaEndMin) {
    currentMuhurtaStatus = {
      name: 'ब्रह्म मुहूर्त (Brahma Muhurta)',
      isAuspicious: true,
      description: 'सर्वोच्च ध्यान, साधना एवं मंत्र जप काल।',
      windowText: `${formatMinutesToTime(brahmaStartMin)} - ${formatMinutesToTime(brahmaEndMin)}`,
    };
  } else if (nowMin >= pratahSandhyaStartMin && nowMin < pratahSandhyaEndMin) {
    currentMuhurtaStatus = {
      name: 'प्रातः संध्या (Pratah Sandhya)',
      isAuspicious: true,
      description: 'गायत्री जप एवं सूर्य वंदना का पावन समय।',
      windowText: `${formatMinutesToTime(pratahSandhyaStartMin)} - ${formatMinutesToTime(pratahSandhyaEndMin)}`,
    };
  } else if (nowMin >= abhijitStartMin && nowMin < abhijitEndMin) {
    currentMuhurtaStatus = {
      name: 'अभिजित मुहूर्त (Abhijit Muhurta)',
      isAuspicious: true,
      description: 'समस्त शुभ कार्यों एवं संकल्प आरंभ के लिए सिद्ध समय।',
      windowText: `${formatMinutesToTime(abhijitStartMin)} - ${formatMinutesToTime(abhijitEndMin)}`,
    };
  } else if (nowMin >= rahuStartMin && nowMin < rahuEndMin) {
    currentMuhurtaStatus = {
      name: 'राहु काल (Rahu Kaal)',
      isAuspicious: false,
      description: 'नया कार्य या यात्रा वर्जित। केवल शिव/महामृत्युंजय स्मरण श्रेयस्कर।',
      windowText: `${formatMinutesToTime(rahuStartMin)} - ${formatMinutesToTime(rahuEndMin)}`,
    };
  } else if (nowMin >= sayamStartMin && nowMin < sayamEndMin) {
    currentMuhurtaStatus = {
      name: 'सायं संध्या (Sayam Sandhya)',
      isAuspicious: true,
      description: 'संध्या आरती एवं दीप प्रज्वलन काल।',
      windowText: `${formatMinutesToTime(sayamStartMin)} - ${formatMinutesToTime(sayamEndMin)}`,
    };
  }

  // Choghadiya Table (Day segments)
  const choghadiyaNames: Array<{
    name: string;
    type: 'Shubh' | 'Amrit' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
    isAuspicious: boolean;
  }> = [
    { name: 'शुभ (Shubh)', type: 'Shubh', isAuspicious: true },
    { name: 'लाभ (Labh)', type: 'Labh', isAuspicious: true },
    { name: 'अमृत (Amrit)', type: 'Amrit', isAuspicious: true },
    { name: 'चर (Char)', type: 'Char', isAuspicious: true },
    { name: 'रोग (Rog)', type: 'Rog', isAuspicious: false },
    { name: 'काल (Kaal)', type: 'Kaal', isAuspicious: false },
    { name: 'उद्वेग (Udveg)', type: 'Udveg', isAuspicious: false },
  ];

  const choghadiya: PanchangInfo['choghadiya'] = [];
  for (let i = 0; i < 8; i++) {
    const startM = sunriseMin + i * segmentLength;
    const endM = startM + segmentLength;
    const item = choghadiyaNames[(dayOfWeek + i) % choghadiyaNames.length];
    choghadiya.push({
      period: `${formatMinutesToTime(startM)} - ${formatMinutesToTime(endM)}`,
      name: item.name,
      type: item.type,
      isAuspicious: item.isAuspicious,
    });
  }

  const yyyy = year;
  const mm = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
  const dd = day < 10 ? `0${day}` : `${day}`;

  return {
    date: `${yyyy}-${mm}-${dd}`,
    tithiName,
    tithiNumber,
    paksha,
    nakshatra,
    yoga,
    sunriseTime: formatMinutesToTime(sunriseMin),
    sunsetTime: formatMinutesToTime(sunsetMin),
    solarNoon: formatMinutesToTime(solarNoonMin),
    brahmaMuhurta: {
      start: formatMinutesToTime(brahmaStartMin),
      end: formatMinutesToTime(brahmaEndMin),
    },
    pratahSandhya: {
      start: formatMinutesToTime(pratahSandhyaStartMin),
      end: formatMinutesToTime(pratahSandhyaEndMin),
    },
    abhijitMuhurta: {
      start: formatMinutesToTime(abhijitStartMin),
      end: formatMinutesToTime(abhijitEndMin),
    },
    sayamSandhya: {
      start: formatMinutesToTime(sayamStartMin),
      end: formatMinutesToTime(sayamEndMin),
    },
    rahuKaal: {
      start: formatMinutesToTime(rahuStartMin),
      end: formatMinutesToTime(rahuEndMin),
    },
    yamaganda: {
      start: formatMinutesToTime(yamaStartMin),
      end: formatMinutesToTime(yamaEndMin),
    },
    gulikaKaal: {
      start: formatMinutesToTime(gulikaStartMin),
      end: formatMinutesToTime(gulikaEndMin),
    },
    currentMuhurtaStatus,
    fastingToday,
    choghadiya,
  };
}
