import { BaseEntity } from '../../../../shared/domain/entity.base';
import { DeliveryItem } from './entrega-item.entity';

/** Allowed statuses for a delivery throughout its lifecycle */
export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

/**
 * Delivery domain entity representing a shipment of products to a destination.
 * A delivery is associated with a sale and contains one or more line-item products.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Delivery extends BaseEntity {
  /** ID of the sale that originated this delivery */
  saleId!: number;

  /** Date when the delivery is scheduled or was made */
  deliveryDate!: Date;

  /** Physical address where the delivery should be sent */
  destinationAddress!: string;

  /** Current status of the delivery in its lifecycle */
  status!: DeliveryStatus;

  /** Line items included in this delivery */
  items!: DeliveryItem[];

  /**
   * Creates a new Delivery domain entity.
   * @param props - Partial properties to initialize the delivery with
   */
  constructor(props?: Partial<Delivery>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
    if (!this.items) {
      this.items = [];
    }
    if (!this.deliveryDate) {
      this.deliveryDate = new Date();
    }
    if (!this.status) {
      this.status = 'PENDING';
    }
  }

  /**
   * Confirms the delivery, transitioning its status to DELIVERED.
   * Can only be called when the delivery is currently IN_TRANSIT.
   * @throws Error if the delivery is not in IN_TRANSIT status
   */
  confirmDelivery(): void {
    if (this.status !== 'IN_TRANSIT') {
      throw new Error(
        `Cannot confirm delivery: current status is ${this.status}, expected IN_TRANSIT`,
      );
    }
    this.status = 'DELIVERED';
  }

  /**
   * Cancels the delivery, transitioning its status to FAILED.
   * Can only be called when the delivery is PENDING or IN_TRANSIT.
   * @throws Error if the delivery is already DELIVERED or FAILED
   */
  cancel(): void {
    if (this.status === 'DELIVERED' || this.status === 'FAILED') {
      throw new Error(
        `Cannot cancel delivery: current status is ${this.status}`,
      );
    }
    this.status = 'FAILED';
  }

  /**
   * Marks the delivery as in transit, transitioning from PENDING to IN_TRANSIT.
   * Represents the moment the shipment leaves the warehouse.
   * @throws Error if the delivery is not in PENDING status
   */
  markInTransit(): void {
    if (this.status !== 'PENDING') {
      throw new Error(
        `Cannot mark as in transit: current status is ${this.status}, expected PENDING`,
      );
    }
    this.status = 'IN_TRANSIT';
  }
}
