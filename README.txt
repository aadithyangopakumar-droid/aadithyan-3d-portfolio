3D WEBSITE STARTER

1. Put index.html in a folder.
2. Recommended: run it through a small local web server.

Windows / macOS:
   python -m http.server 8000

Then open:
   http://localhost:8000

The page uses Three.js from a CDN, so an internet connection is needed.

CUSTOMIZE:
- Change the website text directly in index.html.
- Change --accent and --accent2 near the top for theme colors.
- The 3D shape is created with TorusKnotGeometry.
- For Blender/Maya models, export as .glb/.gltf and use Three.js GLTFLoader.

Three.js version used: 0.185.1
