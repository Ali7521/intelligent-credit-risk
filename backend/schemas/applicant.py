"""
Pydantic Schemas for AI CreditGuard
Comprehensive input data validation and structured API responses.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class ApplicantInput(BaseModel):
    # Personal Information
    age: int = Field(..., ge=18, le=95, description="Applicant age in years (18-95)")
    loan_purpose: str = Field(..., description="Stated purpose for loan")

    # Employment & Income
    monthly_income: float = Field(..., gt=0, le=500000, description="Gross monthly income in USD")
    employment_type: str = Field(..., description="Type of employment")
    years_of_employment: float = Field(..., ge=0, le=60, description="Tenure in years at current employment")

    # Debt & Expenses
    monthly_expenses: float = Field(..., ge=0, description="Monthly fixed living expenditures")
    existing_debt: float = Field(..., ge=0, description="Total outstanding debt balance across all facilities")
    existing_emi: float = Field(..., ge=0, description="Current monthly debt service / EMI payments")
    savings_amount: float = Field(..., ge=0, description="Total verified liquid emergency savings reserve")

    # Credit History
    credit_score: int = Field(..., ge=300, le=850, description="Credit Bureau Score (FICO/CIBIL scale 300-850)")
    credit_history_length: float = Field(..., ge=0, le=60, description="Length of credit bureau file in years")
    number_of_previous_loans: int = Field(..., ge=0, le=50, description="Historical closed and open loans count")
    number_of_previous_defaults: int = Field(..., ge=0, le=20, description="Count of past credit defaults or write-offs")
    number_of_late_payments: int = Field(..., ge=0, le=50, description="Count of past 30+ day delinquency occurrences")
    credit_utilization: float = Field(..., ge=0.0, le=100.0, description="Revolving credit balance utilization percentage")
    number_of_active_loans: int = Field(..., ge=0, le=30, description="Currently active credit facilities")

    # Loan Information
    requested_loan_amount: float = Field(..., gt=0, le=500000, description="Principal loan amount requested")
    loan_tenure: int = Field(..., ge=3, le=180, description="Loan repayment tenure in months")

    @field_validator('employment_type')
    @classmethod
    def validate_emp_type(cls, v: str) -> str:
        valid = {'Salaried', 'Self-Employed', 'Business Owner', 'Freelancer', 'Contract', 'Unemployed'}
        if v not in valid:
            # Normalize casing
            for item in valid:
                if item.lower() == v.lower():
                    return item
            raise ValueError(f"Invalid employment_type '{v}'. Must be one of: {sorted(valid)}")
        return v

    @field_validator('loan_purpose')
    @classmethod
    def validate_purpose(cls, v: str) -> str:
        valid = {
            'Debt Consolidation', 'Home Improvement', 'Business Venture',
            'Education', 'Medical Emergency', 'Auto Purchase', 'Personal'
        }
        if v not in valid:
            for item in valid:
                if item.lower() == v.lower():
                    return item
            raise ValueError(f"Invalid loan_purpose '{v}'. Must be one of: {sorted(valid)}")
        return v


class FeatureImpactItem(BaseModel):
    feature_id: str
    feature_name: str
    impact: float
    raw_value: Optional[Any] = None
    is_risk_increasing: bool


class FinancialRatios(BaseModel):
    debt_to_income: float
    expense_to_income: float
    loan_to_income: float
    savings_to_loan: float
    credit_burden_ratio: float


class PredictionResponse(BaseModel):
    risk_score: int = Field(..., description="Calibrated credit score index (0-100, where higher is safer)")
    risk_category: str = Field(..., description="LOW RISK | MEDIUM RISK | HIGH RISK")
    default_probability: float = Field(..., description="Estimated probability of loan default (0.0 to 1.0)")
    default_probability_percentage: float = Field(..., description="Default probability as percentage (0-100%)")
    risk_factors: List[str] = Field(..., description="Key factors escalating risk derived from SHAP attribution")
    positive_factors: List[str] = Field(..., description="Protective factors mitigating risk derived from SHAP attribution")
    feature_impacts: List[FeatureImpactItem] = Field(..., description="Granular SHAP local explanations")
    financial_ratios: FinancialRatios
    review_recommendation: str
    review_action: str
    model_metadata: Dict[str, Any]


class ApplicationCreateRequest(BaseModel):
    applicant: ApplicantInput
    notes: Optional[str] = None


class ApplicationDetailResponse(BaseModel):
    id: int
    applicant_id: str
    created_at: datetime
    age: int
    monthly_income: float
    employment_type: str
    years_of_employment: float
    monthly_expenses: float
    existing_debt: float
    existing_emi: float
    requested_loan_amount: float
    loan_tenure: int
    credit_score: int
    credit_history_length: float
    number_of_previous_loans: int
    number_of_previous_defaults: int
    number_of_late_payments: int
    credit_utilization: float
    number_of_active_loans: int
    savings_amount: float
    loan_purpose: str
    risk_score: int
    default_probability: float
    risk_category: str
    review_recommendation: str
    review_action: str
    risk_factors: List[str]
    positive_factors: List[str]
    feature_impacts: List[Dict[str, Any]]
    financial_ratios: Dict[str, Any]
    status: str


class DashboardSummary(BaseModel):
    total_applications: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    avg_risk_score: float
    avg_default_probability: float
    category_distribution: List[Dict[str, Any]]
    default_prob_distribution: List[Dict[str, Any]]
    credit_score_vs_risk: List[Dict[str, Any]]
    income_vs_risk: List[Dict[str, Any]]
    dti_vs_risk: List[Dict[str, Any]]
    feature_importance: List[Dict[str, Any]]
