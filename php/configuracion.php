<?php
include 'Database.php';

$gestorDB = new Database();
$mensaje = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['crear'])) {
        $mensaje = $gestorDB->inicializarBD();
    } elseif (isset($_POST['borrar'])) {
        $mensaje = $gestorDB->borrarBD();
    } elseif (isset($_POST['reiniciar'])) {
        $mensaje = $gestorDB->reiniciarDatos();
    } elseif (isset($_POST['exportar'])) {
        // exportarCSV hace exit() al descargar; si devuelve algo es que hubo error
        $mensaje = $gestorDB->exportarCSV($_POST['tabla']);
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Burgos - Configuración de la base de datos</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="Fernando Remis Figueroa" />
    <meta name="description" content="Página de administración de la base de datos de reservas turísticas de Burgos." />
    <meta name="keywords" content="Burgos, base de datos, administración, reservas, configuración" />
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/favicon.ico" />
</head>
<body>
    <header>
        <h1><a href="../index.html">Burgos - Recursos turísticos</a></h1>
        <nav>
            <a href="../index.html" title="Inicio de la página">Inicio</a>
            <a href="../gastronomia.html" title="Gastronomía típica de Burgos">Gastronomía</a>
            <a href="../rutas.html" title="Rutas turísticas por la provincia">Rutas</a>
            <a href="../meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="../juego.html" title="Juego sobre Burgos">Juego</a>
            <a href="../reservas.php" title="Reserva de recursos turísticos">Reservas</a>
            <a href="../ayuda.html" title="Ayuda de la página">Ayuda</a>
        </nav>
    </header>

    <p>Estás en: <a href="../index.html">Inicio</a>&gt;&gt;<strong>Configuración de la base de datos</strong></p>

    <main>
        <section>
            <h2>Administración de la base de datos</h2>
            <p>Desde aquí se puede crear, reiniciar o eliminar la base de datos de la central de reservas, así como exportar el contenido de las tablas a CSV.</p>

            <?php if ($mensaje !== ""): ?>
                <p><strong>Resultado:</strong> <?php echo htmlspecialchars($mensaje); ?></p>
            <?php endif; ?>
        </section>

        <section>
            <h3>Creación y mantenimiento</h3>
            <form action="configuracion.php" method="post">
                <p>
                    <button type="submit" name="crear">Inicializar base de datos</button>
                    <button type="submit" name="reiniciar">Reiniciar datos</button>
                    <button type="submit" name="borrar">Eliminar base de datos</button>
                </p>
            </form>
        </section>

        <section>
            <h3>Exportar tablas a CSV</h3>
            <form action="configuracion.php" method="post">
                <p>
                    <label for="tabla">Selecciona la tabla a exportar:</label>
                    <select id="tabla" name="tabla">
                        <option value="usuarios">Usuarios</option>
                        <option value="tipos_recurso">Tipos de recurso</option>
                        <option value="ubicaciones">Ubicaciones</option>
                        <option value="recursos">Recursos</option>
                        <option value="reservas">Reservas</option>
                    </select>
                </p>
                <p>
                    <button type="submit" name="exportar">Exportar a CSV</button>
                </p>
            </form>
        </section>

        <section>
            <p><a href="../reservas.php">Ir a la central de reservas</a></p>
        </section>
    </main>
</body>
</html>
