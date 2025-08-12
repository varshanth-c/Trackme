Track₹ - Your Smart Financial Companion 🚀(Trackme)
An intelligent financial dashboard designed to provide a comprehensive overview of your finances. Track₹ allows you to manage transactions, set and monitor budgets, and gain unique insights into your spending habits through an AI-powered natural language query interface.

Live Demo: [(https://trackme-two.vercel.app/)]

📸 Application Preview
A snapshot of the main dashboard, showcasing performance trends and key financial stats.

📜 Table of Contents
-About The Project
-Key Features
-Tech Stack
-Getting Started
-Prerequisites
-Installation
-Environment Variables

About The Project
Track₹ was built to solve the common problem of financial disorganization. Traditional expense trackers can be rigid and time-consuming. This application streamlines the process by offering a clean interface for data entry, powerful visualization tools, and a unique Natural Language to SQL (NL-to-SQL) feature that lets you "talk" to your data. Ask questions like "What was my total spending on food last month?" and get instant answers, making financial analysis more intuitive and accessible than ever before.

Key Features ✨
Comprehensive Transaction Management: Seamlessly add, view, edit, and delete your income, expenses, and investments with detailed forms and categorization.

Interactive Dashboard: A dynamic and responsive dashboard that provides a bird's-eye view of your financial health, including total income, revenue, and net savings.

Smart Budgeting & Alerts: Set monthly or yearly budgets for different categories. The system automatically tracks your spending and sends you email alerts when you're approaching your limit.

AI-Powered Queries (NL-to-SQL): Ask questions about your finances in plain English. The backend converts your query into a SQL command, fetches the data, and presents it to you.

Query History: Your natural language queries are saved, allowing you to review past inquiries and track your analytical journey.

Data-Driven Insights: Analyze performance trends with interactive charts, filter your data by type or time period, and gain a deeper understanding of your financial habits.

Secure User Authentication: A complete and secure authentication system using JWT, including email verification and a "forgot password" flow.

Tech Stack 🛠️
This project is a full-stack application built with modern technologies.

Frontend:

Framework: React.js

Language: TypeScript

UI: shadcn/ui, Tailwind CSS

State Management: React Context API, React Query

Charting: Recharts

Routing: React Router

Backend:

Framework: Node.js, Express.js

Language: JavaScript (ES6+)

Database: MySQL

Authentication: JSON Web Tokens (JWT), bcrypt

Email Service: Nodemailer

Getting Started 🚀
To get a local copy up and running, follow these simple steps.

Prerequisites
Make sure you have the following installed on your machine:

Node.js (v18 or later)

npm (or yarn)

A running instance of MySQL

Installation
Clone the repository:

Bash

git clone https://github.com/your-username/trackr-project.git
cd trackr-project
Setup the Backend:

Bash

cd backend
npm install
cp .env.example .env
Next, open the .env file and fill in your environment variables (see the section below).
Finally, start the backend server:

Bash

npm run dev 
Your backend should now be running on http://localhost:5000.

Setup the Frontend:
Open a new terminal window.

Bash

cd frontend
npm install
Start the frontend development server:

Bash

npm run dev
Your frontend should now be running on http://localhost:8080 (or another port if 8080 is busy).

Environment Variables 🔑
For the application to run correctly, you must create a .env file in the backend directory and provide the following values:

Code snippet

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=trackr_db

# JWT Secret Key
JWT_SECRET=a_very_strong_and_secret_key_for_jwt

# Email Service (Nodemailer with a service like Ethereal or SendGrid)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Frontend Base URL (for email links)
BASE_URL=http://localhost:8080

Contributing 🤝
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Thankyou
