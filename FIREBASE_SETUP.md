# Configuración de Firebase

Para usar la funcionalidad de entrenamientos con Firebase, necesitas configurar tu proyecto de Firebase.

## Pasos para configurar Firebase

1. **Crear un proyecto en Firebase Console**
   - Ve a https://console.firebase.google.com/
   - Crea un nuevo proyecto o selecciona uno existente

2. **Habilitar Firestore Database**
   - En la consola de Firebase, ve a "Firestore Database"
   - Crea una base de datos en modo de prueba (para desarrollo)
   - Selecciona una ubicación para tu base de datos

3. **Obtener las credenciales de configuración**
   - Ve a Configuración del proyecto (ícono de engranaje)
   - Baja hasta "Tus aplicaciones"
   - Haz clic en el ícono de web (`</>`)
   - Copia las credenciales de configuración

4. **Configurar las credenciales en el código**
   - Abre el archivo `src/app/core/service/firebase.service.ts`
   - Reemplaza los valores en `firebaseConfig` con tus credenciales:
   
```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

5. **Configurar reglas de seguridad de Firestore**
   - Ve a Firestore Database > Reglas
   - Usa estas reglas para desarrollo (ajusta según tus necesidades de seguridad):
   
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para planes de entrenamiento
    match /planes/{planId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Reglas para entrenamientos
    match /entrenamientos/{entrenamientoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

**Nota importante**: Estas reglas permiten que cualquier usuario autenticado lea y escriba sus propios datos. Para producción, deberías implementar reglas más estrictas.

## Estructura de datos en Firestore

### Colección: `planes`
```json
{
  "id": "string",
  "userId": "string",
  "gruposSeleccionados": ["PECHO", "ESPALDA", ...],
  "tipoSeleccion": "dias-especificos" | "cantidad-dias",
  "diasSemanaSeleccionados": [1, 3, 5],
  "cantidadDias": 4,
  "duracionMeses": 1,
  "rutinaPartida": false,
  "fechaCreacion": "2024-01-01T00:00:00Z"
}
```

### Colección: `entrenamientos`
```json
{
  "id": "userId_YYYY-MM-DD",
  "userId": "string",
  "fecha": "2024-01-01T00:00:00Z",
  "grupos": ["PECHO", "TRICEPS"],
  "ejercicios": [
    {
      "id": "ej_1234567890",
      "nombre": "Press de banca",
      "series": 4,
      "repeticiones": "10-12",
      "peso": 80,
      "descanso": 90,
      "notas": "Última serie al fallo",
      "completado": false
    }
  ],
  "completado": false,
  "notas": "Entrenamiento intenso"
}
```

## Autenticación

El servicio de Firebase utiliza el `AuthService` existente que usa Appwrite. Asegúrate de que el usuario esté autenticado antes de usar las funcionalidades de entrenamiento.

## Solución de problemas

- **Error "Usuario no autenticado"**: Asegúrate de estar logueado en la aplicación
- **Error de permisos**: Verifica las reglas de seguridad de Firestore
- **Datos no se guardan**: Revisa la consola del navegador para ver errores específicos

