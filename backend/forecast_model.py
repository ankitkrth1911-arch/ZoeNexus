# ============================================================
# BRICS HEALTHCARE AI
# MEMBER 1: DEMAND FORECASTING + STOCKOUT RISK
# ============================================================

import os
import joblib
import numpy as np
import pandas as pd
import json
import xgboost as xgb

from datetime import datetime
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ============================================================
# 1. CONFIGURATION
# ============================================================

RANDOM_STATE = 42
FORECAST_HORIZON = 15

MODEL_VERSION = "xgb-demand-v2"

MODEL_DIR = "models"

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# 2. CREATE SYNTHETIC PHC MEDICINE DATA
# ============================================================

np.random.seed(RANDOM_STATE)

phcs = [
    "PHC_A",
    "PHC_B",
    "PHC_C",
    "PHC_D",
    "PHC_E"
]

medicines = [
    "Amlodipine",
    "Telmisartan",
    "Diuretic"
]

days = 1000

dates = pd.date_range(
    start="2022-06-01",
    periods=days,
    freq="D"
)

records = []


for phc in phcs:

    for medicine in medicines:

        # Medicine-specific base demand

        if medicine == "Amlodipine":
            base_demand = 45

        elif medicine == "Telmisartan":
            base_demand = 55

        else:
            base_demand = 70


        # PHC-specific demand factor

        phc_factor = {
            "PHC_A": 1.00,
            "PHC_B": 1.15,
            "PHC_C": 0.90,
            "PHC_D": 1.25,
            "PHC_E": 1.05
        }[phc]


        for i, date in enumerate(dates):

            # Weekly seasonality

            weekly_pattern = (
                8 * np.sin(
                    2 * np.pi * i / 7
                )
            )


            # Small long-term trend

            trend = 0.01 * i


            # Random demand variation

            noise = np.random.normal(
                0,
                5
            )


            demand = (
                base_demand
                * phc_factor
                + weekly_pattern
                + trend
                + noise
            )


            demand = max(
                1,
                demand
            )


            records.append({

                "date": date,

                "phc_id": phc,

                "medicine_id": medicine,

                "demand": demand

            })


df = pd.DataFrame(records)


print("\n============================================================")
print("BRICS HEALTHCARE AI - MEMBER 1")
print("DEMAND FORECASTING + STOCKOUT RISK")
print("============================================================")

print("\nDataset created successfully.")

print(
    "Dataset size:",
    len(df)
)


# ============================================================
# 3. SORT DATA
# ============================================================

df = df.sort_values(
    [
        "phc_id",
        "medicine_id",
        "date"
    ]
).reset_index(drop=True)


# ============================================================
# 4. FEATURE ENGINEERING
# ============================================================

group_columns = [
    "phc_id",
    "medicine_id"
]

group = df.groupby(
    group_columns
)["demand"]


# ============================================================
# LAG FEATURES
# ============================================================

df["lag_1"] = group.shift(1)

df["lag_2"] = group.shift(2)

df["lag_7"] = group.shift(7)

df["lag_14"] = group.shift(14)

df["lag_15"] = group.shift(15)


# ============================================================
# ROLLING MEAN
# ============================================================

df["rolling_mean_3"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(3)
        .mean()

    )

)


df["rolling_mean_7"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(7)
        .mean()

    )

)


df["rolling_mean_14"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(14)
        .mean()

    )

)


# ============================================================
# ROLLING SUM
# ============================================================

df["rolling_sum_7"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(7)
        .sum()

    )

)


df["rolling_sum_14"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(14)
        .sum()

    )

)


# ============================================================
# ROLLING STANDARD DEVIATION
# ============================================================

df["rolling_std_7"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(7)
        .std()

    )

)


df["rolling_std_14"] = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:
        x.shift(1)
        .rolling(14)
        .std()

    )

)


# ============================================================
# DEMAND CHANGE
# ============================================================

df["demand_change"] = (
    df["lag_1"]
    -
    df["lag_2"]
)


