import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
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
import { AdministracionFacade } from '../../facades/administracion.facade';
import { AuthorizeSellerDto, ValidateAccessQueryDto } from '../dto/admin.dto';
import { unwrapResult } from '../filters/result-exception.filter';

/**
 * REST controller for administrative operations.
 *
 * Exposes endpoints for managing seller authorizations,
 * including granting, revoking, querying, and validating
 * access to specific subsystems within PoliMarket.
 */
@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly administracionFacade: AdministracionFacade) {}

  /**
   * Grants a seller authorization to access a target system.
   *
   * Delegates to {@link AdministracionFacade.authorizeSeller} and returns
   * the newly created Authorization entity on success.
   *
   * @param dto - Body payload containing sellerId, employeeId, and system.
   * @returns The created Authorization entity.
   */
  @Post('authorizations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Authorize a seller to access a target system' })
  @ApiResponse({
    status: 201,
    description: 'Authorization created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or authorization already exists.',
  })
  async authorizeSeller(@Body() dto: AuthorizeSellerDto) {
    const result = await this.administracionFacade.authorizeSeller(dto);
    return unwrapResult(result, HttpStatus.CREATED);
  }

  /**
   * Revokes an existing authorization by its unique identifier.
   *
   * Delegates to {@link AdministracionFacade.revokeAuthorization} and
   * returns no content on success.
   *
   * @param id - Path parameter identifying the authorization to revoke.
   */
  @Delete('authorizations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an existing authorization' })
  @ApiParam({ name: 'id', type: Number, description: 'Authorization ID' })
  @ApiResponse({
    status: 200,
    description: 'Authorization revoked successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Authorization not found or already revoked.',
  })
  async revokeAuthorization(@Param('id', ParseIntPipe) id: number) {
    const result = await this.administracionFacade.revokeAuthorization(id);
    return unwrapResult(result);
  }

  /**
   * Retrieves all authorizations in the system.
   *
   * Delegates to {@link AdministracionFacade.getAllAuthorizations} which
   * returns all active and revoked authorizations.
   *
   * @returns An array of all Authorization entities.
   */
  @Get('authorizations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all authorizations in the system' })
  @ApiResponse({
    status: 200,
    description: 'List of all authorizations returned successfully.',
  })
  async getAllAuthorizations() {
    return this.administracionFacade.getAllAuthorizations();
  }

  /**
   * Retrieves all authorizations for a given seller.
   *
   * Delegates to {@link AdministracionFacade.getAuthorizations} which
   * returns the raw array directly (not wrapped in a Result).
   *
   * @param sellerId - Path parameter identifying the seller.
   * @returns An array of Authorization entities (active and revoked).
   */
  @Get('authorizations/seller/:sellerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all authorizations for a seller' })
  @ApiParam({ name: 'sellerId', type: Number, description: 'Seller ID' })
  @ApiResponse({
    status: 200,
    description: 'List of authorizations returned successfully.',
  })
  async getAuthorizations(
    @Param('sellerId', ParseIntPipe) sellerId: number,
  ) {
    return this.administracionFacade.getAuthorizations(sellerId);
  }

  /**
   * Validates whether a seller has active access to a specific system.
   *
   * Delegates to {@link AdministracionFacade.validateAccess} and returns
   * a boolean indicating whether the seller is currently authorized.
   *
   * @param query - Query parameters containing sellerId and system.
   * @returns `true` if the seller has active access, `false` otherwise.
   */
  @Get('access/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate seller access to a system' })
  @ApiQuery({ name: 'sellerId', type: Number, description: 'Seller ID' })
  @ApiQuery({ name: 'system', type: String, description: 'Target system name' })
  @ApiResponse({
    status: 200,
    description: 'Access validation result returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  async validateAccess(@Query() query: ValidateAccessQueryDto) {
    const result = await this.administracionFacade.validateAccess(
      query.sellerId,
      query.system,
    );
    return unwrapResult(result);
  }

  /**
   * Retrieves all sellers in the system.
   *
   * Delegates to {@link AdministracionFacade.obtenerVendedores} and returns
   * the list of all Vendedor entities.
   *
   * @returns An array of all Vendedor entities.
   */
  @Get('sellers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all sellers' })
  @ApiResponse({
    status: 200,
    description: 'List of sellers returned successfully.',
  })
  async getSellers() {
    const result = await this.administracionFacade.obtenerVendedores();
    return unwrapResult(result);
  }
}
