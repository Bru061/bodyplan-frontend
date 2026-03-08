import DashboardLayout from "../../layout/DashboardLayout";
import "../../styles/clientes.css";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/axios";
import LoadingScreen from "../../components/ui/LoadingScreen";
import AssignRutinaModal from "./AssignRutinaModal";
import { useNavigate } from "react-router-dom";

function DetalleCliente() {

    const { id } = useParams();

    const [cliente, setCliente] = useState(null);
    const [rutinas, setRutinas] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const navigate = useNavigate();

    const fetchRutinasCliente = async () => {

    try {

        const res = await api.get("/rutinas");
        const todasRutinas = res.data.rutinas || [];

        const rutinasCliente = [];

        for (const rutina of todasRutinas) {

        try {

            const r = await api.get(`/rutinas/${rutina.id_rutina}/clientes`);

            const clientes = r.data.clientes || r.data || [];

            console.log("CLIENTES RUTINA:", rutina.id_rutina, clientes);

            const pertenece = clientes.find(c =>
            c.id_usuario === cliente?.id ||
            c.Usuario?.id_usuario === cliente?.id
            );

            if (pertenece) {

            rutinasCliente.push({
                ...rutina,
                estado: pertenece.estado
            });

            }

        } catch (err) {

            console.error("Error obteniendo clientes de rutina", err);

        }

        }

        console.log("RUTINAS DEL CLIENTE:", rutinasCliente);

        setRutinas(rutinasCliente);

    } catch (err) {

        console.error("Error cargando rutinas del cliente", err);

    }

    };

    useEffect(() => {

        const cargarCliente = async () => {

            try {

                const res = await api.get(`/clientes/${id}`);

                const data = res.data.cliente;

                const usuario = data.usuario;
                const suscripcion = data.suscripciones?.find(
                    s => s.estado === "activa"
                );

                setHistorial(data.suscripciones || []);

                const clienteFormateado = {

                    id: usuario.id_usuario,
                    id_gimnasio: suscripcion?.gimnasio?.id_gimnasio,
                    nombre: usuario.nombre,
                    email: usuario.correo,
                    telefono: usuario.telefono,

                    fechaRegistro: suscripcion
                        ? new Date(suscripcion.fecha_inicio).toLocaleDateString()
                        : "Sin registro",

                    membresia: suscripcion?.membresia?.nombre || "Sin membresía",

                    estado: suscripcion?.estado === "activa"
                        ? "Activo"
                        : "Inactivo"

                };

                setCliente(clienteFormateado);

            } catch (error) {

                console.error("Error cargando cliente", error);

            }

        };

        cargarCliente();

    }, [id]);

    useEffect(() => {

        if (cliente) {
            fetchRutinasCliente();
        }

    }, [cliente]);


    if (!cliente) {
        return <LoadingScreen message="Cargando información del cliente..." />;
    }

    const rutinasCompletadas = rutinas.filter(
    r => r.estado === "completada"
    ).length;

    return (

        <DashboardLayout>

            <section className="page-header">

                <div className="page-header-row">

                <button
                className="back-button"
                onClick={() => navigate(-1)}
                >
                ←
                </button>

                <div>
                    <p className="eyebrow">Detalle de cliente</p>
                    <h1>{cliente.nombre}</h1>
                    <p className="subtitle">
                        Información general, membresía y rutinas asignadas.
                    </p>
                </div>

                </div>

            </section>

            <section className="client-grid">

                <article className="panel client-info">

                    <h2>Información del cliente</h2>

                    <div className="info-row">
                        <span>Correo</span>
                        <span>{cliente.email}</span>
                    </div>

                    <div className="info-row">
                        <span>Teléfono</span>
                        <span>{cliente.telefono || "No registrado"}</span>
                    </div>

                    <div className="info-row">
                        <span>Miembro desde</span>
                        <span>{cliente.fechaRegistro}</span>
                    </div>

                    <div className="info-row">
                        <span>Membresía</span>
                        <span>{cliente.membresia}</span>
                    </div>

                    <div className="info-row">

                        <span>Estado</span>

                        <span className={`badge ${
                            cliente.estado === "Activo"
                                ? "badge-success"
                                : "badge-danger"
                        }`}>
                            {cliente.estado}
                        </span>

                    </div>

                </article>

                <article className="panel client-stats">

                    <h2>Actividad</h2>

                    <div className="stat-box">
                        <p className="stat-number">{rutinas.length}</p>
                        <span>Rutinas asignadas</span>
                    </div>

                    <div className="stat-box">
                    <p className="stat-number">{rutinasCompletadas}</p>
                    <span>Rutinas completadas</span>
                    </div>

                </article>

            </section>

            <section className="panel routines-panel">

                <div className="panel-head">

                    <h2>Rutinas asignadas</h2>

                    <button
                    className="btn btn-primary"
                    onClick={() => {

                        if(!cliente.id_gimnasio){
                        alert("El cliente no tiene gimnasio activo");
                        return;
                        }

                        setShowAssignModal(true);

                    }}
                    >
                    Asignar Rutina
                    </button>

                </div>

                {rutinas.length === 0 ? (

                    <p className="empty-state">
                        Este cliente aún no tiene rutinas asignadas.
                    </p>

                ) : (

                    rutinas.map((rutina) => (

                        <div
                            className="routine-card"
                            key={rutina.id_rutina}
                        >

                            <div>

                                <h2>{rutina.nombre}</h2>

                                <p>
                                {rutina.descripcion}
                                </p>

                                <p>
                                Nivel: {rutina.nivel || "N/A"} ·
                                Duración: {rutina.duracion_min || 0} min ·
                                Tipo: {rutina.tipo_rutina} ·
                                Categoría: {rutina.categoria} 
                                </p>

                                <p>
                                Instrucciones: {rutina.instrucciones}
                                </p>

                            </div>

                            <span className="badge">
                                {rutina.estado}
                            </span>

                        </div>

                    ))

                )}

            </section>

            {showAssignModal && (

                <AssignRutinaModal
                    cliente={cliente}
                    onClose={() => setShowAssignModal(false)}
                    onAssigned={fetchRutinasCliente}
                />

            )}

        </DashboardLayout>

    );

}

export default DetalleCliente;