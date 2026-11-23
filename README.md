# fresher-friend

**fresher-friend** helps students and early-career candidates find fresher-friendly job opportunities. It presents job listings with details such as location, work mode, role type, salary, and skills, and lets users search, filter, sort, paginate, and save roles.

The server fetches job data, uses Gemini AI to classify opportunities and identify fresher eligibility, and stores processed listings in MongoDB for the client to browse.

## Tech stack

- **Frontend:** Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, and Vue Router
- **Backend:** Node.js, Express, and TypeScript
- **Database:** MongoDB with Mongoose
- **AI:** Google Gemini via the `@google/genai` SDK. The configured model chain tries `gemini-3.5-flash-lite` first, followed by `gemini-3.1-flash-lite` and `gemini-3.8-flash` as fallbacks.

## Prerequisites

- Node.js `^22.18.0` or `>=24.12.0`
- npm
- A MongoDB instance (local or hosted)
- A Gemini API key for AI-powered job classification

## Install dependencies

From the repository root, install the dependencies for the client, server, and database module:

```sh
npm run install:client
npm run install:server
npm run install:database
```

The `database` folder contains the MongoDB connection and model code used by the server. **You do not need to start it separately**; starting the server loads and starts the database connection automatically.

## Configure environment variables

Create a `server/.env` file with the server and database settings:

```env
GEMINI_API_KEY=your_gemini_api_key
DB_URL=mongodb://localhost:27017/fresher-friend
SESSION_SECRET=replace_with_a_long_random_secret
PORT=3000
```

`DB_URL` defaults to `mongodb://localhost:27017/fresher-friend` if omitted. Ensure MongoDB is running and accessible at the configured URL.

Create a `client/.env` file to point the frontend at the backend:

```env
VITE_BACKEND_URL=http://localhost:3000/fresherFriend
VITE_USE_MOCK=false
```

Set `VITE_USE_MOCK=true` to use the client’s local mock job and filter data instead of requesting those from the backend.

## Run the app

Run the client and server in separate terminals from the repository root.

**Terminal 1 — backend:**

```sh
cd server
npm run start
```

The Express server listens on port `3000` by default and connects to MongoDB as part of startup.

**Terminal 2 — frontend:**

```sh
cd client
npm run dev
```

Vite prints the local client URL in the terminal (typically `http://localhost:5173`).

## Useful client commands

Run from `client/`:

```sh
npm run build       # Type-check and create a production build
npm run test:unit   # Run unit tests
```
