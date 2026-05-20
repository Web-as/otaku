"""
User Authentication and Data Isolation Module
Ensures secure, personal data for each user account
"""
import hashlib
import secrets
import time
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dataclasses import dataclass, field
from enum import Enum
import jwt
import bcrypt


class UserRole(Enum):
    """
    User role hierarchy (lowest → highest privilege):

      USER       – standard library card holder
      PREMIUM    – premium membership; priority queue and extra features
      LIBRARIAN  – Head Librarian / staff; full patron management,
                   cannot create other librarians or admins
      ADMIN      – system administrator; unrestricted access
    """
    USER      = "user"
    PREMIUM   = "premium"
    LIBRARIAN = "librarian"
    ADMIN     = "admin"

    # Convenience helpers
    @classmethod
    def staff_roles(cls):
        """Roles that are considered library staff (librarian + admin)."""
        return {cls.LIBRARIAN.value, cls.ADMIN.value}

    @classmethod
    def is_staff(cls, role_str: str) -> bool:
        return role_str in cls.staff_roles()


@dataclass
class User:
    """User data model with secure data isolation"""
    id: str
    username: str
    email: str
    password_hash: str
    role: UserRole = UserRole.USER
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert user to dictionary, optionally including sensitive data"""
        data = {
            "id": self.id,
            "username": self.username,
            "email": self.email if include_sensitive else None,
            "role": self.role.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "is_active": self.is_active,
        }
        if include_sensitive:
            data["password_hash"] = self.password_hash
            data["failed_login_attempts"] = self.failed_login_attempts
            data["locked_until"] = self.locked_until.isoformat() if self.locked_until else None
        return data


class UserAuthenticator:
    """Secure user authentication with data isolation"""
    
    def __init__(self, secret_key: str, config: Dict[str, Any]):
        self.secret_key = secret_key
        self.config = config
        self.token_expiry_hours = config.get("token_expiry_hours", 24)
        self.max_login_attempts = config.get("max_login_attempts", 5)
        self.lockout_duration_minutes = config.get("lockout_duration_minutes", 30)
        self.password_min_length = config.get("password_min_length", 12)
    
    def hash_password(self, password: str) -> str:
        """Securely hash password using bcrypt"""
        if len(password) < self.password_min_length:
            raise ValueError(f"Password must be at least {self.password_min_length} characters")
        
        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        return password_hash.decode('utf-8')
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    
    def generate_token(self, user: User) -> str:
        """Generate JWT token for authenticated user"""
        payload = {
            "user_id": user.id,
            "username": user.username,
            "role": user.role.value,
            "exp": datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            "iat": datetime.utcnow(),
            "jti": str(uuid.uuid4())
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def validate_login_attempt(self, user: User) -> tuple[bool, str]:
        """Check if login is allowed and update lockout status"""
        if not user.is_active:
            return False, "Account is deactivated"
        
        if user.locked_until and user.locked_until > datetime.utcnow():
            remaining = (user.locked_until - datetime.utcnow()).seconds // 60
            return False, f"Account locked. Try again in {remaining} minutes"
        
        return True, "Login allowed"
    
    def record_failed_attempt(self, user: User) -> None:
        """Record failed login attempt and lock if necessary"""
        user.failed_login_attempts += 1
        user.updated_at = datetime.utcnow()
        
        if user.failed_login_attempts >= self.max_login_attempts:
            user.locked_until = datetime.utcnow() + timedelta(minutes=self.lockout_duration_minutes)
    
    def record_successful_login(self, user: User) -> None:
        """Record successful login"""
        user.last_login = datetime.utcnow()
        user.failed_login_attempts = 0
        user.locked_until = None
        user.updated_at = datetime.utcnow()
    
    def create_user(self, username: str, email: str, password: str, role: UserRole = UserRole.USER) -> User:
        """Create new user with secure password hashing"""
        return User(
            id=str(uuid.uuid4()),
            username=username,
            email=email,
            password_hash=self.hash_password(password),
            role=role
        )
    
    def authenticate_user(self, username: str, password: str, users_db: Dict[str, User]) -> tuple[Optional[User], Optional[str]]:
        """Authenticate user and return user with token"""
        user = users_db.get(username)
        
        if not user:
            return None, "Invalid username or password"
        
        is_allowed, message = self.validate_login_attempt(user)
        if not is_allowed:
            return None, message
        
        if self.verify_password(password, user.password_hash):
            self.record_successful_login(user)
            token = self.generate_token(user)
            return user, token
        
        self.record_failed_attempt(user)
        return None, "Invalid username or password"


class DataIsolationManager:
    """Ensures complete data isolation between user accounts"""
    
    def __init__(self, authenticator: UserAuthenticator):
        self.authenticator = authenticator
    
    def get_user_data_scope(self, token: str) -> Optional[Dict[str, Any]]:
        """Get user's data scope from token for data isolation"""
        payload = self.authenticator.decode_token(token)
        if not payload:
            return None
        
        return {
            "user_id": payload["user_id"],
            "username": payload["username"],
            "role": payload["role"]
        }
    
    def validate_user_access(self, token: str, resource_user_id: str) -> bool:
        """Validate user has access to specific resource"""
        scope = self.get_user_data_scope(token)
        if not scope:
            return False
        
        # Staff (librarian + admin) can access all patron data
        if UserRole.is_staff(scope["role"]):
            return True

        return scope["user_id"] == resource_user_id

    def sanitize_user_data(self, data: Dict[str, Any], token: str) -> Dict[str, Any]:
        """Remove sensitive data based on user access level"""
        scope = self.get_user_data_scope(token)
        if not scope:
            return {}

        # Staff can see everything; regular patrons cannot see sensitive fields
        if not UserRole.is_staff(scope["role"]):
            sensitive_keys = ["password_hash", "email", "failed_login_attempts", "locked_until"]
            return {k: v for k, v in data.items() if k not in sensitive_keys}

        return data


class SessionManager:
    """Manage user sessions securely"""
    
    def __init__(self, authenticator: UserAuthenticator, config: Dict[str, Any]):
        self.authenticator = authenticator
        self.session_timeout_minutes = config.get("session_timeout_minutes", 60)
        self.sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, user: User) -> Dict[str, Any]:
        """Create new session for user"""
        session_id = secrets.token_urlsafe(32)
        session = {
            "session_id": session_id,
            "user_id": user.id,
            "username": user.username,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "is_active": True
        }
        self.sessions[session_id] = session
        return session
    
    def validate_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Validate session is active and not expired"""
        session = self.sessions.get(session_id)
        if not session:
            return None
        
        # Check if session is active
        if not session.get("is_active", False):
            return None
        
        # Check session timeout
        last_activity = session.get("last_activity", datetime.utcnow())
        if datetime.utcnow() - last_activity > timedelta(minutes=self.session_timeout_minutes):
            self.terminate_session(session_id)
            return None
        
        # Update last activity
        session["last_activity"] = datetime.utcnow()
        return session
    
    def terminate_session(self, session_id: str) -> bool:
        """Terminate a session"""
        if session_id in self.sessions:
            self.sessions[session_id]["is_active"] = False
            del self.sessions[session_id]
            return True
        return False
    
    def cleanup_expired_sessions(self) -> int:
        """Remove all expired sessions"""
        expired_count = 0
        now = datetime.utcnow()
        expired_sessions = [
            sid for sid, session in self.sessions.items()
            if not session.get("is_active", False) or
            (now - session.get("last_activity", now)) > timedelta(minutes=self.session_timeout_minutes)
        ]
        
        for sid in expired_sessions:
            self.terminate_session(sid)
            expired_count += 1
        
        return expired_count