# ============================================================
# 5. CALENDAR FEATURES
# ============================================================

df["day_of_week"] = (
    df["date"].dt.dayofweek
)

df["month"] = (
    df["date"].dt.month
)

df["day_of_month"] = (
    df["date"].dt.day
)


df["day_sin"] = np.sin(
    2
    * np.pi
    * df["day_of_week"]
    / 7
)


df["day_cos"] = np.cos(
    2
    * np.pi
    * df["day_of_week"]
    / 7
)


# ============================================================
# 6. CREATE 15-DAY FUTURE TARGET
# ============================================================

future_demand = (

    df.groupby(group_columns)["demand"]

    .transform(

        lambda x:

        x.shift(-1)

        .rolling(
            FORECAST_HORIZON,
            min_periods=FORECAST_HORIZON
        )

        .sum()

        .shift(
            -(FORECAST_HORIZON - 1)
        )

    )

)


df["target_15_day_demand"] = (
    future_demand
)


# ============================================================
# 7. REMOVE MISSING VALUES
# ============================================================

df_model = (
    df
    .dropna()
    .copy()
)


print(
    "\nRows after feature engineering:",
    len(df_model)
)


# ============================================================
# 8. FEATURES
# ============================================================

features = [

    "lag_1",
    "lag_2",
    "lag_7",
    "lag_14",
    "lag_15",

    "rolling_mean_3",
    "rolling_mean_7",
    "rolling_mean_14",

    "rolling_sum_7",
    "rolling_sum_14",

    "rolling_std_7",
    "rolling_std_14",

    "demand_change",

    "day_of_week",
    "month",
    "day_of_month",

    "day_sin",
    "day_cos"

]


# ============================================================
# 9. TIME-BASED TRAIN / TEST SPLIT
# ============================================================

cutoff_date = (
    df_model["date"].quantile(0.80)
)


train = df_model[
    df_model["date"] <= cutoff_date
].copy()


test = df_model[
    df_model["date"] > cutoff_date
].copy()


X_train = train[
    features
].astype(float)


y_train = train[
    "target_15_day_demand"
]


X_test = test[
    features
].astype(float)


y_test = test[
    "target_15_day_demand"
]


print("\n============================================================")
print("TRAIN / TEST SPLIT")
print("============================================================")

print(
    "Cutoff date:",
    cutoff_date
)

print(
    "Training rows:",
    len(train)
)

print(
    "Testing rows:",
    len(test)
)


# ============================================================
# 10. NAIVE BASELINE
# ============================================================

naive_prediction = (
    test["lag_1"]
    *
    FORECAST_HORIZON
)


naive_mae = mean_absolute_error(
    y_test,
    naive_prediction
)


naive_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        naive_prediction
    )
)


# ============================================================
# 11. MOVING AVERAGE BASELINE
# ============================================================

moving_average_prediction = (

    test["rolling_mean_7"]

    *
    FORECAST_HORIZON

)


moving_average_mae = (
    mean_absolute_error(
        y_test,
        moving_average_prediction
    )
)


moving_average_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        moving_average_prediction
    )
)


# ============================================================
# 12. SEASONAL NAIVE BASELINE
# ============================================================

seasonal_prediction = (

    test["lag_7"]

    *
    FORECAST_HORIZON

)


seasonal_mae = (
    mean_absolute_error(
        y_test,
        seasonal_prediction
    )
)


seasonal_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        seasonal_prediction
    )
)


# ============================================================
# 13. XGBOOST MODEL
# ============================================================

model = XGBRegressor(
    n_estimators=150,
    max_depth=6,
    learning_rate=0.08,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="reg:squarederror",
    random_state=RANDOM_STATE,
    n_jobs=-1,
    tree_method="hist"
)

print("\nTraining XGBoost...")

model.fit(
    X_train,
    y_train
)


# ============================================================
# 14. XGBOOST PREDICTION
# ============================================================

