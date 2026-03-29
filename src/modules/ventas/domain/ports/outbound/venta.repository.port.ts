import { Sale } from '../../entities/venta.entity';

/**
 * Symbol token for dependency injection of the Sale repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const SALE_REPOSITORY_TOKEN = Symbol('SALE_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Sale persistence operations.
 * Defines the contract that any Sale repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface ISaleRepository {
  /**
   * Persists a sale entity along with its details (create or update).
   * @param sale - The Sale domain entity to save, including its details
   * @returns The saved Sale with generated/updated fields and persisted details
   */
  save(sale: Sale): Promise<Sale>;

  /**
   * Finds a sale by its unique identifier, including its details.
   * @param id - The sale ID to search for
   * @returns The found Sale with details or null if not found
   */
  findById(id: number): Promise<Sale | null>;

  /**
   * Finds all sales made by a specific seller, including details.
   * @param sellerId - The ID of the seller to filter by
   * @returns An array of Sale entities belonging to the seller
   */
  findBySeller(sellerId: number): Promise<Sale[]>;

  /**
   * Retrieves all sales in the system, including their details.
   * @returns An array of all Sale domain entities
   */
  findAll(): Promise<Sale[]>;
}
