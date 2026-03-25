## Local development (Docker + running apps)

This guide is for running Novu **locally for development**, using Docker for dependencies (Mongo/Redis/etc) and running the apps (API/Worker/WS/Dashboard) on your machine.

### Prerequisites

- Node.js **22.x** (Novu expects `>=22 <23`)
- `pnpm`
- Docker

### 1) Install dependencies

From the repo root:

```bash
pnpm install
```

### 2) Start dependency services (Docker)

From the repo root:

```bash
cp docker/.env.example docker/.env
```

Edit `docker/.env` and set:

- `JWT_SECRET`
- `STORE_ENCRYPTION_KEY` (**must be 32 characters**)

Then start the containers:

```bash
docker compose --env-file docker/.env -f docker/local/docker-compose.yml up -d
docker compose --env-file docker/.env -f docker/local/docker-compose.yml ps
```

### 3) Generate local `.env` files for apps

```bash
node scripts/setup-env-files.js
```

### 4) Run the apps (separate terminals)

```bash
pnpm start:api:dev
pnpm start:worker
pnpm start:ws
pnpm start:dashboard
```

Default local URLs:

- API: `http://localhost:3000`
- WS: `http://localhost:3002`
- Dashboard: `http://localhost:4201` (depends on your dashboard env file)

---

## Gupshup WhatsApp (SMS provider) local setup & test

This repo includes a custom SMS provider implementation for **Gupshup WhatsApp** using the Gupshup template API:

`POST https://api.gupshup.io/wa/api/v1/template/msg`

### Credentials you need

Create an SMS integration for provider id `gupshup-whatsapp` with these credentials:

- `apiKey` (Gupshup API key)
- `from` (Source phone number, e.g. `15558378566`)
- `senderName` (App name, e.g. `Finkhoz`)

### Trigger payload shape

When triggering a workflow, pass template details in the event payload (the worker merges these into `customData` for `gupshup-whatsapp`):

```json
{
  "phone": "+919102888850",
  "templateId": "08504e07-a967-49b4-848c-f0b99753ccc0",
  "templateParams": ["Aman", "Finz Stable Basket", "invest?target=trade-ideas::live"]
}
```

Both phone formats are supported (provider forwards what you pass as `destination`):

- `"+919102888850"`
- `"919102888850"`

### Trigger via API (no Dashboard)

The Events API uses the `Authorization` header:

- `Authorization: ApiKey <NOVU_SECRET_KEY>`

In MongoDB, environment keys are stored encrypted (prefixed with `nvsk.`). You must use the **decrypted** key when calling the API.

Example trigger:

```bash
curl -X POST http://localhost:3000/v1/events/trigger \
  -H "Authorization: ApiKey <DECRYPTED_SECRET_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"basket",
    "to":{"subscriberId":"gupshup-whatsapp-test","phone":"+919102888850"},
    "payload":{
      "phone":"+919102888850",
      "templateId":"08504e07-a967-49b4-848c-f0b99753ccc0",
      "templateParams":["Aman","Finz Stable Basket","invest?target=trade-ideas::live"]
    }
  }'
```

