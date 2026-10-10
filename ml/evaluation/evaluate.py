"""
Standalone Model Evaluation and Verification Module
Can be run to verify saved model performance against test datasets or new batches.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from ml.preprocessing.pipeline import ALL_RAW_FEATURES, TARGET_VARIABLE, validate_input_data
from ml.training.train import evaluate_model


def run_evaluation(data_path: str = None, models_dir: str = None):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.join(base_dir, '../data/credit_risk_dataset.csv')
    if models_dir is None:
        models_dir = os.path.join(base_dir, '../saved_models')

    model_path = os.path.join(models_dir, 'best_model.joblib')
    preprocessor_path = os.path.join(models_dir, 'preprocessor.joblib')

    if not os.path.exists(model_path) or not os.path.exists(preprocessor_path):
        raise FileNotFoundError("Trained models not found. Run ml/training/train.py first.")

    model = joblib.load(model_path)
    preprocessor = joblib.load(preprocessor_path)

    df = pd.read_csv(data_path)
    validate_input_data(df, require_target=True)

    X_raw = df[ALL_RAW_FEATURES]
    y = df[TARGET_VARIABLE].values

    X_transformed = preprocessor.transform(X_raw)
    metrics = evaluate_model(model, X_transformed, y, type(model).__name__)

    print(json.dumps(metrics, indent=2))
    return metrics


if __name__ == '__main__':
    run_evaluation()
