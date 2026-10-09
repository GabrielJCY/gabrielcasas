
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  ArrowRight,
  AlertCircle,
  LoaderCircle,
  BookOpen,
} from "lucide-react";

import DashboardLayout from "./components/DashboardLayout";
import ViviendaForm from "./components/ViviendaForm";
import Ponderaciones from "./components/Ponderaciones";
import Resultados from "./components/Resultados";

import "./App.css";

const viviendasIniciales = [
  { nombre: "Casa A", area: 80, distancia: 5, precio: 100000 },
  { nombre: "Casa B", area: 100, distancia: 3, precio: 130000 },
  { nombre: "Casa C", area: 120, distancia: 8, precio: 150000 },
  { nombre: "Casa D", area: 140, distancia: 4, precio: 170000 },
  { nombre: "Casa E", area: 160, distancia: 2, precio: 200000 },
];

const pesosIniciales = {
  area: 40,
  distancia: 30,
  precio: 30,
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  // Navegación
  const [paginaActual, setPaginaActual] = useState("calculadora");
  const [contraido, setContraido] = useState(false);

  // Datos
  const [viviendas, setViviendas] = useState(viviendasIniciales);
  const [pesos, setPesos] = useState(pesosIniciales);

  // Estado del cálculo
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const invalidarResultado = () => {
    setResultado(null);
    setError("");
  };

  const validarDatos = () => {
    if (viviendas.length < 5) {
      return "Debes registrar al menos cinco viviendas.";
    }

    const totalPesos =
      Number(pesos.area) +
      Number(pesos.distancia) +
      Number(pesos.precio);

    const pesosValidos = Object.values(pesos).every(
      (valor) =>
        valor !== "" &&
        Number.isFinite(Number(valor)) &&
        Number(valor) >= 0 &&
        Number(valor) <= 100
    );

    if (!pesosValidos || Math.abs(totalPesos - 100) > 0.000001) {
      return "Las ponderaciones deben estar entre 0 y 100 y sumar exactamente 100%.";
    }

    const viviendaInvalida = viviendas.some((v) => {
      const area = Number(v.area);
      const distancia = Number(v.distancia);
      const precio = Number(v.precio);

      return (
        !String(v.nombre).trim() ||
        v.area === "" ||
        v.distancia === "" ||
        v.precio === "" ||
        !Number.isFinite(area) ||
        !Number.isFinite(distancia) ||
        !Number.isFinite(precio) ||
        area <= 0 ||
        distancia < 0 ||
        precio <= 0
      );
    });

    if (viviendaInvalida) {
      return "Completa correctamente el nombre, área, distancia y precio de todas las viviendas.";
    }

    return null;
  };

  const calcular = async () => {
    setError("");

    const mensajeError = validarDatos();

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setCargando(true);
    setResultado(null);

    try {
      const datos = {
        viviendas: viviendas.map((v) => ({
          nombre: v.nombre.trim(),
          area: Number(v.area),
          distancia: Number(v.distancia),
          precio: Number(v.precio),
        })),
        peso_area: Number(pesos.area) / 100,
        peso_distancia: Number(pesos.distancia) / 100,
        peso_precio: Number(pesos.precio) / 100,
      };

      const respuesta = await fetch(`${API_URL}/calcular`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) {
        throw new Error(
          `Error HTTP ${respuesta.status}. No se pudo calcular.`
        );
      }

      const resultadoAPI = await respuesta.json();

      if (
        !Array.isArray(resultadoAPI.resultados) ||
        !resultadoAPI.mejor_vivienda
      ) {
        throw new Error("El servidor devolvió un resultado no válido.");
      }

      setResultado(resultadoAPI);
      setPaginaActual("resultados");
    } catch (err) {
      setError(
        `${err.message} Comprueba que FastAPI esté ejecutándose en el puerto 8000.`
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <DashboardLayout
      paginaActual={paginaActual}
      setPaginaActual={setPaginaActual}
      contraido={contraido}
      setContraido={setContraido}
    >
      <AnimatePresence mode="wait">
        {paginaActual === "calculadora" && (
          <motion.div
            key="calculadora"
            className="calculadora-page"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="calculadora-intro glass">
              <div className="calculadora-intro-icon">
                <Calculator size={24} />
              </div>

              <div className="calculadora-intro-text">
                <h2>Evaluación de viviendas</h2>
                <p>
                  Introduce los datos, configura tus prioridades y
                  descubre la mejor alternativa.
                </p>
              </div>

              <span className="calculadora-count">
                {viviendas.length} viviendas
              </span>
            </div>

            <Ponderaciones
              pesos={pesos}
              setPesos={setPesos}
              onChange={invalidarResultado}
            />

            <ViviendaForm
              viviendas={viviendas}
              setViviendas={setViviendas}
              onChange={invalidarResultado}
            />

            <div className="calculadora-actions">
              {error && (
                <motion.div
                  className="calculadora-error"
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="button"
                className="calcular-button"
                onClick={calcular}
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <LoaderCircle
                      size={21}
                      className="loading-icon"
                    />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator size={21} />
                    Calcular MIN-MAX
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <p className="calculadora-note">
                Los cálculos se realizan mediante Python y FastAPI.
              </p>
            </div>
          </motion.div>
        )}

        {paginaActual === "resultados" && (
          <Resultados
            key="resultados"
            resultado={resultado}
            setPaginaActual={setPaginaActual}
          />
        )}

        {paginaActual === "metodo" && (
          <motion.div
            key="metodo"
            className="metodo-page glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="metodo-intro">
              <BookOpen size={25} />

              <div>
                <h2>¿Cómo funciona MIN-MAX?</h2>
                <p>
                  La normalización transforma los datos originales
                  a una escala comparable entre 0 y 1.
                </p>
              </div>
            </div>

            <div className="metodo-formulas">
              <div className="metodo-formula">
                <span>MAX — Criterio de beneficio</span>
                <h3>Área</h3>

                <div className="formula-matematica">
                  N(x) = (x − mínimo) / (máximo − mínimo)
                </div>

                <p>
                  Cuanto mayor sea el área, mejor será el valor
                  normalizado.
                </p>
              </div>

              <div className="metodo-formula">
                <span>MIN — Criterio de costo</span>
                <h3>Distancia y precio</h3>

                <div className="formula-matematica">
                  N(x) = (máximo − x) / (máximo − mínimo)
                </div>

                <p>
                  Cuanto menor sea la distancia o el precio,
                  mejor será el valor normalizado.
                </p>
              </div>
            </div>

            <div className="metodo-puntaje">
              <h3>Puntaje ponderado</h3>

              <p>
                Se multiplica cada valor normalizado por su peso
                correspondiente y se suman los resultados.
              </p>

              <div className="formula-matematica">
                P = (Área × Peso área) + (Distancia × Peso distancia)
                + (Precio × Peso precio)
              </div>

              <p>
                La vivienda con mayor puntaje final será la
                mejor alternativa según las prioridades elegidas.
              </p>

              <p>
                Si todos los valores de un criterio son iguales,
                nuestro backend asigna 1 a todas las viviendas
                para evitar una división entre cero.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
