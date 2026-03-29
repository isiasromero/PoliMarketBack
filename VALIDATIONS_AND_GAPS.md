# PoliMarket ERP - Validaciones Faltantes e Implementaciones Sugeridas

## 1. Validaciones de Negocio Faltantes

### 1.1 Módulo VENTAS (RF02)

#### ❌ Validación No Implementada: SaleDetail - Cantidad y Precio

**Ubicación:** `src/modules/ventas/domain/entities/detalle-venta.entity.ts`

**Problema:**
```typescript
// Actualmente:
sale.addDetail(productId, quantity, unitPrice);
// No valida:
// - quantity > 0
// - unitPrice >= 0

// Escenario de error:
sale.addDetail(101, -5, 100);      // ❌ Cantidad negativa
sale.addDetail(102, 10, -50);      // ❌ Precio negativo
sale.addDetail(103, 0, 100);       // ❌ Cantidad zero
```

**Implementación Sugerida:**
```typescript
// detalle-venta.entity.ts
export class SaleDetail extends BaseEntity {
  productId!: number;
  quantity!: number;
  unitPrice!: number;

  constructor(props: Partial<SaleDetail>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
    this.validateDomain();
  }

  private validateDomain(): void {
    if (!this.quantity || this.quantity <= 0) {
      throw new DomainError('SaleDetail quantity must be greater than 0');
    }
    if (this.unitPrice < 0) {
      throw new DomainError('SaleDetail unitPrice cannot be negative');
    }
  }

  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }
}

// venta.entity.ts - Actualizar método addDetail
export class Sale extends BaseEntity {
  addDetail(productId: number, quantity: number, unitPrice: number): void {
    // Validar en dominio antes de crear
    if (quantity <= 0) {
      throw new DomainError('Quantity must be greater than 0');
    }
    if (unitPrice < 0) {
      throw new DomainError('Unit price cannot be negative');
    }
    if (!productId) {
      throw new DomainError('Product ID is required');
    }

    const detail = new SaleDetail({ productId, quantity, unitPrice });
    this.details.push(detail);
  }
}
```

**Test Unitario Sugerido:**
```typescript
describe('SaleDetail Entity', () => {
  it('should throw error when quantity is zero', () => {
    expect(() => {
      new SaleDetail({ productId: 1, quantity: 0, unitPrice: 100 });
    }).toThrow('SaleDetail quantity must be greater than 0');
  });

  it('should throw error when quantity is negative', () => {
    expect(() => {
      new SaleDetail({ productId: 1, quantity: -5, unitPrice: 100 });
    }).toThrow('SaleDetail quantity must be greater than 0');
  });

  it('should throw error when unitPrice is negative', () => {
    expect(() => {
      new SaleDetail({ productId: 1, quantity: 5, unitPrice: -50 });
    }).toThrow('SaleDetail unitPrice cannot be negative');
  });

  it('should calculate subtotal correctly', () => {
    const detail = new SaleDetail({ productId: 1, quantity: 5, unitPrice: 100 });
    expect(detail.calculateSubtotal()).toBe(500);
  });
});
```

---

#### ⚠️ Validación No Implementada: Sale - Mínimo 1 Detalle Validado en Domain

**Ubicación:** `src/modules/ventas/domain/entities/venta.entity.ts`

**Problema:**
```typescript
// Actualmente valida en UC pero no en dominio:
// RegisterSaleUseCase.execute(input):
//   if (!input.details || input.details.length === 0) {
//     return err('A sale must have at least one detail line item');
//   }

// Mejor: Validar en dominio
```

**Implementación Sugerida:**
```typescript
export class Sale extends BaseEntity {
  constructor(props?: Partial<Sale>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
    if (!this.details) {
      this.details = [];
    }
    if (!this.date) {
      this.date = new Date();
    }
    if (!this.status) {
      this.status = 'PENDING';
    }
  }

  // Agregar método que valide completitud:
  validateCompletion(): Result<void> {
    if (!this.details || this.details.length === 0) {
      return err('Sale must have at least one detail line item');
    }
    if (!this.sellerId) {
      return err('Sale must have a seller');
    }
    if (!this.clientId) {
      return err('Sale must have a client');
    }
    return ok(void 0);
  }

  // En UC:
  async execute(input: RegisterSaleInput): Promise<Result<Sale>> {
    const sale = new Sale({ ...props });
    for (const detail of input.details) {
      sale.addDetail(detail.productId, detail.quantity, detail.unitPrice);
    }

    // Validar dominio
    const validationResult = sale.validateCompletion();
    if (validationResult.isError) {
      return validationResult;
    }

    const saved = await this.saleRepository.save(sale);
    return ok(saved);
  }
}
```

