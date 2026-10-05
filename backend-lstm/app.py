"""
FastAPI server exposing a /predict endpoint using the LSTM model.
If `model_lstm.h5` is missing, the app will try to train a tiny demo model
on startup (using `train_lstm.py`).

Endpoints:
- GET /health -> { status: "ok" }
- POST /predict -> { forecast: [...], metrics: {...}, history: [...] }

This is a demo prototype. Replace/train with your real data and secure the API
appropriately for production.
"""
import os
import json
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_PATH = "model_lstm.h5"

app = FastAPI(title="LSTM Forecast Demo")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# lazy imports for tensorflow so app can start faster in environments without it
try:
    from tensorflow.keras.models import load_model
except Exception as e:
    load_model = None

# helper to ensure model exists
def ensure_model():
    if os.path.exists(MODEL_PATH) and load_model:
        return load_model(MODEL_PATH)
    # train quick demo model if not present
    print("Model not found — training demo model (train_lstm.py)")
    os.system("python train_lstm.py")
    if load_model:
        return load_model(MODEL_PATH)
    return None

class PredictRequest(BaseModel):
    history: list = None
    forecast_periods: int = 3

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictRequest):
    # For demo - if no history provided, read sample CSV
    if req.history:
        series = np.array(req.history, dtype=float)
    else:
        import pandas as pd
        if os.path.exists("data/sample_sales.csv"):
            df = pd.read_csv("data/sample_sales.csv")
            series = df["sales"].values.astype(float)
        else:
            # fallback synthetic
            series = np.linspace(200, 260, 36) + 10 * np.sin(np.arange(36) * 2 * np.pi / 12)

    model = ensure_model()
    if model is None:
        return {"error": "Model not available"}

    seq_len = 12
    n_forecast = max(1, int(req.forecast_periods))

    # prepare last seq
    last_seq = series[-seq_len:]
    preds = []
    cur_seq = last_seq.copy()
    for _ in range(n_forecast):
        x = cur_seq.reshape((1, seq_len, 1))
        p = float(model.predict(x, verbose=0)[0, 0])
        preds.append(round(p, 2))
        # slide window
        cur_seq = np.roll(cur_seq, -1)
        cur_seq[-1] = p

    # simple metrics comparing last n actuals if available
    metrics = {"mae": None, "rmse": None, "mape": None}
    if len(series) >= n_forecast:
        actual = series[-n_forecast:]
        errors = actual - np.array(preds[: len(actual)])
        mae = np.mean(np.abs(errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        mape = float(np.mean(np.abs(errors / (actual + 1e-8)))) * 100
        metrics = {"mae": round(float(mae), 2), "rmse": round(rmse, 2), "mape": round(mape, 2)}

    return {"forecast": preds, "metrics": metrics, "history_last": list(series[-seq_len:])}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
