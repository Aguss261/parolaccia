# Docker Setup for Parolaccia App

## Files Created

- `Dockerfile` - Production-optimized multi-stage build
- `Dockerfile.dev` - Development version with hot reloading
- `docker-compose.yml` - Orchestration for both production and development
- `.dockerignore` - Excludes unnecessary files from Docker context

## Usage

### Production Build
```bash
# Build and run production container
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The app will be available at `http://localhost:3000`

### Development Mode
```bash
# Run development container with hot reloading
docker-compose --profile dev up --build parolaccia-dev
```

The development server will be available at `http://localhost:3001`

### Individual Docker Commands
```bash
# Build production image
docker build -t parolaccia-app .

# Run production container
docker run -p 3000:3000 parolaccia-app

# Build development image
docker build -f Dockerfile.dev -t parolaccia-app-dev .

# Run development container
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules parolaccia-app-dev
```

### Cleanup
```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi parolaccia-app parolaccia-app-dev
```

## Notes

- The production build uses Next.js standalone output for optimal Docker performance
- Development mode includes volume mounts for hot reloading
- Both containers run on Alpine Linux for smaller image size
- Security best practices: non-root user, minimal dependencies
