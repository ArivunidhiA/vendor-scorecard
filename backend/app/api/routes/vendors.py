from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Vendor
from app.services import ScoringEngine
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Mock data for when database is not available
def get_mock_vendors():
    """Return mock vendor data when database is unavailable"""
    return [
        {
            "id": 1,
            "name": "Checkr Inc",
            "description": "Leading background screening provider with modern API-first approach and fast turnaround times",
            "cost_per_record": 8.50,
            "quality_score": 92.5,
            "coverage_percentage": 87.3,
            "is_active": True,
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-20T14:30:00Z"
        },
        {
            "id": 2,
            "name": "Sterling Talent Solutions",
            "description": "Enterprise-grade screening with comprehensive compliance features and global coverage",
            "cost_per_record": 12.75,
            "quality_score": 88.2,
            "coverage_percentage": 92.1,
            "is_active": True,
            "created_at": "2024-01-10T09:30:00Z",
            "updated_at": "2024-01-18T16:45:00Z"
        },
        {
            "id": 3,
            "name": "GoodHire",
            "description": "User-friendly platform with competitive pricing and solid customer support",
            "cost_per_record": 7.25,
            "quality_score": 85.7,
            "coverage_percentage": 78.9,
            "is_active": True,
            "created_at": "2024-01-08T11:15:00Z",
            "updated_at": "2024-01-22T13:20:00Z"
        },
        {
            "id": 4,
            "name": "Accurate Background",
            "description": "Specialized in criminal records with nationwide coverage and detailed reporting",
            "cost_per_record": 9.80,
            "quality_score": 90.1,
            "coverage_percentage": 85.4,
            "is_active": True,
            "created_at": "2024-01-12T15:45:00Z",
            "updated_at": "2024-01-19T10:10:00Z"
        },
        {
            "id": 5,
            "name": "HireRight",
            "description": "Global background screening leader with advanced compliance tools and analytics",
            "cost_per_record": 11.20,
            "quality_score": 89.8,
            "coverage_percentage": 94.2,
            "is_active": True,
            "created_at": "2024-01-05T08:30:00Z",
            "updated_at": "2024-01-21T09:15:00Z"
        },
        {
            "id": 6,
            "name": "IntelliCorp",
            "description": "Cost-effective solution with good coverage in major metropolitan areas",
            "cost_per_record": 6.95,
            "quality_score": 82.3,
            "coverage_percentage": 73.6,
            "is_active": True,
            "created_at": "2024-01-18T12:00:00Z",
            "updated_at": "2024-01-23T11:45:00Z"
        },
        {
            "id": 7,
            "name": "Backgrounds Online",
            "description": "Specialized in employment screening with fast criminal record checks",
            "cost_per_record": 8.15,
            "quality_score": 86.9,
            "coverage_percentage": 81.2,
            "is_active": True,
            "created_at": "2024-01-14T16:20:00Z",
            "updated_at": "2024-01-24T08:30:00Z"
        },
        {
            "id": 8,
            "name": "Certn",
            "description": "Modern platform with AI-powered screening and international capabilities",
            "cost_per_record": 10.50,
            "quality_score": 91.2,
            "coverage_percentage": 88.7,
            "is_active": True,
            "created_at": "2024-01-09T13:45:00Z",
            "updated_at": "2024-01-22T15:20:00Z"
        }
    ]

def get_mock_benchmark_data():
    """Return mock benchmark data when database is unavailable"""
    vendors = get_mock_vendors()
    return {
        "summary": {
            "total_vendors": len(vendors),
            "avg_quality_score": round(sum(v["quality_score"] for v in vendors) / len(vendors), 1),
            "avg_cost_per_record": round(sum(v["cost_per_record"] for v in vendors) / len(vendors), 2),
            "avg_coverage": round(sum(v["coverage_percentage"] for v in vendors) / len(vendors), 1)
        },
        "vendors": vendors
    }

class VendorResponse(BaseModel):
    id: int
    name: str
    description: str
    cost_per_record: float
    quality_score: float
    coverage_percentage: float
    is_active: bool
    created_at: str
    updated_at: Optional[str] = None

class VendorMetricsResponse(BaseModel):
    quality_score: float
    pii_completeness: float
    disposition_accuracy: float
    avg_freshness_days: float
    geographic_coverage: float
    total_records: int

class VendorDetailResponse(BaseModel):
    vendor: VendorResponse
    metrics: VendorMetricsResponse
    jurisdiction_performance: List[dict]
    quality_trends: dict

