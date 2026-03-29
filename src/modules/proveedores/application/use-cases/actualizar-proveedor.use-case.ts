import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Supplier } from '../../domain/entities/proveedor.entity';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/proveedor.repository.port';

/**
 * DTO for updating a supplier
 */
export interface UpdateSupplierInput {
  id: number;
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Use case responsible for updating an existing supplier in the system.
 * Validates input data and persists the updated supplier to the repository.
 */
@Injectable()
export class UpdateSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Executes the supplier update operation.
   * @param input - The supplier data to update (id is required, other fields optional)
   * @returns A Result containing the updated Supplier entity or error message
   */
  async execute(input: UpdateSupplierInput): Promise<Result<Supplier>> {
    // Validation: id is required
    if (!input.id || input.id <= 0) {
      return err('El ID del proveedor es requerido y debe ser válido');
    }

    // Find existing supplier
    const existingSupplier = await this.supplierRepository.findById(input.id);
    if (!existingSupplier) {
      return err(`El proveedor con ID ${input.id} no existe`);
    }

    // Validation: if name is provided, it must not be empty
    if (input.name !== undefined && input.name.trim().length === 0) {
      return err('El nombre del proveedor no puede estar vacío');
    }

    // Validation: if contact is provided, it must not be empty
    if (input.contact !== undefined && input.contact.trim().length === 0) {
      return err('El contacto del proveedor no puede estar vacío');
    }

    // Validation: if phone is provided, it must not be empty
    if (input.phone !== undefined && input.phone.trim().length === 0) {
      return err('El teléfono del proveedor no puede estar vacío');
    }

    // Update only provided fields
    if (input.name !== undefined) {
      existingSupplier.name = input.name.trim();
    }
    if (input.contact !== undefined) {
      existingSupplier.contact = input.contact.trim();
    }
    if (input.phone !== undefined) {
      existingSupplier.phone = input.phone.trim();
    }
    if (input.email !== undefined) {
      existingSupplier.email = input.email.trim();
    }
    if (input.address !== undefined) {
      existingSupplier.address = input.address.trim();
    }

    // Persist updated supplier
    const updatedSupplier = await this.supplierRepository.save(existingSupplier);
    return ok(updatedSupplier);
  }
}
