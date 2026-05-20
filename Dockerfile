FROM oven/bun:1.2.12-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD node -e "const http=require('http');const req=http.get('http://127.0.0.1:3000/api/health',res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end();"

CMD ["node", ".output/server/index.mjs"]
