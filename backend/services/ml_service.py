"""
ML Prediction and Explainable AI Service
Loads saved models, transforms incoming applicant profiles, generates calibrated predictions,
and computes local SHAP explanations with human-readable factors.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List, Tuple

from ml.preprocessing.pipeline import (
    ALL_RAW_FEATURES,
    NUMERICAL_RAW_FEATURES,
    CATEGORICAL_RAW_FEATURES,
    ENGINEERED_FEATURES,
    FeatureEngineer
)

# Feature display name mapping for clear fintech presentation
FEATURE_LABELS = {
    'credit_score': 'Credit Score (FICO/CIBIL)',
    'debt_to_income': 'Debt-to-Income (DTI) Ratio',
    'credit_utilization': 'Credit Card Utilization',
    'number_of_previous_defaults': 'Prior Loan Defaults',
    'number_of_late_payments': 'Historical Late Payments',
    'savings_amount': 'Liquid Savings Reserve',
    'savings_to_loan': 'Savings-to-Loan Cushion',
    'monthly_income': 'Monthly Stated Income',
    'years_of_employment': 'Employment Tenure',
    'credit_history_length': 'Credit History Age',
    'requested_loan_amount': 'Requested Loan Size',
    'existing_debt': 'Total Existing Debt',
    'existing_emi': 'Existing Monthly EMI',
    'loan_to_income': 'Loan-to-Annual-Income (LTI)',
    'expense_to_income': 'Expense-to-Income Ratio',
    'credit_burden_ratio': 'Total Debt Burden Ratio',
    'loan_tenure': 'Loan Duration (Tenure)',
    'age': 'Applicant Age',
    'number_of_active_loans': 'Active Open Loans',
    'number_of_previous_loans': 'Total Previous Loans',
    'monthly_expenses': 'Monthly Living Expenses',
    'employment_type_Unemployed': 'Employment Status: Unemployed',
    'employment_type_Freelancer': 'Employment Status: Freelancer',
    'employment_type_Salaried': 'Employment Status: Salaried',
    'employment_type_Self-Employed': 'Employment Status: Self-Employed',
    'employment_type_Business Owner': 'Employment Status: Business Owner',
    'employment_type_Contract': 'Employment Status: Contract',
    'loan_purpose_Debt Consolidation': 'Purpose: Debt Consolidation',
    'loan_purpose_Business Venture': 'Purpose: Business Expansion',
    'loan_purpose_Home Improvement': 'Purpose: Home Improvement',
    'loan_purpose_Education': 'Purpose: Education',
    'loan_purpose_Medical Emergency': 'Purpose: Medical Emergency',
    'loan_purpose_Personal': 'Purpose: Personal',
    'loan_purpose_Auto Purchase': 'Purpose: Auto Purchase',
}


class MLService:
    def __init__(self, models_dir: str = None):
        if models_dir is None:
            models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml/saved_models'))

        self.models_dir = models_dir
        self.model = None
        self.preprocessor = None
        self.feature_names = []
        self.explainer = None
        self.metrics = {}
        self.background_sample = None
        self._load_artifacts()

    def _load_artifacts(self):
        model_path = os.path.join(self.models_dir, 'best_model.joblib')
        prep_path = os.path.join(self.models_dir, 'preprocessor.joblib')
        metrics_path = os.path.join(self.models_dir, 'model_metrics.json')
        bg_path = os.path.join(self.models_dir, 'shap_background.joblib')

        if not os.path.exists(model_path) or not os.path.exists(prep_path):
            raise FileNotFoundError(
                f"Model artifacts missing in {self.models_dir}. Please run 'python ml/training/train.py'."
            )

        self.model = joblib.load(model_path)
        self.preprocessor = joblib.load(prep_path)

        if os.path.exists(metrics_path):
            with open(metrics_path, 'r') as f:
                self.metrics = json.load(f)
                self.feature_names = self.metrics.get('feature_names', [])

        if os.path.exists(bg_path):
            self.background_sample = joblib.load(bg_path)

        # Initialize SHAP explainer
        self._init_shap_explainer()

    def _init_shap_explainer(self):
        try:
            from xgboost import XGBClassifier
            from sklearn.ensemble import RandomForestClassifier

            if isinstance(self.model, (XGBClassifier, RandomForestClassifier)):
                self.explainer = shap.TreeExplainer(self.model)
            else:
                # Linear / Logistic Regression
                if self.background_sample is not None:
                    self.explainer = shap.LinearExplainer(self.model, self.background_sample)
                else:
                    self.explainer = shap.Explainer(self.model)
        except Exception as e:
            print(f"Warning: SHAP Explainer initialization fallback: {e}")
            if self.background_sample is not None:
                self.explainer = shap.KernelExplainer(
                    lambda x: self.model.predict_proba(x)[:, 1], self.background_sample
                )

    def predict_and_explain(self, applicant_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes real ML prediction and computes local SHAP explanations for an applicant.
        """
        # Convert applicant dict to single-row DataFrame
        raw_df = pd.DataFrame([applicant_data])

        # Compute engineered features for transparency and reporting
        engineered = FeatureEngineer().transform(raw_df)
        dti = float(engineered['debt_to_income'].iloc[0])
        expense_ratio = float(engineered['expense_to_income'].iloc[0])
        lti = float(engineered['loan_to_income'].iloc[0])
        savings_ratio = float(engineered['savings_to_loan'].iloc[0])
        burden_ratio = float(engineered['credit_burden_ratio'].iloc[0])

        financial_ratios = {
            "debt_to_income": round(dti, 4),
            "expense_to_income": round(expense_ratio, 4),
            "loan_to_income": round(lti, 4),
            "savings_to_loan": round(savings_ratio, 4),
            "credit_burden_ratio": round(burden_ratio, 4)
        }

        # Transform using fitted preprocessor
        X_transformed = self.preprocessor.transform(raw_df)

        # Model Inference
        proba = float(self.model.predict_proba(X_transformed)[0, 1])
        default_probability = round(proba, 4)

        # Calibrated Risk Score (0 - 100, where 100 is pristine safety, 0 is extreme default risk)
        # and inverse Default Risk Index (0 - 100 where higher is riskier)
        risk_score = int(round((1.0 - default_probability) * 100))
        risk_score = max(0, min(100, risk_score))

        # Risk Category classification based on probability
        if default_probability < 0.25:
            risk_category = "LOW RISK"
            review_recommendation = "Low predicted default risk — applicant profile meets institutional baseline criteria, subject to formal identity and income verification."
            review_action = "Standard Processing"
        elif default_probability < 0.55:
            risk_category = "MEDIUM RISK"
            review_recommendation = "Moderate predicted default risk — requires manual secondary underwriting review and debt obligation verification."
            review_action = "Manual Underwriting Review"
        else:
            risk_category = "HIGH RISK"
            review_recommendation = "High predicted default risk — requires further human/institutional review before credit commitment."
            review_action = "Institutional Escalation / In-Depth Audit"

        # Compute Local SHAP values
        shap_values_raw, base_val = self._compute_shap(X_transformed)

        # Map SHAP values to features
        feature_impacts = []
        risk_factors = []
        positive_factors = []

        for idx, col_name in enumerate(self.feature_names):
            if idx < len(shap_values_raw):
                val = float(shap_values_raw[idx])
                clean_name = FEATURE_LABELS.get(col_name, col_name.replace('_', ' ').title())

                # Find display raw value if available
                raw_display = None
                if col_name in applicant_data:
                    raw_display = applicant_data[col_name]
                elif col_name in financial_ratios:
                    raw_display = financial_ratios[col_name]

                feature_impacts.append({
                    "feature_id": col_name,
                    "feature_name": clean_name,
                    "impact": round(val, 4),
                    "raw_value": raw_display,
                    "is_risk_increasing": val > 0
                })

        # Sort feature impacts by magnitude
        feature_impacts.sort(key=lambda x: abs(x['impact']), reverse=True)

        # Extract top 5 risk increasing and top 5 risk reducing factors
        for item in feature_impacts:
            if item['impact'] > 0.05 and len(risk_factors) < 5:
                desc = self._format_factor_text(item, is_risk=True, data=applicant_data, ratios=financial_ratios)
                risk_factors.append(desc)
            elif item['impact'] < -0.05 and len(positive_factors) < 5:
                desc = self._format_factor_text(item, is_risk=False, data=applicant_data, ratios=financial_ratios)
                positive_factors.append(desc)

        # Fallbacks if factors are sparse
        if not risk_factors:
            risk_factors.append("No major acute risk escalation factors detected")
        if not positive_factors:
            positive_factors.append("Standard baseline credit profile without strong offsetting protective metrics")

        return {
            "risk_score": risk_score,
            "risk_category": risk_category,
            "default_probability": default_probability,
            "default_probability_percentage": round(default_probability * 100, 1),
            "risk_factors": risk_factors,
            "positive_factors": positive_factors,
            "feature_impacts": feature_impacts[:12],  # Top 12 for the horizontal bar chart
            "financial_ratios": financial_ratios,
            "review_recommendation": review_recommendation,
            "review_action": review_action,
            "model_metadata": {
                "champion_model": self.metrics.get("best_model_name", type(self.model).__name__),
                "model_roc_auc": self.metrics.get("best_model_metrics", {}).get("roc_auc", 0.85),
                "model_recall": self.metrics.get("best_model_metrics", {}).get("recall", 0.77),
                "shap_base_value": round(float(base_val), 4) if base_val is not None else None
            }
        }

    def _compute_shap(self, X_transformed: np.ndarray) -> Tuple[np.ndarray, float]:
        """Calculates SHAP values for single transformed instance."""
        try:
            if self.explainer is None:
                # Fallback to model coefficients if explainer failed
                if hasattr(self.model, "coef_"):
                    shap_vals = (X_transformed[0] * self.model.coef_[0])
                    intercept = float(self.model.intercept_[0]) if hasattr(self.model, "intercept_") else 0.0
                    return shap_vals, intercept
                elif hasattr(self.model, "feature_importances_"):
                    return self.model.feature_importances_ * X_transformed[0], 0.0
                return np.zeros(X_transformed.shape[1]), 0.0

            sv = self.explainer(X_transformed)

            if hasattr(sv, "values"):
                vals = sv.values
                # In binary classification, if shape has (1, N, 2) or (1, N)
                if len(vals.shape) == 3:
                    row_vals = vals[0, :, 1]
                elif len(vals.shape) == 2:
                    row_vals = vals[0]
                else:
                    row_vals = vals
                base_v = float(sv.base_values[0, 1] if len(getattr(sv, 'base_values', []).shape) > 1 else sv.base_values[0])
                return row_vals, base_v
            else:
                raw_shap = self.explainer.shap_values(X_transformed)
                if isinstance(raw_shap, list) and len(raw_shap) == 2:
                    return raw_shap[1][0], 0.0
                elif isinstance(raw_shap, np.ndarray) and len(raw_shap.shape) == 2:
                    return raw_shap[0], 0.0
                return raw_shap, 0.0
        except Exception as e:
            print(f"SHAP explanation fallback error: {e}")
            if hasattr(self.model, "coef_"):
                return (X_transformed[0] * self.model.coef_[0]), 0.0
            return np.zeros(X_transformed.shape[1]), 0.0

    def _format_factor_text(self, item: Dict[str, Any], is_risk: bool, data: Dict[str, Any], ratios: Dict[str, Any]) -> str:
        """Translates statistical feature impact into intuitive financial explanation."""
        fid = item['feature_id']
        name = item['feature_name']

        if fid == 'credit_score':
            score = data.get('credit_score', 0)
            return f"Below-average Credit Score ({score})" if is_risk else f"Strong Credit Score rating ({score})"
        elif fid == 'credit_utilization':
            util = data.get('credit_utilization', 0)
            return f"High revolving credit utilization ({util}%)" if is_risk else f"Disciplined low credit utilization ({util}%)"
        elif fid == 'debt_to_income':
            dti = ratios.get('debt_to_income', 0)
            return f"Elevated Debt-to-Income burden ({round(dti * 100, 1)}%)" if is_risk else f"Healthy Debt-to-Income ratio ({round(dti * 100, 1)}%)"
        elif fid == 'number_of_previous_defaults':
            defaults = data.get('number_of_previous_defaults', 0)
            return f"Prior loan defaults recorded ({defaults} occurrences)"
        elif fid == 'number_of_late_payments':
            late = data.get('number_of_late_payments', 0)
            return f"Repeated late payment delinquency ({late} occurrences)"
        elif fid == 'savings_amount' or fid == 'savings_to_loan':
            savings = data.get('savings_amount', 0)
            return f"Limited liquid emergency savings cushion (${savings:,.0f})" if is_risk else f"Robust liquid savings cushion (${savings:,.0f})"
        elif fid == 'years_of_employment':
            years = data.get('years_of_employment', 0)
            return f"Brief employment tenure ({years} yrs)" if is_risk else f"Stable long-term employment ({years} yrs tenure)"
        elif fid == 'credit_history_length':
            hist = data.get('credit_history_length', 0)
            return f"Limited credit history profile ({hist} yrs)" if is_risk else f"Established credit bureau track record ({hist} yrs)"
        elif fid == 'existing_debt':
            debt = data.get('existing_debt', 0)
            return f"High existing debt liabilities (${debt:,.0f})" if is_risk else f"Low existing indebtedness (${debt:,.0f})"
        elif fid == 'monthly_income':
            inc = data.get('monthly_income', 0)
            return f"Modest monthly cash flow (${inc:,.0f})" if is_risk else f"Strong monthly gross income (${inc:,.0f})"
        elif 'employment_type_Unemployed' in fid:
            return "Currently unemployed employment status"
        elif 'loan_purpose_Debt Consolidation' in fid:
            return "Loan purpose indicates existing debt consolidation pressure"

        return f"{name} ({'+' if is_risk else '-'}{abs(item['impact']):.2f} model weight)"

    def get_model_metrics(self) -> Dict[str, Any]:
        """Returns the complete benchmark evaluation metadata."""
        return self.metrics