xgb_prediction = model.predict(
    X_test
)


xgb_mae = mean_absolute_error(
    y_test,
    xgb_prediction
)


xgb_rmse = np.sqrt(
    mean_squared_error(
        y_test,
        xgb_prediction
    )
)


# ============================================================
# 15. MODEL COMPARISON
# ============================================================

comparison = pd.DataFrame({

    "model": [

        "Naive",

        "Moving Average 7D",

        "Seasonal Naive 7D",

        "XGBoost"

    ],

    "MAE": [

        naive_mae,

        moving_average_mae,

        seasonal_mae,

        xgb_mae

    ],

    "RMSE": [

        naive_rmse,

        moving_average_rmse,

        seasonal_rmse,

        xgb_rmse

    ]

})


print("\n============================================================")
print("MODEL COMPARISON")
print("============================================================")

print(
    comparison.to_string(
        index=False
    )
)


comparison.to_csv(
    "model_comparison.csv",
    index=False
)


# ============================================================
# 16. FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({

    "feature": features,

    "importance":
        model.feature_importances_

})


importance = importance.sort_values(
    "importance",
    ascending=False
)


print("\n============================================================")
print("FEATURE IMPORTANCE")
print("============================================================")

print(
    importance.to_string(
        index=False
    )
)


importance.to_csv(
    "forecast_feature_importance.csv",
    index=False
)


# ============================================================
# 17. SAVE MODEL
# ============================================================

model_path = os.path.join(
    MODEL_DIR,
    "xgb_demand_model.pkl"
)


joblib.dump(
    model,
    model_path
)


print(
    "\nModel saved:",
    model_path
)


# ============================================================
# 18. SAVE TEST PREDICTIONS
# ============================================================

test_results = test[

    [
        "date",
        "phc_id",
        "medicine_id",
        "target_15_day_demand"
    ]

].copy()


test_results[
    "predicted_15_day_demand"
] = xgb_prediction


test_results.to_csv(
    "test_predictions.csv",
    index=False
)


# ============================================================
# 19. SAMPLE FORECAST
# ============================================================

sample = test.iloc[-1]


sample_X = (

    sample[
        features
    ]

    .to_frame()
    .T
    .copy()

)


# IMPORTANT:
# Convert every feature to numeric
# to avoid XGBoost object dtype error.

for col in features:

    sample_X[col] = pd.to_numeric(
        sample_X[col],
        errors="coerce"
    )


sample_X = (
    sample_X[
        features
    ]
    .astype(float)
)


predicted_demand = float(
    model.predict(
        sample_X
    )[0]
)


print("\n============================================================")
print("SAMPLE 15-DAY FORECAST")
print("============================================================")

print(
    "PHC:",
    sample["phc_id"]
)

print(
    "Medicine:",
    sample["medicine_id"]
)

print(
    "Predicted 15-day demand:",
    round(
        predicted_demand,
        2
    )
)


# ============================================================
# 20. LOAD INVENTORY DATA
# ============================================================

print("\n============================================================")
print("LOADING INVENTORY DATA")
print("============================================================")


inventory_file = "inventory.csv"


if not os.path.exists(
    inventory_file
):

    raise FileNotFoundError(
        "\nERROR: inventory.csv not found.\n"
        "Put inventory.csv in the same folder "
        "as forecast_model.py."
    )


inventory_df = pd.read_csv(
    inventory_file
)


# ============================================================
# CHECK INVENTORY COLUMNS
# ============================================================

required_inventory_columns = [

    "phc_id",

    "medicine_id",

    "current_stock",

    "safety_stock"

]


missing_columns = [

    col

    for col in required_inventory_columns

    if col not in inventory_df.columns

]


if missing_columns:

    raise ValueError(

        "inventory.csv is missing columns: "

        +
        str(missing_columns)

    )


# ============================================================
# CONVERT INVENTORY TO NUMERIC
# ============================================================

