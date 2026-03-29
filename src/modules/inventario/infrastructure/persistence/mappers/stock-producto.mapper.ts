import { StockProduct } from '../../../domain/entities/stock-producto.entity';
import { StockProductOrmEntity } from '../entities/stock-producto.orm-entity';

/**
 * Mapper class responsible for converting between the StockProduct domain entity
 * and the StockProductOrmEntity persistence model.
 * Ensures a clean separation between the domain and infrastructure layers.
 */
export class StockProductMapper {
  /**
   * Converts a StockProductOrmEntity (persistence) to a StockProduct (domain).
   * @param ormEntity - The TypeORM entity to convert
   * @returns A StockProduct domain entity
   */
  static toDomain(ormEntity: StockProductOrmEntity): StockProduct {
    return new StockProduct({
      id: ormEntity.id,
      productId: ormEntity.productId,
      warehouseId: ormEntity.warehouseId,
      availableQuantity: ormEntity.availableQuantity,
      minimumQuantity: ormEntity.minimumQuantity,
      shelfLocation: ormEntity.shelfLocation,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }

  /**
   * Converts a StockProduct (domain) to a StockProductOrmEntity (persistence).
   * @param domain - The domain entity to convert
   * @returns A StockProductOrmEntity ready for persistence
   */
  static toOrm(domain: StockProduct): StockProductOrmEntity {
    const orm = new StockProductOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.productId = domain.productId;
    orm.warehouseId = domain.warehouseId;
    orm.availableQuantity = domain.availableQuantity;
    orm.minimumQuantity = domain.minimumQuantity;
    orm.shelfLocation = domain.shelfLocation;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    if (domain.updatedAt) {
      orm.updatedAt = domain.updatedAt;
    }
    return orm;
  }
}
