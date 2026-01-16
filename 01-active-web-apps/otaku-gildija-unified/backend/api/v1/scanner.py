from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from core.database import get_db
from core.models import User
from core.auth import get_current_user
from services.file_scanner import FileScanner
from loguru import logger

router = APIRouter(prefix="/scanner", tags=["scanner"])

scan_status = {
    'is_scanning': False,
    'results': None,
    'error': None
}

class ScanRequest(BaseModel):
    directories: List[str]

def run_scan(directories: List[str]):
    global scan_status
    try:
        scan_status['is_scanning'] = True
        scan_status['error'] = None
        scanner = FileScanner(directories)
        results = scanner.scan()
        scan_status['results'] = results
        scan_status['is_scanning'] = False
        logger.info("Scan completed successfully")
    except Exception as e:
        scan_status['error'] = str(e)
        scan_status['is_scanning'] = False
        logger.error(f"Scan failed: {e}")

@router.post("/scan")
def trigger_scan(
    request: ScanRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    global scan_status
    if scan_status['is_scanning']:
        return {"message": "Scan already in progress"}
    background_tasks.add_task(run_scan, request.directories)
    return {"message": "Scan started", "directories": request.directories}

@router.get("/status")
def get_status(current_user: User = Depends(get_current_user)):
    return {
        'is_scanning': scan_status['is_scanning'],
        'error': scan_status['error']
    }

@router.get("/results")
def get_results(current_user: User = Depends(get_current_user)):
    if scan_status['results'] is None:
        return {"message": "No scan results available"}
    return scan_status['results']


