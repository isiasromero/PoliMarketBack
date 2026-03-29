import { Seller } from '../../entities/vendedor.entity';

/**
 * Symbol token for dependency injection of the Seller repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const SELLER_REPOSITORY_TOKEN = Symbol('SELLER_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Seller persistence operations.
 * Defines the contract that any Seller repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface ISellerRepository {
  /**
   * Persists a seller entity (create or update).
   * @param seller - The Seller domain entity to save
   * @returns The saved Seller with generated/updated fields
   */
  save(seller: Seller): Promise<Seller>;

  /**
   * Finds a seller by its unique identifier.
   * @param id - The seller ID to search for
   * @returns The found Seller or null if not found
   */
  findById(id: number): Promise<Seller | null>;

  /**
   * Retrieves all sellers in the system.
   * @returns An array of all Seller domain entities
   */
  findAll(): Promise<Seller[]>;
}