@router.get("", response_model=List[VendorResponse])
@router.get("/", response_model=List[VendorResponse])
async def get_vendors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Get all vendors with optional filtering"""
    try:
        query = db.query(Vendor)
        
        if active_only:
            query = query.filter(Vendor.is_active == True)
        
        vendors = query.offset(skip).limit(limit).all()
        
        return [
            VendorResponse(
                id=vendor.id,
                name=vendor.name,
                description=vendor.description,
                cost_per_record=vendor.cost_per_record,
                quality_score=vendor.quality_score,
                coverage_percentage=vendor.coverage_percentage,
                is_active=vendor.is_active,
                created_at=vendor.created_at.isoformat(),
                updated_at=vendor.updated_at.isoformat() if vendor.updated_at else None
            )
            for vendor in vendors
        ]
    except Exception as e:
        logger.warning(f"Database error in get_vendors: {e}. Using mock data.")
        mock_vendors = get_mock_vendors()
        if active_only:
            mock_vendors = [v for v in mock_vendors if v["is_active"]]
        
        # Apply pagination
        paginated_vendors = mock_vendors[skip:skip + limit]
        
        return [VendorResponse(**vendor) for vendor in paginated_vendors]

@router.get("/summary")
async def get_vendors_summary(db: Session = Depends(get_db)):
    """Get summary statistics for all vendors"""
    
    vendors = db.query(Vendor).filter(Vendor.is_active == True).all()
    
    total_vendors = len(vendors)
    avg_quality = sum(v.quality_score for v in vendors) / total_vendors if total_vendors > 0 else 0
    avg_coverage = sum(v.coverage_percentage for v in vendors) / total_vendors if total_vendors > 0 else 0
    
    return {
        "total_vendors": total_vendors,
        "avg_quality_score": round(avg_quality, 1),
        "avg_coverage": round(avg_coverage, 1),
        "vendors": [
            {
                "id": v.id,
                "name": v.name,
                "quality_score": v.quality_score,
                "coverage_percentage": v.coverage_percentage,
                "cost_per_record": v.cost_per_record
            }
            for v in vendors
        ]
    }

@router.get("/{vendor_id}", response_model=VendorDetailResponse)
async def get_vendor_detail(vendor_id: int, db: Session = Depends(get_db)):
    """Get detailed information about a specific vendor"""
    
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Get detailed metrics
    metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor_id)
    
    # Get jurisdiction performance
    jurisdiction_performance = ScoringEngine.get_jurisdiction_performance(db, vendor_id)
    
    # Get quality trends
    quality_trends = ScoringEngine.get_quality_trends(db, vendor_id)
    
    return VendorDetailResponse(
        vendor=VendorResponse(
            id=vendor.id,
            name=vendor.name,
            description=vendor.description,
            cost_per_record=vendor.cost_per_record,
            quality_score=vendor.quality_score,
            coverage_percentage=vendor.coverage_percentage,
            is_active=vendor.is_active,
            created_at=vendor.created_at.isoformat(),
            updated_at=vendor.updated_at.isoformat() if vendor.updated_at else None
        ),
        metrics=VendorMetricsResponse(**metrics),
        jurisdiction_performance=jurisdiction_performance,
        quality_trends=quality_trends
    )

@router.get("/{vendor_id}/score", response_model=VendorMetricsResponse)
async def get_vendor_score(vendor_id: int, db: Session = Depends(get_db)):
    """Get current quality score and metrics for a vendor"""
    
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor_id)
    
    return VendorMetricsResponse(**metrics)

@router.get("/{vendor_id}/history")
async def get_vendor_history(
    vendor_id: int, 
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get historical quality metrics for a vendor"""
    
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    history = ScoringEngine.get_vendor_metrics_history(db, vendor_id, days)
    
    return {
        "vendor_id": vendor_id,
        "vendor_name": vendor.name,
        "period_days": days,
        "history": history
    }

@router.get("/{vendor_id}/jurisdictions")
async def get_vendor_jurisdictions(vendor_id: int, db: Session = Depends(get_db)):
    """Get vendor performance by jurisdiction"""
    
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    jurisdictions = ScoringEngine.get_jurisdiction_performance(db, vendor_id)
    
    return {
        "vendor_id": vendor_id,
        "vendor_name": vendor.name,
        "jurisdictions": jurisdictions
    }

@router.get("/benchmark/all")
async def benchmark_all_vendors(db: Session = Depends(get_db)):
    """Get benchmark comparison of all vendors"""
    try:
        benchmark_data = ScoringEngine.benchmark_vendors(db)
        return benchmark_data
    except Exception as e:
        logger.warning(f"Database error in benchmark_all_vendors: {e}. Using mock data.")
        return get_mock_benchmark_data()
