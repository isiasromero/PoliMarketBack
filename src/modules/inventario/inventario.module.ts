import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { ProductOrmEntity } from './infrastructure/persistence/entities/producto.orm-entity';
import { WarehouseOrmEntity } from './infrastructure/persistence/entities/bodega.orm-entity';
import { StockProductOrmEntity } from './infrastructure/persistence/entities/stock-producto.orm-entity';

// Repository Tokens
import { PRODUCT_REPOSITORY_TOKEN } from './domain/ports/outbound/producto.repository.port';
import { WAREHOUSE_REPOSITORY_TOKEN } from './domain/ports/outbound/bodega.repository.port';
import { STOCK_PRODUCT_REPOSITORY_TOKEN } from './domain/ports/outbound/stock-producto.repository.port';

// Repository Implementations
import { TypeOrmProductRepository } from './infrastructure/persistence/repositories/typeorm-producto.repository';
import { TypeOrmWarehouseRepository } from './infrastructure/persistence/repositories/typeorm-bodega.repository';
import { TypeOrmStockProductRepository } from './infrastructure/persistence/repositories/typeorm-stock-producto.repository';

// Use Cases
import { CheckAvailabilityUseCase } from './application/use-cases/consultar-disponibilidad.use-case';
import { VerifySufficientStockUseCase } from './application/use-cases/verificar-stock-suficiente.use-case';
import { RegisterEntryUseCase } from './application/use-cases/registrar-entrada.use-case';
import { RegisterExitUseCase } from './application/use-cases/registrar-salida.use-case';
import { CheckLowStockProductsUseCase } from './application/use-cases/consultar-productos-bajo-stock.use-case';
import { AutoGeneratePurchaseOrderUseCase } from './application/use-cases/auto-generar-orden-compra.use-case';
import { ObtenerProductosUseCase } from './application/use-cases/obtener-productos.use-case';
import { CrearProductoUseCase } from './application/use-cases/crear-producto.use-case';
import { UpdateProductUseCase } from './application/use-cases/actualizar-producto.use-case';
import { DeleteProductUseCase } from './application/use-cases/eliminar-producto.use-case';
import { ObtenerStockUseCase } from './application/use-cases/obtener-stock.use-case';

// Proveedores module - required for auto-generating purchase orders
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
// Proveedores: entidades y repositorios necesarios para auto-orden de compra
import { SupplierOrmEntity } from '../proveedores/infrastructure/persistence/entities/proveedor.orm-entity';
import { PurchaseOrderOrmEntity } from '../proveedores/infrastructure/persistence/entities/orden-compra.orm-entity';
import { PurchaseOrderDetailOrmEntity } from '../proveedores/infrastructure/persistence/entities/detalle-orden-compra.orm-entity';
import { SUPPLIER_REPOSITORY_TOKEN } from '../proveedores/domain/ports/outbound/proveedor.repository.port';
import { PURCHASE_ORDER_REPOSITORY_TOKEN } from '../proveedores/domain/ports/outbound/orden-compra.repository.port';
import { TypeOrmSupplierRepository } from '../proveedores/infrastructure/persistence/repositories/typeorm-proveedor.repository';
import { TypeOrmPurchaseOrderRepository } from '../proveedores/infrastructure/persistence/repositories/typeorm-orden-compra.repository';

/**
 * NestJS module for the Inventario (Inventory) bounded context.
 * Wires together the hexagonal architecture layers:
 * - Registers TypeORM entities for database schema
 * - Binds repository implementations to their domain port tokens
 * - Provides all application use cases
 * - Exports use cases for consumption by facade modules
 *
 * INTEGRACION CON PROVEEDORES: Este módulo depende del módulo PROVEEDORES
 * para auto-generar órdenes de compra cuando el stock baja. Esto implementa
 * la regla de negocio RF04: auto-restocking cuando inventario es bajo.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductOrmEntity,
      WarehouseOrmEntity,
      StockProductOrmEntity,
      // Entidades necesarias para proveedores/ordenes en casos de uso de inventario
      SupplierOrmEntity,
      PurchaseOrderOrmEntity,
      PurchaseOrderDetailOrmEntity,
    ]),
    // Importar módulo PROVEEDORES para crear órdenes de compra automáticamente
    ProveedoresModule,
    // Importar DatabaseModule para inyectar TransactionService
    DatabaseModule,
  ],
  providers: [
    // Repository bindings (Symbol token -> concrete implementation)
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: WAREHOUSE_REPOSITORY_TOKEN,
      useClass: TypeOrmWarehouseRepository,
    },
    {
      provide: STOCK_PRODUCT_REPOSITORY_TOKEN,
      useClass: TypeOrmStockProductRepository,
    },
    // Proveedores: repositorios requeridos por AutoGeneratePurchaseOrderUseCase
    {
      provide: SUPPLIER_REPOSITORY_TOKEN,
      useClass: TypeOrmSupplierRepository,
    },
    {
      provide: PURCHASE_ORDER_REPOSITORY_TOKEN,
      useClass: TypeOrmPurchaseOrderRepository,
    },

    // Use Cases
    CheckAvailabilityUseCase,
    VerifySufficientStockUseCase,
    RegisterEntryUseCase,
    RegisterExitUseCase,
    CheckLowStockProductsUseCase,
    AutoGeneratePurchaseOrderUseCase,
    ObtenerProductosUseCase,
    CrearProductoUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    ObtenerStockUseCase,
  ],
  exports: [
    CheckAvailabilityUseCase,
    VerifySufficientStockUseCase,
    RegisterEntryUseCase,
    RegisterExitUseCase,
    CheckLowStockProductsUseCase,
    AutoGeneratePurchaseOrderUseCase,
    ObtenerProductosUseCase,
    CrearProductoUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    ObtenerStockUseCase,
  ],
})
export class InventarioModule {}