---

### 1.2 Módulo INVENTARIO (RF03, RF04, RF05)

#### ⚠️ Validación No Implementada: StockProduct - Límites Máximos/Mínimos

**Ubicación:** `src/modules/inventario/domain/entities/stock-producto.entity.ts`

**Problema:**
```typescript
// Actualmente:
export class StockProduct extends BaseEntity {
  quantity!: number;
  minimumStock!: number;
  maximumStock!: number;

  // No valida:
  // - quantity <= maximumStock
  // - quantity >= minimumStock (después de salida)
  // - minimumStock < maximumStock
}
```

**Implementación Sugerida:**
```typescript
export class StockProduct extends BaseEntity {
  productId!: number;
  warehouseId!: number;
  quantity!: number;
  minimumStock!: number;
  maximumStock!: number;

  constructor(props: Partial<StockProduct>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
    this.validateDomain();
  }

  private validateDomain(): void {
    if (this.minimumStock < 0 || this.maximumStock < 0) {
      throw new DomainError('Stock limits cannot be negative');
    }
    if (this.minimumStock >= this.maximumStock) {
      throw new DomainError('Minimum stock must be less than maximum stock');
    }
    if (this.quantity < 0) {
      throw new DomainError('Current quantity cannot be negative');
    }
  }

  isLowStock(): boolean {
    return this.quantity <= this.minimumStock;
  }

  isOverStock(): boolean {
    return this.quantity > this.maximumStock;
  }

  canRemoveQuantity(qty: number): boolean {
    return this.quantity >= qty;
  }

  increaseQuantity(qty: number): Result<void> {
    if (qty <= 0) {
      return err('Quantity to increase must be positive');
    }
    this.quantity += qty;
    if (this.quantity > this.maximumStock) {
      // Log warning pero no falla
      console.warn(`Stock for product ${this.productId} exceeds maximum`);
    }
    return ok(void 0);
  }

  decreaseQuantity(qty: number): Result<void> {
    if (qty <= 0) {
      return err('Quantity to decrease must be positive');
    }
    if (!this.canRemoveQuantity(qty)) {
      return err(`Insufficient stock: available ${this.quantity}, required ${qty}`);
    }
    this.quantity -= qty;
    return ok(void 0);
  }
}
```

**Test Unitario Sugerido:**
```typescript
describe('StockProduct Entity', () => {
  it('should throw error when minimumStock >= maximumStock', () => {
    expect(() => {
      new StockProduct({
        productId: 1,
        warehouseId: 1,
        quantity: 10,
        minimumStock: 50,
        maximumStock: 50,
      });
    }).toThrow('Minimum stock must be less than maximum stock');
  });

  it('should increase quantity correctly', () => {
    const stock = new StockProduct({
      productId: 1,
      warehouseId: 1,
      quantity: 10,
      minimumStock: 5,
      maximumStock: 100,
    });
    const result = stock.increaseQuantity(20);
    expect(result.isOk).toBe(true);
    expect(stock.quantity).toBe(30);
  });

  it('should fail to decrease quantity if insufficient', () => {
    const stock = new StockProduct({
      productId: 1,
      warehouseId: 1,
      quantity: 5,
      minimumStock: 0,
      maximumStock: 100,
    });
    const result = stock.decreaseQuantity(10);
    expect(result.isError).toBe(true);
    expect(result.value).toContain('Insufficient stock');
  });

  it('should identify low stock', () => {
    const stock = new StockProduct({
      productId: 1,
      warehouseId: 1,
      quantity: 3,
      minimumStock: 5,
      maximumStock: 100,
    });
    expect(stock.isLowStock()).toBe(true);
  });

  it('should identify over stock', () => {
    const stock = new StockProduct({
      productId: 1,
      warehouseId: 1,
      quantity: 150,
      minimumStock: 5,
      maximumStock: 100,
    });
    expect(stock.isOverStock()).toBe(true);
  });
});
```

---

### 1.3 Módulo PROVEEDORES (RF04)

#### ❌ Validación No Implementada: PurchaseOrder - Mínimo 1 Detalle

**Ubicación:** `src/modules/proveedores/application/use-cases/generar-orden-compra.use-case.ts`

**Problema:**
```typescript
// GeneratePurchaseOrderUseCase.execute() NO valida:
// - details array is empty
// - details es null/undefined

// Ejemplo de error:
POST /api/suppliers/purchase-orders
{ supplierId: 20, details: [] }
// ❌ Se crea orden vacía
```

