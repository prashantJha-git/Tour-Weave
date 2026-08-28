@echo off
REM ════════════════════════════════════════════════════════════════
REM  Tour-Weave -- one-click setup and run for Windows.
REM  Double-click this file, or run it from PowerShell / cmd.
REM ════════════════════════════════════════════════════════════════
setlocal
cd /d "%~dp0"

echo ================================================
echo   Tour-Weave - AI Tourism Crowd Intelligence
echo ================================================

echo.
echo [1/5] Setting up backend virtual environment...
cd backend
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate.bat

echo.
echo [2/5] Installing backend dependencies (first run can take a minute)...
python -m pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if not exist "models\crowd_model.joblib" (
    echo.
    echo [3/5] No trained model found - training it now, one-time only...
    python preprocess_data.py
    python train_model.py
) else (
    echo.
    echo [3/5] Pre-trained model found - skipping training.
)

echo.
echo [4/5] Starting backend API on http://localhost:8000 ...
start "Tour-Weave Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo.
echo [5/5] Setting up and starting frontend on http://localhost:5173 ...
cd frontend
if not exist "node_modules" (
    call npm install
)
start "Tour-Weave Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ================================================
echo   Tour-Weave is starting in two new windows:
echo     Frontend  - http://localhost:5173
echo     Backend   - http://localhost:8000
echo     API docs  - http://localhost:8000/docs
echo   Close those windows to stop the servers.
echo ================================================
pause