inventory_df[
    "current_stock"
] = pd.to_numeric(

    inventory_df[
        "current_stock"
    ],

    errors="coerce"

)


inventory_df[
    "safety_stock"
] = pd.to_numeric(

    inventory_df[
        "safety_stock"
    ],

    errors="coerce"

)


# ============================================================
# CHECK DUPLICATE INVENTORY RECORDS
# ============================================================

duplicate_inventory = (

    inventory_df
    .duplicated(
        [
            "phc_id",
            "medicine_id"
        ]
    )
    .any()

)


if duplicate_inventory:

    raise ValueError(

        "Duplicate inventory rows found "
        "for same PHC + medicine."

    )


print("\nInventory loaded successfully.")

print(
    inventory_df[
        [
            "phc_id",
            "medicine_id",
            "current_stock",
            "safety_stock"
        ]
    ].to_string(
        index=False
    )
)


# ============================================================
# 21. SAMPLE STOCKOUT RISK
# ============================================================

# Find inventory for sample PHC + medicine

sample_inventory = inventory_df[

    (
        inventory_df["phc_id"]
        ==
        sample["phc_id"]
    )

    &

    (
        inventory_df["medicine_id"]
        ==
        sample["medicine_id"]
    )

]


if len(sample_inventory) != 1:

    raise ValueError(

        "Sample inventory not found for "

        +
        str(sample["phc_id"])

        +
        " / "

        +
        str(sample["medicine_id"])

    )


sample_inventory_row = (
    sample_inventory.iloc[0]
)


current_stock = float(
    sample_inventory_row[
        "current_stock"
    ]
)


safety_stock = float(
    sample_inventory_row[
        "safety_stock"
    ]
)


expected_shortage = max(

    0,

    predicted_demand
    +
    safety_stock
    -
    current_stock

)


stock_ratio = (

    current_stock
    /
    max(
        predicted_demand,
        1
    )

)


if current_stock < predicted_demand:

    risk_level = "HIGH"

elif current_stock < (

    predicted_demand
    +
    safety_stock

):

    risk_level = "MEDIUM"

else:

    risk_level = "LOW"


# ============================================================
# 22. SAMPLE RISK RESULT
# ============================================================

risk_result = {

    "phc_id":
        sample["phc_id"],

    "medicine_id":
        sample["medicine_id"],

    "forecast_horizon":
        "15_days",

    "predicted_demand":
        round(
            predicted_demand,
            2
        ),

    "current_stock":
        current_stock,

    "safety_stock":
        safety_stock,

    "expected_shortage":
        round(
            expected_shortage,
            2
        ),

    "stock_ratio":
        round(
            stock_ratio,
            3
        ),

    "risk_level":
        risk_level,

    "model_version":
        MODEL_VERSION,

    "generated_at":
        datetime.now().isoformat()

}


print("\n============================================================")
print("SAMPLE STOCKOUT RISK")
print("============================================================")


for key, value in risk_result.items():

    print(
        f"{key}: {value}"
    )


risk_df = pd.DataFrame(
    [risk_result]
)


risk_df.to_csv(
    "risk_result.csv",
    index=False
)


# ============================================================
# 23. ALL PHC + MEDICINE RISK RESULTS
# ============================================================

print("\n============================================================")
print("ALL PHC + MEDICINE RISK RESULTS")
print("============================================================")


# ------------------------------------------------------------
# Prepare all test records
# ------------------------------------------------------------

all_test = test[
    [
        "date",
        "phc_id",
        "medicine_id"
    ]
    +
    features
].copy()


# ------------------------------------------------------------
# Convert model features to numeric
# ------------------------------------------------------------

for col in features:

    all_test[col] = pd.to_numeric(
        all_test[col],
        errors="coerce"
    )


all_test = all_test.dropna(
    subset=features
)


all_test[
    features
] = all_test[
    features
].astype(float)


# ------------------------------------------------------------
# Predict 15-day demand for every test row
# ------------------------------------------------------------

