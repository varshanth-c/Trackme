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
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

---

## About The Project
Managing personal finances is often tedious and fragmented. Traditional expense trackers can be rigid, time-consuming, and lack advanced analysis tools.

**Track₹ solves this problem** by offering:
- A clean, intuitive interface for quick data entry
- Powerful visualization tools for better financial awareness
- A unique **Natural Language to SQL (NL-to-SQL)** feature that lets you *talk* to your data.
  - Example: *"What was my total spending on food last month?"* → Instant results.

This makes financial analysis **faster, smarter, and more accessible** than ever.

---

## Key Features

- **Comprehensive Transaction Management** – Add, view, edit, and delete your income, expenses, and investments with detailed forms and categorization.
- **Interactive Dashboard** – A dynamic, responsive dashboard showing total income, expenses, and net savings at a glance.
- **Smart Budgeting & Alerts** – Set monthly or yearly budgets per category, with email alerts when you approach limits.
- **AI-Powered Queries (NL-to-SQL)** – Ask plain English questions about your finances; the system converts them into SQL and returns results instantly.
- **Query History** – View and track your past financial questions for better analysis.
- **Data-Driven Insights** – Filter by category or time, analyze trends, and make informed financial decisions.
- **Secure Authentication** – JWT-based authentication with email verification and password reset support.

---

## Tech Stack

**Frontend**
- **Framework:** React.js
- **Language:** TypeScript
- **UI:** [shadcn/ui](https://ui.shadcn.com/), Tailwind CSS
- **State Management:** React Context API, React Query
- **Charts:** Recharts
- **Routing:** React Router

**Backend**
- **Framework:** Node.js, Express.js
- **Language:** JavaScript (ES6+)
- **Database:** MySQL
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **Email Service:** Nodemailer

---

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v18 or later)
- npm or yarn
- A running instance of MySQL

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/varshanth/Trackme.git](https://github.com/varshanth/Trackme.git)
    cd Trackme
    ```

2.  **Set up the Backend:**
    ```sh
    # Navigate to the backend directory
    cd Smart-vendor-backend

    # Install dependencies
    npm install

    # Create a .env file (you can copy from .env.example if it exists)
    # Then, fill in your environment variables as described below.

    # Start the server
    node start
    ```
    Your backend will be running at `http://localhost:5000`.

3.  **Set up the Frontend:**
    Open a new terminal window and navigate back to the root `Trackme` directory.
    ```sh
    # Navigate to the frontend directory
    cd frontend

    # Install dependencies
    npm install

    # Start the development server
    npm run dev
    ```
    Your frontend will be running at `http://localhost:8080`.

---

## Environment Variables

For the backend to run correctly, you must create a `.env` file in the `Smart-vendor-backend` directory and provide the following values:

```env
# .env.example

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

## Contributing
Contributions are welcome! If you have ideas for improvement, feel free to fork the repository and create a pull request.

Fork the repository.
Create a new feature branch (git checkout -b feature/AmazingFeature).
Commit your changes (git commit -m 'Add some AmazingFeature').
Push to the branch (git push origin feature/AmazingFeature).
Open a Pull Request.

## Acknowledgments
Thank you for checking out Track₹!
