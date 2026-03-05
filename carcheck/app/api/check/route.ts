import { NextRequest, NextResponse } from "next/server";

const DVLA_API_URL =
  "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

export interface VehicleData {
  registrationNumber: string;
  make?: string;
  colour?: string;
  fuelType?: string;
  co2Emissions?: number;
  engineCapacity?: number;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  motStatus?: string;
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

function normalizeRegistration(vrn: string): string {
  return vrn.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawVrn = body?.registrationNumber ?? body?.plate ?? "";

    if (!rawVrn || typeof rawVrn !== "string") {
      return NextResponse.json(
        { error: "Please provide a registration number (e.g. AB12 CDE)." },
        { status: 400 }
      );
    }

    const registrationNumber = normalizeRegistration(rawVrn);

    if (registrationNumber.length < 2 || registrationNumber.length > 8) {
      return NextResponse.json(
        { error: "Invalid UK registration format." },
        { status: 400 }
      );
    }

    const apiKey = process.env.DVLA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Vehicle check is not configured.",
          hint: "Add DVLA_API_KEY to your environment. Get a free key at https://register-for-ves.driver-vehicle-licensing.api.gov.uk/",
          demo: true,
          registrationNumber,
          mock: getMockVehicleData(registrationNumber),
        },
        { status: 503 }
      );
    }

    const res = await fetch(DVLA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ registrationNumber }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: "Vehicle not found for this registration." },
          { status: 404 }
        );
      }
      if (res.status === 400 && data?.errors?.[0]) {
        return NextResponse.json(
          { error: data.errors[0].detail || "Invalid request." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Unable to check vehicle. Please try again later." },
        { status: res.status >= 500 ? 503 : 400 }
      );
    }

    return NextResponse.json(data as VehicleData);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

function getMockVehicleData(registrationNumber: string): VehicleData {
  return {
    registrationNumber,
    make: "EXAMPLE",
    colour: "SILVER",
    fuelType: "PETROL",
    co2Emissions: 142,
    engineCapacity: 1598,
    yearOfManufacture: 2018,
    monthOfFirstRegistration: "2018-06",
    motStatus: "Valid",
    taxStatus: "Taxed",
    taxDueDate: "2025-06-01",
    markedForExport: false,
  };
}
