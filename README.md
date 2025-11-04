# URL Shortener Application

A full-stack URL shortener application built with Go (Fiber) backend and React (TypeScript + Vite) frontend, using Redis as the database.

## Prerequisites

- Docker and Docker Compose (for easy setup)
- OR Go 1.19+ and Node.js 18+ (for manual setup)
- Redis (if running manually)

## Quick Start with Docker Compose (Recommended)

1. **Create a `.env` file in the `api` directory** with the following variables:

```env
APP_PORT=:3000
DB_ADDR=db:6379
DB_PASS=
API_QUOTA=30
DOMAIN=http://localhost:3000
```

2. **Build and run all services:**

```bash
docker-compose up --build
```

This will start:
- **API**: http://localhost:3000
- **Redis**: localhost:6379

3. **Run the frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173 (or the port Vite assigns).

## Manual Setup (Development)

### 1. Start Redis

Make sure Redis is running on `localhost:6379`:

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or using Homebrew (macOS)
brew services start redis
```

### 2. Setup Backend API

1. **Navigate to the API directory:**

```bash
cd api
```

2. **Create a `.env` file** in the `api` directory:

```env
APP_PORT=:3000
DB_ADDR=localhost:6379
DB_PASS=
API_QUOTA=30
DOMAIN=http://localhost:3000
```

3. **Install dependencies:**

```bash
go mod download
```

4. **Run the API:**

```bash
go run main.go
```

The API will be available at http://localhost:3000

### 3. Setup Frontend

1. **Navigate to the frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create a `.env` file** (optional, defaults to http://localhost:3000):

```env
VITE_API_BASE=http://localhost:3000
```

4. **Run the development server:**

```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## API Endpoints

- **POST** `/api/v1` - Shorten a URL
  ```json
  {
    "url": "https://example.com",
    "short": "custom-id",  // optional
    "expiry": 24  // hours, optional, defaults to 24
  }
  ```

- **GET** `/:url` - Resolve a shortened URL (redirects to original URL)

## Environment Variables

### Backend (`.env` in `api/` directory)

- `APP_PORT` - Port for the API server (e.g., `:3000`)
- `DB_ADDR` - Redis address (e.g., `localhost:6379` or `db:6379` for Docker)
- `DB_PASS` - Redis password (leave empty for local development)
- `API_QUOTA` - Rate limit quota per IP (e.g., `30`)
- `DOMAIN` - Base domain for shortened URLs (e.g., `http://localhost:3000`)

### Frontend (`.env` in `frontend/` directory, optional)

- `VITE_API_BASE` - API base URL (defaults to `http://localhost:3000`)

## Building for Production

### Backend

```bash
cd api
go build -o main .
./main
```

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Project Structure

```
.
├── api/                 # Go backend API
│   ├── database/        # Redis database connection
│   ├── helpers/         # Helper functions
│   ├── routes/          # API route handlers
│   ├── main.go          # Application entry point
│   └── Dockerfile       # Docker image for API
├── db/                  # Redis Docker configuration
├── frontend/            # React frontend
│   ├── src/            # Source files
│   └── dist/           # Built production files
└── docker-compose.yml  # Docker Compose configuration
```

## Troubleshooting

- **Connection refused errors**: Make sure Redis is running and accessible at the configured address
- **CORS errors**: The backend already has CORS configured to allow all origins
- **Port already in use**: Change the `APP_PORT` in the `.env` file or stop the process using that port

---

## Jenkins CI/CD Setup

This project includes a Jenkins pipeline for automated building, testing, and deployment.

### Prerequisites

1. **Jenkins** installed and running
2. **Docker** installed on Jenkins agent
3. **Kubernetes** cluster access configured
4. **Docker registry** (Docker Hub, AWS ECR, GCR, etc.)

### Jenkins Configuration

1. **Install Required Plugins** in Jenkins:
   - Docker Pipeline
   - Kubernetes CLI Plugin
   - Credentials Binding Plugin

2. **Configure Credentials** in Jenkins:
   
   - **Docker Registry Credentials** (ID: `docker-registry-url`):
     - Add your Docker registry URL and credentials
     - Format: `your-registry.com` or `docker.io/username`
   
   - **Kubernetes Config** (ID: `kubeconfig`):
     - Add your Kubernetes kubeconfig file content
     - This allows Jenkins to deploy to your cluster

3. **Create Jenkins Pipeline**:
   - Create a new Pipeline job in Jenkins
   - Point it to your Git repository
   - Jenkins will automatically detect and use the `Jenkinsfile`

4. **Update Jenkinsfile** (if needed):
   - Update `DOCKER_REGISTRY` with your registry URL
   - Update `NAMESPACE` if you want a different namespace
   - Adjust image tags and build steps as needed

