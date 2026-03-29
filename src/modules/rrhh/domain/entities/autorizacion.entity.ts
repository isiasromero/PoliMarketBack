import { BaseEntity } from '../../../../shared/domain/entity.base';

/** Possible statuses for an authorization */
export type AuthorizationStatus = 'ACTIVE' | 'REVOKED';

/**
 * Domain entity representing an authorization granted by an HR employee
 * to a seller, allowing access to a specific target system.
 *
 * An authorization links an HR employee (who grants it), a seller
 * (who receives it), and the target system the seller is authorized to access.
 */
export class Authorization extends BaseEntity {
  /** ID of the HR employee who granted this authorization */
  employeeId!: number;

  /** ID of the seller who received this authorization */
  sellerId!: number;

  /** Name of the target system the seller is authorized to access */
  targetSystem!: string;

  /** Date when the authorization was granted */
  authorizationDate!: Date;

  /** Current status of the authorization */
  status!: AuthorizationStatus;

  /**
   * Activates this authorization by setting its status to ACTIVE.
   */
  activate(): void {
    this.status = 'ACTIVE';
  }

  /**
   * Revokes this authorization by setting its status to REVOKED.
   */
  revoke(): void {
    this.status = 'REVOKED';
  }

  /**
   * Checks whether this authorization is currently active.
   * @returns true if the authorization status is ACTIVE, false otherwise
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
