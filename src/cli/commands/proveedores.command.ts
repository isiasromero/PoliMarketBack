import { Injectable } from '@nestjs/common';
import * as chalk from "chalk";;
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { LogisticaFacade } from '../../facades/logistica.facade';
import { GenerateOrderDetailInput } from '../../modules/proveedores/application/use-cases/generar-orden-compra.use-case';

/**
 * Controlador de comandos CLI para el módulo de Proveedores.
 * Proporciona un submenú interactivo para generar órdenes de compra,
 * registrar recepciones de órdenes y consultar proveedores.
 */
@Injectable()
export class ProveedoresCommand {
  constructor(private readonly logisticaFacade: LogisticaFacade) {}

  /**
   * Ejecuta el bucle del submenú interactivo de Proveedores.
   * Muestra opciones y delega al método de fachada apropiado.
   */
  async run(): Promise<void> {
    let back = false;

    while (!back) {
      const { option } = await inquirer.prompt<{ option: string }>([
        {
          type: 'list',
          name: 'option',
          message: (chalk as any).yellow('Proveedores - Seleccione una opcion:'),
          choices: [
            { name: '1. Generar orden de compra', value: 'generateOrder' },
            { name: '2. Registrar recepcion de orden', value: 'registerReception' },
            { name: '3. Consultar proveedores', value: 'listSuppliers' },
            new inquirer.Separator(),
            { name: '0. Volver al menu principal', value: 'back' },
          ],
        },
      ]);

      switch (option) {
        case 'generateOrder':
          await this.handleGeneratePurchaseOrder();
          break;
        case 'registerReception':
          await this.handleRegisterReception();
          break;
        case 'listSuppliers':
          await this.handleGetSuppliers();
          break;
        case 'back':
          back = true;
          break;
      }
    }
  }

  /**
   * Prompts for supplier ID and loops to collect order detail line items,
   * then generates the purchase order through the facade.
   * @private
   */
  private async handleGeneratePurchaseOrder(): Promise<void> {
    const { supplierId } = await inquirer.prompt<{ supplierId: number }>([
      {
        type: 'number',
        name: 'supplierId',
        message: 'ID del proveedor:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const details: GenerateOrderDetailInput[] = [];
    let addMore = true;

    while (addMore) {
      const detail = await inquirer.prompt<{
        productId: number;
        quantity: number;
        unitPrice: number;
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
        {
          type: 'number',
          name: 'unitPrice',
          message: 'Precio unitario:',
          validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
        },
      ]);

      details.push(detail);

      const { more } = await inquirer.prompt<{ more: boolean }>([
        {
          type: 'confirm',
          name: 'more',
          message: 'Agregar otro producto a la orden?',
          default: false,
        },
      ]);

      addMore = more;
    }

    const result = await this.logisticaFacade.generatePurchaseOrder({
      supplierId,
      details,
    });

    if (result.success) {
      console.log((chalk as any).green('\n  Orden de compra generada exitosamente:'));
      console.log((chalk as any).white(`    ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Proveedor ID: ${result.value.supplierId}`));
      console.log((chalk as any).white(`    Estado: ${result.value.status}`));
      console.log(
        (chalk as any).white(
          `    Total estimado: $${result.value.estimatedTotal.toLocaleString()}`,
        ),
      );
      console.log(
        (chalk as any).white(`    Detalles: ${result.value.details.length} linea(s)\n`),
      );
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Prompts for a purchase order ID and registers its reception.
   * @private
   */
  private async handleRegisterReception(): Promise<void> {
    const { orderId } = await inquirer.prompt<{ orderId: number }>([
      {
        type: 'number',
        name: 'orderId',
        message: 'ID de la orden de compra:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.logisticaFacade.registerReception(orderId);

    if (result.success) {
      console.log((chalk as any).green('\n  Recepcion registrada exitosamente:'));
      console.log((chalk as any).white(`    Orden ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Nuevo estado: ${result.value.status}\n`));
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Retrieves all suppliers and displays them in a formatted table.
   * @private
   */
  private async handleGetSuppliers(): Promise<void> {
    const result = await this.logisticaFacade.getSuppliers();

    if (!result.success) {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
      return;
    }

    const suppliers = result.value;

    if (suppliers.length === 0) {
      console.log((chalk as any).yellow('\n  No hay proveedores registrados.\n'));
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('ID'),
        (chalk as any).cyan('Nombre'),
        (chalk as any).cyan('Contacto'),
        (chalk as any).cyan('Telefono'),
      ],
    });

    for (const supplier of suppliers) {
      table.push([
        String(supplier.id),
        supplier.name,
        supplier.contact,
        supplier.phone,
      ]);
    }

    console.log('\n  Proveedores registrados:');
    console.log(table.toString());
    console.log('');
  }
}
