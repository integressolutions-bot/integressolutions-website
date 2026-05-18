import Link from "next/link";

export function Navbar() {
  return (
    <header className="container">
      <nav className="nav">
        <Link href="/" style={{ fontWeight: 800 }}>Integres Solutions</Link>
        <div className="nav-links">
          <Link href="/psid">PSID</Link>
          <Link href="/blacklist">Blacklist</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </nav>
    </header>
  );
}
