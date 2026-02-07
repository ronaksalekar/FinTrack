
FinTrack – Expense Tracker App

FinTrack is a personal finance tracking web application built using React.
It helps users keep track of their income, expenses, budgets, and spending patterns in a single place.

The application includes user authentication, a guided onboarding flow, dashboards, reports, and user settings, with a focus on clean UI structure and scalable frontend architecture.

=> Features
1) Authentication
   
            -User signup and login with form validation
            -Password visibility toggle
            -Error messages and loading states
            -Route protection using a custom authentication context
   

2) Onboarding (Welcome Flow)

            -Multi-step onboarding shown after first signup
            -Collects basic user preferences
            -Light / Dark theme selection
            -User progress stored in localStorage
            -Automatically skipped for returning users

3) Dashboard

            -High-level overview of:
                        ~Total balance
                        ~Total income
                        ~Total expenses
                        ~Daily expenses
            -Quick access actions:
                        ~Add transaction
                        ~Create budget
                        ~View reports

4) Transactions

            -Add and manage income and expense entries
            -Category-based tracking
            -Instant UI updates after changes

5) Budgets

            -Create and manage budgets
            -Track spending against limits
            -Compare budgeted vs actual expenses

7) Reports and Analytics

            -Visual breakdown of spending
            -Category-wise analysis
            -Time-based expense reports

8) Settings

            -Profile management
            -Password update
            -Notification preferences
            -Theme preferences

=> Tech Stack

Frontend: React (Functional components & Hooks)
Routing: React Router DOM
State Management: Context API
Styling: Plain CSS (no UI frameworks)
Icons: lucide-react
Authentication State: Custom Auth Context
Data Persistence: localStorage



=> Project Structure

FRONTEND:

        finance_tracker
            ├─ backend
            │  ├─ .env
            │  ├─ config
            │  │  └─ db.js
            │  ├─ controllers
            │  │  └─ authController.js
            │  ├─ middleware
            │  │  └─ authMiddleware.js
            │  ├─ models
            │  │  └─ user.js
            │  ├─ package-lock.json
            │  ├─ package.json
            │  ├─ routes
            │  │  └─ authRoutes.js
            │  └─ server.js
            └─ frontend
               ├─ package-lock.json
               ├─ package.json
               ├─ public
               │  ├─ favicon.ico
               │  ├─ index.html
               │  ├─ istockphoto-1337144146-612x612.jpg
               │  ├─ logo192.png
               │  ├─ logo512.png
               │  ├─ manifest.json
               │  ├─ robots.txt
               │  └─ Screenshot 2026-01-07 213010.png
               ├─ README.md
               └─ src
                  ├─ App.css
                  ├─ App.js
                  ├─ App.test.js
                  ├─ components
                  │  ├─ Auth
                  │  │  ├─ AuthContext.css
                  │  │  ├─ AuthContext.jsx
                  │  │  ├─ LoginPage.css
                  │  │  ├─ LoginPage.jsx
                  │  │  └─ ProtectedRoute.jsx
                  │  ├─ Dashboard.css
                  │  ├─ Dashboard.jsx
                  │  ├─ Navbar.css
                  │  ├─ Navbar.jsx
                  │  ├─ pages
                  │  │  ├─ budgets
                  │  │  │  ├─ BudgetForm.css
                  │  │  │  └─ BudgetForm.jsx
                  │  │  ├─ intro
                  │  │  │  ├─ welcome.jsx
                  │  │  │  └─ WelcomePage.css
                  │  │  └─ transactions
                  │  │     ├─ Addtransactions.jsx
                  │  │     ├─ TransactionForm.css
                  │  │     └─ TransactionForm.jsx
                  │  ├─ Report
                  │  │  ├─ ReportPage.css
                  │  │  └─ ReportPage.jsx
                  │  ├─ ScrollToTop.jsx
                  │  ├─ settings
                  │  │  ├─ Settings.css
                  │  │  └─ Settings.jsx
                  │  ├─ UserDropdown.css
                  │  └─ UserDropdown.jsx
                  ├─ index.css
                  ├─ index.js
                  ├─ logo.svg
                  ├─ reportWebVitals.js
                  └─ setupTests.js
