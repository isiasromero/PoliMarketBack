import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/proveedor.repository.port';

/**
 * Use case responsible for deleting a supplier from the system.
 * Validates that the supplier exists before attempting deletion.
 */
@Injectable()
export class DeleteSupplierUseCase {
  constructor(
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Executes the supplier deletion operation.
   * @param id - The supplier ID to delete
   * @returns A Result containing success message or error message
   */
  async execute(id: number): Promise<Result<{ id: number; message: string }>> {
    // Validation: id is required
    if (!id || id <= 0) {
      return err('El ID del proveedor es requerido y debe ser válido');
    }

    // Verify supplier exists before deletion
    const existingSupplier = await this.supplierRepository.findById(id);
    if (!existingSupplier) {
      return err(`El proveedor con ID ${id} no existe`);
    }

    // Attempt to delete
    const deleted = await this.supplierRepository.delete(id);
    if (!deleted) {
      return err(`No se pudo eliminar el proveedor con ID ${id}`);
    }

    return ok({
      id,
      message: `El proveedor ${existingSupplier.getDisplayName()} ha sido eliminado correctamente`,
    });
  }
}
