# Hubly CRM

Hubly CRM is a full customer-support and ticket-management system built with a modern MERN-based architecture. 
It includes a lightweight User Chat Widget, a powerful Management Dashboard, and a secure Node.js backend.

## Overview
Hubly CRM enables customers to submit support requests while allowing admin & team members to manage tickets, reply to users, analyze statistics, and configure chatbot settings.

The system is divided into:
- User Frontend → Chat widget for customers
- Management Frontend → Dashboard for Admins & Members
- Backend → Node.js/Express API with MongoDB

## Tech Stack
### Frontend:
- React (Vite)
- Context API (Auth & Chat)
- Axios
- Tailwind / CSS

### Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Role-Based Access Control
- CORS / Helmet / Bcrypt

## Admin Credentials
Email: astha@hublycrm.com  
Password: Astha@1234

## Folder Structure
Hubly-crm/
- backend/
- management-frontend/
- user-frontend/

## Key Features
### User Chat Widget (User-Frontend)
- Simple & responsive customer chat
- One-time message submission
- Auto-creates support ticket
- Missed chat timer applied

### Management Dashboard (Admin & Members)
- View all tickets / assigned tickets
- Live messaging with customers
- Ticket assignment system
- Ticket statuses (Open / Resolved)
- Analytics summary (total, resolved, missed, unresolved)

### Chatbot Settings
- Customize header color & background
- Edit welcome messages & auto messages
- Update intro form fields
- Missed Chat Timer (hours/minutes/seconds)

## Missed Chat Logic
A chat is marked missed when:
1. User sends their first message  
2. Staff does NOT reply within the configured timer  
3. Staff opens the ticket later  

## How to Run Locally
### Install Dependencies:
Backend: `npm install`  
Management Frontend: `npm install`  
User Frontend: `npm install`

### Start Servers:
Backend: `npm run dev`  
Management Frontend: `npm run dev`  
User Frontend: `npm run dev`

## Environment Variables (.env for backend):
MONGO_URI=your_mongo_db_url  
JWT_SECRET=your_secret_key  
PORT=5000

## Authentication
- JWT login
- Admin: full dashboard access
- Member: assigned tickets only

## Final Notes
- User widget and dashboard separated
- Missed chat detection executed server-side
- Optimized for CRM workflow

