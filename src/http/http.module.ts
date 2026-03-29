import { Module } from '@nestjs/common';
import { FacadesModule } from '../facades/facades.module';
import { TareasModule } from '../modules/tareas/tareas.module';
import { AdminController } from './controllers/admin.controller';
import { SalesController } from './controllers/sales.controller';
import { InventoryController } from './controllers/inventory.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { DeliveriesController } from './controllers/deliveries.controller';
import { TareasController } from './controllers/tareas.controller';

/**
 * HTTP module that registers all REST API controllers.
 * Imports FacadesModule to make the three facade services
 * (AdministracionFacade, VentasFacade, LogisticaFacade) available
 * for injection into controllers.
 */
@Module({
  imports: [FacadesModule, TareasModule],
  controllers: [
    AdminController,
    SalesController,
    InventoryController,
    SuppliersController,
    DeliveriesController,
    TareasController,
  ],
})
export class HttpModule {}
