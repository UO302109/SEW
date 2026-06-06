class Noticias {
    #busqueda;
    #url;
    #apikey;
    #$contenedor;

    constructor(busqueda) {
        this.#busqueda = busqueda;
    
        this.#url = 'https://api.thenewsapi.com/v1/news/top';
      
        this.#apikey = 'gMKZ8qG7kSuMX0lmgpDyiBintqG8wC5IpMHeghcu'; 

        let $main = $("main");
        if ($main.length === 0) {
            $main = $("<main>");
            $("body").append($main);
        }

        this.#$contenedor = $("<section>");
        $main.append(this.#$contenedor);
    }

    async buscar() {
        const params = new URLSearchParams({
            api_token: this.#apikey,
            search: this.#busqueda,
            locale: 'es' 
        });

        const urlCompleta = `${this.#url}?${params.toString()}`;
        
        try {
            const respuesta = await fetch(urlCompleta);
            const datos = await respuesta.json();

            this.#procesarInformacion(datos);

        } catch (error) {
            console.error('Error en el método buscar() de Noticias:', error);
            throw error;
        }
    }

    #procesarInformacion(datos) {
        this.#$contenedor.text("");
        const $header = $("<h2>").text("Últimas Noticias de " + this.#busqueda);
        this.#$contenedor.append($header);
 
        const noticias = datos.data; 
        
        if (noticias && noticias.length > 0) {
            noticias.forEach(noticia => {
                
                const $titulo = $("<h3>").append(
                    $("<a>").attr({
                        href: noticia.url,
                        target: "_blank"
                    }).text(noticia.title)
                );

                let textoEntradilla = noticia.description || 'No hay descripción disponible.';
                const $entradilla = $("<p>").text(textoEntradilla);
             
                const $metaData = $("<p>").text(`Fuente: ${noticia.source}`);
                
                this.#$contenedor.append($titulo);
                this.#$contenedor.append($entradilla);
                this.#$contenedor.append($metaData);
            });
        } else {
            this.#$contenedor.append($("<p>").text("No se encontraron noticias recientes."));
        }
    }
}


const servicioNoticias = new Noticias('Burgos turismo');
servicioNoticias.buscar();

