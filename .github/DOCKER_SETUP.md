# GitHub Actions Setup Guide

## 🔐 Required GitHub Secrets

To enable automated Docker image builds and pushes, you need to configure the following secrets in your GitHub repository:

### Navigation
Go to: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DOCKER_USERNAME` | Your Docker Hub username | Your Docker Hub account username |
| `DOCKER_TOKEN` | Docker Hub access token | [Create at Docker Hub](https://hub.docker.com/settings/security) → **New Access Token** |
| `VITE_API_URL` | Backend API URL for frontend builds | Your production API URL (e.g., `https://your-api.run.app/api`) |

### Step-by-Step Setup

#### 1. Create Docker Hub Access Token

1. Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security)
2. Click **New Access Token**
3. Name: `github-actions-aers`
4. Permissions: **Read & Write**
5. Click **Generate**
6. **Copy the token** (you won't see it again!)

#### 2. Add Secrets to GitHub

1. Go to your repository: `https://github.com/PriyobrotoKarmakar/AERS-Alert-Escalation-Resolution-System`
2. Click **Settings** (top menu)
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**

**Add these three secrets:**

**Secret 1:**
- Name: `DOCKER_USERNAME`
- Value: `your-dockerhub-username`
- Click **Add secret**

**Secret 2:**
- Name: `DOCKER_TOKEN`
- Value: `paste-token-from-step-1`
- Click **Add secret**

**Secret 3:**
- Name: `VITE_API_URL`
- Value: `https://alert-escalation-resolution-system-backend-387860847580.asia-south1.run.app/api`
- Click **Add secret**

---

## 🚀 Workflow Triggers

The workflow automatically runs on:

- ✅ **Push to `main` branch** → Builds and pushes images tagged as `latest`
- ✅ **Push to `feat/**` branches** → Builds and pushes images tagged with branch name
- ✅ **Push to `develop` branch** → Builds and pushes images tagged as `develop`
- ✅ **Pull Requests to `main`** → Builds images (without pushing)

---

## 📦 Docker Images Produced

After successful workflow execution, two images will be available on Docker Hub:

### Backend Image
```bash
docker pull <your-dockerhub-username>/aers-backend:latest
docker pull <your-dockerhub-username>/aers-backend:main
docker pull <your-dockerhub-username>/aers-backend:feat-containerization
```

### Frontend Image
```bash
docker pull <your-dockerhub-username>/aers-frontend:latest
docker pull <your-dockerhub-username>/aers-frontend:main
docker pull <your-dockerhub-username>/aers-frontend:feat-containerization
```

---

## 🏷️ Image Tagging Strategy

The workflow creates multiple tags for each image:

| Tag Format | Example | When Applied |
|------------|---------|--------------|
| `latest` | `aers-backend:latest` | Only on `main` branch |
| `<branch-name>` | `aers-backend:feat-containerization` | Every branch push |
| `<branch>-<sha>` | `aers-backend:main-a1b2c3d` | Every commit (first 7 chars of SHA) |

---

## 🔍 Monitoring Workflow Execution

### View Workflow Runs
1. Go to repository **Actions** tab
2. Click on **Build and Push Docker Images** workflow
3. View logs for each job:
   - Build & Push Backend Image
   - Build & Push Frontend Image
   - Deployment Summary

### Check Docker Hub
1. Go to [Docker Hub](https://hub.docker.com/)
2. Navigate to **Repositories**
3. You should see:
   - `aers-backend` repository
   - `aers-frontend` repository

---

## 🛠️ Local Testing

Test the Docker images locally before pushing:

### Backend
```bash
cd backend
docker build -t aers-backend:test .
docker run -p 8080:8080 \
  -e MONGO_URI="your-mongo-connection" \
  -e JWT_SECRET="your-secret" \
  aers-backend:test
```

### Frontend
```bash
cd frontend
docker build \
  --build-arg VITE_API_URL="http://localhost:8080/api" \
  -t aers-frontend:test .
docker run -p 80:80 aers-frontend:test
```

---

## 🐛 Troubleshooting

### Issue: "Error: buildx failed with: failed to solve"

**Solution:** Check Dockerfile syntax and ensure all files referenced exist

### Issue: "Error: login failed"

**Possible causes:**
- ❌ `DOCKER_USERNAME` or `DOCKER_TOKEN` secrets not set
- ❌ Docker Hub token expired or invalid
- ❌ Incorrect username (must match Docker Hub exactly)

**Solution:** Regenerate Docker Hub token and update GitHub secret

### Issue: "unauthorized: authentication required"

**Solution:** Verify `DOCKER_TOKEN` has **Read & Write** permissions

### Issue: Frontend build fails

**Possible causes:**
- ❌ `VITE_API_URL` not set (uses default if missing)
- ❌ Node dependencies issue

**Solution:** Check frontend build logs, ensure `package.json` is correct

---

## 📊 Workflow Features

✅ **Parallel Jobs** - Backend and frontend build simultaneously  
✅ **Layer Caching** - Faster subsequent builds using Docker registry cache  
✅ **Multi-tag Support** - Multiple tags per image (latest, branch, commit SHA)  
✅ **Build Summary** - Automatic deployment summary in GitHub Actions UI  
✅ **Pull Request Safety** - Builds but doesn't push on PRs  

---

## 🔄 Updating the Workflow

To modify the workflow:

1. Edit `.github/workflows/docker-build-push.yml`
2. Commit and push changes
3. Workflow updates automatically on next trigger

---

## 📝 Example Workflow Run Output

```
✅ Build & Push Backend Image
   - Checkout code
   - Set up Docker Buildx
   - Log in to Docker Hub
   - Extract metadata for Docker
   - Build and push Backend Docker image
   
✅ Build & Push Frontend Image
   - Checkout code
   - Set up Docker Buildx
   - Log in to Docker Hub
   - Extract metadata for Docker
   - Build and push Frontend Docker image

✅ Deployment Summary
   Images Built:
   - Backend: your-username/aers-backend
   - Frontend: your-username/aers-frontend
```

---

## 🎉 Success!

Once secrets are configured and workflow runs successfully, your Docker images will automatically build and push to Docker Hub on every commit to tracked branches!

**Next Steps:**
1. Set up the three required secrets
2. Push to `main` or `feat/*` branch
3. Check GitHub Actions tab for workflow execution
4. Verify images on Docker Hub
