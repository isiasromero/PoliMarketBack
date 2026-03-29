import { BaseEntity } from '../../../../shared/domain/entity.base';

/**
 * Client domain entity representing a customer in the PoliMarket system.
 * Stores basic contact and identification information for the client.
 * This is a pure domain object with no infrastructure dependencies.
 */
export class Client extends BaseEntity {
  /** Full name of the client */
  name!: string;

  /** Physical or mailing address of the client */
  address!: string;

  /** Contact phone number */
  phone!: string;

  /** Client identification (cédula, NIT, pasaporte, etc.) */
  identification!: string;

  /**
   * Creates a new Client domain entity.
   * @param props - Partial properties to initialize the client with
   */
  constructor(props?: Partial<Client>) {
    super();
    if (props) {
      Object.assign(this, props);
    }
  }

  /**
   * Returns the full display name of the client.
   * @returns The client's full name trimmed of whitespace
   */
  getFullName(): string {
    return this.name?.trim() ?? '';
  }
}
