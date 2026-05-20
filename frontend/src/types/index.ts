export enum UserRole {
  MANAGER = 'MANAGER',
  PILOT = 'PILOT',
  MECHANIC = 'MECHANIC',
  ENGINEER = 'ENGINEER',
  LOGISTICS = 'LOGISTICS',
  FINANCE = 'FINANCE',
  MEDIA = 'MEDIA',
  GUEST = 'GUEST',
}

export enum VehicleCategory {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  TRANSPORT = 'TRANSPORT',
}

// Debe mantenerse sincronizado con com.lapsight.model.VehicleType
export enum VehicleType {
  // Coches - Fórmula
  FORMULA_1 = 'FORMULA_1',
  FORMULA_2 = 'FORMULA_2',
  FORMULA_3 = 'FORMULA_3',
  FORMULA_4 = 'FORMULA_4',
  FORMULA_FORD = 'FORMULA_FORD',
  // Coches - GT/Resistencia
  GT3 = 'GT3',
  GT4 = 'GT4',
  LMP = 'LMP',
  PROTOTYPE = 'PROTOTYPE',
  // Coches - Turismos
  TCR = 'TCR',
  WTCC = 'WTCC',
  SUPERCARS = 'SUPERCARS',
  // Coches - Rally
  WRC = 'WRC',
  R5 = 'R5',
  HISTORIC_RALLY = 'HISTORIC_RALLY',
  // Coches - Monoplazas
  INDYCAR = 'INDYCAR',
  FORMULA_E = 'FORMULA_E',
  // Coches - Drift/Autocross
  DRIFT_PRO = 'DRIFT_PRO',
  TIME_ATTACK = 'TIME_ATTACK',
  // Motos - Circuito
  MOTOGP = 'MOTOGP',
  MOTO2 = 'MOTO2',
  MOTO3 = 'MOTO3',
  SUPERBIKE = 'SUPERBIKE',
  SUPERSPORT = 'SUPERSPORT',
  // Motos - Endurance
  EWC = 'EWC',
  BOL_DOR = 'BOL_DOR',
  ENDURANCE_24H = 'ENDURANCE_24H',
  // Motos - Motocross
  MXGP = 'MXGP',
  MX2 = 'MX2',
  EMX = 'EMX',
  // Motos - Enduro
  ENDUROGP = 'ENDUROGP',
  ISDE = 'ISDE',
  // Motos - Trial
  TRIALGP = 'TRIALGP',
  TRIAL2 = 'TRIAL2',
  // Motos - Velocidad
  NAKED = 'NAKED',
  SPORT = 'SPORT',
  CLASSIC = 'CLASSIC',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  [VehicleType.FORMULA_1]: 'Fórmula 1',
  [VehicleType.FORMULA_2]: 'Fórmula 2',
  [VehicleType.FORMULA_3]: 'Fórmula 3',
  [VehicleType.FORMULA_4]: 'Fórmula 4',
  [VehicleType.FORMULA_FORD]: 'Formula Ford',
  [VehicleType.GT3]: 'GT3',
  [VehicleType.GT4]: 'GT4',
  [VehicleType.LMP]: 'LMP',
  [VehicleType.PROTOTYPE]: 'Prototype',
  [VehicleType.TCR]: 'TCR',
  [VehicleType.WTCC]: 'WTCC',
  [VehicleType.SUPERCARS]: 'Supercars',
  [VehicleType.WRC]: 'WRC',
  [VehicleType.R5]: 'R5',
  [VehicleType.HISTORIC_RALLY]: 'Historic Rally',
  [VehicleType.INDYCAR]: 'IndyCar',
  [VehicleType.FORMULA_E]: 'Formula E',
  [VehicleType.DRIFT_PRO]: 'Drift Pro',
  [VehicleType.TIME_ATTACK]: 'Time Attack',
  [VehicleType.MOTOGP]: 'MotoGP',
  [VehicleType.MOTO2]: 'Moto2',
  [VehicleType.MOTO3]: 'Moto3',
  [VehicleType.SUPERBIKE]: 'Superbike',
  [VehicleType.SUPERSPORT]: 'Supersport',
  [VehicleType.EWC]: 'EWC',
  [VehicleType.BOL_DOR]: "Bol d'Or",
  [VehicleType.ENDURANCE_24H]: '24h Endurance',
  [VehicleType.MXGP]: 'MXGP',
  [VehicleType.MX2]: 'MX2',
  [VehicleType.EMX]: 'EMX',
  [VehicleType.ENDUROGP]: 'EnduroGP',
  [VehicleType.ISDE]: 'ISDE',
  [VehicleType.TRIALGP]: 'TrialGP',
  [VehicleType.TRIAL2]: 'Trial2',
  [VehicleType.NAKED]: 'Naked',
  [VehicleType.SPORT]: 'Sport',
  [VehicleType.CLASSIC]: 'Classic',
};

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId: number;
  teamName?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  active: boolean;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  primaryCategory: VehicleCategory;
  contactEmail?: string;
  contactPhone?: string;
  headquartersLocation?: string;
  active: boolean;
  createdAt: string;
  membersCount: number;
  vehiclesCount: number;
}

