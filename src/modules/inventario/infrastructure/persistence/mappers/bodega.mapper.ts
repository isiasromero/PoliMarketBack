import { Warehouse } from '../../../domain/entities/bodega.entity';
import { WarehouseOrmEntity } from '../entities/bodega.orm-entity';

/**
 * Mapper class responsible for converting between the Warehouse domain entity
 * and the WarehouseOrmEntity persistence model.
 * Ensures a clean separation between the domain and infrastructure layers.
 */
export class WarehouseMapper {
  /**
   * Converts a WarehouseOrmEntity (persistence) to a Warehouse (domain).
   * @param ormEntity - The TypeORM entity to convert
   * @returns A Warehouse domain entity
   */
  static toDomain(ormEntity: WarehouseOrmEntity): Warehouse {
    return new Warehouse({
      id: ormEntity.id,
      name: ormEntity.name,
      location: ormEntity.location,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * Converts a Warehouse (domain) to a WarehouseOrmEntity (persistence).
   * @param domain - The domain entity to convert
   * @returns A WarehouseOrmEntity ready for persistence
   */
  static toOrm(domain: Warehouse): WarehouseOrmEntity {
    const orm = new WarehouseOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.name = domain.name;
    orm.location = domain.location;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      orm.updatedAt = domain.updatedAt;
    }
    return orm;
  }
}
