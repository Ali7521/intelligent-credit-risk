"""
Credit Risk Model Training & Evaluation Engine
Trains and rigorously benchmarks Logistic Regression, Random Forest, and XGBoost.
Handles class imbalance via SMOTE, performs cost-sensitive evaluation focusing on default recall,
and persists artifacts, metrics, and SHAP explainers.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import shap

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
)

import sys
# Ensure ml module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from ml.preprocessing.pipeline import (
    create_preprocessor,
    get_feature_names,
    validate_input_data,
    ALL_RAW_FEATURES,
    TARGET_VARIABLE
)


def load_dataset(csv_path: str) -> pd.DataFrame:
    """Loads and validates the training CSV dataset."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Dataset not found at {csv_path}. Please provide a valid CSV or run generate_dataset.py."
        )
    df = pd.read_csv(csv_path)
    validate_input_data(df, require_target=True)
    return df


def evaluate_model(model: Any, X_test: np.ndarray, y_test: np.ndarray, model_name: str) -> Dict[str, Any]:
    """
    Computes complete statistical performance metrics:
    - Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC
    - Confusion Matrix (TN, FP, FN, TP)
    - ROC Curve & PR Curve coordinate samples for frontend plotting
    """
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    pr_auc = float(average_precision_score(y_test, y_proba))

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    # Downsample ROC and PR curves to 25 points each for efficient JSON serialization and crisp UI charts
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_indices = np.linspace(0, len(fpr) - 1, 25).astype(int)
    roc_points = [{"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)} for i in roc_indices]

    precision_pts, recall_pts, _ = precision_recall_curve(y_test, y_proba)
    pr_indices = np.linspace(0, len(precision_pts) - 1, 25).astype(int)
    pr_points = [{"recall": round(float(recall_pts[i]), 4), "precision": round(float(precision_pts[i]), 4)} for i in pr_indices]

    # Credit Default Loss-Weighted Metric (prioritizing detection of defaults / high recall & PR-AUC)
    # Minimizing False Negatives is Paramount in Lending Risk
    composite_score = float(0.40 * rec + 0.30 * pr_auc + 0.20 * f1 + 0.10 * roc_auc)

    return {
        "model_name": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "composite_score": round(composite_score, 4),
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "matrix": [[tn, fp], [fn, tp]]
        },
        "roc_curve": roc_points,
        "pr_curve": pr_points
    }


def train_pipeline(data_path: str = None, output_dir: str = None) -> Dict[str, Any]:
    """
    End-to-End training orchestration:
    1. Ingests dataset
    2. Validates schema
    3. Splits Train / Test (stratified 80/20)
    4. Applies Preprocessing (imputation, scaling, one-hot encoding)
    5. Detects imbalance & resamples train set with SMOTE
    6. Trains Logistic Regression, Random Forest, XGBoost
    7. Evaluates all models & computes confusion matrices
    8. Selects champion model based on default detection recall & PR-AUC
    9. Generates SHAP explanation model & artifacts
    10. Persists artifacts to disk
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.join(base_dir, '../data/credit_risk_dataset.csv')
    if output_dir is None:
        output_dir = os.path.join(base_dir, '../saved_models')

    os.makedirs(output_dir, exist_ok=True)

    print("=" * 60)
    print("AI CreditGuard - Machine Learning Training Pipeline")
    print("=" * 60)
    print(f"Loading dataset from: {data_path}")
    df = load_dataset(data_path)

    n_total = len(df)
    n_defaults = int(df[TARGET_VARIABLE].sum())
    default_rate = float(n_defaults / n_total)
    print(f"Dataset Loaded: {n_total} records")
    print(f"Class Distribution: {n_total - n_defaults} Non-Defaults, {n_defaults} Defaults ({default_rate:.2%})")

    X = df[ALL_RAW_FEATURES]
    y = df[TARGET_VARIABLE].values

    # Stratified Train/Test Split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Preprocessing Pipeline
    preprocessor, num_features, cat_features = create_preprocessor()
    print("Fitting preprocessor pipeline on training data...")
    X_train_transformed = preprocessor.fit_transform(X_train_raw)
    X_test_transformed = preprocessor.transform(X_test_raw)

    feature_names = get_feature_names(preprocessor, num_features, cat_features)
    print(f"Total engineered and encoded features: {len(feature_names)}")

    # Class Imbalance Handling using SMOTE
    print(f"Applying SMOTE resampling on training set (Original default ratio: {y_train.mean():.2%})...")
    smote = SMOTE(random_state=42, sampling_strategy=0.6)  # Balance minority class up to 60% of majority
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train_transformed, y_train)
    print(f"Post-SMOTE train shape: {X_train_resampled.shape}, minority defaults: {y_train_resampled.sum()}")

    # Define Candidate Models
    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1500,
            C=0.8,
            class_weight='balanced',
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=180,
            max_depth=9,
            min_samples_split=8,
            min_samples_leaf=4,
            class_weight='balanced_subsample',
            random_state=42,
            n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=160,
            max_depth=5,
            learning_rate=0.06,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=(len(y_train) - sum(y_train)) / sum(y_train),
            eval_metric="logloss",
            random_state=42
        )
    }

    evaluations = {}
    fitted_models = {}

    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        if name == "Logistic Regression":
            model.fit(X_train_resampled, y_train_resampled)
        else:
            model.fit(X_train_transformed, y_train)

        fitted_models[name] = model
        metrics = evaluate_model(model, X_test_transformed, y_test, name)
        evaluations[name] = metrics

        print(f"Accuracy:  {metrics['accuracy']:.4f} | Precision: {metrics['precision']:.4f}")
        print(f"Recall:    {metrics['recall']:.4f} | F1 Score:  {metrics['f1_score']:.4f}")
        print(f"ROC-AUC:   {metrics['roc_auc']:.4f} | PR-AUC:    {metrics['pr_auc']:.4f}")
        print(f"Composite Score (Default Focused): {metrics['composite_score']:.4f}")
        print(f"Confusion Matrix: TN={metrics['confusion_matrix']['true_negatives']}, "
              f"FP={metrics['confusion_matrix']['false_positives']}, "
              f"FN={metrics['confusion_matrix']['false_negatives']}, "
              f"TP={metrics['confusion_matrix']['true_positives']}")

    # Select Best Model based on Composite Score (Prioritizing Default Recall & PR-AUC)
    best_model_name = max(evaluations.keys(), key=lambda k: evaluations[k]['composite_score'])
    best_model = fitted_models[best_model_name]
    best_metrics = evaluations[best_model_name]

    print("\n" + "=" * 60)
    print(f"CHAMPION MODEL SELECTED: {best_model_name}")
    print(f"Selection Rationale: Highest composite default-detection score ({best_metrics['composite_score']:.4f})")
    print(f"Default Recall: {best_metrics['recall']:.2%}, PR-AUC: {best_metrics['pr_auc']:.4f}")
    print("=" * 60)

    # Compute Global Feature Importance / Coefficients
    if hasattr(best_model, "feature_importances_"):
        raw_importances = best_model.feature_importances_
    elif hasattr(best_model, "coef_"):
        raw_importances = np.abs(best_model.coef_[0])
    else:
        raw_importances = np.ones(len(feature_names))

    feature_importance_list = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(feature_names, raw_importances), key=lambda x: x[1], reverse=True)
    ]

    # Initialize and configure SHAP Explainer
    print("\nFitting SHAP Explainer on background reference sample...")
    background_sample = shap.sample(X_train_transformed, 80, random_state=42)

    try:
        if isinstance(best_model, (XGBClassifier, RandomForestClassifier)):
            explainer = shap.TreeExplainer(best_model)
        else:
            explainer = shap.LinearExplainer(best_model, background_sample)
    except Exception as e:
        print(f"Tree/Linear explainer fallback to KernelExplainer: {e}")
        explainer = shap.KernelExplainer(lambda x: best_model.predict_proba(x)[:, 1], background_sample)

    # Persist Artifacts
    print("\nPersisting artifacts to saved_models directory...")
    joblib.dump(best_model, os.path.join(output_dir, 'best_model.joblib'))
    joblib.dump(preprocessor, os.path.join(output_dir, 'preprocessor.joblib'))
    joblib.dump(background_sample, os.path.join(output_dir, 'shap_background.joblib'))

    metadata = {
        "best_model_name": best_model_name,
        "selection_metric": "composite_default_detection_score (Recall + PR-AUC + F1 + ROC-AUC)",
        "feature_names": feature_names,
        "raw_features": ALL_RAW_FEATURES,
        "dataset_summary": {
            "total_records": n_total,
            "non_defaults": n_total - n_defaults,
            "defaults": n_defaults,
            "default_rate": round(default_rate, 4),
        },
        "best_model_metrics": best_metrics,
        "all_models_evaluations": evaluations,
        "feature_importances": feature_importance_list[:15]
    }

    with open(os.path.join(output_dir, 'model_metrics.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    with open(os.path.join(output_dir, 'feature_names.json'), 'w') as f:
        json.dump(feature_names, f, indent=2)

    print("Training pipeline completed successfully.")
    return metadata


if __name__ == '__main__':
    train_pipeline()
