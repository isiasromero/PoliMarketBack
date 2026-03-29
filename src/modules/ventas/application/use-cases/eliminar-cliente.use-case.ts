import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import {
  IClientRepository,
  CLIENT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/cliente.repository.port';

/**
 * Use case for deleting a client from the system.
 * Validates the client exists before deletion.
 */
@Injectable()
export class DeleteClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Executes the client deletion operation.
   * @param id - The client ID to delete (required)
   * @returns A Result containing a success message or an error
   */
  async execute(id: number): Promise<Result<string>> {
    // Validations
    if (!id || id <= 0) {
      return err('El ID del cliente es inválido');
    }

    // Check if client exists
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      return err('Cliente no encontrado');
    }

    // Delete from database
    await this.clientRepository.deleteById(id);
    return ok(`Cliente #${id} eliminado correctamente`);
  }
}
