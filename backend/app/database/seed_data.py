import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.db import SessionLocal, engine, Base
from app.models import *

def create_sample_data():
    # Create tables first
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create jurisdictions
        jurisdictions = [
            Jurisdiction(name="Cook County", state="IL", county="Cook"),
            Jurisdiction(name="Los Angeles County", state="CA", county="Los Angeles"),
            Jurisdiction(name="New York City", state="NY", county="New York"),
            Jurisdiction(name="Miami-Dade County", state="FL", county="Miami-Dade"),
            Jurisdiction(name="Harris County", state="TX", county="Harris"),
            Jurisdiction(name="Maricopa County", state="AZ", county="Maricopa"),
            Jurisdiction(name="King County", state="WA", county="King"),
            Jurisdiction(name="Orange County", state="CA", county="Orange"),
        ]
        
        for jurisdiction in jurisdictions:
            db.add(jurisdiction)
        db.commit()
        
        # Create vendors with different quality profiles
        vendors = [
            Vendor(
                name="VendorA",
                description="Premium provider with highest quality and coverage",
                cost_per_record=12.00,
                quality_score=95.0,
                coverage_percentage=98.0
            ),
            Vendor(
                name="VendorB", 
                description="Balanced provider with good quality and reasonable cost",
                cost_per_record=8.00,
                quality_score=88.0,
                coverage_percentage=92.0
            ),
            Vendor(
                name="VendorC",
                description="Budget provider with lower cost but reduced quality",
                cost_per_record=5.00,
                quality_score=78.0,
                coverage_percentage=85.0
            ),
            Vendor(
                name="VendorD",
                description="California specialist with excellent regional coverage",
                cost_per_record=10.00,
                quality_score=92.0,
                coverage_percentage=75.0
            )
        ]
        
        for vendor in vendors:
            db.add(vendor)
        db.commit()
        
        # Get created vendors and jurisdictions
        created_vendors = db.query(Vendor).all()
        created_jurisdictions = db.query(Jurisdiction).all()
        
        # Create vendor coverage with realistic variations
        coverage_data = {
            "VendorA": [98, 97, 99, 96, 98, 97, 99, 98],
            "VendorB": [92, 90, 94, 88, 91, 89, 93, 90],
            "VendorC": [85, 82, 87, 80, 83, 81, 86, 84],
            "VendorD": [0, 98, 0, 0, 0, 0, 0, 95]  # CA specialist
        }
        
        for vendor in created_vendors:
            coverage_values = coverage_data[vendor.name]
            for i, jurisdiction in enumerate(created_jurisdictions):
                coverage = VendorCoverage(
                    vendor_id=vendor.id,
                    jurisdiction_id=jurisdiction.id,
                    coverage_percentage=coverage_values[i],
                    avg_turnaround_hours=random.uniform(24, 72)
                )
                db.add(coverage)
        
        db.commit()
        
        # Generate sample criminal records - REDUCED for fast startup
        first_names = ["John", "Jane", "Michael", "Sarah", "Robert", "Emily", "David", "Jessica", "James", "Ashley"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
        
        dispositions = list(DispositionType)
        pii_statuses = list(PIIStatus)
        
        # Use bulk insert for better performance - 500 records instead of 10000
        records_to_insert = []
        for i in range(500):  # Reduced from 10000 to 500
            vendor = created_vendors[i % len(created_vendors)]
            jurisdiction = created_jurisdictions[i % len(created_jurisdictions)]
            
            # Generate realistic quality variations by vendor
            has_dob = random.random() < (0.95 if vendor.name == "VendorA" else 0.85 if vendor.name == "VendorB" else 0.75 if vendor.name == "VendorC" else 0.90)
            has_ssn = random.random() < (0.94 if vendor.name == "VendorA" else 0.84 if vendor.name == "VendorB" else 0.74 if vendor.name == "VendorC" else 0.89)
            has_full_name = random.random() < 0.98
            
            # Determine PII status
            if has_dob and has_ssn and has_full_name:
                pii_status = PIIStatus.COMPLETE
            elif has_dob or has_ssn:
                pii_status = PIIStatus.INCOMPLETE
            else:
                pii_status = PIIStatus.MISSING
            
            # Generate dates
            filing_date = datetime.now() - timedelta(days=random.randint(1, 365))
            court_filing_date = filing_date + timedelta(days=random.randint(0, 30))
            disposition_date = court_filing_date + timedelta(days=random.randint(30, 180))
            vendor_delivery_date = court_filing_date + timedelta(hours=random.randint(12, 96))
            turnaround_hours = (vendor_delivery_date - court_filing_date).total_seconds() / 3600
            freshness_days = (vendor_delivery_date - court_filing_date).days
            
            records_to_insert.append({
                'vendor_id': vendor.id,
                'jurisdiction_id': jurisdiction.id,
                'case_number': f"CASE-{random.randint(100000, 999999)}",
                'defendant_name': f"{random.choice(first_names)} {random.choice(last_names)}",
                'date_of_birth': (datetime.now() - timedelta(days=random.randint(6570, 29200))) if has_dob else None,
                'ssn': (f"{random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(1000, 9999)}") if has_ssn else None,
                'disposition_type': random.choice(dispositions),
                'disposition_date': disposition_date,
                'filing_date': filing_date,
                'court_filing_date': court_filing_date,
                'pii_status': pii_status,
                'has_dob': has_dob,
                'has_ssn': has_ssn,
                'has_full_name': has_full_name,
                'disposition_verified': random.random() < (0.96 if vendor.name == "VendorA" else 0.90 if vendor.name == "VendorB" else 0.80 if vendor.name == "VendorC" else 0.93),
                'vendor_delivery_date': vendor_delivery_date,
                'turnaround_hours': turnaround_hours,
                'freshness_days': freshness_days
            })
        
        # Bulk insert for much better performance
        from sqlalchemy import insert
        db.execute(insert(CriminalRecord), records_to_insert)
        db.commit()
        
        # Create vendor metrics based on actual data
        for vendor in created_vendors:
            records = db.query(CriminalRecord).filter(CriminalRecord.vendor_id == vendor.id).all()
            
            if records:
                pii_completeness = sum(1 for r in records if r.pii_status == PIIStatus.COMPLETE) / len(records) * 100
                disposition_accuracy = sum(1 for r in records if r.disposition_verified) / len(records) * 100
                avg_freshness_days = sum(r.freshness_days for r in records) / len(records)
                geographic_coverage = vendor.coverage_percentage
                
                # Calculate quality score
                quality_score = (
                    (pii_completeness * 0.4) +
                    (disposition_accuracy * 0.3) +
                    ((100 - min(avg_freshness_days, 100)) * 0.2) +
                    (geographic_coverage * 0.1)
                )
                
                metrics = VendorMetrics(
                    vendor_id=vendor.id,
                    pii_completeness=pii_completeness,
                    disposition_accuracy=disposition_accuracy,
                    avg_freshness_days=avg_freshness_days,
                    geographic_coverage=geographic_coverage,
                    calculated_score=quality_score
                )
                db.add(metrics)
                
                # Update vendor quality score
                vendor.quality_score = quality_score
        
        db.commit()
        
        # Create sample alerts
        alert_configs = [
            (AlertType.PII_COMPLETENESS, 90.0, AlertSeverity.HIGH),
            (AlertType.DISPOSITION_ACCURACY, 95.0, AlertSeverity.HIGH),
            (AlertType.TURNAROUND_TIME, 72.0, AlertSeverity.MEDIUM),
        ]
        
        for vendor in created_vendors:
            for alert_type, threshold, severity in alert_configs:
                config = AlertConfiguration(
                    vendor_id=vendor.id,
                    alert_type=alert_type,
                    threshold_value=threshold
                )
                db.add(config)
                
                # Create some sample alerts for VendorC (budget provider)
                if vendor.name == "VendorC" and random.random() < 0.7:
                    alert = Alert(
                        vendor_id=vendor.id,
                        alert_type=alert_type,
                        severity=severity,
                        title=f"{alert_type.value.replace('_', ' ').title()} Alert",
                        description=f"Vendor {vendor.name} has fallen below threshold for {alert_type.value}",
                        current_value=threshold - random.uniform(5, 15),
                        threshold_value=threshold,
                        variance_percentage=random.uniform(5, 15)
                    )
                    db.add(alert)
        
        db.commit()
        
        # Create sample schema changes
        schema_changes = [
            ("VendorC", "Updated misdemeanor classification logic", "disposition_type", "old_misdemeanor", "new_misdemeanor", 150),
            ("VendorB", "Enhanced PII data collection", "pii_fields", "name_only", "name_dob_ssn", 75),
            ("VendorA", "Improved court filing date parsing", "filing_date", "mm/dd/yyyy", "iso_format", 200),
        ]
        
        for vendor_name, description, field, old_val, new_val, affected in schema_changes:
            vendor = next(v for v in created_vendors if v.name == vendor_name)
            change = SchemaChange(
                vendor_id=vendor.id,
                change_description=description,
                field_affected=field,
                old_value=old_val,
                new_value=new_val,
                records_affected=affected,
                change_date=datetime.now() - timedelta(days=random.randint(1, 30))
            )
            db.add(change)
        
        db.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
