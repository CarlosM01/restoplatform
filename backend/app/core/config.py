from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/restoplatform"
    secret_key: str = "cambiame-en-produccion"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    transbank_commerce_code: str = "597055555532"
    transbank_api_key: str = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
    frontend_url: str = "http://localhost:4321"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
