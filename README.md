# Health Backend

Express + TypeScript backend with React + Vite dashboard for healthcare IoT device monitoring (iWown H102CSH wearables).

## Architecture

- **Backend**: Node.js 20 + Express + TypeScript, Firebase Firestore
- **Frontend**: React + Vite + TypeScript, Recharts for charts
- **API**: REST, versioned at `/v1/api/`
- **Docs**: `openapi.yaml` (v2.0.0)

## Setup

### Prerequisites

- Node.js 20+
- Firebase project with Firestore enabled

### Environment Variables

```bash
cp .env.example .env
# Fill in your Firebase credentials
```

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (with `\n` for newlines) |
| `PORT` | Backend port (default: 3000) |

### Install & Run

```bash
# Backend (runs on http://localhost:3000)
npm install
npm run dev

# Frontend — separate terminal (runs on http://localhost:5173)
cd health-dashboard
npm install
npm run dev
```

## Docker

```bash
docker-compose up --build
```

Starts backend on port 3000 and frontend (nginx) on port 5173.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/v1/api/health-data` | Device list with latest vitals |
| GET | `/v1/api/alarms` | All alarm events |
| GET | `/v1/api/device/:id/vitals` | Heart rate, SpO2, BP, body temp |
| GET | `/v1/api/device/:id/wellness` | Sleep, HRV, stress, activity overview |
| GET | `/v1/api/device/:id/diagnostics` | ECG data |
| GET | `/v1/api/device/:id/safety` | GPS location track |
| GET | `/v1/api/device/:id/info` | Device hardware info (battery, signal, firmware) |
| GET | `/v1/api/device/:id/sos` | SOS, fall, and sedentary alarm events |
| GET | `/v1/api/device/:id/bloodsugar` | Blood glucose readings |
| GET | `/v1/api/device/:id/bloodketone` | Blood ketone readings |
| GET | `/v1/api/device/:id/uricacid` | Uric acid readings |
| POST | `/v1/4g/pb/upload` | Device data ingestion endpoint |

Full schema: see `openapi.yaml`.
