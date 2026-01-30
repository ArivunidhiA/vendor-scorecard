# 🏆 Criminal Records Vendor Quality Scorecard

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ArivunidhiA/vendor-scorecard)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)]()
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com)

> 🎯 A production-level vendor monitoring and comparison system for criminal records screening providers

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [📊 API Documentation](#-api-documentation)
- [🔒 Security](#-security)
- [📈 Performance](#-performance)
- [🤝 Contributing](#-contributing)

## 🌟 Overview

The Criminal Records Vendor Quality Scorecard is a comprehensive platform that enables data-driven vendor selection, SLA monitoring, and contract negotiation support for background screening operations. Built with modern technologies and production-grade architecture, it provides real-time insights into vendor performance through advanced analytics and visualizations.

### Key Highlights
- 🔍 **Real-time Quality Scoring**: Composite 0-100 scale with weighted metrics
- 📊 **Interactive Dashboards**: Modern React-based UI with responsive design
- 🚨 **SLA Monitoring**: Automated alerts and threshold management
- 💰 **ROI Analysis**: Contract negotiation support with what-if scenarios
- 🗺️ **Geographic Coverage**: Jurisdiction-based performance mapping
- � **Trend Analysis**: Historical data tracking and predictions

## ✨ Features

### 🎯 Core Functionality
- **Vendor Quality Scorecard**: Composite scoring from 4 key metrics
- **Side-by-Side Comparison**: Multi-vendor analysis with advanced filtering
- **SLA Monitoring & Alerts**: Real-time threshold breach detection
- **Contract Negotiation Support**: What-if analysis and ROI calculations
- **Vendor Change Tracking**: Schema change history and impact assessment
- **Geographic Coverage Analysis**: Jurisdiction-based performance metrics

### 📊 Quality Metrics
- **PII Completeness (40%)**: % records with DOB, SSN, full name
- **Disposition Accuracy (30%)**: Correct felony/misdemeanor classification
- **Data Freshness (20%)**: Average days from court filing to delivery
- **Geographic Coverage (10%)**: % of target jurisdictions covered

### 🎨 User Interface
- **Responsive Design**: Mobile-friendly interface
- **Interactive Charts**: Real-time data visualization with Recharts
- **Export Functionality**: CSV export for analysis
- **Dark Mode Support**: User preference settings

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   FastAPI       │    │   SQLite DB     │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • REST API      │◄──►│ • Vendors       │
│ • Charts        │    │ • Auth          │    │ • Records       │
│ • Tables        │    │ • Validation    │    │ • Metrics       │
│ • Forms         │    │ • Business Logic│    │ • Alerts        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Docker        │
                    │                 │
                    │ • Container     │
                    │ • Orchestration │
                    │ • Health Checks │
                    └─────────────────┘
```

### Component Breakdown

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18.2.0 + Tailwind CSS | User interface and interactions |
| **Backend** | FastAPI + SQLAlchemy | REST API and business logic |
| **Database** | SQLite/PostgreSQL | Data persistence and relationships |
| **Container** | Docker + Docker Compose | Deployment and orchestration |
| **Web Server** | Nginx (Production) | Reverse proxy and static serving |

## 🛠 Tech Stack

### Backend Technologies
```python
# Core Framework
FastAPI==0.104.1          # Modern Python web framework
SQLAlchemy==2.0.23        # ORM and database toolkit
Pydantic==2.5.0           # Data validation and serialization

# Authentication & Security
python-jose[cryptography]==3.3.0  # JWT token handling
passlib[bcrypt]==1.7.4            # Password hashing

# Data Processing
pandas==2.1.4             # Data analysis and manipulation
numpy==1.25.2              # Numerical computing

# Development & Testing
pytest==7.4.3             # Testing framework
pytest-asyncio==0.21.1    # Async testing support
```

### Frontend Technologies
```json
{
  "core": {
    "react": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1"
  },
  "styling": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.13"
  },
  "visualization": {
    "recharts": "^2.8.0"
  },
  "utilities": {
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0"
  }
}
```

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development/production
- **Web Server**: Nginx for production deployments
- **Database**: SQLite (dev) / PostgreSQL (prod)

## � Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 14+ (for local development)
- Python 3.8+ (for local development)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/ArivunidhiA/vendor-scorecard.git
cd vendor-scorecard
```

2. **Build and start the application**
```bash
docker-compose up --build -d
```

3. **Initialize with sample data**
```bash
docker-compose exec vendor-quality-app python -m app.database.seed_data
```

4. **Access the application**
- Frontend: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### 💻 Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.database.seed_data
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## ⚙️ Configuration

### Environment Variables

#### Backend Configuration
```bash
# Database
DATABASE_URL=sqlite:///./vendor_quality.db

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=false
LOG_LEVEL=INFO
```

#### Frontend Configuration
```bash
# API Endpoint
REACT_APP_API_URL=http://localhost:8000

# Environment
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

### Default SLA Thresholds
| Metric | Threshold | Description |
|--------|-----------|-------------|
| PII Completeness | 90% | Minimum complete records |
| Disposition Accuracy | 95% | Correct classification rate |
| Turnaround Time | 72 hours | Maximum delivery time |
| Quality Score | 85 | Minimum quality threshold |
| Coverage | 80% | Minimum jurisdiction coverage |

## � API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Vendor Management
```http
GET    /api/vendors              # List all vendors
GET    /api/vendors/{id}         # Get vendor details
GET    /api/vendors/benchmark/all # Benchmark comparison
```

#### Analysis & Comparison
```http
POST   /api/compare               # Compare multiple vendors
POST   /api/whatif               # What-if analysis
GET    /api/coverage-heatmap     # Coverage heatmap data
```

#### Alerts & Monitoring
```http
GET    /api/alerts               # Get recent alerts
POST   /api/alerts/configure     # Configure thresholds
POST   /api/alerts/{id}/acknowledge # Acknowledge alert
```

## 🔒 Security

- **Authentication**: JWT-based API authentication
- **Input Validation**: Pydantic models for request validation
- **SQL Injection**: SQLAlchemy ORM protection
- **CORS**: Configured for frontend integration
- **Rate Limiting**: Recommended for production deployments

## 📈 Performance

### Optimization Features
- **Database Indexing**: Optimized query performance
- **Pagination**: Large dataset handling
- **Caching**: Frequently accessed data
- **Async Operations**: Concurrent request handling
- **Bundle Optimization**: Frontend code splitting

### Monitoring
- **Health Checks**: Docker health monitoring
- **Logging**: Structured application logs
- **Metrics**: Performance tracking endpoints

## 🤝 Contributing

1. Follow the established code style and conventions
2. Write comprehensive tests for new features
3. Update documentation and API docs
4. Ensure accessibility compliance (WCAG 2.1)
5. Test across multiple browsers and devices

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm test  # Frontend tests
pytest    # Backend tests

# Commit and push
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Built with ❤️ for data-driven vendor management excellence**
