from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models import *
from app.database import get_db

class ScoringEngine:
    """Production-level quality scoring engine for criminal records vendors"""
    
    @staticmethod
    def calculate_vendor_quality_score(db: Session, vendor_id: int) -> Dict[str, Any]:
        """
        Calculate comprehensive quality score for a vendor
        
        Formula:
        Quality Score = (PII_Completeness * 0.4) + 
                       (Disposition_Accuracy * 0.3) + 
                       ((100 - Avg_Freshness_Days) * 0.2) + 
                       (Coverage_Pct * 0.1)
        """
        
        # Get vendor's records
        records = db.query(CriminalRecord).filter(CriminalRecord.vendor_id == vendor_id).all()
        
        if not records:
            return {
                "quality_score": 0.0,
                "pii_completeness": 0.0,
                "disposition_accuracy": 0.0,
                "avg_freshness_days": 0.0,
                "geographic_coverage": 0.0,
                "total_records": 0
            }
        
        # Calculate PII Completeness (40% weight)
        complete_records = sum(1 for r in records if r.pii_status == PIIStatus.COMPLETE)
        pii_completeness = (complete_records / len(records)) * 100
        
        # Calculate Disposition Accuracy (30% weight)
        verified_records = sum(1 for r in records if r.disposition_verified)
        disposition_accuracy = (verified_records / len(records)) * 100
        
        # Calculate Data Freshness (20% weight)
        avg_freshness_days = sum(r.freshness_days for r in records) / len(records)
        freshness_score = max(0, 100 - avg_freshness_days)  # Inverse scoring
        
        # Calculate Geographic Coverage (10% weight)
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        geographic_coverage = vendor.coverage_percentage if vendor else 0.0
        
        # Calculate final quality score
        quality_score = (
            (pii_completeness * 0.4) +
            (disposition_accuracy * 0.3) +
            (freshness_score * 0.2) +
            (geographic_coverage * 0.1)
        )
        
        return {
            "quality_score": round(quality_score, 2),
            "pii_completeness": round(pii_completeness, 2),
            "disposition_accuracy": round(disposition_accuracy, 2),
            "avg_freshness_days": round(avg_freshness_days, 2),
            "geographic_coverage": round(geographic_coverage, 2),
            "total_records": len(records)
        }
    
    @staticmethod
    def calculate_value_index(quality_score: float, cost_per_record: float) -> float:
        """
        Calculate Value Index = Quality_Score / Cost_Per_Record
        Higher is better (more quality per dollar)
        """
        if cost_per_record <= 0:
            return 0.0
        return round(quality_score / cost_per_record, 2)
    
    @staticmethod
    def get_vendor_metrics_history(db: Session, vendor_id: int, days: int = 30) -> List[Dict]:
        """Get historical metrics for trend analysis"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        metrics = db.query(VendorMetrics).filter(
            and_(
                VendorMetrics.vendor_id == vendor_id,
                VendorMetrics.recorded_at >= cutoff_date
            )
        ).order_by(VendorMetrics.recorded_at.desc()).all()
        
        return [
            {
                "date": metric.recorded_at.isoformat(),
                "quality_score": metric.calculated_score,
                "pii_completeness": metric.pii_completeness,
                "disposition_accuracy": metric.disposition_accuracy,
                "avg_freshness_days": metric.avg_freshness_days,
                "geographic_coverage": metric.geographic_coverage
            }
            for metric in metrics
        ]
    
    @staticmethod
    def get_jurisdiction_performance(db: Session, vendor_id: int) -> List[Dict]:
        """Analyze vendor performance by jurisdiction"""
        
        query = db.query(
            Jurisdiction.name,
            Jurisdiction.state,
            VendorCoverage.coverage_percentage,
            VendorCoverage.avg_turnaround_hours,
            func.count(CriminalRecord.id).label('record_count'),
            func.avg(
                func.case(
                    (CriminalRecord.pii_status == PIIStatus.COMPLETE, 1),
                    else_=0
                )
            ).label('pii_completeness_rate'),
            func.avg(
                func.case(
                    (CriminalRecord.disposition_verified == True, 1),
                    else_=0
                )
            ).label('disposition_accuracy_rate')
        ).join(
            VendorCoverage, Jurisdiction.id == VendorCoverage.jurisdiction_id
        ).join(
            CriminalRecord, and_(
                VendorCoverage.vendor_id == CriminalRecord.vendor_id,
                VendorCoverage.jurisdiction_id == CriminalRecord.jurisdiction_id
            )
        ).filter(
            VendorCoverage.vendor_id == vendor_id
        ).group_by(
            Jurisdiction.id,
            VendorCoverage.coverage_percentage,
            VendorCoverage.avg_turnaround_hours
        ).all()
        
        return [
            {
                "jurisdiction": row.name,
                "state": row.state,
                "coverage_percentage": row.coverage_percentage,
                "avg_turnaround_hours": row.avg_turnaround_hours,
                "record_count": row.record_count or 0,
                "pii_completeness_rate": (row.pii_completeness_rate or 0) * 100,
                "disposition_accuracy_rate": (row.disposition_accuracy_rate or 0) * 100
            }
            for row in query
        ]
    
    @staticmethod
    def benchmark_vendors(db: Session) -> Dict[str, Any]:
        """Compare all vendors across key metrics"""
        
        vendors = db.query(Vendor).filter(Vendor.is_active == True).all()
        benchmark_data = []
        
        for vendor in vendors:
            metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor.id)
            value_index = ScoringEngine.calculate_value_index(
                metrics["quality_score"], 
                vendor.cost_per_record
            )
            
            benchmark_data.append({
                "vendor_id": vendor.id,
                "vendor_name": vendor.name,
                "quality_score": metrics["quality_score"],
                "cost_per_record": vendor.cost_per_record,
                "coverage_percentage": vendor.coverage_percentage,
                "value_index": value_index,
                "total_records": metrics["total_records"],
                "pii_completeness": metrics["pii_completeness"],
                "disposition_accuracy": metrics["disposition_accuracy"],
                "avg_freshness_days": metrics["avg_freshness_days"]
            })
        
        # Sort by quality score descending
        benchmark_data.sort(key=lambda x: x["quality_score"], reverse=True)
        
        return {
            "vendors": benchmark_data,
            "summary": {
                "total_vendors": len(benchmark_data),
                "avg_quality_score": sum(v["quality_score"] for v in benchmark_data) / len(benchmark_data),
                "avg_cost_per_record": sum(v["cost_per_record"] for v in benchmark_data) / len(benchmark_data),
                "avg_coverage": sum(v["coverage_percentage"] for v in benchmark_data) / len(benchmark_data)
            }
        }
    
    @staticmethod
    def get_quality_trends(db: Session, vendor_id: int, days: int = 90) -> Dict[str, List]:
        """Get quality trend data for charts"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Get daily aggregated metrics
        daily_metrics = db.query(
            func.date(CriminalRecord.vendor_delivery_date).label('date'),
            func.count(CriminalRecord.id).label('total_records'),
            func.avg(
                func.case(
                    (CriminalRecord.pii_status == PIIStatus.COMPLETE, 1),
                    else_=0
                )
            ).label('pii_completeness'),
            func.avg(
                func.case(
                    (CriminalRecord.disposition_verified == True, 1),
                    else_=0
                )
            ).label('disposition_accuracy'),
            func.avg(CriminalRecord.turnaround_hours).label('avg_turnaround')
        ).filter(
            and_(
                CriminalRecord.vendor_id == vendor_id,
                CriminalRecord.vendor_delivery_date >= cutoff_date
            )
        ).group_by(
            func.date(CriminalRecord.vendor_delivery_date)
        ).order_by('date').all()
        
        return {
            "dates": [str(row.date) for row in daily_metrics],
            "pii_completeness": [float(row.pii_completeness * 100) for row in daily_metrics],
            "disposition_accuracy": [float(row.disposition_accuracy * 100) for row in daily_metrics],
            "avg_turnaround": [float(row.avg_turnaround) for row in daily_metrics],
            "record_volume": [int(row.total_records) for row in daily_metrics]
        }
