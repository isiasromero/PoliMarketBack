import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';

/**
 * Use case responsible for deleting a product from the system.
 * Validates that the product exists before attempting deletion.
 */
@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Executes the product deletion operation.
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

    // Attempt to delete
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
