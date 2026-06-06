import xml.etree.ElementTree as ET
import os

class Kml(object):
    def __init__(self):
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz, 'Document')

    def addLineString(self, nombre, listaCoordenadas, color, ancho):
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = "Ruta: " + nombre
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls, 'extrude').text = "1"
        ET.SubElement(ls, 'tessellation').text = "1"
        ET.SubElement(ls, 'altitudeMode').text = "clampToGround"
        ET.SubElement(ls, 'coordinates').text = listaCoordenadas

        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement(linea, 'color').text = color
        ET.SubElement(linea, 'width').text = str(ancho)

    def addPlacemark(self, nombre, descripcion, long, lat, alt):
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = nombre
        if descripcion:
            ET.SubElement(pm, 'description').text = descripcion

        punto = ET.SubElement(pm, 'Point')
        ET.SubElement(punto, 'coordinates').text = f"{long.strip()},{lat.strip()},{alt.strip()}"

    def escribir(self, nombreArchivoKML):
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)

def main():
    archivoXML = "rutas.xml"
    if not os.path.exists(archivoXML):
        print(f"Error: No se encontró el archivo {archivoXML}")
        return

    tree = ET.parse(archivoXML)
    root = tree.getroot()
    ns = {'ns': 'http://www.uniovi.es'}

    rutas = root.findall('ns:ruta', ns)

    for indice, ruta in enumerate(rutas):
        kml = Kml()
        nombre_ruta = ruta.find('ns:nombre', ns).text.strip()

        # Coordenadas de inicio
        coords_ini = ruta.find('ns:coordenadasInicio', ns)
        lon_ini = coords_ini.find('ns:long', ns).text.strip()
        lat_ini = coords_ini.find('ns:lat', ns).text.strip()
        alt_ini = coords_ini.find('ns:altitud', ns).text.strip()

        listaCoordenadas = f"{lon_ini},{lat_ini},{alt_ini}\n"

        lugar_ini = ruta.find('ns:lugarInicio', ns)
        nombre_inicio = lugar_ini.text.strip() if lugar_ini is not None else "Inicio de Ruta"
        kml.addPlacemark(nombre_inicio, "Punto de partida", lon_ini, lat_ini, alt_ini)

        # Hitos
        hitos = ruta.findall('.//ns:hito', ns)
        for hito in hitos:
            coords = hito.find('ns:coordenadas', ns)
            lon = coords.find('ns:long', ns).text.strip()
            lat = coords.find('ns:lat', ns).text.strip()
            alt = coords.find('ns:altitud', ns).text.strip()

            listaCoordenadas += f"{lon},{lat},{alt}\n"

            # Marcador solo para hitos con nombre
            nodo_nombre = hito.find('ns:nombre', ns)
            if nodo_nombre is not None and nodo_nombre.text:
                nombre_hito = nodo_nombre.text.strip()
                nodo_desc = hito.find('ns:descripcion', ns)
                desc_hito = nodo_desc.text.strip() if nodo_desc is not None and nodo_desc.text else ""

                kml.addPlacemark(nombre_hito, desc_hito, lon, lat, alt)

        kml.addLineString(nombre_ruta, listaCoordenadas.strip(), "#ff0000ff", 5)

        nombreArchivoKML = f"planimetria_ruta{indice + 1}.kml"
        kml.escribir(nombreArchivoKML)
        print(f"Generado: {nombreArchivoKML}")

if __name__ == "__main__":
    main()
