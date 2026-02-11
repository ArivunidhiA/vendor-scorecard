from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import pandas as pd
import io
import uuid
from datetime import datetime, timedelta

router = APIRouter()

# In-memory session storage for quick comparisons (production: use Redis)
_quick_sessions = {}
SESSION_TTL_HOURS = 24

class VendorInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    cost_per_record: float = Field(..., gt=0)
    quality_score: Optional[float] = Field(None, ge=0, le=100)
    # Raw metrics for auto-calculation
    pii_completeness: Optional[float] = Field(None, ge=0, le=100)
    disposition_accuracy: Optional[float] = Field(None, ge=0, le=100)
    avg_freshness_days: Optional[float] = Field(None, ge=0)
    coverage_percentage: Optional[float] = Field(None, ge=0, le=100)
    description: Optional[str] = None

class QuickComparisonRequest(BaseModel):
    vendors: List[VendorInput]
    mode: str = Field(default="side-by-side", pattern="^(side-by-side|what-if)$")
    priority: str = Field(default="balanced", pattern="^(quality|cost|balanced|value)$")
    annual_volume: Optional[int] = Field(None, ge=100)

class ComparisonResult(BaseModel):
    session_id: str
    created_at: str
    expires_at: str
    vendors: List[Dict[str, Any]]
    rankings: List[Dict[str, Any]]
    recommendations: Optional[Dict[str, Any]]

class UploadResponse(BaseModel):
    session_id: str
    vendors: List[Dict[str, Any]]
    columns_detected: List[str]
    message: str

def calculate_quality_score(vendor: VendorInput) -> float:
    """Calculate quality score from raw metrics or return provided score."""
    if vendor.quality_score is not None:
        return vendor.quality_score
    
    # Calculate from raw metrics using existing formula
    if all([vendor.pii_completeness, vendor.disposition_accuracy, 
            vendor.avg_freshness_days is not None, vendor.coverage_percentage]):
        freshness_score = max(0, 100 - vendor.avg_freshness_days)
        return (
            (vendor.pii_completeness * 0.4) +
            (vendor.disposition_accuracy * 0.3) +
            (freshness_score * 0.2) +
            (vendor.coverage_percentage * 0.1)
        )
    
    # Default if insufficient data
    return 70.0

def calculate_value_index(quality_score: float, cost_per_record: float) -> float:
    """Calculate value index = quality per dollar."""
    if cost_per_record <= 0:
        return 0.0
    return round(quality_score / cost_per_record, 2)

def get_recommendation_priority(priority: str, vendor: Dict) -> float:
    """Calculate recommendation score based on user priority."""
    if priority == "quality":
        return vendor["quality_score"] * 0.8 + vendor["value_index"] * 0.2
    elif priority == "cost":
        # Lower cost is better, so invert
        cost_score = max(0, 100 - (vendor["cost_per_record"] / 15 * 100))
        return cost_score * 0.6 + vendor["quality_score"] * 0.4
    elif priority == "value":
        return vendor["value_index"] * 0.7 + vendor["quality_score"] * 0.3
    else:  # balanced
        return (
            vendor["quality_score"] * 0.4 +
            vendor["value_index"] * 0.3 +
            (100 - vendor["cost_per_record"] / 15 * 100) * 0.3
        )

def cleanup_expired_sessions():
    """Remove expired sessions from memory."""
    now = datetime.utcnow()
    expired = [sid for sid, session in _quick_sessions.items() 
               if session["expires_at"] < now]
    for sid in expired:
        del _quick_sessions[sid]