export enum SessionType {
  PRACTICE = 'PRACTICE',
  QUALIFYING = 'QUALIFYING',
  RACE = 'RACE',
  TEST = 'TEST',
  SHAKEDOWN = 'SHAKEDOWN',
  TIME_ATTACK = 'TIME_ATTACK',
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  [SessionType.PRACTICE]: 'Libres',
  [SessionType.QUALIFYING]: 'Clasificación',
  [SessionType.RACE]: 'Carrera',
  [SessionType.TEST]: 'Test',
  [SessionType.SHAKEDOWN]: 'Shakedown',
  [SessionType.TIME_ATTACK]: 'Time Attack',
};

// ─── Events ─────────────────────────────────────────────────────────────────

export enum EventType {
  RACE = 'RACE',
  TEST = 'TEST',
  PRACTICE = 'PRACTICE',
  QUALIFYING = 'QUALIFYING',
  TRAINING = 'TRAINING',
  TRAVEL = 'TRAVEL',
  MEETING = 'MEETING',
  MAINTENANCE = 'MAINTENANCE',
  PRESENTATION = 'PRESENTATION',
  MEDIA = 'MEDIA',
  SPONSOR_EVENT = 'SPONSOR_EVENT',
  SHAKEDOWN = 'SHAKEDOWN',
  TRACKDAY = 'TRACKDAY',
  OTHER = 'OTHER',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.RACE]: 'Carrera',
  [EventType.TEST]: 'Test',
  [EventType.PRACTICE]: 'Libres',
  [EventType.QUALIFYING]: 'Clasificación',
  [EventType.TRAINING]: 'Entrenamiento',
  [EventType.TRAVEL]: 'Viaje',
  [EventType.MEETING]: 'Reunión',
  [EventType.MAINTENANCE]: 'Mantenimiento',
  [EventType.PRESENTATION]: 'Presentación',
  [EventType.MEDIA]: 'Medios',
  [EventType.SPONSOR_EVENT]: 'Evento sponsor',
  [EventType.SHAKEDOWN]: 'Shakedown',
  [EventType.TRACKDAY]: 'Track day',
  [EventType.OTHER]: 'Otro',
};

export enum EventStatus {
  PLANNED = 'PLANNED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
  WEATHER_DELAY = 'WEATHER_DELAY',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  [EventStatus.PLANNED]: 'Planificado',
  [EventStatus.CONFIRMED]: 'Confirmado',
  [EventStatus.IN_PROGRESS]: 'En curso',
  [EventStatus.COMPLETED]: 'Completado',
  [EventStatus.CANCELLED]: 'Cancelado',
  [EventStatus.POSTPONED]: 'Pospuesto',
  [EventStatus.WEATHER_DELAY]: 'Retraso por clima',
  [EventStatus.TECHNICAL_ISSUE]: 'Problema técnico',
};

export interface EventParticipant {
  id: number;
  fullName: string;
  role?: string;
}

export interface EventVehicle {
  id: number;
  name: string;
  vehicleType?: string;
}

export interface Event {
  id: number;
  name: string;
  description?: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  location?: string;
  circuitName?: string;
  status: EventStatus;
  notes?: string;
  budgetAllocated?: number;
  actualCost?: number;
  teamId: number;
  participants: EventParticipant[];
  vehicles: EventVehicle[];
}

