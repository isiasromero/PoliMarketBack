import { Warehouse } from '../../entities/bodega.entity';

/**
 * Symbol token for dependency injection of the Warehouse repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const WAREHOUSE_REPOSITORY_TOKEN = Symbol('WAREHOUSE_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Warehouse persistence operations.
 * Defines the contract that any Warehouse repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface IWarehouseRepository {
  /**
   * Persists a warehouse entity (create or update).
   * @param warehouse - The Warehouse domain entity to save
   * @returns The saved Warehouse with generated/updated fields
   */
  save(warehouse: Warehouse): Promise<Warehouse>;

  /**
   * Finds a warehouse by its unique identifier.
   * @param id - The warehouse ID to search for
   * @returns The found Warehouse or null if not found
   */
  findById(id: number): Promise<Warehouse | null>;

  /**
   * Retrieves all warehouses in the system.
   * @returns An array of all Warehouse domain entities
   */
  findAll(): Promise<Warehouse[]>;
}
