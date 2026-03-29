import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { Product } from '../../domain/entities/producto.entity';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';

/**
 * Use case for retrieving all products from the inventory.
 * Returns a complete list of all Product entities in the system.
 */
@Injectable()
export class ObtenerProductosUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Executes the retrieval of all products.
   * @returns A Result containing an array of all Product entities
   */
  async execute(): Promise<Result<Product[]>> {
    const products = await this.productRepository.findAll();
    return ok(products);
  }
}
