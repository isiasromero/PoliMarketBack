import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { PurchaseOrder } from '../../domain/entities/orden-compra.entity';
import {
  IPurchaseOrderRepository,
  PURCHASE_ORDER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/orden-compra.repository.port';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/proveedor.repository.port';

/** Detail line item within the purchase order update input */
export interface UpdateOrderDetailInput {
  /** ID of the product to order */
  productId: number;
  /** Number of units to order */
  quantity: number;
  /** Agreed price per unit */
  unitPrice: number;
}

/** Input DTO for the update purchase order use case */
export interface UpdatePurchaseOrderInput {
  /** ID of the purchase order to update */
  orderId: number;
  /** ID of the supplier to place the order with */
  supplierId: number;
  /** Line items included in the purchase order */
  details: UpdateOrderDetailInput[];
}

/**
 * Use case responsible for updating an existing purchase order in the system.
 * Validates that the order and supplier exist before updating.
 * Only allows updating orders that are not yet RECEIVED.
 */
@Injectable()
export class ActualizarOrdenCompraUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly orderRepository: IPurchaseOrderRepository,
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Executes the purchase order update process.
   * @param input - The order ID, supplier ID and array of detail line items
   * @returns A Result containing the updated PurchaseOrder on success,
   *          or an error message if validation fails
   */
  async execute(
    input: UpdatePurchaseOrderInput,
  ): Promise<Result<PurchaseOrder>> {
    // Validate details
    if (!input.details || input.details.length === 0) {
      return err('A purchase order must have at least one detail line item');
    }

    // Find and validate order exists
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      return err(`Purchase order with ID ${input.orderId} not found`);
    }

    // Prevent updating received orders
    if (order.status === 'RECEIVED') {
      return err('Cannot update a purchase order that has already been received');
    }

    // Find and validate supplier exists
    const supplier = await this.supplierRepository.findById(input.supplierId);
    if (!supplier) {
      return err(`Supplier with ID ${input.supplierId} not found`);
    }

    // Update order with new data
    order.supplierId = input.supplierId;
    order.details = input.details.map((detail: any) => ({
      productId: detail.productId,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
    })) as any;

    // Persist updated order
    try {
      const result = await this.orderRepository.save(order);
      return ok(result);
    } catch (error) {
      return err('Failed to update purchase order');
    }
  }
}
