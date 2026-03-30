import { Inject, Injectable } from '@nestjs/common';
import { Authorization } from '../../domain/entities/autorizacion.entity';
import {
  IAuthorizationRepository,
  AUTHORIZATION_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/autorizacion.repository.port';

/**
 * Use case responsible for retrieving all authorizations in the system.
 * Returns both active and revoked authorizations for all sellers.
 */
@Injectable()
export class ObtenerTodasAutorizacionesUseCase {
  constructor(
    @Inject(AUTHORIZATION_REPOSITORY_TOKEN)
    private readonly authorizationRepository: IAuthorizationRepository,
  ) {}

  /**
   * Retrieves all authorizations in the system.
   * @returns An array of all Authorization entities
   */
  async execute(): Promise<Authorization[]> {
    return this.authorizationRepository.findAll();
  }
}
