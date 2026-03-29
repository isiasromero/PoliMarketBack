import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import {
  IAuthorizationRepository,
  AUTHORIZATION_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/autorizacion.repository.port';

/**
 * Use case responsible for revoking an existing authorization.
 * Finds the authorization by ID, marks it as revoked, and persists the change.
 */
@Injectable()
export class RevokeAuthorizationUseCase {
  constructor(
    @Inject(AUTHORIZATION_REPOSITORY_TOKEN)
    private readonly authorizationRepository: IAuthorizationRepository,
  ) {}

  /**
   * Revokes the authorization with the given ID.
   * @param authorizationId - The unique ID of the authorization to revoke
   * @returns A Result indicating success (void) or an error message
   */
  async execute(authorizationId: number): Promise<Result<void>> {
    const authorization = await this.authorizationRepository.findById(authorizationId);

    if (!authorization) {
      return err(`Authorization with ID ${authorizationId} not found`);
    }

    if (!authorization.isActive()) {
      return err(`Authorization with ID ${authorizationId} is already revoked`);
    }

    authorization.revoke();
    await this.authorizationRepository.save(authorization);

    return ok(undefined);
  }
}
