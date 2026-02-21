// app/contracts/[id]/page.tsx
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ContractApiResponse =
  | { ok: true; data: any }
  | { ok: false; error: string };

async function getContract(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/contracts/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  const payload = (await res.json()) as ContractApiResponse;

  if (!payload || payload.ok !== true) return null;

  return payload.data;
}

export default async function ContractPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getContract(params.id);

  if (!data) return notFound();

  // IMPORTANT: keep JSX directly after return (or wrap in parentheses)
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h1 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>
        Contract Detail
      </h1>

      <pre
        style={{
          background: "#111",
          color: "#eee",
          padding: 16,
          borderRadius: 12,
          overflowX: "auto",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
