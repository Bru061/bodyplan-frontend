import { useState, useEffect } from "react";
import api from "../../services/axios";

function RutinaCard({ rutina, onEdit, clientesCount }){

  const handleDesactivar = async () => {

    const confirmar = confirm("¿Deseas desactivar esta rutina?");

    if (!confirmar) return;

    try {

      await api.put(`/rutinas/${rutina.id_rutina}/desactivar`);

      alert("Rutina desactivada correctamente");

      refresh();

    } catch (error) {

      console.error("Error desactivando rutina", error);
      alert("No se pudo desactivar la rutina");

    }

  };

  useEffect(()=>{

    const fetchClientes = async () =>{

      try{

        const res = await api.get(`/rutinas/${rutina.id_rutina}/clientes`);

        const clientes =
          res.data.clientes ||
          res.data.data ||
          res.data ||
          [];

      }catch(err){

        console.error("Error cargando clientes de rutina",err);

      }

    };

    fetchClientes();

  },[]);

  return(

    <div className="routine-item">

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

        <p className="routine-meta">
        Clientes usando esta rutina: <strong>{clientesCount}</strong>
        </p>

      </div>

      <div className="routine-actions">

        <button
          className="btn btn-ghost"
          onClick={() => onEdit(rutina)}
        >
          Editar
        </button>

        <button
        className="btn btn-danger"
        onClick={handleDesactivar}
        >
        Desactivar
        </button>

      </div>

    </div>

  );

}

export default RutinaCard;