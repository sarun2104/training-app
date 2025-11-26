"""
API routes for capstone management
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging

from backend.models.schemas import (
    CapstoneListItem,
    CapstoneDetail,
)
from backend.database import get_postgres_db
from backend.utils.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/api/capstones", tags=["capstones"])
logger = logging.getLogger(__name__)


@router.get("", response_model=List[CapstoneListItem])
async def get_all_capstones(current_user: dict = Depends(get_current_user)):
    """
    Get list of all capstones (summary view)
    Available to all authenticated users
    """
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT capstone_id, capstone_name, tags, duration_weeks
        FROM capstones
        ORDER BY capstone_name
        """
        capstones = postgres_db.execute_query(query, fetch=True)

        # Convert to list of dicts if needed
        result = []
        for capstone in capstones:
            result.append({
                "capstone_id": capstone["capstone_id"],
                "capstone_name": capstone["capstone_name"],
                "tags": capstone["tags"] or [],
                "duration_weeks": capstone["duration_weeks"],
            })

        return result
    except Exception as e:
        logger.error(f"Failed to fetch capstones: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{capstone_id}", response_model=CapstoneDetail)
async def get_capstone_detail(
    capstone_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed capstone information including weekly guidelines
    Available to all authenticated users
    """
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT capstone_id, capstone_name, tags, duration_weeks,
               dataset_link, guidelines, created_at, updated_at
        FROM capstones
        WHERE capstone_id = %s
        """
        result = postgres_db.execute_query(query, (capstone_id,), fetch=True)

        if not result:
            raise HTTPException(status_code=404, detail="Capstone not found")

        capstone = result[0]

        return {
            "capstone_id": capstone["capstone_id"],
            "capstone_name": capstone["capstone_name"],
            "tags": capstone["tags"] or [],
            "duration_weeks": capstone["duration_weeks"],
            "dataset_link": capstone["dataset_link"],
            "guidelines": capstone["guidelines"],  # JSONB will be automatically parsed
            "created_at": capstone["created_at"],
            "updated_at": capstone["updated_at"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch capstone {capstone_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
