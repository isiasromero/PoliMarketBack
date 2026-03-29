import { Sale } from '../../../domain/entities/venta.entity';
import { SaleDetail } from '../../../domain/entities/detalle-venta.entity';
import { SaleOrmEntity } from '../entities/venta.orm-entity';
import { SaleDetailOrmEntity } from '../entities/detalle-venta.orm-entity';
import { SaleStatus } from '../../../domain/entities/venta.entity';

/**
 * Mapper responsible for converting between the Sale/SaleDetail domain entities
 * and their corresponding TypeORM persistence models.
 * Handles both the parent sale and its child detail line items.
 */
export class SaleMapper {
  /**
   * Converts a SaleOrmEntity (persistence) to a Sale (domain), including details.
   * @param orm - The TypeORM sale entity to convert
   * @returns A Sale domain entity with its details mapped
   */
  static toDomain(orm: SaleOrmEntity): Sale {
    const details = (orm.details || []).map((detailOrm) =>
      SaleMapper.detailToDomain(detailOrm),
    );

    return new Sale({
      id: orm.id,
      sellerId: orm.sellerId,
      clientId: orm.clientId,
      date: orm.date,
      status: orm.status as SaleStatus,
      details,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a Sale (domain) to a SaleOrmEntity (persistence), including details.
   * @param domain - The domain sale entity to convert
   * @returns A SaleOrmEntity ready for TypeORM operations with mapped details
   */
  static toOrm(domain: Sale): SaleOrmEntity {
    const orm = new SaleOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.sellerId = domain.sellerId;
    orm.clientId = domain.clientId;
    orm.date = domain.date;
    orm.status = domain.status;
    orm.details = (domain.details || []).map((detail) =>
      SaleMapper.detailToOrm(detail),
    );
    return orm;
  }

  /**
   * Converts a SaleDetailOrmEntity (persistence) to a SaleDetail (domain).
   * @param orm - The TypeORM detail entity to convert
   * @returns A SaleDetail domain entity
   */
  static detailToDomain(orm: SaleDetailOrmEntity): SaleDetail {
    return new SaleDetail({
      id: orm.id,
      saleId: orm.saleId,
      productId: orm.productId,
      quantity: orm.quantity,
      unitPrice: Number(orm.unitPrice),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a SaleDetail (domain) to a SaleDetailOrmEntity (persistence).
   * @param domain - The domain detail entity to convert
   * @returns A SaleDetailOrmEntity ready for TypeORM operations
   */
  static detailToOrm(domain: SaleDetail): SaleDetailOrmEntity {
    const orm = new SaleDetailOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    if (domain.saleId) {
      orm.saleId = domain.saleId;
    }
    orm.productId = domain.productId;
    orm.quantity = domain.quantity;
    orm.unitPrice = domain.unitPrice;
    return orm;
  }
}
