import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * SaleDetail domain entity representing a single line item within a sale.
 * Each detail links a product to a sale with its quantity and unit price.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class SaleDetail extends BaseEntity {
  /** ID of the parent sale this detail belongs to */
  saleId!: number;

  /** ID of the product being sold */
  productId!: number;

  /** Number of units sold */
  quantity!: number;

  /** Price per unit at the time of sale */
  unitPrice!: number;

  /**
   * Creates a new SaleDetail domain entity.
   * @param props - Partial properties to initialize the detail with
   */
  constructor(props?: Partial<SaleDetail>) {
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