@router.post("/upload/", response_model=UploadResponse)
@router.post("/upload", response_model=UploadResponse)
async def upload_vendor_data(file: UploadFile = File(...)):
    """
    Upload CSV or Excel file with vendor data.
    Returns parsed data with session ID for comparison.
    """
    cleanup_expired_sessions()
    
    # Validate file type
    if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(
            status_code=400, 
            detail="Only CSV and Excel files are supported"
        )
    
    try:
        content = await file.read()
        
        # Parse based on file type
        if file.filename.lower().endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        # Validate required columns (flexible matching)
        required_cols = ['vendor_name', 'cost_per_record']
        df.columns = df.columns.str.lower().str.strip()
        
        # Map common variations
        col_mapping = {
            'name': 'vendor_name',
            'vendor': 'vendor_name',
            'company': 'vendor_name',
            'cost': 'cost_per_record',
            'price': 'cost_per_record',
            'cost_per_rec': 'cost_per_record',
        }
        df.rename(columns=col_mapping, inplace=True)
        
        # Check required columns
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing}. Required: vendor_name, cost_per_record"
            )
        
        # Parse vendors
        vendors = []
        for _, row in df.iterrows():
            if pd.isna(row['vendor_name']) or pd.isna(row['cost_per_record']):
                continue
                
            vendor = {
                "name": str(row['vendor_name']).strip(),
                "cost_per_record": float(row['cost_per_record']),
                "description": str(row.get('description', '')) if pd.notna(row.get('description')) else None,
            }
            
            # Optional fields
            if 'quality_score' in df.columns and pd.notna(row.get('quality_score')):
                vendor["quality_score"] = float(row['quality_score'])
            if 'pii_completeness' in df.columns and pd.notna(row.get('pii_completeness')):
                vendor["pii_completeness"] = float(row['pii_completeness'])
            if 'disposition_accuracy' in df.columns and pd.notna(row.get('disposition_accuracy')):
                vendor["disposition_accuracy"] = float(row['disposition_accuracy'])
            if 'avg_freshness_days' in df.columns and pd.notna(row.get('avg_freshness_days')):
                vendor["avg_freshness_days"] = float(row['avg_freshness_days'])
            if 'coverage_percentage' in df.columns and pd.notna(row.get('coverage_percentage')):
                vendor["coverage_percentage"] = float(row['coverage_percentage'])
            
            vendors.append(vendor)
        
        if not vendors:
            raise HTTPException(
                status_code=400,
                detail="No valid vendor data found in file"
            )
        
        # Create session
        session_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        _quick_sessions[session_id] = {
            "vendors": vendors,
            "created_at": now,
            "expires_at": now + timedelta(hours=SESSION_TTL_HOURS),
            "results": None
        }
        
        return UploadResponse(
            session_id=session_id,
            vendors=vendors,
            columns_detected=list(df.columns),
            message=f"Successfully uploaded {len(vendors)} vendors"
        )
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="File is empty")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Could not parse file. Check format.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Data format error: {str(e)}")

