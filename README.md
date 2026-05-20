# Integres Solutions Website

## Run locally

1. Copy `.env.example` to `.env.local`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Deploy on Vercel

1. Push this folder to GitHub
2. Import the repository into Vercel
3. Add your environment variables in Vercel
4. Point `integressolutions.com` from Namecheap to Vercel

## Recommended DNS

- `integressolutions.com` -> Vercel
- `www.integressolutions.com` -> Vercel
- later: `api.integressolutions.com` -> backend
- later: `portal.integressolutions.com` -> practitioner portal
