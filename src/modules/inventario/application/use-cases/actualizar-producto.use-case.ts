import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Product } from '../../domain/entities/producto.entity';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';

/**
 * DTO for updating a product
 */
export interface UpdateProductInput {
  id: number;
  name?: string;
  description?: string;
  unitPrice?: number;
  category?: string;
  primarySupplierId?: number;
}

/**
 * Use case responsible for updating an existing product in the system.
 * Validates input data and persists the updated product to the repository.
 */
@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * Executes the product update operation.
   * @param input - The product data to update (id is required, other fields optional)
   * @returns A Result containing the updated Product entity or error message
   */
  async execute(input: UpdateProductInput): Promise<Result<Product>> {
    // Validation: id is required
    if (!input.id || input.id <= 0) {
      return err('El ID del producto es requerido y debe ser válido');
    }

    // Find existing product
    const existingProduct = await this.productRepository.findById(input.id);
    if (!existingProduct) {
      return err(`El producto con ID ${input.id} no existe`);
    }

    // Validation: if name is provided, it must not be empty
    if (input.name !== undefined && input.name.trim().length === 0) {
      return err('El nombre del producto no puede estar vacío');
    }

    // Validation: if description is provided, it must not be empty
    if (input.description !== undefined && input.description.trim().length === 0) {
      return err('La descripción del producto no puede estar vacía');
    }

    // Validation: if unitPrice is provided, it must be non-negative
    if (input.unitPrice !== undefined && input.unitPrice < 0) {
      return err('El precio unitario no puede ser negativo');
    }

    // Validation: if category is provided, it must not be empty
    if (input.category !== undefined && input.category.trim().length === 0) {
      return err('La categoría del producto no puede estar vacía');
    }

    // Update only provided fields
    if (input.name !== undefined) {
      existingProduct.name = input.name.trim();
    }
    if (input.description !== undefined) {
      existingProduct.description = input.description.trim();
    }
    if (input.unitPrice !== undefined) {
      existingProduct.unitPrice = input.unitPrice;
    }
    if (input.category !== undefined) {
      existingProduct.category = input.category.trim();
    }
    if (input.primarySupplierId !== undefined) {
      existingProduct.primarySupplierId = input.primarySupplierId;
    }

    // Persist updated product
    const updatedProduct = await this.productRepository.save(existingProduct);
    return ok(updatedProduct);
  }
}
