import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { StockProduct } from '../../domain/entities/stock-producto.entity';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';

/**
 * Use case for retrieving stock information for all products across warehouses.
 * Returns a complete list of StockProduct entities showing availability by warehouse.
 */
@Injectable()
export class ObtenerStockUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  /**
   * Executes the retrieval of all stock records.
   * @returns A Result containing an array of all StockProduct entities
   */
  async execute(): Promise<Result<StockProduct[]>> {
    const stock = await this.stockProductRepository.findAll();
    return ok(stock);
  }
}
