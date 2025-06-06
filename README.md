# Student Budgeting Application


A comprehensive financial management tool designed specifically for students to track income, expenses, and budget goals. Built with a modern tech stack and featuring a clean, intuitive interface.

## ✨ Features

- **Expense Tracking**: Log and categorize your daily expenses
- **Income Management**: Track different income sources and frequencies
- **Budget Planning**: Set monthly budgets and monitor spending limits
- **Interactive Dashboard**: Visualize your financial data with intuitive charts
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Data Export**: Export your transaction history for record keeping

## 🚀 Tech Stack

- **Frontend**: 
  - React with TypeScript
  - Material-UI for components
  - Chart.js for data visualization
  - React Router for navigation

- **Backend**:
  - FastAPI (Python)
  - SQLite database
  - JWT Authentication

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- Python (3.8+)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/braaaeeedyn/student-budgeting-app.git
   cd student-budgeting-app
   ```

2. **Set up the backend**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

## 🚦 Running the Application

1. **Start the backend server**
   ```bash
   cd server
   uvicorn main:app --reload
   ```

2. **Start the frontend development server**
   ```bash
   cd ../client
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Features in Detail

### Dashboard
- Overview of your financial status
- Visual spending breakdown by category
- Monthly budget progress
- Recent transactions

### Expenses
- Add and categorize expenses
- Set monthly budgets for categories
- View spending history and trends

### Income
- Track different income sources
- Set up recurring income
- View income history

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI for the amazing UI components
- Chart.js for beautiful data visualization
- React Icons for the icon set

---

Made with ❤️ by [Braedyn Thompson] | Budget App

A personal budgeting application designed specifically for students to help manage finances, track expenses, and set savings goals.

## Features

- **User Authentication**: Secure signup and login functionality
- **Income Tracking**: Add and manage different income sources
- **Expense Tracking**: Track and categorize expenses
- **Budget Planning**: Set monthly budgets for different categories
- **Dashboard**: Visualize financial data with summary charts and statistics
- **Savings Goals**: Set and track progress toward financial goals
- **Responsive Design**: Works on mobile, tablet, and desktop

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI for UI components
- React Router for navigation
- Chart.js for data visualization
- Formik & Yup for form management

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Sequelize ORM
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- PostgreSQL database

### Installation

1. Clone the repository
```
git clone <repository-url>
cd student-budget-app
```

2. Set up the backend
```
cd server
npm install
```

3. Configure environment variables
Create a `.env` file in the server directory with the following variables:
```
PORT=5000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/budget_app
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

4. Set up the database
```
# Create PostgreSQL database
# Then run:
npm run dev
```

5. Set up the frontend
```
cd ../client
npm install
```

6. Configure frontend environment
Create a `.env` file in the client directory with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

7. Run the application
```
# In one terminal (server)
cd server
npm run dev

# In another terminal (client)
cd client
npm start
```

The application should now be running with:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
student-budget-app/
├── client/             # Frontend React application
│   ├── public/         # Static files
│   ├── src/            # Source files
│   │   ├── components/ # Reusable components
│   │   ├── contexts/   # React contexts (auth, etc.)
│   │   ├── layouts/    # Layout components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript type definitions
│   ├── package.json    # Frontend dependencies
│   └── tsconfig.json   # TypeScript configuration
│
└── server/             # Backend Node.js application
    ├── src/            # Source files
    │   ├── config/     # Configuration files
    │   ├── controllers/# Route controllers
    │   ├── middleware/ # Express middleware
    │   ├── models/     # Sequelize models
    │   └── routes/     # API routes
    ├── package.json    # Backend dependencies
    └── tsconfig.json   # TypeScript configuration
```

## Future Enhancements

- Email notifications for budget alerts
- Transaction history and search
- Data export functionality
- Bill reminders and recurring payments
- Categories customization
- Dark/light theme support
