import { BaseEntity } from '../../../../shared/domain/entity.base';
import { SaleDetail } from './detalle-venta.entity';

/** Allowed statuses for a sale throughout its lifecycle */
export type SaleStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';

/**
 * Sale domain entity representing a commercial transaction in the PoliMarket system.
 * A sale is associated with a seller, a client, and contains one or more line-item details.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Sale extends BaseEntity {
  /** ID of the seller who made this sale */
  sellerId!: number;

  /** ID of the client who purchased */
  clientId!: number;

  /** Date when the sale was made */
  date!: Date;

  /** Current status of the sale in its lifecycle */
  status!: SaleStatus;

  /** Line items included in this sale */
  details!: SaleDetail[];

  /**
   * Creates a new Sale domain entity.
   * @param props - Partial properties to initialize the sale with
   */
  constructor(props?: Partial<Sale>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
    if (!this.details) {
      this.details = [];
    }
    if (!this.date) {
      this.date = new Date();
    }
    if (!this.status) {
      this.status = 'PENDING';
    }
  }

  /**
   * Calculates the total monetary value of the sale by summing all detail subtotals.
   * @returns The total amount for all line items in the sale
   */
  calculateTotal(): number {
    return this.details.reduce(
      (total, detail) => total + detail.calculateSubtotal(),
      0,
    );
  }

  /**
   * Adds a new line-item detail to the sale.
   * @param productId - The ID of the product to add
   * @param quantity - The number of units
   * @param unitPrice - The price per unit
   */
  addDetail(productId: number, quantity: number, unitPrice: number): void {
    const detail = new SaleDetail({
      productId,
      quantity,
      unitPrice,
    });
    this.details.push(detail);
  }

  /**
   * Generates a summary object with the delivery-relevant data for this sale.
   * Useful for creating delivery slips or logistics manifests.
   * @returns An object containing sale ID, client ID, date, status, total,
   *          and the count of line items
   */
  generateDeliveryData(): {
    saleId: number;
    clientId: number;
    date: Date;
    status: SaleStatus;
    total: number;
    itemCount: number;
  } {
    return {
      saleId: this.id,
      clientId: this.clientId,
      date: this.date,
      status: this.status,
      total: this.calculateTotal(),
      itemCount: this.details.length,
    };
  }
}
