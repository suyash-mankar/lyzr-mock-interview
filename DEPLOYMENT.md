# Deployment Guide

This guide covers deploying Interview Studio to various platforms.

## Prerequisites

Before deploying, ensure you have:

- Valid API keys for Lyzr and OpenAI
- A GitHub repository (for most platforms)
- Node.js 18+ support on the hosting platform

## Vercel (Recommended)

Vercel is the recommended platform as it's built by the Next.js team and offers seamless integration.

### Steps

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   In the Vercel dashboard, add these environment variables:

   ```
   LYZR_API_KEY=your_lyzr_api_key
   LYZR_AGENT_ID=your_agent_id
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_NAME=Interview Studio
   ```

4. **Deploy**

   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Vercel Configuration

The app works with default Vercel settings. If you need custom configuration, create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## Netlify

### Steps

1. **Push to GitHub** (same as Vercel)

2. **Import to Netlify**

   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

3. **Build Settings**

   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18 or higher

4. **Environment Variables**

   In Site settings → Environment variables, add:

   ```
   LYZR_API_KEY=your_lyzr_api_key
   LYZR_AGENT_ID=your_agent_id
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_NAME=Interview Studio
   ```

5. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-site.netlify.app`

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Railway

### Steps

1. **Push to GitHub** (same as above)

2. **Create Railway Project**

   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Configure**

   - Railway auto-detects Next.js
   - Add environment variables in the Variables tab

4. **Deploy**
   - Railway automatically deploys on push
   - Your app will be live at `https://your-app.up.railway.app`

### Railway Configuration

Create `railway.json` (optional):

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Render

### Steps

1. **Push to GitHub**

2. **Create Web Service**

   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure**

   - Name: `interview-studio`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free or paid

4. **Environment Variables**

   Add in the Environment tab:

   ```
   LYZR_API_KEY=your_lyzr_api_key
   LYZR_AGENT_ID=your_agent_id
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_NAME=Interview Studio
   NODE_VERSION=18
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Your app will be live at `https://your-app.onrender.com`

---

## AWS Amplify

### Steps

1. **Push to GitHub**

2. **Create Amplify App**

   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect to GitHub

3. **Build Settings**

   Amplify auto-detects Next.js. Verify `amplify.yml`:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - "**/*"
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Environment Variables**

   Add in App settings → Environment variables

5. **Deploy**
   - Amplify automatically deploys
   - Your app will be live at `https://main.xxxxx.amplifyapp.com`

---

## Docker (Self-Hosted)

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - LYZR_API_KEY=${LYZR_API_KEY}
      - LYZR_AGENT_ID=${LYZR_AGENT_ID}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_APP_NAME=Interview Studio
    restart: unless-stopped
```

### Deploy

```bash
# Build
docker build -t interview-studio .

# Run
docker run -p 3000:3000 \
  -e LYZR_API_KEY=your_key \
  -e LYZR_AGENT_ID=your_id \
  -e OPENAI_API_KEY=your_key \
  interview-studio

# Or use docker-compose
docker-compose up -d
```

---

## Environment Variables Reference

| Variable               | Required | Description                            |
| ---------------------- | -------- | -------------------------------------- |
| `LYZR_API_KEY`         | Yes      | Your Lyzr API key                      |
| `LYZR_AGENT_ID`        | Yes      | Your Lyzr Agent ID                     |
| `OPENAI_API_KEY`       | Yes      | Your OpenAI API key                    |
| `NEXT_PUBLIC_APP_NAME` | No       | App name (default: "Interview Studio") |

---

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] HTTPS enabled (required for microphone access)
- [ ] Custom domain configured (optional)
- [ ] Test voice recording in production
- [ ] Test text mode
- [ ] Test TTS playback
- [ ] Verify API rate limits
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Monitor API usage and costs

---

## Troubleshooting

### Microphone Not Working in Production

**Problem**: Microphone access denied or not working.

**Solution**: Ensure your site is served over HTTPS. Browsers require HTTPS for microphone access (except localhost).

### Build Fails

**Problem**: Build fails with module errors.

**Solution**:

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### API Errors in Production

**Problem**: API calls failing with 500 errors.

**Solution**:

- Verify environment variables are set correctly
- Check API key validity
- Review server logs for detailed errors
- Ensure API endpoints are accessible from your hosting region

### Rate Limit Issues

**Problem**: Users hitting rate limits too quickly.

**Solution**:

- Adjust rate limits in `lib/rateLimiter.ts`
- Consider implementing user authentication
- Use a database-backed rate limiter for production

---

## Monitoring & Analytics

### Recommended Tools

- **Vercel Analytics**: Built-in for Vercel deployments
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User analytics
- **Uptime Robot**: Uptime monitoring

### Adding Sentry (Example)

```bash
npm install @sentry/nextjs
```

Update `next.config.ts`:

```typescript
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  {
    // Your existing Next.js config
  },
  {
    silent: true,
    org: "your-org",
    project: "interview-studio",
  }
);
```

---

## Scaling Considerations

For high-traffic deployments:

1. **Database**: Add PostgreSQL/MongoDB for session persistence
2. **Redis**: Use Redis for rate limiting and caching
3. **CDN**: Serve static assets via CDN
4. **Load Balancer**: Distribute traffic across multiple instances
5. **API Gateway**: Add API gateway for better control
6. **Monitoring**: Implement comprehensive logging and monitoring

---

## Cost Estimates

### API Usage Costs

- **OpenAI Whisper**: ~$0.006 per minute of audio
- **OpenAI TTS**: ~$0.015 per 1K characters
- **Lyzr**: Varies by plan

### Hosting Costs

- **Vercel**: Free tier available, Pro at $20/month
- **Netlify**: Free tier available, Pro at $19/month
- **Railway**: ~$5/month for hobby projects
- **Render**: Free tier available, paid plans start at $7/month

---

## Support

For deployment issues:

- Check the [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Review platform-specific documentation
- Open an issue on GitHub
- Contact: suyashmankar@gmail.com

---

**Happy Deploying! 🚀**
