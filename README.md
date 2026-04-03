# Kafu — Employee Recognition System

An internal employee recognition platform built for ADAA.

## Quick Start

```bash
docker compose up --build -d
```

Seed the database with demo users:

```bash
docker compose exec app npx tsx scripts/seed.ts
```

The app will be available at [http://localhost:3011](http://localhost:3011).

## Demo Users

All demo accounts use the password: `password123`

| Name | Email | Department |
|------|-------|------------|
| Sarah Al-Rashid | sarah@adaa.gov.sa | Engineering |
| Omar Khalid | omar@adaa.gov.sa | Design |
| Fatima Hassan | fatima@adaa.gov.sa | Product |
| Ahmed Nasser | ahmed@adaa.gov.sa | Engineering |
| Noura Al-Salem | noura@adaa.gov.sa | Operations |
| Khalid Mansour | khalid@adaa.gov.sa | Design |
| Layla Ibrahim | layla@adaa.gov.sa | Product |
| Yousef Al-Tamimi | yousef@adaa.gov.sa | Engineering |
| Mona Abdulaziz | mona@adaa.gov.sa | Operations |
| Tariq Al-Harbi | tariq@adaa.gov.sa | Engineering |

## Development

```bash
npm run dev
```

Runs on [http://localhost:3002](http://localhost:3002) in development mode.