**Implementación Sugerida:**
```typescript
@Injectable()
export class GeneratePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(input: GeneratePurchaseOrderInput): Promise<Result<PurchaseOrder>> {
    // 1. Validar detalles
    if (!input.details || input.details.length === 0) {
      return err('A purchase order must have at least one detail line item');
    }

    // 2. Validar proveedor
    const supplier = await this.supplierRepository.findById(input.supplierId);
    if (!supplier) {
      return err(`Supplier with ID ${input.supplierId} not found`);
    }

    // 3. Crear orden
    const order = new PurchaseOrder({
      supplierId: input.supplierId,
      orderDate: new Date(),
      status: 'PENDING',
    });

    // 4. Agregar detalles (con validación)
    for (const detail of input.details) {
      const detailResult = order.addDetail(
        detail.productId,
        detail.quantity,
        detail.unitPrice,
      );
      if (detailResult.isError) {
        return err(detailResult.value);
      }
    }

    // 5. Persistir
    const saved = await this.purchaseOrderRepository.save(order);
    return ok(saved);
  }
}
```

---

### 1.4 Módulo ENTREGAS (RF05)

#### ❌ Validación No Implementada: Delivery - Venta debe estar CONFIRMED

**Ubicación:** `src/modules/entregas/application/use-cases/generar-entrega.use-case.ts`

**Problema:**
```typescript
// GenerateDeliveryUseCase.execute() NO valida:
// - Sale.status !== 'CONFIRMED'

// Ejemplo de error:
POST /api/deliveries
{ saleId: 501, destinationAddress: "..." }
// Si Sale 501 está en estado PENDING, se crea de todas formas
```

**Implementación Sugerida:**
```typescript
export interface GenerateDeliveryInput {
  saleId: number;
  destinationAddress: string;
}

@Injectable()
export class GenerateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
    // Requiere inyección de SaleRepository (si no existe)
    private readonly saleRepository: ISaleRepository,
  ) {}

  async execute(input: GenerateDeliveryInput): Promise<Result<Delivery>> {
    // 1. Validar sale existe y está CONFIRMED
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      return err(`Sale with ID ${input.saleId} not found`);
    }
    if (sale.status !== 'CONFIRMED') {
      return err(`Sale must be CONFIRMED to generate delivery. Current status: ${sale.status}`);
    }

    // 2. Validar no existe entrega previa (IMPLEMENTACIÓN ADICIONAL)
    const existingDelivery = await this.deliveryRepository.findBySaleId(input.saleId);
    if (existingDelivery) {
      return err(`Delivery already exists for sale ${input.saleId}`);
    }

    // 3. Crear delivery
    const delivery = new Delivery({
      saleId: input.saleId,
      destinationAddress: input.destinationAddress,
      status: 'PENDING',
      createdAt: new Date(),
    });

    // 4. Copiar items de venta
    for (const saleDetail of sale.details) {
      delivery.addItem(saleDetail.productId, saleDetail.quantity);
    }

    // 5. Persistir
    const saved = await this.deliveryRepository.save(delivery);
    return ok(saved);
  }
}

// Requiere agregar a repositorio:
interface IDeliveryRepository {
  findBySaleId(saleId: number): Promise<Delivery | null>;
}
```

---

#### ❌ Validación No Implementada: Transaccionalidad en registerWarehouseExit

**Ubicación:** `src/modules/entregas/application/use-cases/registrar-salida-bodega.use-case.ts`

**Problema:**
```
Escenario de falso registro:
1. Cambiar status entrega PENDING → IN_TRANSIT ✅
2. Para item 1: disminuir stock ✅
3. Para item 2: disminuir stock ❌ FALLA (stock insuficiente)
   → Resultado: Estado inconsistente
      - Entrega está IN_TRANSIT
      - Pero item 2 sigue en stock (no se disminuyó)
```

