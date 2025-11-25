Project overview
    The Patient Information Monitoring System is a real time web application designed to streamline patient data submission and provide hospital staff with an efficient way to monitor patient activity status. The system consists of two main user interfaces: a Patient Form Portal and an Admin Dashboard. Built with modern web technologies Next.js, Tailwind CSS, and Socket.IO the platform supports real time updates
Patient Form
    Patients can enter their personal information through a web form.
    Key features include:
        - Responsive and user friendly form design
        - Automatic detection of typing activity
        - Realtime activity tracking
Admin Dashboard
    Hospital staff can access a dedicated dashboard to monitor real time patient interactions.
    Key feature include: 
        - Live indicator showing patient activity:
        - Automatic updates via Socket.IO
        - Display of partial names for active sessions
        - Table of submitted patient records with timestamps
        - Staff can quickly search patients by name, allowing efficient navigation through many records.

    
How to run the project

Prerequisites
-   Node.js and npm installed.
Install dependencies
-   From the repo root, run npm install to download packages (scripts and dependencies are defined in package.json).

Start the Socket.IO server
1. In a first terminal, run npm run socket.
2. The server listens on port 4000 by default.

Start the Next.js app
1. In another terminal, run npm run dev.
2. Open http://localhost:3000 to view the app; edits hot-reload automatically.
3. For admin login, Username: admin Password: admin123


