"""
Database Seeder Script for AI CreditGuard
Seeds realistic sample applications spanning LOW RISK, MEDIUM RISK, and HIGH RISK tiers.
"""

import sys
import os
import json
import uuid
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.database.connection import SessionLocal, init_db
from backend.database.models import ApplicationRecord
from backend.services.ml_service import MLService

DEMO_PROFILES = [
    {
        "name": "Sarah Jenkins - Prime Homeowner",
        "age": 42,
        "monthly_income": 9500.0,
        "employment_type": "Salaried",
        "years_of_employment": 9.5,
        "monthly_expenses": 3800.0,
        "existing_debt": 15000.0,
        "existing_emi": 520.0,
        "requested_loan_amount": 35000.0,
        "loan_tenure": 48,
        "credit_score": 790,
        "credit_history_length": 14.0,
        "number_of_previous_loans": 3,
        "number_of_previous_defaults": 0,
        "number_of_late_payments": 0,
        "credit_utilization": 14.5,
        "number_of_active_loans": 1,
        "savings_amount": 32000.0,
        "loan_purpose": "Home Improvement"
    },
    {
        "name": "David Chen - Tech Professional",
        "age": 31,
        "monthly_income": 8200.0,
        "employment_type": "Salaried",
        "years_of_employment": 5.0,
        "monthly_expenses": 3100.0,
        "existing_debt": 6000.0,
        "existing_emi": 240.0,
        "requested_loan_amount": 20000.0,
        "loan_tenure": 24,
        "credit_score": 755,
        "credit_history_length": 7.5,
        "number_of_previous_loans": 2,
        "number_of_previous_defaults": 0,
        "number_of_late_payments": 0,
        "credit_utilization": 18.0,
        "number_of_active_loans": 1,
        "savings_amount": 21000.0,
        "loan_purpose": "Auto Purchase"
    },
    {
        "name": "Elena Rostova - Small Business Founder",
        "age": 37,
        "monthly_income": 6200.0,
        "employment_type": "Business Owner",
        "years_of_employment": 4.0,
        "monthly_expenses": 3500.0,
        "existing_debt": 24000.0,
        "existing_emi": 850.0,
        "requested_loan_amount": 40000.0,
        "loan_tenure": 36,
        "credit_score": 660,
        "credit_history_length": 9.0,
        "number_of_previous_loans": 4,
        "number_of_previous_defaults": 0,
        "number_of_late_payments": 1,
        "credit_utilization": 48.0,
        "number_of_active_loans": 2,
        "savings_amount": 9500.0,
        "loan_purpose": "Business Venture"
    },
    {
        "name": "Marcus Vance - Freelance Designer",
        "age": 28,
        "monthly_income": 4100.0,
        "employment_type": "Freelancer",
        "years_of_employment": 2.5,
        "monthly_expenses": 2400.0,
        "existing_debt": 18000.0,
        "existing_emi": 620.0,
        "requested_loan_amount": 22000.0,
        "loan_tenure": 36,
        "credit_score": 625,
        "credit_history_length": 4.5,
        "number_of_previous_loans": 3,
        "number_of_previous_defaults": 0,
        "number_of_late_payments": 2,
        "credit_utilization": 64.0,
        "number_of_active_loans": 2,
        "savings_amount": 3400.0,
        "loan_purpose": "Debt Consolidation"
    },
    {
        "name": "Robert Miller - High Debt Consolidation",
        "age": 45,
        "monthly_income": 3400.0,
        "employment_type": "Salaried",
        "years_of_employment": 1.5,
        "monthly_expenses": 2600.0,
        "existing_debt": 36000.0,
        "existing_emi": 1100.0,
        "requested_loan_amount": 35000.0,
        "loan_tenure": 36,
        "credit_score": 530,
        "credit_history_length": 5.0,
        "number_of_previous_loans": 6,
        "number_of_previous_defaults": 2,
        "number_of_late_payments": 4,
        "credit_utilization": 86.5,
        "number_of_active_loans": 4,
        "savings_amount": 950.0,
        "loan_purpose": "Debt Consolidation"
    },
    {
        "name": "Priya Sharma - Medical Resident",
        "age": 29,
        "monthly_income": 5800.0,
        "employment_type": "Salaried",
        "years_of_employment": 3.0,
        "monthly_expenses": 2700.0,
        "existing_debt": 28000.0,
        "existing_emi": 450.0,
        "requested_loan_amount": 15000.0,
        "loan_tenure": 36,
        "credit_score": 710,
        "credit_history_length": 6.0,
        "number_of_previous_loans": 2,
        "number_of_previous_defaults": 0,
        "number_of_late_payments": 0,
        "credit_utilization": 32.0,
        "number_of_active_loans": 1,
        "savings_amount": 8000.0,
        "loan_purpose": "Education"
    },
    {
        "name": "Jason Taylor - Subprime Recovery",
        "age": 36,
        "monthly_income": 2800.0,
        "employment_type": "Contract",
        "years_of_employment": 0.8,
        "monthly_expenses": 2200.0,
        "existing_debt": 22000.0,
        "existing_emi": 720.0,
        "requested_loan_amount": 18000.0,
        "loan_tenure": 24,
        "credit_score": 490,
        "credit_history_length": 3.5,
        "number_of_previous_loans": 5,
        "number_of_previous_defaults": 3,
        "number_of_late_payments": 6,
        "credit_utilization": 92.0,
        "number_of_active_loans": 3,
        "savings_amount": 400.0,
        "loan_purpose": "Medical Emergency"
    }
]


