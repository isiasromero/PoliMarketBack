import { Delivery } from '../../../domain/entities/entrega.entity';
import { DeliveryItem } from '../../../domain/entities/entrega-item.entity';
import { DeliveryOrmEntity } from '../entities/entrega.orm-entity';
import { DeliveryItemOrmEntity } from '../entities/entrega-item.orm-entity';
import { DeliveryStatus } from '../../../domain/entities/entrega.entity';

/**
 * Mapper responsible for converting between the Delivery/DeliveryItem domain entities
 * and their corresponding TypeORM persistence models.
 * Handles both the parent delivery and its child item line items.
 */
export class DeliveryMapper {
  /**
   * Converts a DeliveryOrmEntity (persistence) to a Delivery (domain), including items.
   * @param orm - The TypeORM delivery entity to convert
   * @returns A Delivery domain entity with its items mapped
   */
  static toDomain(orm: DeliveryOrmEntity): Delivery {
    const items = (orm.items || []).map((itemOrm) =>
      DeliveryMapper.itemToDomain(itemOrm),
    );

    return new Delivery({
      id: orm.id,
      saleId: orm.saleId,
      deliveryDate: orm.deliveryDate,
      destinationAddress: orm.destinationAddress,
      status: orm.status as DeliveryStatus,
      items,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a Delivery (domain) to a DeliveryOrmEntity (persistence), including items.
   * @param domain - The domain delivery entity to convert
   * @returns A DeliveryOrmEntity ready for TypeORM operations with mapped items
   */
  static toOrm(domain: Delivery): DeliveryOrmEntity {
    const orm = new DeliveryOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.saleId = domain.saleId;
    orm.deliveryDate = domain.deliveryDate;
    orm.destinationAddress = domain.destinationAddress;
    orm.status = domain.status;
    orm.items = (domain.items || []).map((item) =>
      DeliveryMapper.itemToOrm(item),
    );
    return orm;
  }

  /**
   * Converts a DeliveryItemOrmEntity (persistence) to a DeliveryItem (domain).
   * @param orm - The TypeORM item entity to convert
   * @returns A DeliveryItem domain entity
   */
  static itemToDomain(orm: DeliveryItemOrmEntity): DeliveryItem {
    return new DeliveryItem({
      id: orm.id,
      deliveryId: orm.deliveryId,
      productId: orm.productId,
      quantity: orm.quantity,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a DeliveryItem (domain) to a DeliveryItemOrmEntity (persistence).
   * @param domain - The domain item entity to convert
   * @returns A DeliveryItemOrmEntity ready for TypeORM operations
   */
  static itemToOrm(domain: DeliveryItem): DeliveryItemOrmEntity {
    const orm = new DeliveryItemOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    if (domain.deliveryId) {
      orm.deliveryId = domain.deliveryId;
    }
    orm.productId = domain.productId;
    orm.quantity = domain.quantity;
    return orm;
  }
}
