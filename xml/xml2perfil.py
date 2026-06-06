import xml.etree.ElementTree as ET

class Svg(object):
    def __init__(self):
        self.raiz = ET.Element('svg', xmlns="http://www.w3.org/2000/svg", version="2.0")
        self.ancho = 1000
        self.alto = 600
        self.raiz.set("viewBox", f"0 0 {self.ancho} {self.alto}")

    def addLine(self, x1, y1, x2, y2, stroke, stroke_width):
        ET.SubElement(self.raiz, 'line',
                      x1=str(x1),
                      y1=str(y1),
                      x2=str(x2),
                      y2=str(y2),
                      stroke=stroke,
                      **{'stroke-width': str(stroke_width)})

    def addPolygon(self, points, stroke, stroke_width, fill):
        ET.SubElement(self.raiz, 'polygon',
                      points=points,
                      stroke=stroke,
                      fill=fill,
                      **{'stroke-width': str(stroke_width)})

    def addText(self, texto, x, y, font_family, font_size, style):
        t = ET.SubElement(self.raiz, 'text',
                          x=str(x),
                          y=str(y),
                          style=style,
                          **{'font-family': font_family, 'font-size': str(font_size)})
        t.text = texto

    def escribir(self, nombreArchivoSVG):
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombreArchivoSVG, encoding='utf-8', xml_declaration=True)

    def crear_escaladores(self, lista_puntos, ancho_svg, alto_svg):
        m_izq, m_der = 60, 20
        m_sup, m_inf = 50, 280

        alto_util = alto_svg - m_sup - m_inf
        ancho_util = ancho_svg - m_izq - m_der

        max_dist = lista_puntos[-1]['dist']
        if max_dist == 0: max_dist = 1

        altitudes = [p['alt'] for p in lista_puntos]
        min_alt = min(altitudes)
        max_alt = max(altitudes)
        rango_alt = max_alt - min_alt
        if rango_alt == 0: rango_alt = 1

        def get_x(d):
            return m_izq + (d / max_dist) * ancho_util

        def get_y(a):
            return (m_sup + alto_util) - ((a - min_alt) / rango_alt) * alto_util

        datos = {
            'min_alt': min_alt, 'max_alt': max_alt, 'max_dist': max_dist,
            'm_izq': m_izq, 'm_sup': m_sup, 'm_inf': m_inf, 'm_der': m_der,
            'alto_util': alto_util, 'ancho_util': ancho_util
        }

        return get_x, get_y, datos


