#!/usr/bin/env python3
"""
Database Module - SQLite operations for local storage.
"""

import sqlite3
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import json


class Database:
    """SQLite database for local file organizer data."""
    
    def __init__(self, db_path: Path):
        """
        Initialize the database.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.conn = None
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database schema."""
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        
        cursor = self.conn.cursor()
        
        # Files table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER,
                category TEXT,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Metadata cache table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metadata_cache (
                file_path TEXT PRIMARY KEY,
                metadata TEXT NOT NULL,
                extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Organization history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS organization_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT NOT NULL,
                original_path TEXT,
                new_path TEXT,
                operation_type TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # User preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS preferences (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Learning data table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learning_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern TEXT NOT NULL,
                user_action TEXT NOT NULL,
                count INTEGER DEFAULT 1,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        self.conn.commit()
    
    def save_file_metadata(self, file_path: Path, metadata: Dict[str, Any], category: str = None):
        """
        Save file metadata to database.
        
        Args:
            file_path: Path to the file
            metadata: Metadata dictionary
            category: File category
        """
        cursor = self.conn.cursor()
        
        try:
            file_stat = file_path.stat()
            file_size = file_stat.st_size
        except:
            file_size = None
        
        metadata_json = json.dumps(metadata)
        
        cursor.execute("""
            INSERT OR REPLACE INTO files 
            (file_path, file_name, file_size, category, metadata, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (str(file_path), file_path.name, file_size, category, metadata_json, datetime.now()))
        
        # Also update metadata cache
        cursor.execute("""
            INSERT OR REPLACE INTO metadata_cache 
            (file_path, metadata, extracted_at)
            VALUES (?, ?, ?)
        """, (str(file_path), metadata_json, datetime.now()))
        
        self.conn.commit()
    
    def get_file_metadata(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """
        Get cached metadata for a file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Metadata dictionary or None if not found
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT metadata FROM metadata_cache WHERE file_path = ?", (str(file_path),))
        row = cursor.fetchone()
        
        if row:
            return json.loads(row['metadata'])
        return None
    
    def log_organization(self, file_path: Path, original_path: Path, 
                        new_path: Path, operation_type: str):
        """
        Log an organization operation.
        
        Args:
            file_path: Path to the file
            original_path: Original path before organization
            new_path: New path after organization
            operation_type: Type of operation (move, copy, etc.)
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO organization_history 
            (file_path, original_path, new_path, operation_type)
            VALUES (?, ?, ?, ?)
        """, (str(file_path), str(original_path), str(new_path), operation_type))
        self.conn.commit()
    
    def get_organization_history(self, limit: int = 100) -> List[Dict]:
        """
        Get organization history.
        
        Args:
            limit: Maximum number of records to return
            
        Returns:
            List of organization history records
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM organization_history 
            ORDER BY timestamp DESC 
            LIMIT ?
        """, (limit,))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def save_preference(self, key: str, value: Any):
        """
        Save a user preference.
        
        Args:
            key: Preference key
            value: Preference value (will be JSON-encoded)
        """
        cursor = self.conn.cursor()
        value_json = json.dumps(value)
        cursor.execute("""
            INSERT OR REPLACE INTO preferences (key, value, updated_at)
            VALUES (?, ?, ?)
        """, (key, value_json, datetime.now()))
        self.conn.commit()
    
    def get_preference(self, key: str, default: Any = None) -> Any:
        """
        Get a user preference.
        
        Args:
            key: Preference key
            default: Default value if not found
            
        Returns:
            Preference value or default
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT value FROM preferences WHERE key = ?", (key,))
        row = cursor.fetchone()
        
        if row:
            return json.loads(row['value'])
        return default
    
    def save_learning_data(self, pattern: str, user_action: str):
        """
        Save learning data (user behavior patterns).
        
        Args:
            pattern: Pattern to learn
            user_action: Action taken by user
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO learning_data (pattern, user_action, count, last_used)
            VALUES (?, ?, 1, ?)
            ON CONFLICT(pattern, user_action) DO UPDATE SET
                count = count + 1,
                last_used = ?
        """, (pattern, user_action, datetime.now(), datetime.now()))
        self.conn.commit()
    
    def get_learning_data(self, pattern: str) -> List[Dict]:
        """
        Get learning data for a pattern.
        
        Args:
            pattern: Pattern to look up
            
        Returns:
            List of learning data records
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM learning_data 
            WHERE pattern LIKE ? 
            ORDER BY count DESC, last_used DESC
        """, (f'%{pattern}%',))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

