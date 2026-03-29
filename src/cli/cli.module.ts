import { Module } from '@nestjs/common';
import { FacadesModule } from '../facades/facades.module';
import { MainMenu } from './main.menu';
import { RRHHCommand } from './commands/rrhh.command';
import { VentasCommand } from './commands/ventas.command';
import { InventarioCommand } from './commands/inventario.command';
import { ProveedoresCommand } from './commands/proveedores.command';
import { EntregasCommand } from './commands/entregas.command';

/**
 * Módulo NestJS para la capa de presentación CLI.
 * Importa FacadesModule (que a su vez importa transitivamente todos los módulos
 * de contextos acotados) y proporciona MainMenu junto con cada controlador de comandos.
 *
 * MainMenu se exporta para que la función de arranque pueda resolverlo
 * desde el contexto de la aplicación e invocar su método run().
 */
@Module({
  imports: [FacadesModule],
  providers: [
    MainMenu,
    RRHHCommand,
    VentasCommand,
    InventarioCommand,
    ProveedoresCommand,
    EntregasCommand,
  ],
  exports: [MainMenu],
})
export class CliModule {}