def procesar_ruta(ruta, ns, indice):
    nuevoSVG = Svg()

    nodo_nombre = ruta.find(f'{ns}nombre')
    nombre = nodo_nombre.text if nodo_nombre is not None else "Ruta"

    nodo_origen = ruta.find(f'{ns}coordenadasInicio')
    alt_inicial = 0.0
    if nodo_origen is not None:
        nodo_alt = nodo_origen.find(f'{ns}altitud')
        if nodo_alt is not None:
            alt_inicial = float(nodo_alt.text)

    lista_puntos = []

    distancia_acumulada = 0.0
    hitos = ruta.findall(f'{ns}hitos/{ns}hito')

    for hito in hitos:
        nodo_dist = hito.find(f'{ns}distanciaAnterior')
        dist_tramo = float(nodo_dist.text) if nodo_dist is not None else 0.0

        nodo_coords = hito.find(f'{ns}coordenadas')
        alt_hito = 0.0
        if nodo_coords is not None:
            nodo_alt = nodo_coords.find(f'{ns}altitud')
            if nodo_alt is not None:
                alt_hito = float(nodo_alt.text)

        nodo_nombre_hito = hito.find(f'{ns}nombre')
        nombre_hito = nodo_nombre_hito.text if nodo_nombre_hito is not None else ""

        distancia_acumulada += dist_tramo
        lista_puntos.append({'dist': distancia_acumulada, 'alt': alt_hito, 'nombre': nombre_hito})

    get_x, get_y, info = nuevoSVG.crear_escaladores(lista_puntos, nuevoSVG.ancho, nuevoSVG.alto)

    # Título
    nuevoSVG.addText(
        f"Altimetría ruta '{nombre}'",
        str(nuevoSVG.ancho / 2 - 200),
        "30",
        "Arial", "20",
        "font-weight: bold; fill: black;"
    )

    # Eje vertical (altitud)
    nuevoSVG.addLine(
        str(info['m_izq']),
        str(info['m_sup']),
        str(info['m_izq']),
        str(info['m_sup'] + info['alto_util']),
        "grey", "2"
    )

    # Eje horizontal (distancia)
    nuevoSVG.addLine(
        str(info['m_izq']),
        str(info['m_sup'] + info['alto_util']),
        str(nuevoSVG.ancho - info['m_der']),
        str(info['m_sup'] + info['alto_util']),
        "grey", "2"
    )

    # Escala vertical (altitud en metros)
    alt_media = (info['min_alt'] + info['max_alt']) / 2
    nuevoSVG.addText(f"{info['max_alt']:.0f} m", "10", str(info['m_sup'] + 5),
                     "Arial", "12", "fill: grey;")
    nuevoSVG.addText(f"{alt_media:.0f} m", "10", str(info['m_sup'] + info['alto_util'] / 2 + 5),
                     "Arial", "12", "fill: grey;")
    nuevoSVG.addText(f"{info['min_alt']:.0f} m", "10", str(info['m_sup'] + info['alto_util'] + 5),
                     "Arial", "12", "fill: grey;")

    nuevoSVG.addLine(
        str(info['m_izq'] - 5), str(info['m_sup'] + info['alto_util'] / 2),
        str(info['m_izq']), str(info['m_sup'] + info['alto_util'] / 2),
        "grey", "1"
    )

    # Escala horizontal (distancia en metros)
    dist_media = info['max_dist'] / 2
    y_marca_x = info['m_sup'] + info['alto_util'] + 15
    nuevoSVG.addText("0 m", str(info['m_izq'] - 10), str(y_marca_x),
                     "Arial", "12", "fill: grey;")
    nuevoSVG.addText(f"{dist_media:.0f} m", str(get_x(dist_media) - 20), str(y_marca_x),
                     "Arial", "12", "fill: grey;")
    nuevoSVG.addText(f"{info['max_dist']:.0f} m", str(get_x(info['max_dist']) - 40), str(y_marca_x),
                     "Arial", "12", "fill: grey;")

    nuevoSVG.addLine(
        str(get_x(dist_media)), str(info['m_sup'] + info['alto_util']),
        str(get_x(dist_media)), str(info['m_sup'] + info['alto_util'] + 5),
        "grey", "1"
    )

    # Perfil como polígono cerrado
    string_coordenadas = ""
    for p in lista_puntos:
        px = get_x(p['dist'])
        py = get_y(p['alt'])
        string_coordenadas += f"{px},{py} "
    px_fin = get_x(info['max_dist'])
    py_base = info['m_sup'] + info['alto_util']
    string_coordenadas += f"{px_fin},{py_base} "
    px_ini = get_x(0)
    string_coordenadas += f"{px_ini},{py_base}"

    nuevoSVG.addPolygon(string_coordenadas.strip(), "red", "2", "none")

    # Etiquetas verticales de los hitos con nombre
    y_textos = info['m_sup'] + info['alto_util'] + 35
    estilo_vertical = "writing-mode: tb; glyph-orientation-vertical: 0;"

    for p in lista_puntos:
        if p['nombre']:
            x_pos = get_x(p['dist'])
            nuevoSVG.addText(p['nombre'], str(x_pos + 5), str(y_textos),
                             "Arial", "13", estilo_vertical)

    archivoSVG = f"altimetria_ruta{indice + 1}.svg"
    nuevoSVG.escribir(archivoSVG)
    print(f"Archivo '{archivoSVG}' generado correctamente.")


def main():
    archivoXML = "rutas.xml"

    try:
        tree = ET.parse(archivoXML)
    except FileNotFoundError:
        print(f"Error: No se encontró el archivo {archivoXML}")
        return

    root = tree.getroot()
    ns = '{http://www.uniovi.es}'

    rutas = root.findall(f'{ns}ruta')
    for indice, ruta in enumerate(rutas):
        procesar_ruta(ruta, ns, indice)


if __name__ == "__main__":
    main()
