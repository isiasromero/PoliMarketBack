import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * Supplier domain entity representing a vendor/provider in the PoliMarket system.
 * Stores basic identification and contact information for the supplier.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Supplier extends BaseEntity {
  /** Full name or business name of the supplier */
  name!: string;

  /** Contact person or email address */
  contact!: string;

  /** Contact phone number */
  phone!: string;

  /** Optional email address */
  email?: string;

  /** Optional physical address */
  address?: string;

  /**
   * Creates a new Supplier domain entity.
   * @param props - Partial properties to initialize the supplier with
   */
  constructor(props?: Partial<Supplier>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }

  /**
   * Returns the display name of the supplier trimmed of whitespace.
   * @returns The supplier's name trimmed of leading/trailing whitespace
   */
  getDisplayName(): string {
    return this.name?.trim() ?? '';
  }
}
