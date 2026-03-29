import { BaseEntity } from '../../../../shared/domain/entity.base';
import type { Sale } from './venta.entity';

/**
 * Seller domain entity representing a salesperson in the PoliMarket system.
 * Tracks the seller's identity, status, and associated sales.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Seller extends BaseEntity {
  /** Full name of the seller */
  name!: string;

  /** Unique identification number (e.g., national ID, employee code) */
  identification!: string;

  /** Whether the seller is currently active in the system */
  active!: boolean;

  /** Collection of sales made by this seller */
  sales!: Sale[];

  /**
   * Creates a new Seller domain entity.
   * @param props - Partial properties to initialize the seller with
   */
  constructor(props?: Partial<Seller>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
    if (!this.sales) {
      this.sales = [];
    }
    if (this.active === undefined) {
      this.active = true;
    }
  }
}
