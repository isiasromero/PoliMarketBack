import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Supplier } from '../../domain/entities/proveedor.entity';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/proveedor.repository.port';

/**
 * DTO for creating a new supplier
 */
export interface CreateSupplierInput {
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
}

/**
 * Use case responsible for creating a new supplier in the system.
 * Validates input data and persists the supplier to the repository.
 */
@Injectable()
export class CreateSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Executes the supplier creation operation.
   * @param input - The supplier data to create
   * @returns A Result containing the created Supplier entity or error message
   */
  async execute(input: CreateSupplierInput): Promise<Result<Supplier>> {
    // Validation: name is required and not empty
    if (!input.name || input.name.trim().length === 0) {
      return err('El nombre del proveedor es requerido');
    }

    // Validation: contact is required
    if (!input.contact || input.contact.trim().length === 0) {
      return err('El contacto del proveedor es requerido');
    }

    // Validation: phone is required
    if (!input.phone || input.phone.trim().length === 0) {
      return err('El teléfono del proveedor es requerido');
    }

    // Create the supplier entity
    const supplier = new Supplier({
      name: input.name.trim(),
      contact: input.contact.trim(),
      phone: input.phone.trim(),
    });

    // Persist to repository
    const savedSupplier = await this.supplierRepository.save(supplier);
    return ok(savedSupplier);
  }
}
