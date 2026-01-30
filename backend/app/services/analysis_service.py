from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.models import *
from app.services.scoring_engine import ScoringEngine

class AnalysisService:
    """Production-level vendor analysis and ROI calculations"""
    
    @staticmethod
    def compare_vendors(db: Session, vendor_ids: List[int], filters: Dict = None) -> Dict[str, Any]:
        """Side-by-side vendor comparison"""
        
        comparison_data = []
        
        for vendor_id in vendor_ids:
            vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
            if not vendor:
                continue
            
            # Get detailed metrics
            metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor_id)
            value_index = ScoringEngine.calculate_value_index(
                metrics["quality_score"], 
                vendor.cost_per_record
            )
            
            # Get jurisdiction performance
            jurisdiction_performance = ScoringEngine.get_jurisdiction_performance(db, vendor_id)
            
            # Apply filters if provided
            if filters:
                filtered_jurisdictions = []
                for jur in jurisdiction_performance:
                    if "jurisdictions" in filters and jur["jurisdiction"] not in filters["jurisdictions"]:
                        continue
                    if "min_coverage" in filters and jur["coverage_percentage"] < filters["min_coverage"]:
                        continue
                    filtered_jurisdictions.append(jur)
                jurisdiction_performance = filtered_jurisdictions
            
            comparison_data.append({
                "vendor_id": vendor.id,
                "vendor_name": vendor.name,
                "description": vendor.description,
                "cost_per_record": vendor.cost_per_record,
                "quality_score": metrics["quality_score"],
                "value_index": value_index,
                "coverage_percentage": vendor.coverage_percentage,
                "total_records": metrics["total_records"],
                "metrics_breakdown": {
                    "pii_completeness": metrics["pii_completeness"],
                    "disposition_accuracy": metrics["disposition_accuracy"],
                    "avg_freshness_days": metrics["avg_freshness_days"],
                    "geographic_coverage": metrics["geographic_coverage"]
                },
                "jurisdiction_performance": jurisdiction_performance
            })
        
        # Sort by quality score (default)
        comparison_data.sort(key=lambda x: x["quality_score"], reverse=True)
        
        return {
            "vendors": comparison_data,
            "comparison_summary": {
                "total_vendors": len(comparison_data),
                "avg_quality_score": sum(v["quality_score"] for v in comparison_data) / len(comparison_data) if comparison_data else 0,
                "avg_cost_per_record": sum(v["cost_per_record"] for v in comparison_data) / len(comparison_data) if comparison_data else 0,
                "avg_coverage": sum(v["coverage_percentage"] for v in comparison_data) / len(comparison_data) if comparison_data else 0
            },
            "filters_applied": filters or {}
        }
    
    @staticmethod
    def what_if_analysis(db: Session, current_vendor_id: int, new_vendor_id: int, 
                        annual_volume: int, assumptions: Dict = None) -> Dict[str, Any]:
        """What-if analysis for vendor switching"""
        
        current_vendor = db.query(Vendor).filter(Vendor.id == current_vendor_id).first()
        new_vendor = db.query(Vendor).filter(Vendor.id == new_vendor_id).first()
        
        if not current_vendor or not new_vendor:
            return {"error": "Invalid vendor IDs"}
        
        # Get current metrics
        current_metrics = ScoringEngine.calculate_vendor_quality_score(db, current_vendor_id)
        new_metrics = ScoringEngine.calculate_vendor_quality_score(db, new_vendor_id)
        
        # Calculate cost impact
        current_annual_cost = current_vendor.cost_per_record * annual_volume
        new_annual_cost = new_vendor.cost_per_record * annual_volume
        cost_savings = current_annual_cost - new_annual_cost
        
        # Calculate quality impact
        quality_delta = new_metrics["quality_score"] - current_metrics["quality_score"]
        
        # Calculate coverage impact
        coverage_delta = new_vendor.coverage_percentage - current_vendor.coverage_percentage
        
        # Get jurisdiction comparison
        current_jurisdictions = ScoringEngine.get_jurisdiction_performance(db, current_vendor_id)
        new_jurisdictions = ScoringEngine.get_jurisdiction_performance(db, new_vendor_id)
        
        # Find coverage differences
        coverage_comparison = []
        current_jur_map = {j["jurisdiction"]: j for j in current_jurisdictions}
        new_jur_map = {j["jurisdiction"]: j for j in new_jurisdictions}
        
        all_jurisdictions = set(current_jur_map.keys()) | set(new_jur_map.keys())
        
        for jur in all_jurisdictions:
            current = current_jur_map.get(jur, {"coverage_percentage": 0, "avg_turnaround_hours": 0})
            new = new_jur_map.get(jur, {"coverage_percentage": 0, "avg_turnaround_hours": 0})
            
            coverage_comparison.append({
                "jurisdiction": jur,
                "current_coverage": current["coverage_percentage"],
                "new_coverage": new["coverage_percentage"],
                "coverage_delta": new["coverage_percentage"] - current["coverage_percentage"],
                "current_turnaround": current["avg_turnaround_hours"],
                "new_turnaround": new["avg_turnaround_hours"],
                "turnaround_delta": new["avg_turnaround_hours"] - current["avg_turnaround_hours"]
            })
        
        # Calculate ROI
        roi_period = assumptions.get("roi_period_months", 12) if assumptions else 12
        monthly_savings = cost_savings / 12
        
        # Risk assessment
        risk_factors = []
        if quality_delta < -5:
            risk_factors.append("Significant quality decrease")
        if coverage_delta < -10:
            risk_factors.append("Major coverage reduction")
        if new_metrics["total_records"] < current_metrics["total_records"] * 0.5:
            risk_factors.append("Limited track record (fewer records)")
        
        return {
            "scenario": {
                "current_vendor": {
                    "id": current_vendor.id,
                    "name": current_vendor.name,
                    "cost_per_record": current_vendor.cost_per_record,
                    "quality_score": current_metrics["quality_score"],
                    "coverage_percentage": current_vendor.coverage_percentage
                },
                "new_vendor": {
                    "id": new_vendor.id,
                    "name": new_vendor.name,
                    "cost_per_record": new_vendor.cost_per_record,
                    "quality_score": new_metrics["quality_score"],
                    "coverage_percentage": new_vendor.coverage_percentage
                }
            },
            "financial_impact": {
                "annual_volume": annual_volume,
                "current_annual_cost": current_annual_cost,
                "new_annual_cost": new_annual_cost,
                "annual_savings": cost_savings,
                "monthly_savings": monthly_savings,
                "savings_percentage": (cost_savings / current_annual_cost * 100) if current_annual_cost > 0 else 0
            },
            "quality_impact": {
                "quality_delta": quality_delta,
                "current_quality_score": current_metrics["quality_score"],
                "new_quality_score": new_metrics["quality_score"],
                "quality_change_percentage": (quality_delta / current_metrics["quality_score"] * 100) if current_metrics["quality_score"] > 0 else 0
            },
            "coverage_impact": {
                "coverage_delta": coverage_delta,
                "current_coverage": current_vendor.coverage_percentage,
                "new_coverage": new_vendor.coverage_percentage,
                "coverage_comparison": coverage_comparison
            },
            "roi_analysis": {
                "payback_period_months": (cost_savings / monthly_savings) if monthly_savings > 0 else None,
                "annual_roi_percentage": (cost_savings / new_annual_cost * 100) if new_annual_cost > 0 else 0
            },
            "risk_assessment": {
                "risk_factors": risk_factors,
                "risk_level": "high" if len(risk_factors) >= 2 else "medium" if len(risk_factors) == 1 else "low"
            },
            "assumptions": assumptions or {}
        }
    
    @staticmethod
    def get_vendor_change_log(db: Session, vendor_id: int = None, days: int = 90) -> List[Dict]:
        """Get vendor schema change history"""
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        query = db.query(SchemaChange).join(Vendor)
        
        if vendor_id:
            query = query.filter(SchemaChange.vendor_id == vendor_id)
        
        changes = query.filter(
            SchemaChange.change_date >= cutoff_date
        ).order_by(SchemaChange.change_date.desc()).all()
        
        return [
            {
                "id": change.id,
                "vendor_id": change.vendor_id,
                "vendor_name": change.vendor.name,
                "change_description": change.change_description,
                "field_affected": change.field_affected,
                "old_value": change.old_value,
                "new_value": change.new_value,
                "records_affected": change.records_affected,
                "change_date": change.change_date.isoformat()
            }
            for change in changes
        ]
    
    @staticmethod
    def calculate_total_cost_of_ownership(db: Session, vendor_id: int, 
                                         annual_volume: int, years: int = 3) -> Dict[str, Any]:
        """Calculate total cost of ownership including quality factors"""
        
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            return {"error": "Vendor not found"}
        
        metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor_id)
        
        # Base costs
        annual_record_cost = vendor.cost_per_record * annual_volume
        total_record_cost = annual_record_cost * years
        
        # Quality-related costs (estimated)
        # Poor quality leads to rework, manual review, etc.
        quality_factor = (100 - metrics["quality_score"]) / 100
        annual_quality_cost = annual_record_cost * quality_factor * 0.2  # 20% of record cost as quality penalty
        total_quality_cost = annual_quality_cost * years
        
        # Coverage-related opportunity costs
        coverage_gap = 100 - vendor.coverage_percentage
        annual_coverage_cost = annual_record_cost * (coverage_gap / 100) * 0.1  # 10% opportunity cost
        total_coverage_cost = annual_coverage_cost * years
        
        total_tco = total_record_cost + total_quality_cost + total_coverage_cost
        
        return {
            "vendor_name": vendor.name,
            "analysis_period_years": years,
            "annual_volume": annual_volume,
            "cost_breakdown": {
                "record_costs": {
                    "annual": annual_record_cost,
                    "total": total_record_cost,
                    "per_record": vendor.cost_per_record
                },
                "quality_costs": {
                    "annual": annual_quality_cost,
                    "total": total_quality_cost,
                    "quality_factor": quality_factor
                },
                "coverage_costs": {
                    "annual": annual_coverage_cost,
                    "total": total_coverage_cost,
                    "coverage_gap": coverage_gap
                }
            },
            "total_cost_of_ownership": total_tco,
            "effective_cost_per_record": total_tco / (annual_volume * years),
            "metrics": metrics
        }
    
    @staticmethod
    def get_market_benchmarks(db: Session) -> Dict[str, Any]:
        """Get market benchmarks for comparison"""
        
        vendors = db.query(Vendor).filter(Vendor.is_active == True).all()
        
        if not vendors:
            return {"error": "No active vendors found"}
        
        # Calculate benchmarks
        quality_scores = []
        costs = []
        coverages = []
        
        for vendor in vendors:
            metrics = ScoringEngine.calculate_vendor_quality_score(db, vendor.id)
            quality_scores.append(metrics["quality_score"])
            costs.append(vendor.cost_per_record)
            coverages.append(vendor.coverage_percentage)
        
        return {
            "quality_benchmarks": {
                "min": min(quality_scores),
                "max": max(quality_scores),
                "median": sorted(quality_scores)[len(quality_scores) // 2],
                "average": sum(quality_scores) / len(quality_scores),
                "percentiles": {
                    "25th": sorted(quality_scores)[int(len(quality_scores) * 0.25)],
                    "75th": sorted(quality_scores)[int(len(quality_scores) * 0.75)],
                    "90th": sorted(quality_scores)[int(len(quality_scores) * 0.9)]
                }
            },
            "cost_benchmarks": {
                "min": min(costs),
                "max": max(costs),
                "median": sorted(costs)[len(costs) // 2],
                "average": sum(costs) / len(costs),
                "percentiles": {
                    "25th": sorted(costs)[int(len(costs) * 0.25)],
                    "75th": sorted(costs)[int(len(costs) * 0.75)],
                    "90th": sorted(costs)[int(len(costs) * 0.9)]
                }
            },
            "coverage_benchmarks": {
                "min": min(coverages),
                "max": max(coverages),
                "median": sorted(coverages)[len(coverages) // 2],
                "average": sum(coverages) / len(coverages),
                "percentiles": {
                    "25th": sorted(coverages)[int(len(coverages) * 0.25)],
                    "75th": sorted(coverages)[int(len(coverages) * 0.75)],
                    "90th": sorted(coverages)[int(len(coverages) * 0.9)]
                }
            },
            "market_size": len(vendors)
        }
