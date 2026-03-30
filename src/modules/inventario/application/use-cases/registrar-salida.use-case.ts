import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { TransactionService } from '../../../../shared/infrastructure/database/transaction.service';
import { StockProduct } from '../../domain/entities/stock-producto.entity';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';
import {
  IWarehouseRepository,
  WAREHOUSE_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/bodega.repository.port';
import { AutoGeneratePurchaseOrderUseCase } from './auto-generar-orden-compra.use-case';

/**
 * Use case for registering a stock exit (outgoing inventory).
 * Decreases the available quantity of a product in a specific warehouse.
 * Validates that sufficient stock exists before performing the operation.
 *
 * BONUS FEATURE (RF04): Si después de decrementar el stock, este queda por
 * debajo del mínimo configurado, este use case automáticamente dispara la
 * creación de una orden de compra para reabastecer el inventario.
 *
 * Workflow:
 * 1. Validar que la cantidad sea positiva
 * 2. Buscar el registro de stock
 * 3. Validar que hay stock suficiente
 * 4. Decrementar el stock
 * 5. Si stock < mínimo: AUTO-GENERAR ORDEN DE COMPRA
 * 6. Persistir cambios
 */
@Injectable()
export class RegisterExitUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(WAREHOUSE_REPOSITORY_TOKEN)
    private readonly warehouseRepository: IWarehouseRepository,
    private readonly autoGeneratePurchaseOrderUseCase: AutoGeneratePurchaseOrderUseCase,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Registers an outgoing stock exit for a product in a warehouse.
   * Automatically triggers purchase order generation if stock drops below minimum.
   *
   * @param productId - The ID of the product being withdrawn
   * @param warehouseId - The ID of the warehouse where stock is being removed
   * @param quantity - The quantity to remove (must be positive)
   * @returns A Result containing the updated StockProduct on success,
   *          or an error message if stock is insufficient or not found
   */
  async execute(
    productId: number,
    warehouseId: number,
    quantity: number,
  ): Promise<Result<StockProduct>> {
    // VALIDACIÓN 1: Verificar que la cantidad a retirar sea positiva
    if (quantity <= 0) {
      return err('Exit quantity must be a positive number');
    }

    // VALIDACIÓN 2: Verificar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return err(`Product with ID ${productId} not found`);
    }

    // VALIDACIÓN 3: Verificar que la bodega existe
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      return err(`Warehouse with ID ${warehouseId} not found`);
    }

    // BÚSQUEDA: Obtener el registro de stock del producto en la bodega
    const stockProduct =
      await this.stockProductRepository.findByProductAndWarehouse(
        productId,
        warehouseId,
      );

    if (!stockProduct) {
      return err(
        `No stock record found for product ${productId} in warehouse ${warehouseId}`,
      );
    }

    // VALIDACIÓN 4: Verificar que hay stock suficiente
    if (stockProduct.availableQuantity < quantity) {
      return err(
        `Insufficient stock: available=${stockProduct.availableQuantity}, requested=${quantity}`,
      );
    }

    // DECREMENTO + AUTO-REABASTECIMIENTO (RF04): Wrappear en transacción
    // Si el stock quedó por debajo del mínimo, automáticamente crear orden de compra.
    // Si la orden falla, revertir el decremento de stock (rollback transaccional).
    try {
      const saved = await this.transactionService.executeInTransaction(async () => {
        // 1. DECREMENTO: Restar la cantidad del stock disponible
        stockProduct.updateQuantity(-quantity);

        // 2. PERSISTENCIA: Guardar los cambios de stock en la base de datos
        const persisted = await this.stockProductRepository.save(stockProduct);

        // 3. AUTO-REABASTECIMIENTO: Si el stock quedó por debajo del mínimo,
        // automáticamente crear una orden de compra con el proveedor principal
        if (persisted.needsRestocking()) {
          const purchaseOrderResult =
            await this.autoGeneratePurchaseOrderUseCase.execute(productId, warehouseId);

          // Si la generación de orden falla, lanzar excepción para que se haga rollback
          // del decremento de stock (garantiza consistencia transaccional)
          if (!purchaseOrderResult.success) {
            throw new Error(
              `[INVENTORY AUTO-RESTOCK] Failed to auto-generate purchase order for product ${productId}: ` +
              purchaseOrderResult.error,
            );
          } else {
            console.log(
              `[INVENTORY AUTO-RESTOCK] Purchase order auto-generated for product ${productId}`,
            );
          }
        }

        return persisted;
      });

      return ok(saved);
    } catch (error) {
      // La transacción falló: decremento + auto-PO no se completaron atomicamente
      // El error incluye detalles del por qué falló (orden de compra no pudo generarse)
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[INVENTORY TRANSACTION ERROR] ${errorMessage}`);
      return err(errorMessage);
    }
  }
}
