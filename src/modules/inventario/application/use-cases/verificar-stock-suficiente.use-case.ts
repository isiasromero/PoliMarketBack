import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';

/**
 * Use case for verifying whether sufficient stock exists for a product.
 * Checks the total available quantity across all warehouses against a
 * requested quantity.
 */
@Injectable()
export class VerifySufficientStockUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  /**
   * Verifies if the total available stock for a product meets the requested quantity.
   * @param productId - The ID of the product to verify stock for
   * @param quantity - The required quantity to check against
   * @returns A Result containing true if sufficient stock exists, false otherwise;
   *          or an error message if the product has no stock records
   */
  async execute(
    productId: number,
    quantity: number,
  ): Promise<Result<boolean>> {
    const allStock = await this.stockProductRepository.findAll();
    const productStock = allStock.filter(
      (stock) => stock.productId === productId,
    );

    if (productStock.length === 0) {
      return err(`No stock records found for product with ID ${productId}`);
    }

    const totalAvailable = productStock.reduce(
      (sum, stock) => sum + stock.availableQuantity,
      0,
    );

    return ok(totalAvailable >= quantity);
  }
}
