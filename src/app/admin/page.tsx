export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-bold">
            Pending Reports
          </h2>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-bold">
            Practitioners
          </h2>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-bold">
            Registered Properties
          </h2>
        </div>

      </div>
    </div>
  );
}
