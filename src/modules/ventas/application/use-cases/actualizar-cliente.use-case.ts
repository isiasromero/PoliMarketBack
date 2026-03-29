import { Inject, Injectable } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Client } from '../../domain/entities/cliente.entity';
import {
  IClientRepository,
  CLIENT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/cliente.repository.port';

/**
 * Use case for updating an existing client's information.
 * Validates the client exists and updates the provided fields.
 */
@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Executes the client update operation.
   * @param id - The client ID to update (required)
   * @param name - Updated client name (optional)
   * @param phone - Updated client phone (optional)
   * @param address - Updated client address (optional)
   * @param identification - Updated client identification (optional)
   * @returns A Result containing the updated Client or an error
   */
  async execute(
    id: number,
    name?: string,
    phone?: string,
    address?: string,
    identification?: string,
  ): Promise<Result<Client>> {
    // Validations
    if (!id || id <= 0) {
      return err('El ID del cliente es inválido');
    }

    // Find existing client
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      return err('Cliente no encontrado');
    }

    // Validate fields that are provided
    if (name !== undefined && name.trim().length === 0) {
      return err('El nombre del cliente no puede estar vacío');
    }
    if (phone !== undefined && phone.trim().length === 0) {
      return err('El teléfono del cliente no puede estar vacío');
    }
    if (address !== undefined && address.trim().length === 0) {
      return err('La dirección del cliente no puede estar vacía');
    }
    if (identification !== undefined && identification.trim().length === 0) {
      return err('La identificación del cliente no puede estar vacía');
    }

    // Update only provided fields
    const updatedClient = new Client({
      ...existingClient,
      name: name !== undefined ? name.trim() : existingClient.name,
      phone: phone !== undefined ? phone.trim() : existingClient.phone,
      address: address !== undefined ? address.trim() : existingClient.address,
      identification: identification !== undefined ? identification.trim() : existingClient.identification,
    });

    // Persist to database
    const saved = await this.clientRepository.save(updatedClient);
    return ok(saved);
  }
}
