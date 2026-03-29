import { Injectable } from '@nestjs/common';
import * as chalk from 'chalk';
import * as figlet from 'figlet';
import inquirer from 'inquirer';
import { RRHHCommand } from './commands/rrhh.command';
import { VentasCommand } from './commands/ventas.command';
import { InventarioCommand } from './commands/inventario.command';
import { ProveedoresCommand } from './commands/proveedores.command';
import { EntregasCommand } from './commands/entregas.command';

/**
 * Controlador del menú principal de la aplicación CLI de PoliMarket.
 * Muestra un banner ASCII y ejecuta un bucle a través del menú principal,
 * delegando al controlador de comando apropiado según la selección del usuario.
 */
@Injectable()
export class MainMenu {
  constructor(
    private readonly rrhhCommand: RRHHCommand,
    private readonly ventasCommand: VentasCommand,
    private readonly inventarioCommand: InventarioCommand,
    private readonly proveedoresCommand: ProveedoresCommand,
    private readonly entregasCommand: EntregasCommand,
  ) {}

  /**
   * Renderiza el banner ASCII e inicia el bucle del menú principal interactivo.
   * El bucle continúa hasta que el usuario selecciona la opción de salida.
   */
  async run(): Promise<void> {
    this.showBanner();

    let running = true;

    while (running) {
      const { option } = await inquirer.prompt<{ option: string }>([
        {
          type: 'list',
          name: 'option',
          message: (chalk as any).yellow('Seleccione un modulo:'),
          choices: [
            { name: '1. Recursos Humanos (RRHH)', value: 'rrhh' },
            { name: '2. Ventas', value: 'ventas' },
            { name: '3. Inventario / Bodega', value: 'inventario' },
            { name: '4. Proveedores', value: 'proveedores' },
            { name: '5. Entregas', value: 'entregas' },
            new inquirer.Separator(),
            { name: '0. Salir', value: 'exit' },
          ],
        },
      ]);

      switch (option) {
        case 'rrhh':
          await this.rrhhCommand.run();
          break;
        case 'ventas':
          await this.ventasCommand.run();
          break;
        case 'inventario':
          await this.inventarioCommand.run();
          break;
        case 'proveedores':
          await this.proveedoresCommand.run();
          break;
        case 'entregas':
          await this.entregasCommand.run();
          break;
        case 'exit':
          running = false;
          console.log((chalk as any).cyan('\nHasta luego! Gracias por usar PoliMarket.\n'));
          break;
      }
    }
  }

  /**
   * Muestra el banner de arte ASCII de figlet para PoliMarket en color cian.
   * @private
   */
  private showBanner(): void {
    const banner = (figlet as any).textSync('PoliMarket', {
      font: 'Standard',
      horizontalLayout: 'default',
      verticalLayout: 'default',
    });

    console.log(chalk.cyan(banner));
    console.log(
      chalk.gray('  Sistema de Gestion Comercial - Arquitectura Hexagonal\n'),
    );
  }
}
