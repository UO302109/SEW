<?php
class Recurso {
    private $db;

    public function __construct($conexion) {
        $this->db = $conexion;
    }

    public function getRecursos() {
        $sql = "SELECT r.id_recurso, r.nombre, r.descripcion, r.plazas, r.precio, r.fecha_inicio, r.fecha_fin, t.nombre_tipo, u.municipio 
                FROM recursos r 
                JOIN tipos_recurso t ON r.id_tipo = t.id_tipo 
                JOIN ubicaciones u ON r.id_ubicacion = u.id_ubicacion";
        return $this->db->query($sql)->fetch_all(MYSQLI_ASSOC);
    }

    public function getRecursoPorId($id_recurso) {
        $stmt = $this->db->prepare("SELECT * FROM recursos WHERE id_recurso = ?");
        $stmt->bind_param("i", $id_recurso);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $resultado;
    }

    public function getPlazasDisponibles($id_recurso) {
        $stmt = $this->db->prepare(
            "SELECT r.plazas - COALESCE(SUM(res.plazas_reservadas), 0) AS disponibles
             FROM recursos r
             LEFT JOIN reservas res ON r.id_recurso = res.id_recurso AND res.estado = 'Confirmada'
             WHERE r.id_recurso = ?
             GROUP BY r.id_recurso, r.plazas"
        );
        $stmt->bind_param("i", $id_recurso);
        $stmt->execute();
        $fila = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $fila ? (int)$fila['disponibles'] : 0;
    }
}
?>