**Implementación Sugerida (con transacción):**
```typescript
@Injectable()
export class RegisterWarehouseExitUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
    // Inyección de transaction manager
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(deliveryId: number): Promise<Result<Delivery>> {
    // Iniciar transacción
    return this.transactionManager.transaction(async (trx) => {
      // 1. Consultar entrega
      const delivery = await this.deliveryRepository.findById(deliveryId);
      if (!delivery) {
        return err(`Delivery with ID ${deliveryId} not found`);
      }
      if (delivery.status !== 'PENDING') {
        return err(`Delivery must be in PENDING status. Current: ${delivery.status}`);
      }

      // 2. Validar stock ANTES de actualizar (fail-fast)
      for (const item of delivery.items) {
        const stock = await this.stockProductRepository.findByProductAndWarehouse(
          item.productId,
          delivery.warehouseId,
          { transaction: trx },
        );
        if (!stock || !stock.canRemoveQuantity(item.quantity)) {
          return err(
            `Insufficient stock for product ${item.productId}. Available: ${stock?.quantity || 0}, Required: ${item.quantity}`,
          );
        }
      }

      // 3. Cambiar status (dentro de transacción)
      delivery.status = 'IN_TRANSIT';
      await this.deliveryRepository.update(delivery, { transaction: trx });

      // 4. Disminuir stock para cada item (dentro de transacción)
      for (const item of delivery.items) {
        const stock = await this.stockProductRepository.findByProductAndWarehouse(
          item.productId,
          delivery.warehouseId,
          { transaction: trx },
        );
        const decreaseResult = stock!.decreaseQuantity(item.quantity);
        if (decreaseResult.isError) {
          // Si falla aquí, TODA la transacción se revierte
          throw new Error(decreaseResult.value);
        }
        await this.stockProductRepository.update(stock!, { transaction: trx });
      }

      // 5. Si todo OK, retornar delivery actualizado
      const updated = await this.deliveryRepository.findById(deliveryId, { transaction: trx });
      return ok(updated!);
    });
    // Si catch en transacción: todo se revierte automáticamente
  }
}
```

**Implementación de TransactionManager:**
```typescript
// shared/infrastructure/database/transaction.manager.ts
import { EntityManager } from 'typeorm';

export interface TransactionManager {
  transaction<T>(
    callback: (trx: EntityManager) => Promise<T>,
  ): Promise<T>;
}

export class TypeOrmTransactionManager implements TransactionManager {
  constructor(private readonly dataSource: DataSource) {}

  async transaction<T>(
    callback: (trx: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

---

## 2. Casos de Uso No Implementados

### 2.1 Revertir Venta (Cancelación)

**Requisito:** Cambiar Sale.status a CANCELLED y potencialmente descongelar stock si fue reservado.

```typescript
export interface CancelSaleInput {
  saleId: number;
  reason: string; // Para auditoría
}

@Injectable()
export class CancelSaleUseCase {
  constructor(
    @Inject(SALE_REPOSITORY_TOKEN)
    private readonly saleRepository: ISaleRepository,
  ) {}

  async execute(input: CancelSaleInput): Promise<Result<Sale>> {
    const sale = await this.saleRepository.findById(input.saleId);
    if (!sale) {
      return err(`Sale with ID ${input.saleId} not found`);
    }

    if (sale.status === 'CANCELLED') {
      return err(`Sale is already cancelled`);
    }

    if (sale.status === 'DELIVERED') {
      return err(`Cannot cancel a delivered sale`);
    }

    sale.status = 'CANCELLED';
    // TODO: Descongelar stock si fue reservado
    // TODO: Crear auditoría (CancellationLog)

    const updated = await this.saleRepository.update(sale);
    return ok(updated);
  }
}
```

---

### 2.2 Revertir Recepción de Orden (Devolución a Proveedor)

```typescript
export interface ReverseReceptionInput {
  orderId: number;
  reason: string;
}

@Injectable()
export class ReverseReceptionUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  async execute(input: ReverseReceptionInput): Promise<Result<PurchaseOrder>> {
    const order = await this.purchaseOrderRepository.findById(input.orderId);
    if (!order) {
      return err(`Purchase order with ID ${input.orderId} not found`);
    }

    if (order.status !== 'RECEIVED') {
      return err(`Cannot reverse reception. Current status: ${order.status}`);
    }

    // Disminuir stock que fue agregado
    for (const detail of order.details) {
      const stock = await this.stockProductRepository.findByProductAndWarehouse(
        detail.productId,
        1, // Asumir bodega 1 por ahora
      );
      if (stock) {
        const decreaseResult = stock.decreaseQuantity(detail.quantity);
        if (decreaseResult.isError) {
          return err(`Cannot reverse: ${decreaseResult.value}`);
        }
        await this.stockProductRepository.update(stock);
      }
    }

