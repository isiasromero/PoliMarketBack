import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * StockProduct domain entity representing the inventory level of a
 * specific product within a specific warehouse. Tracks available quantity,
 * minimum quantity thresholds, and shelf location.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class StockProduct extends BaseEntity {
  /** Foreign key reference to the associated Product */
  productId!: number;

  /** Foreign key reference to the associated Warehouse */
  warehouseId!: number;

  /** Current available quantity in stock */
  availableQuantity!: number;

  /** Minimum quantity threshold; stock at or below this level needs restocking */
  minimumQuantity!: number;

  /** Physical shelf or aisle location within the warehouse */
  shelfLocation!: string;

  /**
   * Creates a new StockProduct domain entity.
   * @param props - Partial properties to initialize the stock product with
   */
  constructor(props?: Partial<StockProduct>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }

  /**
   * Determines whether this stock product needs restocking.
   * A product needs restocking when its available quantity is at or below
   * the configured minimum quantity threshold.
   * @returns true if available quantity is less than or equal to minimum quantity
   */
  needsRestocking(): boolean {
    return this.availableQuantity <= this.minimumQuantity;
  }

  /**
   * Updates the available quantity by applying a delta (positive or negative).
   * A positive delta increases stock (entry), a negative delta decreases stock (exit).
   * @param delta - The amount to add (positive) or subtract (negative) from available quantity
   * @throws Error if the resulting quantity would be negative
   */
  updateQuantity(delta: number): void {
    const newQuantity = this.availableQuantity + delta;
    if (newQuantity < 0) {
      throw new Error(
        `Insufficient stock: available=${this.availableQuantity}, requested delta=${delta}`,
      );
    }
    this.availableQuantity = newQuantity;
  }
}
