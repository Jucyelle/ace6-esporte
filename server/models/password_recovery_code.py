from dataclasses import dataclass
from datetime import datetime

@dataclass
class PasswordRecoveryCode:
    email: str
    recovery_code: int
    expires_at: datetime