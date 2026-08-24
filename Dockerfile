FROM node:24-alpine
WORKDIR /app

# Active pnpm via corepack (embarqué dans Node depuis la v16.13+)
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

COPY . .

EXPOSE 3000
CMD ["pnpm", "dev"]