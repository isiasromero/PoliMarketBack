import { Injectable } from '@nestjs/common';
import { Result } from '../shared/domain/result';
import { PurchaseOrder } from '../modules/proveedores/domain/entities/orden-compra.entity';
import { Supplier } from '../modules/proveedores/domain/entities/proveedor.entity';
import { Delivery } from '../modules/entregas/domain/entities/entrega.entity';
import { StockProduct } from '../modules/inventario/domain/entities/stock-producto.entity';
import {
  GeneratePurchaseOrderUseCase,
  GeneratePurchaseOrderInput,
} from '../modules/proveedores/application/use-cases/generar-orden-compra.use-case';
import {
  ActualizarOrdenCompraUseCase,
  UpdatePurchaseOrderInput,
} from '../modules/proveedores/application/use-cases/actualizar-orden-compra.use-case';
import {
  RegisterReceptionUseCase,
  RegisterReceptionInput,
} from '../modules/proveedores/application/use-cases/registrar-recepcion.use-case';
import { GetSuppliersUseCase } from '../modules/proveedores/application/use-cases/consultar-proveedores.use-case';
import {
  CreateSupplierUseCase,
  CreateSupplierInput,
} from '../modules/proveedores/application/use-cases/crear-proveedor.use-case';
import {
  UpdateSupplierUseCase,
  UpdateSupplierInput,
} from '../modules/proveedores/application/use-cases/actualizar-proveedor.use-case';
import { DeleteSupplierUseCase } from '../modules/proveedores/application/use-cases/eliminar-proveedor.use-case';
import { GetPurchaseOrdersUseCase } from '../modules/proveedores/application/use-cases/obtener-ordenes-compra.use-case';
import { EliminarOrdenCompraUseCase } from '../modules/proveedores/application/use-cases/eliminar-orden-compra.use-case';
import { CheckLowStockProductsUseCase } from '../modules/inventario/application/use-cases/consultar-productos-bajo-stock.use-case';
import {
  GenerateDeliveryUseCase,
  GenerateDeliveryInput,
} from '../modules/entregas/application/use-cases/generar-entrega.use-case';
import { ConfirmDeliveryUseCase } from '../modules/entregas/application/use-cases/confirmar-entrega.use-case';
import { GetPendingDeliveriesUseCase } from '../modules/entregas/application/use-cases/consultar-entregas-pendientes.use-case';
import { RegisterWarehouseExitUseCase } from '../modules/entregas/application/use-cases/registrar-salida-bodega.use-case';
import { RegisterEntryUseCase } from '../modules/inventario/application/use-cases/registrar-entrada.use-case';
import { RegisterExitUseCase } from '../modules/inventario/application/use-cases/registrar-salida.use-case';
import { ObtenerProductosUseCase } from '../modules/inventario/application/use-cases/obtener-productos.use-case';
import { CrearProductoUseCase } from '../modules/inventario/application/use-cases/crear-producto.use-case';
import {
  UpdateProductUseCase,
  UpdateProductInput,
} from '../modules/inventario/application/use-cases/actualizar-producto.use-case';
import { DeleteProductUseCase } from '../modules/inventario/application/use-cases/eliminar-producto.use-case';
import { ObtenerStockUseCase } from '../modules/inventario/application/use-cases/obtener-stock.use-case';

/**
 * Facade that orchestrates Proveedores (Suppliers), Entregas (Deliveries),
 * and Inventario (Inventory) use cases. Provides a unified interface for
 * logistics operations including purchase orders, deliveries, and stock
 * management without containing any business logic itself.
 */
