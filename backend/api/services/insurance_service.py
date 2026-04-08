INSURANCE_SCHEMES = [
    {
        "id": 1,
        "name": "PMFBY",
        "coverage": "Natural Calamities & Crop Diseases",
        "premium_percent": 2,
        "eligible_diseases": [
            "BlackPoint",
            "FusariumFootRot",
            "LeafBlight",
            "WheatBlast"
        ]
    },
    {
        "id": 2,
        "name": "AIC Insurance",
        "coverage": "Severe Fungal & Major Diseases",
        "premium_percent": 2.5,
        "eligible_diseases": [
            "WheatBlast",
            "FusariumFootRot"
        ]
    }
]

SEVERITY_MAP = {
    "BlackPoint": "Moderate",
    "LeafBlight": "Moderate",
    "FusariumFootRot": "Severe",
    "WheatBlast": "Severe",
    "HealthyLeaf": "None"
}

def get_insurance_recommendation(disease: str) -> dict:
    if disease == "HealthyLeaf":
        return {
            "eligible": False,
            "message": "Crop is healthy. Insurance claim not required.",
            "severity": "None"
        }

    eligible_schemes = []
    for scheme in INSURANCE_SCHEMES:
        if disease in scheme["eligible_diseases"]:
            eligible_schemes.append(scheme)

    return {
        "eligible": len(eligible_schemes) > 0,
        "severity": SEVERITY_MAP.get(disease, "Unknown"),
        "recommended_schemes": eligible_schemes
    }
