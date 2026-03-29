import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM entities
import { SellerOrmEntity } from './infrastructure/persistence/entities/vendedor.orm-entity';
import { ClientOrmEntity } from './infrastructure/persistence/entities/cliente.orm-entity';
import { SaleOrmEntity } from './infrastructure/persistence/entities/venta.orm-entity';
import { SaleDetailOrmEntity } from './infrastructure/persistence/entities/detalle-venta.orm-entity';

// Repository implementations
import { TypeOrmSellerRepository } from './infrastructure/persistence/repositories/typeorm-vendedor.repository';
import { TypeOrmClientRepository } from './infrastructure/persistence/repositories/typeorm-cliente.repository';
import { TypeOrmSaleRepository } from './infrastructure/persistence/repositories/typeorm-venta.repository';

// Repository tokens
import { SELLER_REPOSITORY_TOKEN } from './domain/ports/outbound/vendedor.repository.port';
import { CLIENT_REPOSITORY_TOKEN } from './domain/ports/outbound/cliente.repository.port';
import { SALE_REPOSITORY_TOKEN } from './domain/ports/outbound/venta.repository.port';
import { AUTHORIZATION_REPOSITORY_TOKEN } from '../rrhh/domain/ports/outbound/autorizacion.repository.port';

// RRHH module - required for seller authorization validation
import { RRHHModule } from '../rrhh/rrhh.module';
import { InventarioModule } from '../inventario/inventario.module';

// Use cases
import { RegisterSaleUseCase } from './application/use-cases/registrar-venta.use-case';
import { GetClientsUseCase } from './application/use-cases/consultar-clientes.use-case';
import { GetSalesBySellerUseCase } from './application/use-cases/consultar-ventas-por-vendedor.use-case';
import { ObtenerVendedoresUseCase } from './application/use-cases/obtener-vendedores.use-case';
import { CreateClientUseCase } from './application/use-cases/crear-cliente.use-case';
import { UpdateClientUseCase } from './application/use-cases/actualizar-cliente.use-case';
import { DeleteClientUseCase } from './application/use-cases/eliminar-cliente.use-case';
import { GetClientUseCase } from './application/use-cases/obtener-cliente.use-case';

/**
 * NestJS module for the Ventas (Sales) bounded context.
 * Configures TypeORM entities, binds repository implementations to
 * their domain port tokens, and provides application use cases.
 *
 * INTEGRACION CON RRHH: Este módulo depende del módulo RRHH para validar
 * las autorizaciones de vendedores. Todo vendedor debe estar autorizado
 * por HR antes de poder registrar ventas (RF01).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SellerOrmEntity,
      ClientOrmEntity,
      SaleOrmEntity,
      SaleDetailOrmEntity,
    ]),
    // Importar módulos requeridos por los casos de uso
    RRHHModule,
    InventarioModule,
  ],
  providers: [
    // Repository bindings (port -> adapter)
    {
      provide: SELLER_REPOSITORY_TOKEN,
      useClass: TypeOrmSellerRepository,
    },
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: TypeOrmClientRepository,
    },
    {
      provide: SALE_REPOSITORY_TOKEN,
      useClass: TypeOrmSaleRepository,
    },

    // Use cases
    RegisterSaleUseCase,
    GetClientsUseCase,
    GetSalesBySellerUseCase,
    ObtenerVendedoresUseCase,
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    GetClientUseCase,
  ],
  exports: [
    // Export repository providers for cross-module injection
    SALE_REPOSITORY_TOKEN,
    RegisterSaleUseCase,
    GetClientsUseCase,
    GetSalesBySellerUseCase,
    ObtenerVendedoresUseCase,
    CreateClientUseCase,
    UpdateClientUseCase,
    DeleteClientUseCase,
    GetClientUseCase,
  ],
})
export class VentasModule {}
