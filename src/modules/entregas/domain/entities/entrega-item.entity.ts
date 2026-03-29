import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * DeliveryItem domain entity representing a single line item within a delivery.
 * Each item links a product to a delivery with its quantity.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class DeliveryItem extends BaseEntity {
  /** ID of the parent delivery this item belongs to */
  deliveryId!: number;

  /** ID of the product being delivered */
  productId!: number;

  /** Number of units to deliver */
  quantity!: number;

  /**
   * Creates a new DeliveryItem domain entity.
   * @param props - Partial properties to initialize the item with
   */
  constructor(props?: Partial<DeliveryItem>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}
