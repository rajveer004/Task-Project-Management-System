# 🚀 Task & Project Board (SubPilot)

<p align="center">

# 📋 AI-Powered Collaborative Project Management Platform

A modern full-stack project management platform built with **React, TypeScript, Node.js, Express, MongoDB, Redux Toolkit, Vite, and Google Gemini AI**. It enables teams to manage projects, collaborate in real-time, automate workflows, and leverage AI to boost productivity.

![GitHub stars](https://img.shields.io/github/stars/yourusername/task-project-board?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/yourusername/task-project-board?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/yourusername/task-project-board?style=for-the-badge)
![License](https://img.shields.io/github/license/yourusername/task-project-board?style=for-the-badge)

</p>

---

# 📑 Table of Contents

- Overview
- Features
- Tech Stack
- Architecture
- Project Structure
- Installation
- Environment Variables
- Running the Project
- API Endpoints
- Screenshots
- Future Improvements
- Contributing
- License

---

# 📖 Overview

Task & Project Board (SubPilot) is an enterprise-grade collaborative project management application that combines Kanban boards, task management, automation, analytics, AI assistance, and real-time collaboration into one platform.

The application is designed to improve team productivity through intelligent project planning, workflow automation, and live collaboration.

---

# ✨ Features

## 📋 Task Management

- Create unlimited Boards
- Kanban Drag & Drop
- Create/Edit/Delete Tasks
- Task Priorities
- Task Labels
- Due Dates
- Start Dates
- Cover Images
- File Attachments
- Checklists/Subtasks
- Progress Tracking

---

## 👥 Team Management

- Team Members
- User Profiles
- User Availability
- Team Capacity
- User Skills
- Departments
- Role Based Access Control

Roles

- 👑 Admin
- 👨‍💻 Member
- 👀 Guest

---

## ⚡ Real-Time Collaboration

- Live Board Updates
- Server Sent Events (SSE)
- Instant Synchronization
- Activity Feed
- Notifications
- Presence System

---

## 🤖 AI Features

Powered by Google Gemini AI

- AI Task Assistant
- AI Project Suggestions
- Smart Recommendations
- Intelligent Workflow Support

---

## 📊 Analytics Dashboard

- Productivity Reports
- Task Analytics
- Team Performance
- Project Insights
- Charts using Recharts

---

## ⚙️ Automation

Create workflow rules like

- Auto Assign Tasks
- Auto Add Tags
- Priority Notifications
- Automation Rules
- Smart Workflow Actions

---

## 💬 Collaboration

- Comments
- Mentions
- Team Chat
- Notifications
- Activity Timeline

---

## 🔐 Security

- JWT Authentication
- MongoDB Authentication
- Audit Logs
- MFA Support
- Security Logs
- Protected Routes

---

# 🛠 Tech Stack

## Frontend

<p align="left">
<img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Redux_Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white"/>
<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/React_DnD-FF6B6B?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Lucide-000000?style=for-the-badge&logo=lucide&logoColor=white"/>
<img src="https://img.shields.io/badge/Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white"/>
<img src="https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge"/>
</p>

---

## Backend

<p align="left">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
<img src="https://img.shields.io/badge/Dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black"/>
</p>

---

## AI

<p align="left">
<img src="https://img.shields.io/badge/Google_Gemini-8E75FF?style=for-the-badge&logo=googlegemini&logoColor=white"/>
</p>

---

## Development Tools

<p align="left">
<img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white"/>
<img src="https://img.shields.io/badge/ESBuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=black"/>
<img src="https://img.shields.io/badge/TSX-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
<img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"/>
</p>

---

# 🏗 Architecture

```
                React + Redux
                      │
             Vite Development Server
                      │
                Express Backend
                      │
      ┌───────────────┼────────────────┐
      │               │                │
 Authentication     MongoDB        Gemini AI
      │               │                │
      └───────────────┼────────────────┘
                      │
              Server Sent Events
             (Real-Time Updates)
```

---

# 📂 Project Structure

```
Task-Project-Board
│
├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   ├── redux
│   ├── utils
│   ├── services
│   └── assets
│
├── server
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── auth
│   ├── db
│   └── controllers
│
├── public
│
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

# ⚙ Installation

Clone Repository

```bash
git clone https://github.com/yourusername/task-project-board.git

cd task-project-board
```

Install Dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file.

```env
PORT=3001

MONGODB_URI=your_mongodb_connection_string

GEMINI_API_KEY=your_google_gemini_api_key

APP_URL=http://localhost:3001
```

---

# ▶ Running the Project

Development

```bash
npm run dev
```

Build

```bash
npm run build
```

Production

```bash
npm run start
```

Type Checking

```bash
npm run lint
```

---

# 📡 API Endpoints

## Authentication

```
/api/auth
```

## Boards

```
/api/boards
```

## Tasks

```
/api/tasks
```

## AI

```
/api/ai
```

## Analytics

```
/api/analytics
```

## Automations

```
/api/automations
```

## Security

```
/api/security
```

## Matchmaking

```
/api/matchmaking
```

## Chat

```
/api/chat
```

## Real-Time Events

```
/api/realtime/stream
```

---

# 📸 Screenshots

```
Dashboard

Kanban Board

Analytics

Task Details

Chat

Automation

Security Dashboard
```

(Add screenshots here)

---

# 🚀 Upcoming Features

- WebSocket Support
- Calendar View
- Time Tracking
- Email Notifications
- Google Calendar Integration
- Slack Integration
- AI Sprint Planner
- AI Report Generator
- Mobile Application
- Dark Theme Customization
- Cloud Storage
- File Uploads

---

# 🤝 Contributing

Fork the project

```bash
git checkout -b feature/NewFeature
```

Commit

```bash
git commit -m "Added New Feature"
```

Push

```bash
git push origin feature/NewFeature
```

Open a Pull Request.

---


<p align="center">

### ⭐ Star this repository if you found it useful!

Made with ❤️ using React, TypeScript, Express, MongoDB & Google Gemini AI.

</p>
