def calculate_stockout_risk(
    predicted_demand,
    current_stock,
    safety_stock
):
    """
    Calculate medicine stockout risk.

    Risk calculation is deterministic.
    Gemini is NOT used here.
    """

    # Expected shortage using pipeline formula: demand + safety_stock - stock
    expected_shortage = max(
        0.0,
        predicted_demand + safety_stock - current_stock
    )

    # Stock coverage ratio
    if predicted_demand > 0:
        stock_ratio = current_stock / predicted_demand
    else:
        stock_ratio = 1.0

    # Days to stockout based on predicted 15-day demand (divide-by-zero safe)
    daily_demand = predicted_demand / 15.0
    if daily_demand > 0:
        days_to_stockout = round(current_stock / daily_demand, 2)
    else:
        days_to_stockout = 999.0 if current_stock > 0 else 0.0

    # Risk classification matching pipeline deterministic rules
    if current_stock < predicted_demand:
        risk_level = "HIGH"
    elif current_stock < (predicted_demand + safety_stock):
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "predicted_demand": round(predicted_demand, 2),
        "current_stock": round(current_stock, 2),
        "safety_stock": round(safety_stock, 2),
        "expected_shortage": round(expected_shortage, 2),
        "stock_ratio": round(stock_ratio, 3),
        "days_to_stockout": days_to_stockout,
        "risk_level": risk_level
    }


# ============================================================
# TEST CASE
# ============================================================

if __name__ == "__main__":

    result = calculate_stockout_risk(
        predicted_demand=1005.98,
        current_stock=500,
        safety_stock=250
    )

    print("\n==============================")
    print("STOCKOUT RISK RESULT")
    print("==============================")

    for key, value in result.items():
        print(f"{key}: {value}")