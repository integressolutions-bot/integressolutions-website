import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero container">
        <span className="badge">Innovative solutions since 2008</span>
        <h1>Secure identification, accountability, and dispute resolution for modern communities.</h1>
        <p>
          Integres Solutions Limited provides practical digital services including PSID asset verification,
          blacklist checking and reporting, and a routed mediation ecosystem for case resolution.
        </p>
        <div className="button-row">
          <Link className="button" href="/blacklist">Run Free Blacklist Check</Link>
          <Link className="button secondary" href="/psid">Verify Item (PSID)</Link>
        </div>
      </section>

      <section className="section container">
        <h2>What we do</h2>
        <div className="grid grid-3">
          <div className="card">
            <h3>PSID</h3>
            <p>Verify assets, register items, report stolen property, and support recovery with owner-defined rewards.</p>
          </div>
          <div className="card">
            <h3>Integres Blacklist</h3>
            <p>Check records for free. Submit paid reports and paid removal requests under a moderated workflow.</p>
          </div>
          <div className="card">
            <h3>Mediation Routing</h3>
            <p>Escalated cases can be assigned to verified practitioners based on location, category, and availability.</p>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Pricing transparency</h2>
        <div className="price-list">
          <div className="price-item"><span>Blacklist check</span><strong>Free</strong></div>
          <div className="price-item"><span>Blacklist report (individual cases)</span><strong>From ₦15,000</strong></div>
          <div className="price-item"><span>Blacklist report (company cases)</span><strong>From ₦30,000</strong></div>
          <div className="price-item"><span>Blacklist removal</span><strong>Paid after resolution</strong></div>
          <div className="price-item"><span>Reports and removals</span><strong>Handled in the mobile app</strong></div>
        </div>
      </section>

      <section className="section container">
        <div className="notice">
          This website is your public entry point. The mobile apps and practitioner portal connect to the same backend for live verification, reporting, payments, and case handling.
        </div>
      </section>
    </main>
  );
}
