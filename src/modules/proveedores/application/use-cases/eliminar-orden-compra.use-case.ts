import { Inject, Injectable } from '@nestjs/common';
import { Result, err, ok } from '../../../../shared/domain/result';
import {
  IPurchaseOrderRepository,
  PURCHASE_ORDER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/orden-compra.repository.port';

/**
 * Use case responsible for deleting a purchase order by its ID.
 * Validates that the order exists before attempting deletion.
 */
@Injectable()
export class EliminarOrdenCompraUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  /**
   * Executes the purchase order deletion operation.
   * @param id - The ID of the purchase order to delete
   * @returns A Result containing a success message if deleted,
   *          or an error message if the order is not found
   */
  async execute(id: number): Promise<Result<{ id: number; message: string }>> {
    // Validate order exists
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) {
      return err('Orden de compra no encontrada');
    }

    // Delete the order
    const deleted = await this.purchaseOrderRepository.delete(id);
    if (!deleted) {
      return err('No se pudo eliminar la orden de compra');
    }

    return ok({
      id,
      message: 'Orden de compra eliminada exitosamente',
    });
  }
}
