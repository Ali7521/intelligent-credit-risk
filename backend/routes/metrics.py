"""
Model Performance & Metrics API Route
Serves model benchmark comparisons, confusion matrices, ROC/PR curves,
and explainability feature importances.
"""

from fastapi import APIRouter, Depends
from backend.services.ml_service import MLService
from backend.routes.predict import get_ml_service

router = APIRouter()


@router.get("/model-metrics", summary="Get ML Model Benchmark and Validation Metrics")
def get_model_metrics(ml_service: MLService = Depends(get_ml_service)):
    """
    Returns empirical evaluation data for Logistic Regression, Random Forest, and XGBoost:
    - Accuracy, Precision, Recall, F1-Score, ROC-AUC, PR-AUC
    - Confusion matrices (True Positives, False Positives, False Negatives, True Negatives)
    - ROC Curves and Precision-Recall Curves
    - Feature importance rankings
    """
    meta = ml_service.get_model_metrics()
    return meta
