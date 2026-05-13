import type { GenreLocation, InsightsLocationData, UserMapOrigin } from '@/types/insights';

const EARTH_RADIUS_MI = 3958.8;

const DEFAULT_USER_ORIGIN: UserMapOrigin = {
  lat: 39.8283,
  lng: -98.5795,
  country: 'United States',
  countryCode: 'US',
  city: 'Heartland',
};

const USER_ORIGIN_BY_CODE: Record<string, Omit<UserMapOrigin, 'countryCode'>> = {
  US: { lat: 39.8283, lng: -98.5795, country: 'United States', city: 'Central US' },
  GB: { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London' },
  CA: { lat: 43.6532, lng: -79.3832, country: 'Canada', city: 'Toronto' },
  AU: { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney' },
  DE: { lat: 52.52, lng: 13.405, country: 'Germany', city: 'Berlin' },
  FR: { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris' },
  BR: { lat: -23.5505, lng: -46.6333, country: 'Brazil', city: 'São Paulo' },
  IN: { lat: 19.076, lng: 72.8777, country: 'India', city: 'Mumbai' },
  JP: { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo' },
  KR: { lat: 37.5665, lng: 126.978, country: 'South Korea', city: 'Seoul' },
  MX: { lat: 19.4326, lng: -99.1332, country: 'Mexico', city: 'Mexico City' },
  ES: { lat: 40.4168, lng: -3.7038, country: 'Spain', city: 'Madrid' },
  IT: { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome' },
  NL: { lat: 52.3676, lng: 4.9041, country: 'Netherlands', city: 'Amsterdam' },
  SE: { lat: 59.3293, lng: 18.0686, country: 'Sweden', city: 'Stockholm' },
  NO: { lat: 59.9139, lng: 10.7522, country: 'Norway', city: 'Oslo' },
  PL: { lat: 52.2297, lng: 21.0122, country: 'Poland', city: 'Warsaw' },
  AR: { lat: -34.6037, lng: -58.3816, country: 'Argentina', city: 'Buenos Aires' },
  ZA: { lat: -26.2041, lng: 28.0473, country: 'South Africa', city: 'Johannesburg' },
  NG: { lat: 6.5244, lng: 3.3792, country: 'Nigeria', city: 'Lagos' },
  IE: { lat: 53.3498, lng: -6.2603, country: 'Ireland', city: 'Dublin' },
  NZ: { lat: -36.8485, lng: 174.7633, country: 'New Zealand', city: 'Auckland' },
  AT: { lat: 48.2082, lng: 16.3738, country: 'Austria', city: 'Vienna' },
  CH: { lat: 47.3769, lng: 8.5417, country: 'Switzerland', city: 'Zurich' },
  BE: { lat: 50.8503, lng: 4.3517, country: 'Belgium', city: 'Brussels' },
  PT: { lat: 38.7223, lng: -9.1393, country: 'Portugal', city: 'Lisbon' },
  TR: { lat: 41.0082, lng: 28.9784, country: 'Turkey', city: 'Istanbul' },
  RU: { lat: 55.7558, lng: 37.6173, country: 'Russia', city: 'Moscow' },
  CN: { lat: 31.2304, lng: 121.4737, country: 'China', city: 'Shanghai' },
  TW: { lat: 25.033, lng: 121.5654, country: 'Taiwan', city: 'Taipei' },
  TH: { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok' },
  ID: { lat: -6.2088, lng: 106.8456, country: 'Indonesia', city: 'Jakarta' },
  PH: { lat: 14.5995, lng: 120.9842, country: 'Philippines', city: 'Manila' },
  MY: { lat: 3.139, lng: 101.6869, country: 'Malaysia', city: 'Kuala Lumpur' },
  SG: { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore' },
  IL: { lat: 32.0853, lng: 34.7818, country: 'Israel', city: 'Tel Aviv' },
  AE: { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates', city: 'Dubai' },
  SA: { lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia', city: 'Riyadh' },
  EG: { lat: 30.0444, lng: 31.2357, country: 'Egypt', city: 'Cairo' },
  CL: { lat: -33.4489, lng: -70.6693, country: 'Chile', city: 'Santiago' },
  CO: { lat: 4.711, lng: -74.0721, country: 'Colombia', city: 'Bogotá' },
  FI: { lat: 60.1699, lng: 24.9384, country: 'Finland', city: 'Helsinki' },
  DK: { lat: 55.6761, lng: 12.5683, country: 'Denmark', city: 'Copenhagen' },
  GR: { lat: 37.9838, lng: 23.7275, country: 'Greece', city: 'Athens' },
  CZ: { lat: 50.0755, lng: 14.4378, country: 'Czechia', city: 'Prague' },
  HU: { lat: 47.4979, lng: 19.0402, country: 'Hungary', city: 'Budapest' },
  RO: { lat: 44.4268, lng: 26.1025, country: 'Romania', city: 'Bucharest' },
  UA: { lat: 50.4501, lng: 30.5234, country: 'Ukraine', city: 'Kyiv' },
  PK: { lat: 24.8607, lng: 67.0011, country: 'Pakistan', city: 'Karachi' },
  BD: { lat: 23.8103, lng: 90.4125, country: 'Bangladesh', city: 'Dhaka' },
  LK: { lat: 6.9271, lng: 79.8612, country: 'Sri Lanka', city: 'Colombo' },
  NP: { lat: 27.7172, lng: 85.324, country: 'Nepal', city: 'Kathmandu' },
  KE: { lat: -1.2921, lng: 36.8219, country: 'Kenya', city: 'Nairobi' },
  GH: { lat: 5.6037, lng: -0.187, country: 'Ghana', city: 'Accra' },
  TZ: { lat: -6.7924, lng: 39.2083, country: 'Tanzania', city: 'Dar es Salaam' },
  UG: { lat: 0.3476, lng: 32.5825, country: 'Uganda', city: 'Kampala' },
  ET: { lat: 9.032, lng: 38.7469, country: 'Ethiopia', city: 'Addis Ababa' },
  SN: { lat: 14.7167, lng: -17.4677, country: 'Senegal', city: 'Dakar' },
  MA: { lat: 34.0209, lng: -6.8416, country: 'Morocco', city: 'Rabat' },
  DZ: { lat: 36.7538, lng: 3.0588, country: 'Algeria', city: 'Algiers' },
  TN: { lat: 36.8065, lng: 10.1815, country: 'Tunisia', city: 'Tunis' },
  LB: { lat: 33.8938, lng: 35.5018, country: 'Lebanon', city: 'Beirut' },
  IQ: { lat: 33.3152, lng: 44.3661, country: 'Iraq', city: 'Baghdad' },
  IR: { lat: 35.6892, lng: 51.389, country: 'Iran', city: 'Tehran' },
  VE: { lat: 10.4806, lng: -66.9036, country: 'Venezuela', city: 'Caracas' },
  PE: { lat: -12.0464, lng: -77.0428, country: 'Peru', city: 'Lima' },
  EC: { lat: -0.1807, lng: -78.4678, country: 'Ecuador', city: 'Quito' },
  CU: { lat: 23.1136, lng: -82.3666, country: 'Cuba', city: 'Havana' },
  JM: { lat: 18.0179, lng: -76.8099, country: 'Jamaica', city: 'Kingston' },
  DO: { lat: 18.4861, lng: -69.9312, country: 'Dominican Rep.', city: 'Santo Domingo' },
  HT: { lat: 18.5944, lng: -72.3074, country: 'Haiti', city: 'Port-au-Prince' },
  NI: { lat: 12.115, lng: -86.2362, country: 'Nicaragua', city: 'Managua' },
  PA: { lat: 8.9824, lng: -79.5199, country: 'Panama', city: 'Panama City' },
  CR: { lat: 9.9281, lng: -84.0907, country: 'Costa Rica', city: 'San José' },
  GT: { lat: 14.6349, lng: -90.5069, country: 'Guatemala', city: 'Guatemala City' },
  SV: { lat: 13.6929, lng: -89.2182, country: 'El Salvador', city: 'San Salvador' },
  HN: { lat: 14.0723, lng: -87.1921, country: 'Honduras', city: 'Tegucigalpa' },
  PY: { lat: -25.2637, lng: -57.5759, country: 'Paraguay', city: 'Asunción' },
  UY: { lat: -34.9011, lng: -56.1645, country: 'Uruguay', city: 'Montevideo' },
  BO: { lat: -16.5, lng: -68.15, country: 'Bolivia', city: 'La Paz' },
  IS: { lat: 64.1466, lng: -21.9426, country: 'Iceland', city: 'Reykjavík' },
  LU: { lat: 49.6116, lng: 6.1319, country: 'Luxembourg', city: 'Luxembourg' },
  MT: { lat: 35.8989, lng: 14.5146, country: 'Malta', city: 'Valletta' },
  CY: { lat: 35.1856, lng: 33.3823, country: 'Cyprus', city: 'Nicosia' },
  HR: { lat: 45.815, lng: 15.9819, country: 'Croatia', city: 'Zagreb' },
  RS: { lat: 44.7866, lng: 20.4489, country: 'Serbia', city: 'Belgrade' },
  SI: { lat: 46.0569, lng: 14.5058, country: 'Slovenia', city: 'Ljubljana' },
  SK: { lat: 48.1486, lng: 17.1077, country: 'Slovakia', city: 'Bratislava' },
  BG: { lat: 42.6977, lng: 23.3219, country: 'Bulgaria', city: 'Sofia' },
  LT: { lat: 54.6872, lng: 25.2797, country: 'Lithuania', city: 'Vilnius' },
  LV: { lat: 56.9496, lng: 24.1052, country: 'Latvia', city: 'Riga' },
  EE: { lat: 59.437, lng: 24.7536, country: 'Estonia', city: 'Tallinn' },
};

type OriginDef = Omit<GenreLocation, 'genre' | 'color'> & {
  isoA2: string;
  /** Natural Earth country name for react-simple-maps fill matching */
  geoName: string;
};

const ORIGIN_RULES: { patterns: RegExp[]; origin: OriginDef }[] = [
  {
    patterns: [/k-?pop/i, /korean\s*pop/i],
    origin: {
      country: 'South Korea',
      city: 'Seoul',
      lat: 37.5665,
      lng: 126.978,
      region: 'East Asia',
      isoA2: 'KR',
      geoName: 'South Korea',
    },
  },
  {
    patterns: [/j-?pop/i, /japanese\s*pop/i, /city pop/i],
    origin: {
      country: 'Japan',
      city: 'Tokyo',
      lat: 35.6762,
      lng: 139.6503,
      region: 'East Asia',
      isoA2: 'JP',
      geoName: 'Japan',
    },
  },
  {
    patterns: [/reggaeton/i, /latin\s*urban/i, /dembow/i],
    origin: {
      country: 'Puerto Rico',
      city: 'San Juan',
      lat: 18.4655,
      lng: -66.1057,
      region: 'Caribbean',
      isoA2: 'PR',
      geoName: 'Puerto Rico',
    },
  },
  {
    patterns: [/synthwave/i, /outrun/i, /french\s*house/i],
    origin: {
      country: 'France',
      city: 'Paris',
      lat: 48.8566,
      lng: 2.3522,
      region: 'Western Europe / US scene',
      isoA2: 'FR',
      geoName: 'France',
    },
  },
  {
    patterns: [/afrobeats?/i, /afrobeat/i, /afropop/i, /amapiano/i],
    origin: {
      country: 'Nigeria',
      city: 'Lagos',
      lat: 6.5244,
      lng: 3.3792,
      region: 'West Africa',
      isoA2: 'NG',
      geoName: 'Nigeria',
    },
  },
  {
    patterns: [/bollywood/i, /filmi/i, /indian\s*classical/i, /desi\s*pop/i],
    origin: {
      country: 'India',
      city: 'Mumbai',
      lat: 19.076,
      lng: 72.8777,
      region: 'South Asia',
      isoA2: 'IN',
      geoName: 'India',
    },
  },
  {
    patterns: [/drill(?!ing)/i, /chicago\s*drill/i],
    origin: {
      country: 'United States',
      city: 'Chicago',
      lat: 41.8781,
      lng: -87.6298,
      region: 'Midwest USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/uk\s*garage/i, /2-step/i, /grime(?!\s*metal)/i, /british\s*hip\s*hop/i],
    origin: {
      country: 'United Kingdom',
      city: 'London',
      lat: 51.5074,
      lng: -0.1278,
      region: 'UK',
      isoA2: 'GB',
      geoName: 'United Kingdom',
    },
  },
  {
    patterns: [/baile\s*funk/i, /funk\s*carioca/i],
    origin: {
      country: 'Brazil',
      city: 'Rio de Janeiro',
      lat: -22.9068,
      lng: -43.1729,
      region: 'South America',
      isoA2: 'BR',
      geoName: 'Brazil',
    },
  },
  {
    patterns: [/reggae/i, /dub(?!\s*step)/i, /ska\s*punk/i],
    origin: {
      country: 'Jamaica',
      city: 'Kingston',
      lat: 18.0179,
      lng: -76.8099,
      region: 'Caribbean',
      isoA2: 'JM',
      geoName: 'Jamaica',
    },
  },
  {
    patterns: [/salsa/i, /bachata/i, /merengue/i],
    origin: {
      country: 'Dominican Rep.',
      city: 'Santo Domingo',
      lat: 18.4861,
      lng: -69.9312,
      region: 'Caribbean',
      isoA2: 'DO',
      geoName: 'Dominican Rep.',
    },
  },
  {
    patterns: [/cumbia/i, /vallenato/i],
    origin: {
      country: 'Colombia',
      city: 'Medellín',
      lat: 6.2476,
      lng: -75.5658,
      region: 'South America',
      isoA2: 'CO',
      geoName: 'Colombia',
    },
  },
  {
    patterns: [/flamenco/i],
    origin: {
      country: 'Spain',
      city: 'Seville',
      lat: 37.3891,
      lng: -5.9845,
      region: 'Iberia',
      isoA2: 'ES',
      geoName: 'Spain',
    },
  },
  {
    patterns: [/tango/i],
    origin: {
      country: 'Argentina',
      city: 'Buenos Aires',
      lat: -34.6037,
      lng: -58.3816,
      region: 'South America',
      isoA2: 'AR',
      geoName: 'Argentina',
    },
  },
  {
    patterns: [/samba/i, /bossa\s*nova/i],
    origin: {
      country: 'Brazil',
      city: 'Rio de Janeiro',
      lat: -22.9068,
      lng: -43.1729,
      region: 'South America',
      isoA2: 'BR',
      geoName: 'Brazil',
    },
  },
  {
    patterns: [/highlife/i, /azonto/i],
    origin: {
      country: 'Ghana',
      city: 'Accra',
      lat: 5.6037,
      lng: -0.187,
      region: 'West Africa',
      isoA2: 'GH',
      geoName: 'Ghana',
    },
  },
  {
    patterns: [/soukous/i, /congolese/i, /rumba\s*africaine/i],
    origin: {
      country: 'Dem. Rep. Congo',
      city: 'Kinshasa',
      lat: -4.4419,
      lng: 15.2663,
      region: 'Central Africa',
      isoA2: 'CD',
      geoName: 'Dem. Rep. Congo',
    },
  },
  {
    patterns: [/shoegaze/i, /britpop/i, /madchester/i],
    origin: {
      country: 'United Kingdom',
      city: 'Manchester',
      lat: 53.4808,
      lng: -2.2426,
      region: 'UK',
      isoA2: 'GB',
      geoName: 'United Kingdom',
    },
  },
  {
    patterns: [/detroit\s*techno/i, /techno(?!\s*minimal)/i],
    origin: {
      country: 'United States',
      city: 'Detroit',
      lat: 42.3314,
      lng: -83.0458,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/berlin\s*techno/i, /minimal\s*techno/i],
    origin: {
      country: 'Germany',
      city: 'Berlin',
      lat: 52.52,
      lng: 13.405,
      region: 'Central Europe',
      isoA2: 'DE',
      geoName: 'Germany',
    },
  },
  {
    patterns: [/dancehall/i],
    origin: {
      country: 'Jamaica',
      city: 'Kingston',
      lat: 18.0179,
      lng: -76.8099,
      region: 'Caribbean',
      isoA2: 'JM',
      geoName: 'Jamaica',
    },
  },
  {
    patterns: [/bachata\s*urban/i],
    origin: {
      country: 'Dominican Rep.',
      city: 'Santo Domingo',
      lat: 18.4861,
      lng: -69.9312,
      region: 'Caribbean',
      isoA2: 'DO',
      geoName: 'Dominican Rep.',
    },
  },
  {
    patterns: [/norte[ñn]o/i, /banda\s*(mexicana)?/i, /corrido/i],
    origin: {
      country: 'Mexico',
      city: 'Monterrey',
      lat: 25.6866,
      lng: -100.3161,
      region: 'North America',
      isoA2: 'MX',
      geoName: 'Mexico',
    },
  },
  {
    patterns: [/kizomba/i, /zouk/i],
    origin: {
      country: 'Angola',
      city: 'Luanda',
      lat: -8.8383,
      lng: 13.2344,
      region: 'Southern Africa',
      isoA2: 'AO',
      geoName: 'Angola',
    },
  },
  {
    patterns: [/fado/i],
    origin: {
      country: 'Portugal',
      city: 'Lisbon',
      lat: 38.7223,
      lng: -9.1393,
      region: 'Iberia',
      isoA2: 'PT',
      geoName: 'Portugal',
    },
  },
  {
    patterns: [/trot/i, /korean\s*traditional/i],
    origin: {
      country: 'South Korea',
      city: 'Seoul',
      lat: 37.5665,
      lng: 126.978,
      region: 'East Asia',
      isoA2: 'KR',
      geoName: 'South Korea',
    },
  },
  {
    patterns: [/anatolian\s*rock/i, /turkish\s*folk/i],
    origin: {
      country: 'Turkey',
      city: 'Istanbul',
      lat: 41.0082,
      lng: 28.9784,
      region: 'Middle East / Europe',
      isoA2: 'TR',
      geoName: 'Turkey',
    },
  },
  {
    patterns: [/arabic\s*pop/i, /khaleeji/i],
    origin: {
      country: 'United Arab Emirates',
      city: 'Dubai',
      lat: 25.2048,
      lng: 55.2708,
      region: 'Middle East',
      isoA2: 'AE',
      geoName: 'United Arab Emirates',
    },
  },
  {
    patterns: [/swedish\s*pop/i, /swedish\s*metal/i, /melodic\s*death\s*metal/i],
    origin: {
      country: 'Sweden',
      city: 'Stockholm',
      lat: 59.3293,
      lng: 18.0686,
      region: 'Scandinavia',
      isoA2: 'SE',
      geoName: 'Sweden',
    },
  },
  {
    patterns: [/norwegian\s*(black\s*)?metal/i, /nordic\s*folk/i],
    origin: {
      country: 'Norway',
      city: 'Oslo',
      lat: 59.9139,
      lng: 10.7522,
      region: 'Scandinavia',
      isoA2: 'NO',
      geoName: 'Norway',
    },
  },
  {
    patterns: [/celtic/i, /irish\s*folk/i],
    origin: {
      country: 'Ireland',
      city: 'Dublin',
      lat: 53.3498,
      lng: -6.2603,
      region: 'Europe',
      isoA2: 'IE',
      geoName: 'Ireland',
    },
  },
  {
    patterns: [/australian\s*hip\s*hop/i, /aussie\s*hip\s*hop/i],
    origin: {
      country: 'Australia',
      city: 'Sydney',
      lat: -33.8688,
      lng: 151.2093,
      region: 'Oceania',
      isoA2: 'AU',
      geoName: 'Australia',
    },
  },
  {
    patterns: [/south\s*african\s*hip\s*hop/i, /gqom/i, /kwaito/i],
    origin: {
      country: 'South Africa',
      city: 'Johannesburg',
      lat: -26.2041,
      lng: 28.0473,
      region: 'Southern Africa',
      isoA2: 'ZA',
      geoName: 'South Africa',
    },
  },
  {
    patterns: [/east\s*coast\s*rap/i, /new\s*york\s*hip\s*hop/i],
    origin: {
      country: 'United States',
      city: 'New York',
      lat: 40.7128,
      lng: -74.006,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/west\s*coast\s*rap/i, /g-funk/i, /hyphy/i],
    origin: {
      country: 'United States',
      city: 'Los Angeles',
      lat: 34.0522,
      lng: -118.2437,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/southern\s*hip\s*hop/i, /atl\s*hip\s*hop/i, /trap\s*music/i],
    origin: {
      country: 'United States',
      city: 'Atlanta',
      lat: 33.749,
      lng: -84.388,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/memphis\s*rap/i, /phonk/i],
    origin: {
      country: 'United States',
      city: 'Memphis',
      lat: 35.1495,
      lng: -90.049,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/miami\s*bass/i, /bounce/i],
    origin: {
      country: 'United States',
      city: 'Miami',
      lat: 25.7617,
      lng: -80.1918,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/bounce\s*rap/i],
    origin: {
      country: 'United States',
      city: 'New Orleans',
      lat: 29.9511,
      lng: -90.0715,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/cloud\s*rap/i],
    origin: {
      country: 'United States',
      city: 'Seattle',
      lat: 47.6062,
      lng: -122.3321,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  /* Broad Spotify-style buckets (kept last — first specific rule wins) */
  {
    patterns: [/indie\s*rock/i, /british\s*indie/i, /alternative\s*rock/i, /art\s*rock/i],
    origin: {
      country: 'United Kingdom',
      city: 'London',
      lat: 51.5074,
      lng: -0.1278,
      region: 'UK',
      isoA2: 'GB',
      geoName: 'United Kingdom',
    },
  },
  {
    patterns: [/neo-?psychedelic/i, /psychedelic\s*rock/i],
    origin: {
      country: 'Australia',
      city: 'Melbourne',
      lat: -37.8136,
      lng: 144.9631,
      region: 'Oceania',
      isoA2: 'AU',
      geoName: 'Australia',
    },
  },
  {
    patterns: [/conscious\s*hip\s*hop/i, /southern\s*hip\s*hop/i],
    origin: {
      country: 'United States',
      city: 'Atlanta',
      lat: 33.749,
      lng: -84.388,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/hip\s*hop/i, /\brap\b/i],
    origin: {
      country: 'United States',
      city: 'Atlanta',
      lat: 33.749,
      lng: -84.388,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/r\s*&\s*b/i, /neo-?soul/i, /urban\s*contemporary/i],
    origin: {
      country: 'United States',
      city: 'Los Angeles',
      lat: 34.0522,
      lng: -118.2437,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
  {
    patterns: [/electronic/i, /\bedm\b/i, /house/i, /techno/i, /trance/i],
    origin: {
      country: 'Germany',
      city: 'Berlin',
      lat: 52.52,
      lng: 13.405,
      region: 'Europe',
      isoA2: 'DE',
      geoName: 'Germany',
    },
  },
  {
    patterns: [/^pop$/i, /dance\s*pop/i, /synth\s*pop/i, /power\s*pop/i],
    origin: {
      country: 'United States',
      city: 'Los Angeles',
      lat: 34.0522,
      lng: -118.2437,
      region: 'USA',
      isoA2: 'US',
      geoName: 'United States of America',
    },
  },
];

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/** Haversine distance in miles between two WGS84 points */
export function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MI * c;
}

function normalizeGenre(g: string) {
  return g.trim().toLowerCase();
}

function resolveOrigin(genre: string): OriginDef | null {
  const g = normalizeGenre(genre);
  for (const rule of ORIGIN_RULES) {
    if (rule.patterns.some(p => p.test(g))) {
      return rule.origin;
    }
  }
  return null;
}

function mergeGenreDisplay(existing: string, next: string) {
  if (existing.toLowerCase().includes(next.toLowerCase())) return existing;
  return `${existing} · ${next}`;
}

export function getUserMapOrigin(countryCode?: string): UserMapOrigin {
  const code = (countryCode || 'US').toUpperCase();
  const base = USER_ORIGIN_BY_CODE[code] || DEFAULT_USER_ORIGIN;
  return {
    ...base,
    countryCode: USER_ORIGIN_BY_CODE[code] ? code : 'US',
  };
}

/**
 * Great-circle arc as GeoJSON LineString coordinates [lng, lat] for react-simple-maps `Line`.
 */
export function greatCircleCoordinates(
  from: [number, number],
  to: [number, number],
  segments = 48
): [number, number][] {
  const [λ1, φ1] = [toRad(from[0]), toRad(from[1])];
  const [λ2, φ2] = [toRad(to[0]), toRad(to[1])];
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
      )
    );
  if (d === 0) return [from, to];
  const coords: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    coords.push([toDeg(λ), toDeg(φ)]);
  }
  return coords;
}

function dedupeHotspots(
  items: (GenreLocation & { count: number; milesFromUser: number })[],
  thresholdMi = 180
): (GenreLocation & { count: number; milesFromUser: number })[] {
  const out: (GenreLocation & { count: number; milesFromUser: number })[] = [];
  for (const item of items) {
    const dup = out.find(
      o => haversineMiles(o.lat, o.lng, item.lat, item.lng) <= thresholdMi && o.isoA2 === item.isoA2
    );
    if (dup) {
      dup.count += item.count;
      dup.genre = mergeGenreDisplay(dup.genre, item.genre);
      dup.milesFromUser = Math.max(dup.milesFromUser, item.milesFromUser);
    } else {
      out.push({ ...item });
    }
  }
  return out;
}

/**
 * Match Spotify-style top genre labels to geographic origins, dedupe nearby pins,
 * and estimate total "music miles" from the listener hub.
 */
export function getGenreTravelData(
  topGenres: { genre: string; count: number }[],
  userCountryCode?: string
): InsightsLocationData {
  const userOrigin = getUserMapOrigin(userCountryCode);

  const raw: (GenreLocation & { count: number; milesFromUser: number; isoA2: string })[] = [];

  for (const { genre, count } of topGenres) {
    const origin = resolveOrigin(genre);
    if (!origin) continue;
    const milesFromUser = haversineMiles(userOrigin.lat, userOrigin.lng, origin.lat, origin.lng);
    raw.push({
      genre,
      country: origin.country,
      city: origin.city,
      lat: origin.lat,
      lng: origin.lng,
      region: origin.region,
      isoA2: origin.isoA2,
      geoName: origin.geoName,
      count,
      milesFromUser,
    });
  }

  const deduped = dedupeHotspots(raw);
  const maxCount = Math.max(1, ...deduped.map(h => h.count));

  const hotspots: GenreLocation[] = deduped
    .map(h => ({
      genre: h.genre,
      country: h.country,
      city: h.city,
      lat: h.lat,
      lng: h.lng,
      region: h.region,
      color: '#1DB954',
      count: h.count,
      intensity: Math.min(1, h.count / maxCount),
      milesFromUser: Math.round(h.milesFromUser),
      isoA2: h.isoA2,
      geoName: h.geoName,
    }))
    .sort((a, b) => (b.milesFromUser || 0) - (a.milesFromUser || 0));

  const totalMiles = Math.round(hotspots.reduce((sum, h) => sum + (h.milesFromUser || 0), 0));
  const countriesVisited = new Set(hotspots.map(h => h.isoA2 || h.country)).size;

  const international = hotspots.filter(h => h.isoA2 && h.isoA2 !== userOrigin.countryCode);
  const favoritePool = international.length ? international : hotspots;
  const favoriteInternationalGenre =
    favoritePool.length > 0
      ? [...favoritePool].sort((a, b) => (b.count || 0) - (a.count || 0))[0]?.genre ?? null
      : null;

  const farthest = hotspots.length
    ? [...hotspots].sort((a, b) => (b.milesFromUser || 0) - (a.milesFromUser || 0))[0]
    : null;

  return {
    totalMiles,
    countriesVisited,
    hotspots,
    userOrigin,
    favoriteInternationalGenre,
    mostDistantGenre: farthest?.genre ?? null,
    mostDistantMiles: farthest?.milesFromUser ?? 0,
  };
}
