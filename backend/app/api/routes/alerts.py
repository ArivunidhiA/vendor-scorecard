from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services import AlertService
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock data for alerts
def get_mock_alerts():
    """Return mock alert data when database is unavailable"""
    return [
        {
            "id": 1,
            "vendor_id": 1,
            "vendor_name": "Checkr Inc",
            "alert_type": "quality_threshold",
            "severity": "warning",
            "status": "active",
            "title": "Quality Score Below Threshold",
            "description": "Vendor quality score has dropped below the minimum threshold of 85",
            "current_value": 82.3,
            "threshold_value": 85.0,
            "variance_percentage": -3.2,
            "triggered_at": "2024-01-20T14:30:00Z",
            "acknowledged_at": None,
            "resolved_at": None
        },
        {
            "id": 2,
            "vendor_id": 3,
            "vendor_name": "GoodHire",
            "alert_type": "turnaround_time",
            "severity": "critical",
            "status": "acknowledged",
            "title": "Turnaround Time Exceeded",
            "description": "Average turnaround time has exceeded 72-hour SLA",
            "current_value": 78.5,
            "threshold_value": 72.0,
            "variance_percentage": 9.0,
            "triggered_at": "2024-01-19T09:15:00Z",
            "acknowledged_at": "2024-01-19T11:30:00Z",
            "resolved_at": None
        },
        {
            "id": 3,
            "vendor_id": 2,
            "vendor_name": "Sterling Talent Solutions",
            "alert_type": "coverage_gaps",
            "severity": "info",
            "status": "resolved",
            "title": "Coverage Gap Detected",
            "description": "Coverage gap identified in Miami-Dade County",
            "current_value": 65.0,
            "threshold_value": 80.0,
            "variance_percentage": -18.8,
            "triggered_at": "2024-01-18T16:45:00Z",
            "acknowledged_at": "2024-01-18T17:20:00Z",
            "resolved_at": "2024-01-19T10:00:00Z"
        },
        {
            "id": 4,
            "vendor_id": 5,
            "vendor_name": "HireRight",
            "alert_type": "cost_increase",
            "severity": "warning",
            "status": "active",
            "title": "Cost Per Record Increase",
            "description": "Cost per record has increased by more than 10% in the last month",
            "current_value": 12.35,
            "threshold_value": 11.20,
            "variance_percentage": 10.3,
            "triggered_at": "2024-01-21T08:00:00Z",
            "acknowledged_at": None,
            "resolved_at": None
        },
        {
            "id": 5,
            "vendor_id": 6,
            "vendor_name": "IntelliCorp",
            "alert_type": "pii_completeness",
            "severity": "critical",
            "status": "active",
            "title": "PII Completeness Below Minimum",
            "description": "PII completeness rate has fallen below 90% threshold",
            "current_value": 87.2,
            "threshold_value": 90.0,
            "variance_percentage": -3.1,
            "triggered_at": "2024-01-22T13:45:00Z",
            "acknowledged_at": None,
            "resolved_at": None
        },
        {
            "id": 6,
            "vendor_id": 4,
            "vendor_name": "Accurate Background",
            "alert_type": "disposition_accuracy",
            "severity": "warning",
            "status": "acknowledged",
            "title": "Disposition Accuracy Decline",
            "description": "Disposition accuracy has decreased by 5% this week",
            "current_value": 92.1,
            "threshold_value": 95.0,
            "variance_percentage": -3.0,
            "triggered_at": "2024-01-20T10:30:00Z",
            "acknowledged_at": "2024-01-20T14:15:00Z",
            "resolved_at": None
        },
        {
            "id": 7,
            "vendor_id": 8,
            "vendor_name": "Certn",
            "alert_type": "api_uptime",
            "severity": "critical",
            "status": "resolved",
            "title": "API Downtime Detected",
            "description": "API uptime fell below 99.5% threshold",
            "current_value": 98.7,
            "threshold_value": 99.5,
            "variance_percentage": -0.8,
            "triggered_at": "2024-01-17T22:00:00Z",
            "acknowledged_at": "2024-01-17T23:30:00Z",
            "resolved_at": "2024-01-18T02:00:00Z"
        },
        {
            "id": 8,
            "vendor_id": 7,
            "vendor_name": "Backgrounds Online",
            "alert_type": "volume_spike",
            "severity": "info",
            "status": "active",
            "title": "Unusual Volume Spike",
            "description": "Processing volume increased by 200% compared to weekly average",
            "current_value": 1500,
            "threshold_value": 1000,
            "variance_percentage": 200.0,
            "triggered_at": "2024-01-23T09:20:00Z",
            "acknowledged_at": None,
            "resolved_at": None
        },
        {
            "id": 9,
            "vendor_id": 1,
            "vendor_name": "Checkr Inc",
            "alert_type": "data_freshness",
            "severity": "warning",
            "status": "acknowledged",
            "title": "Data Freshness Degradation",
            "description": "Average data age has increased beyond acceptable limits",
            "current_value": 4.2,
            "threshold_value": 3.0,
            "variance_percentage": 40.0,
            "triggered_at": "2024-01-21T16:00:00Z",
            "acknowledged_at": "2024-01-21T18:30:00Z",
            "resolved_at": None
        },
        {
            "id": 10,
            "vendor_id": 2,
            "vendor_name": "Sterling Talent Solutions",
            "alert_type": "compliance_issue",
            "severity": "critical",
            "status": "active",
            "title": "Compliance Certification Expiring",
            "description": "FCRA compliance certification expires in 30 days",
            "current_value": 30,
            "threshold_value": 45,
            "variance_percentage": -33.3,
            "triggered_at": "2024-01-22T11:00:00Z",
            "acknowledged_at": None,
            "resolved_at": None
        }
    ]

