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

/** Detail line item within the purchase order generation input */
export interface GenerateOrderDetailInput {
  /** ID of the product to order */
  productId: number;
  /** Number of units to order */
  quantity: number;
  /** Agreed price per unit */
  unitPrice: number;
}

/** Input DTO for the generate purchase order use case */
export interface GeneratePurchaseOrderInput {
  /** ID of the supplier to place the order with */
  supplierId: number;
  /** Line items included in the purchase order */
  details: GenerateOrderDetailInput[];
}

/**
 * Use case responsible for generating a new purchase order in the system.
 * Validates that the supplier exists before creating the order
 * with status SENT and all provided line-item details.
 */
@Injectable()
export class GeneratePurchaseOrderUseCase {
  constructor(
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly orderRepository: IPurchaseOrderRepository,
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Executes the purchase order generation process.
   * @param input - The supplier ID and array of detail line items
   * @returns A Result containing the persisted PurchaseOrder on success,
   *          or an error message if validation fails
   */
  async execute(
    input: GeneratePurchaseOrderInput,
  ): Promise<Result<PurchaseOrder>> {
    if (!input.details || input.details.length === 0) {
      return err('A purchase order must have at least one detail line item');
    }

    const supplier = await this.supplierRepository.findById(input.supplierId);
    if (!supplier) {
      return err(`Supplier with ID ${input.supplierId} not found`);
    }

    const order = new PurchaseOrder({
      supplierId: input.supplierId,
      date: new Date(),
      status: 'SENT',
    });

    for (const detail of input.details) {
      order.addDetail(detail.productId, detail.quantity, detail.unitPrice);
    }

    const saved = await this.orderRepository.save(order);
    return ok(saved);
  }
}