all_test[
    "predicted_15_day_demand"
] = model.predict(
    all_test[
        features
    ]
)


# ------------------------------------------------------------
# Get latest record for each PHC + medicine
# ------------------------------------------------------------

latest = (

    all_test

    .sort_values(
        "date"
    )

    .groupby(
        [
            "phc_id",
            "medicine_id"
        ],
        as_index=False
    )

    .tail(1)

    .copy()

)


# ------------------------------------------------------------
# IMPORTANT:
# Remove old inventory columns if they exist
# ------------------------------------------------------------

latest = latest.drop(

    columns=[
        "current_stock",
        "safety_stock"
    ],

    errors="ignore"

)


# ============================================================
# 24. MERGE REAL INVENTORY
# ============================================================

latest = latest.merge(

    inventory_df[
        [
            "phc_id",
            "medicine_id",
            "current_stock",
            "safety_stock"
        ]
    ],

    on=[
        "phc_id",
        "medicine_id"
    ],

    how="left",

    validate="one_to_one"

)


# ============================================================
# CHECK MISSING INVENTORY
# ============================================================

missing_inventory = latest[

    latest[
        [
            "current_stock",
            "safety_stock"
        ]
    ].isnull().any(axis=1)

]


if len(missing_inventory) > 0:

    raise ValueError(

        "Inventory missing for:\n"

        +

        missing_inventory[
            [
                "phc_id",
                "medicine_id"
            ]
        ].to_string(
            index=False
        )

    )


# ============================================================
# CONVERT MERGED INVENTORY TO FLOAT
# ============================================================

latest[
    "current_stock"
] = pd.to_numeric(

    latest[
        "current_stock"
    ],

    errors="coerce"

)


latest[
    "safety_stock"
] = pd.to_numeric(

    latest[
        "safety_stock"
    ],

    errors="coerce"

)


# ============================================================
# SHOW MERGED INVENTORY
# ============================================================

print("\n============================================================")
print("MERGED INVENTORY")
print("============================================================")


print(

    latest[
        [
            "phc_id",
            "medicine_id",
            "current_stock",
            "safety_stock"
        ]
    ].sort_values(
        [
            "phc_id",
            "medicine_id"
        ]
    ).to_string(
        index=False
    )

)


# ============================================================
# 25. CALCULATE EXPECTED SHORTAGE
# ============================================================

latest[
    "expected_shortage"
] = np.maximum(

    0,

    latest[
        "predicted_15_day_demand"
    ]

    +

    latest[
        "safety_stock"
    ]

    -

    latest[
        "current_stock"
    ]

)


# ============================================================
# 26. STOCK RATIO
# ============================================================

latest[
    "stock_ratio"
] = (

    latest[
        "current_stock"
    ]

    /

    latest[
        "predicted_15_day_demand"
    ].clip(
        lower=1
    )

)


# ============================================================
# 27. DETERMINISTIC STOCKOUT RISK ENGINE
# ============================================================

latest[
    "risk_level"
] = np.where(

    latest[
        "current_stock"
    ]

    <

    latest[
        "predicted_15_day_demand"
    ],

    "HIGH",

    np.where(

        latest[
            "current_stock"
        ]

        <

        (

            latest[
                "predicted_15_day_demand"
            ]

            +

            latest[
                "safety_stock"
            ]

        ),

        "MEDIUM",

        "LOW"

    )

)


# ============================================================
# 28. ADD METADATA
# ============================================================

latest[
    "forecast_horizon"
] = "15_days"


latest[
    "model_version"
] = MODEL_VERSION


latest[
    "generated_at"
] = datetime.now().isoformat()


# ============================================================
# 29. CREATE FINAL ALL-RISK TABLE
# ============================================================

risk_columns = [

    "phc_id",

    "medicine_id",

    "forecast_horizon",

    "predicted_15_day_demand",

    "current_stock",

    "safety_stock",

    "expected_shortage",

    "stock_ratio",

    "risk_level",

    "model_version",

    "generated_at"

]


