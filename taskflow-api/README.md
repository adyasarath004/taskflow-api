# TaskFlow API

A Task Management REST API built with Node.js, Express, and MySQL, featuring JWT authentication, role-scoped task ownership, containerized deployment with Docker, and an automated CI/CD pipeline using GitHub Actions.

## Features

- User registration and login with hashed passwords (bcrypt) and JWT-based authentication
- Full CRUD for tasks, scoped to the authenticated user
- MySQL persistence via connection pooling (`mysql2`)
- Dockerized app and database with `docker-compose`
- Unit-tested with Jest and Supertest (mocked data layer, 80%+ coverage)
- CI/CD pipeline: automated linting, testing, and Docker image build on every push via GitHub Actions

## Tech Stack

Node.js · Express.js · MySQL · JWT · Docker · Jest · Supertest · GitHub Actions

## Project Structure

```
taskflow-api/
├── src/
│   ├── config/         # DB pool + SQL schema
│   ├── controllers/    # Route logic
│   ├── middleware/      # JWT auth middleware
│   ├── routes/          # Express routers
│   ├── app.js            # Express app (exported for testing)
│   └── server.js         # App bootstrap
├── tests/                # Jest unit tests (db layer mocked)
├── .github/workflows/    # CI/CD pipeline
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Getting Started Locally

```bash
git clone <your-repo-url>
cd taskflow-api
cp .env.example .env
npm install
npm run dev
```

Make sure a MySQL instance is running and matches your `.env` values, then run the schema:

```bash
mysql -u root -p < src/config/schema.sql
```

## Running with Docker

```bash
docker compose up --build
```

This spins up the API on `http://localhost:3000` and a MySQL 8 container, with the schema auto-loaded on first run.

## Running Tests

```bash
npm test
```

Tests mock the database layer so they run fast and in isolation — no live database required. Coverage report is generated in `/coverage`.

## API Endpoints

| Method | Endpoint             | Auth required | Description             |
|--------|-----------------------|:---:|--------------------------|
| POST   | `/api/auth/register`  | No  | Register a new user     |
| POST   | `/api/auth/login`     | No  | Log in, receive a JWT   |
| GET    | `/api/tasks`          | Yes | List your tasks         |
| POST   | `/api/tasks`          | Yes | Create a task           |
| PUT    | `/api/tasks/:id`      | Yes | Update a task           |
| DELETE | `/api/tasks/:id`      | Yes | Delete a task           |
| GET    | `/health`             | No  | Health check            |

Protected routes require `Authorization: Bearer <token>`.

## CI/CD

Every push and pull request to `main` triggers a GitHub Actions workflow that:
1. Installs dependencies
2. Runs the full Jest test suite
3. Uploads the coverage report as a build artifact
4. Builds the Docker image to confirm it's production-ready

See `.github/workflows/ci.yml`.

## License

MIT
