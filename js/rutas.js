/* BURGOS - RECURSOS TURÍSTICOS
   rutas.js - Carga rutas.xml y muestra la información, planimetría y altimetría de cada ruta
   Fernando Remis Figueroa - UO302109
*/

class GestorRutas {

    constructor() {
        mapboxgl.accessToken = "pk.eyJ1IjoidW8zMDIxMDkiLCJhIjoiY21pNmg5M3M3MDBhODJqc2QwYWN0bWxndiJ9.Jjld-TU2KMACHdwHv9qryA";
        this.#cargarRutasXML();
    }

    #cargarRutasXML() {
        const gestor = this;
        $.ajax({
            url: "xml/rutas.xml",
            dataType: "xml"
        }).done(function (xmlDoc) {
            gestor.#procesarRutas($(xmlDoc));
        }).fail(function () {
            $("main").append($("<p>").addClass("error-msg").text("No se pudo cargar el archivo rutas.xml."));
        });
    }

    #procesarRutas($xml) {
        const gestor = this;
        $xml.find("ruta").each(function (indice) {
            const $ruta = $(this);
            const numeroRuta = indice + 1;
            
            // 1. Construir información textual (Textos, listas y multimedia)
            const $article = gestor.#construirInfoRuta($ruta, numeroRuta);
            
            // 2. Crear contenedores en ORDEN EXACTO (Planimetría -> Altimetría)
            const $secPlanimetria = $("<section>").addClass("seccion-planimetria");
            $secPlanimetria.append($("<h4>").text("Planimetría de la ruta"));
            
            const $secAltimetria = $("<section>").addClass("seccion-altimetria");
            $secAltimetria.append($("<h4>").text("Altimetría de la ruta"));

            // 3. Añadimos las secciones vacías al artículo en orden, y el artículo al main
            $article.append($secPlanimetria);
            $article.append($secAltimetria);

            $("main").append($article);
            $("main").append($("<hr>"));

            // 4. Leer del XML las rutas generadas por Python
            let rutaKML = $ruta.children("planimetria").text().trim();
            let rutaSVG = $ruta.children("altimetria").text().trim();

            // Fallback por seguridad por si los nodos estuvieran vacíos
            if (!rutaKML) rutaKML = "xml/planimetria_ruta" + numeroRuta + ".kml";
            if (!rutaSVG) rutaSVG = "xml/altimetria_ruta" + numeroRuta + ".svg";

            // 5. Cargar los archivos y pintarlos en sus contenedores
            gestor.#cargarKML(numeroRuta, rutaKML, $secPlanimetria);
            gestor.#cargarSVG(rutaSVG, $secAltimetria);
        });
    }

    // ---------- Construcción de la información textual ----------

    #construirInfoRuta($ruta, numeroRuta) {
        const $article = $("<article>").attr("data-ruta", numeroRuta);

        $article.append($("<h3>").text($ruta.children("nombre").text()));
        $article.append($("<p>").text($ruta.children("descripcion").text()));

        const $lista = $("<ul>");
        $lista.append($("<li>").text("Tipo de ruta: " + $ruta.children("tipo").text()));
        $lista.append($("<li>").text("Medio de transporte: " + $ruta.children("medioTransporte").text()));

        const fecha = $ruta.children("fechaInicio").text();
        if (fecha) $lista.append($("<li>").text("Fecha de inicio: " + fecha));

        const hora = $ruta.children("horaInicio").text();
        if (hora) $lista.append($("<li>").text("Hora de inicio: " + hora));

        $lista.append($("<li>").text("Duración: " + $ruta.children("duracion").text()));
        $lista.append($("<li>").text("Agencia: " + $ruta.children("agencia").text()));
        $lista.append($("<li>").text("Adecuada para: " + $ruta.children("personasAdecuadas").text()));
        $lista.append($("<li>").text("Punto de partida: " + $ruta.children("lugarInicio").text() + " (" + $ruta.children("direccionInicio").text() + ")"));

        const $coordsInicio = $ruta.children("coordenadasInicio");
        const altUnidadInicio = $coordsInicio.children("altitud").attr("unidad");
        $lista.append($("<li>").text(
            "Coordenadas de inicio: Longitud " + $coordsInicio.children("long").text() +
            ", Latitud " + $coordsInicio.children("lat").text() +
            ", Altitud " + $coordsInicio.children("altitud").text() + " " + altUnidadInicio
        ));

        $lista.append($("<li>").text("Nivel de recomendación: " + $ruta.children("recomendacion").text() + " / 10"));
        $article.append($lista);

        $article.append($("<h4>").text("Bibliografía y referencias:"));
        const $listaBiblio = $("<ul>");
        $ruta.children("bibliografia").children("referencia").each(function () {
            const enlace = $(this).text();
            const titulo = $(this).attr("alt") || enlace;
            $listaBiblio.append($("<li>").append($("<a>").attr({ "href": enlace, "target": "_blank" }).text(titulo)));
        });
        $article.append($listaBiblio);

        $article.append($("<h4>").text("Hitos de la ruta:"));
        const $seccionHitos = $("<section>");

        $ruta.children("hitos").children("hito").each(function () {
            const $hito = $(this);
            const nombreHito = $hito.children("nombre").text();
            if (!nombreHito) return; 

            const $articleHito = $("<article>");
            $articleHito.append($("<h5>").text(nombreHito));
            $articleHito.append($("<p>").text($hito.children("descripcion").text()));

            const $listaDatosHito = $("<ul>");
            const $distancia = $hito.children("distanciaAnterior");
            const distUnidad = $distancia.attr("unidad");
            $listaDatosHito.append($("<li>").text("Distancia desde el punto anterior: " + $distancia.text() + " " + distUnidad));

            const $coordsHito = $hito.children("coordenadas");
            const altUnidadHito = $coordsHito.children("altitud").attr("unidad");
            $listaDatosHito.append($("<li>").text(
                "Coordenadas: Latitud " + $coordsHito.children("lat").text() +
                ", Longitud " + $coordsHito.children("long").text() +
                ", Altitud " + $coordsHito.children("altitud").text() + " " + altUnidadHito
            ));
            $articleHito.append($listaDatosHito);

            const $fotos = $hito.children("galeriaFotos").children("imagen");
            $fotos.each(function () {
                const url = $(this).attr("urlf").replace("../multimedia/", "multimedia/");
                const alt = $(this).attr("alt");
                $articleHito.append($("<img>").attr({ "src": url, "alt": alt }));
            });

            const $videos = $hito.children("galeriaVideos").children("video");
            $videos.each(function () {
                const url = $(this).attr("urlv").replace("../multimedia/", "multimedia/");
                const alt = $(this).attr("alt") || "Vídeo del hito";
                const $vid = $("<video>").attr({ "controls": true, "title": alt });
                $vid.append($("<source>").attr("src", url));
                $articleHito.append($vid);
            });

            $seccionHitos.append($articleHito);
        });

        $article.append($seccionHitos);
        return $article;
    }

    // ---------- Carga de KML (Mapbox) ----------

    #cargarKML(numeroRuta, urlKml, $contenedorDestino) {
        const gestor = this;
        $.ajax({
            url: urlKml,
            dataType: "text"
        }).done(function (kmlTexto) {
            gestor.#crearMapaConKML(kmlTexto, numeroRuta, $contenedorDestino);
        }).fail(function () {
            $contenedorDestino.append($("<p>").addClass("error-msg").text("No se pudo cargar la planimetría: " + urlKml));
        });
    }

    #crearMapaConKML(kmlTexto, numeroRuta, $contenedorDestino) {
        const contenedorMapa = document.createElement("div");
        contenedorMapa.className = "contenedor-mapa";
        contenedorMapa.id = "mapa-ruta-" + numeroRuta;
        
        // Estilos en línea para evitar colapsos al meterlo dentro del article
        contenedorMapa.style.width = "100%";
        contenedorMapa.style.height = "500px";
        contenedorMapa.style.marginTop = "1rem";
        contenedorMapa.style.marginBottom = "2rem";

        $contenedorDestino.append(contenedorMapa);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlTexto, "text/xml");

        const lineStrings = xmlDoc.getElementsByTagName("LineString");
        const puntosLinea = [];
        if (lineStrings.length > 0) {
            const coordsTag = lineStrings[0].getElementsByTagName("coordinates")[0];
            if (coordsTag) {
                const raw = coordsTag.textContent.trim().split(/\s+/);
                for (let i = 0; i < raw.length; i++) {
                    const partes = raw[i].split(",");
                    if (partes.length >= 2) {
                        const lng = parseFloat(partes[0]);
                        const lat = parseFloat(partes[1]);
                        if (!isNaN(lng) && !isNaN(lat)) {
                            puntosLinea.push([lng, lat]);
                        }
                    }
                }
            }
        }

        const placemarks = xmlDoc.getElementsByTagName("Placemark");
        const hitos = [];
        for (let i = 0; i < placemarks.length; i++) {
            const pm = placemarks[i];
            const pointTag = pm.getElementsByTagName("Point")[0];
            if (!pointTag) continue;
            
            const coordsTag = pointTag.getElementsByTagName("coordinates")[0];
            if (!coordsTag) continue;
            
            const partes = coordsTag.textContent.trim().split(",");
            if (partes.length < 2) continue;
            
            const lng = parseFloat(partes[0]);
            const lat = parseFloat(partes[1]);
            const nameTag = pm.getElementsByTagName("name")[0];
            const descTag = pm.getElementsByTagName("description")[0];
            const nombre = nameTag ? nameTag.textContent : "";
            const descripcion = descTag ? descTag.textContent : "";
            
            hitos.push({ lng, lat, nombre, descripcion });
        }

        const centroInicial = puntosLinea.length > 0 ? puntosLinea[0] : (hitos.length > 0 ? [hitos[0].lng, hitos[0].lat] : [-3.7, 42.3]);

        const mapa = new mapboxgl.Map({
            container: contenedorMapa,
            style: "mapbox://styles/mapbox/streets-v12",
            center: centroInicial,
            zoom: 12
        });
        mapa.addControl(new mapboxgl.NavigationControl());

        mapa.on("load", function () {
            if (puntosLinea.length > 1) {
                const idFuente = "ruta-fuente-" + numeroRuta;
                const idCapa = "ruta-capa-" + numeroRuta;

                mapa.addSource(idFuente, {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "geometry": {
                            "type": "LineString",
                            "coordinates": puntosLinea
                        }
                    }
                });

                mapa.addLayer({
                    "id": idCapa,
                    "type": "line",
                    "source": idFuente,
                    "paint": {
                        "line-color": "#FF0000",
                        "line-width": 5
                    }
                });
            }

            hitos.forEach(function (h) {
                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    "<strong>" + h.nombre + "</strong>" +
                    (h.descripcion ? "<br>" + h.descripcion : "")
                );
                new mapboxgl.Marker({ color: "red" })
                    .setLngLat([h.lng, h.lat])
                    .setPopup(popup)
                    .addTo(mapa);
            });

            const todos = puntosLinea.concat(hitos.map(h => [h.lng, h.lat]));
            if (todos.length > 0) {
                const lonMin = Math.min(...todos.map(p => p[0]));
                const lonMax = Math.max(...todos.map(p => p[0]));
                const latMin = Math.min(...todos.map(p => p[1]));
                const latMax = Math.max(...todos.map(p => p[1]));
                mapa.fitBounds(
                    [[lonMin, latMin], [lonMax, latMax]],
                    { padding: 50, duration: 0 }
                );
            }
        });
    }

    // ---------- Carga de SVG ----------

    #cargarSVG(urlSvg, $contenedorDestino) {
        const gestor = this;
        $.ajax({
            url: urlSvg,
            dataType: "text"
        }).done(function (svgTexto) {
            gestor.#insertarSVG(svgTexto, $contenedorDestino);
        }).fail(function () {
            $contenedorDestino.append($("<p>").addClass("error-msg").text("No se pudo cargar la altimetría: " + urlSvg));
        });
    }

    #insertarSVG(contenidoTexto, $contenedorDestino) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(contenidoTexto, "image/svg+xml");
        const elementoSVG = doc.documentElement;
        elementoSVG.setAttribute("version", "1.1");
        
        // Ajustamos la anchura para que se vea perfectamente dentro del artículo
        elementoSVG.style.width = "100%";
        elementoSVG.style.height = "auto";
        
        $contenedorDestino.append(elementoSVG);
    }
}

const miGestorRutas = new GestorRutas();
