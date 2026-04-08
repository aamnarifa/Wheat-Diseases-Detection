from fastapi import APIRouter
from ..services.insurance_service import INSURANCE_SCHEMES, get_insurance_recommendation

router = APIRouter()

@router.get("")
async def get_all_insurance():
    return INSURANCE_SCHEMES

@router.get("/recommend/{disease}")
async def recommend_insurance(disease: str):
    return get_insurance_recommendation(disease)
