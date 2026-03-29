import { Inject, Injectable } from '@nestjs/common';
import { Result, ok } from '../../../../shared/domain/result';
import { Client } from '../../domain/entities/cliente.entity';
import {
  IClientRepository,
  CLIENT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/cliente.repository.port';

/**
 * Use case responsible for retrieving all clients registered in the system.
 * Returns the full list of Client domain entities.
 */
@Injectable()
export class GetClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Executes the client listing operation.
   * @returns A Result containing an array of all Client entities
   */
  async execute(): Promise<Result<Client[]>> {
    const clients = await this.clientRepository.findAll();
    return ok(clients);
  }
}
