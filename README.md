# Job Processing Platform

A modular Node.js TypeScript project with PostgreSQL integration and REST API endpoints.

## Project Structure

```
src/
├── config/           # Configuration management
├── database/         # Database connection and migrations
├── models/           # TypeScript interfaces and types
├── services/         # Business logic layer
├── controllers/      # Request handlers
├── routes/           # Route definitions
├── middleware/       # Express middleware (logging, error handling)
├── utils/            # Utility functions
└── index.ts          # Application entry point
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the project directory:

```bash
cd job_processing_platform
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL credentials:

```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/job_platform
NODE_ENV=development
```

5. Create the PostgreSQL database:

```bash
createdb job_platform
```

## Development

Run the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Build and start the production server:

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

- `GET /api/health` - Check server status

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job
- `DELETE /api/jobs/:id` - Delete a job

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Example Requests

### Create a Job

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"name": "Process Report", "description": "Generate monthly report"}'
```

### Create a User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "name": "John Doe"}'
```

### Get All Jobs

```bash
curl http://localhost:3000/api/jobs
```

## Database Schema

### Jobs Table

- `id` - Serial primary key
- `name` - Job name (required)
- `description` - Job description
- `status` - Job status (pending, processing, completed, failed)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Users Table

- `id` - Serial primary key
- `email` - User email (unique, required)
- `name` - User name (required)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run watch` - Watch TypeScript files and compile on changes
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

ISC
