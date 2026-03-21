# Uni Assistant

Full-stack MERN starter project using MVC architecture, JWT authentication, and a scalable React frontend with Vite.

## Tech Stack

- MongoDB + Mongoose
- Express.js
- React.js (Vite)
- Node.js
- JWT Authentication
- Axios
- React Router DOM

## Project Structure

```text
backend/
	config/
	models/
	controllers/
	routes/
	middleware/
	services/
	utils/
	server.js

frontend/
	src/
		components/
		pages/
		layouts/
		services/
		context/
		hooks/
		routes/
		utils/
		App.jsx
		main.jsx
```

## Quick Start

1. Install dependencies

```bash
npm run install:all
```

2. Configure environment variables

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Run backend and frontend in separate terminals

```bash
npm run dev:backend
npm run dev:frontend
```

## Backend Features

- Clean MVC structure
- Service layer for business logic
- JWT-based auth flow (`register`, `login`, `me`)
- CORS and dotenv setup
- Centralized error handling
- Auth middleware (`protect`)
- Validation-ready middleware placeholder

## Frontend Features

- Vite + React architecture
- Auth context for session management
- Axios instance with token interceptor
- Protected routes with route guards
- Reusable layout and card components
- Responsive modern UI foundation