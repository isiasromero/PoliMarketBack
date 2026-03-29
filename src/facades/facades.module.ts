import { Module } from '@nestjs/common';
import { RRHHModule } from '../modules/rrhh/rrhh.module';
import { VentasModule } from '../modules/ventas/ventas.module';
import { InventarioModule } from '../modules/inventario/inventario.module';
import { ProveedoresModule } from '../modules/proveedores/proveedores.module';
import { EntregasModule } from '../modules/entregas/entregas.module';
import { AdministracionFacade } from './administracion.facade';
import { VentasFacade } from './ventas.facade';
import { LogisticaFacade } from './logistica.facade';

/**
 * NestJS module that aggregates all bounded-context modules and
 * exposes the three high-level facades used by the CLI layer.
 *
 * Imports every domain module so the facades can inject their use cases,
 * then provides and exports the facade classes for external consumption.
 */
@Module({
  imports: [
    RRHHModule,
    VentasModule,
    InventarioModule,
    ProveedoresModule,
    EntregasModule,
  ],
  providers: [AdministracionFacade, VentasFacade, LogisticaFacade],
  exports: [AdministracionFacade, VentasFacade, LogisticaFacade],
})
export class FacadesModule {}
