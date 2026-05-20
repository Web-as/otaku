"""
Secure Environment Configuration Handler
Manages environment variables and sensitive configuration
"""
import os
import json
import secrets
import hashlib
from typing import Dict, Any, Optional
from dataclasses import dataclass, field
from datetime import datetime
import logging


@dataclass
class SecureConfig:
    """Secure configuration container"""
    secret_key: str = ""
    database_path: str = "./data/anime_manga_agent.db"
    api_keys: Dict[str, str] = field(default_factory=dict)
    encryption_enabled: bool = True
    debug_mode: bool = False
    log_level: str = "INFO"
    cors_origins: list = field(default_factory=list)
    
    def __post_init__(self):
        if not self.secret_key:
            self.secret_key = self._generate_secret_key()
    
    def _generate_secret_key(self) -> str:
        """Generate a cryptographically secure secret key"""
        return secrets.token_hex(32)
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Export configuration, optionally including sensitive data"""
        data = {
            "secret_key": self.secret_key if include_sensitive else "***",
            "database_path": self.database_path,
            "api_keys": {k: "***" for k in self.api_keys.keys()} if not include_sensitive else self.api_keys,
            "encryption_enabled": self.encryption_enabled,
            "debug_mode": self.debug_mode,
            "log_level": self.log_level,
            "cors_origins": self.cors_origins
        }
        return data


class EnvironmentManager:
    """Manage secure environment configuration"""
    
    ENV_PREFIX = "ANIME_AGENT_"
    
    # Environment variable mappings
    ENV_MAPPINGS = {
        "secret_key": f"{ENV_PREFIX}SECRET_KEY",
        "database_path": f"{ENV_PREFIX}DATABASE_PATH",
        "debug_mode": f"{ENV_PREFIX}DEBUG",
        "log_level": f"{ENV_PREFIX}LOG_LEVEL",
        "cors_origins": f"{ENV_PREFIX}CORS_ORIGINS"
    }
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path
        self.config = self._load_config()
        self._validate_environment()
    
    def _load_config(self) -> SecureConfig:
        """Load configuration from file and environment"""
        # Start with file config if available
        file_config = self._load_file_config()
        
        # Override with environment variables
        return self._apply_env_overrides(file_config)
    
    def _load_file_config(self) -> SecureConfig:
        """Load configuration from JSON file"""
        if not self.config_path or not os.path.exists(self.config_path):
            return SecureConfig()
        
        try:
            with open(self.config_path, 'r') as f:
                data = json.load(f)
            
            return SecureConfig(
                secret_key=data.get("security", {}).get("secret_key", ""),
                database_path=data.get("database", {}).get("path", "./data/anime_manga_agent.db"),
                api_keys=data.get("api_keys", {}),
                encryption_enabled=data.get("security", {}).get("encryption_enabled", True),
                debug_mode=data.get("server", {}).get("debug", False),
                log_level=data.get("logging", {}).get("level", "INFO"),
                cors_origins=data.get("server", {}).get("cors_origins", [])
            )
        except Exception as e:
            logging.warning(f"Failed to load config file: {e}")
            return SecureConfig()
    
    def _apply_env_overrides(self, config: SecureConfig) -> SecureConfig:
        """Apply environment variable overrides"""
        # Secret key from environment
        env_key = os.environ.get(self.ENV_MAPPINGS["secret_key"])
        if env_key:
            config.secret_key = env_key
        
        # Database path
        db_path = os.environ.get(self.ENV_MAPPINGS["database_path"])
        if db_path:
            config.database_path = db_path
        
        # Debug mode
        debug = os.environ.get(self.ENV_MAPPINGS["debug_mode"])
        if debug:
            config.debug_mode = debug.lower() in ("true", "1", "yes")
        
        # Log level
        log_level = os.environ.get(self.ENV_MAPPINGS["log_level"])
        if log_level:
            config.log_level = log_level
        
        # CORS origins
        cors_env = os.environ.get(self.ENV_MAPPINGS["cors_origins"])
        if cors_env:
            try:
                config.cors_origins = json.loads(cors_env)
            except json.JSONDecodeError:
                config.cors_origins = [cors_env]
        
        return config
    
    def _validate_environment(self):
        """Validate environment configuration"""
        issues = []
        
        # Check for insecure configurations
        if self.config.debug_mode:
            issues.append("Warning: Debug mode is enabled")
        
        # Check secret key strength
        if len(self.config.secret_key) < 32:
            issues.append("Warning: Secret key is too short")
        
        # Check database path
        if not os.path.exists(os.path.dirname(self.config.database_path)):
            try:
                os.makedirs(os.path.dirname(self.config.database_path), exist_ok=True)
            except Exception as e:
                issues.append(f"Cannot create database directory: {e}")
        
        # Log warnings
        for issue in issues:
            logging.warning(issue)
    
    def get_config(self) -> SecureConfig:
        """Get the current configuration"""
        return self.config
    
    def update_config(self, updates: Dict[str, Any]) -> None:
        """Update configuration with new values"""
        if "secret_key" in updates:
            self.config.secret_key = updates["secret_key"]
        if "database_path" in updates:
            self.config.database_path = updates["database_path"]
        if "debug_mode" in updates:
            self.config.debug_mode = updates["debug_mode"]
        if "log_level" in updates:
            self.config.log_level = updates["log_level"]
        if "cors_origins" in updates:
            self.config.cors_origins = updates["cors_origins"]
    
    def save_config(self, path: str = None) -> None:
        """Save configuration to file"""
        save_path = path or self.config_path
        if not save_path:
            raise ValueError("No config path specified")
        
        config_data = {
            "security": {
                "secret_key": self.config.secret_key,
                "encryption_enabled": self.config.encryption_enabled
            },
            "database": {
                "path": self.config.database_path
            },
            "server": {
                "debug": self.config.debug_mode,
                "cors_origins": self.config.cors_origins
            },
            "logging": {
                "level": self.config.log_level
            }
        }
        
        # Create directory if needed
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'w') as f:
            json.dump(config_data, f, indent=2)
    
    def rotate_secret_key(self) -> str:
        """Rotate the secret key (for security)"""
        self.config.secret_key = self.config._generate_secret_key()
        logging.warning("Secret key has been rotated")
        return self.config.secret_key
    
    def get_api_key(self, key_name: str) -> Optional[str]:
        """Get an API key by name"""
        return self.config.api_keys.get(key_name)
    
    def set_api_key(self, key_name: str, key_value: str) -> None:
        """Set an API key"""
        self.config.api_keys[key_name] = key_value
    
    def hash_sensitive_data(self, data: str) -> str:
        """Hash sensitive data for secure storage"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def verify_sensitive_data(self, data: str, hashed: str) -> bool:
        """Verify sensitive data against hash"""
        return self.hash_sensitive_data(data) == hashed


