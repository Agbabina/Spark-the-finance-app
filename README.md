# 💰 FinanceTracker

A modern, full-stack personal finance management application built with React, TypeScript, ASP.NET Core, and SQLite. Track your income, expenses, and financial goals with beautiful visualizations and secure authentication.

![FinanceTracker Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=FinanceTracker+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **Transaction Management**: Add, edit, delete, and categorize income and expense transactions
- **Financial Dashboard**: Real-time overview of your financial health with interactive charts
- **Category Analytics**: Visualize spending patterns by category with pie charts
- **Income vs Expenses Trends**: Track financial trends over time with line charts
- **Balance Calculation**: Automatic calculation of net balance from all transactions

### 🔐 Security & Authentication
- **JWT Authentication**: Secure user authentication with JSON Web Tokens
- **User Registration**: Create new accounts with email and password
- **Protected Routes**: Secure API endpoints and frontend routes
- **Password Security**: ASP.NET Identity with configurable password policies

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Interactive Charts**: Built with Recharts for smooth data visualization
- **Mobile-First Navigation**: Collapsible sidebar for mobile devices

### 🛠️ Technical Features
- **Full-Stack Architecture**: React frontend with ASP.NET Core backend
- **Database Integration**: SQLite database with Entity Framework Core
- **RESTful API**: Well-structured API endpoints for all operations
- **Type Safety**: Full TypeScript implementation for reliability
- **Modern Build Tools**: Vite for fast development and optimized builds

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Composable charting library
- **Axios** - HTTP client for API calls
- **React Icons** - Beautiful icon library

### Backend
- **ASP.NET Core 8** - Cross-platform web framework
- **Entity Framework Core** - Object-relational mapping
- **SQLite** - Lightweight, file-based database
- **ASP.NET Identity** - User authentication and authorization
- **JWT Bearer Authentication** - Token-based security
- **CORS** - Cross-origin resource sharing support

### Development Tools
- **Visual Studio Code** - Primary IDE
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Git** - Version control

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Massive Project"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Restore NuGet packages
dotnet restore

# Run database migrations
dotnet ef database update

# Start the backend server
dotnet run
```

The backend will start on `https://localhost:5001` (HTTPS) and `http://localhost:5000` (HTTP).

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd src

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173` to access the FinanceTracker application.

## 📖 Usage

### Getting Started

1. **Register**: Create a new account with your email and password
2. **Login**: Sign in to access your personal dashboard
3. **Add Transactions**: Start tracking your income and expenses
4. **View Analytics**: Monitor your financial health with charts and summaries

### Adding Transactions

1. Click "Add Transaction" from the sidebar or dashboard
2. Select transaction type (Income or Expense)
3. Enter title, amount, and category
4. Choose a date (defaults to today)
5. Save the transaction

### Categories

The application supports the following expense categories:
- Food & Dining
- Transportation
- Entertainment
- Shopping
- Bills & Utilities
- Healthcare
- Education
- Travel
- Other

## 🏗️ Project Structure

```
Massive Project/
├── Backend/                          # ASP.NET Core API
│   ├── Controllers/                  # API Controllers
│   │   ├── AuthController.cs        # Authentication endpoints
│   │   └── TransactionController.cs # Transaction CRUD operations
│   ├── Models/                      # Data models
│   │   └── Transaction.cs           # Transaction entity
│   ├── Services/                    # Business logic
│   │   └── TransactionService.cs    # Transaction operations
│   ├── appsettings.json             # Configuration
│   └── Program.cs                   # Application entry point
├── public/                          # Static assets
├── src/                             # React frontend
│   ├── Components/                  # Reusable components
│   │   ├── Sidebar.tsx             # Main dashboard layout
│   │   ├── Input.tsx               # Form input component
│   │   └── LoginPage.tsx           # Authentication page
│   ├── Pages/                       # Page components
│   │   ├── AddTransaction.tsx       # Add transaction form
│   │   ├── Transactions.tsx         # Transaction list
│   │   └── LoginPage.tsx            # Login page
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # Application entry point
│   └── types.ts                     # TypeScript type definitions
├── package.json                     # Frontend dependencies
├── tsconfig.json                    # TypeScript configuration
└── vite.config.ts                   # Vite configuration
```

## 🔧 Configuration

### Backend Configuration

The backend uses `appsettings.json` for configuration. Key settings include:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=financetracker.db"
  },
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "FinanceTracker",
    "Audience": "FinanceTrackerUsers"
  }
}
```

### Environment Variables

Create environment files as needed:

- `Backend/appsettings.Development.json` - Development settings
- `.env` - Frontend environment variables (if needed)

## 🚀 Deployment

### Backend Deployment

```bash
# Build for production
dotnet publish -c Release -o ./publish

# Run the published application
dotnet ./publish/Backend.dll
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve the built files
npm run preview
```

## 🧪 Testing

### Backend Testing

```bash
cd Backend
dotnet test
```

### Frontend Testing

```bash
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### POST `/api/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

### Transaction Endpoints

#### GET `/api/transactions`
Get all transactions for the authenticated user.

#### POST `/api/transactions`
Create a new transaction.

**Request Body:**
```json
{
  "title": "Grocery Shopping",
  "amount": 150.00,
  "type": "expense",
  "category": "Food & Dining",
  "date": "2024-01-15"
}
```

#### PUT `/api/transactions/{id}`
Update an existing transaction.

#### DELETE `/api/transactions/{id}`
Delete a transaction.

## 🐛 Known Issues & Troubleshooting

### Common Issues

1. **Port Conflicts**: If ports 5000/5001 are in use, update `launchSettings.json`
2. **Database Errors**: Ensure SQLite database file has proper permissions
3. **CORS Issues**: Check CORS configuration in `Program.cs`
4. **Authentication Failures**: Verify JWT configuration and token expiration

### Debug Mode

Run in development mode for detailed error messages:

```bash
# Backend
dotnet run --environment Development

# Frontend
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/) - Cross-platform web framework
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Recharts](https://recharts.org/) - Composable charting library built on React components

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Made with ❤️ for personal finance management**
