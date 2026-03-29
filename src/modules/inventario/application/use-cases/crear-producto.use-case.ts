import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Product } from '../../domain/entities/producto.entity';
import { StockProduct } from '../../domain/entities/stock-producto.entity';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';

/**
 * Use case for creating a new product with initial stock in a warehouse.
 * Creates both the Product entity and its initial StockProduct record.
 */
@Injectable()
export class CrearProductoUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
  ) {}

  /**
   * Executes the product creation.
   * @param props - Product creation properties:
   *   - name: Product name
   *   - description: Product description (optional)
   *   - unitPrice: Unit price
   *   - category: Product category (optional)
   *   - primarySupplierId: Primary supplier ID (optional, defaults to 1)
   *   - warehouseId: Warehouse ID for initial stock
   *   - initialQuantity: Initial quantity to register
   *   - minimumStock: Minimum stock threshold
   * @returns A Result containing the created Product and StockProduct
   */
  async execute(props: {
    name: string;
    description?: string;
    unitPrice: number;
    category?: string;
    primarySupplierId?: number;
    warehouseId: number;
    initialQuantity: number;
    minimumStock: number;
  }): Promise<
    Result<{
      product: Product;
      stock: StockProduct;
    }>
  > {
    // Create the product entity
    const product = new Product({
      name: props.name,
      description: props.description || '',
      unitPrice: props.unitPrice,
      category: props.category || 'General',
      primarySupplierId: props.primarySupplierId || 1,
    });

    // Save product to repository
    const savedProduct = await this.productRepository.save(product);
    if (!savedProduct) {
      return err('Error saving product to database');
    }

    // Create initial stock record
    const stockProduct = new StockProduct({
      productId: savedProduct.id!,
      warehouseId: props.warehouseId,
      availableQuantity: props.initialQuantity,
      minimumQuantity: props.minimumStock,
      shelfLocation: 'A1',  // Default shelf location
    });

    // Save stock record
    const savedStock = await this.stockProductRepository.save(stockProduct);
    if (!savedStock) {
      return err('Error saving stock record to database');
    }

    return ok({
      product: savedProduct,
      stock: savedStock,
    });
  }
}
