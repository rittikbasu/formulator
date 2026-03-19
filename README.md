# Formulator

I built this Formula 1 client because of my newfound love for F1 racing. Stay updated with all the stats, scores, and standings in a beautifully designed UI that's as fast as your favorite team on race day!

![formulator](<https://ik.imagekit.io/zwcfsadeijm/Neutral%20Minimalistic%20Motivational%20Quote%20Twitter%20Post%20(1)_7wiried9z.png?updatedAt=1716395475970>)

## Features

- Driver standings
- Constructor standings
- Race cards and race results
- Circuit stats
- Historical data (upto 2023 currently)

## Tech Stack

- **Frontend**: Next.js Pages Router, Tailwind CSS
- **Data**: Jolpica (Ergast-compatible), OpenF1, Formula1.com circuit-page scraping
- **Deployment**: Vercel

## Environment

The app works with these optional environment variables:

```bash
JOLPICA_BASE_URL=https://api.jolpi.ca
OPENF1_BASE_URL=https://api.openf1.org/v1
F1_FETCH_TIMEOUT_MS=5000
```

A sample file is included at `.env.example`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Run checks:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

## Notes

- Season pages use blocking ISR, so the build no longer depends on live upstream API calls.
- OpenF1 and the circuit scraper are treated as optional enrichments. If they partially fail, the pages still render with reduced detail instead of crashing.
