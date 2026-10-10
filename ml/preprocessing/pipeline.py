"""
Credit Risk Data Preprocessing and Feature Engineering Pipeline
Handles data validation, feature engineering, missing values, encoding, and scaling.
"""

from typing import List, Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Canonical Raw Feature Definitions
NUMERICAL_RAW_FEATURES = [
    'age',
    'monthly_income',
    'years_of_employment',
    'monthly_expenses',
    'existing_debt',
    'existing_emi',
    'requested_loan_amount',
    'loan_tenure',
    'credit_score',
    'credit_history_length',
    'number_of_previous_loans',
    'number_of_previous_defaults',
    'number_of_late_payments',
    'credit_utilization',
    'number_of_active_loans',
    'savings_amount',
]

CATEGORICAL_RAW_FEATURES = [
    'employment_type',
    'loan_purpose',
]

ENGINEERED_FEATURES = [
    'debt_to_income',
    'expense_to_income',
    'loan_to_income',
    'savings_to_loan',
    'credit_burden_ratio',
]

ALL_RAW_FEATURES = NUMERICAL_RAW_FEATURES + CATEGORICAL_RAW_FEATURES
TARGET_VARIABLE = 'loan_default'


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Computes key financial domain metrics:
    - Debt-to-Income (DTI)
    - Expense-to-Income
    - Loan-to-Income (LTI)
    - Savings-to-Loan Cushion
    - Total Credit Burden Ratio
    """

    def fit(self, X: pd.DataFrame, y=None):
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        df = X.copy()
        income = np.maximum(df['monthly_income'].values, 1.0)
        tenure = np.maximum(df['loan_tenure'].values, 1.0)
        req_amount = df['requested_loan_amount'].values
        new_emi = req_amount / tenure
        existing_emi = df['existing_emi'].values
        savings = df['savings_amount'].values
        expenses = df['monthly_expenses'].values
        existing_debt = df['existing_debt'].values

        df['debt_to_income'] = np.round((existing_emi + new_emi) / income, 4)
        df['expense_to_income'] = np.round(expenses / income, 4)
        df['loan_to_income'] = np.round(req_amount / (income * 12.0), 4)
        df['savings_to_loan'] = np.round(savings / np.maximum(req_amount, 1.0), 4)
        df['credit_burden_ratio'] = np.round((existing_debt + req_amount) / (income * 12.0), 4)

        return df


def validate_input_data(df: pd.DataFrame, require_target: bool = False) -> None:
    """
    Validates that the input dataframe contains all required features
    and respects domain constraints.
    """
    missing_cols = [col for col in ALL_RAW_FEATURES if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Input data is missing required columns: {missing_cols}")

    if require_target and TARGET_VARIABLE not in df.columns:
        raise ValueError(f"Target variable '{TARGET_VARIABLE}' is missing from the dataset.")

    # Validate value domains
    if (df['age'] < 18).any() or (df['age'] > 100).any():
        raise ValueError("Age must be between 18 and 100.")
    if (df['credit_score'] < 300).any() or (df['credit_score'] > 850).any():
        raise ValueError("Credit score must be between 300 and 850.")
    if (df['credit_utilization'] < 0).any() or (df['credit_utilization'] > 100).any():
        raise ValueError("Credit utilization must be between 0% and 100%.")
    if (df['monthly_income'] <= 0).any():
        raise ValueError("Monthly income must be strictly positive.")


def create_preprocessor() -> Tuple[Pipeline, List[str], List[str]]:
    """
    Creates full Scikit-Learn preprocessing pipeline including:
    1. Feature Engineering
    2. Missing value imputation
    3. Categorical One-Hot Encoding
    4. Numerical standard scaling
    """
    all_num_features = NUMERICAL_RAW_FEATURES + ENGINEERED_FEATURES

    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    col_transformer = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, all_num_features),
            ('cat', categorical_transformer, CATEGORICAL_RAW_FEATURES)
        ],
        remainder='drop'
    )

    full_pipeline = Pipeline(steps=[
        ('feature_engineer', FeatureEngineer()),
        ('col_transformer', col_transformer)
    ])

    return full_pipeline, all_num_features, CATEGORICAL_RAW_FEATURES


def get_feature_names(fitted_pipeline: Pipeline, num_features: List[str], cat_features: List[str]) -> List[str]:
    """
    Extracts human-readable feature names after one-hot encoding.
    """
    col_transformer = fitted_pipeline.named_steps['col_transformer']
    cat_encoder = col_transformer.named_transformers_['cat'].named_steps['onehot']
    cat_names = list(cat_encoder.get_feature_names_out(cat_features))
    return num_features + cat_names
