# 📋 FORMATOS DE API QUE ESPERA EL FRONTEND DEL BACKEND

## 🎯 **BASE URL**: `http://localhost:8080/api`

---

## 🔐 **AUTENTICACIÓN**

### **POST `/auth/login`**
**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "email": "admin@gym.com",
    "rol": "ADMIN",
    "estado": true
  }
}
```

### **POST `/auth/register`**
**Request Body:**
```json
{
  "username": "nuevouser",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@email.com",
  "rol": "CLIENTE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 2,
    "username": "nuevouser",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "rol": "CLIENTE",
    "estado": true
  }
}
```

### **GET `/auth/check`**
**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "email": "admin@gym.com",
    "rol": "ADMIN",
    "estado": true
  }
}
```

### **POST `/auth/logout`**
**Response:** Status 200 OK

---

## 👥 **USUARIOS**

### **GET `/usuarios`** - Obtener todos los usuarios
**Response:**
```json
[
  {
    "id": 1,
    "username": "admin",
    "nombre": "Administrador",
    "apellido": "Sistema",
    "email": "admin@gym.com",
    "rol": "ADMIN",
    "estado": true
  },
  {
    "id": 2,
    "username": "cliente1",
    "nombre": "María",
    "apellido": "García",
    "email": "maria@email.com",
    "rol": "CLIENTE",
    "estado": true
  }
]
```

