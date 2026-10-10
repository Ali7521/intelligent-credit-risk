"""
Test Runner using Python's standard unittest module
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app

class CreditGuardAPITestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.sample = {
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

    def test_01_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_02_predict_valid(self):
        res = self.client.post("/api/predict", json=self.sample)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("risk_score", data)
        self.assertIn("default_probability", data)
        self.assertIn(data["risk_category"], ["LOW RISK", "MEDIUM RISK", "HIGH RISK"])
        self.assertTrue(len(data["risk_factors"]) > 0)
        self.assertTrue(len(data["positive_factors"]) > 0)
        self.assertTrue(len(data["feature_impacts"]) > 0)

    def test_03_predict_validation(self):
        bad_data = self.sample.copy()
        bad_data["credit_score"] = 250  # Must be 300-850
        res = self.client.post("/api/predict", json=bad_data)
        self.assertEqual(res.status_code, 422)

    def test_04_create_and_fetch_application(self):
        payload = {"applicant": self.sample}
        create_res = self.client.post("/api/applications", json=payload)
        self.assertEqual(create_res.status_code, 200)
        app_data = create_res.json()
        self.assertIn("applicant_id", app_data)
        app_id = app_data["applicant_id"]

        get_res = self.client.get(f"/api/applications/{app_id}")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.json()["applicant_id"], app_id)

    def test_05_dashboard_metrics(self):
        res = self.client.get("/api/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_applications", data)
        self.assertIn("category_distribution", data)
        self.assertIn("feature_importance", data)

    def test_06_model_benchmark_metrics(self):
        res = self.client.get("/api/model-metrics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("best_model_name", data)
        self.assertIn("all_models_evaluations", data)
        self.assertIn("Logistic Regression", data["all_models_evaluations"])
        self.assertIn("Random Forest", data["all_models_evaluations"])
        self.assertIn("XGBoost", data["all_models_evaluations"])


if __name__ == "__main__":
    unittest.main()
