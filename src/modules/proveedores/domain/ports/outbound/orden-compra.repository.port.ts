import { PurchaseOrder } from '../../entities/orden-compra.entity';

/**
 * Symbol token for dependency injection of the PurchaseOrder repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const PURCHASE_ORDER_REPOSITORY_TOKEN = Symbol(
  'PURCHASE_ORDER_REPOSITORY_TOKEN',
);

/**
 * Outbound port interface for PurchaseOrder persistence operations.
 * Defines the contract that any PurchaseOrder repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface IPurchaseOrderRepository {
  /**
   * Persists a purchase order entity along with its details (create or update).
   * @param order - The PurchaseOrder domain entity to save, including its details
   * @returns The saved PurchaseOrder with generated/updated fields and persisted details
   */
  save(order: PurchaseOrder): Promise<PurchaseOrder>;

  /**
   * Finds a purchase order by its unique identifier, including its details.
   * @param id - The purchase order ID to search for
   * @returns The found PurchaseOrder with details or null if not found
   */
  findById(id: number): Promise<PurchaseOrder | null>;

  /**
   * Finds all purchase orders placed with a specific supplier, including details.
   * @param supplierId - The ID of the supplier to filter by
   * @returns An array of PurchaseOrder entities belonging to the supplier
   */
  findBySupplier(supplierId: number): Promise<PurchaseOrder[]>;

  /**
   * Retrieves all purchase orders in the system, including their details.
   * @returns An array of all PurchaseOrder domain entities
   */
  findAll(): Promise<PurchaseOrder[]>;

  /**
   * Deletes a purchase order by its ID.
   * @param id - The purchase order ID to delete
   * @returns True if deleted successfully, false if not found
   */
  delete(id: number): Promise<boolean>;
}
