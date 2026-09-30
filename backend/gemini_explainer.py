import os
import json
from google import genai


try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass


# ============================================================
# GEMINI SCREENER
# Model verified from Google AI Studio docs: gemini-2.5-flash
# (with fallback to gemini-1.5-flash)
# ============================================================

DEFAULT_GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")


def explain_risk(phc_id, medicine_id, risk_result, model=None):

    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")

    if not model:
        model = DEFAULT_GEMINI_MODEL

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are an AI explanation assistant for a healthcare
medicine stockout monitoring system.

Your job is ONLY to explain the already calculated ML
and inventory results to a PHC supervisor.

IMPORTANT RULES:

1. Do NOT calculate a new risk level.
2. Do NOT change any numbers.
3. Do NOT invent data.
4. The risk level provided by the Risk Engine is FINAL.
5. The expected shortage provided by the Risk Engine is FINAL.
6. Do NOT perform your own mathematical calculations.
7. Explain the result in simple and clear language.
8. Mention the expected shortage clearly.
9. Mention the important model drivers if available.
10. Do not provide medical treatment or clinical advice.
11. Do not claim that a model driver is a causal factor.
12. Treat model drivers only as signals used by the ML model.

PHC:
{phc_id}

Medicine:
{medicine_id}

ML + RISK RESULT:
{json.dumps(risk_result, indent=2)}

Give the response exactly in this format:

Risk:
<provided risk level>

Reason:
<simple explanation using only the supplied data>

Expected shortage:
<provided expected shortage>

Recommended attention:
<what the PHC supervisor should pay attention to based only
on the supplied stockout information>
"""

    try:
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )
        return response.text
    except Exception as e:
        # Fallback to gemini-1.5-flash if preferred model has access/tier constraints
        if model != "gemini-1.5-flash":
            try:
                fallback_resp = client.models.generate_content(
                    model="gemini-1.5-flash",
                    contents=prompt
                )
                return fallback_resp.text
            except Exception:
                raise e
        raise e


# ============================================================
# TEST USING FORECAST OBJECTS
# ============================================================

if __name__ == "__main__":

    print("\n" + "=" * 70)
    print("GEMINI SCREENER")
    print("=" * 70)

    # Load Forecast Objects created by forecast_model.py
    with open(
        "forecast_objects.json",
        "r",
        encoding="utf-8"
    ) as f:

        forecast_objects = json.load(f)

    print(
        f"\nLoaded {len(forecast_objects)} Forecast Objects."
    )

    # --------------------------------------------------------
    # Generate explanation for every PHC + medicine
    # --------------------------------------------------------

    explanations = []

    for i, forecast in enumerate(forecast_objects):

        print(
            f"\nGenerating explanation "
            f"{i + 1}/{len(forecast_objects)}..."
        )

        explanation = explain_risk(
            forecast["phc_id"],
            forecast["medicine_id"],
            forecast
        )

        result = {
            "phc_id": forecast["phc_id"],
            "medicine_id": forecast["medicine_id"],
            "risk_level": forecast["risk_level"],
            "predicted_15_day_demand":
                forecast["predicted_15_day_demand"],
            "current_stock":
                forecast["current_stock"],
            "expected_shortage":
                forecast["expected_shortage"],
            "gemini_explanation": explanation
        }

        explanations.append(result)

    # --------------------------------------------------------
    # Save explanations
    # --------------------------------------------------------

    output_file = "gemini_explanations.json"

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            explanations,
            f,
            indent=2,
            ensure_ascii=False
        )

    # --------------------------------------------------------
    # Display first result
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("SAMPLE GEMINI EXPLANATION")
    print("=" * 70)

    print(
        explanations[0]["gemini_explanation"]
    )

    print("\n" + "=" * 70)
    print("GEMINI SCREENER COMPLETE")
    print("=" * 70)

    print(
        f"Saved to: {output_file}"
    )

    print(
        f"Total explanations: {len(explanations)}"
    )