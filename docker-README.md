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
docker compose up -d
```

To stop the services:

```bash
docker compose down
```

## Accessing the Application

Once the services are running:

- Frontend: http://localhost:4200
- Backend API: http://localhost:4200/api
- WebSocket: ws://localhost:3000/ws

## Rebuilding the Images

If you make changes to the code and need to rebuild the Docker images:

```bash
docker compose up --build
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
