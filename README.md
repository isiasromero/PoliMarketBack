# PoliMarket - Backend API

Sistema ERP para gestión comercial con 5 módulos funcionales: RRHH, Ventas, Bodega/Inventario, Proveedores y Entregas.

## Instalación

```bash
cd /Users/isias/Desktop/Maestria/poliMarkert
npm install
```

## Ejecución

### Modo desarrollo (API + CLI simultáneamente)
```bash
npm start
```

Esto iniciará:
- API REST en: `http://localhost:3000/api`
- CLI interactivo en la terminal
- Swagger docs en: `http://localhost:3000/api/docs`

### Base de datos
- Tipo: SQLite
- Ubicación: `./data/polimarket.db`
- Se auto-crea al iniciar si no existe

## Arquitectura

Hexagonal Architecture con 3 capas:
- **Domain**: Entidades y puertos (contratos)
- **Application**: Casos de uso (business logic)
- **Infrastructure**: Implementaciones (TypeORM, API HTTP, CLI)

## Módulos

| Módulo | Descripción | RF |
|--------|-------------|-----|
| **RRHH** | Autorización de vendedores | RF01 |
| **Ventas** | Registro de ventas y clientes | RF02 |
| **Bodega** | Gestión de inventario | RF03 |
| **Proveedores** | Órdenes de compra automáticas | RF04 |
| **Entregas** | Despacho y decremento de stock | RF05 |

## Endpoints Principales

### Inventario (Bodega)
```bash
# Obtener todos los productos
GET /inventory/products

# Crear producto
POST /inventory/products

# Actualizar producto
PUT /inventory/products/:id

# Eliminar producto
DELETE /inventory/products/:id

# Obtener stock por bodega
GET /inventory/stock

# Registrar entrada de stock
POST /inventory/entry

# Registrar salida de stock
POST /inventory/exit
```

### Ventas
```bash
# Obtener clientes
GET /sales/clients

# Crear venta
POST /sales

# Consultar disponibilidad
GET /sales/availability/:productId
```

### Proveedores
```bash
# Obtener proveedores
GET /suppliers

# Crear orden de compra
POST /suppliers/purchase-orders

# Obtener órdenes
GET /suppliers/purchase-orders

# Recibir orden
PATCH /suppliers/purchase-orders/:id/receive
```

### Entregas
```bash
# Obtener entregas pendientes
GET /deliveries/pending

# Crear entrega
POST /deliveries

# Despachar entrega
PATCH /deliveries/:id/dispatch

# Confirmar entrega (decrementa stock automáticamente)
PATCH /deliveries/:id/confirm
```

### Admin/RRHH
```bash
# Obtener vendedores
GET /admin/sellers

# Obtener autorizaciones
GET /admin/authorizations/seller/:sellerId

# Crear autorización
POST /admin/authorizations

# Revocar autorización
DELETE /admin/authorizations/:id
```

## Validaciones Implementadas

1. **RF01 - Autorización de vendedores**: Solo vendedores autorizados pueden crear ventas
2. **RF02 - Registro de ventas**: Gestión completa de ventas y clientes
3. **RF03 - Disponibilidad**: Consulta de stock por producto y bodega
4. **RF04 - Órdenes automáticas**: Auto-genera órdenes cuando stock cae bajo mínimo
5. **RF05 - Decremento automático**: Stock se decrementa al confirmar entregas (transaccional)

## Estructura de carpetas

```
src/
├── modules/
│   ├── rrhh/               # RF01: Autorización
│   ├── ventas/             # RF02: Ventas
│   ├── inventario/         # RF03: Bodega/Stock
│   ├── proveedores/        # RF04: Órdenes compra
│   └── entregas/           # RF05: Entregas
├── http/
│   ├── controllers/
│   └── dto/
├── facades/                # LogisticaFacade orquesta casos de uso
├── shared/
└── cli/                    # Interfaz interactiva
```

## Testing con curl

```bash
# Crear producto
curl -X POST http://localhost:3000/api/inventory/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "unitPrice": 1200,
    "category": "Electronics",
    "warehouseId": 1,
    "initialQuantity": 50,
    "minimumStock": 10
  }'

# Obtener productos
curl http://localhost:3000/api/inventory/products

# Actualizar producto
curl -X PUT http://localhost:3000/api/inventory/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop XPS", "unitPrice": 1500}'

# Eliminar producto
curl -X DELETE http://localhost:3000/api/inventory/products/1

# Ver stock por bodega
curl http://localhost:3000/api/inventory/stock
```

## Documentación

Accede a Swagger en: `http://localhost:3000/api/docs`

## Stack Tecnológico

- **Framework**: NestJS
- **Database**: SQLite + TypeORM
- **Arquitectura**: Hexagonal (Domain-Driven Design)
- **CLI**: Figlet + Chalk
- **API Docs**: Swagger/OpenAPI

## Proyecto Académico

Maestría de Arquitectura de Software
Implementación de 5 Requisitos Funcionales (RF01-RF05)
# PoliMarketBack
# PoliMarketBack
