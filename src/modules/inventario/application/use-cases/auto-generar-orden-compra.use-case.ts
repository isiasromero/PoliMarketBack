import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { PurchaseOrder } from '../../../proveedores/domain/entities/orden-compra.entity';
import { StockProduct } from '../../domain/entities/stock-producto.entity';
import {
  IStockProductRepository,
  STOCK_PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/stock-producto.repository.port';
import {
  IProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/producto.repository.port';
import {
  IPurchaseOrderRepository,
  PURCHASE_ORDER_REPOSITORY_TOKEN,
} from '../../../proveedores/domain/ports/outbound/orden-compra.repository.port';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY_TOKEN,
} from '../../../proveedores/domain/ports/outbound/proveedor.repository.port';

/**
 * Use case para auto-generar órdenes de compra cuando un producto tiene stock bajo.
 *
 * BUSINESS RULE (RF04): Cuando el stock de un producto cae por debajo del mínimo,
 * el sistema debe automáticamente crear una orden de compra al proveedor principal
 * para reabastecer el inventario. Esto asegura que nunca se quede sin stock.
 *
 * Workflow:
 * 1. Recibir un StockProduct que necesita restocking
 * 2. Buscar el proveedor del producto (asume que cada producto tiene un proveedor principal)
 * 3. Calcular la cantidad a comprar: diferencia entre máximo deseado y stock actual
 * 4. Crear nueva orden de compra con estado SENT
 * 5. Persistir la orden en la base de datos
 */
@Injectable()
export class AutoGeneratePurchaseOrderUseCase {
  constructor(
    @Inject(STOCK_PRODUCT_REPOSITORY_TOKEN)
    private readonly stockProductRepository: IStockProductRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(PURCHASE_ORDER_REPOSITORY_TOKEN)
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  /**
   * Auto-genera una orden de compra cuando el stock de un producto está bajo.
   *
   * @param productId - ID del producto con stock bajo
   * @param warehouseId - ID de la bodega donde el stock está bajo
   * @returns Una orden de compra creada, o error si algo falla
   *
   * NOTA: Este use case es llamado automáticamente por RegisterExitUseCase
   * cuando se decrementa stock y este queda por debajo del mínimo.
   */
  async execute(
    productId: number,
    warehouseId: number,
  ): Promise<Result<PurchaseOrder>> {
    // PASO 1: Obtener información del producto y su stock actual
    const stockProduct =
      await this.stockProductRepository.findByProductAndWarehouse(
        productId,
        warehouseId,
      );

    if (!stockProduct) {
      return err(
        `Stock record not found for product ${productId} in warehouse ${warehouseId}`,
      );
    }

    // PASO 2: Verificar que realmente necesita restocking
    if (!stockProduct.needsRestocking()) {
      return err(
        `Product ${productId} stock (${stockProduct.availableQuantity}) ` +
        `is not below minimum (${stockProduct.minimumQuantity}). No restocking needed.`,
      );
    }

    // PASO 3: Obtener detalles del producto
    const product = await this.productRepository.findById(productId);
    if (!product) {
      return err(`Product with ID ${productId} not found`);
    }

    // PASO 4: Obtener el proveedor
    // Usar el proveedor principal del producto si existe, sino usar el proveedor por defecto (ID = 1)
    const DEFAULT_SUPPLIER_ID = 1;
    const supplierId = product.primarySupplierId ?? DEFAULT_SUPPLIER_ID;
    const supplier = await this.supplierRepository.findById(supplierId);

    if (!supplier) {
      return err(
        `Supplier (ID ${supplierId}) not found for product ${productId}. Cannot auto-generate purchase order.`,
      );
    }

    // PASO 5: Calcular cantidad a comprar
    // Estrategia: reabastecemos hasta 5 unidades por encima del mínimo
    const RESTOCK_BUFFER = 5;
    const targetQuantity = stockProduct.minimumQuantity + RESTOCK_BUFFER;
    const quantityToOrder = targetQuantity - stockProduct.availableQuantity;

    if (quantityToOrder <= 0) {
      return err(
        `No stock needed. Current: ${stockProduct.availableQuantity}, Target: ${targetQuantity}`,
      );
    }

    // PASO 6: Crear la orden de compra
    const purchaseOrder = new PurchaseOrder({
      supplierId: supplier.id,
      date: new Date(),
      status: 'SENT',
    });

    // Agregar detalle de línea: qué producto y cuántos comprar
    purchaseOrder.addDetail(
      productId,
      quantityToOrder,
      product.unitPrice, // Usar precio actual del producto
    );

    // PASO 7: Persistir la orden de compra
    const saved = await this.purchaseOrderRepository.save(purchaseOrder);

    // PASO 8: Retornar éxito
    return ok(saved);
  }
}
