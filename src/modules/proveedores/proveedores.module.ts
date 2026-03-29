import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM entities
import { SupplierOrmEntity } from './infrastructure/persistence/entities/proveedor.orm-entity';
import { PurchaseOrderOrmEntity } from './infrastructure/persistence/entities/orden-compra.orm-entity';
import { PurchaseOrderDetailOrmEntity } from './infrastructure/persistence/entities/detalle-orden-compra.orm-entity';

// Repository implementations
import { TypeOrmSupplierRepository } from './infrastructure/persistence/repositories/typeorm-proveedor.repository';
import { TypeOrmPurchaseOrderRepository } from './infrastructure/persistence/repositories/typeorm-orden-compra.repository';

// Repository tokens
import { SUPPLIER_REPOSITORY_TOKEN } from './domain/ports/outbound/proveedor.repository.port';
import { PURCHASE_ORDER_REPOSITORY_TOKEN } from './domain/ports/outbound/orden-compra.repository.port';

// Use cases
import { GeneratePurchaseOrderUseCase } from './application/use-cases/generar-orden-compra.use-case';
import { RegisterReceptionUseCase } from './application/use-cases/registrar-recepcion.use-case';
import { GetSuppliersUseCase } from './application/use-cases/consultar-proveedores.use-case';
import { CreateSupplierUseCase } from './application/use-cases/crear-proveedor.use-case';
import { UpdateSupplierUseCase } from './application/use-cases/actualizar-proveedor.use-case';
import { DeleteSupplierUseCase } from './application/use-cases/eliminar-proveedor.use-case';
import { GetPurchaseOrdersUseCase } from './application/use-cases/obtener-ordenes-compra.use-case';
import { EliminarOrdenCompraUseCase } from './application/use-cases/eliminar-orden-compra.use-case';

/**
 * NestJS module for the Proveedores (Suppliers) bounded context.
 * Configures TypeORM entities, binds repository implementations to
 * their domain port tokens, and provides application use cases.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupplierOrmEntity,
      PurchaseOrderOrmEntity,
      PurchaseOrderDetailOrmEntity,
    ]),
  ],
  providers: [
    // Repository bindings (port -> adapter)
    {
      provide: SUPPLIER_REPOSITORY_TOKEN,
      useClass: TypeOrmSupplierRepository,
    },
    {
      provide: PURCHASE_ORDER_REPOSITORY_TOKEN,
      useClass: TypeOrmPurchaseOrderRepository,
    },

    // Use cases
    GeneratePurchaseOrderUseCase,
    RegisterReceptionUseCase,
    GetSuppliersUseCase,
    CreateSupplierUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
    GetPurchaseOrdersUseCase,
    EliminarOrdenCompraUseCase,
  ],
  exports: [
    // Export repository providers for cross-module injection
    SUPPLIER_REPOSITORY_TOKEN,
    PURCHASE_ORDER_REPOSITORY_TOKEN,
    GeneratePurchaseOrderUseCase,
    RegisterReceptionUseCase,
    GetSuppliersUseCase,
    CreateSupplierUseCase,
    UpdateSupplierUseCase,
    DeleteSupplierUseCase,
    GetPurchaseOrdersUseCase,
    EliminarOrdenCompraUseCase,
  ],
})
export class ProveedoresModule {}
