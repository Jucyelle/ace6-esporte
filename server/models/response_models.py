from typing import Optional
from pydantic import BaseModel
from pydantic import BaseModel, EmailStr
from datetime import datetime

from ..enums.user_roles import UserRole
from ..enums.user_identities import UserIdentity

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    identity: UserIdentity
    student_registration: Optional[str] = None
    role: UserRole = UserRole.USER

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    active: bool
    role: UserRole
    identity: UserIdentity
    student_registration: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordUpdateRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class StatusUpdateRequest(BaseModel):
    id: int
    active: bool

class PasswordRecoveryRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    recovery_code: int

class RecoveryCodeResponse(BaseModel):
    email: str
    recovery_code: int
    expires_at: datetime