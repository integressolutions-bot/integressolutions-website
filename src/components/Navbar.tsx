"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return (
    <header className="container">
      <nav className="nav">
        <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 800, fontSize: "1.2rem" }}>
          <Image src="/logo.png" alt="Integres Solutions" width={40} height={40} />
          <span>Integres Solutions</span>
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link href="/psid">PSID</Link>
          <Link href="/blacklist">Blacklist</Link>
          <Link href="/practitioners">Practitioners</Link>
          {user ? (
            <>
              <Link href="/report">Report</Link>
              <Link href="/register-property">Register Property</Link>
              <button onClick={logout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "white",
            fontSize: "1.5rem",
          }}
        >
          ☰
        </button>
      </nav>

      <style jsx>{`
        @media (max-width: 700px) {
          .mobile-menu-button {
            display: block !important;
          }
          .nav-links {
            display: none;
            flex-direction: column;
            width: 100%;
            padding: 1rem 0;
          }
          .nav-links.open {
            display: flex;
          }
          .nav {
            flex-wrap: wrap;
          }
        }
        .nav-button {
          background: transparent;
          border: 0;
          color: #ffb4b4;
          cursor: pointer;
          font: inherit;
          padding: 0;
        }
      `}</style>
    </header>
  );
}