class SecurityAuditor:
    """Audit security configuration"""
    
    def __init__(self, config: SecureConfig):
        self.config = config
        self.audit_log = []
    
    def audit(self) -> Dict[str, Any]:
        """Run security audit"""
        results = {
            "timestamp": datetime.utcnow().isoformat(),
            "issues": [],
            "warnings": [],
            "score": 100
        }
        
        # Check secret key
        if len(self.config.secret_key) < 32:
            results["issues"].append("Secret key is too short (minimum 32 characters)")
            results["score"] -= 20
        
        # Check debug mode
        if self.config.debug_mode:
            results["warnings"].append("Debug mode is enabled - not suitable for production")
            results["score"] -= 10
        
        # Check CORS
        if "*" in self.config.cors_origins:
            results["warnings"].append("CORS allows all origins - consider restricting")
            results["score"] -= 5
        
        # Check API keys
        if not self.config.api_keys:
            results["warnings"].append("No API keys configured")
        
        # Log audit
        self.audit_log.append(results)
        
        return results
    
    def get_audit_history(self) -> list:
        """Get audit history"""
        return self.audit_log
    
    def generate_report(self) -> str:
        """Generate human-readable security report"""
        audit = self.audit()
        
        report = f"""
Security Audit Report
=====================
Timestamp: {audit['timestamp']}
Security Score: {audit['score']}/100

Issues:
{chr(10).join(f"  - {issue}" for issue in audit['issues']) if audit['issues'] else "  None"}

Warnings:
{chr(10).join(f"  - {warning}" for warning in audit['warnings']) if audit['warnings'] else "  None"}
"""
        return report