@Injectable()
export class LogisticaFacade {
  constructor(
    private readonly generatePurchaseOrderUseCase: GeneratePurchaseOrderUseCase,
    private readonly actualizarOrdenCompraUseCase: ActualizarOrdenCompraUseCase,
    private readonly registerReceptionUseCase: RegisterReceptionUseCase,
    private readonly getSuppliersUseCase: GetSuppliersUseCase,
    private readonly getPurchaseOrdersUseCase: GetPurchaseOrdersUseCase,
    private readonly eliminarOrdenCompraUseCase: EliminarOrdenCompraUseCase,
    private readonly createSupplierUseCase: CreateSupplierUseCase,
    private readonly updateSupplierUseCase: UpdateSupplierUseCase,
    private readonly deleteSupplierUseCase: DeleteSupplierUseCase,
    private readonly checkLowStockProductsUseCase: CheckLowStockProductsUseCase,
    private readonly generateDeliveryUseCase: GenerateDeliveryUseCase,
    private readonly confirmDeliveryUseCase: ConfirmDeliveryUseCase,
    private readonly getPendingDeliveriesUseCase: GetPendingDeliveriesUseCase,
    private readonly registerWarehouseExitUseCase: RegisterWarehouseExitUseCase,
    private readonly registerEntryUseCase: RegisterEntryUseCase,
    private readonly registerExitUseCase: RegisterExitUseCase,
    private readonly obtenerProductosUseCase: ObtenerProductosUseCase,
    private readonly crearProductoUseCase: CrearProductoUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly obtenerStockUseCase: ObtenerStockUseCase,
  ) {}

  /**
   * Generates a new purchase order for a supplier.
   * @param dto - Input containing supplierId and detail line items
   * @returns A Result containing the persisted PurchaseOrder on success,
   *          or an error message if validation fails
   */
  async generatePurchaseOrder(dto: GeneratePurchaseOrderInput): Promise<Result<PurchaseOrder>> {
    return this.generatePurchaseOrderUseCase.execute(dto);
  }

  /**
   * Updates an existing purchase order.
   * @param orderId - The ID of the purchase order to update
   * @param dto - Input containing supplierId and updated detail line items
   * @returns A Result containing the updated PurchaseOrder on success,
   *          or an error message if validation fails or order is already received
   */
  async actualizarOrdenCompra(orderId: number, dto: GeneratePurchaseOrderInput): Promise<Result<PurchaseOrder>> {
    const input: UpdatePurchaseOrderInput = { orderId, ...dto };
    return this.actualizarOrdenCompraUseCase.execute(input);
  }

  /**
   * Registers the reception of a purchase order.
   * @param orderId - The ID of the purchase order to mark as received
   * @returns A Result containing the updated PurchaseOrder on success,
   *          or an error message if the order is not found or cannot be received
   */
  async registerReception(orderId: number): Promise<Result<PurchaseOrder>> {
    const input: RegisterReceptionInput = { orderId };
    return this.registerReceptionUseCase.execute(input);
  }

  /**
   * Retrieves all suppliers registered in the system.
   * @returns A Result containing an array of all Supplier entities
   */
  async getSuppliers(): Promise<Result<Supplier[]>> {
    return this.getSuppliersUseCase.execute();
  }

  /**
   * Creates a new supplier in the system.
   * @param dto - Input containing supplier name, contact, and phone
   * @returns A Result containing the created Supplier on success,
   *          or an error message if validation fails
   */
  async createSupplier(dto: CreateSupplierInput): Promise<Result<Supplier>> {
    return this.createSupplierUseCase.execute(dto);
  }

  /**
   * Updates an existing supplier in the system.
   * @param dto - Input containing supplier ID and fields to update
   * @returns A Result containing the updated Supplier on success,
   *          or an error message if validation fails or supplier not found
   */
  async updateSupplier(dto: UpdateSupplierInput): Promise<Result<Supplier>> {
    return this.updateSupplierUseCase.execute(dto);
  }

  /**
   * Deletes a supplier from the system.
   * @param id - The ID of the supplier to delete
   * @returns A Result containing a success message on success,
   *          or an error message if the supplier is not found
   */
  async deleteSupplier(id: number): Promise<Result<{ id: number; message: string }>> {
    return this.deleteSupplierUseCase.execute(id);
  }

  /**
   * Retrieves all purchase orders in the system.
   * @returns A Result containing an array of all PurchaseOrder entities
   */
  async getPurchaseOrders(): Promise<Result<PurchaseOrder[]>> {
    return this.getPurchaseOrdersUseCase.execute();
  }

  /**
   * Deletes a purchase order by its ID.
   * @param id - The ID of the purchase order to delete
   * @returns A Result containing a success message on success,
   *          or an error message if the order is not found
   */
  async eliminarOrdenCompra(id: number): Promise<Result<{ id: number; message: string }>> {
    return this.eliminarOrdenCompraUseCase.execute(id);
  }

  /**
   * Retrieves all products that are at or below their minimum stock level.
   * @returns A Result containing an array of StockProduct entities that need restocking
   */
  async checkLowStockProducts(): Promise<Result<StockProduct[]>> {
    return this.checkLowStockProductsUseCase.execute();
  }

