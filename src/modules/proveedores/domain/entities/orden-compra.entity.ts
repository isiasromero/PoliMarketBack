import { BaseEntity } from '../../../../shared/domain/entity.base';
import { PurchaseOrderDetail } from './detalle-orden-compra.entity';

/** Allowed statuses for a purchase order throughout its lifecycle */
export type PurchaseOrderStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';

/**
 * PurchaseOrder domain entity representing an order placed to a supplier
 * in the PoliMarket system. A purchase order is associated with a supplier
 * and contains one or more line-item details specifying products, quantities,
 * and agreed prices.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class PurchaseOrder extends BaseEntity {
  /** ID of the supplier this order is placed with */
  supplierId!: number;

  /** Name of the supplier (populated from supplier relation) */
  supplierName?: string;

  /** Date when the order was created or placed */
  date!: Date;

  /** Current status of the purchase order in its lifecycle */
  status!: PurchaseOrderStatus;

  /** Estimated total cost of the order, computed from its details */
  estimatedTotal!: number;

  /** Line items included in this purchase order */
  details!: PurchaseOrderDetail[];

  /**
   * Creates a new PurchaseOrder domain entity.
   * @param props - Partial properties to initialize the order with
   */
  constructor(props?: Partial<PurchaseOrder>) {
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
      this.status = 'DRAFT';
    }
    if (!this.estimatedTotal) {
      this.estimatedTotal = 0;
    }
  }

  /**
   * Transitions the purchase order status to SENT, indicating it has been
   * approved and dispatched to the supplier.
   * Only orders in DRAFT status can be approved.
   * @returns true if the status was changed, false if the transition is invalid
   */
  approve(): boolean {
    if (this.status !== 'DRAFT') {
      return false;
    }
    this.status = 'SENT';
    return true;
  }

  /**
   * Transitions the purchase order status to CANCELLED, indicating
   * the order has been rejected or voided.
   * Only orders in DRAFT or SENT status can be rejected.
   * @returns true if the status was changed, false if the transition is invalid
   */
  reject(): boolean {
    if (this.status !== 'DRAFT' && this.status !== 'SENT') {
      return false;
    }
    this.status = 'CANCELLED';
    return true;
  }

  /**
   * Adds a new line-item detail to the purchase order and recalculates the total.
   * @param productId - The ID of the product to add
   * @param quantity - The number of units to order
   * @param unitPrice - The agreed price per unit
   */
  addDetail(productId: number, quantity: number, unitPrice: number): void {
    const detail = new PurchaseOrderDetail({
      productId,
      quantity,
      unitPrice,
    });
    this.details.push(detail);
    this.estimatedTotal = this.calculateTotal();
  }

  /**
   * Calculates the total estimated cost by summing all detail subtotals.
   * @returns The total amount for all line items in the order
   */
  calculateTotal(): number {
    return this.details.reduce(
      (total, detail) => total + detail.calculateSubtotal(),
      0,
    );
  }
}
