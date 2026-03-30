import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorization } from '../../../domain/entities/autorizacion.entity';
import { IAuthorizationRepository } from '../../../domain/ports/outbound/autorizacion.repository.port';
import { AuthorizationOrmEntity } from '../entities/autorizacion.orm-entity';
import { AuthorizationMapper } from '../mappers/autorizacion.mapper';

/**
 * TypeORM implementation of the IAuthorizationRepository port.
 * Provides persistence operations for authorization entities using SQLite.
 */
@Injectable()
export class TypeOrmAuthorizationRepository implements IAuthorizationRepository {
  constructor(
    @InjectRepository(AuthorizationOrmEntity)
    private readonly ormRepository: Repository<AuthorizationOrmEntity>,
  ) {}

  /**
   * Persists an authorization entity.
   * @param authorization - The domain entity to save
   * @returns The saved domain entity with generated/updated fields
   */
  async save(authorization: Authorization): Promise<Authorization> {
    const orm = AuthorizationMapper.toOrm(authorization);
    const saved = await this.ormRepository.save(orm);
    return AuthorizationMapper.toDomain(saved);
  }

  /**
   * Finds an authorization by ID.
   * @param id - The unique identifier
   * @returns The domain entity or null if not found
   */
  async findById(id: number): Promise<Authorization | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? AuthorizationMapper.toDomain(orm) : null;
  }

  /**
   * Finds all authorizations in the system.
   * @returns An array of all authorization domain entities
   */
  async findAll(): Promise<Authorization[]> {
    const orms = await this.ormRepository.find();
    return orms.map(AuthorizationMapper.toDomain);
  }

  /**
   * Finds all authorizations for a given seller.
   * @param sellerId - The seller's unique identifier
   * @returns An array of authorization domain entities
   */
  async findBySeller(sellerId: number): Promise<Authorization[]> {
    const orms = await this.ormRepository.find({
      where: { sellerId },
    });
    return orms.map(AuthorizationMapper.toDomain);
  }

  /**
   * Finds an active authorization for a specific seller and target system.
   * @param sellerId - The seller's unique identifier
   * @param system - The target system name
   * @returns The active authorization or null if none exists
   */
  async findActiveBySellerAndSystem(
    sellerId: number,
    system: string,
  ): Promise<Authorization | null> {
    const orm = await this.ormRepository.findOneBy({
      sellerId,
      targetSystem: system,
      status: 'ACTIVE',
    });
    return orm ? AuthorizationMapper.toDomain(orm) : null;
  }
}
