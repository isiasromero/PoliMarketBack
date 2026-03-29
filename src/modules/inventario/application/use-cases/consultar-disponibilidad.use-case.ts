import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { StockProduct } from '../../domain/entities/stock-producto.entity';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';

/**
 * Use case for checking the availability of a product across all warehouses.
 * Retrieves all stock records associated with the given product ID.
 */
@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  /**
   * Executes the availability check for a given product.
   * @param productId - The ID of the product to check availability for
   * @returns A Result containing an array of StockProduct records on success,
   *          or an error message if no stock records are found
   */
  async execute(productId: number): Promise<Result<StockProduct[]>> {
    const allStock = await this.stockProductRepository.findAll();
    const productStock = allStock.filter(
      (stock) => stock.productId === productId,
    );

    if (productStock.length === 0) {
      return err(`No stock records found for product with ID ${productId}`);
    }

    return ok(productStock);
  }
}
