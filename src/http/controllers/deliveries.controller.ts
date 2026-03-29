import {
  Controller,
  Post,
  Get,
  Patch,
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
import { GenerateDeliveryDto } from '../dto/deliveries.dto';
import { unwrapResult } from '../filters/result-exception.filter';

/**
 * REST controller for delivery operations.
 *
 * Exposes endpoints for generating deliveries, dispatching
 * them from the warehouse, confirming final delivery, and
 * listing pending deliveries.
 */
@ApiTags('Deliveries')
@Controller('api/deliveries')
export class DeliveriesController {
  constructor(private readonly logisticaFacade: LogisticaFacade) {}

  /**
   * Generates a new delivery for a sale.
   *
   * Delegates to {@link LogisticaFacade.generateDelivery} and returns
   * the persisted Delivery entity on success.
   *
   * @param dto - Body payload containing saleId, destinationAddress, and items.
   * @returns The created Delivery entity.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate a new delivery for a sale' })
  @ApiResponse({
    status: 201,
    description: 'Delivery generated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or sale not found.',
  })
  async generateDelivery(@Body() dto: GenerateDeliveryDto) {
    const result = await this.logisticaFacade.generateDelivery(dto);
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Registers a warehouse exit for a delivery, transitioning it to IN_TRANSIT.
   *
   * Delegates to {@link LogisticaFacade.registerWarehouseExit} and returns
   * the updated Delivery entity.
   *
   * @param id - Path parameter identifying the delivery.
   * @returns The updated Delivery entity with IN_TRANSIT status.
   */
  @Patch(':id/dispatch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dispatch a delivery from the warehouse' })
  @ApiParam({ name: 'id', type: Number, description: 'Delivery ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery dispatched successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Delivery not found or cannot be dispatched.',
  })
  async registerWarehouseExit(@Param('id', ParseIntPipe) id: number) {
    const result = await this.logisticaFacade.registerWarehouseExit(id);
    return unwrapResult(result);
  }

  /**
   * Confirms a delivery, transitioning its status to DELIVERED.
   *
   * Delegates to {@link LogisticaFacade.confirmDelivery} and returns
   * the updated Delivery entity.
   *
   * @param id - Path parameter identifying the delivery.
   * @returns The confirmed Delivery entity with DELIVERED status.
   */
  @Patch(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm delivery completion' })
  @ApiParam({ name: 'id', type: Number, description: 'Delivery ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery confirmed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Delivery not found or cannot be confirmed.',
  })
  async confirmDelivery(@Param('id', ParseIntPipe) id: number) {
    const result = await this.logisticaFacade.confirmDelivery(id);
    return unwrapResult(result);
  }

  /**
   * Retrieves all pending deliveries (status PENDING or IN_TRANSIT).
   *
   * Delegates to {@link LogisticaFacade.getPendingDeliveries} and returns
   * the list of Delivery entities that have not yet been confirmed.
   *
   * @returns An array of pending Delivery entities.
   */
  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all pending deliveries' })
  @ApiResponse({
    status: 200,
    description: 'Pending deliveries returned successfully.',
  })
  async getPendingDeliveries() {
    const result = await this.logisticaFacade.getPendingDeliveries();
    return unwrapResult(result);
  }
}
