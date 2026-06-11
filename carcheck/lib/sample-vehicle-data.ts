import type { MotHistoryVehicle, VehicleData } from "@/app/api/check/route";
import type { SpecCandidate } from "@/lib/car-specs-lookup";

export const SAMPLE_REGISTRATION = "SAMPLE";

export type SampleVehicleCheckResult = {
  vehicle: VehicleData;
  motHistory: MotHistoryVehicle[];
  specCandidates: SpecCandidate[];
  suggestedSpecId: string;
  sample: true;
};

export function isSampleRegistration(registration: string): boolean {
  return registration.replace(/\s+/g, "").toUpperCase() === SAMPLE_REGISTRATION;
}

export function getSampleVehicleCheck(): SampleVehicleCheckResult {
  const vehicle: VehicleData = {
    registrationNumber: SAMPLE_REGISTRATION,
    make: "FORD",
    colour: "BLUE",
    fuelType: "PETROL",
    co2Emissions: 108,
    engineCapacity: 999,
    yearOfManufacture: 2019,
    monthOfFirstRegistration: "2019-03",
    monthOfFirstDvlaRegistration: "2019-03",
    motStatus: "Valid",
    motExpiryDate: "2026-09-14",
    taxStatus: "Taxed",
    taxDueDate: "2026-04-01",
    markedForExport: false,
    typeApproval: "M1",
    revenueWeight: 0,
    wheelplan: "2 AXLE RIGID BODY",
    euroStatus: "EURO 6",
    dateOfLastV5CIssued: "2022-11-08",
  };

  const motHistory: MotHistoryVehicle[] = [
    {
      registration: SAMPLE_REGISTRATION,
      make: "FORD",
      model: "FOCUS",
      fuelType: "Petrol",
      primaryColour: "Blue",
      engineSize: "999",
      registrationDate: "2019-03-15T00:00:00.000Z",
      firstUsedDate: "2019-03-15T00:00:00.000Z",
      manufactureDate: "2019-02-01T00:00:00.000Z",
      hasOutstandingRecall: "No",
      vehicleId: "sample-vehicle-id",
      motTests: [
        {
          completedDate: "2019-09-10T10:30:00.000Z",
          testResult: "PASSED",
          expiryDate: "2020-09-09",
          odometerValue: "12450",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-1",
          rfrAndComments: [{ text: "Nearside Front Tyre worn close to legal limit", type: "ADVISORY" }],
        },
        {
          completedDate: "2020-09-08T11:15:00.000Z",
          testResult: "PASSED",
          expiryDate: "2021-09-07",
          odometerValue: "24890",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-2",
          rfrAndComments: [],
        },
        {
          completedDate: "2021-09-12T09:45:00.000Z",
          testResult: "PASSED",
          expiryDate: "2022-09-11",
          odometerValue: "38200",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-3",
          rfrAndComments: [{ text: "Offside Rear Brake pad(s) wearing thin", type: "ADVISORY" }],
        },
        {
          completedDate: "2022-08-29T10:15:00.000Z",
          testResult: "FAILED",
          odometerValue: "51920",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-4-fail",
          rfrAndComments: [
            {
              text: "Nearside Front Brake pad(s) less than 1.5 mm thick (1.1 mm)",
              type: "MAJOR",
            },
            {
              text: "Offside Rear Brake disc worn, pitted or scored, but not seriously weakened",
              type: "ADVISORY",
            },
          ],
        },
        {
          completedDate: "2022-09-14T14:20:00.000Z",
          testResult: "PASSED",
          expiryDate: "2023-09-13",
          odometerValue: "52100",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-4",
          rfrAndComments: [],
        },
        {
          completedDate: "2023-09-11T10:05:00.000Z",
          testResult: "PASSED",
          expiryDate: "2024-09-10",
          odometerValue: "65480",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-5",
          rfrAndComments: [],
        },
        {
          completedDate: "2024-09-09T13:40:00.000Z",
          testResult: "PASSED",
          expiryDate: "2025-09-08",
          odometerValue: "77820",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-6",
          rfrAndComments: [{ text: "Windscreen washer provides insufficient washer liquid", type: "ADVISORY" }],
        },
        {
          completedDate: "2025-09-14T11:55:00.000Z",
          testResult: "PASSED",
          expiryDate: "2026-09-13",
          odometerValue: "89450",
          odometerUnit: "mi",
          dataSource: "DVSA",
          motTestNumber: "sample-mot-7",
          rfrAndComments: [],
        },
      ],
    },
  ];

  const specCandidates: SpecCandidate[] = [
    {
      id: "sample-zetec",
      label: "1.0 EcoBoost 125 Zetec",
      bhp: 125,
      torque: 170,
      gearbox: "Manual 6-speed",
      drivetrain: "FWD",
      acceleration0100: 11.2,
      topSpeedMph: 120,
      matchedVariant: "1.0 EcoBoost Zetec",
    },
    {
      id: "sample-st-line",
      label: "1.0 EcoBoost 125 ST-Line",
      bhp: 125,
      torque: 170,
      gearbox: "Manual 6-speed",
      drivetrain: "FWD",
      acceleration0100: 11.0,
      topSpeedMph: 122,
      matchedVariant: "1.0 EcoBoost ST-Line",
    },
    {
      id: "sample-auto",
      label: "1.0 EcoBoost 125 Auto",
      bhp: 125,
      torque: 170,
      gearbox: "Automatic",
      drivetrain: "FWD",
      acceleration0100: 11.8,
      topSpeedMph: 118,
      matchedVariant: "1.0 EcoBoost Auto",
    },
  ];

  return {
    vehicle,
    motHistory,
    specCandidates,
    suggestedSpecId: "sample-st-line",
    sample: true,
  };
}
