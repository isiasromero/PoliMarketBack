import { StockProduct } from '../../entities/stock-producto.entity';

/**
 * Symbol token for dependency injection of the StockProduct repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const STOCK_PRODUCT_REPOSITORY_TOKEN = Symbol(
  'STOCK_PRODUCT_REPOSITORY_TOKEN',
);

/**
 * Outbound port interface for StockProduct persistence operations.
 * Defines the contract that any StockProduct repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface IStockProductRepository {
  /**
   * Persists a stock product entity (create or update).
   * @param stockProduct - The StockProduct domain entity to save
   * @returns The saved StockProduct with generated/updated fields
   */
  save(stockProduct: StockProduct): Promise<StockProduct>;

  /**
   * Finds the stock record for a specific product in a specific warehouse.
   * @param productId - The product ID to search for
   * @param warehouseId - The warehouse ID to search for
   * @returns The found StockProduct or null if no stock record exists
   */
  findByProductAndWarehouse(
    productId: number,
    warehouseId: number,
  ): Promise<StockProduct | null>;

  /**
   * Finds all stock records for a given warehouse.
   * @param warehouseId - The warehouse ID to filter by
   * @returns An array of StockProduct entities in the specified warehouse
   */
  findByWarehouse(warehouseId: number): Promise<StockProduct[]>;

  /**
   * Retrieves all stock product records in the system.
   * @returns An array of all StockProduct domain entities
   */
  findAll(): Promise<StockProduct[]>;

  /**
   * Finds all stock products where available quantity is at or below minimum quantity.
   * Useful for generating restocking alerts and low-stock reports.
   * @returns An array of StockProduct entities that need restocking
   */
  findBelowMinimum(): Promise<StockProduct[]>;
}