### **GET `/usuarios/{id}`** - Obtener usuario por ID
**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "nombre": "Administrador",
  "apellido": "Sistema",
  "email": "admin@gym.com",
  "rol": "ADMIN",
  "estado": true
}
```

### **POST `/usuarios`** - Crear usuario
**Request Body:**
```json
{
  "username": "nuevouser",
  "password": "password123",
  "nombre": "Carlos",
  "apellido": "López",
  "email": "carlos@email.com",
  "rol": "EMPLEADO"
}
```

**Response:**
```json
{
  "id": 3,
  "username": "nuevouser",
  "nombre": "Carlos",
  "apellido": "López",
  "email": "carlos@email.com",
  "rol": "EMPLEADO",
  "estado": true
}
```

### **PUT `/usuarios/{id}`** - Actualizar usuario
**Request Body:**
```json
{
  "username": "usuariomodificado",
  "password": "nuevapassword123",
  "nombre": "Carlos Modificado",
  "apellido": "López Updated",
  "email": "carlos.nuevo@email.com",
  "rol": "ADMIN",
  "estado": false
}
```

**Response:**
```json
{
  "id": 3,
  "username": "usuariomodificado",
  "nombre": "Carlos Modificado",
  "apellido": "López Updated",
  "email": "carlos.nuevo@email.com",
  "rol": "ADMIN",
  "estado": false
}
```

### **DELETE `/usuarios/{id}`** - Eliminar usuario
**Response:** Status 200 OK o 204 No Content

---

## 🏃‍♂️ **MEMBRESÍAS**

### **GET `/membresias`** - Obtener todas las membresías
**Response:**
```json
[
  {
    "id": 1,
    "tipo": "MENSUAL",
    "descripcion": "Membresía mensual completa",
    "precio": 50.00,
    "duracionDias": 30,
    "estado": true
  },
  {
    "id": 2,
    "tipo": "ANUAL",
    "descripcion": "Membresía anual con descuento",
    "precio": 500.00,
    "duracionDias": 365,
    "estado": true
  }
]
```

### **GET `/membresias/{id}`** - Obtener membresía por ID
**Response:**
```json
{
  "id": 1,
  "tipo": "MENSUAL",
  "descripcion": "Membresía mensual completa",
  "precio": 50.00,
  "duracionDias": 30,
  "estado": true
}
```

### **GET `/membresias/usuario/{usuarioId}`** - Obtener membresías de un usuario
**Response:**
```json
[
  {
    "id": 1,
    "tipo": "MENSUAL",
    "descripcion": "Membresía mensual completa",
    "precio": 50.00,
    "duracionDias": 30,
    "estado": true
  }
]
```

### **POST `/membresias`** - Crear membresía
**Request Body:**
```json
{
  "tipo": "TRIMESTRAL",
  "descripcion": "Membresía trimestral con beneficios",
  "precio": 140.00,
  "duracionDias": 90
}
```

**Response:**
```json
{
  "id": 3,
  "tipo": "TRIMESTRAL",
  "descripcion": "Membresía trimestral con beneficios",
  "precio": 140.00,
  "duracionDias": 90,
  "estado": true
}
```

### **PUT `/membresias/{id}`** - Actualizar membresía
**Request Body:**
```json
{
  "tipo": "TRIMESTRAL",
  "descripcion": "Membresía trimestral actualizada",
  "precio": 150.00,
  "duracionDias": 90
}
```

**Response:**
```json
{
  "id": 3,
  "tipo": "TRIMESTRAL",
  "descripcion": "Membresía trimestral actualizada",
  "precio": 150.00,
  "duracionDias": 90,
  "estado": true
}
```

### **DELETE `/membresias/{id}`** - Eliminar membresía
**Response:** Status 200 OK o 204 No Content

---

## 📝 **REGISTROS DE MEMBRESÍAS**

### **POST `/registro-membresias`** - Crear registro de membresía
**Request Body:**
```json
{
  "usuarioId": 2,
  "membresiaId": 1,
  "fechaInicio": "2025-01-14"
}
```

**Response:**
```json
{
  "id": 1,
  "usuarioId": 2,
  "membresiaId": 1,
  "fechaInicio": "2025-01-14",
  "fechaFin": "2025-02-13",
  "estado": "ACTIVA",
  "usuario": {
    "id": 2,
    "username": "cliente1",
    "nombre": "María",
    "apellido": "García",
    "email": "maria@email.com",
    "rol": "CLIENTE",
    "estado": true
  },
  "membresia": {
    "id": 1,
    "tipo": "MENSUAL",
    "descripcion": "Membresía mensual completa",
    "precio": 50.00,
    "duracionDias": 30,
    "estado": true
  }
}
```

### **GET `/registro-membresias/usuario/{usuarioId}`** - Obtener registros de un usuario
**Response:**
```json
[
  {
    "id": 1,
    "usuarioId": 2,
    "membresiaId": 1,
    "fechaInicio": "2025-01-14",
    "fechaFin": "2025-02-13",
    "estado": "ACTIVA",
    "usuario": {
      "id": 2,
      "username": "cliente1",
      "nombre": "María",
      "apellido": "García",
      "email": "maria@email.com",
      "rol": "CLIENTE",
      "estado": true
    },
    "membresia": {
      "id": 1,
      "tipo": "MENSUAL",
      "descripcion": "Membresía mensual completa",
      "precio": 50.00,
      "duracionDias": 30,
      "estado": true
    }
  }
]
```

---

## 💰 **PAGOS**

### **POST `/pagos`** - Crear pago
**Request Body:**
```json
{
  "registroMembresiaId": 1,
  "monto": 50.00,
  "metodoPago": "TARJETA"
}
```

**Response:**
```json
{
  "id": 1,
  "registroMembresiaId": 1,
  "monto": 50.00,
  "fechaPago": "2025-01-14T10:30:00",
  "metodoPago": "TARJETA",
  "estado": "COMPLETADO",
  "registroMembresia": {
    "id": 1,
    "usuarioId": 2,
    "membresiaId": 1,
    "fechaInicio": "2025-01-14",
    "fechaFin": "2025-02-13",
    "estado": "ACTIVA"
  }
}
```

### **GET `/pagos/usuario/{usuarioId}`** - Obtener pagos de un usuario
**Response:**
```json
[
  {
    "id": 1,
    "registroMembresiaId": 1,
    "monto": 50.00,
    "fechaPago": "2025-01-14T10:30:00",
    "metodoPago": "TARJETA",
    "estado": "COMPLETADO",
    "registroMembresia": {
      "id": 1,
      "usuarioId": 2,
      "membresiaId": 1,
      "fechaInicio": "2025-01-14",
      "fechaFin": "2025-02-13",
      "estado": "ACTIVA"
    }
  }
]
```

---

## 🛒 **PRODUCTOS**

### **GET `/productos`** - Obtener todos los productos
**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Proteína Whey",
    "descripcion": "Proteína de suero de alta calidad",
    "precio": 25.99,
    "stock": 50,
    "estado": true
  },
  {
    "id": 2,
    "nombre": "Shaker",
    "descripcion": "Botella mezcladora de 600ml",
    "precio": 8.50,
    "stock": 100,
    "estado": true
  }
]
```

