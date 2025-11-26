# Patient Information Monitoring System

## Project Overview
The Patient Information Monitoring System is a real-time web application designed to streamline patient data submission and provide hospital staff with an efficient way to monitor patient activity status. The platform is built with Next.js, Tailwind CSS, and Socket.IO to support real-time updates across two interfaces: a Patient Form Portal and an Admin Dashboard.

### Patient Form
Patients can enter their personal information through a web form.

**Key features**
- Responsive, user-friendly form design
- Automatic detection of typing activity
- Real-time activity tracking

### Admin Dashboard
Hospital staff can access a dedicated dashboard to monitor real-time patient interactions.

**Key features**
- Live indicator showing patient activity
- Automatic updates via Socket.IO
- Display of partial names for active sessions
- Table of submitted patient records with timestamps
- Patient search by name for efficient navigation through records

## How to Run the Project

### Prerequisites
- Node.js and npm installed

### Install Dependencies
From the repo root, install packages:

```bash
npm install
```

### Start the Socket.IO Server
By default the app points to the hosted socket server at `https://patient-info-backend.onrender.com`. You can override it with `NEXT_PUBLIC_SOCKET_URL` if you want to run your own:

```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000 npm run dev
```

If you need a local server, start it in another terminal:

```bash
npm run socket
```

### Start the Next.js App
In another terminal (or the same one if you are only using the hosted socket server):

```bash
npm run dev
```

Open <http://localhost:3000> to view the app. Edits hot-reload automatically.

**Admin login**
- Username: `admin`
- Password: `admin123`
