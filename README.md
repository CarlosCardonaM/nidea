# NIDEA

Sitio de NIDEA, casas inteligentes en el Bajío.

HTML, CSS y JavaScript sin dependencias ni paso de compilación: se publica tal cual en cualquier hosting estático (Vercel, Netlify, GitHub Pages).

```
index.html          Página completa
css/styles.css      Estilos y sistema visual
js/main.js          Recorrido "Un día en casa", app, gráfica de energía y formulario
assets/             Logotipo y favicon
```

## Ver en local

```
npx serve .
```

## Pendientes antes de lanzar

- Correo, teléfono y dirección del showroom (en el pie y en el formulario).
- Conectar el formulario: define `window.NIDEA_FORM_ENDPOINT` con la URL que recibe los datos (JSON por POST).
