import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def graficar_mandos_3d(ruta_archivo):
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        lineas = f.readlines()[3:]  # Eliminar las 3 primeras líneas
        datos_str = ''.join(lineas)

        # Asegurar que los booleanos estén en minúscula como en JSON
        datos_str = datos_str.replace("True", "true").replace("False", "false")

        # Cargar como JSON
        datos = json.loads(datos_str)

    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    for frame in datos.values():
        mandos = frame['mandos']
        izq = next(m for m in mandos if m['mando'] == 'I')
        der = next(m for m in mandos if m['mando'] == 'D')

        color_izq = color_der = None
        if izq['equilibrio'] and der['equilibrio']:
            color_izq = 'limegreen'
            color_der = 'darkgreen'
        else:
            color_izq = 'blue'
            color_der = 'red'

        ax.scatter(*izq['pos'], c=color_izq)
        ax.scatter(*der['pos'], c=color_der)

    ax.set_title('Posiciones 3D de los Mandos')
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    plt.show()

# Uso:
graficar_mandos_3d('ResultadosPrograma__10_.txt')
