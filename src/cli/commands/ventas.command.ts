import { Injectable } from '@nestjs/common';
import * as chalk from "chalk";;
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { VentasFacade } from '../../facades/ventas.facade';
import { RegisterSaleDetailInput } from '../../modules/ventas/application/use-cases/registrar-venta.use-case';

/**
 * Controlador de comandos CLI para el módulo de Ventas.
 * Proporciona un submenú interactivo para registrar ventas, consultar
 * clientes y ventas de vendedores, y verificar disponibilidad y stock de productos.
 */
@Injectable()
export class VentasCommand {
  constructor(private readonly ventasFacade: VentasFacade) {}

  /**
   * Ejecuta el bucle del submenú interactivo de Ventas.
   * Muestra opciones y delega al método de fachada apropiado.
   */
  async run(): Promise<void> {
    let back = false;

    while (!back) {
      const { option } = await inquirer.prompt<{ option: string }>([
        {
          type: 'list',
          name: 'option',
          message: (chalk as any).yellow('Ventas - Seleccione una opcion:'),
          choices: [
            { name: '1. Registrar venta', value: 'register' },
            { name: '2. Consultar clientes', value: 'clients' },
            { name: '3. Consultar ventas por vendedor', value: 'salesBySeller' },
            { name: '4. Consultar disponibilidad de producto', value: 'availability' },
            { name: '5. Verificar stock suficiente', value: 'stock' },
            new inquirer.Separator(),
            { name: '0. Volver al menu principal', value: 'back' },
          ],
        },
      ]);

      switch (option) {
        case 'register':
          await this.handleRegisterSale();
          break;
        case 'clients':
          await this.handleGetClients();
          break;
        case 'salesBySeller':
          await this.handleGetSalesBySeller();
          break;
        case 'availability':
          await this.handleCheckAvailability();
          break;
        case 'stock':
          await this.handleVerifySufficientStock();
          break;
        case 'back':
          back = true;
          break;
      }
    }
  }

  /**
   * Prompts for sale header data and loops to collect detail line items,
   * then registers the sale through the facade.
   * @private
   */
  private async handleRegisterSale(): Promise<void> {
    const header = await inquirer.prompt<{
      sellerId: number;
      clientId: number;
    }>([
      {
        type: 'number',
        name: 'sellerId',
        message: 'ID del vendedor:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'number',
        name: 'clientId',
        message: 'ID del cliente:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const details: RegisterSaleDetailInput[] = [];
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
          message: 'Agregar otro producto?',
          default: false,
        },
      ]);

      addMore = more;
    }

    const result = await this.ventasFacade.registerSale({
      sellerId: header.sellerId,
      clientId: header.clientId,
      details,
    });

    if (result.success) {
      console.log((chalk as any).green('\n  Venta registrada exitosamente:'));
      console.log((chalk as any).white(`    ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Estado: ${result.value.status}`));
      console.log(
        (chalk as any).white(`    Total: $${result.value.calculateTotal().toLocaleString()}`),
      );
      console.log(
        (chalk as any).white(`    Productos: ${result.value.details.length} linea(s)\n`),
      );
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Retrieves all clients and displays them in a formatted table.
   * @private
   */
  private async handleGetClients(): Promise<void> {
    const result = await this.ventasFacade.getClients();

    if (!result.success) {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
      return;
    }

    const clients = result.value;

    if (clients.length === 0) {
      console.log((chalk as any).yellow('\n  No hay clientes registrados.\n'));
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('ID'),
        (chalk as any).cyan('Nombre'),
        (chalk as any).cyan('Direccion'),
        (chalk as any).cyan('Telefono'),
      ],
    });

    for (const client of clients) {
      table.push([
        String(client.id),
        client.name,
        client.address,
        client.phone,
      ]);
    }

    console.log('\n  Clientes registrados:');
    console.log(table.toString());
    console.log('');
  }

  /**
   * Prompts for a seller ID and displays their sales in a table.
   * @private
   */
  private async handleGetSalesBySeller(): Promise<void> {
    const { sellerId } = await inquirer.prompt<{ sellerId: number }>([
      {
        type: 'number',
        name: 'sellerId',
        message: 'ID del vendedor:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.ventasFacade.getSalesBySeller(sellerId);

    if (!result.success) {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
      return;
    }

    const sales = result.value;

    if (sales.length === 0) {
      console.log(
        (chalk as any).yellow('\n  No se encontraron ventas para este vendedor.\n'),
      );
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('ID'),
        (chalk as any).cyan('Cliente ID'),
        (chalk as any).cyan('Fecha'),
        (chalk as any).cyan('Estado'),
        (chalk as any).cyan('Total'),
      ],
    });

    for (const sale of sales) {
      table.push([
        String(sale.id),
        String(sale.clientId),
        new Date(sale.date).toLocaleDateString(),
        sale.status,
        `$${sale.calculateTotal().toLocaleString()}`,
      ]);
    }

    console.log(`\n  Ventas del vendedor ${sellerId}:`);
    console.log(table.toString());
    console.log('');
  }

  /**
   * Prompts for a product ID and displays its stock availability across warehouses.
   * @private
   */
  private async handleCheckAvailability(): Promise<void> {
    const { productId } = await inquirer.prompt<{ productId: number }>([
      {
        type: 'number',
        name: 'productId',
        message: 'ID del producto:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.ventasFacade.checkAvailability(productId);

    if (!result.success) {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
      return;
    }

    const stocks = result.value;

    if (stocks.length === 0) {
      console.log(
        (chalk as any).yellow('\n  No se encontraron registros de stock para este producto.\n'),
      );
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('Stock ID'),
        (chalk as any).cyan('Bodega ID'),
        (chalk as any).cyan('Cant. Disponible'),
        (chalk as any).cyan('Cant. Minima'),
        (chalk as any).cyan('Ubicacion'),
      ],
    });

    for (const stock of stocks) {
      table.push([
        String(stock.id),
        String(stock.warehouseId),
        String(stock.availableQuantity),
        String(stock.minimumQuantity),
        stock.shelfLocation || 'N/A',
      ]);
    }

    console.log(`\n  Disponibilidad del producto ${productId}:`);
    console.log(table.toString());
    console.log('');
  }

  /**
   * Prompts for a product ID and quantity, then checks if stock is sufficient.
   * @private
   */
  private async handleVerifySufficientStock(): Promise<void> {
    const answers = await inquirer.prompt<{
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
        message: 'Cantidad requerida:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.ventasFacade.verifySufficientStock(
      answers.productId,
      answers.quantity,
    );

    if (result.success) {
      if (result.value) {
        console.log(
          (chalk as any).green(
            `\n  Stock SUFICIENTE para ${answers.quantity} unidad(es) del producto ${answers.productId}.\n`,
          ),
        );
      } else {
        console.log(
          (chalk as any).red(
            `\n  Stock INSUFICIENTE para ${answers.quantity} unidad(es) del producto ${answers.productId}.\n`,
          ),
        );
      }
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }
}
