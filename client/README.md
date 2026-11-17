# Client App

This folder contains the frontend for the project. It is built with Vue, TypeScript, and Vite, and is responsible for rendering the UI and communicating with the backend API.

## Folder structure

```bash
client/
├── public/                     # Static assets served directly by Vite
├── src/
│   ├── assets/                # Shared static images, fonts, or icons
│   ├── components/            # Reusable Vue components used across the app
│   ├── composables/           # Reusable logic for data-fetching and state composition
│   ├── router/                # Vue Router definitions and route configuration
│   ├── stores/                # Pinia stores for shared reactive state
│   ├── App.vue                # Main app layout and page structure
│   ├── main.ts                # App bootstrap and plugin registration
│   └── style.css              # Global styles and base styling
├── index.html                 # HTML entry point for the app
├── package.json               # Client dependencies and scripts
├── tsconfig.json              # TypeScript config for the app
├── tsconfig.app.json          # App-specific TypeScript config
├── tsconfig.node.json         # TypeScript config for Node/Vite tooling
├── vite.config.ts             # Vite configuration
├── README.md                  # Documentation for the client app
├── .env                       # Environment variables for the frontend
├── .gitignore                 # Ignored files for Git
└── .vscode/                   # Optional editor configuration
```

## Brief explanation

- `public/`: Stores static files like images or icons that do not need processing.
- `src/components/`: Keeps reusable Vue UI pieces used throughout the app.
- `src/composables/`: Contains reusable logic such as API calls and shared state helpers.
- `src/router/`: Defines app routes and navigation behavior.
- `src/stores/`: Holds Pinia stores for centralized state management.
- `src/App.vue`: The main Vue component that loads the app layout and page content.
- `src/main.ts`: Starts the Vue app and registers the router and Pinia store.
- `src/style.css`: Defines the global look and feel across the app.
- `index.html`: The base HTML file used by Vite to launch the application.

This structure keeps the frontend organized, making it easier to scale, maintain, and extend the client-side code.

## Run the client app

1. Open the client folder.
2. Run the following command to start the Vite dev server, the dependencies will be installed automatically during inital setup:

```bash
npm run dev
```

> This command starts the Vite development server.

## Environment variables

Create or update the `.env` file in the client folder and set the backend URL key:

```bash
VITE_BACKEND_URL="http://localhost:3000"
```

This value tells the frontend where the Express server is running.
