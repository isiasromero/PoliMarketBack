import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';

// ORM entities
import { DeliveryOrmEntity } from './infrastructure/persistence/entities/entrega.orm-entity';
import { DeliveryItemOrmEntity } from './infrastructure/persistence/entities/entrega-item.orm-entity';

// Repository implementation
import { TypeOrmDeliveryRepository } from './infrastructure/persistence/repositories/typeorm-entrega.repository';

// Repository token
import { DELIVERY_REPOSITORY_TOKEN } from './domain/ports/outbound/entrega.repository.port';

// Use cases
import { GenerateDeliveryUseCase } from './application/use-cases/generar-entrega.use-case';
import { ConfirmDeliveryUseCase } from './application/use-cases/confirmar-entrega.use-case';
import { GetPendingDeliveriesUseCase } from './application/use-cases/consultar-entregas-pendientes.use-case';
import { RegisterWarehouseExitUseCase } from './application/use-cases/registrar-salida-bodega.use-case';

// Inventory module - required for automatic stock decrement on delivery confirmation
import { InventarioModule } from '../inventario/inventario.module';
import { VentasModule } from '../ventas/ventas.module';

/**
 * NestJS module for the Entregas (Deliveries) bounded context.
 * Configures TypeORM entities, binds the repository implementation to
 * its domain port token, and provides application use cases.
 *
 * INTEGRACION CON INVENTARIO: Este módulo depende del módulo INVENTARIO para
 * decrementar automáticamente el stock cuando se confirma una entrega (RF05).
 * El decremento es automático y transaccional: si falla el decremento, toda
 * la confirmación de entrega se revierte.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryOrmEntity, DeliveryItemOrmEntity]),
    // Importar módulo INVENTARIO para acceder a use cases de stock
    InventarioModule,
    // Importar módulo VENTAS para acceder al repositorio de ventas
    VentasModule,
    // Importar módulo DATABASE para acceder a TransactionService
    DatabaseModule,
  ],
  providers: [
    // Repository binding (port -> adapter)
    {
      provide: DELIVERY_REPOSITORY_TOKEN,
      useClass: TypeOrmDeliveryRepository,
    },

    // Use cases
    GenerateDeliveryUseCase,
    ConfirmDeliveryUseCase,
    GetPendingDeliveriesUseCase,
    RegisterWarehouseExitUseCase,
  ],
  exports: [
    GenerateDeliveryUseCase,
    ConfirmDeliveryUseCase,
    GetPendingDeliveriesUseCase,
    RegisterWarehouseExitUseCase,
  ],
})
export class EntregasModule {}
