function RutinaCard({ rutina, onEdit }){

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

      </div>

      <div className="routine-actions">

        <button
          className="btn btn-ghost"
          onClick={() => onEdit(rutina)}
        >
          Editar
        </button>

      </div>

    </div>

  );

}

export default RutinaCard;