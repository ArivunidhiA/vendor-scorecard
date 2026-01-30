# Criminal Records Vendor Quality Scorecard - Backend

## Overview

This is the FastAPI backend for the Criminal Records Vendor Quality Scorecard & Bake-Off System. It provides a comprehensive API for vendor monitoring, quality scoring, SLA management, and contract negotiation support.

## Features

- **Vendor Quality Scoring**: Composite scoring algorithm with 4 key metrics
- **Real-time SLA Monitoring**: Automated alerts for threshold breaches
- **Side-by-side Vendor Comparison**: Multi-vendor analysis with filtering
- **What-If Analysis**: Contract negotiation and ROI calculations
- **Schema Change Tracking**: Data lineage and impact assessment
- **Geographic Coverage Analysis**: Jurisdiction-based performance metrics

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite with SQLAlchemy 2.0.23
- **Authentication**: Python-JOSE with JWT
- **Data Processing**: Pandas & NumPy
- **Testing**: Pytest with async support

## Quick Start

### Prerequisites

- Python 3.8+
- pip or poetry

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database with sample data:
```bash
python -m app.database.seed_data
```

5. Start the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors/{id}` - Get vendor details
- `GET /api/vendors/{id}/score` - Get quality score
- `GET /api/vendors/{id}/history` - Get historical metrics
- `GET /api/vendors/{id}/jurisdictions` - Get jurisdiction performance
- `GET /api/vendors/benchmark/all` - Benchmark all vendors

### Comparison
- `POST /api/compare` - Compare multiple vendors
- `POST /api/whatif` - What-if analysis
- `POST /api/tco` - Total cost of ownership
- `GET /api/jurisdictions` - Get all jurisdictions
- `GET /api/benchmarks` - Market benchmarks
- `GET /api/coverage-heatmap` - Coverage heatmap data

### Alerts
- `GET /api/alerts` - Get recent alerts
- `GET /api/alerts/summary` - Alert summary statistics
- `GET /api/alerts/vendor/{id}` - Get vendor alerts
- `GET /api/alerts/vendor/{id}/sla-check` - Check SLA compliance
- `POST /api/alerts/configure` - Configure alert thresholds
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert
- `POST /api/alerts/{id}/resolve` - Resolve alert

### Analysis
- `GET /api/schema-changes` - Get schema changes
- `GET /api/schema-changes/vendor/{id}` - Get vendor schema changes
- `GET /api/impact-assessment/{id}` - Get change impact
- `GET /api/quality-trends/{id}` - Get quality trends
- `GET /api/performance-metrics` - Get performance metrics
- `GET /api/recommendations` - Get vendor recommendations

## Quality Score Calculation

The vendor quality score is calculated using the following formula:

```
Quality Score = (PII_Completeness × 0.4) + 
               (Disposition_Accuracy × 0.3) + 
               ((100 - Avg_Freshness_Days) × 0.2) + 
               (Coverage_Pct × 0.1)
```

### Metrics Breakdown

- **PII Completeness (40%)**: % of records with complete DOB, SSN, and full name
- **Disposition Accuracy (30%)**: % of correct felony/misdemeanor classifications
- **Data Freshness (20%)**: Average days from court filing to delivery (inverted scoring)
- **Geographic Coverage (10%)**: % of target jurisdictions covered

## Database Schema

### Core Tables

- **vendors**: Vendor information and basic metrics
- **vendor_metrics**: Historical quality metrics
- **criminal_records**: Sample criminal record data
- **jurisdictions**: Geographic jurisdictions
- **vendor_coverage**: Vendor coverage by jurisdiction
- **alerts**: SLA breach notifications
- **alert_configurations**: Alert threshold settings
- **schema_changes**: Vendor schema change history

## Sample Data

The system includes realistic sample data for:
- 4 vendors with different quality profiles
- 10,000+ criminal records
- 8 major US jurisdictions
- Historical metrics and trends
- Sample alerts and schema changes

## Configuration

### Environment Variables

```bash
DATABASE_URL=sqlite:///./vendor_quality.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Alert Thresholds

Default SLA thresholds:
- PII Completeness: 90%
- Disposition Accuracy: 95%
- Turnaround Time: 72 hours
- Quality Score: 85%
- Coverage: 80%

## Development

### Running Tests

```bash
pytest
```

### Code Structure

```
backend/
├── app/
│   ├── api/routes/          # API route handlers
│   ├── database/           # Database setup and seeding
│   ├── models/             # SQLAlchemy models
│   └── services/           # Business logic services
├── main.py                 # FastAPI application entry
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

### Adding New Endpoints

1. Create route handler in `app/api/routes/`
2. Add business logic in `app/services/`
3. Update models if needed in `app/models/`
4. Add tests in appropriate test files

## Production Deployment

### Docker

```bash
docker build -t vendor-quality-backend .
docker run -p 8000:8000 vendor-quality-backend
```

### Environment Setup

For production, ensure:
- Use PostgreSQL or MySQL instead of SQLite
- Set proper environment variables
- Configure reverse proxy (nginx)
- Set up SSL/TLS
- Configure logging and monitoring

## Security Considerations

- All API endpoints are protected with JWT authentication
- Input validation using Pydantic models
- SQL injection prevention through SQLAlchemy
- CORS configuration for frontend integration
- Rate limiting recommended for production

## Performance

- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching for expensive calculations
- Async/await for concurrent request handling

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review the error logs
3. Validate input data formats
4. Check database connectivity

## License

This project is proprietary and confidential.
