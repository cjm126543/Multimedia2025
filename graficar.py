import json
import plotly.graph_objs as go

def graficar_mandos_3d_interactivo(ruta_archivo):
    with open(ruta_archivo, 'r', encoding='utf-8') as f:
        lineas = f.readlines()[3:]  # Eliminar las 3 primeras líneas
        datos_str = ''.join(lineas)

        # Asegurar formato JSON
        datos_str = datos_str.replace("True", "true").replace("False", "false")
        datos = json.loads(datos_str)

    x_vals, y_vals, z_vals, colores = [], [], [], []

    for frame in datos.values():
        mandos = frame['mandos']
        izq = next(m for m in mandos if m['mando'] == 'I')
        der = next(m for m in mandos if m['mando'] == 'D')

        if izq['equilibrio'] and der['equilibrio']:
            color_izq = 'darkgreen'
            color_der = 'limegreen'
        else:
            color_izq = 'blue'
            color_der = 'red'

        # Mando izquierdo
        x_vals.append(izq['pos'][0])
        y_vals.append(izq['pos'][1])
        z_vals.append(izq['pos'][2])
        colores.append(color_izq)

        # Mando derecho
        x_vals.append(der['pos'][0])
        y_vals.append(der['pos'][1])
        z_vals.append(der['pos'][2])
        colores.append(color_der)

    fig = go.Figure(data=[
        go.Scatter3d(
            x=x_vals, y=y_vals, z=z_vals,
            mode='markers',
            marker=dict(size=4, color=colores),
            text=["Izquierdo" if i % 2 == 0 else "Derecho" for i in range(len(x_vals))],
            hoverinfo='text'
        )
    ])

    fig.update_layout(
        title='Posiciones 3D de los Mandos (Interactivo)',
        scene=dict(
            xaxis_title='X',
            yaxis_title='Y',
            zaxis_title='Z'
        ),
        margin=dict(l=0, r=0, b=0, t=40)
    )

    fig.show()

# Uso:
graficar_mandos_3d_interactivo('ResultadosPrograma__10_.txt')