class AlertConfigurationRequest(BaseModel):
    vendor_id: int
    configurations: List[dict]

class AlertResponse(BaseModel):
    id: int
    vendor_id: int
    vendor_name: str
    alert_type: str
    severity: str
    status: str
    title: str
    description: str
    current_value: float
    threshold_value: float
    variance_percentage: float
    triggered_at: str
    acknowledged_at: Optional[str] = None
    resolved_at: Optional[str] = None

@router.get("/", response_model=List[AlertResponse])
async def get_alerts(
    limit: int = Query(50, ge=1, le=1000),
    vendor_id: Optional[int] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get recent alerts with optional filtering"""
    try:
        alerts = AlertService.get_recent_alerts(db, limit, vendor_id)
        
        # Apply additional filters
        if severity:
            alerts = [a for a in alerts if a["severity"] == severity]
        
        if status:
            alerts = [a for a in alerts if a["status"] == status]
        
        return [AlertResponse(**alert) for alert in alerts]
    except Exception as e:
        logger.warning(f"Database error in get_alerts: {e}. Using mock data.")
        mock_alerts = get_mock_alerts()
        
        # Apply filters to mock data
        if vendor_id:
            mock_alerts = [a for a in mock_alerts if a["vendor_id"] == vendor_id]
        if severity:
            mock_alerts = [a for a in mock_alerts if a["severity"] == severity]
        if status:
            mock_alerts = [a for a in mock_alerts if a["status"] == status]
        
        # Apply limit
        mock_alerts = mock_alerts[:limit]
        
        return [AlertResponse(**alert) for alert in mock_alerts]

@router.get("/summary")
async def get_alert_summary(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get alert summary statistics"""
    
    summary = AlertService.get_alert_summary(db, days)
    
    return summary

@router.get("/vendor/{vendor_id}")
async def get_vendor_alerts(
    vendor_id: int,
    limit: int = Query(50, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get alerts for a specific vendor"""
    
    alerts = AlertService.get_recent_alerts(db, limit, vendor_id)
    
    return {
        "vendor_id": vendor_id,
        "alerts": alerts
    }

@router.get("/vendor/{vendor_id}/sla-check")
async def check_vendor_sla(vendor_id: int, db: Session = Depends(get_db)):
    """Check SLA compliance for a vendor"""
    
    sla_alerts = AlertService.check_sla_compliance(db, vendor_id)
    
    return {
        "vendor_id": vendor_id,
        "sla_compliance": len(sla_alerts) == 0,
        "alerts": sla_alerts
    }

@router.post("/configure")
async def configure_alert_thresholds(
    request: AlertConfigurationRequest,
    db: Session = Depends(get_db)
):
    """Configure alert thresholds for a vendor"""
    
    success = AlertService.configure_alert_thresholds(
        db,
        request.vendor_id,
        request.configurations
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to configure alert thresholds")
    
    return {"message": "Alert thresholds configured successfully"}

@router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Acknowledge an alert"""
    
    success = AlertService.acknowledge_alert(db, alert_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert acknowledged successfully"}

@router.post("/{alert_id}/resolve")
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Resolve an alert"""
    
    success = AlertService.resolve_alert(db, alert_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert resolved successfully"}

@router.get("/configurations/{vendor_id}")
async def get_alert_configurations(vendor_id: int, db: Session = Depends(get_db)):
    """Get alert configurations for a vendor"""
    from app.models import AlertConfiguration, AlertType
    
    configs = db.query(AlertConfiguration).filter(
        AlertConfiguration.vendor_id == vendor_id
    ).all()
    
    return [
        {
            "id": config.id,
            "vendor_id": config.vendor_id,
            "alert_type": config.alert_type.value,
            "threshold_value": config.threshold_value,
            "is_active": config.is_active,
            "created_at": config.created_at.isoformat(),
            "updated_at": config.updated_at.isoformat() if config.updated_at else None
        }
        for config in configs
    ]

@router.get("/types")
async def get_alert_types():
    """Get available alert types"""
    
    from app.models import AlertType, AlertSeverity, AlertStatus
    
    return {
        "alert_types": [t.value for t in AlertType],
        "severity_levels": [s.value for s in AlertSeverity],
        "status_options": [s.value for s in AlertStatus]
    }
