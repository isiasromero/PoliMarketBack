import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import {
  IAuthorizationRepository,
  AUTHORIZATION_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/autorizacion.repository.port';

/** Input DTO for the validate access use case */
export interface ValidateAccessInput {
  /** ID of the seller to validate access for */
  sellerId: number;
  /** Target system to check authorization against */
  system: string;
}

/**
 * Use case responsible for validating whether a seller has active
 * access to a specific target system.
 */
@Injectable()
export class ValidateAccessUseCase {
  constructor(
    @Inject(AUTHORIZATION_REPOSITORY_TOKEN)
    private readonly authorizationRepository: IAuthorizationRepository,
  ) {}

  /**
   * Checks if the given seller has an active authorization for the specified system.
   * @param input - The seller ID and target system to validate
   * @returns A Result containing true if access is authorized, false otherwise
   */
  async execute(input: ValidateAccessInput): Promise<Result<boolean>> {
    const authorization = await this.authorizationRepository.findActiveBySellerAndSystem(
      input.sellerId,
      input.system,
    );

    return ok(authorization !== null);
  }
}
