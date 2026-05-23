import QRCode from "react-qr-code";

interface PropertyCardProps {
  property: {
    psid: string;
    address: string;
    ownerName: string;
    status: "verified" | "flagged" | "stolen" | "pending";
    category?: string;
    registrationDate?: string;
  };
  showQR?: boolean;
}

export default function PropertyCard({ property, showQR = true }: PropertyCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "text-green-600 bg-green-50";
      case "flagged": return "text-yellow-600 bg-yellow-50";
      case "stolen": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="border rounded-xl p-6 shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold mb-2">{property.address || property.psid}</h2>
      
      <div className="space-y-1 text-sm">
        <p><strong>PSID:</strong> <span className="font-mono">{property.psid}</span></p>
        <p><strong>Owner:</strong> {property.ownerName}</p>
        {property.category && <p><strong>Category:</strong> {property.category}</p>}
        <p>
          <strong>Status:</strong> 
          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </p>
        {property.registrationDate && (
          <p><strong>Registered:</strong> {new Date(property.registrationDate).toLocaleDateString()}</p>
        )}
      </div>

      {showQR && (
        <div className="bg-white p-4 inline-block mt-4 rounded-lg border">
          <QRCode value={property.psid} size={120} />
          <p className="text-xs text-gray-500 mt-2 text-center">Scan to verify</p>
        </div>
      )}
    </div>
  );
}