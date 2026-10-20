from fastapi import FastAPI
from app.routers import apod
from app.exceptions import ApiServerError
from fastapi import Request
from fastapi.responses import JSONResponse
from mangum import Mangum


app = FastAPI(title="My Planet")
app.include_router(apod.router)

'''' Exceptions'''
@app.exception_handler(ApiServerError)
def out_air_api_server_error(request: Request, exc: ApiServerError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": "Erro ao acessar a API da NASA."},
    )

handler = Mangum(app)