all_risk_results = (

    latest[
        risk_columns
    ]
    .copy()

)


# ============================================================
# ROUND NUMERIC VALUES
# ============================================================

all_risk_results[
    "predicted_15_day_demand"
] = (

    all_risk_results[
        "predicted_15_day_demand"
    ]

    .round(2)

)


all_risk_results[
    "expected_shortage"
] = (

    all_risk_results[
        "expected_shortage"
    ]

    .round(2)

)


all_risk_results[
    "stock_ratio"
] = (

    all_risk_results[
        "stock_ratio"
    ]

    .round(3)

)


# ============================================================
# SORT FINAL OUTPUT
# ============================================================

all_risk_results = (

    all_risk_results

    .sort_values(
        [
            "phc_id",
            "medicine_id"
        ]
    )

    .reset_index(
        drop=True
    )

)


# ============================================================
# 30. SAVE ALL RISK RESULTS
# ============================================================

all_risk_results.to_csv(

    "all_risk_results.csv",

    index=False

)


# ============================================================
# 31. PRINT ALL RESULTS
# ============================================================

print("\n============================================================")
print("ALL PHC + MEDICINE RISK RESULTS")
print("============================================================")


print(
    "\nTotal PHC + Medicine combinations:",
    len(all_risk_results)
)


print("\nRisk Distribution:")

print(
    all_risk_results[
        "risk_level"
    ].value_counts()
)


print("\nAll Risk Results:")


print(
    all_risk_results.to_string(
        index=False
    )
)


print("\nSaved:")

print(
    "all_risk_results.csv"
)

# ============================================================
# 32. FORECAST OBJECT + EXPLAINABILITY
# ============================================================

print("\n" + "=" * 70)
print("FORECAST OBJECT + EXPLAINABILITY")
print("=" * 70)

# One common timestamp for this complete batch
forecast_generated_at = datetime.now().isoformat()

forecast_objects = []

# Get XGBoost booster for native prediction contributions
booster = model.get_booster()

