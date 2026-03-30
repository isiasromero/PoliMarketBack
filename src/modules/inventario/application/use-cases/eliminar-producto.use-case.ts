import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';

/**
 * Use case responsible for deleting a product from the system.
 * Cascades deletion to all associated stock records first,
 * then deletes the product itself.
 */
@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  /**
   * Executes the product deletion operation.
   * First deletes all stock records for the product,
   * then deletes the product itself.
   *
   * @param id - The product ID to delete
   * @returns A Result containing success message or error message
   */
  async execute(id: number): Promise<Result<{ id: number; message: string }>> {
    // Validation: id is required
    if (!id || id <= 0) {
      return err('El ID del producto es requerido y debe ser válido');
    }

    // Verify product exists before deletion
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      return err(`El producto con ID ${id} no existe`);
    }

    // Step 1: Delete all stock records for this product (cascade delete)
    const allStock = await this.stockProductRepository.findByProductId(id);
    for (const stockRecord of allStock) {
      await this.stockProductRepository.delete(stockRecord.id);
    }

    // Step 2: Delete the product
    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      return err(`No se pudo eliminar el producto con ID ${id}`);
    }

    return ok({
      id,
      message: `El producto '${existingProduct.name}' ha sido eliminado correctamente`,
    });
  }
}
