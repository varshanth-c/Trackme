# Track₹ – Your Smart Financial Companion 🚀  
*(Also known as TrackMe)*  

An intelligent financial dashboard that gives you a **complete overview of your finances**. Track₹ lets you manage transactions, set budgets, and gain actionable insights into your spending habits through an **AI-powered natural language query interface**.  

🔗 **Live Demo:** [https://trackme-two.vercel.app/](https://trackme-two.vercel.app/)  

---

## 📸 Application Preview  
*A snapshot of the main dashboard showing performance trends and key financial stats.*  

---

## 📜 Table of Contents  
- [About The Project](#about-the-project)  
- [Key Features](#key-features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Contributing](#contributing)  

---

## About The Project  
Managing personal finances is often tedious and fragmented. Traditional expense trackers can be rigid, time-consuming, and lack advanced analysis tools.  

**Track₹ solves this problem** by offering:  
- A clean, intuitive interface for quick data entry  
- Powerful visualization tools for better financial awareness  
- A unique **Natural Language to SQL (NL-to-SQL)** feature that lets you *talk* to your data.  
  Example: *"What was my total spending on food last month?"* → Instant results.  

This makes financial analysis **faster, smarter, and more accessible** than ever.  

---

## Key Features ✨  

- **Comprehensive Transaction Management** – Add, view, edit, and delete your income, expenses, and investments with detailed forms and categorization.  
- **Interactive Dashboard** – A dynamic, responsive dashboard showing total income, expenses, and net savings at a glance.  
- **Smart Budgeting & Alerts** – Set monthly or yearly budgets per category, with email alerts when you approach limits.  
- **AI-Powered Queries (NL-to-SQL)** – Ask plain English questions about your finances; the system converts them into SQL and returns results instantly.  
- **Query History** – View and track your past financial questions for better analysis.  
- **Data-Driven Insights** – Filter by category or time, analyze trends, and make informed financial decisions.  
- **Secure Authentication** – JWT-based authentication with email verification and password reset support.  

---

## Tech Stack 🛠️  

**Frontend**  
- Framework: React.js  
- Language: TypeScript  
- UI: [shadcn/ui](https://ui.shadcn.com/), Tailwind CSS  
- State Management: React Context API, React Query  
- Charts: Recharts  
- Routing: React Router  

**Backend**  
- Framework: Node.js, Express.js  
- Language: JavaScript (ES6+)  
- Database: MySQL  
- Authentication: JSON Web Tokens (JWT), bcrypt  
- Email Service: Nodemailer  

---

## Getting Started 🚀  

Follow these steps to run the project locally.  

---

### Prerequisites  
Ensure you have the following installed:  
- Node.js (v18 or later)  
- npm or yarn  
- MySQL running locally or remotely  

---

### Installation  

#### 1️⃣ Clone the repository  
git clone https://github.com/varshanth/Trackme.git
cd Trackme

Frontend setup
Open a new terminal:

cd frontend
npm install
npm run dev
The frontend runs at: http://localhost:8080

Backend setup

cd Smart-vendor-backend
npm install
fill the .env
node start
The backend runs at: http://localhost:5000

###Environment Variables
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
Contributions are welcome!

Fork the repository

Create a feature branch (git checkout -b feature-name)

Commit changes (git commit -m 'Add feature')

Push to the branch (git push origin feature-name)

Open a Pull Request

If you have ideas for improvement, feel free to open an issue with the enhancement tag.

Thank you for checking out Track₹! 🙌

