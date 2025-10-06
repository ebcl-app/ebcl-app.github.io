# Box Cricket Management App

A React-based web application for managing box cricket leagues, built with Material UI and Vite.

## Features

- **Dashboard**: Overview of recent matches, scheduled matches, players, and teams
- **Matches**: View and manage match schedules and results
- **Players**: CRUD operations for player management
- **Teams**: CRUD operations for team management
- **Scoring**: Live scoring interface for matches

## Tech Stack

- React 18
- TypeScript
- Material UI (MUI)
- React Router
- Vite

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (due to Vite requirements)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── Layout.tsx          # Main layout with navigation
├── pages/
│   ├── Dashboard.tsx       # Dashboard page
│   ├── Matches.tsx         # Matches management
│   ├── Players.tsx         # Players management
│   ├── Teams.tsx           # Teams management
│   └── Scoring.tsx         # Live scoring
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

## Usage

Navigate through the app using the top navigation bar. Each section provides basic CRUD functionality with placeholder data. The scoring page allows real-time score updates for matches.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

Copyright (c) 2025 EBCL. All rights reserved.