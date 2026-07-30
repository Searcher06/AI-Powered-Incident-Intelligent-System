export const SEVERITY_CONFIG = {
  low: {
    label: 'Low',
    bgClass: 'bg-[#d0e1fb] text-[#38485d]',
    dotClass: 'bg-[#505f76]',
    barClass: 'bg-[#505f76]',
    borderClass: 'border-[#505f76]',
  },
  medium: {
    label: 'Medium',
    bgClass: 'bg-[#fff3cd] text-[#7a5800]',
    dotClass: 'bg-[#f59e0b]',
    barClass: 'bg-[#f59e0b]',
    borderClass: 'border-[#f59e0b]',
  },
  high: {
    label: 'High',
    bgClass: 'bg-[#ffede6] text-[#7d2d00]',
    dotClass: 'bg-[#943700]',
    barClass: 'bg-[#943700]',
    borderClass: 'border-[#943700]',
  },
  critical: {
    label: 'Critical',
    bgClass: 'bg-[#ffdad6] text-[#93000a]',
    dotClass: 'bg-[#ba1a1a]',
    barClass: 'bg-[#ba1a1a]',
    borderClass: 'border-[#ba1a1a]',
  },
};

export const STATUS_CONFIG = {
  active: {
    label: 'Active',
    bgClass: 'bg-[#d0e1fb] text-[#003ea8]',
  },
  investigating: {
    label: 'Investigating',
    bgClass: 'bg-[#fff3cd] text-[#7a5800]',
  },
  resolved: {
    label: 'Resolved',
    bgClass: 'bg-[#dcfce7] text-[#14532d]',
  },
  closed: {
    label: 'Closed',
    bgClass: 'bg-[#e0e3e5] text-[#434655]',
  },
  escalated: {
    label: 'Escalated',
    bgClass: 'bg-[#ffdad6] text-[#93000a]',
  },
};

export const CATEGORY_ICONS = {
  fire: 'local_fire_department',
  flood: 'flood',
  traffic: 'traffic',
  medical: 'medical_services',
  crime: 'gavel',
  infrastructure: 'construction',
  power_outage: 'power_off',
  earthquake: 'landslide',
  protest: 'campaign',
  hazmat: 'science',
  weather: 'thunderstorm',
  other: 'report',
  default: 'warning',
};

export const SOURCE_TYPES = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'news_article', label: 'News Article' },
  { value: 'eyewitness', label: 'Eyewitness Report' },
  { value: 'official_report', label: 'Official Report' },
  { value: 'sensor', label: 'Sensor / IoT' },
  { value: 'other', label: 'Other' },
];

export const REPORTER_TYPES = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'journalist', label: 'Journalist' },
  { value: 'official', label: 'Official' },
  { value: 'automated', label: 'Automated System' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
];
