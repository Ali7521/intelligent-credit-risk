"""
Applications API Route
Handles application creation, listing, searching, filtering, and retrieval.
"""

import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.database.connection import get_db
from backend.database.models import ApplicationRecord
from backend.schemas.applicant import (
    ApplicationCreateRequest,
    ApplicationDetailResponse,
    ApplicantInput
)
from backend.services.ml_service import MLService
from backend.routes.predict import get_ml_service

router = APIRouter()


@router.post("/applications", response_model=ApplicationDetailResponse, summary="Submit and Assess Credit Application")
def create_application(
    payload: ApplicationCreateRequest,
    db: Session = Depends(get_db),
    ml_service: MLService = Depends(get_ml_service)
):
    """
    Evaluates applicant profile using ML model, derives SHAP explanations,
    and persists the complete assessed loan record into the database.
    """
    applicant_data = payload.applicant.model_dump()

    # Generate ML prediction and explainability
    pred = ml_service.predict_and_explain(applicant_data)

    # Generate unique business applicant identifier
    short_uuid = uuid.uuid4().hex[:8].upper()
    applicant_id = f"CG-2026-{short_uuid}"

    record = ApplicationRecord(
        applicant_id=applicant_id,
        created_at=datetime.now(timezone.utc),
        age=applicant_data['age'],
        monthly_income=applicant_data['monthly_income'],
        employment_type=applicant_data['employment_type'],
        years_of_employment=applicant_data['years_of_employment'],
        monthly_expenses=applicant_data['monthly_expenses'],
        existing_debt=applicant_data['existing_debt'],
        existing_emi=applicant_data['existing_emi'],
        requested_loan_amount=applicant_data['requested_loan_amount'],
        loan_tenure=applicant_data['loan_tenure'],
        credit_score=applicant_data['credit_score'],
        credit_history_length=applicant_data['credit_history_length'],
        number_of_previous_loans=applicant_data['number_of_previous_loans'],
        number_of_previous_defaults=applicant_data['number_of_previous_defaults'],
        number_of_late_payments=applicant_data['number_of_late_payments'],
        credit_utilization=applicant_data['credit_utilization'],
        number_of_active_loans=applicant_data['number_of_active_loans'],
        savings_amount=applicant_data['savings_amount'],
        loan_purpose=applicant_data['loan_purpose'],
        risk_score=pred['risk_score'],
        default_probability=pred['default_probability'],
        risk_category=pred['risk_category'],
        review_recommendation=pred['review_recommendation'],
        review_action=pred['review_action'],
        risk_factors_json=json.dumps(pred['risk_factors']),
        positive_factors_json=json.dumps(pred['positive_factors']),
        feature_impacts_json=json.dumps(pred['feature_impacts']),
        financial_ratios_json=json.dumps(pred['financial_ratios']),
        status="UNDER_EVALUATION"
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_application_response(record)


@router.get("/applications", response_model=List[ApplicationDetailResponse], summary="List Evaluated Credit Applications")
def list_applications(
    category: Optional[str] = Query(None, description="Filter by risk category: LOW RISK, MEDIUM RISK, HIGH RISK"),
    search: Optional[str] = Query(None, description="Search by applicant ID, purpose, or employment"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns paginated list of credit assessments with filtering options.
    """
    query = db.query(ApplicationRecord)

    if category:
        query = query.filter(ApplicationRecord.risk_category == category.upper())

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ApplicationRecord.applicant_id.ilike(search_filter)) |
            (ApplicationRecord.loan_purpose.ilike(search_filter)) |
            (ApplicationRecord.employment_type.ilike(search_filter))
        )

    records = query.order_by(desc(ApplicationRecord.created_at)).offset(offset).limit(limit).all()
    return [_format_application_response(r) for r in records]


@router.get("/applications/{id}", response_model=ApplicationDetailResponse, summary="Get Application Details")
def get_application_by_id(
    id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves full underwriting profile and SHAP explanation for a specific assessment.
    Supports lookup by integer primary key or applicant_id string.
    """
    if id.isdigit():
        record = db.query(ApplicationRecord).filter(ApplicationRecord.id == int(id)).first()
    else:
        record = db.query(ApplicationRecord).filter(ApplicationRecord.applicant_id == id).first()

    if not record:
        raise HTTPException(status_code=404, detail=f"Application record '{id}' not found.")

    return _format_application_response(record)


def _format_application_response(record: ApplicationRecord) -> dict:
    return {
        "id": record.id,
        "applicant_id": record.applicant_id,
        "created_at": record.created_at,
        "age": record.age,
        "monthly_income": record.monthly_income,
        "employment_type": record.employment_type,
        "years_of_employment": record.years_of_employment,
        "monthly_expenses": record.monthly_expenses,
        "existing_debt": record.existing_debt,
        "existing_emi": record.existing_emi,
        "requested_loan_amount": record.requested_loan_amount,
        "loan_tenure": record.loan_tenure,
        "credit_score": record.credit_score,
        "credit_history_length": record.credit_history_length,
        "number_of_previous_loans": record.number_of_previous_loans,
        "number_of_previous_defaults": record.number_of_previous_defaults,
        "number_of_late_payments": record.number_of_late_payments,
        "credit_utilization": record.credit_utilization,
        "number_of_active_loans": record.number_of_active_loans,
        "savings_amount": record.savings_amount,
        "loan_purpose": record.loan_purpose,
        "risk_score": record.risk_score,
        "default_probability": record.default_probability,
        "risk_category": record.risk_category,
        "review_recommendation": record.review_recommendation,
        "review_action": record.review_action,
        "risk_factors": record.risk_factors,
        "positive_factors": record.positive_factors,
        "feature_impacts": record.feature_impacts,
        "financial_ratios": record.financial_ratios,
        "status": record.status or "UNDER_REVIEW"
    }
