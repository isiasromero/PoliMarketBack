import { Injectable } from '@nestjs/common';
import * as chalk from "chalk";;
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { LogisticaFacade } from '../../facades/logistica.facade';
import { GenerateDeliveryItemInput } from '../../modules/entregas/application/use-cases/generar-entrega.use-case';

/**
 * Controlador de comandos CLI para el módulo de Entregas.
 * Proporciona un submenú interactivo para generar entregas,
 * registrar salidas de bodega, confirmar entregas,
 * y consultar envíos pendientes.
 */
@Injectable()
export class EntregasCommand {
  constructor(private readonly logisticaFacade: LogisticaFacade) {}

  /**
   * Ejecuta el bucle del submenú interactivo de Entregas.
   * Muestra opciones y delega al método de fachada apropiado.
   */
  async run(): Promise<void> {
    let back = false;

    while (!back) {
      const { option } = await inquirer.prompt<{ option: string }>([
        {
          type: 'list',
          name: 'option',
          message: (chalk as any).yellow('Entregas - Seleccione una opcion:'),
          choices: [
            { name: '1. Generar entrega', value: 'generate' },
            { name: '2. Registrar salida de bodega', value: 'warehouseExit' },
            { name: '3. Confirmar entrega', value: 'confirm' },
            { name: '4. Consultar entregas pendientes', value: 'pending' },
            new inquirer.Separator(),
            { name: '0. Volver al menu principal', value: 'back' },
          ],
        },
      ]);

      switch (option) {
        case 'generate':
          await this.handleGenerateDelivery();
          break;
        case 'warehouseExit':
          await this.handleRegisterWarehouseExit();
          break;
        case 'confirm':
          await this.handleConfirmDelivery();
          break;
        case 'pending':
          await this.handleGetPendingDeliveries();
          break;
        case 'back':
          back = true;
          break;
      }
    }
  }

  /**
   * Prompts for sale ID, destination address, and loops to collect delivery items,
   * then generates the delivery through the facade.
   * @private
   */
  private async handleGenerateDelivery(): Promise<void> {
    const header = await inquirer.prompt<{
      saleId: number;
      destinationAddress: string;
    }>([
      {
        type: 'number',
        name: 'saleId',
        message: 'ID de la venta:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'input',
        name: 'destinationAddress',
        message: 'Direccion de destino:',
        validate: (v: string) =>
          v.trim().length > 0 ? true : 'La direccion no puede estar vacia',
      },
    ]);

    const items: GenerateDeliveryItemInput[] = [];
    let addMore = true;

    while (addMore) {
      const item = await inquirer.prompt<{
        productId: number;
        quantity: number;
      }>([
        {
          type: 'number',
          name: 'productId',
          message: 'ID del producto:',
          validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
        },
        {
          type: 'number',
          name: 'quantity',
          message: 'Cantidad:',
          validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
        },
      ]);

      items.push(item);

      const { more } = await inquirer.prompt<{ more: boolean }>([
        {
          type: 'confirm',
          name: 'more',
          message: 'Agregar otro producto a la entrega?',
          default: false,
        },
      ]);

      addMore = more;
    }

    const result = await this.logisticaFacade.generateDelivery({
      saleId: header.saleId,
      destinationAddress: header.destinationAddress,
      items,
    });

    if (result.success) {
      console.log((chalk as any).green('\n  Entrega generada exitosamente:'));
      console.log((chalk as any).white(`    ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Venta ID: ${result.value.saleId}`));
      console.log((chalk as any).white(`    Destino: ${result.value.destinationAddress}`));
      console.log((chalk as any).white(`    Estado: ${result.value.status}`));
      console.log(
        (chalk as any).white(`    Items: ${result.value.items.length} producto(s)\n`),
      );
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Prompts for a delivery ID and registers the warehouse exit (PENDING -> IN_TRANSIT).
   * @private
   */
  private async handleRegisterWarehouseExit(): Promise<void> {
    const { deliveryId } = await inquirer.prompt<{ deliveryId: number }>([
      {
        type: 'number',
        name: 'deliveryId',
        message: 'ID de la entrega:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.logisticaFacade.registerWarehouseExit(deliveryId);

    if (result.success) {
      console.log((chalk as any).green('\n  Salida de bodega registrada exitosamente:'));
      console.log((chalk as any).white(`    Entrega ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Nuevo estado: ${result.value.status}\n`));
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Prompts for a delivery ID and confirms it (IN_TRANSIT -> DELIVERED).
   * @private
   */
  private async handleConfirmDelivery(): Promise<void> {
    const { deliveryId } = await inquirer.prompt<{ deliveryId: number }>([
      {
        type: 'number',
        name: 'deliveryId',
        message: 'ID de la entrega a confirmar:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.logisticaFacade.confirmDelivery(deliveryId);

    if (result.success) {
      console.log((chalk as any).green('\n  Entrega confirmada exitosamente:'));
      console.log((chalk as any).white(`    Entrega ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Nuevo estado: ${result.value.status}\n`));
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Retrieves and displays all pending deliveries in a formatted table.
   * @private
   */
  private async handleGetPendingDeliveries(): Promise<void> {
    const result = await this.logisticaFacade.getPendingDeliveries();

    if (!result.success) {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
      return;
    }

    const deliveries = result.value;

    if (deliveries.length === 0) {
      console.log((chalk as any).green('\n  No hay entregas pendientes.\n'));
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('ID'),
        (chalk as any).cyan('Venta ID'),
        (chalk as any).cyan('Destino'),
        (chalk as any).cyan('Estado'),
        (chalk as any).cyan('Fecha'),
        (chalk as any).cyan('Items'),
      ],
    });

    for (const delivery of deliveries) {
      const statusColor =
        delivery.status === 'IN_TRANSIT' ? chalk.yellow : chalk.white;
      table.push([
        String(delivery.id),
        String(delivery.saleId),
        delivery.destinationAddress,
        statusColor(delivery.status),
        new Date(delivery.deliveryDate).toLocaleDateString(),
        String(delivery.items?.length ?? 0),
      ]);
    }

    console.log('\n  Entregas pendientes:');
    console.log(table.toString());
    console.log('');
  }
}
