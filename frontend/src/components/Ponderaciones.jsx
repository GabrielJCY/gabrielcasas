
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  SlidersHorizontal,
  Maximize2,
  MapPin,
  Wallet,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const criterios = [
  {
    id: "area",
    nombre: "Área",
    tipo: "MAX",
    descripcion: "Mayor superficie es mejor",
    color: "#60a5fa",
    Icono: Maximize2,
  },
  {
    id: "distancia",
    nombre: "Distancia",
    tipo: "MIN",
    descripcion: "Menor distancia es mejor",
    color: "#a78bfa",
    Icono: MapPin,
  },
  {
    id: "precio",
    nombre: "Precio",
    tipo: "MIN",
    descripcion: "Menor precio es mejor",
    color: "#34d399",
    Icono: Wallet,
  },
];

export default function Ponderaciones({
  pesos,
  setPesos,
  onChange,
}) {
  const [abierto, setAbierto] = useState(false);

  const total = criterios.reduce(
    (suma, criterio) => suma + Number(pesos[criterio.id] || 0),
    0
  );

  const valido =
    criterios.every((c) =>
      pesos[c.id] !== "" &&
      Number.isFinite(Number(pesos[c.id])) &&
      Number(pesos[c.id]) >= 0 &&
      Number(pesos[c.id]) <= 100
    ) && Math.abs(total - 100) < 0.000001;

  const datosGrafico = criterios.map((c) => ({
    name: c.nombre,
    value: Math.max(0, Number(pesos[c.id]) || 0),
    color: c.color,
  }));

  const actualizar = (id, valor) => {
    const nuevosPesos = { ...pesos, [id]: valor };
    setPesos(nuevosPesos);
    onChange?.();
  };

  return (
    <section className="ponderaciones-card glass">
      <button
        type="button"
        className="ponderaciones-trigger"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
      >
        <div className="ponderaciones-trigger-info">
          <div className="ponderaciones-icon">
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <h2>Criterios y ponderaciones</h2>
            <p>Configura la importancia de cada criterio</p>
          </div>
        </div>

        <div className="ponderaciones-trigger-actions">
          <span className={`peso-status ${valido ? "valid" : "invalid"}`}>
            {valido ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            {total}% / 100%
          </span>

          <motion.span
            animate={{ rotate: abierto ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={20} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            className="ponderaciones-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="ponderaciones-body">
              <div className="ponderaciones-fields">
                {criterios.map((criterio) => {
                  const Icono = criterio.Icono;

                  return (
                    <div className="ponderacion-item" key={criterio.id}>
                      <div className="ponderacion-label">
                        <span
                          className="criterio-icon"
                          style={{
                            color: criterio.color,
                            background: `${criterio.color}18`,
                          }}
                        >
                          <Icono size={19} />
                        </span>

                        <div>
                          <strong>{criterio.nombre}</strong>
                          <span className="criterio-tipo">
                            {criterio.tipo}
                          </span>
                          <small>{criterio.descripcion}</small>
                        </div>
                      </div>

                      <div className="ponderacion-controls">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={pesos[criterio.id] === "" ? 0 : pesos[criterio.id]}
                          onChange={(e) =>
                            actualizar(criterio.id, Number(e.target.value))
                          }
                          aria-label={`Porcentaje de ${criterio.nombre}`}
                          style={{ accentColor: criterio.color }}
                        />

                        <div className="ponderacion-number">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={pesos[criterio.id]}
                            onChange={(e) =>
                              actualizar(
                                criterio.id,
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                            aria-label={`Peso de ${criterio.nombre}`}
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!valido && (
                  <p className="ponderaciones-error">
                    Los pesos deben estar entre 0 y 100 y sumar exactamente 100%.
                  </p>
                )}

                <button
                  type="button"
                  className="ponderaciones-reset"
                  onClick={() => {
                    setPesos({ area: 40, distancia: 30, precio: 30 });
                    onChange?.();
                  }}
                >
                  Restablecer 40% / 30% / 30%
                </button>
              </div>

              <div className="ponderaciones-chart">
                <div className="ponderaciones-chart-circle">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={datosGrafico}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="none"
                        isAnimationActive
                      >
                        {datosGrafico.map((dato) => (
                          <Cell key={dato.name} fill={dato.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(valor) => `${valor}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="ponderaciones-chart-center">
                    <strong>{total}%</strong>
                    <small>Total</small>
                  </div>
                </div>

                <div className="ponderaciones-legend">
                  {datosGrafico.map((dato) => (
                    <div key={dato.name}>
                      <span
                        className="legend-dot"
                        style={{ background: dato.color }}
                      />
                      <span>{dato.name}</span>
                      <strong>{dato.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
