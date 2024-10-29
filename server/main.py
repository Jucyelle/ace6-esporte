import random
import smtplib
import email.message
from http.client import HTTPException
from fastapi import FastAPI, Response, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
#from email.mime.text import MIMEText

from .models.user import User
from .models.password_recovery_code import PasswordRecoveryCode
from .models.response_models import StatusUpdateRequest, UserCreate, UserResponse, LoginRequest, PasswordUpdateRequest, PasswordRecoveryRequest, VerifyCodeRequest, RecoveryCodeResponse

from .enums.user_roles import UserRole
from .enums.user_identities import UserIdentity

from .db.db import DBConnection

app = FastAPI()
db_connection = DBConnection()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "4864cb4857a68e3a5d57af391a92d5644ecfa64569dea322fa7192c61489cba9"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

SMTP_SERVER = "smtp.gmail.com"
PORT = 587
USERNAME = "cpt.ufal.ace6.esporte@gmail.com"
PASSWORD = "nfhtkjqemfqpzqtx" # Cria uma senha de app no gmail

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return {"detail": "Token is valid!"}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

def send_email(recipient_email: str, code: int):
    subject = "Código de Recuperação de Senha"
    body = f"Seu código de recuperação de senha é: {code}"

    msg = email.message.Message()
    msg['Subject'] = subject
    msg['From'] = USERNAME
    msg['To'] = recipient_email
    msg.add_header('Content-Type', 'text/html')
    msg.set_payload(body)
    
    try:
        server = smtplib.SMTP(f'{SMTP_SERVER}: {PORT}')
        server.starttls()

        server.login(msg['From'], PASSWORD)
        server.sendmail(msg['From'], msg['To'], msg.as_string().encode('utf-8'))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred")

def create_reset_token(email: str, recovery_code: int, expires_delta: timedelta = None):
    data = {
        "sub": email,
        "recovery_code": recovery_code
    }
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=10)

    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/verify-token")
def verify_token_route(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, response: Response):
    try:
        hashed_password = User.hash_password(user.password)
        created_user = db_connection.insert_user(
            name=user.name,
            email=user.email,
            hashed_password=hashed_password,
            identity=user.identity,
            student_registration=user.student_registration,
            role=user.role
        )
        return {"detail": "User registered successfully!", "user": created_user}
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"detail": str(e)}
    
@app.get("/users", status_code=status.HTTP_200_OK)
def get_all_users(response: Response):
    rows = db_connection.get_all_users()
    users: List[User] = []
 
    if not rows:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"detail": "No users found"}

    for row in rows:
        print(row)
        users.append(
            UserResponse(
                id=row[0],
                name=row[1],
                email=row[2],
                active=bool(row[3]),
                role=UserRole(row[4]),
                identity=UserIdentity(row[5]),
                student_registration=row[6]
            )
        )

    return {"detail": "Users found with success!", "users": users}

@app.post("/login", status_code=status.HTTP_200_OK)
def login(request: LoginRequest, response: Response):
    try: 
        user = db_connection.get_user_by_email(request.email)
        if user.active and User.verify_password(request.password, user.hashed_password):
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            token = create_access_token(
                data={"sub": user.email}, expires_delta=access_token_expires
            )

            return {"detail": "Login successful", "access_token": token, "token_type": "bearer"}
        else:
            response.status_code = status.HTTP_401_UNAUTHORIZED
            return {"detail": "Invalid credentials or inactive user"}
    except ValueError as e:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"detail": str(e)}
    
@app.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(request: PasswordUpdateRequest, response: Response):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        recovery_code = payload.get("recovery_code")

        if email is None or recovery_code is None:
            response.status_code = status.HTTP_401_UNAUTHORIZED
            return {"detail": "Invalid token"}
        
        if request.new_password != request.confirm_password:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"detail": "Passwords do not match"}

        db_connection.update_password(email, request.new_password)
        return {"detail": "Password updated successfully"}
    except ValueError as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}
    
@app.post("/update-user-status", status_code=status.HTTP_200_OK)
def update_user_status(request: StatusUpdateRequest, response: Response):
    try:
        db_connection.update_user_active_status(request.id, request.active)
        return {"detail": f"User with ID {request.id} updated successfully the activity for {request.active}"}
    except ValueError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"detail": str(e)}
    
@app.post("/send-password-recovery-code", status_code=status.HTTP_200_OK)
def send_password_recovery_code(request: PasswordRecoveryRequest, response: Response):
    try:
        db_connection.get_user_by_email(request.email)

        recovery_code = random.randint(10000, 99999)
        db_connection.store_recovery_code(request.email, recovery_code)

        send_email(request.email, recovery_code)

        return {"detail": "Recovery code sent successfully"}
    except ValueError as e:
        if str(e) == "User not found":
            response.status_code = status.HTTP_404_NOT_FOUND
        else:
            response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

        return {"detail": str(e)}

@app.post("/verify-recovery-code", status_code=status.HTTP_200_OK)
def verify_recovery_code(request: VerifyCodeRequest, response: Response):
    try:
        recovery_data = db_connection.get_recovery_code(request.email)
        
        if not recovery_data:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"detail": "Recovery code not found"}
        
        stored_code, expires_at = recovery_data

        if stored_code != request.recovery_code:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"detail": "Invalid recovery code"}
        
        expires_at_str = datetime.fromisoformat(expires_at)

        if datetime.now() > expires_at_str:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"detail": "Recovery code has expired"}
        
        reset_token = create_reset_token(request.email, request.recovery_code)

        return {"detail": "Recovery code is valid", "reset_token": reset_token}
    
    except ValueError as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"detail": str(e)}
    
@app.get("/recovery-codes", status_code=status.HTTP_200_OK)
def get_all_recovery_codes(response: Response):
    rows = db_connection.get_all_recovery_codes()
    codes: List[PasswordRecoveryCode] = []
 
    if not rows:
        response.status_code = status.HTTP_404_NOT_FOUND
        return {"detail": "No recovery codes found"}

    for row in rows:
        print(row)
        codes.append(
            RecoveryCodeResponse(
                email=row[0],
                recovery_code=row[1],
                expires_at=row[2]
            )
        )

    return {"detail": "Recovery codes found with success!", "codes": codes}