import { db } from "../../db";
import { psidRegistrations } from "../../db/schema";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ success: false, message: "Method not allowed" }, { status: 405 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid registration details" }, { status: 400 });
  }

  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const serial = readString(body.serial);
  const itemName = readString(body.itemName);
  const ownerName = readString(body.ownerName);
  const ownerEmail = readString(body.ownerEmail).toLowerCase();
  const ownerPhone = readString(body.ownerPhone) || null;
  const notes = readString(body.notes) || null;

  if (!serial || !itemName || !ownerName || !ownerEmail) {
    return Response.json(
      { success: false, message: "Serial, item name, owner name, and email are required" },
      { status: 400 },
    );
  }

  if (!emailPattern.test(ownerEmail)) {
    return Response.json({ success: false, message: "Enter a valid email address" }, { status: 400 });
  }

  const [registration] = await db
    .insert(psidRegistrations)
    .values({ serial, itemName, ownerName, ownerEmail, ownerPhone, notes })
    .returning({
      id: psidRegistrations.id,
      serial: psidRegistrations.serial,
      paymentStatus: psidRegistrations.paymentStatus,
      createdAt: psidRegistrations.createdAt,
    });

  return Response.json({ success: true, data: registration }, { status: 201 });
}

export const config = {
  path: "/api/psid-registration",
};