### Running the Pipeline

1. Push code to your repository
2. Trigger the Jenkins pipeline (manual or via webhook)
3. The pipeline will:
   - Build Docker images for API and Frontend
   - Push images to your registry
   - Deploy to Kubernetes cluster
   - Perform health checks

---

## Kubernetes Deployment

### Prerequisites

1. **Kubernetes cluster** (minikube, GKE, EKS, AKS, or on-premise)
2. **kubectl** configured to access your cluster
3. **Docker images** built and pushed to a registry

### Setup Steps

1. **Update Image References**:
   
   Edit the following files and replace `your-registry` with your actual Docker registry:
   - `k8s/api-deployment.yaml`
   - `k8s/frontend-deployment.yaml`

2. **Update Configuration** (if needed):
   
   Edit `k8s/configmap.yaml` to adjust:
   - `DOMAIN`: Your public domain or service URL
   - `API_QUOTA`: Rate limiting quota
   - Other environment variables

3. **Configure Secrets** (if needed):
   
   Edit `k8s/secret.yaml` to add:
   - Redis password (if using password-protected Redis)
   - Other sensitive configuration

4. **Deploy to Kubernetes**:

   ```bash
   # Create namespace
   kubectl apply -f k8s/namespace.yaml
   
   # Create ConfigMap and Secrets
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   
   # Deploy Redis
   kubectl apply -f k8s/redis-deployment.yaml
   
   # Deploy API and Frontend
   kubectl apply -f k8s/api-deployment.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   
   # Create Services
   kubectl apply -f k8s/services.yaml
   
   # Optional: Deploy Ingress
   kubectl apply -f k8s/ingress.yaml
   ```

5. **Verify Deployment**:

   ```bash
   # Check pods
   kubectl get pods -n url-shortener
   
   # Check services
   kubectl get svc -n url-shortener
   
   # Check deployments
   kubectl get deployments -n url-shortener
   
   # View logs
   kubectl logs -f deployment/api -n url-shortener
   kubectl logs -f deployment/frontend -n url-shortener
   ```

### Accessing the Application

**Using LoadBalancer (Cloud)**:
- Services are configured as `LoadBalancer` type
- Get external IPs:
  ```bash
  kubectl get svc -n url-shortener
  ```

**Using NodePort (On-premise/Minikube)**:
- Change service type in `k8s/services.yaml` from `LoadBalancer` to `NodePort`
- Access via: `<node-ip>:<nodeport>`

**Using Ingress**:
- Update `k8s/ingress.yaml` with your domain names
- Ensure ingress controller is installed (nginx-ingress, etc.)
- Access via configured domains

### Scaling

Scale deployments manually:

```bash
# Scale API
kubectl scale deployment api --replicas=3 -n url-shortener

# Scale Frontend
kubectl scale deployment frontend --replicas=3 -n url-shortener
```

### Updating Deployment

1. **Manual Update**:
   ```bash
   # Update image in deployment
   kubectl set image deployment/api api=your-registry/url-shortener-api:new-tag -n url-shortener
   kubectl rollout status deployment/api -n url-shortener
   ```

2. **Via Jenkins Pipeline**:
   - Push new code
   - Jenkins will automatically build and deploy

### Monitoring and Debugging

```bash
# Describe resources
kubectl describe deployment api -n url-shortener
kubectl describe pod <pod-name> -n url-shortener

# Get events
kubectl get events -n url-shortener --sort-by='.lastTimestamp'

# Execute commands in pod
kubectl exec -it <pod-name> -n url-shortener -- sh

# Port forwarding for local access
kubectl port-forward svc/api-service 3000:3000 -n url-shortener
kubectl port-forward svc/frontend-service 8080:80 -n url-shortener
```

### Cleanup

To remove all resources:

```bash
kubectl delete namespace url-shortener
```

---

## Kubernetes Manifests Overview

- `namespace.yaml` - Creates the `url-shortener` namespace
- `configmap.yaml` - Non-sensitive configuration
- `secret.yaml` - Sensitive data (passwords, keys)
- `redis-deployment.yaml` - Redis deployment with persistent storage
- `api-deployment.yaml` - API backend deployment
- `frontend-deployment.yaml` - Frontend deployment
- `services.yaml` - Kubernetes services for all components
- `ingress.yaml` - Ingress configuration (optional, for external access)

---

## CI/CD Workflow

1. **Developer pushes code** → Git repository
2. **Jenkins triggers** → Pipeline starts
3. **Build stage** → Docker images built
4. **Push stage** → Images pushed to registry
5. **Deploy stage** → Kubernetes manifests updated and applied
6. **Health check** → Verify deployment success

---

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Docker Documentation](https://docs.docker.com/)

