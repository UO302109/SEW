<?php
class Reserva {
    private $db;
    private $gestorRecursos;

    public function __construct($conexion, Recurso $gestorRecursos) {
        $this->db = $conexion;
        $this->gestorRecursos = $gestorRecursos;
    }

    public function confirmarReserva($id_usuario, $id_recurso, $plazas, $precio_total) {
        $disponibles = $this->gestorRecursos->getPlazasDisponibles($id_recurso);
        if ($plazas > $disponibles) return false;

        $stmt = $this->db->prepare("INSERT INTO reservas (id_usuario, id_recurso, plazas_reservadas, precio_total, estado) VALUES (?, ?, ?, ?, 'Confirmada')");
        $stmt->bind_param("iiid", $id_usuario, $id_recurso, $plazas, $precio_total);
        $exito = $stmt->execute();
        $stmt->close();
        return $exito;
    }

    public function getReservasUsuario($id_usuario) {
        $stmt = $this->db->prepare("SELECT res.id_reserva, res.plazas_reservadas, res.precio_total, res.estado, res.fecha_reserva, rec.nombre 
                                    FROM reservas res 
                                    JOIN recursos rec ON res.id_recurso = rec.id_recurso 
                                    WHERE res.id_usuario = ? ORDER BY res.fecha_reserva DESC");
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $resultado = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $resultado;
    }

    public function anularReserva($id_reserva, $id_usuario) {
        $stmt = $this->db->prepare("UPDATE reservas SET estado = 'Anulada' WHERE id_reserva = ? AND id_usuario = ?");
        $stmt->bind_param("ii", $id_reserva, $id_usuario);
        $exito = $stmt->execute();
        $stmt->close();
        return $exito;
    }
}
?>