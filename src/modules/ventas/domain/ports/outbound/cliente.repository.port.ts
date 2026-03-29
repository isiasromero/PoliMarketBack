import { Client } from '../../entities/cliente.entity';

/**
 * Symbol token for dependency injection of the Client repository.
 * Used with NestJS @Inject() decorator to resolve the concrete implementation.
 */
export const CLIENT_REPOSITORY_TOKEN = Symbol('CLIENT_REPOSITORY_TOKEN');

/**
 * Outbound port interface for Client persistence operations.
 * Defines the contract that any Client repository adapter must implement.
 * Following hexagonal architecture, the domain defines this interface
 * and the infrastructure layer provides the implementation.
 */
export interface IClientRepository {
  /**
   * Persists a client entity (create or update).
   * @param client - The Client domain entity to save
   * @returns The saved Client with generated/updated fields
   */
  save(client: Client): Promise<Client>;

  /**
   * Finds a client by its unique identifier.
   * @param id - The client ID to search for
   * @returns The found Client or null if not found
   */
  findById(id: number): Promise<Client | null>;

  /**
   * Retrieves all clients in the system.
   * @returns An array of all Client domain entities
   */
  findAll(): Promise<Client[]>;

  /**
   * Deletes a client by its unique identifier.
   * @param id - The client ID to delete
   * @returns Promise that resolves when deletion is complete
   */
  deleteById(id: number): Promise<void>;
}
