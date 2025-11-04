# Confiaventa - Plantilla para WebIntoApp

Esta carpeta contiene una plantilla web simple lista para importar en **WebIntoApp**.  
**Importante**: debes reemplazar `js/firebase-config.js` con la configuración real de tu proyecto Firebase.

## Archivos clave
- `index.html` - interfaz principal (login, publicar, lista, admin).
- `css/style.css` - estilos básicos.
- `js/firebase-config.js` - **REEMPLAZAR** con tu firebaseConfig real.
- `js/app.js` - lógica de autenticación y Firestore.

## Firebase
1. Entra a la consola de Firebase > tu proyecto `confiaventa-a19b9`.
2. Ve a *Project Settings* → *Firebase SDK* y copia la configuración (apiKey, authDomain, projectId, etc.).
3. Pega esos valores en `js/firebase-config.js` reemplazando los valores que dicen `REPLACE_...`.

## Admin
Se creó una comprobación simple para mostrar el panel admin si el email es `admin@confiaventa.mx`.
Crea manualmente ese usuario en Firebase Auth (contraseña sugerida `Confiaventa123`) o usa Firebase Console para crearlo.

## Seguridad y reglas
- Ajusta tus reglas de Firestore para que solo admins puedan aprobar:
  - Ejemplo rápido: permitir escribir `status: "approved"` solo para uid del admin o mediante Cloud Functions.
- Para producción, valida CURP y documentos en el backend o Cloud Functions.
