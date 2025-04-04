# Docker Setup for Chat Application

This repository includes Docker configuration to run both the frontend and backend applications with a single command.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the Application with Docker Compose

To start both the frontend and backend services:

```bash
docker-compose up
```

This will:
1. Build the Docker images for both services if they don't exist
2. Start the backend service on port 3000
3. Start the frontend service on port 80
4. Set up networking between the services

To run the services in detached mode (in the background):

```bash
docker-compose up -d
```

To stop the services:

```bash
docker-compose down
```

## Accessing the Application

Once the services are running:

- Frontend: http://localhost
- Backend API: http://localhost/api
- WebSocket: ws://localhost/ws

## Rebuilding the Images

If you make changes to the code and need to rebuild the Docker images:

```bash
docker-compose up --build
```

## Development vs Production

The Docker setup is configured for production use. For development, it's recommended to use the standard development workflow:

```bash
# Start development servers
npm run dev
```

## Environment Variables

The following environment variables are used in the Docker setup:

### Backend
- `NODE_ENV`: Set to "production" by default
- `HOST`: Set to "0.0.0.0" to allow external connections
- `PORT`: Set to 3000

### Frontend
- `VITE_API_URL`: URL for the backend API
- `VITE_WS_URL`: URL for the WebSocket connection

These are automatically configured in the Docker setup.
