import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VentasFacade } from '../../facades/ventas.facade';
import { RegisterSaleDto, VerifyStockQueryDto, CreateClientDto, UpdateClientDto } from '../dto/sales.dto';
import { unwrapResult } from '../filters/result-exception.filter';

/**
 * REST controller for sales operations.
 *
 * Exposes endpoints for registering sales, querying clients,
 * retrieving sales by seller, checking product availability,
 * and verifying sufficient stock levels.
 */
@ApiTags('Sales')
@Controller('api/sales')
export class SalesController {
  constructor(private readonly ventasFacade: VentasFacade) {}

  /**
   * Registers a new sale in the system.
   *
   * Delegates to {@link VentasFacade.registerSale} and returns the
   * persisted Sale entity on success.
   *
   * @param dto - Body payload containing sellerId, clientId, and detail line items.
   * @returns The created Sale entity.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new sale' })
  @ApiResponse({
    status: 201,
    description: 'Sale registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or insufficient stock.',
  })
  async registerSale(@Body() dto: RegisterSaleDto) {
    const result = await this.ventasFacade.registerSale(dto);
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Retrieves all sales made by a specific seller.
   *
   * Delegates to {@link VentasFacade.getSalesBySeller} and returns
   * the array of Sale entities.
   *
   * @param sellerId - Path parameter identifying the seller.
   * @returns An array of Sale entities for the given seller.
   */
  @Get('seller/:sellerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all sales by a seller' })
  @ApiParam({ name: 'sellerId', type: Number, description: 'Seller ID' })
  @ApiResponse({
    status: 200,
    description: 'List of sales returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Seller not found.',
  })
  async getSalesBySeller(
    @Param('sellerId', ParseIntPipe) sellerId: number,
  ) {
    const result = await this.ventasFacade.getSalesBySeller(sellerId);
    return unwrapResult(result);
  }

  /**
   * Retrieves all clients registered in the system.
   *
   * Delegates to {@link VentasFacade.getClients} and returns
   * the full list of Client entities.
   *
   * @returns An array of all Client entities.
   */
  @Get('clients')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all registered clients' })
  @ApiResponse({
    status: 200,
    description: 'List of clients returned successfully.',
  })
  async getClients() {
    const result = await this.ventasFacade.getClients();
    return unwrapResult(result);
  }

  /**
   * Checks the availability of a product across all warehouses.
   *
   * Delegates to {@link VentasFacade.checkAvailability} and returns
   * stock records for the given product.
   *
   * @param productId - Path parameter identifying the product.
   * @returns An array of StockProduct records for the product.
   */
  @Get('availability/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check product availability across warehouses' })
  @ApiParam({ name: 'productId', type: Number, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Stock availability returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'No stock records found for the product.',
  })
  async checkAvailability(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const result = await this.ventasFacade.checkAvailability(productId);
    return unwrapResult(result);
  }

  /**
   * Verifies whether sufficient stock exists for a given product and quantity.
   *
   * Delegates to {@link VentasFacade.verifySufficientStock} and returns
   * a boolean indicating stock sufficiency.
   *
   * @param query - Query parameters containing productId and quantity.
   * @returns `true` if sufficient stock exists, `false` otherwise.
   */
  @Get('stock/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify sufficient stock for a product' })
  @ApiQuery({ name: 'productId', type: Number, description: 'Product ID' })
  @ApiQuery({ name: 'quantity', type: Number, description: 'Required quantity' })
  @ApiResponse({
    status: 200,
    description: 'Stock verification result returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Product has no stock records.',
  })
  async verifySufficientStock(@Query() query: VerifyStockQueryDto) {
    const result = await this.ventasFacade.verifySufficientStock(
      query.productId,
      query.quantity,
    );
    return unwrapResult(result);
  }

  /**
   * Retrieves a specific client by ID.
   *
   * Delegates to {@link VentasFacade.getClient} and returns
   * the Client details.
   *
   * @param clientId - Path parameter identifying the client.
   * @returns The Client entity.
   */
  @Get('clients/:clientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'clientId', type: Number, description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Client not found.',
  })
  async getClient(@Param('clientId', ParseIntPipe) clientId: number) {
    const result = await this.ventasFacade.getClient(clientId);
    return unwrapResult(result);
  }

  /**
   * Creates a new client in the system.
   *
   * Delegates to {@link VentasFacade.createClient} and returns
   * the persisted Client entity on success.
   *
   * @param dto - Body payload containing client name, phone, address, and identification
   * @returns The created Client entity.
   */
  @Post('clients')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    description: 'Client created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error (missing required fields).',
  })
  async createClient(@Body() dto: CreateClientDto) {
    const result = await this.ventasFacade.createClient(dto.name, dto.phone, dto.address, dto.identification);
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Updates an existing client's information.
   *
   * Delegates to {@link VentasFacade.updateClient} and returns
   * the updated Client entity on success.
   *
   * @param clientId - Path parameter identifying the client to update.
   * @param dto - Body payload containing optional name, phone, address, and identification fields
   * @returns The updated Client entity.
   */
  @Patch('clients/:clientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a client' })
  @ApiParam({ name: 'clientId', type: Number, description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or client not found.',
  })
  async updateClient(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() dto: UpdateClientDto,
  ) {
    const result = await this.ventasFacade.updateClient(clientId, dto.name, dto.phone, dto.address, dto.identification);
    return unwrapResult(result);
  }

  /**
   * Deletes a client from the system.
   *
   * Delegates to {@link VentasFacade.deleteClient} and removes
   * the Client entity from the database.
   *
   * @param clientId - Path parameter identifying the client to delete.
   * @returns A success message.
   */
  @Delete('clients/:clientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a client' })
  @ApiParam({ name: 'clientId', type: Number, description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Client not found.',
  })
  async deleteClient(@Param('clientId', ParseIntPipe) clientId: number) {
    const result = await this.ventasFacade.deleteClient(clientId);
    return unwrapResult(result);
  }
}
