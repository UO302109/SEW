<?php
// 1. Iniciar la sesión
session_start();

// 2. Importar las 4 clases de nuestro nuevo motor modular
require_once 'php/Database.php';
require_once 'php/Usuario.php';
require_once 'php/Recurso.php';
require_once 'php/Reserva.php';

// 3. Instanciar infraestructura e Inyectar Dependencias
$baseDatos = new Database();
$conexion = $baseDatos->getConexion(); // Extraemos la conexión mysqli

$gestorUsuarios = new Usuario($conexion);
$gestorRecursos = new Recurso($conexion);
$gestorReservas = new Reserva($conexion, $gestorRecursos); 

$mensaje_sistema = "";
$presupuesto_actual = null;

// --- PROCESAMIENTO DE FORMULARIOS (MÁQUINA DE ESTADOS) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    if (isset($_POST['btn_registro'])) {
        if ($gestorUsuarios->registrarUsuario($_POST['nombre'], $_POST['apellidos'], $_POST['email'], $_POST['password'])) {
            $mensaje_sistema = "¡Registro completado con éxito! Ya puedes iniciar sesión.";
        } else {
            $mensaje_sistema = "Error: El correo electrónico ya está registrado.";
        }
    }
    elseif (isset($_POST['btn_login'])) {
        $usuario = $gestorUsuarios->loginUsuario($_POST['email'], $_POST['password']);
        if ($usuario) {
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nombre'] = $usuario['nombre'];
        } else {
            $mensaje_sistema = "Error: Correo o contraseña incorrectos.";
        }
    }
    elseif (isset($_POST['btn_logout'])) {
        session_unset();
        session_destroy();
        header("Location: reservas.php");
        exit();
    }
    elseif (isset($_POST['btn_presupuesto'])) {
        $recurso = $gestorRecursos->getRecursoPorId($_POST['id_recurso']);
        $plazas_solicitadas = (int)$_POST['plazas_solicitadas'];
        $disponibles = $gestorRecursos->getPlazasDisponibles($_POST['id_recurso']);

        if ($plazas_solicitadas <= 0) {
            $mensaje_sistema = "Error: El número de plazas debe ser mayor que cero.";
        } elseif ($plazas_solicitadas > $disponibles) {
            $mensaje_sistema = "Error: Solo quedan " . $disponibles . " plazas disponibles.";
        } else {
            $precio_total = $recurso['precio'] * $plazas_solicitadas;
            $presupuesto_actual = [
                'id_recurso' => $recurso['id_recurso'],
                'nombre' => $recurso['nombre'],
                'plazas' => $plazas_solicitadas,
                'precio_total' => $precio_total
            ];
        }
    }
    elseif (isset($_POST['btn_cancelar_presupuesto'])) {
        $presupuesto_actual = null;
    }
    elseif (isset($_POST['btn_confirmar'])) {
        if ($gestorReservas->confirmarReserva($_SESSION['usuario_id'], $_POST['id_recurso'], $_POST['plazas'], $_POST['precio_total'])) {
            $mensaje_sistema = "¡Reserva confirmada y guardada con éxito!";
        } else {
            $mensaje_sistema = "Error: no se pudo guardar la reserva.";
        }
    }
    elseif (isset($_POST['btn_anular'])) {
        if ($gestorReservas->anularReserva($_POST['id_reserva'], $_SESSION['usuario_id'])) {
            $mensaje_sistema = "La reserva ha sido anulada correctamente.";
        }
    }
}
?>

<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>Burgos - Reservas</title>
    <meta name="author" content="Fernando Remis Figueroa" />
    <meta name="description" content="Central de reservas de recursos turísticos de Burgos." />
    <meta name="keywords" content="reservas, turismo, Burgos, viajes, entradas" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/favicon.ico" />
</head>

