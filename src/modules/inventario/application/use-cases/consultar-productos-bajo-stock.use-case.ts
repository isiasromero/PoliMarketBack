import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { StockProduct } from '../../domain/entities/stock-producto.entity';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';

/**
 * Use case for querying all products that are at or below their minimum stock level.
 * Returns a list of StockProduct records that need restocking attention.
 */
@Injectable()
export class CheckLowStockProductsUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  /**
   * Retrieves all stock products where available quantity is at or below minimum quantity.
   * @returns A Result containing an array of StockProduct entities that need restocking
   */
  async execute(): Promise<Result<StockProduct[]>> {
    const lowStockProducts =
      await this.stockProductRepository.findBelowMinimum();
    return ok(lowStockProducts);
  }
}
