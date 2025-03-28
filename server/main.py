from fastapi import FastAPI
from auth import router as auth_router
from mbi_test_service import router as mbi_router
from user_service import router as user_router
app = FastAPI()

## Include routers
# app.include_router(mbi_router, prefix="/mbi", tags=["mbi"])
# app.include_router(auth_router, prefix="/auth", tags=["auth"])
# app.include_router(user_router, prefix="/user", tags=["user"])
app.include_router(auth_router)
app.include_router(mbi_router)
app.include_router(user_router)

## Mount each sub-app if needed
# app.mount("/mbi", mbi_app)
#app.mount("/user", user_app)
