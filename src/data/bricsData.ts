export interface BRICSMember {
  code: string;
  name: string;
  shortName: string;
  flagEmoji: string;
  networkNodes: number;
  totalClinics: number;
  resilienceScore: number;
  activePilotState: string;
  primaryCluster: string;
}

export const BRICS_MEMBERS: BRICSMember[] = [
  {
    code: 'IN',
    name: 'India (National Health Mission)',
    shortName: 'India',
    flagEmoji: '🇮🇳',
    networkNodes: 5,
    totalClinics: 4382,
    resilienceScore: 78.4,
    activePilotState: 'Maharashtra Health Grid',
    primaryCluster: 'Western Health Corridor',
  },
  {
    code: 'BR',
    name: 'Brazil (SUS - Sistema Único de Saúde)',
    shortName: 'Brazil',
    flagEmoji: '🇧🇷',
    networkNodes: 4,
    totalClinics: 3840,
    resilienceScore: 81.2,
    activePilotState: 'São Paulo State Network',
    primaryCluster: 'Sudeste Primary Hub',
  },
  {
    code: 'RU',
    name: 'Russia (Minzdrav Federal Supply)',
    shortName: 'Russia',
    flagEmoji: '🇷🇺',
    networkNodes: 4,
    totalClinics: 2980,
    resilienceScore: 75.8,
    activePilotState: 'Volga Federal District',
    primaryCluster: 'Central Supply Depot',
  },
  {
    code: 'CN',
    name: 'China (NHC County Health Consortia)',
    shortName: 'China',
    flagEmoji: '🇨🇳',
    networkNodes: 6,
    totalClinics: 5120,
    resilienceScore: 86.4,
    activePilotState: 'Zhejiang Health Grid',
    primaryCluster: 'Eastern Medical Alliance',
  },
  {
    code: 'ZA',
    name: 'South Africa (National DoH Primary Network)',
    shortName: 'South Africa',
    flagEmoji: '🇿🇦',
    networkNodes: 4,
    totalClinics: 2410,
    resilienceScore: 72.1,
    activePilotState: 'Gauteng Health Cluster',
    primaryCluster: 'Highveld Clinic Grid',
  },
];
