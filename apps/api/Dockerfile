FROM node:24-alpine
WORKDIR /app

# Active pnpm via corepack, à la version fixée par `packageManager` (package.json racine)
RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --ignore-scripts

COPY . .

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["pnpm", "dev"]
