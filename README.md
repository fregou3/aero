# AeroMaintenance

AeroMaintenance is a comprehensive web application designed for aircraft maintenance management, specifically for Airbus aircraft. This solution allows technicians and engineers to manage maintenance tasks, track aircraft parts, handle inventory, and manage technical documentation.

## Features

- Interactive 3D visualization of aircraft with segmentation by zones
- Complete maintenance workflow management
- Parts and inventory tracking with lifecycle management
- Technical document management with version control
- User authentication with role-based access control
- Dashboard with KPIs and maintenance status

## Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose
- **Authentication**: JWT

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- npm or yarn (for local development)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone <repository-url>
   cd aeromaintenance
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3042
   - Backend API: http://localhost:5042
   - PostgreSQL: localhost:5441

### Local Development

#### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the provided example:
   ```
   NODE_ENV=development
   PORT=5041
   JWT_SECRET=aeromaintenance-secure-jwt-secret-key
   DB_HOST=localhost
   DB_PORT=5441
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=aeromaintenance
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. Access the frontend at http://localhost:3000

## Project Structure

```
aeromaintenance/
├── backend/               # Backend Node.js application
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded files
│   ├── .env               # Environment variables
│   ├── Dockerfile         # Backend Docker configuration
│   ├── package.json       # Node.js dependencies
│   └── server.js          # Main application file
├── frontend/              # Frontend React application
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Application pages
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   ├── Dockerfile         # Frontend Docker configuration
│   └── package.json       # React dependencies
├── docker/                # Docker related files
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

## API Documentation

The API documentation is available at http://localhost:5042/api-docs when the backend is running.

## Default Users

For testing purposes, the following default users are created:

- **Administrator**:
  - Email: admin@aeromaintenance.com
  - Password: admin123

- **Technician**:
  - Email: tech@aeromaintenance.com
  - Password: tech123

- **Engineer**:
  - Email: engineer@aeromaintenance.com
  - Password: engineer123

- **Supervisor**:
  - Email: supervisor@aeromaintenance.com
  - Password: supervisor123

## License

This project is licensed under the MIT License.
