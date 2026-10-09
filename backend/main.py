
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
from normalizacion import normalizar_beneficio, normalizar_costo

app = FastAPI(title="Calculadora MIN-MAX")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Vivienda(BaseModel):
    nombre: str = Field(min_length=1)
    area: float = Field(gt=0)
    distancia: float = Field(ge=0)
    precio: float = Field(gt=0)


class Solicitud(BaseModel):
    viviendas: list[Vivienda] = Field(min_length=5)
    peso_area: float = Field(default=0.40, ge=0, le=1)
    peso_distancia: float = Field(default=0.30, ge=0, le=1)
    peso_precio: float = Field(default=0.30, ge=0, le=1)

    @model_validator(mode="after")
    def validar_pesos(self):
        total = self.peso_area + self.peso_distancia + self.peso_precio
        if abs(total - 1.0) > 0.000001:
            raise ValueError("Los pesos deben sumar 1 (100%)")
        return self


@app.get("/")
def inicio():
    return {"mensaje": "API MIN-MAX funcionando correctamente"}


@app.post("/calcular")
def calcular(datos: Solicitud):
    viviendas = datos.viviendas

    areas = [v.area for v in viviendas]
    distancias = [v.distancia for v in viviendas]
    precios = [v.precio for v in viviendas]

    area_normalizada = normalizar_beneficio(areas)
    distancia_normalizada = normalizar_costo(distancias)
    precio_normalizado = normalizar_costo(precios)

    resultados = []

    for i, vivienda in enumerate(viviendas):
        puntaje = (
            area_normalizada[i] * datos.peso_area
            + distancia_normalizada[i] * datos.peso_distancia
            + precio_normalizado[i] * datos.peso_precio
        )

        resultados.append({
            "nombre": vivienda.nombre,
            "area": vivienda.area,
            "distancia": vivienda.distancia,
            "precio": vivienda.precio,
            "area_normalizada": round(area_normalizada[i], 4),
            "distancia_normalizada": round(distancia_normalizada[i], 4),
            "precio_normalizado": round(precio_normalizado[i], 4),
            "puntaje": round(puntaje, 4)
        })

    resultados.sort(key=lambda v: v["puntaje"], reverse=True)

    return {
        "resultados": resultados,
        "mejor_vivienda": resultados[0]
    }
