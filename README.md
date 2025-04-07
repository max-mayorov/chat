> This was a very nice test task. I have enjoyed implementing it!

# Chat App

Simple chat application.
It is build with Nx monorepo. Nx is an easy way to create monorepos and widely support diffent application architectures. 
I also provide cloud caching to speed up development.

The project uses `pnpm` as package manager as it is faster than `npm` and saves disk space by using file system links instead in `node_modules` instead of downloading the same module multiple times inside of the modules hierarchy.

First, install packages:

```sh
pnpm i
```

## Backend 

Backend in NodeJs application with Koa framework. It hosts standard API as well as Websocket for live updates from server.

Backend uses MongoDB to store chat messages. Mongo can be started as part of docker compose:

```sh
docker compose up mongodb
```

To run backend in dev mode use:
```sh
pnpm dlx nx serve backend
```

The backend will start on http://localhost:3000

### Environment variables

| Variable      | Default value             | Meaning                                                                  |
| ------------- | ------------------------- | ------------------------------------------------------------------------ |
| `HOST`        | localhost                 | Host where backend will be listening                                     |
| `PORT`        | 3000                      | Port where backend will be listening                                     |
| `MONGODB_URI` | mongodb://localhost:27017 | URL for the mongodb connection                                           |
| `STORE_TYPE`  | `mongodb`                 | Defines the implementation of the message store: `mongodb` or `inmemory` |

## Frontend

Frontend is React single page application.
To run in dev mode use:

```sh
pnpm dlx nx serve frontend
```

The application will start on http://localhost:4200


### Environment variables

| Variable       | Default value             | Meaning                      |
| -------------- | ------------------------- | ---------------------------- |
| `VITE_API_URL` | http://localhost:4200/api | URL for backend API          |
| `VITE_WS_URL`  | ws://localhost:3000       | URL for websocket connection |


## Run tasks

The easiest way to start the application is to use docker

```sh
docker compose up -d
```

The application is served on https://localhost:4200.


## Testing

There are some test for backend and frontend, including e2e tests.
The easiest way to run the test is to run 
```sh
pnpm dlx nx affected -t lint test build e2e
```

## Github actions

There is also a CI pipeline implemented to check the pull requests and main branch.

# Future improvements
- Implement messages status (sending, sent, seen, etc)
- Implement backend authentication via JWT token.
- Use event queue to handle high amounts of visitors.
- Add support for multiple conversations.
- Add proper users authentication and registration.
