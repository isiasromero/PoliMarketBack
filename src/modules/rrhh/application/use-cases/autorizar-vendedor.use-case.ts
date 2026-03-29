import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Authorization } from '../../domain/entities/autorizacion.entity';
import {
  IAuthorizationRepository,
  AUTHORIZATION_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/autorizacion.repository.port';

/** Input DTO for the authorize seller use case */
export interface AuthorizeSellerInput {
  /** ID of the seller to authorize */
  sellerId: number;
  /** ID of the HR employee granting the authorization */
  employeeId: number;
  /** Target system the seller will be authorized to access */
  system: string;
}

/**
 * Use case responsible for authorizing a seller to access a target system.
 * Validates that no active authorization already exists for the given
 * seller+system combination before creating a new one.
 */
@Injectable()
export class AuthorizeSellerUseCase {
  constructor(
    @Inject(AUTHORIZATION_REPOSITORY_TOKEN)
    private readonly authorizationRepository: IAuthorizationRepository,
  ) {}

  /**
   * Executes the authorization process for a seller.
   * @param input - The seller ID, employee ID, and target system
   * @returns A Result containing the created Authorization on success,
   *          or an error message if an active authorization already exists
   */
  async execute(input: AuthorizeSellerInput): Promise<Result<Authorization>> {
    const existing = await this.authorizationRepository.findActiveBySellerAndSystem(
      input.sellerId,
      input.system,
    );

    if (existing) {
      return err(
        `Seller ${input.sellerId} already has an active authorization for system "${input.system}"`,
      );
    }

    const authorization = new Authorization();
    authorization.employeeId = input.employeeId;
    authorization.sellerId = input.sellerId;
    authorization.targetSystem = input.system;
    authorization.authorizationDate = new Date();
    authorization.status = 'ACTIVE';

    const saved = await this.authorizationRepository.save(authorization);
    return ok(saved);
  }
}
