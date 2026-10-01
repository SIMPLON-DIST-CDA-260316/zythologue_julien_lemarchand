FROM node:24-alpine
WORKDIR /app

# Active pnpm via corepack, à la version fixée par `packageManager` (package.json racine)
RUN corepack enable

# Manifestes seuls d'abord : la couche d'install reste en cache tant qu'ils ne changent pas
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/client/package.json ./apps/client/package.json
RUN pnpm install --filter client --frozen-lockfile

COPY . .

WORKDIR /app/apps/client
EXPOSE 5173
# --host : Vite écoute sur toutes les interfaces, pas seulement sur le loopback du conteneur
CMD ["pnpm", "dev", "--host"]
