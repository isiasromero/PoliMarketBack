import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HREmployee } from '../../../domain/entities/empleado-rrhh.entity';
import { IHREmployeeRepository } from '../../../domain/ports/outbound/empleado-rrhh.repository.port';
import { HREmployeeOrmEntity } from '../entities/empleado-rrhh.orm-entity';
import { HREmployeeMapper } from '../mappers/empleado-rrhh.mapper';

/**
 * TypeORM implementation of the IHREmployeeRepository port.
 * Provides persistence operations for HR employee entities using SQLite.
 */
@Injectable()
export class TypeOrmHREmployeeRepository implements IHREmployeeRepository {
  constructor(
    @InjectRepository(HREmployeeOrmEntity)
    private readonly ormRepository: Repository<HREmployeeOrmEntity>,
  ) {}

  /**
   * Persists an HR employee entity.
   * @param employee - The domain entity to save
   * @returns The saved domain entity with generated/updated fields
   */
  async save(employee: HREmployee): Promise<HREmployee> {
    const orm = HREmployeeMapper.toOrm(employee);
    const saved = await this.ormRepository.save(orm);
    return HREmployeeMapper.toDomain(saved);
  }

  /**
   * Finds an HR employee by ID.
   * @param id - The unique identifier
   * @returns The domain entity or null if not found
   */
  async findById(id: number): Promise<HREmployee | null> {
    const orm = await this.ormRepository.findOneBy({ id });
    return orm ? HREmployeeMapper.toDomain(orm) : null;
  }

  /**
   * Retrieves all HR employees.
   * @returns An array of all HR employee domain entities
   */
  async findAll(): Promise<HREmployee[]> {
    const orms = await this.ormRepository.find();
    return orms.map(HREmployeeMapper.toDomain);
  }
}
