from typing import Union

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Optional
import logging
from datetime import datetime

load_dotenv()

app = FastAPI()


# Configura CORS (opcional, necesario para frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configura Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "images"  # Nombre del bucket en Supabase

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# try:
#     supabase.storage.create_bucket(BUCKET_NAME)
#     supabase.storage.update_bucket(
#         bucket_name,
#         {"public": True}  # Esta es la nueva forma de configurar visibilidad
#     )
# except Exception as e:
#     print("Bucket ya existe o error de configuración:", e)


@app.get("/")
def read_root():
    return {"Hello": "World"}



@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Verifica extensión
        allowed_extensions = {'jpg', 'jpeg', 'png'}
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(400, "Solo se permiten JPG/PNG")

        # Sube el archivo
        file_bytes = await file.read()
        res = supabase.storage.from_(BUCKET_NAME).upload(
            f"public/{file.filename}",  # Guarda en carpeta 'public'
            file_bytes,
            {"content-type": f"image/{file_ext}"}
        )
        
        return {"url": f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/{BUCKET_NAME}/public/{file.filename}"}
    
    except Exception as e:
        print("Error al subir imagen:", e)
        raise HTTPException(403, detail=f"Error de políticas: {str(e)}")
        
@app.post("/save-image-data")
async def save_image_data(
    filename: str,
    nombre_usuario: str,
    description: Optional[str] = None,
    estado: str = "activo"
):
    try:
        # Verificar que la imagen existe en Storage
        print(f"filename: {filename}")
        print(f"nombre_usuario: {nombre_usuario}")
        print(f"description: {description}")
        print(f"estado: {estado}")

        # Verificar que la imagen existe en Storage
        exists = False
        try:
            files = supabase.storage.from_("images").list("public")
            exists = any(f['name'] == filename for f in files)
        except Exception as e:
            print(f"Error al listar archivos: {e}")

        if not exists:
            raise HTTPException(404, detail="La imagen no existe en el bucket")
        image_url = supabase.storage.from_("images").get_public_url(filename)
        
        # Insertar en tabla

        image_data = {
            "nombre_imagen": filename,
            "descripcion": description,
            "fecha_toma": datetime.now().isoformat(),
            "nombre_usuario": nombre_usuario,
            "estado": estado,
            "url_imagen": image_url,
            "fecha_subida": datetime.now().isoformat()
        }

        response = supabase.table("imagenes").insert(image_data).execute()

        return {
            "message": "Metadatos guardados",
            "data": response.data[0]
        }

    except Exception as e:
        # Rollback: Eliminar imagen si falla la inserción
        supabase.storage.from_("imagenes").remove([filename])
        print("Error al guardar metadatos:", e)
        raise HTTPException(500, detail=f"Error al guardar metadatos: {str(e)}")


@app.get("/list-images")
async def list_images():
    try:
        response = supabase.table("imagenes").select("*").execute()
        return {"images": response.data}
    except Exception as e:
        raise HTTPException(500, detail=f"Error al obtener imágenes: {str(e)}")

@app.get("/files")
async def list_all_files():
    try:
        response = (
            supabase.storage
            .from_("images")
            .list(
                "public",
                {
                    "limit": 100,
                    "offset": 0,
                    "sortBy": {"column": "name", "order": "desc"},
                }
            )
        )
        return {"files": response}
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/plants")
def create_registry(name: str):
    return {"registry_name": name, "status": "created"}

@app.get("/plants")
def list_plants():
    return [{"name": "Rose"}, {"name": "Tulip"}, {"name": "Daisy"}]
