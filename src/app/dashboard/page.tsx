import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid md:grid-cols-2 gap-6">

        <Link
          href="/register-property"
          className="border rounded-xl p-6 block"
        >
          Register Property
        </Link>

        <Link
          href="/verify-property"
          className="border rounded-xl p-6 block"
        >
          Verify Property
        </Link>

        <Link
          href="/report"
          className="border rounded-xl p-6 block"
        >
          Submit Blacklist Report
        </Link>

        <Link
          href="/practitioners"
          className="border rounded-xl p-6 block"
        >
          Find Practitioners
        </Link>

      </div>
    </div>
  );
}
