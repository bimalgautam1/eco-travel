# EcoRoute - Smart Commute Decision Engine

## Project Overview
EcoRoute is an intelligent, full-stack commute decision engine designed to help urban travelers find the most cost-effective, time-efficient, and eco-friendly travel routes. By leveraging modern web technologies and AI, EcoRoute analyzes various modes of transport to provide users with personalized travel recommendations tailored to their city.

## Problem Statement
Urban commuters often struggle to balance cost, travel time, and environmental impact when navigating complex public transit networks. Existing solutions typically prioritize only the fastest route without providing transparent cost breakdowns (like local city bus fares) or considering the carbon footprint of the journey. There is a need for a centralized platform that helps users make smart, sustainable travel choices.

## Proposed Solution
EcoRoute solves this by offering a comprehensive, multi-modal commute search platform. It calculates dynamic, city-specific fares (e.g., DTC buses in Delhi, BMTC is on a personal dashboard, and visualize routes on an interactive map.n Bengaluru) and uses an AI-powered engine to provide intelligent insights on the best travel options. Users can create accounts, track their commute

## Features
*   **Multi-Modal Route Search:** Compare different modes of transport (Bus, Metro, Auto, Cab).
*   **AI-Powered Insights:** Get smart recommendations generated via Groq AI based on travel preferences and conditions.
*   **Dynamic Cost Calculation:** Accurate fare estimation engine for specific city transit systems.
*   **Interactive Map View:** Visual representation of routes and locations.
*   **User Authentication:** Secure signup and login system using JWT.
*   **Personalized Dashboard:** Track past searches and manage preferences.

## Technology Stack
**Frontend:**
*   React.js
*   Vite
*   TailwindCSS
*   React Router DOM

**Backend:**
*   Node.js
*   Express.js
*   Sequelize ORM
*   PostgreSQL (Database)
*   Groq SDK (AI Integration)
*   JWT & bcrypt (Authentication)

## Setup & Usage Instructions

### Prerequisites
*   Node.js installed on your machine
*   PostgreSQL installed and running
*   Groq API Key

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd eco-travel
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```
Run the database seeds (optional) and start the server:
```bash
npm run seed
npm start
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the development server:
```bash
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

*   **Participant Name** - Bimal Gautam
