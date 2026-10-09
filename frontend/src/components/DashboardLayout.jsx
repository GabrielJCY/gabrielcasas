
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";

const titulos = {
  calculadora: {
    titulo: "Calculadora",
    descripcion: "Configura y evalúa tus alternativas.",
  },
  resultados: {
    titulo: "Resultados",
    descripcion: "Analiza las puntuaciones y el ranking.",
  },
  metodo: {
    titulo: "Método MIN-MAX",
    descripcion: "Conoce cómo se realizan los cálculos.",
  },
};

export default function DashboardLayout({
  children,
  paginaActual,
  setPaginaActual,
  contraido,
  setContraido,
}) {
  const pagina = titulos[paginaActual] || titulos.calculadora;

  return (
    <div className={`dashboard-layout ${contraido ? "is-collapsed" : ""}`}>
      <Sidebar
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        contraido={contraido}
        setContraido={setContraido}
      />

      <main className="dashboard-main">
        <div className="dashboard-content">
          <motion.header
            className="dashboard-page-header"
            key={paginaActual}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <span className="dashboard-eyebrow">
                INVESTIGACIÓN OPERATIVA
              </span>

              <h1>{pagina.titulo}</h1>
              <p>{pagina.descripcion}</p>
            </div>

            <div className="dashboard-header-status">
              <span className="status-dot" />
              Sistema activo
            </div>
          </motion.header>

          <motion.div
            key={`content-${paginaActual}`}
            className="dashboard-page-body"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

