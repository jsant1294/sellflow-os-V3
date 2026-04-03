import Link from "next/link";
import { Header } from "@/components/Header";
import { ItemForm } from "@/components/ItemForm";
import { LucioWidget } from "@/components/LucioWidget";

export default function AddPage() {
  return (
    <main className="shell stack">
      <Header />
      <div>
        <Link href="/" className="btn-ghost">← Back to dashboard</Link>
      </div>
      <ItemForm />
      <LucioWidget />
    </main>
  );
}
