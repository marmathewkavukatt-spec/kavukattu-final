# Kavukattu Project

## Tech Stack
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS + PostCSS
- Prisma ORM
- MySQL (via `DATABASE_URL`)
- Cloudinary (media storage)
- EmailJS (contact form)
- Other libs: `jose` (JWT), `bcryptjs` (password hashing), `sharp` (image processing), `pdfkit` (PDF generation)

## Run Locally
### Prerequisites
- Node.js (18+ recommended) and npm
- A MySQL database

### Setup
1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - Create `.env.local` (recommended for local dev)
   - Minimum required: `DATABASE_URL`
   - Optional (feature-dependent): Cloudinary + EmailJS keys and security secrets
   - Use `.env.production.example` as a reference for available variables (don’t copy secrets as-is).
3. Set up the database (Prisma):
   - `npm run prisma:migrate`

### Start the dev server
- `npm run dev`
- Open `http://localhost:3000`

## Build / Run (Production)
- `npm run build`
- `npm run start`

## Useful Scripts
- `npm run lint`
- `npm run prisma:generate`
- `npm run create-admin`
