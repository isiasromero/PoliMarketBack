import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Client } from '../../domain/entities/cliente.entity';
import {
  IClientRepository,
  CLIENT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/cliente.repository.port';

/**
 * Use case for retrieving a specific client by ID.
 * Returns the client details if found.
 */
@Injectable()
export class GetClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Executes the client retrieval operation.
   * @param id - The client ID to retrieve (required)
   * @returns A Result containing the Client or an error
   */
  async execute(id: number): Promise<Result<Client>> {
    // Validations
    if (!id || id <= 0) {
      return err('El ID del cliente es inválido');
    }

    // Find client
    const client = await this.clientRepository.findById(id);
    if (!client) {
      return err('Cliente no encontrado');
    }

    return ok(client);
  }
}