export enum TrackCondition {
  DRY = 'DRY',
  WET = 'WET',
  MIXED = 'MIXED',
  DAMP = 'DAMP',
}

export const TRACK_CONDITION_LABELS: Record<TrackCondition, string> = {
  [TrackCondition.DRY]: 'Seco',
  [TrackCondition.WET]: 'Lluvia',
  [TrackCondition.MIXED]: 'Mixto',
  [TrackCondition.DAMP]: 'Húmedo',
};

export enum TireCompound {
  SOFT = 'SOFT',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  INTERMEDIATE = 'INTERMEDIATE',
  WET = 'WET',
  SLICK = 'SLICK',
  RAIN = 'RAIN',
  UNKNOWN = 'UNKNOWN',
}

export interface LapTime {
  id: number;
  lapNumber: number;
  lapTimeMs: number;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  valid: boolean;
  compound?: TireCompound;
  fuelKg?: number;
  notes?: string;
}

export interface Session {
  id: number;
  name: string;
  circuit?: string;
  sessionDate: string;
  sessionType: SessionType;
  trackCondition?: TrackCondition;
  durationMinutes?: number;
  notes?: string;
  trackTempC?: number;
  ambientTempC?: number;
  humidityPct?: number;
  windKph?: number;
  setupNotes?: string;
  teamId: number;
  vehicleId?: number;
  vehicleName?: string;
  driverId?: number;
  driverName?: string;
  lapCount: number;
  laps?: LapTime[];
}

export interface LapAnalytics {
  lapNumber: number;
  lapTimeMs: number;
  sector1Ms?: number;
  sector2Ms?: number;
  sector3Ms?: number;
  gapToBestMs?: number;
  valid: boolean;
  outlier: boolean;
  compound?: string;
}

// ─── Advanced analytics (Python microservice responses) ──────────────────────

export interface StintCluster {
  stintIndex: number;
  lapNumbers: number[];
  lapsCount: number;
  meanMs: number;
  bestMs: number;
  degradationMsPerLap?: number;
  dominantCompound?: string;
}

export interface StintsAnalysis {
  method: string;
  nStints: number;
  stints: StintCluster[];
  lapToStint: Record<string, number>;
}

export interface AnomalyResult {
  lapNumber: number;
  isAnomaly: boolean;
  anomalyScore: number;
}

export interface AnomaliesAnalysis {
  method: string;
  anomalies: AnomalyResult[];
  nAnomalies: number;
}

export interface DegradationModel {
  degree: number;
  coefficients: number[];
  rSquared: number;
  predictedAtLap: Record<string, number>;
}

export interface DegradationAnalysis {
  linear: DegradationModel;
  polynomial: DegradationModel;
  chosen: 'linear' | 'polynomial';
}

export interface HeatmapAnalysis {
  lapNumbers: number[];
  sectors: string[];
  gapMs: (number | null)[][];
  bestMsPerSector: (number | null)[];
}

export interface Insight {
  severity: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  title: string;
  detail: string;
}

export interface InsightsAnalysis {
  insights: Insight[];
}

export interface SessionAnalytics {
  sessionId: number;
  sessionName: string;
  totalLaps: number;
  validLaps: number;
  invalidLaps: number;
  bestLapMs?: number;
  bestLapNumber?: number;
  worstLapMs?: number;
  averageMs?: number;
  medianMs?: number;
  stdDevMs?: number;
  bestSector1Ms?: number;
  bestSector2Ms?: number;
  bestSector3Ms?: number;
  theoreticalBestLapMs?: number;
  degradationMsPerLap?: number;
  degradationR2?: number;
  perLap: LapAnalytics[];
}

export interface Vehicle {
  id: number;
  name: string;
  vehicleType: VehicleType;
  category: VehicleCategory;
  chassisNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  manufacturer?: string;
  model?: string;
  yearManufactured?: number;
  totalHours: number;
  totalKilometers: number;
  lastMaintenance?: string;
  nextMaintenanceHours?: number;
  nextMaintenanceKm?: number;
  status: VehicleStatus;
  notes?: string;
  active: boolean;
  needsMaintenance: boolean;
  teamId: number;
}
