#!/usr/bin/env python3
"""
Gamification module - XP, achievements, quests, gacha system.
"""

from .database import GamificationDatabase
from .gamification_manager import GamificationManager

__all__ = ['GamificationDatabase', 'GamificationManager']

