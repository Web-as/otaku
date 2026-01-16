@echo off
echo Starting Otaku Gildija Unified...
echo.

echo [1/2] Starting Backend...
start "Otaku Gildija - Backend" cmd /c "cd backend && if not exist .venv (python -m venv .venv) && call .venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend...
start "Otaku Gildija - Frontend" cmd /c "cd frontend && npm install && npm run dev"

echo.
echo Both services are starting...
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
