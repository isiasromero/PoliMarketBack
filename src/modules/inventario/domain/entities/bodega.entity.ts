import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * Warehouse domain entity representing a physical storage location
 * within the PoliMarket system. Each warehouse has a name and a
 * physical location descriptor.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Warehouse extends BaseEntity {
  /** Display name of the warehouse */
  name!: string;

  /** Physical location or address of the warehouse */
  location!: string;

  /**
   * Creates a new Warehouse domain entity.
   * @param props - Partial properties to initialize the warehouse with
   */
  constructor(props?: Partial<Warehouse>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }
}
