import { useEffect, useState } from "react";
import api from "../../services/axios";
import "../../styles/rutinas.css";

function AssignRutinaModal({ cliente, onClose, onAssigned }) {

  const [rutinas,setRutinas] = useState([]);
  const [rutinaSeleccionada,setRutinaSeleccionada] = useState("");
  const [fechaLimite,setFechaLimite] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(()=>{

    const fetchRutinas = async()=>{

      try{

        const res = await api.get("/rutinas");
        setRutinas(res.data.rutinas || res.data);

      }catch(err){

        console.error("Error cargando rutinas:",err);

      }

    };

    fetchRutinas();

  },[]);

  const handleSubmit = async(e)=>{

    e.preventDefault();

    if(!rutinaSeleccionada || !fechaLimite){
      alert("Debes seleccionar una rutina y una fecha límite");
      return;
    }

    try{

      setLoading(true);

      if (!cliente?.id_gimnasio) {
        alert("Este cliente no tiene un gimnasio asociado.");
        return;
      }

      const payload = {
        id_rutina: parseInt(rutinaSeleccionada),
        id_usuario: cliente.id,
        id_gimnasio: cliente.id_gimnasio,
        fecha_limite: fechaLimite
      };

      console.log("Asignación:",payload);

      await api.post("/rutinas/asignar",payload);

      onAssigned();
      onClose();

    }catch(err){

      console.error(
        "Error asignando rutina:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
        "No se pudo asignar la rutina"
      );

    }finally{

      setLoading(false);

    }

  };

  return(

    <div className="modal-overlay">

      <div className="modal-card">

        <h2>Asignar rutina</h2>

        <span>{cliente.nombre}</span>

        <form onSubmit={handleSubmit}>

          <label>Rutina</label>

          {rutinas.length === 0 ? (

            <p className="empty-state">
              Aún no has creado rutinas.
            </p>

          ) : (

            <select
              value={rutinaSeleccionada}
              onChange={(e)=>setRutinaSeleccionada(e.target.value)}
              required
            >

              <option value="">Seleccionar rutina</option>

              {rutinas.map((r,index)=>(
                <option
                  key={`${r.id_rutina}-${index}`}
                  value={r.id_rutina}
                >
                  {r.nombre}
                </option>
              ))}

            </select>

          )}

          <label>Fecha límite</label>

          <input
            type="date"
            value={fechaLimite}
            onChange={(e)=>setFechaLimite(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />

          <div className="modal-actions">

            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Asignando..." : "Asignar"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AssignRutinaModal;