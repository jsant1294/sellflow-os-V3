import Link from "next/link";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="card empty stack">
      <strong>No items yet</strong>
      <div>{message}</div>
      <div>
        <Link href="/add" className="btn">Add your first item</Link>
      </div>
    </div>
  );
}
