<?php
class Database {
    private $servername = "localhost";
    private $username = "DBUSER2026"; 
    private $password = "DBPWD2026";
    private $dbname = "reservas_turismo"; 
    private $db;

    public function __construct() {
        $this->conectar();
    }

    private function conectar() {
        try {
            $this->db = new mysqli($this->servername, $this->username, $this->password);
        } catch (Exception $e) {
            die("ERROR: No se pudo conectar a MySQL. Motivo: " . $e->getMessage());
        }
        $this->db->set_charset("utf8mb4");
        try {
            $this->db->select_db($this->dbname);
        } catch (mysqli_sql_exception $e) { }
    }

    private function comprobarConexion() {
        if ($this->db === null || !$this->db->ping()) {
            $this->conectar();
        }
    }

    // Método vital: entrega el cable de conexión a las otras clases
    public function getConexion() {
        $this->comprobarConexion();
        return $this->db;
    }

    public function inicializarBD() {
        $rutaSQL = __DIR__ . '/creacion.sql';
        if (!file_exists($rutaSQL)) return "Error: No se encuentra creacion.sql";

        $sqlScript = file_get_contents($rutaSQL);
        if ($this->db->multi_query($sqlScript)) {
            do { if ($result = $this->db->store_result()) { $result->free(); } } while ($this->db->more_results() && $this->db->next_result());
        }
        $this->db->select_db($this->dbname);
        
        $this->importarDatosCSV(__DIR__ . '/tipos.csv', 'tipos_recurso', 2);
        $this->importarDatosCSV(__DIR__ . '/ubicaciones.csv', 'ubicaciones', 3);
        $this->importarDatosCSV(__DIR__ . '/recursos.csv', 'recursos', 9);
        
        return "Base de datos inicializada correctamente.";
    }

    public function borrarBD() {
        $this->comprobarConexion();
        $sql = "DROP DATABASE IF EXISTS " . $this->dbname;
        return ($this->db->query($sql) === TRUE) ? "Base de datos eliminada." : "Error al eliminar.";
    }

    public function reiniciarDatos() {
        $this->comprobarConexion();
        try {
            $this->db->select_db($this->dbname);
            
            $this->db->query("SET FOREIGN_KEY_CHECKS = 0");
            $this->db->query("TRUNCATE TABLE reservas");
            $this->db->query("TRUNCATE TABLE recursos");
            $this->db->query("TRUNCATE TABLE ubicaciones");
            $this->db->query("TRUNCATE TABLE tipos_recurso");
            $this->db->query("TRUNCATE TABLE usuarios");
            $this->db->query("SET FOREIGN_KEY_CHECKS = 1");

            $this->importarDatosCSV(__DIR__ . '/tipos.csv', 'tipos_recurso', 2);
            $this->importarDatosCSV(__DIR__ . '/ubicaciones.csv', 'ubicaciones', 3);
            $this->importarDatosCSV(__DIR__ . '/recursos.csv', 'recursos', 9);
            
            return "Datos reiniciados correctamente.";
        } catch (mysqli_sql_exception $e) {
            return $this->inicializarBD();
        }
    }

    private function importarDatosCSV($archivo, $tabla, $numColumnas) {
        $check = $this->db->query("SELECT COUNT(*) as total FROM $tabla");
        $row = $check->fetch_assoc();
        if ($row['total'] == 0 && file_exists($archivo) && ($gestor = fopen($archivo, "r")) !== FALSE) {
            fgetcsv($gestor, 1000, ","); 
            while (($datos = fgetcsv($gestor, 1000, ",")) !== FALSE) {
                if (count($datos) == $numColumnas) {
                    $datosEscapados = array_map([$this->db, 'real_escape_string'], $datos);
                    $valores = "'" . implode("', '", $datosEscapados) . "'";
                    $this->db->query("INSERT INTO $tabla VALUES ($valores)");
                }
            }
            fclose($gestor);
        }
    }

    public function exportarCSV($tabla = 'reservas') {
        $this->comprobarConexion();
        $this->db->select_db($this->dbname);
        $tablasPermitidas = ['usuarios', 'tipos_recurso', 'ubicaciones', 'recursos', 'reservas'];
        
        if (!in_array($tabla, $tablasPermitidas)) return "Tabla no válida para exportar.";
        
        $resultado = $this->db->query("SELECT * FROM $tabla");
        if ($resultado && $resultado->num_rows > 0) {
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="' . $tabla . '_' . date('Y-m-d_H-i-s') . '.csv"');
            $output = fopen('php://output', 'w');
            $campos = $resultado->fetch_fields();
            $encabezados = array();
            foreach ($campos as $campo) { $encabezados[] = $campo->name; }
            fputcsv($output, $encabezados, ",");
            while ($fila = $resultado->fetch_assoc()) { fputcsv($output, $fila, ","); }
            fclose($output);
            exit();
        } else {
            return "No hay datos en la tabla '$tabla' para exportar.";
        }
    }
}
?>