<body>
    <header>
        <h1><a href="index.html">Burgos - Recursos turísticos</a></h1>
        <nav>
            <a href="index.html" title="Inicio de la página">Inicio</a>
            <a href="gastronomia.html" title="Gastronomía típica de Burgos">Gastronomía</a>
            <a href="rutas.html" title="Rutas turísticas por la provincia">Rutas</a>
            <a href="meteorologia.html" title="Información meteorológica">Meteorología</a>
            <a href="juego.html" title="Juego sobre Burgos">Juego</a>
            <a href="reservas.php" class="activo" title="Reserva de recursos turísticos">Reservas</a>
            <a href="ayuda.html" title="Ayuda de la página">Ayuda</a>
        </nav>
    </header>

    <p>Estás en: <a href="index.html">Inicio</a>&gt;&gt;<strong>Reservas</strong></p>

    <main>
        <article>
            <h2>Central de Reservas Turísticas</h2>

            <?php if (!empty($mensaje_sistema)): ?>
                <p class="error-msg"><strong>Aviso:</strong> <?php echo htmlspecialchars($mensaje_sistema); ?></p>
            <?php endif; ?>

            <?php
            // ==========================================
            // ZONA 1: USUARIO NO LOGUEADO (Registro y Login)
            // ==========================================
            if (!isset($_SESSION['usuario_id'])):
            ?>
                <section>
                    <h3>Iniciar sesión</h3>
                    <p>Debes estar registrado e iniciar sesión para poder realizar reservas.</p>
                    <form action="reservas.php" method="POST">
                        <p>
                            <label for="login_email">Correo electrónico:</label>
                            <input type="email" id="login_email" name="email" required />
                        </p>
                        <p>
                            <label for="login_password">Contraseña:</label>
                            <input type="password" id="login_password" name="password" required />
                        </p>
                        <input type="submit" name="btn_login" value="Entrar" />
                    </form>
                </section>

                <section>
                    <h3>¿No tienes cuenta? Regístrate</h3>
                    <form action="reservas.php" method="POST">
                        <p>
                            <label for="reg_nombre">Nombre:</label>
                            <input type="text" id="reg_nombre" name="nombre" required />
                        </p>
                        <p>
                            <label for="reg_apellidos">Apellidos:</label>
                            <input type="text" id="reg_apellidos" name="apellidos" required />
                        </p>
                        <p>
                            <label for="reg_email">Correo electrónico:</label>
                            <input type="email" id="reg_email" name="email" required />
                        </p>
                        <p>
                            <label for="reg_password">Contraseña:</label>
                            <input type="password" id="reg_password" name="password" required />
                        </p>
                        <input type="submit" name="btn_registro" value="Registrarse" />
                    </form>
                </section>

            <?php
            // ==========================================
            // ZONA 2: USUARIO LOGUEADO
            // ==========================================
            else:
            ?>
                <section>
                    <h3>Bienvenido/a, <?php echo htmlspecialchars($_SESSION['usuario_nombre']); ?></h3>
                    <form action="reservas.php" method="POST">
                        <input type="submit" name="btn_logout" value="Cerrar sesión" />
                    </form>
                </section>

                <?php
                // ZONA 2A: Mostrar Presupuesto (Si el usuario le dio a "Generar Presupuesto")
                if ($presupuesto_actual !== null):
                ?>
                    <section>
                        <h3>Presupuesto de la reserva</h3>
                        <ul>
                            <li><strong>Recurso:</strong> <?php echo htmlspecialchars($presupuesto_actual['nombre']); ?></li>
                            <li><strong>Plazas solicitadas:</strong> <?php echo htmlspecialchars($presupuesto_actual['plazas']); ?></li>
                            <li><strong>Precio total:</strong> <?php echo htmlspecialchars(number_format($presupuesto_actual['precio_total'], 2)); ?> €</li>
                        </ul>
                        <p>¿Deseas confirmar la reserva con estos datos?</p>
                        <form action="reservas.php" method="POST">
                            <input type="hidden" name="id_recurso" value="<?php echo htmlspecialchars($presupuesto_actual['id_recurso']); ?>" />
                            <input type="hidden" name="plazas" value="<?php echo htmlspecialchars($presupuesto_actual['plazas']); ?>" />
                            <input type="hidden" name="precio_total" value="<?php echo htmlspecialchars($presupuesto_actual['precio_total']); ?>" />

                            <input type="submit" name="btn_confirmar" value="Confirmar reserva" />
                            <input type="submit" name="btn_cancelar_presupuesto" value="Cancelar presupuesto" />
                        </form>
                    </section>

                <?php
                // ZONA 2B: Mostrar Reservas Activas y Catálogo (Estado normal)
                else:
                ?>
                    <section>
                        <h3>Mis reservas</h3>
                        <?php
                        // ¡OJO AQUÍ! Ahora usamos gestorReservas
                        $mis_reservas = $gestorReservas->getReservasUsuario($_SESSION['usuario_id']);
                        if (count($mis_reservas) > 0):
                        ?>
                            <table>
                                <tr>
                                    <th scope="col" id="col-recurso">Recurso</th>
                                    <th scope="col" id="col-plazas">Plazas</th>
                                    <th scope="col" id="col-precio">Precio total</th>
                                    <th scope="col" id="col-estado">Estado</th>
                                    <th scope="col" id="col-accion">Acción</th>
                                </tr>
                                <?php foreach ($mis_reservas as $res): ?>
                                    <tr>
                                        <td headers="col-recurso"><?php echo htmlspecialchars($res['nombre']); ?></td>
                                        <td headers="col-plazas"><?php echo htmlspecialchars($res['plazas_reservadas']); ?></td>
                                        <td headers="col-precio"><?php echo htmlspecialchars(number_format($res['precio_total'], 2)); ?> €</td>
                                        <td headers="col-estado"><?php echo htmlspecialchars($res['estado']); ?></td>
                                        <td headers="col-accion">
                                            <?php if ($res['estado'] === 'Confirmada'): ?>
                                                <form action="reservas.php" method="POST">
                                                    <input type="hidden" name="id_reserva" value="<?php echo htmlspecialchars($res['id_reserva']); ?>" />
                                                    <input type="submit" name="btn_anular" value="Anular" />
                                                </form>
                                            <?php else: ?>
                                                Anulada
                                            <?php endif; ?>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </table>
                        <?php else: ?>
                            <p>Aún no tienes ninguna reserva realizada.</p>
                        <?php endif; ?>
                    </section>

                    <section>
                        <h3>Catálogo de recursos turísticos disponibles</h3>
                        <?php
                        // ¡OJO AQUÍ! Ahora usamos gestorRecursos
                        $recursos = $gestorRecursos->getRecursos();
                        foreach ($recursos as $rec):
                            $disponibles = $gestorRecursos->getPlazasDisponibles($rec['id_recurso']);
                        ?>
                            <article>
                                <h4><?php echo htmlspecialchars($rec['nombre']); ?> (<?php echo htmlspecialchars($rec['nombre_tipo']); ?>)</h4>
                                <p><strong>Ubicación:</strong> <?php echo htmlspecialchars($rec['municipio']); ?></p>
                                <p><strong>Descripción:</strong> <?php echo htmlspecialchars($rec['descripcion']); ?></p>
                                <ul>
                                    <li><strong>Inicio:</strong> <?php echo htmlspecialchars($rec['fecha_inicio']); ?></li>
                                    <li><strong>Fin:</strong> <?php echo htmlspecialchars($rec['fecha_fin']); ?></li>
                                    <li><strong>Plazas totales:</strong> <?php echo htmlspecialchars($rec['plazas']); ?></li>
                                    <li><strong>Plazas disponibles:</strong> <?php echo htmlspecialchars($disponibles); ?></li>
                                    <li><strong>Precio por plaza:</strong> <?php echo htmlspecialchars(number_format($rec['precio'], 2)); ?> €</li>
                                </ul>

                                <?php if ($disponibles > 0): ?>
                                    <form action="reservas.php" method="POST">
                                        <input type="hidden" name="id_recurso" value="<?php echo htmlspecialchars($rec['id_recurso']); ?>" />
                                        <label for="plazas_<?php echo htmlspecialchars($rec['id_recurso']); ?>">Plazas a reservar:</label>
                                        <input type="number" id="plazas_<?php echo htmlspecialchars($rec['id_recurso']); ?>" name="plazas_solicitadas" min="1" max="<?php echo htmlspecialchars($disponibles); ?>" required />
                                        <input type="submit" name="btn_presupuesto" value="Generar presupuesto" />
                                    </form>
                                <?php else: ?>
                                    <p><strong>Recurso completo. No quedan plazas disponibles.</strong></p>
                                <?php endif; ?>
                            </article>
                        <?php endforeach; ?>
                    </section>
                <?php endif; ?>
            <?php endif; ?>

        </article>
    </main>
</body>
</html>