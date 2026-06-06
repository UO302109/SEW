CREATE DATABASE IF NOT EXISTS reservas_turismo COLLATE utf8mb4_spanish_ci;
USE reservas_turismo;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipos_recurso (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS ubicaciones (
    id_ubicacion INT AUTO_INCREMENT PRIMARY KEY,
    direccion VARCHAR(255) NOT NULL,
    municipio VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS recursos (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo INT NOT NULL,
    id_ubicacion INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    plazas INT NOT NULL CHECK (plazas > 0),
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    FOREIGN KEY (id_tipo) REFERENCES tipos_recurso(id_tipo) ON DELETE CASCADE,
    FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id_ubicacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_recurso INT NOT NULL,
    plazas_reservadas INT NOT NULL CHECK (plazas_reservadas > 0),
    precio_total DECIMAL(10,2) NOT NULL,
    estado ENUM('Confirmada', 'Anulada') DEFAULT 'Confirmada',
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_recurso) REFERENCES recursos(id_recurso) ON DELETE CASCADE
);
