# Uni Assistant Frontend

React + Vite frontend starter configured for a scalable MERN architecture.

## Installed Packages

- react-router-dom
- axios

## Scripts

- dev: Start Vite development server
- build: Build production assets
- preview: Preview production build locally

## Setup

1. Install dependencies

npm install

2. Create environment file

Copy .env.example to .env

Example:
VITE_API_URL=http://localhost:5000/api

3. Run development server

npm run dev

## Architecture

src/
  pages/       Route-level screens
  components/  Reusable UI components
  layouts/     Shared app/page layouts
  services/    API and domain service modules
  context/     React context providers
  hooks/       Custom hooks
  routes/      Route maps and route guards
  utils/       Shared helpers and constants

## Current Configuration

- React Router is mounted in App.jsx using BrowserRouter.
- Central route map is in src/routes/AppRoutes.jsx.
- Axios instance is configured in src/services/api.js with:
  - base URL from VITE_API_URL
  - JSON default headers
  - auth token request interceptor
