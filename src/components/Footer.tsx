import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-3">
        <div>
          <strong>Integres Solutions Limited</strong>
          <p>40 Ajao Road, Surulere, Lagos.</p>
        </div>
        <div>
          <p>Email: {process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@integressolutions.com"}</p>
          <p>Phone: {process.env.NEXT_PUBLIC_CONTACT_PHONE || "08021049037"}</p>
        </div>
        <div className="nav-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refund</Link>
        </div>
      </div>
    </footer>
  );
}
