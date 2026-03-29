import { Inject, Injectable } from '@nestjs/common';
import { Authorization } from '../../domain/entities/autorizacion.entity';
import {
  IAuthorizationRepository,
  AUTHORIZATION_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/autorizacion.repository.port';

/**
 * Use case responsible for retrieving all authorizations for a given seller.
 * Returns both active and revoked authorizations.
 */
@Injectable()
export class GetAuthorizationsUseCase {
  constructor(
    @Inject(AUTHORIZATION_REPOSITORY_TOKEN)
    private readonly authorizationRepository: IAuthorizationRepository,
  ) {}

  /**
   * Retrieves all authorizations associated with the given seller.
   * @param sellerId - The ID of the seller whose authorizations to retrieve
   * @returns An array of Authorization entities for the seller
   */
  async execute(sellerId: number): Promise<Authorization[]> {
    return this.authorizationRepository.findBySeller(sellerId);
  }
}
