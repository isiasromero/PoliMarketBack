import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * Product domain entity representing an item available in the PoliMarket system.
 * Contains core product information such as name, description, pricing, and category.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Product extends BaseEntity {
  /** Display name of the product */
  name!: string;

  /** Detailed description of the product */
  description!: string;

  /** Unit price of the product in the system's base currency */
  unitPrice!: number;

  /** Category classification for the product */
  category!: string;

  /** Primary supplier ID for auto-restocking (optional, defaults to ID 1 if not set) */
  primarySupplierId?: number;

  /**
   * Creates a new Product domain entity.
   * @param props - Partial properties to initialize the product with
   */
  constructor(props?: Partial<Product>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}
