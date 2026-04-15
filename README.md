# EcoLearn

## Description
EcoLearn is an interactive environmental education platform designed to make sustainability learning fun and practical for students. The project combines a frontend experience of quizzes, games, challenges, progress tracking, and community features with a Node.js/Express backend for user data and progress management.

## Problem It Solves
Many students lack engaging, hands-on ways to learn about climate action, biodiversity, and sustainability. EcoVerse addresses this by providing an accessible digital platform that turns environmental education into games, rewards, and measurable impact.

## Features
- Gamified learning with quizzes, puzzles, and eco-themed games
- Progress tracking for weekly, monthly, and yearly environmental actions
- Points, badges, and rewards to motivate continued participation
- Real-world task tracking for habits like recycling, energy saving, and tree planting
- User account management, activity logs, and dashboard views
- Static page delivery of educational content and interactive modules
- MySQL-backed backend for user, activity, and progress storage

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL (via `mysql2`)
- API tools: `cors`, `body-parser`, `dotenv`
- Development: `nodemon`

## Folder Structure

```
EcoVerse/
├── css/                 # Stylesheets for pages and components
├── images/              # Image and illustration assets
├── js/                  # Frontend JavaScript logic and interactivity
├── pages/               # Static HTML pages for the application
├── database.sql         # Database schema and seed definitions
├── package.json         # Node.js project metadata and dependencies
├── server.js            # Express backend server
└── README.md            # Project documentation
```

## Installation

1. Clone or copy the repository into your workspace.
2. Open a terminal in the project root.
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the project root with the following variables:

```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
PORT=3000
```

5. Import `database.sql` into your MySQL database to create the required tables.

## Usage

1. Start the server:

```bash
npm start
```

2. Open the application in your browser at:

```text
http://localhost:3000
```

3. Use the available frontend pages under `pages/` to access the homepage, quizzes, dashboard, profile, and other environment education modules.

4. Backend API endpoints include:
- `GET /api/test-db` — verify database connection
- `GET /api/user/data?uid=<uid>` — fetch user profile and progress data
- `POST /api/user/create` — create a new user record
- `POST /api/user/update-points` — add points, log activities, and update weekly progress

## Future Improvements
- Add authentication and session management for secure user login
- Build a unified frontend router or single-page app for smoother navigation
- Add more analytics dashboards for schools, classes, or community groups
- Improve mobile responsiveness and accessibility
- Add onboarding flows, user tutorials, and teacher/admin panels
- Integrate real-time leaderboard and social sharing features
- Support offline progress sync and device persistence

## Notes
- The frontend is served statically from the `pages/`, `css/`, `js/`, and `images/` folders.
- The Express backend is configured to serve the homepage and static asset folders.
- The server uses a MySQL connection pool for scalable database access.
