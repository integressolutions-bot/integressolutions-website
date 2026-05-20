import QRCode from "react-qr-code";

export default function PropertyCard({ property }: any) {
  return (
    <div className="border rounded-xl p-6 shadow">
      <h2 className="text-xl font-bold">{property.propertyName}</h2>

      <p>PSID: {property.code}</p>
      <p>Owner: {property.owner}</p>
      <p>Status: {property.status}</p>

      <div className="bg-white p-4 inline-block mt-4">
        <QRCode value={property.code} />
      </div>
    </div>
  );
}
