LSTM Forecast Prototype (FastAPI)

Quick start (Windows / PowerShell):

1. Create virtual env and install deps

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. (Optional) Train model manually

```powershell
python train_lstm.py
```

3. Run API

```powershell
uvicorn app:app --reload --port 8000
```

4. Test

POST http://localhost:8000/predict
Body (JSON): { "forecast_periods": 3 }

This is a demo prototype. Use real sales history CSV or modify the app to
read from your database. Training parameters here are minimal for speed.
