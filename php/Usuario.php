<?php
class Usuario {
    private $db;

    public function __construct($conexion) {
        $this->db = $conexion;
    }

    public function registrarUsuario($nombre, $apellidos, $email, $password) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("INSERT INTO usuarios (nombre, apellidos, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $nombre, $apellidos, $email, $hash);
        
        // Atrapamos el error de duplicado (PHP 8.1+) para que no rompa la página
        try {
            $exito = $stmt->execute();
        } catch (mysqli_sql_exception $e) {
            $exito = false; 
        }
        
        $stmt->close();
        return $exito;
    }

    public function loginUsuario($email, $password) {
        $stmt = $this->db->prepare("SELECT id_usuario, nombre, password FROM usuarios WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($fila = $resultado->fetch_assoc()) {
            if (password_verify($password, $fila['password'])) {
                return ["id" => $fila['id_usuario'], "nombre" => $fila['nombre']];
            }
        }
        return false;
    }
}
?>