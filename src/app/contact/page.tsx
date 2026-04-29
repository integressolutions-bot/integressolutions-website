export default function ContactPage() {
  return (
    <main className="container section">
      <h1>Contact Us</h1>
      <div className="grid grid-3">
        <div className="card"><h3>Address</h3><p>40 Ajao Road, Surulere, Lagos</p></div>
        <div className="card"><h3>Phone</h3><p>08021049037<br/>08091784703<br/>08037265455</p></div>
        <div className="card"><h3>Email</h3><p>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@integressolutions.com"}</p></div>
      </div>
    </main>
  );
}
