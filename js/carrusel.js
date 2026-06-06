class Carrusel {
    #busqueda;
    #actual;
    #maximo;
    #fotos;
    #$article;

    constructor(busqueda) {
        this.#busqueda = busqueda;
        this.#actual = 0;
        this.#maximo = 5;

        this.#fotos = [
            { url: "multimedia/mapa-burgos.jpg", title: "Mapa de situación de Burgos" },
            { url: "multimedia/catedral.jpg", title: "Catedral de Burgos" },
            { url: "multimedia/atapuerca.jpg", title: "Yacimientos de Atapuerca" },
            { url: "multimedia/miraflores.jpg", title: "Cartuja de Miraflores" },
            { url: "multimedia/morcilla.jpg", title: "Gastronomía: Morcilla de Burgos" }
        ];

        let $main = $("main");
        if ($main.length === 0) {
            $main = $("<main>");
            $("body").append($main);
        }
        
        this.#$article = $("<article>"); 
        $main.append(this.#$article);
    }

    iniciar() {
        if (this.#fotos.length > 0) {
            this.#actual = 0;
            this.mostrarFotografias(); 
            setInterval(() => {
                this.#cambiarFotografia();
            }, 3000);
        }
    }

    #cambiarFotografia() {
        this.#actual++;
        if (this.#actual >= this.#fotos.length) {
            this.#actual = 0;
        }
        this.mostrarFotografias();
    }

    mostrarFotografias() {
        const fotoActual = this.#fotos[this.#actual];
        if (!fotoActual) return;

        const $h2 = this.#$article.find("h2");
        
        if ($h2.length === 0) {
            const $titulo = $("<h2>").text("Imágenes de " + this.#busqueda);
            const $img = $("<img>").attr({
                "src": fotoActual.url,
                "alt": fotoActual.title
            });
            this.#$article.append($titulo).append($img);
        } else {
            const $img = this.#$article.find("img");
            $img.attr("src", fotoActual.url);
            $img.attr("alt", fotoActual.title);
        }
    }
}

var miCarrusel = new Carrusel("Burgos");
miCarrusel.iniciar();






