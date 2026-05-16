# SwiftSell - Local-First Order & Inventory Management

SwiftSell is a high-speed, local-first retail and delivery management system designed for small businesses. It features order tracking, customer management, inventory control, and gamified seller rewards.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: SQLite (via better-sqlite3 and Drizzle ORM)
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Motion

## Getting Started

### 1. Installation

Ensure you have [Node.js](https://nodejs.org/) installed. Then, run:

```bash
npm install
```

### 2. Development Mode

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 3. Production Build

To build the application for production:

```bash
npm run build
```

Then, to start the production server:

```bash
npm run start
```

## Features

- **Local-First**: All data is stored in a local `sqlite.db` file.
- **Security**: Access is protected by a 4-digit PIN (Default: `0000`).
- **Gamification**: Earn XP and level up as you complete business tasks.
- **Finances**: Track revenue, profit, and expenses in real-time.
- **Backups**: Export your entire database to a JSON file for safety.

## Currency

The application uses **Kenyan Shilling (Ksh)** by default.

## Tutorials

You can find the in-app tutorials by clicking on the **Help/Tutorials** button in the application sidebar or settings menu.
