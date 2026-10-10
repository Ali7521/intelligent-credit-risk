"""
SQLAlchemy Database Models for AI CreditGuard
Stores applicant information, credit profile, ML prediction outcomes, and SHAP factors.
"""

from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, Float, String, DateTime, Text
from backend.database.connection import Base


class ApplicationRecord(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    applicant_id = Column(String(64), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Applicant Information
    age = Column(Integer, nullable=False)
    monthly_income = Column(Float, nullable=False)
    employment_type = Column(String(64), nullable=False)
    years_of_employment = Column(Float, nullable=False)
    monthly_expenses = Column(Float, nullable=False)
    existing_debt = Column(Float, nullable=False)
    existing_emi = Column(Float, nullable=False)
    requested_loan_amount = Column(Float, nullable=False)
    loan_tenure = Column(Integer, nullable=False)
    credit_score = Column(Integer, nullable=False)
    credit_history_length = Column(Float, nullable=False)
    number_of_previous_loans = Column(Integer, nullable=False)
    number_of_previous_defaults = Column(Integer, nullable=False)
    number_of_late_payments = Column(Integer, nullable=False)
    credit_utilization = Column(Float, nullable=False)
    number_of_active_loans = Column(Integer, nullable=False)
    savings_amount = Column(Float, nullable=False)
    loan_purpose = Column(String(64), nullable=False)

    # Prediction Outputs
    risk_score = Column(Integer, nullable=False)
    default_probability = Column(Float, nullable=False)
    risk_category = Column(String(32), nullable=False, index=True)
    review_recommendation = Column(Text, nullable=False)
    review_action = Column(String(64), nullable=False)

    # Serialized Explainable AI data and Financial Ratios
    risk_factors_json = Column(Text, nullable=False, default="[]")
    positive_factors_json = Column(Text, nullable=False, default="[]")
    feature_impacts_json = Column(Text, nullable=False, default="[]")
    financial_ratios_json = Column(Text, nullable=False, default="{}")

    # Workflow Status
    status = Column(String(32), default="PENDING_REVIEW")

    @property
    def risk_factors(self):
        try:
            return json.loads(self.risk_factors_json)
        except Exception:
            return []

    @property
    def positive_factors(self):
        try:
            return json.loads(self.positive_factors_json)
        except Exception:
            return []

    @property
    def feature_impacts(self):
        try:
            return json.loads(self.feature_impacts_json)
        except Exception:
            return []

    @property
    def financial_ratios(self):
        try:
            return json.loads(self.financial_ratios_json)
        except Exception:
            return {}
