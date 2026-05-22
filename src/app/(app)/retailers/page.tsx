import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRetailers } from "@/lib/data/retailers";
import { RetailersPage } from "@/components/retailers/retailers-page";

export default async function RetailersRoute() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/dashboard");

  const retailers = await getRetailers();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Retailers</h1>
      <p className="mt-1 text-muted">Manage retail pharmacies and shops with portal access</p>
      <div className="mt-8">
        <RetailersPage initialRetailers={retailers} />
      </div>
    </div>
  );
}
