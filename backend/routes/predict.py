"""
Prediction API Route
POST /api/predict: Validates input, executes ML inference, and generates SHAP local explanations.
"""

from fastapi import APIRouter, HTTPException, Depends
from backend.schemas.applicant import ApplicantInput, PredictionResponse
from backend.services.ml_service import MLService

router = APIRouter()

# Singleton ML Service dependency
_ml_service = None

def get_ml_service() -> MLService:
    global _ml_service
    if _ml_service is None:
        _ml_service = MLService()
    return _ml_service


@router.post("/predict", response_model=PredictionResponse, summary="Analyze Credit Risk Profile")
def predict_credit_risk(
    applicant: ApplicantInput,
    ml_service: MLService = Depends(get_ml_service)
):
    """
    Executes real-time credit default risk prediction and SHAP explanation.
    Returns calibrated risk score (0-100), default probability, risk tier,
    positive protective factors, and negative risk-escalating factors.
    """
    try:
        result = ml_service.predict_and_explain(applicant.model_dump())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference error processing applicant risk profile: {str(e)}"
        )
