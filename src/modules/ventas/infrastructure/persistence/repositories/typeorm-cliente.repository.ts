import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/entities/cliente.entity';
import { IClientRepository } from '../../../domain/ports/outbound/cliente.repository.port';
import { ClientOrmEntity } from '../entities/cliente.orm-entity';
import { ClientMapper } from '../mappers/cliente.mapper';

/**
 * TypeORM-based implementation of the IClientRepository outbound port.
 * Bridges the domain layer with SQLite persistence via TypeORM.
 */
@Injectable()
export class TypeOrmClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly ormRepository: Repository<ClientOrmEntity>,
  ) {}

  /**
   * Persists a Client domain entity to the database.
   * @param client - The Client domain entity to save
   * @returns The saved Client with generated/updated fields
   */
  async save(client: Client): Promise<Client> {
    const orm = ClientMapper.toOrm(client);
    const saved = await this.ormRepository.save(orm);
    return ClientMapper.toDomain(saved);
  }

  /**
   * Finds a client by its unique identifier.
   * @param id - The client ID to search for
   * @returns The found Client domain entity or null
   */
  async findById(id: number): Promise<Client | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? ClientMapper.toDomain(orm) : null;
  }

  /**
   * Retrieves all clients from the database.
   * @returns An array of Client domain entities
   */
  async findAll(): Promise<Client[]> {
    const orms = await this.ormRepository.find();
    return orms.map(ClientMapper.toDomain);
  }

  /**
   * Deletes a client from the database by its ID.
   * @param id - The client ID to delete
   * @returns Promise that resolves when deletion is complete
   */
  async deleteById(id: number): Promise<void> {
    await this.ormRepository.delete({ id });
  }
}