def seed():
    init_db()
    db = SessionLocal()
    ml_service = MLService()

    print(f"Seeding demo applicant profiles...")
    now = datetime.now(timezone.utc)

    for i, profile in enumerate(DEMO_PROFILES):
        name = profile.pop("name", f"Applicant {i+1}")
        pred = ml_service.predict_and_explain(profile)

        record = ApplicationRecord(
            applicant_id=f"CG-2026-DEMO{i+1:02d}",
            created_at=now - timedelta(days=(len(DEMO_PROFILES) - i) * 2, hours=i * 3),
            age=profile['age'],
            monthly_income=profile['monthly_income'],
            employment_type=profile['employment_type'],
            years_of_employment=profile['years_of_employment'],
            monthly_expenses=profile['monthly_expenses'],
            existing_debt=profile['existing_debt'],
            existing_emi=profile['existing_emi'],
            requested_loan_amount=profile['requested_loan_amount'],
            loan_tenure=profile['loan_tenure'],
            credit_score=profile['credit_score'],
            credit_history_length=profile['credit_history_length'],
            number_of_previous_loans=profile['number_of_previous_loans'],
            number_of_previous_defaults=profile['number_of_previous_defaults'],
            number_of_late_payments=profile['number_of_late_payments'],
            credit_utilization=profile['credit_utilization'],
            number_of_active_loans=profile['number_of_active_loans'],
            savings_amount=profile['savings_amount'],
            loan_purpose=profile['loan_purpose'],
            risk_score=pred['risk_score'],
            default_probability=pred['default_probability'],
            risk_category=pred['risk_category'],
            review_recommendation=pred['review_recommendation'],
            review_action=pred['review_action'],
            risk_factors_json=json.dumps(pred['risk_factors']),
            positive_factors_json=json.dumps(pred['positive_factors']),
            feature_impacts_json=json.dumps(pred['feature_impacts']),
            financial_ratios_json=json.dumps(pred['financial_ratios']),
            status="MANUAL_REVIEW" if pred['risk_category'] != "LOW RISK" else "APPROVED"
        )
        db.add(record)

    db.commit()
    db.close()
    print("Database seeding completed successfully.")


if __name__ == '__main__':
    seed()
