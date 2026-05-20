import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const psidRegistrations = pgTable("psid_registrations", {
  id: serial().primaryKey(),
  serial: text().notNull(),
  itemName: text("item_name").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  ownerPhone: text("owner_phone"),
  notes: text(),
  paymentStatus: text("payment_status").notNull().default("pending_payment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
