import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Result, ok, err } from '../../../../shared/domain/result';
import { Client } from '../../domain/entities/cliente.entity';
import {
  IClientRepository,
  CLIENT_REPOSITORY_TOKEN,
} from '../../domain/ports/outbound/cliente.repository.port';

/**
 * Use case for creating a new client in the system.
 * Validates required fields and persists the client entity.
 */
@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_TOKEN)
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Executes the client creation operation.
   * @param name - Client's full name (required)
   * @param phone - Client's phone number (required)
   * @param address - Client's address (required)
   * @param identification - Client's identification number (cédula, NIT, etc.) (required)
   * @returns A Result containing the created Client or an error
   */
  async execute(
    name: string,
    phone: string,
    address: string,
    identification: string,
  ): Promise<Result<Client>> {
    // Validations
    if (!name || name.trim().length === 0) {
      return err('El nombre del cliente es requerido');
    }
    if (!phone || phone.trim().length === 0) {
      return err('El teléfono del cliente es requerido');
    }
    if (!address || address.trim().length === 0) {
      return err('La dirección del cliente es requerida');
    }
    if (!identification || identification.trim().length === 0) {
      return err('La identificación del cliente es requerida');
    }

    // Create client entity
    const client = new Client({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      identification: identification.trim(),
    });

    // Persist to database
    const savedClient = await this.clientRepository.save(client);
    return ok(savedClient);
  }
}
