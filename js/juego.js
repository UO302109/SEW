class Juego {
    #preguntas;

    constructor() {
        this.#preguntas = [
            {
                pregunta: "1. Según la sección de Gastronomía, ¿qué ingredientes componen la Morcilla de Burgos?",
                opciones: [
                    "Carne de cerdo, pimentón y ajo",
                    "Sangre de cerdo, arroz, cebolla y especias", // Correcta
                    "Sangre, piñones y almendras",
                    "Arroz, patata y pimentón",
                    "Carne de ternera, cebolla y arroz"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "2. ¿Qué característica define al 'Lechazo' según el glosario gastronómico?",
                opciones: [
                    "Cordero de más de 1 año",
                    "Cordero alimentado con pastos de la Ribera",
                    "Cordero lechal de menos de 35 días alimentado solo con leche materna", // Correcta
                    "Cerdo asado al horno de leña",
                    "Ternera alimentada solo con leche materna"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "3. En la tabla de zonas de producción, ¿dónde se produce principalmente la Alubia roja?",
                opciones: [
                    "Ribera del Duero",
                    "Capital y alfoz",
                    "Ibeas de Juarros y comarca", // Correcta
                    "Sur de la provincia",
                    "Norte de la provincia"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "4. ¿De qué ingredientes está hecha la típica 'Sopa castellana'?",
                opciones: [
                    "Fideos, pollo y huevo",
                    "Garbanzos, chorizo y tocino",
                    "Pan duro, ajo, pimentón, huevo y caldo", // Correcta
                    "Pescado, almejas y azafrán",
                    "Arroz, pollo y verduras"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "5. Según la sección de Ayuda (Reservas), ¿qué requisito previo es obligatorio para reservar un recurso turístico?",
                opciones: [
                    "Pagar el 50% por adelantado",
                    "Llamar por teléfono a la central",
                    "Registrarse previamente mediante un formulario", // Correcta
                    "Enviar un correo electrónico",
                    "Descargar la aplicación móvil de Burgos"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "6. Según la Ayuda, ¿cuántos días de previsión meteorológica muestra la sección de Meteorología?",
                opciones: [
                    "3 días",
                    "5 días",
                    "7 días", // Correcta
                    "10 días",
                    "14 días"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "7. ¿Qué elementos gráficos se pueden visualizar en la sección de Rutas para cada recorrido?",
                opciones: [
                    "Planimetría sobre un mapa interactivo y altimetría", // Correcta
                    "Solo un mapa estático en formato JPG",
                    "Fotografías en 3D de los hitos",
                    "Un vídeo del recorrido completo en MP4",
                    "Gráficos de barras con la dificultad de la ruta"
                ],
                respuestaCorrecta: 0
            },
            {
                pregunta: "8. ¿En qué zona de la provincia se producen principalmente los Vinos Ribera del Duero?",
                opciones: [
                    "Norte de la provincia",
                    "Sur de la provincia, ribera del río Duero", // Correcta
                    "Capital y comarca",
                    "Este de la provincia",
                    "Oeste, límite con Palencia"
                ],
                respuestaCorrecta: 1
            },
            {
                pregunta: "9. Según la Ayuda, ¿qué incluye el carrusel de la página de Inicio además de fotos de los atractivos?",
                opciones: [
                    "Un vídeo promocional",
                    "Las noticias de última hora",
                    "El mapa de situación de la provincia", // Correcta
                    "El estado del tráfico",
                    "La temperatura actual"
                ],
                respuestaCorrecta: 2
            },
            {
                pregunta: "10. Según el glosario, ¿qué es la 'Olla podrida'?",
                opciones: [
                    "Un postre típico con miel y nueces",
                    "Un vino Gran Reserva de la Ribera",
                    "Un guiso contundente con alubias rojas, chorizo, morcilla, costilla y verduras", // Correcta
                    "Una sopa fría de tomate y pan",
                    "Un tipo de queso curado"
                ],
                respuestaCorrecta: 2
            }
        ];
    }

    generarFormulario() {
        const main = document.querySelector("main");
        
        const seccion = document.createElement("section");
        const h2 = document.createElement("h2");
        h2.textContent = "Test de conocimientos turísticos de Burgos";
        seccion.appendChild(h2);

        const form = document.createElement("form");
        form.id = "formulario-juego";
        this.#preguntas.forEach((item, indexPregunta) => {
            const fieldset = document.createElement("fieldset");
            
            const legend = document.createElement("legend");
            legend.textContent = item.pregunta;
            fieldset.appendChild(legend);

            item.opciones.forEach((opcion, indexOpcion) => {
                const label = document.createElement("label");
                label.style.display = "block"; 
                label.style.marginBottom = "5px";
                
                const input = document.createElement("input");
                input.type = "radio";
                input.name = `pregunta${indexPregunta}`;
                input.value = indexOpcion;

                label.appendChild(input);
                label.appendChild(document.createTextNode(" " + opcion));
                
                fieldset.appendChild(label);
            });

            form.appendChild(fieldset);
        });

        const boton = document.createElement("button");
        boton.type = "button";
        boton.textContent = "Comprobar Resultados";
        boton.onclick = () => this.evaluarRespuestas();
        
        form.appendChild(boton);
        seccion.appendChild(form);
        main.appendChild(seccion);
    }

    evaluarRespuestas() {
        let puntuacion = 0;
        let respondidas = 0;
        const form = document.getElementById("formulario-juego");

        // Evaluamos cada pregunta
        this.#preguntas.forEach((item, indexPregunta) => {
            const opciones = form.elements[`pregunta${indexPregunta}`];

            for (let i = 0; i < opciones.length; i++) {
                if (opciones[i].checked) {
                    respondidas++;
                    if (parseInt(opciones[i].value) === item.respuestaCorrecta) {
                        puntuacion++;
                    }
                    break;
                }
            }
        });
        if (respondidas < this.#preguntas.length) {
            alert(`Es obligatorio responder a todas las preguntas. Has respondido ${respondidas} de ${this.#preguntas.length}.`);
            return;
        }

        this.mostrarPuntuacion(puntuacion);
    }

    mostrarPuntuacion(puntos) {
        let pResultado = document.getElementById("resultado-juego");
        
        if (!pResultado) {
            pResultado = document.createElement("p");
            pResultado.id = "resultado-juego";
            pResultado.style.fontWeight = "bold";
            pResultado.style.fontSize = "1.2em";
            pResultado.style.color = "#0055a4"; 
            document.querySelector("main").appendChild(pResultado);
        }

        pResultado.textContent = `¡Test finalizado! Tu calificación es de ${puntos} sobre 10.`;
    }
}

const juegoBurgos = new Juego();
juegoBurgos.generarFormulario();