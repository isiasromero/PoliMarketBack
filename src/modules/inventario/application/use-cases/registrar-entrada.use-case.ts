import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
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

/**
 * Use case for registering a stock entry (incoming inventory).
 * Increases the available quantity of a product in a specific warehouse.
 * If no stock record exists for the product-warehouse combination,
 * a new record is created.
 */
@Injectable()
export class RegisterEntryUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(WAREHOUSE_REPOSITORY_TOKEN)
    private readonly warehouseRepository: IWarehouseRepository,
  ) {}

  /**
   * Registers an incoming stock entry for a product in a warehouse.
   * @param productId - The ID of the product receiving stock
   * @param warehouseId - The ID of the warehouse where stock is being added
   * @param quantity - The quantity to add (must be positive)
   * @returns A Result containing the updated StockProduct on success,
   *          or an error message on failure
   */
  async execute(
    productId: number,
    warehouseId: number,
    quantity: number,
  ): Promise<Result<StockProduct>> {
    if (quantity <= 0) {
      return err('Entry quantity must be a positive number');
    }

    // Validar que el producto existe
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return err(`Product with ID ${productId} not found`);
    }

    // Validar que la bodega existe
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      return err(`Warehouse with ID ${warehouseId} not found`);
    }

    let stockProduct =
      await this.stockProductRepository.findByProductAndWarehouse(
        productId,
        warehouseId,
      );

    if (!stockProduct) {
      stockProduct = new StockProduct({
        productId,
        warehouseId,
        availableQuantity: 0,
        minimumQuantity: 0,
        shelfLocation: '',
      });
    }

    stockProduct.updateQuantity(quantity);

    const saved = await this.stockProductRepository.save(stockProduct);
    return ok(saved);
  }
}
