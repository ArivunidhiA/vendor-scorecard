from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.db import Base

class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    cost_per_record = Column(Float)
    quality_score = Column(Float)
    coverage_percentage = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    metrics = relationship("VendorMetrics", back_populates="vendor")
    records = relationship("CriminalRecord", back_populates="vendor")
    alerts = relationship("Alert", back_populates="vendor")
    schema_changes = relationship("SchemaChange", back_populates="vendor")

class VendorMetrics(Base):
    __tablename__ = "vendor_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    pii_completeness = Column(Float)  # % records with DOB, SSN, full name
    disposition_accuracy = Column(Float)  # correct felony/misdemeanor classification
    avg_freshness_days = Column(Float)  # avg days from court filing to delivery
    geographic_coverage = Column(Float)  # % of target jurisdictions covered
    calculated_score = Column(Float)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="metrics")

class Jurisdiction(Base):
    __tablename__ = "jurisdictions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    state = Column(String)
    county = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    coverage = relationship("VendorCoverage", back_populates="jurisdiction")

class VendorCoverage(Base):
    __tablename__ = "vendor_coverage"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    jurisdiction_id = Column(Integer, ForeignKey("jurisdictions.id"))
    coverage_percentage = Column(Float)
    avg_turnaround_hours = Column(Float)
    
    # Relationships
    vendor = relationship("Vendor")
    jurisdiction = relationship("Jurisdiction", back_populates="coverage")
