import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getContract(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/contracts/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const payload = await res.json();
  return payload?.ok ? payload.data : null;
}

export default async function ContractPage({ params }: { params: { id: string } }) {
  const data = await getContract(params.id);
  if (!data) return notFound();

  // render using `data`
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
