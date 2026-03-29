import { Product } from '../../entities/producto.entity';

/**
 * Symbol token for dependency injection of the Product repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const PRODUCT_REPOSITORY_TOKEN = Symbol('PRODUCT_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Product persistence operations.
 * Defines the contract that any Product repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface IProductRepository {
  /**
   * Persists a product entity (create or update).
   * @param product - The Product domain entity to save
   * @returns The saved Product with generated/updated fields
   */
  save(product: Product): Promise<Product>;

  /**
   * Finds a product by its unique identifier.
   * @param id - The product ID to search for
   * @returns The found Product or null if not found
   */
  findById(id: number): Promise<Product | null>;

  /**
   * Retrieves all products in the system.
   * @returns An array of all Product domain entities
   */
  findAll(): Promise<Product[]>;

  /**
   * Deletes a product from the system by its ID.
   * @param id - The product ID to delete
   * @returns true if deletion was successful, false if product not found
   */
  delete(id: number): Promise<boolean>;
}
