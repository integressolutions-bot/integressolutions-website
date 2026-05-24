 # Integres Solutions Website

Secure identification, accountability, and dispute resolution for modern communities.

Integres Solutions Limited provides a digital platform for PSID (Property Secure ID) asset verification, blacklist checking and reporting, and mediation routing. This repository contains the public-facing Next.js frontend.

## ✨ Features

- **PSID Verification** – Verify assets by serial number, view ownership status, and report stolen property.
- **Blacklist Search** – Free public check of individuals/companies; paid reporting and removal workflows.
- **Property Registration** – Register assets under categories (Electronics, Vehicle, Real Estate, Jewelry, etc.) and generate a unique PSID with QR code.
- **Practitioner Portal** – NBA‑verified legal practitioners can manage blacklist disputes and mediation cases.
- **Law Enforcement Portal** – Authorized personnel can track stolen property reports (demo access available).
- **User Dashboard** – Overview of your properties, reports, and active mediation cases.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom global styles)
- **Deployment**: Netlify (frontend)
- **Backend**: Railway (Node.js + MongoDB) – not included in this repository
- **API Communication**: Netlify proxy (`/api/*`) to backend

## 📦 Local Development

### Prerequisites
- Node.js 18+ and npm
- Backend service running (Railway or local)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/integressolutions-bot/integressolutions-website.git
   cd integressolutions-website