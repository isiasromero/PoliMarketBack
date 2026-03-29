import { Delivery } from '../../entities/entrega.entity';

/**
 * Symbol token for dependency injection of the Delivery repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const DELIVERY_REPOSITORY_TOKEN = Symbol('DELIVERY_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Delivery persistence operations.
 * Defines the contract that any Delivery repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface IDeliveryRepository {
  /**
   * Persists a delivery entity along with its items (create or update).
   * @param delivery - The Delivery domain entity to save, including its items
   * @returns The saved Delivery with generated/updated fields and persisted items
   */
  save(delivery: Delivery): Promise<Delivery>;

  /**
   * Finds a delivery by its unique identifier, including its items.
   * @param id - The delivery ID to search for
   * @returns The found Delivery with items or null if not found
   */
  findById(id: number): Promise<Delivery | null>;

  /**
   * Finds all deliveries associated with a specific sale, including items.
   * @param saleId - The ID of the sale to filter by
   * @returns An array of Delivery entities belonging to the sale
   */
  findBySale(saleId: number): Promise<Delivery[]>;

  /**
   * Finds all deliveries with status PENDING or IN_TRANSIT, including items.
   * Useful for tracking active deliveries that have not yet been completed.
   * @returns An array of Delivery entities that are still pending or in transit
   */
  findPending(): Promise<Delivery[]>;

  /**
   * Retrieves all deliveries in the system, including their items.
   * @returns An array of all Delivery domain entities
   */
  findAll(): Promise<Delivery[]>;
}
