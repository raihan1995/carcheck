import type { SpecCandidate } from "./car-specs-lookup";

export type SummaryStatus = {
  label: string;
  state: "success" | "danger" | "unknown";
  detail: string;
};

export interface VehicleData {
  registrationNumber: string;
  make?: string;
  colour?: string;
  fuelType?: string;
  co2Emissions?: number;
  engineCapacity?: number;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  monthOfFirstDvlaRegistration?: string;
  motStatus?: string;
  motExpiryDate?: string;
  taxStatus?: string;
  taxDueDate?: string;
  artEndDate?: string;
  markedForExport?: boolean;
  typeApproval?: string;
  revenueWeight?: number;
  wheelplan?: string;
  euroStatus?: string;
  realDrivingEmissions?: string;
  dateOfLastV5CIssued?: string;
}
export interface MotTestItem {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: string;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  dataSource?: string;
  rfrAndComments?: Array<{ text: string; type: string; dangerous?: boolean }>;
  defects?: Array<{ text: string; type: string; dangerous?: boolean }>;
}
export interface MotHistoryVehicle {
  registration?: string;
  make?: string;
  model?: string;
  firstUsedDate?: string;
  fuelType?: string;
  primaryColour?: string;
  vehicleId?: string;
  registrationDate?: string;
  manufactureDate?: string;
  engineSize?: string;
  hasOutstandingRecall?: string;
  motTests?: MotTestItem[];
}
export type VehicleCheckResult = {
  vehicle: VehicleData;
  motHistory: MotHistoryVehicle[] | null;
  specCandidates: SpecCandidate[];
  suggestedSpecId: string | null;
  performanceUnlocked: boolean;
  ulezEstimate: SummaryStatus;
  retrievedAt: string;
  sample?: boolean;
  demo?: boolean;
};
