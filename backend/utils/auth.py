from typing import Optional
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.supabaseClient import supabase_admin

security = HTTPBearer(auto_error=False)


class GuestUser:
    id = None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """
    Auth is optional during the current development phase.
    If a valid Supabase access token is supplied, use that user.
    Otherwise return a guest identity so the app can be used before Auth is wired.
    """
    if credentials and supabase_admin:
        try:
            result = supabase_admin.auth.get_user(credentials.credentials)
            if result and result.user:
                return result.user
        except Exception as exc:
            print("[AUTH] Token validation failed; using guest mode:", exc)
    return GuestUser()