### **GET `/productos/{id}`** - Obtener producto por ID
**Response:**
```json
{
  "id": 1,
  "nombre": "Proteína Whey",
  "descripcion": "Proteína de suero de alta calidad",
  "precio": 25.99,
  "stock": 50,
  "estado": true
}
```

### **POST `/productos`** - Crear producto
**Request Body:**
```json
{
  "nombre": "Creatina",
  "descripcion": "Creatina monohidrato 300g",
  "precio": 15.99,
  "stock": 30
}
```

**Response:**
```json
{
  "id": 3,
  "nombre": "Creatina",
  "descripcion": "Creatina monohidrato 300g",
  "precio": 15.99,
  "stock": 30,
  "estado": true
}
```

### **PUT `/productos/{id}`** - Actualizar producto
**Request Body:**
```json
{
  "nombre": "Creatina Premium",
  "descripcion": "Creatina monohidrato premium 300g",
  "precio": 18.99,
  "stock": 25
}
```

**Response:**
```json
{
  "id": 3,
  "nombre": "Creatina Premium",
  "descripcion": "Creatina monohidrato premium 300g",
  "precio": 18.99,
  "stock": 25,
  "estado": true
}
```

### **DELETE `/productos/{id}`** - Eliminar producto
**Response:** Status 200 OK o 204 No Content

---

## 🎨 **TIPOS DE DATOS IMPORTANTES**

### **Roles de Usuario:**
- `"ADMIN"` - Administrador
- `"EMPLEADO"` - Empleado  
- `"CLIENTE"` - Cliente

### **Tipos de Membresía:**
- `"MENSUAL"` - 30 días
- `"TRIMESTRAL"` - 90 días
- `"SEMESTRAL"` - 180 días
- `"ANUAL"` - 365 días

### **Estados de Registro de Membresía:**
- `"ACTIVA"` - Membresía activa
- `"VENCIDA"` - Membresía vencida
- `"CANCELADA"` - Membresía cancelada

### **Métodos de Pago:**
- `"EFECTIVO"` - Pago en efectivo
- `"TARJETA"` - Pago con tarjeta
- `"TRANSFERENCIA"` - Transferencia bancaria

### **Estados de Pago:**
- `"COMPLETADO"` - Pago completado
- `"PENDIENTE"` - Pago pendiente
- `"CANCELADO"` - Pago cancelado

---

## 🚨 **MANEJO DE ERRORES**

### **Estructura de Error Standard:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalle técnico del error (opcional)"
}
```

### **Códigos de Estado HTTP:**
- **200** - Éxito
- **201** - Creado
- **204** - Sin contenido (para DELETE)
- **400** - Solicitud incorrecta
- **401** - No autorizado
- **403** - Prohibido
- **404** - No encontrado
- **500** - Error interno del servidor

---

## 🔧 **CONFIGURACIÓN CORS**
El backend debe permitir:
- **Origin:** `http://localhost:5174`
- **Methods:** `GET, POST, PUT, DELETE, OPTIONS`
- **Headers:** `Content-Type, Authorization, Accept`
- **Credentials:** `true`

---

## 📌 **NOTAS IMPORTANTES**

1. **Fechas:** Formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
2. **Precios:** Números decimales con 2 decimales
3. **IDs:** Números enteros positivos
4. **Estado:** Boolean (true/false)
5. **Todos los endpoints requieren autenticación excepto login y register**
