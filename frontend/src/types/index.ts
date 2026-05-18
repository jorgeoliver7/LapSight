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

// Debe mantenerse sincronizado con com.racingteam.model.VehicleType
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
