 "use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="container">
      <nav className="nav">
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.2rem" }}>
          Integres Solutions
        </Link>
        
        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link href="/psid">PSID</Link>
          <Link href="/blacklist">Blacklist</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/practitioners">Practitioners</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
        
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: "none", background: "none", border: "none", color: "white", fontSize: "1.5rem" }}
        >
          ☰
        </button>
      </nav>
      
      <style jsx>{`
        @media (max-width: 700px) {
          .mobile-menu-button { display: block !important; }
          .nav-links { display: none; flex-direction: column; width: 100%; padding: 1rem 0; }
          .nav-links.open { display: flex; }
          .nav { flex-wrap: wrap; }
        }
      `}</style>
    </header>
  );
}