  /**
   * Generates a new delivery for a sale.
   * @param dto - Input containing saleId, destinationAddress, and item details
   * @returns A Result containing the persisted Delivery on success,
   *          or an error message if validation fails
   */
  async generateDelivery(dto: GenerateDeliveryInput): Promise<Result<Delivery>> {
    return this.generateDeliveryUseCase.execute(dto);
  }

  /**
   * Confirms a delivery, transitioning its status to DELIVERED.
   * @param deliveryId - The ID of the delivery to confirm
   * @returns A Result containing the confirmed Delivery on success,
   *          or an error message if the delivery is not found or cannot be confirmed
   */
  async confirmDelivery(deliveryId: number): Promise<Result<Delivery>> {
    return this.confirmDeliveryUseCase.execute(deliveryId);
  }

  /**
   * Retrieves all pending deliveries (status PENDING or IN_TRANSIT).
   * @returns A Result containing an array of pending Delivery entities
   */
  async getPendingDeliveries(): Promise<Result<Delivery[]>> {
    return this.getPendingDeliveriesUseCase.execute();
  }

  /**
   * Registers a warehouse exit for a delivery, transitioning it to IN_TRANSIT.
   * @param deliveryId - The ID of the delivery leaving the warehouse
   * @returns A Result containing the updated Delivery on success,
   *          or an error message if the delivery is not found or cannot transit
   */
  async registerWarehouseExit(deliveryId: number): Promise<Result<Delivery>> {
    return this.registerWarehouseExitUseCase.execute(deliveryId);
  }

  /**
   * Registers an incoming stock entry for a product in a warehouse.
   * @param productId - The ID of the product receiving stock
   * @param warehouseId - The ID of the warehouse where stock is being added
   * @param quantity - The quantity to add (must be positive)
   * @returns A Result containing the updated StockProduct on success,
   *          or an error message on failure
   */
  async registerEntry(
    productId: number,
    warehouseId: number,
    quantity: number,
  ): Promise<Result<StockProduct>> {
    return this.registerEntryUseCase.execute(productId, warehouseId, quantity);
  }

  /**
   * Registers an outgoing stock exit for a product in a warehouse.
   * @param productId - The ID of the product being withdrawn
   * @param warehouseId - The ID of the warehouse where stock is being removed
   * @param quantity - The quantity to remove (must be positive)
   * @returns A Result containing the updated StockProduct on success,
   *          or an error message if stock is insufficient or not found
   */
  async registerExit(
    productId: number,
    warehouseId: number,
    quantity: number,
  ): Promise<Result<StockProduct>> {
    return this.registerExitUseCase.execute(productId, warehouseId, quantity);
  }

  /**
   * Retrieves all products in the inventory system.
   * @returns A Result containing an array of all Product entities
   */
  async obtenerProductos(): Promise<Result<any[]>> {
    return this.obtenerProductosUseCase.execute();
  }

  /**
   * Creates a new product with initial stock.
   * @param props - Product creation properties
   * @returns A Result containing the created Product and StockProduct on success
   */
  async crearProducto(props: {
    name: string;
    description?: string;
    unitPrice: number;
    category?: string;
    primarySupplierId?: number;
    warehouseId: number;
    initialQuantity: number;
    minimumStock: number;
  }): Promise<Result<any>> {
    return this.crearProductoUseCase.execute(props);
  }

  /**
   * Updates an existing product in the system.
   * @param input - Input containing product ID and fields to update
   * @returns A Result containing the updated Product on success,
   *          or an error message if validation fails or product not found
   */
  async updateProducto(input: UpdateProductInput): Promise<Result<any>> {
    return this.updateProductUseCase.execute(input);
  }

  /**
   * Deletes a product from the system.
   * @param id - The ID of the product to delete
   * @returns A Result containing a success message on success,
   *          or an error message if the product is not found
   */
  async deleteProducto(id: number): Promise<Result<{ id: number; message: string }>> {
    return this.deleteProductUseCase.execute(id);
  }

  /**
   * Retrieves all stock records across all products and warehouses.
   * @returns A Result containing an array of all StockProduct entities
   */
  async obtenerStock(): Promise<Result<any[]>> {
    return this.obtenerStockUseCase.execute();
  }
}
