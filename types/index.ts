export type TTask = {
  name: string;
  pid: string;
  memUsage: number;
  usage: string;
  isAnomaly: boolean;
  mean: number;
  stdDev: number;
};

export type TAutorun = {
  time: string;
  location: string;
  entryName: string;
  state: 'enabled' | 'disabled' | string;
  category: string;
  profile: string;
  description: string;
  signer: string;
  isVerified: boolean;
  company: string;
  imagePath: string;
  version: string;
  launchCommand: string;
  virusTotalDetections: number | null;
  virusTotalTotal: number | null;
  virusTotalLink: string | null;
  iconBase64?: string | null;
};

export type TNetworkConnection = {
  ProcessName: string;
  PID: number;
  State: string;
  LocalAddress: string;
  LocalPort: number;
  RemoteAddress: string;
  RemotePort: number;
  Path: string;
};

export type TWhoisData = {
  domainName: string;
  registrar: string | null;
  creationDate: string | null;
  expirationDate: string | null;
  updatedDate: string | null;
  organization: string | null;
  abuseEmail: string | null;
  nameServers: string[];
  statuses: string[];
  rawText?: string; // Можна передавати сирий текст для дебагу або спойлера
};

export type TSystemMetrics = {
  cpuUsage: number;     // Відсоток завантаження CPU (0-100)
  ramUsage: number;     // Відсоток завантаження RAM (0-100)
  ramUsedGb: string;    // Використана пам'ять у ГБ
  ramTotalGb: string;   // Загальна пам'ять у ГБ
};