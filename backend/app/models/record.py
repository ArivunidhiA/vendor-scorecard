from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.db import Base
import enum

class DispositionType(enum.Enum):
    FELONY = "felony"
    MISDEMEANOR = "misdemeanor"
    DISMISSED = "dismissed"
    PENDING = "pending"

class PIIStatus(enum.Enum):
    COMPLETE = "complete"
    INCOMPLETE = "incomplete"
    MISSING = "missing"

class CriminalRecord(Base):
    __tablename__ = "criminal_records"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    jurisdiction_id = Column(Integer, ForeignKey("jurisdictions.id"))
    
    # Record identifiers
    case_number = Column(String, index=True)
    defendant_name = Column(String)
    date_of_birth = Column(DateTime)
    ssn = Column(String)  # Encrypted in production
    
    # Case details
    disposition_type = Column(Enum(DispositionType))
    disposition_date = Column(DateTime)
    filing_date = Column(DateTime)
    court_filing_date = Column(DateTime)
    
    # Quality metrics
    pii_status = Column(Enum(PIIStatus))
    has_dob = Column(Boolean)
    has_ssn = Column(Boolean)
    has_full_name = Column(Boolean)
    disposition_verified = Column(Boolean)
    
    # Timing metrics
    vendor_delivery_date = Column(DateTime)
    turnaround_hours = Column(Float)
    freshness_days = Column(Float)  # days from court filing to vendor delivery
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="records")
    jurisdiction = relationship("Jurisdiction")

class SchemaChange(Base):
    __tablename__ = "schema_changes"
    
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    change_description = Column(Text)
    field_affected = Column(String)
    old_value = Column(String)
    new_value = Column(String)
    records_affected = Column(Integer)
    change_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="schema_changes")
