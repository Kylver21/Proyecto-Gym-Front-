# 🔧 FORMATOS REQUERIDOS EN EL BACKEND PARA COMPATIBILIDAD CON FRONTEND

## 📋 Resumen de Cambios Necesarios

El frontend envía datos en formato **camelCase** según las mejores prácticas de JavaScript/TypeScript. El backend debe estar preparado para recibir estos formatos.

---

## 💰 **ENDPOINT DE PAGOS**

### **POST `/api/pagos`** - Crear pago
**Formato que envía el frontend:**
```json
{
  "registroMembresiaId": 1,
  "monto": 50.00,
  "metodoPago": "TARJETA"
}
```

**Mapeo necesario en el backend:**
- `registroMembresiaId` → `registro_membresia_id` (base de datos)
- `monto` → `monto` (sin cambios)
- `metodoPago` → `metodo_pago` (base de datos)

---

## 🛒 **ENDPOINT DE PRODUCTOS**

### **POST `/api/productos/venta`** - Procesar venta de producto (NUEVO ENDPOINT REQUERIDO)
**Formato que envía el frontend:**
```json
{
  "usuario_id": 2,
  "producto_id": 1,
  "cantidad": 2,
  "metodo_pago": "TARJETA"
}
```

**Lógica requerida en el backend:**
1. Validar que el producto existe
2. Verificar que hay stock suficiente (`producto.stock >= cantidad`)
3. Actualizar el stock: `nuevo_stock = stock_actual - cantidad`
4. Registrar la venta en tabla de ventas (si existe)
5. Retornar confirmación de venta exitosa

**Response esperada:**
```json
{
  "success": true,
  "message": "Venta procesada exitosamente",
  "venta": {
    "id": 1,
    "usuario_id": 2,
    "producto_id": 1,
    "cantidad": 2,
    "precio_unitario": 25.00,
    "precio_total": 50.00,
    "metodo_pago": "TARJETA",
    "fecha_venta": "2025-01-14T10:30:00"
  },
  "stock_restante": 8
}
```

---

## 🎯 **ENDPOINT DE REGISTRO DE MEMBRESÍAS**

### **POST `/api/registros-membresia`** - Crear registro de membresía
**Formato actual (correcto):**
```json
{
  "usuario_id": 2,
  "membresia_id": 1,
  "fecha_inicio": "2025-01-14"
}
```

---

## 🔐 **MANEJO DE AUTENTICACIÓN**

### Problema de redirección al login
**Causa:** Errores 401/403 durante el proceso de pago
**Solución requerida en el backend:**

1. **Verificar que las sesiones persisten** durante todo el flujo de compra
2. **Headers CORS correctos** para permitir cookies/sessions
3. **Validación de tokens** sin expirar durante el proceso
4. **Response consistente** para errores de autenticación

**Headers requeridos en responses:**
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: http://localhost:5173
```

---

## 📦 **ESTRUCTURA DE RESPUESTAS REQUERIDAS**

### Formato de éxito:
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* objeto creado */ }
}
```

### Formato de error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "CODIGO_ERROR"
}
```

---

## 🎯 **ENDPOINTS REQUERIDOS FALTANTES**

1. **POST `/api/productos/venta`** - Procesar venta y actualizar stock
2. **GET `/api/usuarios/current/membresias`** - Obtener membresías del usuario actual
3. **PUT `/api/productos/{id}/stock`** - Actualizar stock específico

---

## 🚨 **VALIDACIONES CRÍTICAS**

### Para productos:
- ✅ Stock suficiente antes de venta
- ✅ Producto activo y disponible
- ✅ Cantidad > 0

### Para pagos:
- ✅ Registro de membresía existe
- ✅ Monto coincide con precio de membresía
- ✅ Usuario autenticado y autorizado

### Para autenticación:
- ✅ Sesión válida durante todo el flujo
- ✅ Permisos correctos por rol de usuario
- ✅ Tokens no expiran durante compra

---

## 🔄 **FLUJO COMPLETO DE COMPRA**

1. **Cliente agrega items al carrito** → Frontend valida stock localmente
2. **Cliente procede al checkout** → Frontend verifica autenticación
3. **Procesar membresías:**
   - POST `/api/registros-membresia` → Crear registro
   - POST `/api/pagos` → Crear pago asociado
4. **Procesar productos:**
   - POST `/api/productos/venta` → Validar stock y crear venta
5. **Confirmar compra** → Frontend muestra confirmación

---

## 💡 **RECOMENDACIONES ADICIONALES**

1. **Logs detallados** en cada endpoint para debugging
2. **Transacciones de base de datos** para operaciones críticas
3. **Rollback automático** si falla algún paso del proceso
4. **Rate limiting** para prevenir compras duplicadas
5. **Validación de integridad** de datos en cada request

---

**Fecha de actualización:** 24 de Julio, 2025
**Versión del frontend:** 1.2.0
