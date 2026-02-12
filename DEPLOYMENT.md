# Production Deployment Configuration

## Vercel Deployment (Primary)

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally via `npm i -g vercel`

### Important: Database Setup

**SQLite is NOT supported on Vercel** - Vercel uses stateless serverless functions, meaning any SQLite database would be wiped on each deployment or function invocation.

**You must use a hosted PostgreSQL database.** Recommended options:

1. **Neon** (Recommended): `neon.tech` - Serverless PostgreSQL with generous free tier
2. **Supabase**: `supabase.com` - PostgreSQL with additional features
3. **Railway**: `railway.app` - Simple PostgreSQL hosting
4. **Vercel Postgres**: `vercel.com/storage/postgres` - If available in your region

### Database Migration Steps

1. Create a PostgreSQL database with your chosen provider
2. Get the connection string (format: `postgresql://user:password@host:port/database`)
3. Set the `DATABASE_URL` environment variable in Vercel dashboard
4. The app already supports PostgreSQL via SQLAlchemy - no code changes needed

### Environment Variables

Set these in your Vercel project dashboard (Settings > Environment Variables):

```
DATABASE_URL=postgresql://user:password@host:port/database
ENVIRONMENT=production
REACT_APP_API_URL=https://your-project.vercel.app
```

For local development, create a `.env` file in the backend directory:

```bash
# Backend Environment Variables
ENVIRONMENT=development
DATABASE_URL=sqlite:///./vendor_quality.db
SESSION_TTL_HOURS=24

# Frontend API URL (for production builds)
REACT_APP_API_URL=http://localhost:8000
```

### Deploy to Vercel

#### Option 1: Vercel Dashboard (Git Integration)

1. Push your code to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Select your repository
4. Configure build settings:
   - **Framework Preset**: Create React App (for frontend)
   - **Root Directory**: `./` (project root)
5. Add environment variables
6. Deploy

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

### Project Structure on Vercel

- **Frontend**: Built from `frontend/` directory (Create React App → static files)
- **Backend**: Served via `api/index.py` (Python serverless functions)
- **API Routes**: All `/api/*` routes handled by FastAPI
- **Static Files**: React build output served for root routes

### Post-Deployment Steps

1. **Database Seeding**: On first deploy, the app will automatically seed the database with sample data if it's empty (see `main.py` lifespan handler)

2. **Custom Domain** (optional):
   ```bash
   vercel domains add your-domain.com
   ```

3. **Update CORS**: If you use a custom domain, add it to `main.py` CORS origins:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "https://your-custom-domain.com",  # Add this
       "https://your-project.vercel.app",
   ]
   ```

---

## Alternative Deployment Options

### Render (Previously Used)

If you need SQLite persistence or want to compare:

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
      - name: data
      - mountPath: /data
      - sizeGB: 1
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Docker Deployment (Self-Hosted)

```bash
# Build and run with docker-compose
docker-compose up --build
```

---

## Production Checklist

### Security
- [ ] Set strong secret key for sessions (if using auth)
- [ ] Enable HTTPS only (Vercel provides this by default)
- [ ] Set up CORS properly for your domain
- [ ] Add rate limiting (if needed)
- [ ] Remove debug mode

### Database (PostgreSQL Required for Vercel)
- [ ] Migrated from SQLite to PostgreSQL
- [ ] Set `DATABASE_URL` environment variable
- [ ] Verified database connection works
- [ ] Tested data persistence across deployments

### Performance
- [ ] Enable gzip compression (Vercel does this automatically)
- [ ] Set up CDN for static files (Vercel Edge Network)
- [ ] Configure caching headers (if needed)
- [ ] Use connection pooling for database

### Monitoring
- [ ] Health check endpoint: `/health`
- [ ] API docs available at: `/docs`
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure logging

---

## Troubleshooting

### Build Failures

**Python dependencies failing?**
- Ensure `requirements.txt` is at `backend/requirements.txt`
- Check Python version compatibility (3.9+ required)

**Frontend build failing?**
- Ensure `package.json` is at `frontend/package.json`
- Run `npm install` locally first to verify

### Database Issues on Vercel

**Data not persisting?**
- This is expected with SQLite - migrate to PostgreSQL
- Check `DATABASE_URL` is set correctly
- Verify the connection string format

**Migration errors?**
- Ensure PostgreSQL version is 12+
- Check SQLAlchemy connection string format

### API Routes Not Working

- Verify `vercel.json` routes are configured
- Check FastAPI app is properly exported from `api/index.py`
- Test `/health` endpoint first
