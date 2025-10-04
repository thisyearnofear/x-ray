# Deployment Guide

## Environment Setup

1. Copy environment variables:
```bash
cp .env.local.example .env.local
```

2. Add your Cerebras API key:
```bash
CEREBRAS_API_KEY=your_api_key_here
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

## Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Vercel Deployment

1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

## Performance

- Static pages: Pre-rendered at build time
- API routes: Server-side only
- 3D assets: Cached and optimized
- Bundle size: ~103kB first load
