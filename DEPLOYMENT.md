# Production Deployment Configuration

## Environment Variables

Create a `.env` file in the backend directory:

```bash
# Backend Environment Variables
ENVIRONMENT=production
DATABASE_URL=sqlite:///./data/vendor_quality.db
REDIS_URL=redis://localhost:6379/0
SESSION_TTL_HOURS=24

# Frontend API URL (for production builds)
REACT_APP_API_URL=https://your-app.onrender.com
```

## One-Click Deploy Options

### Render (Primary)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**render.yaml**:
```yaml
services:
  - type: web
    name: vendor-scorecard
    runtime: python
    buildCommand: |
      cd backend && pip install -r requirements.txt
      cd ../frontend && npm install && npm run build
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: NODE_VERSION
        value: 18.17.0
      - key: ENVIRONMENT
        value: production
      - key: DATABASE_URL
        value: sqlite:///./data/vendor_quality.db
    disk:
      name: data
      mountPath: /data
      sizeGB: 1
```

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ArivunidhiA/vendor-scorecard)

**app.json for Heroku**:
```json
{
  "name": "Vendor Quality Scorecard",
  "description": "Compare criminal records vendors on quality, cost, and coverage",
  "repository": "https://github.com/ArivunidhiA/vendor-scorecard",
  "logo": "https://vendor-scorecard.onrender.com/logo192.png",
  "keywords": ["vendor", "quality", "scorecard", "criminal records"],
  "stack": "heroku-22",
  "buildpacks": [
    { "url": "heroku/nodejs" },
    { "url": "heroku/python" }
  ],
  "env": {
    "ENVIRONMENT": {
      "description": "Application environment",
      "value": "production"
    }
  },
  "formation": {
    "web": {
      "quantity": 1,
      "size": "eco"
    }
  }
}
```

### DigitalOcean App Platform
[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/ArivunidhiA/vendor-scorecard/tree/main)

## Docker Deployment

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=sqlite:///data/vendor_quality.db
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - app-data:/data
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  app-data:
  redis-data:
```

## Production Checklist

### Security
- [ ] Set strong secret key for sessions
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Add rate limiting
- [ ] Remove debug mode

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static files
- [ ] Configure caching headers
- [ ] Use Redis for sessions (not memory)

### Monitoring
- [ ] Set up health checks
- [ ] Add error tracking (Sentry)
- [ ] Configure logging
- [ ] Set up uptime monitoring

### Data
- [ ] Back up database regularly
- [ ] Set up data retention policy
- [ ] Configure session cleanup
