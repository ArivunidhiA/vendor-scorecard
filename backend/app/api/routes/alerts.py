from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services import AlertService
from pydantic import BaseModel

router = APIRouter()

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
    
    alerts = AlertService.get_recent_alerts(limit, vendor_id)
    
    # Apply additional filters
    if severity:
        alerts = [a for a in alerts if a["severity"] == severity]
    
    if status:
        alerts = [a for a in alerts if a["status"] == status]
    
    return [AlertResponse(**alert) for alert in alerts]

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
    
    alerts = AlertService.get_recent_alerts(limit, vendor_id)
    
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
