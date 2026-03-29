import { Injectable } from '@nestjs/common';
import * as chalk from "chalk";;
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { LogisticaFacade } from '../../facades/logistica.facade';

/**
 * Controlador de comandos CLI para el módulo de Inventario (Bodega).
 * Proporciona un submenú interactivo para registrar entradas y salidas de stock,
 * y consultar productos que están por debajo del umbral de stock mínimo.
 */
@Injectable()
export class InventarioCommand {
  constructor(private readonly logisticaFacade: LogisticaFacade) {}

  /**
   * Ejecuta el bucle del submenú interactivo de Inventario.
   * Muestra opciones y delega al método de fachada apropiado.
   */
  async run(): Promise<void> {
    let back = false;

    while (!back) {
      const { option } = await inquirer.prompt<{ option: string }>([
        {
          type: 'list',
          name: 'option',
          message: (chalk as any).yellow('Inventario - Seleccione una opcion:'),
          choices: [
            { name: '1. Registrar entrada de producto', value: 'entry' },
            { name: '2. Registrar salida de producto', value: 'exit' },
            { name: '3. Consultar productos bajo stock', value: 'lowStock' },
            new inquirer.Separator(),
            { name: '0. Volver al menu principal', value: 'back' },
          ],
        },
      ]);

      switch (option) {
        case 'entry':
          await this.handleRegisterEntry();
          break;
        case 'exit':
          await this.handleRegisterExit();
          break;
        case 'lowStock':
          await this.handleCheckLowStock();
          break;
        case 'back':
          back = true;
          break;
      }
    }
  }

  /**
   * Prompts for product, warehouse, and quantity data then registers a stock entry.
   * @private
   */
  private async handleRegisterEntry(): Promise<void> {
    const answers = await inquirer.prompt<{
      productId: number;
      warehouseId: number;
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
        name: 'warehouseId',
        message: 'ID de la bodega:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'Cantidad a ingresar:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.logisticaFacade.registerEntry(
      answers.productId,
      answers.warehouseId,
      answers.quantity,
    );

    if (result.success) {
      console.log((chalk as any).green('\n  Entrada registrada exitosamente:'));
      console.log(
        (chalk as any).white(
          `    Producto ID: ${result.value.productId} | Bodega ID: ${result.value.warehouseId}`,
        ),
      );
      console.log(
        (chalk as any).white(
          `    Cantidad disponible ahora: ${result.value.availableQuantity}\n`,
        ),
      );
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Prompts for product, warehouse, and quantity data then registers a stock exit.
   * @private
   */
  private async handleRegisterExit(): Promise<void> {
    const answers = await inquirer.prompt<{
      productId: number;
      warehouseId: number;
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
        name: 'warehouseId',
        message: 'ID de la bodega:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'number',
        name: 'quantity',
        message: 'Cantidad a retirar:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.logisticaFacade.registerExit(
      answers.productId,
      answers.warehouseId,
      answers.quantity,
    );

    if (result.success) {
      console.log((chalk as any).green('\n  Salida registrada exitosamente:'));
      console.log(
        (chalk as any).white(
          `    Producto ID: ${result.value.productId} | Bodega ID: ${result.value.warehouseId}`,
        ),
      );
      console.log(
        (chalk as any).white(
          `    Cantidad disponible ahora: ${result.value.availableQuantity}\n`,
        ),
      );
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Retrieves and displays all products below their minimum stock level.
   * @private
   */
  private async handleCheckLowStock(): Promise<void> {
    const result = await this.logisticaFacade.checkLowStockProducts();

    if (!result.success) {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
      return;
    }

    const products = result.value;

    if (products.length === 0) {
      console.log(
        (chalk as any).green('\n  Todos los productos tienen stock suficiente.\n'),
      );
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('Stock ID'),
        (chalk as any).cyan('Producto ID'),
        (chalk as any).cyan('Bodega ID'),
        (chalk as any).cyan('Disponible'),
        (chalk as any).cyan('Minimo'),
        (chalk as any).cyan('Ubicacion'),
      ],
    });

    for (const stock of products) {
      table.push([
        String(stock.id),
        String(stock.productId),
        String(stock.warehouseId),
        (chalk as any).red(String(stock.availableQuantity)),
        String(stock.minimumQuantity),
        stock.shelfLocation || 'N/A',
      ]);
    }

    console.log('\n  Productos con stock bajo:');
    console.log(table.toString());
    console.log('');
  }
}
