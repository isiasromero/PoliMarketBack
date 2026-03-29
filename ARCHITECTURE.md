# PoliMarket ERP - Arquitectura Hexagonal

## Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Mapeo de Requisitos Funcionales](#mapeo-de-requisitos-funcionales)
3. [Componentes por Módulo](#componentes-por-módulo)
4. [Integraciones entre Módulos](#integraciones-entre-módulos)
5. [Flujos de Negocio](#flujos-de-negocio)
6. [Endpoints API REST](#endpoints-api-rest)
7. [Validaciones de Negocio](#validaciones-de-negocio)

---

## Visión General

PoliMarket es un ERP modular basado en **arquitectura hexagonal** (Ports & Adapters) que gestiona 5 áreas críticas de negocio:

```
┌─────────────────────────────────────────────────────────────┐
│                      PoliMarket ERP                          │
├─────────────────────────────────────────────────────────────┤
│  RRHH (HR) │ Ventas (Sales) │ Inventario │ Proveedores │ Entregas │
└─────────────────────────────────────────────────────────────┘
     ↓              ↓              ↓              ↓              ↓
  Domain       Domain         Domain          Domain         Domain
  Application  Application    Application     Application    Application
  Infra        Infra          Infra           Infra          Infra
     ↓              ↓              ↓              ↓              ↓
  [ Ports & Adapters Pattern - SQLite (better-sqlite3) ]
     ↓              ↓              ↓              ↓              ↓
  [Data Access Layer - TypeORM Repositories]
     ↓              ↓              ↓              ↓              ↓
  [ Facades: AdministracionFacade | VentasFacade | LogisticaFacade ]
     ↓              ↓              ↓
  [ HTTP Adapters: REST Controllers ]
     ↓              ↓              ↓
  [ CLI Adapters: Command Line Interface ]
```

### Principios Arquitectónicos

- **Separación de Capas:** Domain (puro) → Application (orquestación) → Infrastructure (adaptadores)
- **Inversión de Dependencias:** DI tokens para inyección de repositorios
- **Patrón Result<T, E>:** Manejo de errores sin excepciones en application layer
- **Mappers:** Conversión ORM Entity ↔ Domain Entity
- **Facades:** Orquestación de use cases sin lógica de negocio

---

## Mapeo de Requisitos Funcionales

| RF | Requisito | Componente | Funcionalidades | Archivo Principal |
|:---:|-----------|-----------|-----------------|-------------------|
| **RF01** | RRHH autoriza vendedor | `AdministracionFacade` + `rrhh` | `authorizeSeller()` - Autorizar vendedor a acceder a sistemas | `/facades/administracion.facade.ts` |
| | | | `revokeAuthorization()` - Revocar autorización existente | `/modules/rrhh/application/use-cases/` |
| | | | `validateAccess()` - Validar acceso activo a un sistema | |
| | | | `getAuthorizations()` - Consultar autorizaciones de vendedor | |
| **RF02** | Vendedor registra venta | `VentasFacade` + `ventas` | `registerSale()` - Registrar nueva venta con detalles | `/facades/ventas.facade.ts` |
| | | | `getSalesBySeller()` - Consultar ventas por vendedor | `/modules/ventas/application/use-cases/` |
| | | | `getClients()` - Listar clientes disponibles | |
| **RF03** | Ventas consulta stock en Bodega | `VentasFacade` + `inventario` | `checkAvailability()` - Consultar disponibilidad de producto | `/facades/ventas.facade.ts` |
| | (Integración Ventas-Inventario) | | `verifySufficientStock()` - Verificar stock suficiente | `/modules/inventario/application/use-cases/` |
| **RF04** | Bodega crea orden de compra | `LogisticaFacade` + `proveedores` | `generatePurchaseOrder()` - Crear orden de compra a proveedor | `/facades/logistica.facade.ts` |
| | (Integración Inventario-Proveedores) | | `registerReception()` - Registrar recepción de orden | `/modules/proveedores/application/use-cases/` |
| | | | `checkLowStockProducts()` - Consultar productos bajo stock | `/modules/inventario/application/use-cases/` |
| **RF05** | Entregas actualiza stock | `LogisticaFacade` + `entregas` + `inventario` | `generateDelivery()` - Crear entrega para una venta | `/facades/logistica.facade.ts` |
| | (Integración Entregas-Inventario) | | `confirmDelivery()` - Confirmar entrega realizada | `/modules/entregas/application/use-cases/` |
| | | | `registerWarehouseExit()` - Registrar salida de bodega | `/modules/inventario/application/use-cases/` |
| | | | `registerEntry()` - Registrar entrada de stock | |
| | | | `registerExit()` - Registrar salida de stock | |

---

## Componentes por Módulo

### 1. MÓDULO RRHH (Recursos Humanos)

**Responsabilidad:** Autorizar vendedores para acceder a sistemas.

**Estructura Hexagonal:**

```
src/modules/rrhh/
├── domain/
│   ├── entities/
│   │   ├── autorizacion.entity.ts          # Autorización (puro dominio)
│   │   └── empleado-rrhh.entity.ts         # Empleado RRHH
│   └── ports/outbound/
│       └── autorizacion.repository.port.ts # IAuthorizationRepository (interfaz)
├── application/
│   └── use-cases/
│       ├── autorizar-vendedor.use-case.ts  # RF01: Autorizar vendedor
│       ├── revocar-autorizacion.use-case.ts
│       ├── consultar-autorizaciones.use-case.ts
│       └── validar-acceso.use-case.ts
├── infrastructure/
│   └── persistence/
│       ├── entities/
│       │   └── autorizacion.orm-entity.ts  # @Entity TypeORM
│       ├── mappers/
│       │   └── autorizacion.mapper.ts      # ORM ↔ Domain
│       └── repositories/
│           └── typeorm-autorizacion.repository.ts  # Implementa IAuthorizationRepository
└── rrhh.module.ts
```

**Entidades de Dominio:**
```typescript
// autorizacion.entity.ts
class Authorization extends BaseEntity {
  employeeId: number;
  sellerId: number;
  targetSystem: string;
  authorizationDate: Date;
  status: 'ACTIVE' | 'REVOKED';
}
```

**Use Cases:**
- `AuthorizeSellerUseCase` → Crear autorización (validar no existe activa)
- `RevokeAuthorizationUseCase` → Cambiar status a REVOKED
- `ValidateAccessUseCase` → Verificar status ACTIVE
- `GetAuthorizationsUseCase` → Listar historial completo

**Mapeo ORM:**
```typescript
// autorizacion.orm-entity.ts
@Entity('autorizations')
export class AutorizacionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  employeeId: number;
  @Column()
  sellerId: number;
  @Column()
  targetSystem: string;
  @Column()
  authorizationDate: Date;
  @Column()
  status: string;
}
```

---

### 2. MÓDULO VENTAS (Ventas)

**Responsabilidad:** Registrar ventas y consultar clientes.

**Estructura Hexagonal:**

```
src/modules/ventas/
├── domain/
│   ├── entities/
│   │   ├── venta.entity.ts           # Venta (puro dominio)
│   │   ├── detalle-venta.entity.ts   # Detalle de venta
│   │   ├── vendedor.entity.ts        # Vendedor
│   │   └── cliente.entity.ts         # Cliente
│   └── ports/outbound/
│       ├── venta.repository.port.ts
│       ├── vendedor.repository.port.ts
│       └── cliente.repository.port.ts
├── application/
│   └── use-cases/
│       ├── registrar-venta.use-case.ts       # RF02: Registrar venta
│       ├── consultar-ventas-por-vendedor.use-case.ts
│       └── consultar-clientes.use-case.ts
├── infrastructure/
│   └── persistence/
│       ├── entities/
│       │   ├── venta.orm-entity.ts
│       │   ├── detalle-venta.orm-entity.ts
│       │   ├── vendedor.orm-entity.ts
│       │   └── cliente.orm-entity.ts
│       ├── mappers/
│       └── repositories/
│           ├── typeorm-venta.repository.ts
│           ├── typeorm-vendedor.repository.ts
│           └── typeorm-cliente.repository.ts
└── ventas.module.ts
```

**Entidades de Dominio:**
```typescript
// venta.entity.ts
class Sale extends BaseEntity {
  sellerId: number;
  clientId: number;
  date: Date;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  details: SaleDetail[];

  calculateTotal(): number;      // Sumar detalles
  generateDeliveryData(): {...}; // Para entregas
}

class SaleDetail extends BaseEntity {
  saleId: number;
  productId: number;
  quantity: number;
  unitPrice: number;

  calculateSubtotal(): number;
}
```

**Use Cases:**
- `RegisterSaleUseCase` → Crear venta (validar vendedor/cliente, crear detalles)
- `GetSalesBySellerUseCase` → Listar ventas de un vendedor
- `GetClientsUseCase` → Listar clientes

---

### 3. MÓDULO INVENTARIO (Bodega - Stock)

**Responsabilidad:** Gestionar stock de productos en bodegas.

**Estructura Hexagonal:**

```
src/modules/inventario/
├── domain/
│   ├── entities/
│   │   ├── stock-producto.entity.ts  # Stock de un producto en bodega
│   │   ├── producto.entity.ts        # Producto
│   │   └── bodega.entity.ts          # Bodega/Warehouse
│   └── ports/outbound/
│       ├── stock-producto.repository.port.ts
│       ├── producto.repository.port.ts
│       └── bodega.repository.port.ts
├── application/
│   └── use-cases/
│       ├── consultar-disponibilidad.use-case.ts       # RF03: Consultar disponibilidad
│       ├── verificar-stock-suficiente.use-case.ts     # RF03: Verificar stock
│       ├── consultar-productos-bajo-stock.use-case.ts # RF04: Productos para reorden
│       ├── registrar-entrada.use-case.ts              # RF05: Entrada de stock
│       └── registrar-salida.use-case.ts               # RF05: Salida de stock
├── infrastructure/
│   └── persistence/
│       ├── entities/
│       │   ├── stock-producto.orm-entity.ts
│       │   ├── producto.orm-entity.ts
│       │   └── bodega.orm-entity.ts
│       ├── mappers/
│       └── repositories/
└── inventario.module.ts
```

**Entidades de Dominio:**
```typescript
// stock-producto.entity.ts
class StockProduct extends BaseEntity {
  productId: number;
  warehouseId: number;
  quantity: number;
  minimumStock: number;
  maximumStock: number;

  isLowStock(): boolean;    // quantity <= minimumStock
  canRemoveQuantity(qty: number): boolean;
}

// producto.entity.ts
class Product extends BaseEntity {
  name: string;
  sku: string;
  price: number;
}

// bodega.entity.ts
class Warehouse extends BaseEntity {
  name: string;
  location: string;
}
```

**Use Cases:**
- `CheckAvailabilityUseCase` → Listar stock de un producto en todas bodegas
- `VerifySufficientStockUseCase` → ¿Hay suficiente cantidad disponible?
- `CheckLowStockProductsUseCase` → Productos con stock <= mínimo (para RF04)
- `RegisterEntryUseCase` → Aumentar stock (cuando recibe orden de compra)
- `RegisterExitUseCase` → Disminuir stock (cuando hay entrega)

---

### 4. MÓDULO PROVEEDORES (Suppliers)

**Responsabilidad:** Gestionar órdenes de compra a proveedores.

**Estructura Hexagonal:**

```
src/modules/proveedores/
├── domain/
│   ├── entities/
│   │   ├── orden-compra.entity.ts        # Purchase Order
│   │   ├── detalle-orden-compra.entity.ts # PO Detail
│   │   └── proveedor.entity.ts           # Supplier
│   └── ports/outbound/
│       ├── orden-compra.repository.port.ts
│       └── proveedor.repository.port.ts
├── application/
│   └── use-cases/
│       ├── generar-orden-compra.use-case.ts   # RF04: Crear orden de compra
│       ├── registrar-recepcion.use-case.ts    # RF04: Registrar recepción
│       └── consultar-proveedores.use-case.ts
├── infrastructure/
│   └── persistence/
│       ├── entities/
│       │   ├── orden-compra.orm-entity.ts
│       │   ├── detalle-orden-compra.orm-entity.ts
│       │   └── proveedor.orm-entity.ts
│       ├── mappers/
│       └── repositories/
└── proveedores.module.ts
```

**Entidades de Dominio:**
```typescript
// orden-compra.entity.ts
class PurchaseOrder extends BaseEntity {
  supplierId: number;
  orderDate: Date;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  details: PurchaseOrderDetail[];

  calculateTotal(): number;
}

// detalle-orden-compra.entity.ts
class PurchaseOrderDetail extends BaseEntity {
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;

  calculateSubtotal(): number;
}

// proveedor.entity.ts
class Supplier extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
}
```

**Use Cases:**
- `GeneratePurchaseOrderUseCase` → Crear orden de compra (llamado por RF04)
- `RegisterReceptionUseCase` → Cambiar status a RECEIVED + actualizar inventario
- `GetSuppliersUseCase` → Listar proveedores

---

### 5. MÓDULO ENTREGAS (Deliveries)

**Responsabilidad:** Gestionar entregas de ventas.

**Estructura Hexagonal:**

```
src/modules/entregas/
├── domain/
│   ├── entities/
│   │   ├── entrega.entity.ts      # Delivery
│   │   └── entrega-item.entity.ts # Delivery Item
│   └── ports/outbound/
│       └── entrega.repository.port.ts
├── application/
│   └── use-cases/
│       ├── generar-entrega.use-case.ts           # RF05: Crear entrega
│       ├── confirmar-entrega.use-case.ts         # RF05: Confirmar entrega
│       ├── registrar-salida-bodega.use-case.ts   # RF05: Salida de bodega
│       └── consultar-entregas-pendientes.use-case.ts
├── infrastructure/
│   └── persistence/
│       ├── entities/
│       │   ├── entrega.orm-entity.ts
│       │   └── entrega-item.orm-entity.ts
│       ├── mappers/
│       └── repositories/
└── entregas.module.ts
```

**Entidades de Dominio:**
```typescript
// entrega.entity.ts
class Delivery extends BaseEntity {
  saleId: number;
  destinationAddress: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  items: DeliveryItem[];
  createdAt: Date;
  deliveredAt?: Date;

  calculateTotalItems(): number;
  generateShippingLabel(): {...};
}

// entrega-item.entity.ts
class DeliveryItem extends BaseEntity {
  deliveryId: number;
  productId: number;
  quantity: number;
  weightKg?: number;
}
```

**Use Cases:**
- `GenerateDeliveryUseCase` → Crear entrega desde venta
- `ConfirmDeliveryUseCase` → Cambiar status a DELIVERED
- `RegisterWarehouseExitUseCase` → Cambiar a IN_TRANSIT
- `GetPendingDeliveriesUseCase` → Listar entregas pendientes/en tránsito

---

## Integraciones entre Módulos

### 1. Integración Ventas → Inventario (RF03)

```
┌─────────────────┐
│  Ventas Facade  │
└────────┬────────┘
         │
         ├─→ registerSale()
         │   ├─→ Validar vendedor existe (VentasModule)
         │   ├─→ Validar cliente existe (VentasModule)
         │   ├─→ Crear Sale entity (VentasModule)
         │   └─→ [LLAMADA A INVENTARIO]
         │       └─→ checkAvailability(productId)
         │           └─→ Listar stock en todas bodegas
         │
         ├─→ verifySufficientStock(productId, qty)
         │   └─→ [DESDE INVENTARIO MODULE]
         │       └─→ Suma total stock de todas bodegas
```

**Flujo de Código:**
```typescript
// VentasFacade.registerSale()
async registerSale(dto: RegisterSaleInput): Promise<Result<Sale>> {
  // 1. Valida vendedor/cliente (módulo ventas)
  const seller = await this.sellerRepository.findById(dto.sellerId);
  const client = await this.clientRepository.findById(dto.clientId);

  // 2. Consulta stock disponible (módulo inventario)
  for (const detail of dto.details) {
    const availability = await this.checkAvailabilityUseCase.execute(detail.productId);
    if (availability.isError) {
      return err(`Producto ${detail.productId} no tiene stock`);
    }
  }

  // 3. Crea venta en módulo ventas
  const sale = new Sale({...});
  return this.saleRepository.save(sale);
}
```

---

### 2. Integración Inventario → Proveedores (RF04 - Automático)

```
┌──────────────────────┐
│  Logistica Facade    │
└──────────┬───────────┘
           │
           ├─→ checkLowStockProducts()
           │   └─→ [DESDE INVENTARIO]
           │       └─→ Stock <= Mínimo
           │
           └─→ generatePurchaseOrder()
               └─→ [HACIA PROVEEDORES]
                   ├─→ Seleccionar proveedor
                   ├─→ Crear orden con items
                   └─→ [OPCIONAL] Actualizar stock (reservado)
```

**Flujo de Código:**
```typescript
// LogisticaFacade - Flujo manual (operador decide)
async checkLowStockProducts(): Promise<Result<StockProduct[]>> {
  // 1. Consulta productos bajo stock
  return this.checkLowStockProductsUseCase.execute();
}

async generatePurchaseOrder(dto: GeneratePurchaseOrderInput): Promise<Result<PurchaseOrder>> {
  // 2. Operador manualmente crea orden con supplier
  return this.generatePurchaseOrderUseCase.execute(dto);
}

// Cuando llega la orden al almacén:
async registerReception(orderId: number): Promise<Result<PurchaseOrder>> {
  // 3. Marcar como RECEIVED
  // 4. [LLAMADA A INVENTARIO] actualizar stock
  return this.registerReceptionUseCase.execute({ orderId });
}
```

---

### 3. Integración Entregas → Inventario (RF05)

```
┌──────────────────────┐
│  Logistica Facade    │
└──────────┬───────────┘
           │
           ├─→ generateDelivery(saleId, address)
           │   ├─→ [DESDE ENTREGAS]
           │   │   └─→ Crear Delivery + Items
           │   └─→ [OPCIONAL] Reservar stock
           │
           ├─→ registerWarehouseExit(deliveryId)
           │   └─→ [ENTREGAS→INVENTARIO]
           │       └─→ registerExit(productId, quantity) por cada item
           │
           └─→ confirmDelivery(deliveryId)
               └─→ [ENTREGAS]
                   └─→ Cambiar status a DELIVERED
```

**Flujo de Código:**
```typescript
// GenerateDeliveryUseCase
async execute(input: GenerateDeliveryInput): Promise<Result<Delivery>> {
  // 1. Crear Delivery desde Sale
  const sale = await this.saleRepository.findById(input.saleId);
  const delivery = new Delivery({
    saleId: input.saleId,
    destinationAddress: input.destinationAddress,
    status: 'PENDING',
  });

  // 2. Copiar items de la venta a la entrega
  for (const saleDetail of sale.details) {
    delivery.addItem(saleDetail.productId, saleDetail.quantity);
  }

  return this.deliveryRepository.save(delivery);
}

// RegisterWarehouseExitUseCase
async execute(deliveryId: number): Promise<Result<Delivery>> {
  const delivery = await this.deliveryRepository.findById(deliveryId);

  // Cambiar status a IN_TRANSIT
  delivery.status = 'IN_TRANSIT';

  // LLAMADA A INVENTARIO: disminuir stock por cada item
  for (const item of delivery.items) {
    await this.registerExitUseCase.execute(
      item.productId,
      delivery.warehouseId, // supuesto: bodega del envío
      item.quantity
    );
  }

  return this.deliveryRepository.update(delivery);
}
```

---

## Flujos de Negocio

### Flujo Completo: De Venta a Entrega

```
ACTOR: Gerente de Ventas / Bodeguero / Operador Logística

┌──────────────────────────────────────────────────────────────────┐
│ 1. RRHH Autoriza Vendedor (RF01)                                 │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/admin/authorizations                           │
│ Input: { sellerId: 1, employeeId: 5, system: "VENTAS" }         │
│ Output: Authorization { id: 100, status: "ACTIVE" }             │
│ Componente: AdministracionFacade.authorizeSeller()              │
│ Storage: BD → autorizaciones tabla                              │
│ Validaciones:                                                     │
│   ✓ No existe autorización activa previa                        │
│   ✓ El vendedor existe                                          │
│   ✓ El empleado RRHH existe                                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. Vendedor Registra Venta (RF02)                                │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/sales                                          │
│ Input: {                                                          │
│   sellerId: 1,                                                    │
│   clientId: 10,                                                   │
│   details: [                                                      │
│     { productId: 101, quantity: 5, unitPrice: 100 },            │
│     { productId: 102, quantity: 3, unitPrice: 150 }             │
│   ]                                                               │
│ }                                                                 │
│ Output: Sale { id: 501, status: "CONFIRMED", total: 950 }       │
│ Componente: VentasFacade.registerSale()                         │
│ Storage: BD → ventas + venta_detalles tablas                    │
│ Validaciones:                                                     │
│   ✓ Vendedor existe y está activo                               │
│   ✓ Cliente existe                                               │
│   ✓ Al menos 1 detalle en la venta                              │
│   ✓ [CONSULTA RF03] Stock disponible para cada producto         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. Consultar Disponibilidad (RF03 - Integración)                 │
├──────────────────────────────────────────────────────────────────┤
│ [LLAMADA INTERNA] Durante registerSale()                         │
│ Acción: GET /api/sales/availability/:productId (O interna)       │
│ Input: productId = 101                                            │
│ Output: [                                                         │
│   { productId: 101, warehouseId: 1, quantity: 20, minStock: 5 } │
│ ]                                                                 │
│ Componente: VentasFacade.checkAvailability()                    │
│ Storage: Lectura de stock_productos tabla                        │
│ Validaciones:                                                     │
│   ✓ Producto tiene registros de stock                            │
│   ✓ Total de stock >= cantidad solicitada                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. [OPCIONAL] Verificar Stock Bajo (RF04 - Trigger)              │
├──────────────────────────────────────────────────────────────────┤
│ Sistema automático: Cada 1 hora / o manual check                │
│ Acción: GET /api/inventory/low-stock                             │
│ Output: [                                                         │
│   { productId: 101, currentStock: 3, minimumStock: 5 },         │
│   { productId: 103, currentStock: 2, minimumStock: 10 }         │
│ ]                                                                 │
│ Componente: LogisticaFacade.checkLowStockProducts()             │
│ Storage: Lectura de stock_productos tabla                        │
│ Trigger: Si hay bajo stock → Operador crea orden de compra      │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. Crear Orden de Compra (RF04)                                  │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/suppliers/purchase-orders                      │
│ Input: {                                                          │
│   supplierId: 20,                                                 │
│   details: [                                                      │
│     { productId: 101, quantity: 50, unitPrice: 80 },            │
│     { productId: 103, quantity: 30, unitPrice: 120 }            │
│   ]                                                               │
│ }                                                                 │
│ Output: PurchaseOrder { id: 301, status: "PENDING", total: 8600 }
│ Componente: LogisticaFacade.generatePurchaseOrder()             │
│ Storage: BD → ordenes_compra + detalle_ordenes_compra tablas   │
│ Validaciones:                                                     │
│   ✓ Proveedor existe                                             │
│   ✓ Al menos 1 detalle en la orden                              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
│ [OPERADOR ESPERA RECEPCIÓN DE MERCANCÍA]                         │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. Registrar Recepción (RF04)                                    │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/suppliers/purchase-orders/{orderId}/reception  │
│ Input: { orderId: 301 }                                          │
│ Output: PurchaseOrder { id: 301, status: "RECEIVED" }           │
│ Componente: LogisticaFacade.registerReception()                 │
│ Storage: Actualizar ordenes_compra.status → RECEIVED            │
│          Actualizar stock_productos + cantidad                  │
│ Validaciones:                                                     │
│   ✓ Orden existe y está en PENDING                              │
│   ✓ [LLAMADA A INVENTARIO] registerEntry() para cada item       │
│   ✓ Stock actualizado correctamente                             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
│ [VOLVEMOS A LA VENTA CONFIRMADA - RF02]                          │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. Crear Entrega (RF05 - Integración)                            │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/deliveries                                     │
│ Input: {                                                          │
│   saleId: 501,                                                    │
│   destinationAddress: "Calle 123, Apt 5B"                        │
│ }                                                                 │
│ Output: Delivery { id: 601, status: "PENDING", itemCount: 2 }   │
│ Componente: LogisticaFacade.generateDelivery()                  │
│ Storage: BD → entregas + entrega_items tablas                    │
│ Validaciones:                                                     │
│   ✓ Venta existe y está CONFIRMED                               │
│   ✓ No existe entrega previa para esa venta                     │
│   ✓ Se copia detalles de la venta a la entrega                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. Registrar Salida de Bodega (RF05 - Integración)               │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/deliveries/{deliveryId}/warehouse-exit        │
│ Input: { deliveryId: 601 }                                       │
│ Output: Delivery { id: 601, status: "IN_TRANSIT" }              │
│ Componente: LogisticaFacade.registerWarehouseExit()             │
│ Storage: Actualizar entregas.status → IN_TRANSIT                │
│          [LLAMADA A INVENTARIO]                                 │
│          registerExit() para cada item de la entrega            │
│ Validaciones:                                                     │
│   ✓ Entrega existe y está en PENDING                            │
│   ✓ [INVENTARIO] Stock disponible para cada item                │
│   ✓ Stock se disminuye correctamente                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
│ [PAQUETE EN TRÁNSITO - SIMULACIÓN DE LOGÍSTICA]                  │
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 9. Confirmar Entrega (RF05)                                      │
├──────────────────────────────────────────────────────────────────┤
│ Acción: POST /api/deliveries/{deliveryId}/confirm               │
│ Input: { deliveryId: 601 }                                       │
│ Output: Delivery { id: 601, status: "DELIVERED", deliveredAt }  │
│ Componente: LogisticaFacade.confirmDelivery()                   │
│ Storage: BD → entregas.status = DELIVERED, deliveredAt timestamp │
│ Validaciones:                                                     │
│   ✓ Entrega existe y está en IN_TRANSIT                         │
│   ✓ Se registra timestamp de entrega                            │
│   ✓ [VENTAS] Cambiar venta a status DELIVERED (opcional)        │
└──────────────────────────────────────────────────────────────────┘

FIN DEL FLUJO EXITOSO
```

---

## Endpoints API REST

### 1. Administración (RRHH)

| Método | Endpoint | Responsable | Input | Output | RF |
|--------|----------|-------------|-------|--------|-----|
| POST | `/api/admin/authorizations` | `AdministracionFacade.authorizeSeller()` | `{ sellerId, employeeId, system }` | `Authorization` | RF01 |
| DELETE | `/api/admin/authorizations/:id` | `AdministracionFacade.revokeAuthorization()` | `:id` (path) | `void` | RF01 |
| GET | `/api/admin/authorizations/seller/:sellerId` | `AdministracionFacade.getAuthorizations()` | `:sellerId` (path) | `Authorization[]` | RF01 |
| GET | `/api/admin/access/validate` | `AdministracionFacade.validateAccess()` | `?sellerId=&system=` (query) | `boolean` | RF01 |

### 2. Ventas

| Método | Endpoint | Responsable | Input | Output | RF |
|--------|----------|-------------|-------|--------|-----|
| POST | `/api/sales` | `VentasFacade.registerSale()` | `{ sellerId, clientId, details[] }` | `Sale` | RF02 |
| GET | `/api/sales/seller/:sellerId` | `VentasFacade.getSalesBySeller()` | `:sellerId` (path) | `Sale[]` | RF02 |
| GET | `/api/sales/clients` | `VentasFacade.getClients()` | - | `Client[]` | RF02 |
| GET | `/api/sales/availability/:productId` | `VentasFacade.checkAvailability()` | `:productId` (path) | `StockProduct[]` | RF03 |
| GET | `/api/sales/stock/verify` | `VentasFacade.verifySufficientStock()` | `?productId=&quantity=` (query) | `boolean` | RF03 |

### 3. Inventario

| Método | Endpoint | Responsable | Input | Output | RF |
|--------|----------|-------------|-------|--------|-----|
| GET | `/api/inventory/low-stock` | `LogisticaFacade.checkLowStockProducts()` | - | `StockProduct[]` | RF04 |
| POST | `/api/inventory/entry` | `LogisticaFacade.registerEntry()` | `{ productId, warehouseId, quantity }` | `StockProduct` | RF05 |
| POST | `/api/inventory/exit` | `LogisticaFacade.registerExit()` | `{ productId, warehouseId, quantity }` | `StockProduct` | RF05 |

### 4. Proveedores

| Método | Endpoint | Responsable | Input | Output | RF |
|--------|----------|-------------|-------|--------|-----|
| POST | `/api/suppliers/purchase-orders` | `LogisticaFacade.generatePurchaseOrder()` | `{ supplierId, details[] }` | `PurchaseOrder` | RF04 |
| POST | `/api/suppliers/purchase-orders/:orderId/reception` | `LogisticaFacade.registerReception()` | `:orderId` (path) | `PurchaseOrder` | RF04 |
| GET | `/api/suppliers` | `LogisticaFacade.getSuppliers()` | - | `Supplier[]` | RF04 |

### 5. Entregas

| Método | Endpoint | Responsable | Input | Output | RF |
|--------|----------|-------------|-------|--------|-----|
| POST | `/api/deliveries` | `LogisticaFacade.generateDelivery()` | `{ saleId, destinationAddress }` | `Delivery` | RF05 |
| POST | `/api/deliveries/:deliveryId/warehouse-exit` | `LogisticaFacade.registerWarehouseExit()` | `:deliveryId` (path) | `Delivery` | RF05 |
| POST | `/api/deliveries/:deliveryId/confirm` | `LogisticaFacade.confirmDelivery()` | `:deliveryId` (path) | `Delivery` | RF05 |
| GET | `/api/deliveries/pending` | `LogisticaFacade.getPendingDeliveries()` | - | `Delivery[]` | RF05 |

---

## Validaciones de Negocio

### Validaciones Implementadas ✅

| RF | Entidad | Validación | Ubicación | Tipo |
|----|---------|-----------|-----------|------|
| RF01 | Authorization | No existe autorización activa previa (sellerId + system) | `AuthorizeSellerUseCase.execute()` | Warning |
| RF01 | Authorization | Status debe ser 'ACTIVE' o 'REVOKED' | `Authorization` entity | Domain |
| RF02 | Sale | Vendedor debe existir y estar activo | `RegisterSaleUseCase.execute()` | Error |
| RF02 | Sale | Cliente debe existir | `RegisterSaleUseCase.execute()` | Error |
| RF02 | Sale | Al menos 1 detalle en la venta | `RegisterSaleUseCase.execute()` | Error |
| RF02 | SaleDetail | Cantidad > 0 | `Sale.addDetail()` | Domain (a implementar) |
| RF02 | SaleDetail | unitPrice >= 0 | `Sale.addDetail()` | Domain (a implementar) |
| RF03 | StockProduct | Producto tiene registros de stock | `CheckAvailabilityUseCase.execute()` | Error |
| RF03 | StockProduct | Total stock >= cantidad solicitada | `VerifySufficientStockUseCase.execute()` | Calculated |
| RF04 | PurchaseOrder | Proveedor debe existir | `GeneratePurchaseOrderUseCase.execute()` | Error |
| RF04 | PurchaseOrder | Al menos 1 detalle en la orden | `GeneratePurchaseOrderUseCase.execute()` | Error (a implementar) |
| RF04 | PurchaseOrder | Status debe ser 'PENDING', 'RECEIVED', 'CANCELLED' | `PurchaseOrder` entity | Domain |
| RF04 | Inventory | Stock se actualiza correctamente en registerReception | `RegisterReceptionUseCase.execute()` | Transaction |
| RF05 | Delivery | Venta debe existir y estar CONFIRMED | `GenerateDeliveryUseCase.execute()` | Error (a implementar) |
| RF05 | Delivery | No existe entrega previa para esa venta | `GenerateDeliveryUseCase.execute()` | Warning (a implementar) |
| RF05 | Delivery | Status debe ser 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED' | `Delivery` entity | Domain |
| RF05 | Delivery | Stock disponible para cada item en warehouse-exit | `RegisterWarehouseExitUseCase.execute()` | Error |
| RF05 | StockProduct | cantidad > 0 antes de registrar salida | `RegisterExitUseCase.execute()` | Error |

### Validaciones a Implementar ⚠️

| RF | Entidad | Validación | Impacto | Prioridad |
|----|---------|-----------|--------|-----------|
| RF02 | SaleDetail | quantity > 0 y unitPrice >= 0 | Sin validaciones actuales | Media |
| RF02 | Sale | Stock se disminuye en registerSale() (opcional) | Actualmente no se disminuye | Baja |
| RF04 | PurchaseOrder | Mínimo 1 detalle en la orden | No validado en UC | Media |
| RF05 | Delivery | Validar venta en estado CONFIRMED | Podría crear entregas inválidas | Alta |
| RF05 | Delivery | Evitar entregas duplicadas por venta | No hay constraint único | Media |
| RF05 | Delivery | Transaccionalidad: Si falla registerExit, revertir entrega | Sin transacción actual | Alta |

### Casos de Error Críticos

```typescript
// ❌ Escenario 1: Intentar crear venta sin stock
POST /api/sales
{ sellerId: 1, clientId: 10, details: [{ productId: 999, quantity: 100, unitPrice: 50 }] }
// Respuesta:
// 400 Bad Request
// { error: "No stock records found for product with ID 999" }

// ❌ Escenario 2: Intentar autorizar vendedor dos veces
POST /api/admin/authorizations
{ sellerId: 5, employeeId: 1, system: "VENTAS" }
// 201 Created { id: 100, status: "ACTIVE" }

POST /api/admin/authorizations
{ sellerId: 5, employeeId: 1, system: "VENTAS" }
// 400 Bad Request
// { error: "Seller 5 already has an active authorization for system \"VENTAS\"" }

// ❌ Escenario 3: Salida de bodega sin stock
POST /api/deliveries/601/warehouse-exit
// La entrega tiene 5 unidades del producto 101
// Pero stock_productos solo tiene 3 unidades

// Respuesta:
// 400 Bad Request
// { error: "Insufficient stock for product 101: available 3, required 5" }
```

---

## Resumen de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAPAS HEXAGONALES                           │
├─────────────────────────────────────────────────────────────────┤
│ ADAPTERS (HTTP Controllers + CLI Commands)                       │
│   └─→ Reciben requests, delegan a facades                        │
├─────────────────────────────────────────────────────────────────┤
│ FACADES (AdministracionFacade, VentasFacade, LogisticaFacade)   │
│   └─→ Orquestan use cases (sin lógica de negocio)               │
├─────────────────────────────────────────────────────────────────┤
│ USE CASES (Application Layer)                                    │
│   ├─→ Implementan RF (requisitos funcionales)                   │
│   ├─→ Orquestan domain entities                                 │
│   └─→ Retornan Result<T, Error> (no excepciones)                │
├─────────────────────────────────────────────────────────────────┤
│ DOMAIN (Pure Business Logic)                                     │
│   ├─→ Entities (Sale, Authorization, Delivery, etc.)            │
│   └─→ Ports (interfaces de repositorios)                        │
│       └─→ Inbound ports (en construcción)                       │
│       └─→ Outbound ports (IAuthorizationRepository, etc.)       │
├─────────────────────────────────────────────────────────────────┤
│ INFRASTRUCTURE (Persistence)                                     │
│   ├─→ ORM Entities (TypeORM)                                    │
│   ├─→ Mappers (Domain ↔ ORM)                                    │
│   └─→ Repositories (Implementan Ports)                          │
├─────────────────────────────────────────────────────────────────┤
│ DATABASE (SQLite via better-sqlite3)                            │
│   └─→ Tablas: autorizations, ventas, venta_detalles,           │
│       clientes, productos, stock_productos, ordenes_compra,    │
│       entregas, etc.                                             │
└─────────────────────────────────────────────────────────────────┘

DEPENDENCIAS:
- Adapters → Facades (inyección de dependencias)
- Facades → Use Cases (inyección de dependencias)
- Use Cases → Domain + Repositories (puertos)
- Repositories → ORM Entities (mapeo)
```

---

## Cómo Ejecutar el Proyecto

```bash
# Instalación
npm install

# Build
npm run build

# Ejecución
npm run start

# Base de datos
# Se crea automáticamente: ./data/polimarket.db
# Se pre-seed con datos demo (3 productos, 2 proveedores, 3 clientes, etc.)

# Testing
npm test
npm run test:cov
```

---

## Referencias

- **Arquitectura Hexagonal:** https://alistair.cockburn.us/hexagonal-architecture/
- **NestJS:** https://docs.nestjs.com/
- **TypeORM:** https://typeorm.io/
- **Result Pattern:** https://github.com/colinhacks/zod (Pattern similar)

