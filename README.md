# Carga la barra — Qué es CrossFit

Landing informativa sobre CrossFit para la tarea de Informática. HTML, CSS y JavaScript sin dependencias, lista para GitHub Pages.

## Ver en local

Abre `index.html` con un servidor local (las fuentes no cargan con `file://`):

```bash
python -m http.server 8000
# luego abre http://localhost:8000
```

O usa la extensión *Live Server* de VS Code.

## Desplegar en GitHub Pages

```bash
git init
git add .
git commit -m "Landing de CrossFit"
git branch -M main
git remote add origin <URL-del-repo>
git push -u origin main
```

En GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**. En uno o dos minutos queda en `https://<usuario>.github.io/<repo>/`.

## Estructura

- `index.html` — contenido
- `styles.css` — sistema visual basado en el código de color de los discos olímpicos
- `script.js` — selector de nivel que carga la barra y reescala el WOD
- `fonts/` — Big Shoulders Display y Archivo (licencia SIL OFL), servidas localmente
- `PRODUCT.md` — contexto del proyecto usado con Impeccable

CrossFit® es marca registrada de CrossFit, LLC. Este sitio es independiente y educativo.
