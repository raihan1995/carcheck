import { VehicleResults } from "@/app/components/VehicleResults";
export const metadata = {
  title: "Vehicle check results",
  robots: { index: false, follow: false },
};
export default async function VehiclePage({
  params,
}: {
  params: Promise<{ registration: string }>;
}) {
  const { registration } = await params;
  return (
    <VehicleResults
      key={registration}
      registration={registration.toUpperCase()}
    />
  );
}
