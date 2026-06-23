# ICEBERG Menu Web App

Aplicación web para ICEBERG (Granizados y Bebidas). Consta de dos partes:
1. **Frontend**: Aplicación en React con Vite.
2. **Backend**: Servidor Node.js con Express que guarda los productos en `products.json`.

## Requisitos previos
Tener [Node.js](https://nodejs.org/) instalado en tu computador.

## ¿Cómo ejecutar el proyecto en tu computador local?

Para que la aplicación funcione, necesitas tener encendidos tanto el Backend como el Frontend al mismo tiempo.

### 1. Iniciar el Backend (Base de datos local)
Abre una terminal, navega a la carpeta del proyecto y ejecuta:
```bash
cd backend
npm install   # (Solo la primera vez)
node server.js
```
El servidor backend se ejecutará en `http://localhost:3001`.

### 2. Iniciar el Frontend (La vista)
Abre **otra** terminal, navega a la carpeta del proyecto y ejecuta:
```bash
cd frontend
npm install   # (Solo la primera vez)
npm run dev
```
La aplicación abrirá en `http://localhost:5173`.

## Acceso al Panel Admin
El acceso al administrador está oculto para los clientes. Para ingresar, debes escribir manualmente la siguiente dirección en tu navegador:
- **URL**: `http://localhost:5173/admin`
- **Contraseña**: `admin123`

*Para cambiar la contraseña, edita el archivo `frontend/src/pages/AdminView.jsx` y busca la línea donde se compara `password === 'admin123'`.*

## Comportamiento Especial: Sabores
En esta versión, los **Sabores** que marques como **"Agotado"** en el panel de administrador desaparecerán automáticamente de la vista del cliente para evitar confusiones. En las demás categorías (Cocteles, Cervezas, etc.), el producto seguirá visible pero con el aviso de "Agotado".

Dado que quieres actualizar los productos desde *otro computador*, no puedes simplemente abrir el archivo localmente. Debes subir ambos proyectos a internet:

1. **Subir el Backend (Render o Railway)**:
   - Sube la carpeta `backend` a un repositorio de GitHub.
   - Crea un Web Service en [Render.com](https://render.com/) o [Railway.app](https://railway.app/).
   - Obtendrás una URL como `https://iceberg-backend.onrender.com`.

2. **Actualizar la URL en el Frontend**:
   - Ve al archivo `frontend/src/config.js` y cambia `http://localhost:3001/api` por la URL de tu backend en la nube (ej: `https://iceberg-backend.onrender.com/api`).

3. **Subir el Frontend (Vercel o Netlify)**:
   - Sube la carpeta `frontend` a GitHub.
   - Conéctalo con [Vercel](https://vercel.com/) o [Netlify](https://www.netlify.com/).
   - ¡Listo! Te darán una URL pública que le puedes compartir a tus clientes y otra para que administres.

*Nota: La versión actual guarda los datos en `products.json`. En servicios en la nube gratuitos como Render, los archivos locales se reinician de vez en cuando. Para producción a largo plazo, se recomienda conectar el backend a una base de datos gratuita como MongoDB o Supabase.*
