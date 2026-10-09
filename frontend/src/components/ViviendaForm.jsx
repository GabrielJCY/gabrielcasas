
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  House,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const ejemploViviendas = [
  { nombre: "Casa A", area: 80, distancia: 5, precio: 100000 },
  { nombre: "Casa B", area: 100, distancia: 3, precio: 130000 },
  { nombre: "Casa C", area: 120, distancia: 8, precio: 150000 },
  { nombre: "Casa D", area: 140, distancia: 4, precio: 170000 },
  { nombre: "Casa E", area: 160, distancia: 2, precio: 200000 },
];

export default function ViviendaForm({
  viviendas,
  setViviendas,
  onChange,
}) {
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  const actualizarVivienda = (indice, campo, valor) => {
    setViviendas((anteriores) =>
      anteriores.map((vivienda, i) =>
        i === indice
          ? { ...vivienda, [campo]: valor }
          : vivienda
      )
    );
    onChange?.();
  };

  const agregarVivienda = () => {
    const existentes = new Set(
      viviendas.map((v) => v.nombre.toLowerCase())
    );

    let numero = viviendas.length + 1;
    let nombre = `Casa ${numero}`;

    while (existentes.has(nombre.toLowerCase())) {
      numero++;
      nombre = `Casa ${numero}`;
    }

    setViviendas((anteriores) => [
      ...anteriores,
      {
        nombre,
        area: "",
        distancia: "",
        precio: "",
      },
    ]);

    onChange?.();
  };

  const eliminarVivienda = (indice) => {
    if (viviendas.length <= 5) return;

    setViviendas((anteriores) =>
      anteriores.filter((_, i) => i !== indice)
    );

    onChange?.();
  };

  const restablecer = () => {
    setViviendas(ejemploViviendas.map((v) => ({ ...v })));
    onChange?.();
  };

  const campos = [
    {
      id: "nombre",
      titulo: "Vivienda",
      tipo: "text",
    },
    {
      id: "area",
      titulo: "Área (m²)",
      tipo: "number",
    },
    {
      id: "distancia",
      titulo: "Distancia (km)",
      tipo: "number",
    },
    {
      id: "precio",
      titulo: "Precio",
      tipo: "number",
    },
  ];

  return (
    <section className="viviendas-panel glass">
      <div className="viviendas-header">
        <div className="viviendas-title">
          <div className="viviendas-icon">
            <House size={20} />
          </div>

          <div>
            <h2>Datos de las viviendas</h2>
            <p>Administra las alternativas que deseas evaluar</p>
          </div>
        </div>

        <div className="viviendas-actions">
          <span className="viviendas-counter">
            {viviendas.length} viviendas
          </span>

          <button
            type="button"
            className="viviendas-reset"
            onClick={restablecer}
            title="Restablecer datos de ejemplo"
          >
            <RotateCcw size={16} />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            className="viviendas-add"
            onClick={agregarVivienda}
          >
            <Plus size={18} />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* TABLA PARA PC */}
      <div className="viviendas-desktop">
        <div className="viviendas-table-scroll">
          <table className="viviendas-table">
            <thead>
              <tr>
                {campos.map((campo) => (
                  <th key={campo.id}>{campo.titulo}</th>
                ))}
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {viviendas.map((vivienda, indice) => (
                <tr key={indice}>
                  {campos.map((campo) => (
                    <td key={campo.id}>
                      <input
                        type={campo.tipo}
                        min={
                          campo.tipo === "number" ? 0 : undefined
                        }
                        step={
                          campo.tipo === "number" ? "any" : undefined
                        }
                        value={vivienda[campo.id]}
                        onChange={(e) =>
                          actualizarVivienda(
                            indice,
                            campo.id,
                            e.target.value
                          )
                        }
                        aria-label={`${campo.titulo} de ${vivienda.nombre}`}
                      />
                    </td>
                  ))}

                  <td>
                    <button
                      type="button"
                      className="viviendas-delete"
                      disabled={viviendas.length <= 5}
                      onClick={() => eliminarVivienda(indice)}
                      title="Eliminar vivienda"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TARJETAS PARA CELULAR */}
      <div className="viviendas-mobile">
        <AnimatePresence initial={false}>
          {viviendas.map((vivienda, indice) => (
            <motion.div
              key={indice}
              layout
              className="vivienda-mobile-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <div className="vivienda-mobile-header">
                <div className="vivienda-mobile-number">
                  <House size={16} />
                  <span>Vivienda {indice + 1}</span>
                </div>

                <button
                  type="button"
                  className="viviendas-delete"
                  disabled={viviendas.length <= 5}
                  onClick={() => eliminarVivienda(indice)}
                  aria-label={`Eliminar vivienda ${indice + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="vivienda-mobile-fields">
                {campos.map((campo) => (
                  <label key={campo.id}>
                    <span>{campo.titulo}</span>
                    <input
                      type={campo.tipo}
                      min={
                        campo.tipo === "number" ? 0 : undefined
                      }
                      step={
                        campo.tipo === "number" ? "any" : undefined
                      }
                      value={vivienda[campo.id]}
                      onChange={(e) =>
                        actualizarVivienda(
                          indice,
                          campo.id,
                          e.target.value
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AYUDA DESPLEGABLE */}
      <div className="viviendas-footer">
        <button
          type="button"
          className="viviendas-help-trigger"
          onClick={() => setMostrarAyuda(!mostrarAyuda)}
          aria-expanded={mostrarAyuda}
        >
          <Info size={16} />
          ¿Qué datos debo ingresar?
          {mostrarAyuda ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        <AnimatePresence>
          {mostrarAyuda && (
            <motion.div
              className="viviendas-help-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p>
                <strong>Área:</strong> superficie de la vivienda
                en metros cuadrados.
              </p>
              <p>
                <strong>Distancia:</strong> distancia desde la vivienda
                hasta un lugar de referencia, en kilómetros.
              </p>
              <p>
                <strong>Precio:</strong> costo total de la vivienda.
                Utiliza la misma moneda para todas.
              </p>
              <p>
                Debes registrar al menos cinco viviendas.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
