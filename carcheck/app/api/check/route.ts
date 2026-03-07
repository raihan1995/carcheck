import { NextRequest, NextResponse } from "next/server";

const DVLA_API_URL =
  "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

const MOT_API_BASE = "https://history.mot.api.gov.uk";

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
  /** New API uses defects; mapped to rfrAndComments in fetch */
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

function normalizeRegistration(vrn: string): string {
  return vrn.replace(/\s+/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const isDebug = () =>
  process.env.API_CHECK_DEBUG === "1" || process.env.DEBUG === "1";

function logApiCheckError(err: unknown, context?: string): void {
  const prefix = "[api/check]";
  const label = context ? `${prefix} ${context}` : prefix;
  console.error(label, err);
  if (err instanceof Error && err.stack) console.error(err.stack);
}

function getDiagnostic(err: unknown): { message: string; stack?: string } {
  if (err instanceof Error) {
    return {
      message: err.message,
      ...(isDebug() && err.stack && { stack: err.stack }),
    };
  }
  const e = err as { message?: string; stack?: string };
  return {
    message: e?.message ?? String(err),
    ...(isDebug() && e?.stack && { stack: e.stack }),
  };
}

async function getMotAccessToken(): Promise<string | null> {
  const clientId = process.env.MOT_CLIENT_ID;
  const clientSecret = process.env.MOT_CLIENT_SECRET;
  const scope = process.env.MOT_SCOPE_URL ?? "https://tapi.dvsa.gov.uk/.default";
  const tokenUrl = process.env.MOT_TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) return null;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

async function fetchMotHistory(
  registrationNumber: string,
  accessToken: string
): Promise<MotHistoryVehicle[] | null> {
  const apiKey = process.env.MOT_API_KEY;
  if (!apiKey) return null;

  const url = `${MOT_API_BASE}/v1/trade/vehicles/registration/${encodeURIComponent(registrationNumber)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const raw = await res.json().catch(() => null);
  if (!raw || typeof raw !== "object") return null;

  // New API returns a single vehicle object with motTests; map to MotHistoryVehicle[] shape
  const motTests = Array.isArray(raw.motTests) ? raw.motTests : [];
  const mappedTests: MotTestItem[] = motTests.map((t: Record<string, unknown>) => {
    const defects = (t.defects as Array<{ text?: string; type?: string; dangerous?: boolean }>) ?? [];
    return {
      completedDate: t.completedDate as string | undefined,
      testResult: t.testResult as string | undefined,
      expiryDate: t.expiryDate as string | undefined,
      odometerValue: t.odometerValue as string | undefined,
      odometerUnit: t.odometerUnit as string | undefined,
      odometerResultType: t.odometerResultType as string | undefined,
      motTestNumber: t.motTestNumber as string | undefined,
      dataSource: t.dataSource as string | undefined,
      rfrAndComments: defects.map((d) => ({
        text: d.text ?? "",
        type: d.type ?? "ADVISORY",
        dangerous: d.dangerous,
      })),
    };
  });

  const vehicle: MotHistoryVehicle = {
    registration: raw.registration as string | undefined,
    make: raw.make as string | undefined,
    model: raw.model as string | undefined,
    firstUsedDate: raw.firstUsedDate as string | undefined,
    fuelType: raw.fuelType as string | undefined,
    primaryColour: raw.primaryColour as string | undefined,
    vehicleId: raw.vehicleId as string | undefined,
    registrationDate: raw.registrationDate as string | undefined,
    manufactureDate: raw.manufactureDate as string | undefined,
    engineSize: raw.engineSize as string | undefined,
    hasOutstandingRecall: raw.hasOutstandingRecall as string | undefined,
    motTests: mappedTests,
  };
  return [vehicle];
}

async function performVehicleCheck(registrationNumber: string): Promise<{
  vehicle: VehicleData;
  motHistory: MotHistoryVehicle[] | null;
  demo?: boolean;
}> {
  const apiKey = process.env.DVLA_API_KEY;

  if (!apiKey) {
    return {
      vehicle: getMockVehicleData(registrationNumber),
      motHistory: null,
      demo: true,
    };
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
      throw { status: 404, message: "Vehicle not found for this registration." };
    }
    if (res.status === 400 && data?.errors?.[0]) {
      throw { status: 400, message: data.errors[0].detail || "Invalid request." };
    }
    throw {
      status: res.status >= 500 ? 503 : 400,
      message: "Unable to check vehicle. Please try again later.",
    };
  }

  const vehicle = data as VehicleData;
  let motHistory: MotHistoryVehicle[] | null = null;
  try {
    const token = await getMotAccessToken();
    if (token) {
      motHistory = await fetchMotHistory(registrationNumber, token);
    }
  } catch (motErr) {
    logApiCheckError(motErr, "MOT");
  }
  return { vehicle, motHistory };
}

export async function GET(request: NextRequest) {
  const registration = request.nextUrl.searchParams.get("registration");
  const vrn = registration?.trim() ?? "";

  if (!vrn) {
    return NextResponse.json(
      { error: "Missing registration. Use ?registration=AB12CDE" },
      { status: 400 }
    );
  }

  const registrationNumber = normalizeRegistration(vrn);
  if (registrationNumber.length < 2 || registrationNumber.length > 8) {
    return NextResponse.json(
      { error: "Invalid UK registration format." },
      { status: 400 }
    );
  }

  try {
    const result = await performVehicleCheck(registrationNumber);
    return NextResponse.json(result);
  } catch (err: unknown) {
    logApiCheckError(err, "GET");
    const e = err as { status?: number; message?: string };
    const payload: { error: string; diagnostic?: { message: string; stack?: string } } = {
      error: e.message ?? "Something went wrong.",
    };
    if (isDebug()) payload.diagnostic = getDiagnostic(err);
    return NextResponse.json(payload, { status: e.status ?? 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
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

    const result = await performVehicleCheck(registrationNumber);

    if (result.demo) {
      return NextResponse.json(
        {
          error: "Vehicle check is not configured.",
          hint: "Add DVLA_API_KEY to your environment.",
          demo: true,
          registrationNumber,
          vehicle: result.vehicle,
          motHistory: result.motHistory,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    logApiCheckError(err, "POST");
    const e = err as { status?: number; message?: string };
    const payload: { error: string; diagnostic?: { message: string; stack?: string } } = {
      error: e.message ?? "Something went wrong. Please try again.",
    };
    if (isDebug()) payload.diagnostic = getDiagnostic(err);
    return NextResponse.json(payload, { status: e.status ?? 500 });
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
