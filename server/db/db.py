import sqlite3
from typing import Optional
from datetime import datetime, timedelta
from server.models.response_models import UserResponse
from server.enums.user_roles import UserRole
from server.enums.user_identities import UserIdentity
from server.models.user import User

class DBConnection:
    def __init__(self) -> None:
        self._db_name = "server/db/physioTrack.db"
        self.db_connection = sqlite3.connect(
            self._db_name,
            check_same_thread=False,
            timeout=5,
        )
        self._create_db()

    def _create_db(self) -> None:
        cursor = self.db_connection.cursor()
        print("Creating database...")

        if not self._check_table_exists(cursor, "Users"):
            print("Users table does not exist. Creating...")
            self._create_table(cursor, "Users", self._users_table_schema())

            self.db_connection.commit()
        else:
            print("Users table already exists.")

        if not self._check_table_exists(cursor, "PasswordRecoveryCodes"):
            print("PasswordRecoveryCodes table does not exist. Creating...")
            self._create_table(cursor, "PasswordRecoveryCodes", self._password_recovery_codes_table_schema())

            self.db_connection.commit()
        else:
            print("PasswordRecoveryCodes table already exists.")
        
        cursor.close()
    
    def _check_table_exists(self, cursor, table_name: str) -> bool:
        cursor.execute(
            f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';"
        )
        exists = cursor.fetchone() is not None
        print(f"Table exists: {exists}")
        return exists
    
    def _create_table(self, cursor, table_name: str, schema: str) -> None:
        cursor.execute(f"CREATE TABLE IF NOT EXISTS {table_name} ({schema});")
        print(f"Table {table_name} created with schema: {schema}")

    def _users_table_schema(self) -> str:
        return """
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            hashed_password TEXT NOT NULL,
            active BOOLEAN NOT NULL DEFAULT 0,
            role INTEGER NOT NULL DEFAULT 1,
            identity INTEGER NOT NULL CHECK(identity IN (0, 1)),
            student_registration TEXT UNIQUE,
            CONSTRAINT users_email_unique UNIQUE (email),
            CONSTRAINT student_registration_unique UNIQUE (student_registration)
        """
    
    def _password_recovery_codes_table_schema(self) -> str:
        return """
            email TEXT PRIMARY KEY,
            recovery_code INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL
        """
    
    def insert_user(self, name: str, email: str, hashed_password: str, identity: UserIdentity, student_registration: Optional[str] = None, role: UserRole = UserRole.USER) -> UserResponse:
        cursor = self.db_connection.cursor()
        try:
            print(f"Inserting user: {email}")
            cursor.execute(
                """
                INSERT INTO Users(name, email, hashed_password, role, identity, student_registration)
                VALUES(?, ?, ?, ?, ?, ?)
                """,
                (name, email, hashed_password, role.value, identity.value, student_registration)
            )
            self.db_connection.commit()
            user_id = cursor.lastrowid
            print(f"User inserted with ID: {user_id}")

            return UserResponse(
                id=user_id,
                name=name,
                email=email,
                active=False,
                role=UserRole(role),
                identity=UserIdentity(identity),
                student_registration=student_registration
            )
        except sqlite3.IntegrityError as e:
            if "UNIQUE constraint failed: Users.student_registration" in str(e):
                raise ValueError("Student registration already exists")
            elif "UNIQUE constraint failed: Users.email" in str(e):
                raise ValueError("Email already registered")
            else:
                raise ValueError("An error occurred during user insertion")
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            raise ValueError("An error occurred while inserting the user")
        finally:
            cursor.close()

    def get_all_users(self):
        cursor = self.db_connection.cursor()
        try:
            print("Fetching all users...")
            cursor.execute(
                """
                SELECT id, name, email, active, role, identity, student_registration
                FROM Users
                """
            )
            rows = cursor.fetchall()

            print(f"Users fetched: {rows}")
            return rows
        except Exception as e:
            print(f"An error occurred: {e}")
            raise ValueError("An error occurred while fetching users.")
        finally:
            cursor.close()
    
    def get_user_by_email(self, email: str) -> User:
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(
                """
                SELECT id, name, email, hashed_password, active, role, identity
                FROM Users
                WHERE email = ?
                """,
                (email,)
            )
            user_data = cursor.fetchone()

            if user_data:
                return User(
                    id=user_data[0],
                    name=user_data[1],
                    email=user_data[2],
                    hashed_password=user_data[3],
                    active=bool(user_data[4]),
                    role=UserRole(user_data[5]),
                    identity=UserIdentity(user_data[6])
                )
            else:
                raise ValueError("User not found")
        except sqlite3.Error as e:
            print(f"Database error occurred: {e}")
            raise ValueError("An error occurred while retrieving the user")
        finally:
            cursor.close()
        
    def update_password(self, email: str, new_password: str) -> None:
        hashed_password = User.hash_password(new_password)
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(
                """
                UPDATE Users
                SET hashed_password = ?
                WHERE email = ?
                """,
                (hashed_password, email)
            )
            self.db_connection.commit()
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            raise ValueError("An error occurred while updating the password")
        finally:
            cursor.close()

    def update_user_active_status(self, user_id: int, active: bool) -> None:
        cursor = self.db_connection.cursor()
        try:
            cursor.execute(
                """
                UPDATE Users
                SET active = ?
                WHERE id = ?
                """,
                (active, user_id)
            )
            if cursor.rowcount == 0:
                raise ValueError("User not found")
            self.db_connection.commit()
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            raise ValueError("An error occurred while updating the user's active status")
        finally:
            cursor.close()

    def store_recovery_code(self, email: str, recovery_code: int):
        cursor = self.db_connection.cursor()
        expires_at = datetime.now() + timedelta(minutes=10)  # Código expira em 10 minutos
        
        try:
            cursor.execute(
                """
                INSERT INTO PasswordRecoveryCodes (email, recovery_code, expires_at)
                VALUES (?, ?, ?)
                ON CONFLICT(email) DO UPDATE SET 
                    recovery_code = excluded.recovery_code,
                    expires_at = excluded.expires_at;
                """,
                (email, recovery_code, expires_at)
            )
            self.db_connection.commit()
        except sqlite3.Error as e:
            print(f"An error occurred: {e}")
            raise ValueError("An error occurred while storing recovery code")
    
    def get_recovery_code(self, email: str):
        cursor = self.db_connection.cursor()

        try:
            cursor.execute(
                """
                SELECT email, recovery_code, expires_at FROM PasswordRecoveryCodes
                WHERE email = ?
                """,
                (email,)
            )
            recovery_code_data = cursor.fetchone()

            if recovery_code_data:
                email, recovery_code, expires_at = recovery_code_data
                return recovery_code, expires_at
            else:
                return None
        except sqlite3.Error as e:
            print(f"Database error occurred: {e}")
            raise ValueError("An error occurred while fetching recovery code")
    
    def get_all_recovery_codes(self):
        cursor = self.db_connection.cursor()
        try:
            print("Fetching all recovery codes...")
            cursor.execute(
                """
                SELECT email, recovery_code, expires_at
                FROM PasswordRecoveryCodes
                """
            )
            rows = cursor.fetchall()

            print(f"Recovery codes fetched: {rows}")
            return rows
        except Exception as e:
            print(f"An error occurred: {e}")
            raise ValueError("An error occurred while fetching recovery codes.")
        finally:
            cursor.close()