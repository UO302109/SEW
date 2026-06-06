class Ciudad {
    #nombre;
    #coordenadas;

    constructor(nombre) {
        this.#nombre = nombre;
    }

    inicializarValores(coordenadas) {
        this.#coordenadas = coordenadas;
    }

    getNombreCiudad() {
        return this.#nombre;
    }

    getMeteorologiaActual() {

        const API_URL = "https://api.open-meteo.com/v1/forecast";
        const coords = this.#coordenadas.split(',');
        const latitud = parseFloat(coords[0].trim());
        const longitud = parseFloat(coords[1].trim());

        const params = {
            latitude: latitud,
            longitude: longitud,
            current: ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
            timezone: "auto"
        };

        $.getJSON(API_URL, params)
            .done((json) => {
                this.procesarJSONActual(json);
            });
    }

    procesarJSONActual(datos) {
        const main = document.querySelector("main");
        const seccionMeteo = document.createElement("section");

        const h2 = document.createElement("h2");
        h2.textContent = `Tiempo Actual en ${this.getNombreCiudad()}`;
        seccionMeteo.appendChild(h2);

        const ul = document.createElement("ul");

        const liTemp = document.createElement("li");
        liTemp.textContent = `Temperatura: ${datos.current.temperature_2m}°C`;
        ul.appendChild(liTemp);

        const liHum = document.createElement("li");
        liHum.textContent = `Humedad Relativa: ${datos.current.relative_humidity_2m}%`;
        ul.appendChild(liHum);

        const liViento = document.createElement("li");
        liViento.textContent = `Viento: ${datos.current.wind_speed_10m} km/h`;
        ul.appendChild(liViento);

        seccionMeteo.appendChild(ul);
        main.appendChild(seccionMeteo); 
    }

    getMeteorologiaPrevision() {
        const API_URL = "https://api.open-meteo.com/v1/forecast";
        const coords = this.#coordenadas.split(',');
        const latitud = parseFloat(coords[0].trim());
        const longitud = parseFloat(coords[1].trim());

        const params = {
            latitude: latitud,
            longitude: longitud,
            daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_sum"],
            timezone: "auto"
        };

        $.getJSON(API_URL, params)
            .done((json) => {
                this.procesarJSONPrevision(json);
            });
    }

    procesarJSONPrevision(datos) {
        const main = document.querySelector("main");
        const seccionMeteo = document.createElement("section");

        const h2 = document.createElement("h2");
        h2.textContent = "Previsión para los próximos 7 días";
        seccionMeteo.appendChild(h2);

        for (let i = 0; i < datos.daily.time.length; i++) {
            const article = document.createElement("article");

            const h3 = document.createElement("h3");
            h3.textContent = `Fecha: ${datos.daily.time[i]}`;
            article.appendChild(h3);

            const ul = document.createElement("ul");

            const liMax = document.createElement("li");
            liMax.textContent = `Temp. Máxima: ${datos.daily.temperature_2m_max[i]}°C`;
            ul.appendChild(liMax);

            const liMin = document.createElement("li");
            liMin.textContent = `Temp. Mínima: ${datos.daily.temperature_2m_min[i]}°C`;
            ul.appendChild(liMin);

            const liLluvia = document.createElement("li");
            liLluvia.textContent = `Precipitaciones: ${datos.daily.precipitation_sum[i]} mm`;
            ul.appendChild(liLluvia);

            article.appendChild(ul);
            seccionMeteo.appendChild(article);
        }

        main.appendChild(seccionMeteo);
    }
}

var ciudad = new Ciudad("Burgos");
ciudad.inicializarValores("42.3439, -3.6969"); 

ciudad.getMeteorologiaActual();
ciudad.getMeteorologiaPrevision();
