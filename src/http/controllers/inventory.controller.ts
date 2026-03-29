import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LogisticaFacade } from '../../facades/logistica.facade';
import { StockMovementDto, CreateProductDto, UpdateProductDto } from '../dto/inventory.dto';
import { unwrapResult } from '../filters/result-exception.filter';

/**
 * REST controller for inventory operations.
 *
 * Exposes endpoints for registering stock entries and exits,
 * as well as querying products that are at or below their
 * minimum stock level.
 */
@ApiTags('Inventory')
@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly logisticaFacade: LogisticaFacade) {}

  /**
   * Registers an incoming stock entry for a product in a warehouse.
   *
   * Delegates to {@link LogisticaFacade.registerEntry} and returns the
   * updated StockProduct entity on success.
   *
   * @param dto - Body payload containing productId, warehouseId, and quantity.
   * @returns The updated StockProduct entity.
   */
  @Post('entry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a stock entry into a warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Stock entry registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or stock record not found.',
  })
  async registerEntry(@Body() dto: StockMovementDto) {
    const result = await this.logisticaFacade.registerEntry(
      dto.productId,
      dto.warehouseId,
      dto.quantity,
    );
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Registers an outgoing stock exit for a product in a warehouse.
   *
   * Delegates to {@link LogisticaFacade.registerExit} and returns the
   * updated StockProduct entity on success.
   *
   * @param dto - Body payload containing productId, warehouseId, and quantity.
   * @returns The updated StockProduct entity.
   */
  @Post('exit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a stock exit from a warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Stock exit registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or insufficient stock.',
  })
  async registerExit(@Body() dto: StockMovementDto) {
    const result = await this.logisticaFacade.registerExit(
      dto.productId,
      dto.warehouseId,
      dto.quantity,
    );
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Retrieves all products that are at or below their minimum stock level.
   *
   * Delegates to {@link LogisticaFacade.checkLowStockProducts} and returns
   * the list of StockProduct entities that need restocking.
   *
   * @returns An array of StockProduct entities below minimum stock.
   */
  @Get('low-stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get products below minimum stock level' })
  @ApiResponse({
    status: 200,
    description: 'Low-stock products returned successfully.',
  })
  async checkLowStockProducts() {
    const result = await this.logisticaFacade.checkLowStockProducts();
    return unwrapResult(result);
  }

  /**
   * Retrieves all products in the inventory system.
   *
   * Delegates to {@link LogisticaFacade.obtenerProductos} and returns
   * the list of all Product entities.
   *
   * @returns An array of all Product entities.
   */
  @Get('products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'List of products returned successfully.',
  })
  async getProducts() {
    const result = await this.logisticaFacade.obtenerProductos();
    return unwrapResult(result);
  }

  /**
   * Creates a new product with initial stock.
   *
   * Delegates to {@link LogisticaFacade.crearProducto} and returns
   * the newly created Product and StockProduct entities.
   *
   * @param dto - Body payload containing product details and initial stock information.
   * @returns An object containing the created Product and StockProduct.
   */
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product with initial stock' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or database error.',
  })
  async createProduct(@Body() dto: CreateProductDto) {
    const result = await this.logisticaFacade.crearProducto({
      name: dto.name,
      description: dto.description,
      unitPrice: dto.unitPrice,
      category: dto.category,
      primarySupplierId: dto.primarySupplierId,
      warehouseId: dto.warehouseId,
      initialQuantity: dto.initialQuantity,
      minimumStock: dto.minimumStock,
    });
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing product.
   *
   * Delegates to {@link LogisticaFacade.updateProducto} and returns
   * the updated Product entity.
   *
   * @param id - The product ID to update
   * @param dto - Body payload containing product fields to update (all optional).
   * @returns The updated Product entity.
   */
  @Put('products/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or product not found.',
  })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const result = await this.logisticaFacade.updateProducto({
      id: parseInt(id, 10),
      name: dto.name,
      description: dto.description,
      unitPrice: dto.unitPrice,
      category: dto.category,
      primarySupplierId: dto.primarySupplierId,
    });
    return unwrapResult(result);
  }

  /**
   * Deletes a product by its ID.
   *
   * Delegates to {@link LogisticaFacade.deleteProducto} and returns a
   * success message on successful deletion.
   *
   * @param id - The product ID to delete
   * @returns A success message with the deleted product ID.
   */
  @Delete('products/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Product not found or validation error.',
  })
  async deleteProduct(@Param('id') id: string) {
    const result = await this.logisticaFacade.deleteProducto(parseInt(id, 10));
    return unwrapResult(result);
  }

  /**
   * Retrieves all stock records across all products and warehouses.
   *
   * Delegates to {@link LogisticaFacade.obtenerStock} and returns
   * the list of all StockProduct entities.
   *
   * @returns An array of StockProduct entities showing availability by warehouse.
   */
  @Get('stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get stock by product and warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Stock information returned successfully.',
  })
  async getStock() {
    const result = await this.logisticaFacade.obtenerStock();
    return unwrapResult(result);
  }
}
