import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/rutinas.css";
import { FiFilter } from "react-icons/fi";
import { Link } from "react-router-dom";

function Rutinas() {
    return (
        <DashboardLayout>
        <section className="page-header">
        <div>
          <p className="eyebrow">Gestión de rutinas</p>
          <h1>Rutinas de gimnasio</h1>
          <p className="subtitle">Crea, organiza y asigna rutinas a clientes desde la web.</p>
        </div>
      </section>

      <section className="stats-grid" aria-label="Resumen de rutinas">
        <article className="stat-card">
          <p className="stat-label">Rutinas creadas</p>
          <p className="stat-value">42</p>
          <p className="stat-sub positive">+8 este mes</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Asignadas a clientes</p>
          <p className="stat-value">126</p>
          <p className="stat-sub">Promedio: 3 por cliente</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Sin asignar</p>
          <p className="stat-value">9</p>
          <p className="stat-sub">Disponibles para nuevos planes</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel routines-list-panel">
          <div className="panel-head">
            <h2>Rutinas actuales</h2>
            <button type="button" className="btn btn-ghost">
              <FiFilter />
              Filtrar
            </button>
          </div>

          <div className="routine-item">
            <div>
              <h3>Cardio Intensivo</h3>
              <p>Duración: 45 min · Nivel: Intermedio</p>
            </div>
            <span className="badge">18 asignaciones</span>
          </div>

          <div className="routine-item">
            <div>
              <h3>Hipertrofia Full Body</h3>
              <p>Duración: 60 min · Nivel: Avanzado</p>
            </div>
            <span className="badge">12 asignaciones</span>
          </div>

          <div className="routine-item">
            <div>
              <h3>Fuerza Base</h3>
              <p>Duración: 50 min · Nivel: Principiante</p>
            </div>
            <span className="badge">9 asignaciones</span>
          </div>
        </article>

        <article className="panel form-panel">
          <h2>Crear rutina</h2>

          <label htmlFor="routine-name">Nombre de rutina</label>
          <input id="routine-name" className="input" type="text" placeholder="Ej. Tren superior avanzado" />

          <label htmlFor="routine-duration">Duración</label>
          <input id="routine-duration" className="input" type="text" placeholder="Ej. 50 minutos" />

          <label htmlFor="routine-exercises">Ejercicios</label>
          <textarea
            id="routine-exercises"
            className="input"
            placeholder="Ej. Press banca 4x10, Dominadas 4x8, Remo 4x12"
          ></textarea>

          <button className="btn btn-primary btn-block" type="button">Guardar rutina</button>
        </article>
      </section>
        </DashboardLayout>
    );
}

export default Rutinas;
