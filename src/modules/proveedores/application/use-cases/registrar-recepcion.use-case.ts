import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { PurchaseOrder } from '../../domain/entities/orden-compra.entity';
import {
  IPurchaseOrderRepository,
  PURCHASE_ORDER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/orden-compra.repository.port';

/** Input DTO for the register reception use case */
export interface RegisterReceptionInput {
  /** ID of the purchase order being received */
  orderId: number;
}

/**
 * Use case responsible for registering the reception of a purchase order.
 * Finds the order and transitions its status to RECEIVED, indicating
 * that the goods have been physically received from the supplier.
 */
@Injectable()
export class RegisterReceptionUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly orderRepository: IPurchaseOrderRepository,
  ) {}

  /**
   * Executes the reception registration process.
   * @param input - The purchase order ID to mark as received
   * @returns A Result containing the updated PurchaseOrder on success,
   *          or an error message if the order is not found or cannot be received
   */
  async execute(input: RegisterReceptionInput): Promise<Result<PurchaseOrder>> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      return err(`Purchase order with ID ${input.orderId} not found`);
    }

    if (order.status !== 'SENT') {
      return err(
        `Purchase order with ID ${input.orderId} cannot be received because its status is ${order.status}. Only orders with status SENT can be received.`,
      );
    }

    order.status = 'RECEIVED';

    const saved = await this.orderRepository.save(order);
    return ok(saved);
  }
}
