import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * PurchaseOrderDetail domain entity representing a single line item
 * within a purchase order in the PoliMarket system.
 * Each detail links a product to a purchase order with its quantity and unit price.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class PurchaseOrderDetail extends BaseEntity {
  /** ID of the parent purchase order this detail belongs to */
  orderId!: number;

  /** ID of the product being ordered */
  productId!: number;

  /** Number of units ordered */
  quantity!: number;

  /** Price per unit agreed with the supplier */
  unitPrice!: number;

  /**
   * Creates a new PurchaseOrderDetail domain entity.
   * @param props - Partial properties to initialize the detail with
   */
  constructor(props?: Partial<PurchaseOrderDetail>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }

  /**
   * Calculates the subtotal for this line item.
   * @returns The product of quantity and unit price
   */
  calculateSubtotal(): number {
    return this.quantity * this.unitPrice;
  }
}