    order.status = 'PENDING';
    const updated = await this.purchaseOrderRepository.update(order);
    return ok(updated);
  }
}
```

---

## 3. Auditoría y Logging

### 3.1 Entidad de Auditoría

```typescript
// shared/domain/entities/audit-log.entity.ts
export class AuditLog extends BaseEntity {
  module: string;        // 'RRHH', 'VENTAS', etc.
  action: string;        // 'CREATE_SALE', 'CANCEL_ORDER', etc.
  entityId: number;      // ID de la entidad afectada
  entityType: string;    // 'Sale', 'PurchaseOrder', etc.
  userId: number;        // Quién hizo el cambio
  previousState?: Record<string, any>;
  newState: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;

  constructor(props: Partial<AuditLog>) {
    super();
    Object.assign(this, props);
    this.timestamp = this.timestamp || new Date();
  }
}
```

**Uso en Use Cases:**
```typescript
@Injectable()
export class RegisterSaleUseCase {
  constructor(
    // ... otros repos
    @Inject(AUDIT_LOG_REPOSITORY_TOKEN)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(input: RegisterSaleInput): Promise<Result<Sale>> {
    // ... lógica de validación
    const sale = new Sale({...});
    const saved = await this.saleRepository.save(sale);

    // Registrar auditoría
    const auditLog = new AuditLog({
      module: 'VENTAS',
      action: 'CREATE_SALE',
      entityId: saved.id,
      entityType: 'Sale',
      userId: input.userId, // Requerido en input
      newState: {
        id: saved.id,
        sellerId: saved.sellerId,
        clientId: saved.clientId,
        total: saved.calculateTotal(),
      },
    });
    await this.auditLogRepository.save(auditLog);

    return ok(saved);
  }
}
```

---

## 4. Eventos de Dominio (Event Sourcing Básico)

### 4.1 Eventos de Stock

```typescript
// modules/inventario/domain/events/stock-decreased.event.ts
export class StockDecreasedEvent {
  constructor(
    public readonly productId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
    public readonly reason: 'SALE' | 'RETURN' | 'ADJUSTMENT',
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockIncreasedEvent {
  constructor(
    public readonly productId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
    public readonly reason: 'PO_RECEPTION' | 'RETURN' | 'ADJUSTMENT',
    public readonly timestamp: Date = new Date(),
  ) {}
}
```

**Uso en Entities:**
```typescript
export class StockProduct extends BaseEntity {
  private domainEvents: DomainEvent[] = [];

  decreaseQuantity(qty: number): Result<void> {
    if (qty <= 0) {
      return err('Quantity to decrease must be positive');
    }
    if (!this.canRemoveQuantity(qty)) {
      return err(`Insufficient stock...`);
    }
    this.quantity -= qty;

    // Registrar evento
    this.addDomainEvent(
      new StockDecreasedEvent(this.productId, this.warehouseId, qty, 'SALE'),
    );

    return ok(void 0);
  }

  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
```

---

## 5. Resumen de Implementaciones Pendientes

| Prioridad | Componente | Validación/Implementación | Impacto | Esfuerzo |
|-----------|-----------|--------------------------|--------|----------|
| 🔴 ALTA | SaleDetail | quantity > 0, unitPrice >= 0 | Crítico | Bajo |
| 🔴 ALTA | Delivery | Venta debe estar CONFIRMED | Crítico | Bajo |
| 🔴 ALTA | registerWarehouseExit | Transaccionalidad completa | Crítico | Medio |
| 🟡 MEDIA | PurchaseOrder | Mínimo 1 detalle | Importante | Bajo |
| 🟡 MEDIA | StockProduct | Métodos increaseQuantity/decreaseQuantity | Importante | Medio |
| 🟡 MEDIA | Delivery | Evitar entregas duplicadas (unique constraint) | Importante | Bajo |
| 🟢 BAJA | AuditLog | Implementar auditoría completa | Deseable | Alto |
| 🟢 BAJA | CancelSaleUseCase | Permitir cancelación de ventas | Deseable | Medio |
| 🟢 BAJA | ReverseReceptionUseCase | Permitir devolución de órdenes | Deseable | Medio |
| 🟢 BAJA | Domain Events | Event sourcing para stock | Avanzado | Alto |

---

## 6. Conclusiones

La arquitectura actual es sólida pero requiere **reforzar validaciones en el domain layer** y **agregar transaccionalidad en operaciones críticas**. Las validaciones de negocio deben estar lo más cerca posible del dominio (entidades) en lugar de confiar únicamente en use cases.

Prioridades recomendadas:
1. **Semana 1:** Validaciones de dominio en SaleDetail, StockProduct
2. **Semana 2:** Transaccionalidad en registerWarehouseExit
3. **Semana 3:** Validación de Delivery (venta CONFIRMED, no duplicados)
4. **Post-MVP:** Auditoría, eventos, cancelaciones

