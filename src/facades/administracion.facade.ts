import { Injectable } from '@nestjs/common';
import { Result } from '../shared/domain/result';
import { Authorization } from '../modules/rrhh/domain/entities/autorizacion.entity';
import {
  AuthorizeSellerUseCase,
  AuthorizeSellerInput,
} from '../modules/rrhh/application/use-cases/autorizar-vendedor.use-case';
import { RevokeAuthorizationUseCase } from '../modules/rrhh/application/use-cases/revocar-autorizacion.use-case';
import { GetAuthorizationsUseCase } from '../modules/rrhh/application/use-cases/consultar-autorizaciones.use-case';
import { ObtenerTodasAutorizacionesUseCase } from '../modules/rrhh/application/use-cases/obtener-todas-autorizaciones.use-case';
import {
  ValidateAccessUseCase,
  ValidateAccessInput,
} from '../modules/rrhh/application/use-cases/validar-acceso.use-case';
import { ObtenerVendedoresUseCase } from '../modules/ventas/application/use-cases/obtener-vendedores.use-case';

/**
 * Facade that orchestrates all RRHH (Human Resources) use cases.
 * Provides a unified interface for seller authorization management
 * without containing any business logic itself.
 */
@Injectable()
export class AdministracionFacade {
  constructor(
    private readonly authorizeSellerUseCase: AuthorizeSellerUseCase,
    private readonly revokeAuthorizationUseCase: RevokeAuthorizationUseCase,
    private readonly getAuthorizationsUseCase: GetAuthorizationsUseCase,
    private readonly obtenerTodasAutorizacionesUseCase: ObtenerTodasAutorizacionesUseCase,
    private readonly validateAccessUseCase: ValidateAccessUseCase,
    private readonly obtenerVendedoresUseCase: ObtenerVendedoresUseCase,
  ) {}

  /**
   * Authorizes a seller to access a target system.
   * @param dto - Input containing sellerId, employeeId, and system
   * @returns A Result containing the created Authorization on success,
   *          or an error message if an active authorization already exists
   */
  async authorizeSeller(dto: AuthorizeSellerInput): Promise<Result<Authorization>> {
    return this.authorizeSellerUseCase.execute(dto);
  }

  /**
   * Revokes an existing authorization by its ID.
   * @param id - The unique ID of the authorization to revoke
   * @returns A Result indicating success (void) or an error message
   */
  async revokeAuthorization(id: number): Promise<Result<void>> {
    return this.revokeAuthorizationUseCase.execute(id);
  }

  /**
   * Retrieves all authorizations in the system.
   * @returns An array of all Authorization entities (both active and revoked)
   */
  async getAllAuthorizations(): Promise<Authorization[]> {
    return this.obtenerTodasAutorizacionesUseCase.execute();
  }

  /**
   * Retrieves all authorizations for a given seller.
   * @param sellerId - The ID of the seller whose authorizations to retrieve
   * @returns An array of Authorization entities (both active and revoked)
   */
  async getAuthorizations(sellerId: number): Promise<Authorization[]> {
    return this.getAuthorizationsUseCase.execute(sellerId);
  }

  /**
   * Validates whether a seller has active access to a specific system.
   * @param sellerId - The ID of the seller to validate
   * @param system - The target system to check authorization against
   * @returns A Result containing true if access is authorized, false otherwise
   */
  async validateAccess(sellerId: number, system: string): Promise<Result<boolean>> {
    const input: ValidateAccessInput = { sellerId, system };
    return this.validateAccessUseCase.execute(input);
  }

  /**
   * Retrieves all sellers in the system.
   * @returns A Result containing an array of all Vendedor entities
   */
  async obtenerVendedores(): Promise<Result<any[]>> {
    return this.obtenerVendedoresUseCase.execute();
  }
}
