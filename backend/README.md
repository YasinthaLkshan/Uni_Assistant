# Uni Assistant Backend

Professional backend starter for a MERN application using Express, MongoDB (Mongoose), and JWT authentication foundations.

## Included Stack

- express
- mongoose
- dotenv
- cors
- bcryptjs
- jsonwebtoken
- nodemon (dev)

## Scripts

- dev: Runs the API with nodemon for live reload.
- start: Runs the API with Node.js.
- seed:admin: Seeds the default admin user.
- seed:profiles: Seeds sample student profiles for IT year 3 (semesters 1/2, groups 1/2/3).
- seed:modules: Seeds sample modules for IT year 3.
- seed:timetable: Seeds sample timetable entries for IT year 3.
- seed:events: Seeds sample academic events for IT year 3.
- seed:academic: Runs all academic seed scripts in safe order.

## Setup Instructions

1. Install dependencies

npm install

2. Create environment file

Copy .env.example to .env and update values.

Required variables:
- PORT=5000
- MONGO_URI=mongodb://127.0.0.1:27017/uni_assistant
- JWT_SECRET=your_secure_secret
- JWT_EXPIRES_IN=7d
- CLIENT_URL=http://localhost:5173
- NODE_ENV=development

3. Start development server

npm run dev

4. Start production server

npm start

## API Base

- Root: /
- API prefix: /api
- Auth routes: /api/auth

## Project Structure

config/        Database and app config
controllers/   Request handlers
middleware/    Auth and error middlewares
models/        Mongoose models
routes/        Express routes
services/      Business logic layer
utils/         Helpers and shared utilities
server.js      App entry point