for idx, row in latest.iterrows():

    # --------------------------------------------------------
    # 1. Prepare model input
    # --------------------------------------------------------
    model_input = latest.loc[[idx], features].copy()

    # Make sure all model inputs are numeric
    model_input = model_input.astype(float)

    # --------------------------------------------------------
    # 2. Get XGBoost prediction contributions
    # --------------------------------------------------------
    dmatrix = xgb.DMatrix(
        model_input,
        feature_names=features
    )

    contributions = booster.predict(
        dmatrix,
        pred_contribs=True
    )[0]

    # Last value is the XGBoost bias/base contribution
    feature_contributions = contributions[:-1]

    # --------------------------------------------------------
    # 3. Build feature contribution table
    # --------------------------------------------------------
    contribution_df = pd.DataFrame({
        "feature": features,
        "impact": feature_contributions
    })

    contribution_df["abs_impact"] = contribution_df["impact"].abs()

    # Select top 5 strongest model signals
    top_contributions = (
        contribution_df
        .sort_values("abs_impact", ascending=False)
        .head(5)
    )

    top_model_drivers = []

    for _, driver in top_contributions.iterrows():

        impact = float(driver["impact"])

        if impact > 0:
            direction = "increases forecast"
        elif impact < 0:
            direction = "decreases forecast"
        else:
            direction = "neutral"

        top_model_drivers.append({
            "feature": str(driver["feature"]),
            "impact": round(impact, 4),
            "direction": direction
        })

    # --------------------------------------------------------
    # 4. Read inventory/risk values
    # --------------------------------------------------------
    predicted_demand = float(row["predicted_15_day_demand"])
    current_stock = float(row["current_stock"])
    safety_stock = float(row["safety_stock"])
    expected_shortage = float(row["expected_shortage"])
    stock_ratio = float(row["stock_ratio"])
    risk_level = str(row["risk_level"])

    # --------------------------------------------------------
    # 5. Deterministic risk explanation
    # --------------------------------------------------------
    risk_reasons = []

    if current_stock < predicted_demand:
        risk_reasons.append(
            "Current stock is below predicted 15-day demand."
        )

    if current_stock < predicted_demand + safety_stock:
        risk_reasons.append(
            "Current stock does not cover predicted demand plus safety stock."
        )

    if expected_shortage > 0:
        risk_reasons.append(
            f"Expected shortage is approximately "
            f"{expected_shortage:.2f} units."
        )

    if stock_ratio < 1:
        risk_reasons.append(
            "Stock coverage ratio is below 1.0."
        )

    if not risk_reasons:
        risk_reasons.append(
            "Current stock covers predicted demand and safety stock."
        )

    # --------------------------------------------------------
    # 6. Underlying numeric model inputs
    # --------------------------------------------------------
    model_inputs = {}

    for feature in features:
        value = row[feature]

        if pd.isna(value):
            model_inputs[feature] = None
        else:
            model_inputs[feature] = round(float(value), 6)

    # --------------------------------------------------------
    # 7. Create API-ready Forecast Object
    # --------------------------------------------------------
    forecast_object = {
        "phc_id": str(row["phc_id"]),
        "medicine_id": str(row["medicine_id"]),

        "forecast_horizon": "15_days",

        "predicted_15_day_demand": round(
            predicted_demand, 2
        ),

        "current_stock": round(
            current_stock, 2
        ),

        "safety_stock": round(
            safety_stock, 2
        ),

        "expected_shortage": round(
            expected_shortage, 2
        ),

        "stock_ratio": round(
            stock_ratio, 4
        ),

        "risk_level": risk_level,

        "model_version": MODEL_VERSION,

        "generated_at": forecast_generated_at,

        # Numeric values given to the ML model
        "model_inputs": model_inputs,

        # XGBoost prediction-level explanation
        "top_model_drivers": top_model_drivers,

        # Deterministic inventory-risk explanation
        "risk_reasons": risk_reasons
    }

    forecast_objects.append(forecast_object)


# ============================================================
# 8. Save Forecast Objects as JSON
# ============================================================

forecast_object_file = "forecast_objects.json"

with open(
    forecast_object_file,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        forecast_objects,
        f,
        indent=2,
        ensure_ascii=False
    )


print(
    f"\nForecast Objects saved to: "
    f"{forecast_object_file}"
)


# ============================================================
# 9. Display first Forecast Object
# ============================================================

print("\n" + "-" * 70)
print("SAMPLE FORECAST OBJECT")
print("-" * 70)

print(
    json.dumps(
        forecast_objects[0],
        indent=2,
        ensure_ascii=False
    )
)


# ============================================================
# 10. Architecture note
# ============================================================

print("\n" + "-" * 70)
print("EXPLAINABILITY STATUS")
print("-" * 70)

print(
    "XGBoost provides prediction-level feature contributions."
)

print(
    "Inventory rules determine risk_level and expected_shortage."
)

print(
    "Gemini should explain these numeric results, "
    "not calculate the risk itself."
)

print(
    f"Total Forecast Objects: {len(forecast_objects)}"
)

# ============================================================
# 32. FINAL SUMMARY
# ============================================================

print("\n============================================================")
print("PIPELINE COMPLETED")
print("============================================================")


print(
    "Model version:",
    MODEL_VERSION
)


print(
    "XGBoost MAE:",
    round(
        xgb_mae,
        2
    )
)


print(
    "XGBoost RMSE:",
    round(
        xgb_rmse,
        2
    )
)


print(
    "Sample Risk level:",
    risk_level
)


print("\nGenerated files:")

print(
    "1. model_comparison.csv"
)

print(
    "2. forecast_feature_importance.csv"
)

print(
    "3. test_predictions.csv"
)

print(
    "4. risk_result.csv"
)

print(
    "5. all_risk_results.csv"
)

print(
    "6. models/xgb_demand_model.pkl"
)


print("\nDone.")