# Circles

**A neighborhood help network that connects people with nearby neighbors who can help in minutes.**

Circles is a community-first platform where residents can request or offer small everyday help—borrowing tools, jumpstarting a scooter, grocery assistance, pet care, Wi-Fi setup, heavy lifting, and more. Instead of searching the internet for services, Circles helps you find **someone nearby who can actually help right now**.

---

## Live Demo

**Website:** https://brainwave-gmllyko5a-somyasharma72s-projects.vercel.app/

**Backend API:** https://circles-backend-gg09.onrender.com/

---

## The Problem

Modern neighborhoods are full of people who could help each other, but there is no simple, trusted way to connect them.

* Need a drill for 10 minutes?
* Need someone nearby to jumpstart a scooter?
* Need help carrying groceries upstairs?

Most people end up calling strangers, searching marketplaces, or waiting for paid services. Circles brings local communities back together by making neighborhood help **fast, trustworthy, and accessible**.

---

## What Circles Does

* **Create Help Requests** – Post what you need in seconds.
* **Offer Help Nearby** – Browse requests from people around you.
* **Real-Time Chat** – Connect directly with neighbors through live messaging.
* **Location-Aware Discovery** – Find requests and helpers based on proximity.
* **Trust & Reputation System** – Build community credibility over time.
* **AI Assistance** – Smart request suggestions and moderation using Gemini AI.

---

## Demo Accounts

Use the built-in demo login to explore the platform instantly.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS

### Backend

* Node.js
* Express
* Socket.IO
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose

### AI

* Google Gemini API

### Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

---

## Architecture

```text
React (Vercel)
       |
       | REST API + WebSockets
       v
Express Server (Render)
       |
       v
MongoDB Atlas
```

The frontend communicates with the Express backend through REST APIs for authentication and requests, while Socket.IO powers real-time chat and live neighborhood interactions.

---

## Features

### Neighborhood Feed

Browse active requests from people nearby with urgency, distance, and trust information.

### Live Chat

Real-time messaging between neighbors using WebSockets.

### Location Services

Distance-aware discovery of nearby requests and helpers.

### Request Management

Create, view, and manage neighborhood requests.

### AI-Powered Assistance

Generate cleaner request descriptions and improve request clarity.

### Community Trust

A reputation-driven system designed around real neighborhood interactions.

---

## Local Development

### Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/circles.git
cd circles
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=3000
VITE_API_URL=http://localhost:3000
```

### Run the application

```bash
npm run dev
```

The frontend and backend run together through the Express server.

---

## API Health Check

```text
GET /api/health
```

Returns server status, database connectivity, and AI configuration information.

---

## Project Structure

```text
circles/
├── src/
│   ├── components/
│   ├── pages/
│   ├── server/
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── models/
│   │   └── config/
│   └── utils/
├── server.ts
├── vite.config.ts
├── package.json
└── README.md
```

---

## Why Circles?

Circles is intentionally designed to feel **simple, warm, and familiar**. The goal is not to build another social network—it is to build a product that ordinary people can use without a tutorial.

Whether it is borrowing a ladder, finding a dog walker, or helping an elderly neighbor, Circles turns nearby strangers into a real local support network.

---

## Future Improvements

* Push notifications
* Verified apartment and society communities
* Trust score enhancements
* Scheduled help requests
* Multi-language support
* Better map clustering and navigation
* Persistent conversation history
* Advanced moderation tools

---

## Built For

Hackathon Round 1 — a real full-stack deployment with live authentication, MongoDB persistence, WebSocket chat, and AI integration.

---

**Circles — because the fastest help is often living next door.**
