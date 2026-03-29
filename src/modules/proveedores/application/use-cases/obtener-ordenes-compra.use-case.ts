import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { PurchaseOrder } from '../../domain/entities/orden-compra.entity';
import {
  IPurchaseOrderRepository,
  PURCHASE_ORDER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/orden-compra.repository.port';

/**
 * Use case responsible for retrieving all purchase orders in the system.
 * Returns the full list of PurchaseOrder domain entities.
 */
@Injectable()
export class GetPurchaseOrdersUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  /**
   * Executes the purchase orders listing operation.
   * @returns A Result containing an array of all PurchaseOrder entities
   */
  async execute(): Promise<Result<PurchaseOrder[]>> {
    const orders = await this.purchaseOrderRepository.findAll();
    return ok(orders);
  }
}
