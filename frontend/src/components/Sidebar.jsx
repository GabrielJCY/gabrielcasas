
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  ChartNoAxesCombined,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  House,
  ChevronRight,
} from "lucide-react";

const opciones = [
  {
    id: "calculadora",
    nombre: "Calculadora",
    icono: Calculator,
  },
  {
    id: "resultados",
    nombre: "Resultados",
    icono: ChartNoAxesCombined,
  },
  {
    id: "metodo",
    nombre: "Método MIN-MAX",
    icono: BookOpen,
  },
];

export default function Sidebar({
  paginaActual,
  setPaginaActual,
  contraido,
  setContraido,
}) {
  const [menuMovil, setMenuMovil] = useState(false);

  const navegar = (pagina) => {
    setPaginaActual(pagina);
    setMenuMovil(false);
  };

  return (
    <>
      {/* BARRA SUPERIOR PARA CELULARES */}
      <header className="mobile-header">
        <div className="mobile-brand">
          <House size={20} />
          <span>MIN-MAX</span>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuMovil(true)}
          aria-label="Abrir menú"
        >
          <Menu size={23} />
        </button>
      </header>

      {/* FONDO OSCURO DEL MENÚ MÓVIL */}
      <AnimatePresence>
        {menuMovil && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuMovil(false)}
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <motion.aside
        className={`sidebar ${contraido ? "sidebar-collapsed" : ""} ${
          menuMovil ? "sidebar-mobile-open" : ""
        }`}
        initial={false}
        animate={{
          width: contraido ? 84 : 260,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <House size={22} />
            </div>

            {!contraido && (
              <motion.div
                className="sidebar-brand-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <strong>MIN-MAX</strong>
                <span>Decision Dashboard</span>
              </motion.div>
            )}
          </div>

          <button
            className="sidebar-close-mobile"
            onClick={() => setMenuMovil(false)}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        <div className="sidebar-navigation">
          {!contraido && (
            <span className="sidebar-section-title">
              NAVEGACIÓN
            </span>
          )}

          {opciones.map((opcion) => {
            const Icono = opcion.icono;
            const activo = paginaActual === opcion.id;

            return (
              <button
                key={opcion.id}
                type="button"
                title={contraido ? opcion.nombre : undefined}
                className={`sidebar-link ${activo ? "active" : ""}`}
                onClick={() => navegar(opcion.id)}
              >
                <Icono size={20} />

                {!contraido && (
                  <>
                    <span>{opcion.nombre}</span>
                    {activo && (
                      <ChevronRight
                        size={16}
                        className="sidebar-chevron"
                      />
                    )}
                  </>
                )}

                {activo && (
                  <motion.div
                    className="sidebar-active-indicator"
                    layoutId="active-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-footer-info">
            {!contraido && (
              <>
                <span>Investigación Operativa</span>
                <small>Normalización MIN-MAX</small>
              </>
            )}
          </div>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setContraido(!contraido)}
            aria-label={
              contraido ? "Expandir menú" : "Contraer menú"
            }
          >
            {contraido ? (
              <PanelLeftOpen size={20} />
            ) : (
              <>
                <PanelLeftClose size={20} />
                <span>Contraer menú</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
