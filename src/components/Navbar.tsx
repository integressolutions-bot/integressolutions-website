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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="container">
      <nav className="nav">
        <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
          <Image
            src="/logo.png"
            alt="Integres Solutions"
            width={480}
            height={120}
            className="w-auto h-10"
            priority
          />
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
          <Link href="/psid" onClick={closeMobileMenu}>PSID</Link>
          <Link href="/blacklist" onClick={closeMobileMenu}>Blacklist</Link>
          <Link href="/practitioners" onClick={closeMobileMenu}>Practitioners</Link>
          {user ? (
            <>
              <Link href="/report" onClick={closeMobileMenu}>Report</Link>
              <Link href="/register-property" onClick={closeMobileMenu}>Register Property</Link>
              {user.role === "ADMIN" && (
                <Link href="/admin" onClick={closeMobileMenu}>Admin</Link>
              )}
              <button onClick={logout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMobileMenu}>Login</Link>
              <Link href="/register" onClick={closeMobileMenu}>Register</Link>
            </>
          )}
          <Link href="/about" onClick={closeMobileMenu}>About</Link>
          <Link href="/contact" onClick={closeMobileMenu}>Contact</Link>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          role="button"
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