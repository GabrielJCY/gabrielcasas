
import { useState, useRef, useEffect } from "react";
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

// ========================================
// CONFIGURACIÓN DE LA API
// ========================================

const API_URL = import.meta.env.PROD
  ? "https://gabrielcasas-backend.vercel.app"
  : "http://127.0.0.1:8000";

// ========================================
// DATOS INICIALES
// ========================================

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

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function App() {
  // Navegación
  const [paginaActual, setPaginaActual] = useState("calculadora");
  const [contraido, setContraido] = useState(false);

  // Datos de viviendas
  const [viviendas, setViviendas] = useState(viviendasIniciales);

  // Ponderaciones
  const [pesos, setPesos] = useState(pesosIniciales);

  // Resultados
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Control de solicitudes HTTP
  const solicitudActual = useRef(null);
  const tiempoEspera = useRef(null);

  // Cancelar solicitudes al desmontar el componente
  useEffect(() => {
    return () => {
      solicitudActual.current?.abort();

      if (tiempoEspera.current) {
        clearTimeout(tiempoEspera.current);
      }
    };
  }, []);

  // ========================================
  // INVALIDAR RESULTADOS
  // ========================================

  const invalidarResultado = () => {
    solicitudActual.current?.abort();

    if (tiempoEspera.current) {
      clearTimeout(tiempoEspera.current);
    }

    setResultado(null);
    setError("");
    setCargando(false);
  };

  // ========================================
  // VALIDAR DATOS
  // ========================================

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

  // ========================================
  // CALCULAR MIN-MAX
  // ========================================

  const calcular = async () => {
    if (cargando) return;

    setError("");

    const mensajeError = validarDatos();

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    const controlador = new AbortController();
    solicitudActual.current = controlador;

    setCargando(true);
    setResultado(null);

    let timeoutAgotado = false;

    tiempoEspera.current = setTimeout(() => {
      timeoutAgotado = true;
      controlador.abort();
    }, 30000);

    try {
      const datos = {
        viviendas: viviendas.map((v) => ({
          nombre: String(v.nombre).trim(),
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
          Accept: "application/json",
        },

        body: JSON.stringify(datos),
        signal: controlador.signal,
      });

      if (!respuesta.ok) {
        let detalle = "";

        try {
          const contenido = await respuesta.json();

          if (typeof contenido.detail === "string") {
            detalle = contenido.detail;
          }
        } catch {
          // Si el servidor no responde JSON,
          // conservamos el código HTTP.
        }

        throw new Error(
          `Error HTTP ${respuesta.status}. ${
            detalle || "El servidor no pudo procesar la solicitud."
          }`
        );
      }

      const resultadoAPI = await respuesta.json();

      if (
        !Array.isArray(resultadoAPI.resultados) ||
        resultadoAPI.resultados.length === 0 ||
        !resultadoAPI.mejor_vivienda
      ) {
        throw new Error(
          "El servidor devolvió un resultado no válido."
        );
      }

      // Evitar mostrar una respuesta cancelada
      if (controlador.signal.aborted) return;

      setResultado(resultadoAPI);
      setPaginaActual("resultados");
    } catch (err) {
      if (controlador.signal.aborted && !timeoutAgotado) {
        return;
      }

      console.error("Error al calcular MIN-MAX:", err);
      console.error("Endpoint:", `${API_URL}/calcular`);

      if (timeoutAgotado) {
        setError(
          "El servidor tardó demasiado en responder. Intenta nuevamente."
        );
      } else if (err instanceof TypeError) {
        setError(
          "No se pudo establecer conexión con la API. " +
          "Comprueba tu conexión a Internet o la configuración del servidor."
        );
      } else {
        setError(
          err.message || "Ocurrió un error inesperado."
        );
      }
    } finally {
      if (tiempoEspera.current) {
        clearTimeout(tiempoEspera.current);
        tiempoEspera.current = null;
      }

      if (solicitudActual.current === controlador) {
        solicitudActual.current = null;
        setCargando(false);
      }
    }
  };

  // ========================================
  // INTERFAZ DEL DASHBOARD
  // ========================================

  return (
    <DashboardLayout
      paginaActual={paginaActual}
      setPaginaActual={setPaginaActual}
      contraido={contraido}
      setContraido={setContraido}
    >
      <AnimatePresence mode="wait">

        {/* ========================================
            PÁGINA CALCULADORA
        ======================================== */}

        {paginaActual === "calculadora" && (
          <motion.div
            key="calculadora"
            className="calculadora-page"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {/* INTRODUCCIÓN */}

            <div className="calculadora-intro glass">
              <div className="calculadora-intro-icon">
                <Calculator size={24} />
              </div>

              <div className="calculadora-intro-text">
                <h2>Evaluación de viviendas</h2>

                <p>
                  Introduce los datos, configura tus prioridades
                  y descubre la mejor alternativa.
                </p>
              </div>

              <span className="calculadora-count">
                {viviendas.length} viviendas
              </span>
            </div>

            {/* PONDERACIONES */}

            <Ponderaciones
              pesos={pesos}
              setPesos={setPesos}
              onChange={invalidarResultado}
            />

            {/* FORMULARIO DE VIVIENDAS */}

            <ViviendaForm
              viviendas={viviendas}
              setViviendas={setViviendas}
              onChange={invalidarResultado}
            />

            {/* ACCIONES */}

            <div className="calculadora-actions">

              {/* MENSAJE DE ERROR */}

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="calculadora-error"
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* BOTÓN CALCULAR */}

              <motion.button
                type="button"
                className="calcular-button"
                onClick={calcular}
                disabled={cargando}
                whileHover={
                  cargando ? {} : { scale: 1.02 }
                }
                whileTap={
                  cargando ? {} : { scale: 0.98 }
                }
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
              </motion.button>

              <p className="calculadora-note">
                Cálculos realizados mediante Python y FastAPI.
              </p>

            </div>
          </motion.div>
        )}

        {/* ========================================
            PÁGINA RESULTADOS
        ======================================== */}

        {paginaActual === "resultados" && (
          <Resultados
            key="resultados"
            resultado={resultado}
            setPaginaActual={setPaginaActual}
          />
        )}

        {/* ========================================
            PÁGINA MÉTODO MIN-MAX
        ======================================== */}

        {paginaActual === "metodo" && (
          <motion.div
            key="metodo"
            className="metodo-page glass"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <div className="metodo-intro">
              <BookOpen size={25} />

              <div>
                <h2>¿Cómo funciona MIN-MAX?</h2>

                <p>
                  La normalización transforma los datos
                  originales a una escala comparable
                  entre 0 y 1.
                </p>
              </div>
            </div>

            {/* FÓRMULAS */}

            <div className="metodo-formulas">

              {/* MAX */}

              <div className="metodo-formula">
                <span>MAX — Criterio de beneficio</span>

                <h3>Área</h3>

                <div className="formula-matematica">
                  N(x) = (x − mínimo) / (máximo − mínimo)
                </div>

                <p>
                  Cuanto mayor sea el área,
                  mejor será el valor normalizado.
                </p>
              </div>

              {/* MIN */}

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

            {/* PUNTAJE PONDERADO */}

            <div className="metodo-puntaje">
              <h3>Puntaje ponderado</h3>

              <p>
                Se multiplica cada valor normalizado por
                su peso correspondiente y se suman
                los resultados.
              </p>

              <div className="formula-matematica">
                P = (Área × Peso área) + (Distancia × Peso distancia)
                + (Precio × Peso precio)
              </div>

              <p>
                La vivienda con mayor puntaje final
                será la mejor alternativa según las
                prioridades elegidas.
              </p>

              <p>
                Si todos los valores de un criterio son
                iguales, el backend asigna 1 a todas las
                viviendas para evitar una división entre cero.
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </DashboardLayout>
  );
}