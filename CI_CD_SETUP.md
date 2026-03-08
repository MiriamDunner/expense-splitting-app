# CI/CD Pipeline Setup Guide

This document explains how to set up and configure the CI/CD pipeline for the Expense Splitting App.

## Overview

The pipeline automatically:
1. Builds and tests the frontend (Next.js)
2. Builds and tests the backend (FastAPI)
3. Deploys frontend to Vercel
4. Deploys backend to your chosen cloud provider
5. Bumps version and pushes back to GitHub

## File Locations

```
expense-splitting-app/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # Main CI/CD workflow
├── scripts/
│   ├── Dockerfile             # Backend container config
│   ├── fly.toml               # Fly.io deployment config
│   ├── test_api.py            # Backend tests
│   └── requirements.txt       # Python dependencies
└── CI_CD_SETUP.md             # This file
```

## Required GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### Frontend (Vercel) - Required
| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Run `vercel link` locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `vercel link` locally, check `.vercel/project.json` |

### Backend - Choose One Provider

#### Option 1: Fly.io (Recommended)
| Secret | Description | How to Get |
|--------|-------------|------------|
| `FLY_API_TOKEN` | Fly.io API token | Run `fly auth token` or [Dashboard](https://fly.io/user/personal_access_tokens) |

#### Option 2: Railway
| Secret | Description | How to Get |
|--------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | [Railway Dashboard](https://railway.app/account/tokens) |

#### Option 3: Render
| Secret | Description | How to Get |
|--------|-------------|------------|
| `RENDER_DEPLOY_HOOK` | Render deploy webhook URL | Render Dashboard → Service → Settings → Deploy Hook |

## Setup Instructions

### Step 1: Frontend Setup (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Get your IDs from `.vercel/project.json`:
   ```json
   {
     "orgId": "your-org-id",
     "projectId": "your-project-id"
   }
   ```

4. Create a token at https://vercel.com/account/tokens

5. Add all three secrets to GitHub

### Step 2: Backend Setup (Choose One)

#### Fly.io Setup
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Navigate to scripts folder
cd scripts

# Create app (first time only)
fly launch --name expense-splitting-api

# Get your token
fly auth token
```

Add `FLY_API_TOKEN` to GitHub secrets.

#### Railway Setup
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link
```

Get token from https://railway.app/account/tokens and add `RAILWAY_TOKEN` to GitHub secrets.

#### Render Setup
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn fastapi_server:app --host 0.0.0.0 --port $PORT`
5. Get Deploy Hook URL from Settings → Deploy Hook
6. Add `RENDER_DEPLOY_HOOK` to GitHub secrets

### Step 3: Test the Pipeline

1. Make a small change to any file
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "test: CI/CD pipeline"
   git push origin main
   ```
3. Check Actions tab in GitHub to monitor progress

## Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                        Push to main                              │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Frontend Job          │     │   Backend Job           │
│   • Install deps        │     │   • Install deps        │
│   • Lint & type check   │     │   • Lint & type check   │
│   • Run tests           │     │   • Run tests           │
│   • Build               │     │   • Verify server       │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   Deploy Frontend       │     │   Deploy Backend        │
│   • Push to Vercel      │     │   • Push to Fly/Railway │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Version Bump                                │
│   • Bump patch version                                          │
│   • Update deployment-info.txt                                  │
│   • Commit & push [skip ci]                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Caching Strategy

The pipeline uses aggressive caching for faster builds:

- **npm cache**: Dependencies cached based on `package-lock.json`
- **Next.js cache**: Build cache stored in `.next/cache`
- **pip cache**: Python packages cached based on `requirements.txt`

## Troubleshooting

### Build Fails
- Check the Actions logs for specific error messages
- Ensure all dependencies are in `package.json` / `requirements.txt`
- Verify TypeScript types are correct

### Deploy Fails
- Verify all secrets are correctly set
- Check the cloud provider dashboard for additional logs
- Ensure the app name matches in config files

### Version Bump Fails
- The `[skip ci]` tag prevents infinite loops
- Ensure `GITHUB_TOKEN` has write permissions

## Local Testing

Test the pipeline locally before pushing:

```bash
# Frontend
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build

# Backend
cd scripts
pip install -r requirements.txt
pytest test_api.py -v
```

## Extending the Pipeline

To add new jobs:

1. Add a new job block in `.github/workflows/ci-cd.yml`
2. Specify dependencies with `needs: [job1, job2]`
3. Use conditions with `if:` for selective runs

Example:
```yaml
new-job:
  name: My New Job
  runs-on: ubuntu-latest
  needs: [frontend, backend]
  steps:
    - name: Do something
      run: echo "Hello!"
```

## Security Notes

- Never commit secrets to the repository
- Use GitHub Secrets for all sensitive values
- The backend Dockerfile runs as non-root user
- All deployments use HTTPS
