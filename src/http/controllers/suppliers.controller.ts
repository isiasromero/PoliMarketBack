import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { LogisticaFacade } from '../../facades/logistica.facade';
import { CreatePurchaseOrderDto, CreateSupplierDto, UpdateSupplierDto } from '../dto/suppliers.dto';
import { unwrapResult } from '../filters/result-exception.filter';

/**
 * REST controller for supplier and purchase-order operations.
 *
 * Exposes endpoints for listing suppliers, generating new
 * purchase orders, and registering the reception of goods
 * from a supplier.
 */
@ApiTags('Suppliers')
@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly logisticaFacade: LogisticaFacade) {}

  /**
   * Retrieves all suppliers registered in the system.
   *
   * Delegates to {@link LogisticaFacade.getSuppliers} and returns
   * the full list of Supplier entities.
   *
   * @returns An array of all Supplier entities.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all registered suppliers' })
  @ApiResponse({
    status: 200,
    description: 'List of suppliers returned successfully.',
  })
  async getSuppliers() {
    const result = await this.logisticaFacade.getSuppliers();
    return unwrapResult(result);
  }

  /**
   * Creates a new supplier in the system.
   *
   * Delegates to {@link LogisticaFacade.createSupplier} and returns
   * the persisted Supplier entity on success.
   *
   * @param dto - Body payload containing supplier name, contact, and phone
   * @returns The created Supplier entity.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'Supplier created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (missing required fields).',
  })
  async createSupplier(@Body() dto: CreateSupplierDto) {
    const result = await this.logisticaFacade.createSupplier(dto);
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing supplier in the system.
   *
   * Delegates to {@link LogisticaFacade.updateSupplier} and returns
   * the updated Supplier entity on success.
   *
   * @param id - Path parameter identifying the supplier to update
   * @param dto - Body payload with fields to update
   * @returns The updated Supplier entity.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing supplier' })
  @ApiParam({ name: 'id', type: Number, description: 'Supplier ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or supplier not found.',
  })
  async updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    const result = await this.logisticaFacade.updateSupplier({ ...dto, id });
    return unwrapResult(result);
  }

  /**
   * Deletes a supplier from the system.
   *
   * Delegates to {@link LogisticaFacade.deleteSupplier} and returns
   * a success message on deletion.
   *
   * @param id - Path parameter identifying the supplier to delete
   * @returns A success message with the deleted supplier ID.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiParam({ name: 'id', type: Number, description: 'Supplier ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Supplier not found.',
  })
  async deleteSupplier(@Param('id', ParseIntPipe) id: number) {
    const result = await this.logisticaFacade.deleteSupplier(id);
    return unwrapResult(result);
  }

  /**
   * Retrieves all purchase orders in the system.
   *
   * Returns the full list of PurchaseOrder entities.
   *
   * @returns An array of all PurchaseOrder entities.
   */
  @Get('purchase-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({
    status: 200,
    description: 'List of purchase orders returned successfully.',
  })
  async getPurchaseOrders() {
    const result = await this.logisticaFacade.getPurchaseOrders();
    return unwrapResult(result);
  }

  /**
   * Generates a new purchase order for a supplier.
   *
   * Delegates to {@link LogisticaFacade.generatePurchaseOrder} and returns
   * the persisted PurchaseOrder entity on success.
   *
   * @param dto - Body payload containing supplierId and detail line items.
   * @returns The created PurchaseOrder entity.
   */
  @Post('purchase-orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new purchase order' })
  @ApiResponse({
    status: 201,
    description: 'Purchase order created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or supplier not found.',
  })
  async generatePurchaseOrder(@Body() dto: CreatePurchaseOrderDto) {
    const result = await this.logisticaFacade.generatePurchaseOrder(dto);
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Registers the reception of a purchase order.
   *
   * Transitions the purchase order to a received state and updates
   * stock levels accordingly. Delegates to
   * {@link LogisticaFacade.registerReception}.
   *
   * @param id - Path parameter identifying the purchase order.
   * @returns The updated PurchaseOrder entity.
   */
  @Patch('purchase-orders/:id/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register reception of a purchase order' })
  @ApiParam({ name: 'id', type: Number, description: 'Purchase order ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order reception registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Order not found or already received.',
  })
  async registerReception(@Param('id', ParseIntPipe) id: number) {
    const result = await this.logisticaFacade.registerReception(id);
    return unwrapResult(result);
  }

  /**
   * Deletes a purchase order from the system.
   *
   * Removes the purchase order and all associated order details.
   * Delegates to {@link LogisticaFacade.eliminarOrdenCompra}.
   *
   * @param id - Path parameter identifying the purchase order to delete
   * @returns A success message with the deleted order ID.
   */
  @Delete('purchase-orders/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a purchase order' })
  @ApiParam({ name: 'id', type: Number, description: 'Purchase order ID' })
  @ApiResponse({
    status: 200,
    description: 'Purchase order deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Purchase order not found.',
  })
  async deletePurchaseOrder(@Param('id', ParseIntPipe) id: number) {
    const result = await this.logisticaFacade.eliminarOrdenCompra(id);
    return unwrapResult(result);
  }
}
