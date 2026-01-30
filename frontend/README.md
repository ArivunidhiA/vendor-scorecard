# Criminal Records Vendor Quality Scorecard - Frontend

## Overview

This is the React frontend for the Criminal Records Vendor Quality Scorecard & Bake-Off System. It provides a modern, responsive dashboard for vendor monitoring, quality analysis, and contract negotiation support.

## Features

- **Interactive Dashboard**: Real-time vendor quality metrics and alerts
- **Side-by-side Comparison**: Multi-vendor analysis with advanced filtering
- **Geographic Coverage Heatmap**: Visual jurisdiction coverage analysis
- **SLA Monitoring**: Real-time alerts and threshold management
- **What-If Analysis**: Contract negotiation and ROI calculations
- **Schema Change Tracking**: Data lineage and impact assessment
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Tech Stack

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.8.0
- **Styling**: Tailwind CSS 3.3.0
- **Charts**: Recharts 2.8.0
- **HTTP Client**: Axios 1.6.0
- **Date Handling**: date-fns 2.30.0
- **Icons**: Lucide React 0.294.0

## Quick Start

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build files will be in the `build/` directory.

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

### API Configuration

The frontend connects to the backend API configured in `src/utils/api.js`. Update the base URL for different environments:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

## Component Structure

### Core Components

- **VendorScorecard**: Individual vendor quality display
- **ComparisonTable**: Side-by-side vendor comparison
- **CoverageHeatmap**: Geographic coverage visualization
- **AlertDashboard**: SLA monitoring and alerts
- **WhatIfAnalyzer**: Contract negotiation tool
- **SchemaChangeLog**: Vendor change tracking

### Pages

- **Dashboard**: Main overview with summary metrics
- **VendorDetail**: Detailed vendor analysis

### Utilities

- **api.js**: HTTP client and API endpoints
- **calculations.js**: Client-side calculations and formatting

## Features Overview

### Dashboard

- **Summary Cards**: Key metrics across all vendors
- **Top Vendors**: Best performing vendors
- **Recent Alerts**: Latest SLA breaches
- **Navigation Tabs**: Overview, Comparison, Coverage, Alerts, Analysis

### Vendor Comparison

- **Sortable Table**: Multi-column sorting
- **Advanced Filtering**: Quality, cost, coverage, jurisdiction filters
- **Export Functionality**: CSV export for analysis
- **Real-time Updates**: Live data refresh

### Coverage Heatmap

- **Color-coded Visualization**: Coverage percentage by jurisdiction
- **Summary Statistics**: Average coverage and jurisdiction counts
- **Interactive Tooltips**: Detailed coverage information
- **Vendor Comparison**: Side-by-side coverage analysis

### SLA Monitoring

- **Real-time Alerts**: Threshold breach notifications
- **Alert Management**: Acknowledge and resolve alerts
- **Summary Statistics**: Alert trends and resolution rates
- **Vendor-specific Views**: Filtered alert views

### What-If Analysis

- **Vendor Switching**: Compare current vs. new vendors
- **Financial Impact**: Cost savings and ROI calculations
- **Quality Impact**: Score changes and trade-offs
- **Risk Assessment**: Potential risks and recommendations

### Schema Change Tracking

- **Change History**: Vendor schema modifications
- **Impact Assessment**: Records affected and quality impact
- **Filtering Options**: Time period and vendor filtering
- **Detailed Analysis**: Change impact on data quality

## Styling

### Tailwind CSS Configuration

The application uses Tailwind CSS with custom configuration in `tailwind.config.js`:

- **Custom Colors**: Primary, success, warning, danger color palettes
- **Responsive Design**: Mobile-first approach
- **Component Classes**: Reusable utility classes

### CSS Classes

Common utility classes defined in `src/index.css`:

- **.card**: Standard card component
- **.btn**: Button variants (primary, secondary, success, warning, danger)
- **.metric-card**: Dashboard metric display
- **.status-badge**: Status indicator badges
- **.table**: Styled table components

## State Management

The application uses React's built-in state management:

- **Local State**: Component-level state with useState
- **Effects**: Data fetching with useEffect
- **Context**: Not required for current scope
- **External State**: API calls serve as single source of truth

## Data Flow

1. **API Calls**: Components fetch data from backend
2. **State Updates**: Local state updated with API responses
3. **Rendering**: Components re-render with new data
4. **User Interactions**: Events trigger API calls or state changes

## Error Handling

- **API Errors**: Centralized error handling in api.js
- **Loading States**: Loading indicators for async operations
- **Error Boundaries**: React error boundaries for crash recovery
- **User Feedback**: Error messages and retry options

## Performance Optimization

- **Code Splitting**: Lazy loading for large components
- **Memoization**: React.memo for expensive renders
- **Debouncing**: Search input debouncing
- **Pagination**: Large datasets paginated

## Accessibility

- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant color schemes

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

- **Component Tests**: React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Cypress for critical user flows

## Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

## Deployment

### Production Build

```bash
npm run build
```

### Environment Setup

For production deployment:

1. Set production environment variables
2. Build optimized bundle
3. Deploy to static hosting (Vercel, Netlify, etc.)
4. Configure API endpoints
5. Set up SSL/TLS

### Docker Deployment

```bash
# Build image
docker build -t vendor-quality-frontend .

# Run container
docker run -p 3000:3000 vendor-quality-frontend
```

## Development Guidelines

### Code Style

- **ESLint**: Configured with React app rules
- **Prettier**: Code formatting
- **File Naming**: PascalCase for components, camelCase for utilities
- **Import Organization**: Grouped imports (React, third-party, local)

### Component Guidelines

- **Functional Components**: Use hooks over class components
- **Props Validation**: PropTypes or TypeScript for type checking
- **Component Composition**: Small, reusable components
- **State Management**: Local state for component-specific data

### API Integration

- **Error Handling**: Consistent error handling across components
- **Loading States**: Show loading indicators during API calls
- **Data Validation**: Validate API responses
- **Caching**: Cache frequently accessed data

## Troubleshooting

### Common Issues

1. **API Connection**: Check backend server and CORS settings
2. **Build Errors**: Verify Node.js version and clear npm cache
3. **Styling Issues**: Ensure Tailwind CSS is properly configured
4. **Performance**: Check for unnecessary re-renders and large bundle sizes

### Debug Tools

- **React DevTools**: Component inspection and debugging
- **Network Tab**: API request monitoring
- **Console**: Error logging and debugging
- **Redux DevTools**: If Redux is implemented

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test on multiple browsers

## License

This project is proprietary and confidential.
