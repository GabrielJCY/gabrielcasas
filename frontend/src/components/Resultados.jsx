
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Medal,
  House,
  ArrowLeft,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const colores = [
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#fbbf24",
  "#fb7185",
];

function formato(numero) {
  return Number(numero).toFixed(4);
}

export default function Resultados({
  resultado,
  setPaginaActual,
}) {
  const [mostrarTabla, setMostrarTabla] = useState(false);

  if (!resultado || !resultado.resultados?.length) {
    return (
      <motion.section
        className="resultados-empty glass"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="resultados-empty-icon">
          <ChartNoAxesColumnIncreasing size={30} />
        </div>

        <h2>Aún no hay resultados</h2>
        <p>
          Ingresa los datos de las viviendas y realiza el cálculo
          para visualizar el análisis.
        </p>

        <button
          className="resultados-back"
          onClick={() => setPaginaActual("calculadora")}
        >
          <ArrowLeft size={17} />
          Ir a la calculadora
        </button>
      </motion.section>
    );
  }

  const { resultados, mejor_vivienda } = resultado;

  const datosGrafico = resultados.map((v) => ({
    nombre: v.nombre,
    puntaje: v.puntaje,
  }));

  return (
    <div className="resultados-dashboard">
      {/* TARJETA GANADORA */}
      <motion.section
        className="resultados-ganador glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="ganador-contenido">
          <div className="ganador-icono">
            <Trophy size={24} />
          </div>

          <span className="ganador-label">
            MEJOR ALTERNATIVA
          </span>

          <h2>{mejor_vivienda.nombre}</h2>

          <p>
            Esta vivienda obtuvo el puntaje más alto
            considerando los criterios y las ponderaciones.
          </p>

          <div className="ganador-puntaje">
            <strong>{formato(mejor_vivienda.puntaje)}</strong>
            <span>puntos de 1.0000</span>
          </div>
        </div>
      </motion.section>

      {/* RANKING + GRÁFICO */}
      <div className="resultados-grid">
        <motion.section
          className="resultados-ranking glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="resultados-card-header">
            <div>
              <h3>Ranking de viviendas</h3>
              <p>Ordenadas por puntuación final</p>
            </div>
            <Medal size={20} />
          </div>

          <div className="ranking-lista">
            {resultados.map((vivienda, indice) => (
              <motion.div
                key={`${vivienda.nombre}-${indice}`}
                className="ranking-item"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: indice * 0.07,
                  duration: 0.3,
                }}
              >
                <span className="ranking-posicion">
                  {indice + 1}
                </span>

                <div className="ranking-info">
                  <div className="ranking-texto">
                    <strong>{vivienda.nombre}</strong>
                    <span>{formato(vivienda.puntaje)}</span>
                  </div>

                  <div className="ranking-track">
                    <motion.div
                      className="ranking-fill"
                      style={{
                        background: colores[indice % colores.length],
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.max(0, Math.min(100, vivienda.puntaje * 100))}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay: 0.2 + indice * 0.08,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="resultados-grafico glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="resultados-card-header">
            <div>
              <h3>Comparación de puntajes</h3>
              <p>Escala de 0 a 1</p>
            </div>
            <ChartNoAxesColumnIncreasing size={20} />
          </div>

          <div className="resultados-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosGrafico}
                margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.07)"
                  vertical={false}
                />
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(valor) => [formato(valor), "Puntaje"]}
                  contentStyle={{
                    background: "#142238",
                    border: "1px solid #334155",
                    borderRadius: 12,
                    color: "#f8fafc",
                  }}
                />
                <Bar
                  dataKey="puntaje"
                  radius={[7, 7, 0, 0]}
                  maxBarSize={54}
                  animationDuration={900}
                >
                  {datosGrafico.map((dato, indice) => (
                    <Cell
                      key={indice}
                      fill={colores[indice % colores.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* TABLA DESPLEGABLE */}
      <section className="resultados-detalle glass">
        <button
          type="button"
          className="resultados-detalle-trigger"
          onClick={() => setMostrarTabla(!mostrarTabla)}
          aria-expanded={mostrarTabla}
        >
          <div className="resultados-detalle-titulo">
            <House size={20} />
            <div>
              <h3>Tabla de normalización</h3>
              <p>Consulta los valores de cada criterio</p>
            </div>
          </div>

          <motion.span
            animate={{ rotate: mostrarTabla ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={20} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {mostrarTabla && (
            <motion.div
              className="resultados-detalle-contenido"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div className="resultados-tabla-scroll">
                <table className="resultados-tabla">
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Vivienda</th>
                      <th>Área (MAX)</th>
                      <th>Distancia (MIN)</th>
                      <th>Precio (MIN)</th>
                      <th>Puntaje final</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resultados.map((v, indice) => (
                      <tr key={indice}>
                        <td>#{indice + 1}</td>
                        <td>{v.nombre}</td>
                        <td>{formato(v.area_normalizada)}</td>
                        <td>{formato(v.distancia_normalizada)}</td>
                        <td>{formato(v.precio_normalizado)}</td>
                        <td>
                          <strong>{formato(v.puntaje)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="resultados-nota">
                <Info size={17} />
                <p>
                  Los valores normalizados están entre 0 y 1.
                  Un valor de 1 representa el mejor resultado
                  del criterio y 0 el peor, cuando existen
                  diferencias entre las viviendas.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <button
        className="resultados-volver"
        onClick={() => setPaginaActual("calculadora")}
      >
        <ArrowLeft size={17} />
        Modificar datos y recalcular
      </button>
    </div>
  );
}
