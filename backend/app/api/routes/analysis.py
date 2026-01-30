from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services import AnalysisService
from pydantic import BaseModel

router = APIRouter()

@router.get("/schema-changes")
async def get_schema_changes(
    vendor_id: Optional[int] = Query(None),
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get vendor schema change history"""
    
    changes = AnalysisService.get_vendor_change_log(db, vendor_id, days)
    
    return {
        "filters": {
            "vendor_id": vendor_id,
            "days": days
        },
        "changes": changes
    }

@router.get("/schema-changes/vendor/{vendor_id}")
async def get_vendor_schema_changes(
    vendor_id: int,
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get schema changes for a specific vendor"""
    
    changes = AnalysisService.get_vendor_change_log(db, vendor_id, days)
    
    return {
        "vendor_id": vendor_id,
        "period_days": days,
        "changes": changes
    }

@router.get("/impact-assessment/{change_id}")
async def get_change_impact_assessment(
    change_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed impact assessment for a schema change"""
    from app.models import SchemaChange, CriminalRecord
    
    schema_change = db.query(SchemaChange).filter(SchemaChange.id == change_id).first()
    if not schema_change:
        raise HTTPException(status_code=404, detail="Schema change not found")
    
    # Get affected records
    affected_records = db.query(CriminalRecord).filter(
        CriminalRecord.vendor_id == schema_change.vendor_id,
        CriminalRecord.created_at <= schema_change.change_date
    ).limit(100).all()  # Limit for performance
    
    # Analyze impact
    impact_analysis = {
        "schema_change": {
            "id": schema_change.id,
            "vendor_id": schema_change.vendor_id,
            "vendor_name": schema_change.vendor.name,
            "change_description": schema_change.change_description,
            "field_affected": schema_change.field_affected,
            "old_value": schema_change.old_value,
            "new_value": schema_change.new_value,
            "records_affected": schema_change.records_affected,
            "change_date": schema_change.change_date.isoformat()
        },
        "impact_assessment": {
            "total_records_affected": schema_change.records_affected,
            "sample_records_analyzed": len(affected_records),
            "data_quality_impact": "medium" if schema_change.records_affected > 100 else "low",
            "recommended_actions": [
                "Monitor data quality metrics closely",
                "Run validation checks on affected records",
                "Consider reprocessing affected records if necessary"
            ]
        },
        "affected_records_sample": [
            {
                "id": record.id,
                "case_number": record.case_number,
                "defendant_name": record.defendant_name,
                "disposition_type": record.disposition_type.value if record.disposition_type else None,
                "created_at": record.created_at.isoformat()
            }
            for record in affected_records[:10]  # Return only 10 samples
        ]
    }
    
    return impact_analysis

@router.get("/quality-trends/{vendor_id}")
async def get_quality_trends(
    vendor_id: int,
    days: int = Query(90, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get quality trend data for visualization"""
    
    from app.services import ScoringEngine
    
    trends = ScoringEngine.get_quality_trends(db, vendor_id, days)
    
    return {
        "vendor_id": vendor_id,
        "period_days": days,
        "trends": trends
    }

@router.get("/performance-metrics")
async def get_performance_metrics(
    vendor_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    """Get comprehensive performance metrics for vendors"""
    
    from app.models import Vendor
    from app.services import ScoringEngine
    
    if not vendor_ids:
        # Get all active vendors if none specified
        vendors = db.query(Vendor).filter(Vendor.is_active == True).all()
        vendor_ids = [v.id for v in vendors]
    
    metrics = []
    
    for vendor_id in vendor_ids:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            continue
        
        vendor_metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor_id)
        jurisdiction_performance = ScoringEngine.get_jurisdiction_performance(db, vendor_id)
        
        # Calculate additional performance indicators
        avg_turnaround = sum(j["avg_turnaround_hours"] for j in jurisdiction_performance) / len(jurisdiction_performance) if jurisdiction_performance else 0
        
        metrics.append({
            "vendor_id": vendor_id,
            "vendor_name": vendor.name,
            "quality_score": vendor_metrics["quality_score"],
            "cost_per_record": vendor.cost_per_record,
            "value_index": vendor_metrics["quality_score"] / vendor.cost_per_record,
            "coverage_percentage": vendor.coverage_percentage,
            "total_records": vendor_metrics["total_records"],
            "avg_turnaround_hours": avg_turnaround,
            "performance_grade": ScoringEngine._get_performance_grade(vendor_metrics["quality_score"]),
            "jurisdictions_covered": len(jurisdiction_performance)
        })
    
    return {
        "vendors": metrics,
        "summary": {
            "total_vendors": len(metrics),
            "avg_quality_score": sum(m["quality_score"] for m in metrics) / len(metrics) if metrics else 0,
            "avg_cost_per_record": sum(m["cost_per_record"] for m in metrics) / len(metrics) if metrics else 0,
            "avg_coverage": sum(m["coverage_percentage"] for m in metrics) / len(metrics) if metrics else 0
        }
    }

@router.get("/recommendations")
async def get_vendor_recommendations(
    annual_volume: int = Query(10000, ge=100),
    priority_factors: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """Get vendor recommendations based on requirements"""
    
    from app.models import Vendor
    from app.services import ScoringEngine
    
    vendors = db.query(Vendor).filter(Vendor.is_active == True).all()
    recommendations = []
    
    for vendor in vendors:
        metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor.id)
        value_index = ScoringEngine.calculate_value_index(metrics["quality_score"], vendor.cost_per_record)
        
        # Calculate recommendation score based on priority factors
        recommendation_score = 0.0
        
        if not priority_factors or "quality" in priority_factors:
            recommendation_score += metrics["quality_score"] * 0.4
        
        if not priority_factors or "cost" in priority_factors:
            # Lower cost is better, so invert and normalize
            cost_score = max(0, 100 - (vendor.cost_per_record / 15 * 100))  # Assuming $15 as max cost
            recommendation_score += cost_score * 0.3
        
        if not priority_factors or "coverage" in priority_factors:
            recommendation_score += vendor.coverage_percentage * 0.2
        
        if not priority_factors or "value" in priority_factors:
            # Normalize value index (assuming 10 as max)
            value_score = min(100, value_index * 10)
            recommendation_score += value_score * 0.1
        
        recommendations.append({
            "vendor_id": vendor.id,
            "vendor_name": vendor.name,
            "recommendation_score": recommendation_score,
            "quality_score": metrics["quality_score"],
            "cost_per_record": vendor.cost_per_record,
            "coverage_percentage": vendor.coverage_percentage,
            "value_index": value_index,
            "annual_cost": vendor.cost_per_record * annual_volume,
            "strengths": ScoringEngine._get_vendor_strengths(vendor, metrics),
            "weaknesses": ScoringEngine._get_vendor_weaknesses(vendor, metrics),
            "best_for": ScoringEngine._get_best_use_case(vendor, metrics)
        })
    
    # Sort by recommendation score
    recommendations.sort(key=lambda x: x["recommendation_score"], reverse=True)
    
    return {
        "requirements": {
            "annual_volume": annual_volume,
            "priority_factors": priority_factors or ["quality", "cost", "coverage", "value"]
        },
        "recommendations": recommendations,
        "top_pick": recommendations[0] if recommendations else None
    }

# Add helper methods to ScoringEngine
def _get_performance_grade(score: float) -> str:
    """Get performance grade based on quality score"""
    if score >= 95:
        return "A+"
    elif score >= 90:
        return "A"
    elif score >= 85:
        return "B+"
    elif score >= 80:
        return "B"
    elif score >= 75:
        return "C+"
    elif score >= 70:
        return "C"
    else:
        return "D"

def _get_vendor_strengths(vendor, metrics) -> List[str]:
    """Get vendor strengths based on metrics"""
    strengths = []
    
    if metrics["quality_score"] >= 90:
        strengths.append("High quality score")
    
    if vendor.cost_per_record <= 6:
        strengths.append("Low cost per record")
    
    if vendor.coverage_percentage >= 95:
        strengths.append("Excellent geographic coverage")
    
    if metrics["pii_completeness"] >= 95:
        strengths.append("Superior PII completeness")
    
    if metrics["disposition_accuracy"] >= 95:
        strengths.append("High disposition accuracy")
    
    return strengths

def _get_vendor_weaknesses(vendor, metrics) -> List[str]:
    """Get vendor weaknesses based on metrics"""
    weaknesses = []
    
    if metrics["quality_score"] < 80:
        weaknesses.append("Below average quality score")
    
    if vendor.cost_per_record >= 10:
        weaknesses.append("Higher cost per record")
    
    if vendor.coverage_percentage < 85:
        weaknesses.append("Limited geographic coverage")
    
    if metrics["pii_completeness"] < 85:
        weaknesses.append("PII completeness needs improvement")
    
    if metrics["disposition_accuracy"] < 85:
        weaknesses.append("Disposition accuracy needs improvement")
    
    return weaknesses

def _get_best_use_case(vendor, metrics) -> str:
    """Get best use case for vendor"""
    if vendor.name == "VendorA":
        return "High-volume, quality-critical operations"
    elif vendor.name == "VendorB":
        return "Balanced operations requiring good quality at reasonable cost"
    elif vendor.name == "VendorC":
        return "Budget-conscious operations with some quality tolerance"
    elif vendor.name == "VendorD":
        return "California-focused operations requiring regional expertise"
    else:
        return "General criminal record screening"

# Add the helper methods to ScoringEngine
import app.services.scoring_engine
app.services.scoring_engine.ScoringEngine._get_performance_grade = staticmethod(_get_performance_grade)
app.services.scoring_engine.ScoringEngine._get_vendor_strengths = staticmethod(_get_vendor_strengths)
app.services.scoring_engine.ScoringEngine._get_vendor_weaknesses = staticmethod(_get_vendor_weaknesses)
app.services.scoring_engine.ScoringEngine._get_best_use_case = staticmethod(_get_best_use_case)
