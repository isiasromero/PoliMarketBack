import { Authorization } from '../../entities/autorizacion.entity';

/**
 * Symbol token for dependency injection of the authorization repository.
 */
export const AUTHORIZATION_REPOSITORY_TOKEN = Symbol('AUTHORIZATION_REPOSITORY_TOKEN');

/**
 * Outbound port defining the persistence contract for authorization entities.
 * Infrastructure adapters must implement this interface to provide
 * data access for seller authorizations.
 */
export interface IAuthorizationRepository {
  /**
   * Persists an authorization entity (create or update).
   * @param authorization - The authorization entity to save
   * @returns The saved authorization with generated/updated fields
   */
  save(authorization: Authorization): Promise<Authorization>;

  /**
   * Finds an authorization by its unique identifier.
   * @param id - The unique ID of the authorization
   * @returns The found authorization, or null if not found
   */
  findById(id: number): Promise<Authorization | null>;

  /**
   * Finds all authorizations in the system.
   * @returns An array of all authorizations
   */
  findAll(): Promise<Authorization[]>;

  /**
   * Finds all authorizations associated with a given seller.
   * @param sellerId - The ID of the seller to search authorizations for
   * @returns An array of authorizations belonging to the seller
   */
  findBySeller(sellerId: number): Promise<Authorization[]>;

  /**
   * Finds an active authorization for a specific seller and target system.
   * @param sellerId - The ID of the seller
   * @param system - The name of the target system
   * @returns The active authorization if found, or null otherwise
   */
  findActiveBySellerAndSystem(sellerId: number, system: string): Promise<Authorization | null>;
}
