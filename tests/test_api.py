"""
Unit and Integration Tests for AI CreditGuard API
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app

client = TestClient(app)

SAMPLE_APPLICANT = {
    "age": 35,
    "monthly_income": 7500.0,
    "employment_type": "Salaried",
    "years_of_employment": 6.0,
    "monthly_expenses": 3200.0,
    "existing_debt": 8000.0,
    "existing_emi": 350.0,
    "requested_loan_amount": 20000.0,
    "loan_tenure": 36,
    "credit_score": 760,
    "credit_history_length": 10.0,
    "number_of_previous_loans": 3,
    "number_of_previous_defaults": 0,
    "number_of_late_payments": 0,
    "credit_utilization": 22.0,
    "number_of_active_loans": 1,
    "savings_amount": 18000.0,
    "loan_purpose": "Home Improvement"
}


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_predict_endpoint_valid():
    response = client.post("/api/predict", json=SAMPLE_APPLICANT)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "default_probability" in data
    assert "risk_category" in data
    assert "risk_factors" in data
    assert "positive_factors" in data
    assert "feature_impacts" in data
    assert data["risk_category"] in ["LOW RISK", "MEDIUM RISK", "HIGH RISK"]
    assert 0 <= data["risk_score"] <= 100
    assert 0.0 <= data["default_probability"] <= 1.0


def test_predict_validation_error():
    # Invalid credit score (below 300)
    bad_data = SAMPLE_APPLICANT.copy()
    bad_data["credit_score"] = 250
    response = client.post("/api/predict", json=bad_data)
    assert response.status_code == 422


def test_create_and_fetch_application():
    payload = {"applicant": SAMPLE_APPLICANT}
    create_res = client.post("/api/applications", json=payload)
    assert create_res.status_code == 200
    app_data = create_res.json()
    assert "applicant_id" in app_data
    app_id = app_data["applicant_id"]

    # Fetch by applicant ID
    get_res = client.get(f"/api/applications/{app_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["applicant_id"] == app_id
    assert fetched["risk_category"] == app_data["risk_category"]


def test_dashboard_endpoint():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_applications" in data
    assert "category_distribution" in data
    assert "feature_importance" in data


def test_model_metrics_endpoint():
    response = client.get("/api/model-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "best_model_name" in data
    assert "all_models_evaluations" in data
    assert "Logistic Regression" in data["all_models_evaluations"]
    assert "Random Forest" in data["all_models_evaluations"]
    assert "XGBoost" in data["all_models_evaluations"]
