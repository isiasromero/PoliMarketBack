import { Supplier } from '../../entities/proveedor.entity';

/**
 * Symbol token for dependency injection of the Supplier repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const SUPPLIER_REPOSITORY_TOKEN = Symbol('SUPPLIER_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Supplier persistence operations.
 * Defines the contract that any Supplier repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface ISupplierRepository {
  /**
   * Persists a supplier entity (create or update).
   * @param supplier - The Supplier domain entity to save
   * @returns The saved Supplier with generated/updated fields
   */
  save(supplier: Supplier): Promise<Supplier>;

  /**
   * Finds a supplier by its unique identifier.
   * @param id - The supplier ID to search for
   * @returns The found Supplier or null if not found
   */
  findById(id: number): Promise<Supplier | null>;

  /**
   * Retrieves all suppliers in the system.
   * @returns An array of all Supplier domain entities
   */
  findAll(): Promise<Supplier[]>;

  /**
   * Deletes a supplier from the system by its ID.
   * @param id - The supplier ID to delete
   * @returns true if deletion was successful, false if supplier not found
   */
  delete(id: number): Promise<boolean>;
}
