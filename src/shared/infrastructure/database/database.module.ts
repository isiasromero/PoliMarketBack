import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sqliteConfig } from './sqlite.config';
import { SeederService } from './seeder.service';
import { TransactionService } from './transaction.service';
import { ProductOrmEntity } from '../../../modules/inventario/infrastructure/persistence/entities/producto.orm-entity';
import { WarehouseOrmEntity } from '../../../modules/inventario/infrastructure/persistence/entities/bodega.orm-entity';
import { StockProductOrmEntity } from '../../../modules/inventario/infrastructure/persistence/entities/stock-producto.orm-entity';
import { SellerOrmEntity } from '../../../modules/ventas/infrastructure/persistence/entities/vendedor.orm-entity';
import { ClientOrmEntity } from '../../../modules/ventas/infrastructure/persistence/entities/cliente.orm-entity';
import { HREmployeeOrmEntity } from '../../../modules/rrhh/infrastructure/persistence/entities/empleado-rrhh.orm-entity';
import { SupplierOrmEntity } from '../../../modules/proveedores/infrastructure/persistence/entities/proveedor.orm-entity';
import { PurchaseOrderOrmEntity } from '../../../modules/proveedores/infrastructure/persistence/entities/orden-compra.orm-entity';
import { PurchaseOrderDetailOrmEntity } from '../../../modules/proveedores/infrastructure/persistence/entities/detalle-orden-compra.orm-entity';
import { TareaOrmEntity } from '../../../modules/tareas/infrastructure/persistence/entities/tarea.orm-entity';
import { SaleOrmEntity } from '../../../modules/ventas/infrastructure/persistence/entities/venta.orm-entity';
import { SaleDetailOrmEntity } from '../../../modules/ventas/infrastructure/persistence/entities/detalle-venta.orm-entity';
import { DeliveryOrmEntity } from '../../../modules/entregas/infrastructure/persistence/entities/entrega.orm-entity';
import { DeliveryItemOrmEntity } from '../../../modules/entregas/infrastructure/persistence/entities/entrega-item.orm-entity';
import { AuthorizationOrmEntity } from '../../../modules/rrhh/infrastructure/persistence/entities/autorizacion.orm-entity';

/**
 * Módulo de base de datos que configura TypeORM con SQLite (
 * También registra el SeederService que rellena datos de demostración iniciales
 * en el primer inicio cuando la base de datos está vacía.
 * Importado por AppModule para proporcionar conectividad de base de datos en toda la aplicación.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot(sqliteConfig),
    TypeOrmModule.forFeature([
      ProductOrmEntity,
      WarehouseOrmEntity,
      StockProductOrmEntity,
      SellerOrmEntity,
      ClientOrmEntity,
      SaleOrmEntity,
      SaleDetailOrmEntity,
      HREmployeeOrmEntity,
      AuthorizationOrmEntity,
      SupplierOrmEntity,
      PurchaseOrderOrmEntity,
      PurchaseOrderDetailOrmEntity,
      DeliveryOrmEntity,
      DeliveryItemOrmEntity,
      TareaOrmEntity,
    ]),
  ],
  providers: [SeederService, TransactionService],
  exports: [TransactionService],
})
export class DatabaseModule {}