@router.post("/compare/", response_model=ComparisonResult)
@router.post("/compare", response_model=ComparisonResult)
async def quick_compare(request: QuickComparisonRequest):
    """
    Perform quick comparison of vendors without database persistence.
    """
    cleanup_expired_sessions()
    
    if len(request.vendors) < 2:
        raise HTTPException(
            status_code=400, 
            detail="At least 2 vendors required for comparison"
        )
    
    if len(request.vendors) > 20:
        raise HTTPException(
            status_code=400,
            detail="Maximum 20 vendors allowed for quick comparison"
        )
    
    # Process vendors
    processed_vendors = []
    for v in request.vendors:
        quality_score = calculate_quality_score(v)
        value_index = calculate_value_index(quality_score, v.cost_per_record)
        
        processed_vendors.append({
            "name": v.name,
            "cost_per_record": round(v.cost_per_record, 2),
            "quality_score": round(quality_score, 1),
            "value_index": round(value_index, 2),
            "description": v.description,
            "raw_metrics": {
                "pii_completeness": v.pii_completeness,
                "disposition_accuracy": v.disposition_accuracy,
                "avg_freshness_days": v.avg_freshness_days,
                "coverage_percentage": v.coverage_percentage,
            }
        })
    
    # Calculate rankings based on priority
    for vendor in processed_vendors:
        vendor["recommendation_score"] = get_recommendation_priority(
            request.priority, vendor
        )
    
    # Sort by recommendation score
    rankings = sorted(
        processed_vendors, 
        key=lambda x: x["recommendation_score"], 
        reverse=True
    )
    
    # Generate recommendations
    recommendations = None
    if request.annual_volume:
        recommendations = {
            "annual_volume": request.annual_volume,
            "cost_comparison": [
                {
                    "name": v["name"],
                    "annual_cost": round(v["cost_per_record"] * request.annual_volume, 2),
                    "quality_score": v["quality_score"],
                    "value_index": v["value_index"]
                }
                for v in rankings[:3]  # Top 3
            ],
            "best_value": rankings[0]["name"] if rankings else None,
            "cheapest": min(processed_vendors, key=lambda x: x["cost_per_record"])["name"],
            "highest_quality": max(processed_vendors, key=lambda x: x["quality_score"])["name"]
        }
    
    # Create session
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    result = ComparisonResult(
        session_id=session_id,
        created_at=now.isoformat(),
        expires_at=(now + timedelta(hours=SESSION_TTL_HOURS)).isoformat(),
        vendors=processed_vendors,
        rankings=[{
            "rank": i + 1,
            "name": v["name"],
            "quality_score": v["quality_score"],
            "cost_per_record": v["cost_per_record"],
            "value_index": v["value_index"],
            "recommendation_score": round(v["recommendation_score"], 1)
        } for i, v in enumerate(rankings)],
        recommendations=recommendations
    )
    
    # Store in session
    _quick_sessions[session_id] = {
        "vendors": [v.dict() for v in request.vendors],
        "created_at": now,
        "expires_at": now + timedelta(hours=SESSION_TTL_HOURS),
        "results": result.dict()
    }
    
    return result

@router.get("/results/{session_id}/", response_model=ComparisonResult)
@router.get("/results/{session_id}", response_model=ComparisonResult)
async def get_quick_results(session_id: str):
    """
    Retrieve comparison results by session ID.
    """
    cleanup_expired_sessions()
    
    if session_id not in _quick_sessions:
        raise HTTPException(status_code=404, detail="Session expired or not found")
    
    session = _quick_sessions[session_id]
    if session["results"] is None:
        raise HTTPException(status_code=400, detail="No results found for this session")
    
    return ComparisonResult(**session["results"])

@router.get("/demo-data/")
@router.get("/demo-data")
async def get_demo_data():
    """
    Return sample vendor data for demo mode.
    """
    return {
        "vendors": [
            {
                "name": "Acme Records",
                "cost_per_record": 12.50,
                "quality_score": 88.5,
                "pii_completeness": 92.0,
                "disposition_accuracy": 89.0,
                "avg_freshness_days": 3.5,
                "coverage_percentage": 85.0,
                "description": "Premium provider with excellent accuracy"
            },
            {
                "name": "Budget Checks",
                "cost_per_record": 6.75,
                "quality_score": 74.2,
                "pii_completeness": 78.0,
                "disposition_accuracy": 82.0,
                "avg_freshness_days": 5.2,
                "coverage_percentage": 72.0,
                "description": "Cost-effective option for basic needs"
            },
            {
                "name": "FastTrack Data",
                "cost_per_record": 9.25,
                "quality_score": 82.8,
                "pii_completeness": 85.0,
                "disposition_accuracy": 86.0,
                "avg_freshness_days": 2.1,
                "coverage_percentage": 91.0,
                "description": "Fast turnaround with good coverage"
            },
            {
                "name": "Elite Verification",
                "cost_per_record": 18.00,
                "quality_score": 95.1,
                "pii_completeness": 98.0,
                "disposition_accuracy": 95.0,
                "avg_freshness_days": 1.8,
                "coverage_percentage": 96.0,
                "description": "Enterprise-grade accuracy and coverage"
            }
        ],
        "message": "Sample data loaded. Upload your own CSV for real comparison."
    }
