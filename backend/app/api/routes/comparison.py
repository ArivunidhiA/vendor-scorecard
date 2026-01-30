from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services import AnalysisService
from pydantic import BaseModel

router = APIRouter()

class ComparisonRequest(BaseModel):
    vendor_ids: List[int]
    filters: Optional[dict] = None

class WhatIfRequest(BaseModel):
    current_vendor_id: int
    new_vendor_id: int
    annual_volume: int
    assumptions: Optional[dict] = None

class TCORequest(BaseModel):
    vendor_id: int
    annual_volume: int
    years: int = 3

@router.post("/compare")
async def compare_vendors(
    request: ComparisonRequest,
    db: Session = Depends(get_db)
):
    """Side-by-side comparison of multiple vendors"""
    
    if len(request.vendor_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 vendors required for comparison")
    
    if len(request.vendor_ids) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 vendors allowed for comparison")
    
    comparison_result = AnalysisService.compare_vendors(
        db, 
        request.vendor_ids, 
        request.filters
    )
    
    return comparison_result

@router.post("/whatif")
async def what_if_analysis(
    request: WhatIfRequest,
    db: Session = Depends(get_db)
):
    """What-if analysis for switching vendors"""
    
    if request.current_vendor_id == request.new_vendor_id:
        raise HTTPException(status_code=400, detail="Current and new vendor must be different")
    
    if request.annual_volume <= 0:
        raise HTTPException(status_code=400, detail="Annual volume must be greater than 0")
    
    analysis_result = AnalysisService.what_if_analysis(
        db,
        request.current_vendor_id,
        request.new_vendor_id,
        request.annual_volume,
        request.assumptions
    )
    
    return analysis_result

@router.post("/tco")
async def calculate_tco(
    request: TCORequest,
    db: Session = Depends(get_db)
):
    """Calculate Total Cost of Ownership for a vendor"""
    
    if request.annual_volume <= 0:
        raise HTTPException(status_code=400, detail="Annual volume must be greater than 0")
    
    if request.years <= 0 or request.years > 10:
        raise HTTPException(status_code=400, detail="Years must be between 1 and 10")
    
    tco_result = AnalysisService.calculate_total_cost_of_ownership(
        db,
        request.vendor_id,
        request.annual_volume,
        request.years
    )
    
    return tco_result

@router.get("/jurisdictions")
async def get_jurisdictions(db: Session = Depends(get_db)):
    """Get all available jurisdictions"""
    from app.models import Jurisdiction
    
    jurisdictions = db.query(Jurisdiction).filter(Jurisdiction.is_active == True).all()
    
    return [
        {
            "id": jur.id,
            "name": jur.name,
            "state": jur.state,
            "county": jur.county
        }
        for jur in jurisdictions
    ]

@router.get("/benchmarks")
async def get_market_benchmarks(db: Session = Depends(get_db)):
    """Get market benchmarks for vendor comparison"""
    
    benchmarks = AnalysisService.get_market_benchmarks(db)
    
    return benchmarks

@router.get("/coverage-heatmap")
async def get_coverage_heatmap(db: Session = Depends(get_db)):
    """Get coverage data for heatmap visualization"""
    from app.models import Vendor, VendorCoverage, Jurisdiction
    
    # Get all vendors and their coverage
    vendors = db.query(Vendor).filter(Vendor.is_active == True).all()
    jurisdictions = db.query(Jurisdiction).filter(Jurisdiction.is_active == True).all()
    
    heatmap_data = []
    
    for vendor in vendors:
        coverage_data = db.query(VendorCoverage).filter(
            VendorCoverage.vendor_id == vendor.id
        ).all()
        
        coverage_map = {c.jurisdiction_id: c.coverage_percentage for c in coverage_data}
        
        for jurisdiction in jurisdictions:
            coverage_percentage = coverage_map.get(jurisdiction.id, 0)
            
            heatmap_data.append({
                "vendor_id": vendor.id,
                "vendor_name": vendor.name,
                "jurisdiction_id": jurisdiction.id,
                "jurisdiction_name": jurisdiction.name,
                "state": jurisdiction.state,
                "coverage_percentage": coverage_percentage,
                "color_intensity": coverage_percentage / 100  # For visualization
            })
    
    return {
        "heatmap_data": heatmap_data,
        "vendors": [{"id": v.id, "name": v.name} for v in vendors],
        "jurisdictions": [{"id": j.id, "name": j.name, "state": j.state} for j in jurisdictions]
    }
