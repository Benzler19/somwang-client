"""
Simple LSTM training script (demo). Generates synthetic monthly sales data
and trains a tiny LSTM to forecast next `n_forecast` months. Saves model to
`model_lstm.h5`.

Usage:
  python train_lstm.py

This is a small demo — for production replace synthetic data with your real
sales history and tune hyperparameters.
"""
import os
import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping

MODEL_PATH = "model_lstm.h5"

# generate synthetic monthly sales for 3 years (36 months)
np.random.seed(42)
months = 36
base = 200 + np.linspace(0, 50, months)
season = 20 * np.sin(np.arange(months) * 2 * np.pi / 12)
noise = np.random.normal(scale=8, size=months)
sales = (base + season + noise).astype(float)

# save sample CSV for reference
os.makedirs("data", exist_ok=True)
pd.DataFrame({"sales": sales}).to_csv("data/sample_sales.csv", index=False)

# prepare supervised data
def create_sequences(series, seq_len=12):
    X, y = [], []
    for i in range(len(series) - seq_len):
        X.append(series[i : i + seq_len])
        y.append(series[i + seq_len])
    return np.array(X), np.array(y)

SEQ_LEN = 12
X, y = create_sequences(sales, SEQ_LEN)
X = X.reshape((X.shape[0], X.shape[1], 1))

# simple model
model = Sequential([
    LSTM(32, input_shape=(SEQ_LEN, 1)),
    Dense(16, activation="relu"),
    Dense(1),
])
model.compile(optimizer="adam", loss="mse")

es = EarlyStopping(monitor="loss", patience=5, restore_best_weights=True)
model.fit(X, y, epochs=50, batch_size=8, callbacks=[es], verbose=1)

model.save(MODEL_PATH)
print(f"Saved model to {MODEL_PATH}")
