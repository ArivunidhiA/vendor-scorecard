from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models import *
from app.services.scoring_engine import ScoringEngine

class AlertService:
    """Production-level alert monitoring and SLA breach detection"""
    
    @staticmethod
    def check_sla_compliance(db: Session, vendor_id: int) -> List[Dict]:
        """Check if vendor is meeting SLA thresholds"""
        
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            return []
        
        alerts = []
        
        # Get current metrics
        metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor_id)
        
        # Get alert configurations for this vendor
        configs = db.query(AlertConfiguration).filter(
            and_(
                AlertConfiguration.vendor_id == vendor_id,
                AlertConfiguration.is_active == True
            )
        ).all()
        
        for config in configs:
            current_value = 0.0
            threshold_value = config.threshold_value
            
            # Get current value based on alert type
            if config.alert_type == AlertType.PII_COMPLETENESS:
                current_value = metrics["pii_completeness"]
                if current_value < threshold_value:
                    alerts.append({
                        "type": config.alert_type.value,
                        "severity": AlertSeverity.HIGH.value,
                        "title": "PII Completeness Below Threshold",
                        "description": f"PII completeness ({current_value:.1f}%) is below threshold ({threshold_value}%)",
                        "current_value": current_value,
                        "threshold_value": threshold_value,
                        "variance": threshold_value - current_value
                    })
            
            elif config.alert_type == AlertType.DISPOSITION_ACCURACY:
                current_value = metrics["disposition_accuracy"]
                if current_value < threshold_value:
                    alerts.append({
                        "type": config.alert_type.value,
                        "severity": AlertSeverity.HIGH.value,
                        "title": "Disposition Accuracy Below Threshold",
                        "description": f"Disposition accuracy ({current_value:.1f}%) is below threshold ({threshold_value}%)",
                        "current_value": current_value,
                        "threshold_value": threshold_value,
                        "variance": threshold_value - current_value
                    })
            
            elif config.alert_type == AlertType.TURNAROUND_TIME:
                # Get average turnaround for recent records
                recent_records = db.query(CriminalRecord).filter(
                    and_(
                        CriminalRecord.vendor_id == vendor_id,
                        CriminalRecord.vendor_delivery_date >= datetime.now() - timedelta(days=7)
                    )
                ).all()
                
                if recent_records:
                    avg_turnaround = sum(r.turnaround_hours for r in recent_records) / len(recent_records)
                    if avg_turnaround > threshold_value:
                        alerts.append({
                            "type": config.alert_type.value,
                            "severity": AlertSeverity.MEDIUM.value,
                            "title": "Turnaround Time Above Threshold",
                            "description": f"Average turnaround ({avg_turnaround:.1f} hours) exceeds threshold ({threshold_value} hours)",
                            "current_value": avg_turnaround,
                            "threshold_value": threshold_value,
                            "variance": avg_turnaround - threshold_value
                        })
            
            elif config.alert_type == AlertType.COVERAGE_DROP:
                current_value = vendor.coverage_percentage
                if current_value < threshold_value:
                    alerts.append({
                        "type": config.alert_type.value,
                        "severity": AlertSeverity.MEDIUM.value,
                        "title": "Coverage Drop Detected",
                        "description": f"Coverage ({current_value:.1f}%) is below threshold ({threshold_value}%)",
                        "current_value": current_value,
                        "threshold_value": threshold_value,
                        "variance": threshold_value - current_value
                    })
            
            elif config.alert_type == AlertType.QUALITY_DROP:
                current_value = vendor.quality_score
                if current_value < threshold_value:
                    alerts.append({
                        "type": config.alert_type.value,
                        "severity": AlertSeverity.HIGH.value,
                        "title": "Quality Score Drop Detected",
                        "description": f"Quality score ({current_value:.1f}) is below threshold ({threshold_value})",
                        "current_value": current_value,
                        "threshold_value": threshold_value,
                        "variance": threshold_value - current_value
                    })
        
        return alerts
    
    @staticmethod
    def create_alert(db: Session, vendor_id: int, alert_data: Dict) -> Alert:
        """Create a new alert"""
        
        alert = Alert(
            vendor_id=vendor_id,
            alert_type=AlertType(alert_data["type"]),
            severity=AlertSeverity(alert_data["severity"]),
            title=alert_data["title"],
            description=alert_data["description"],
            current_value=alert_data["current_value"],
            threshold_value=alert_data["threshold_value"],
            variance_percentage=alert_data.get("variance", 0.0)
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        return alert
    
    @staticmethod
    def get_recent_alerts(db: Session, limit: int = 50, vendor_id: int = None) -> List[Dict]:
        """Get recent alerts with optional vendor filter"""
        
        query = db.query(Alert).join(Vendor)
        
        if vendor_id:
            query = query.filter(Alert.vendor_id == vendor_id)
        
        alerts = query.order_by(desc(Alert.triggered_at)).limit(limit).all()
        
        return [
            {
                "id": alert.id,
                "vendor_id": alert.vendor_id,
                "vendor_name": alert.vendor.name,
                "alert_type": alert.alert_type.value,
                "severity": alert.severity.value,
                "status": alert.status.value,
                "title": alert.title,
                "description": alert.description,
                "current_value": alert.current_value,
                "threshold_value": alert.threshold_value,
                "variance_percentage": alert.variance_percentage,
                "triggered_at": alert.triggered_at.isoformat(),
                "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
                "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
            }
            for alert in alerts
        ]
    
    @staticmethod
    def acknowledge_alert(db: Session, alert_id: int) -> bool:
        """Acknowledge an alert"""
        
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return False
        
        alert.status = AlertStatus.ACKNOWLEDGED
        alert.acknowledged_at = datetime.now()
        
        db.commit()
        return True
    
    @staticmethod
    def resolve_alert(db: Session, alert_id: int) -> bool:
        """Resolve an alert"""
        
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return False
        
        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = datetime.now()
        
        db.commit()
        return True
    
    @staticmethod
    def configure_alert_thresholds(db: Session, vendor_id: int, configurations: List[Dict]) -> bool:
        """Configure alert thresholds for a vendor"""
        
        try:
            # Remove existing configurations
            db.query(AlertConfiguration).filter(
                AlertConfiguration.vendor_id == vendor_id
            ).delete()
            
            # Add new configurations
            for config in configurations:
                alert_config = AlertConfiguration(
                    vendor_id=vendor_id,
                    alert_type=AlertType(config["alert_type"]),
                    threshold_value=config["threshold_value"],
                    is_active=config.get("is_active", True)
                )
                db.add(alert_config)
            
            db.commit()
            return True
            
        except Exception:
            db.rollback()
            return False
    
    @staticmethod
    def get_alert_summary(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get alert summary statistics"""
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Total alerts by severity
        severity_counts = db.query(
            Alert.severity,
            func.count(Alert.id).label('count')
        ).filter(
            Alert.triggered_at >= cutoff_date
        ).group_by(Alert.severity).all()
        
        # Total alerts by type
        type_counts = db.query(
            Alert.alert_type,
            func.count(Alert.id).label('count')
        ).filter(
            Alert.triggered_at >= cutoff_date
        ).group_by(Alert.alert_type).all()
        
        # Alerts by vendor
        vendor_alerts = db.query(
            Vendor.name,
            func.count(Alert.id).label('alert_count')
        ).join(Alert).filter(
            Alert.triggered_at >= cutoff_date
        ).group_by(Vendor.id, Vendor.name).order_by(
            desc('alert_count')
        ).all()
        
        # Resolution metrics
        resolved_alerts = db.query(Alert).filter(
            and_(
                Alert.triggered_at >= cutoff_date,
                Alert.status == AlertStatus.RESOLVED
            )
        ).count()
        
        total_alerts = db.query(Alert).filter(
            Alert.triggered_at >= cutoff_date
        ).count()
        
        return {
            "period_days": days,
            "total_alerts": total_alerts,
            "resolved_alerts": resolved_alerts,
            "resolution_rate": (resolved_alerts / total_alerts * 100) if total_alerts > 0 else 0,
            "by_severity": {
                severity.value: count for severity, count in severity_counts
            },
            "by_type": {
                alert_type.value: count for alert_type, count in type_counts
            },
            "by_vendor": [
                {
                    "vendor_name": vendor_name,
                    "alert_count": alert_count
                }
                for vendor_name, alert_count in vendor_alerts
            ]
        }
