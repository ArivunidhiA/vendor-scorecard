from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.db import Base
import enum

class AlertType(enum.Enum):
    PII_COMPLETENESS = "pii_completeness"
    DISPOSITION_ACCURACY = "disposition_accuracy"
    TURNAROUND_TIME = "turnaround_time"
    COVERAGE_DROP = "coverage_drop"
    QUALITY_DROP = "quality_drop"

class AlertSeverity(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertStatus(enum.Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    alert_type = Column(Enum(AlertType))
    severity = Column(Enum(AlertSeverity))
    status = Column(Enum(AlertStatus), default=AlertStatus.ACTIVE)
    
    # Alert details
    title = Column(String)
    description = Column(Text)
    current_value = Column(Float)
    threshold_value = Column(Float)
    variance_percentage = Column(Float)
    
    # Timestamps
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    vendor = relationship("Vendor", back_populates="alerts")

class AlertConfiguration(Base):
    __tablename__ = "alert_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    alert_type = Column(Enum(AlertType))
    threshold_value = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vendor = relationship("Vendor")
