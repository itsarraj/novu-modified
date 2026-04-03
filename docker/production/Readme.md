## Production Docker Compose (self-hosted)

This compose runs Novu as containers (API + Worker + WS + Dashboard) plus MongoDB + Redis.

### 1) Create env file

From the repo root:

```bash
cp docker/production/.env.example docker/production/.env
```

Update at least:

- `JWT_SECRET`
- `STORE_ENCRYPTION_KEY` (must be 32 chars)
- `NOVU_SECRET_KEY`
- `API_ROOT_URL`, `FRONT_BASE_URL`, `DASHBOARD_URL`
- `VITE_API_HOSTNAME`, `VITE_WEBSOCKET_HOSTNAME`

### 2) Start containers

```bash
docker compose --env-file docker/production/.env -f docker/production/docker-compose.yml up -d
docker compose --env-file docker/production/.env -f docker/production/docker-compose.yml ps
```

### Notes for your fork (custom providers / code changes)

This compose defaults to the official images (`ghcr.io/novuhq/novu/*`).

If you need your custom code in production you should:

- build and publish your own images, then set:
  - `NOVU_API_IMAGE`, `NOVU_WORKER_IMAGE`, `NOVU_WS_IMAGE`, `NOVU_DASHBOARD_IMAGE`
  - `NOVU_IMAGE_TAG`

The repo `apps/api`, `apps/worker`, `apps/ws` Dockerfiles are built via `pnpm-context` (they expect a generated build context), so `docker compose build` from the repo root usually won’t work without matching that build pipeline.

