import { PurchaseOrder } from '../../../domain/entities/orden-compra.entity';
import { PurchaseOrderDetail } from '../../../domain/entities/detalle-orden-compra.entity';
import { PurchaseOrderOrmEntity } from '../entities/orden-compra.orm-entity';
import { PurchaseOrderDetailOrmEntity } from '../entities/detalle-orden-compra.orm-entity';
import { PurchaseOrderStatus } from '../../../domain/entities/orden-compra.entity';

/**
 * Mapper responsible for converting between the PurchaseOrder/PurchaseOrderDetail
 * domain entities and their corresponding TypeORM persistence models.
 * Handles both the parent order and its child detail line items.
 */
export class PurchaseOrderMapper {
  /**
   * Converts a PurchaseOrderOrmEntity (persistence) to a PurchaseOrder (domain),
   * including details and supplier name.
   * @param orm - The TypeORM purchase order entity to convert
   * @returns A PurchaseOrder domain entity with its details and supplier name mapped
   */
  static toDomain(orm: PurchaseOrderOrmEntity): PurchaseOrder {
    const details = (orm.details || []).map((detailOrm) =>
      PurchaseOrderMapper.detailToDomain(detailOrm),
    );

    return new PurchaseOrder({
      id: orm.id,
      supplierId: orm.supplierId,
      date: orm.date,
      status: orm.status as PurchaseOrderStatus,
      estimatedTotal: Number(orm.estimatedTotal),
      details,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      supplierName: orm.supplier?.name,
    });
  }

  /**
   * Converts a PurchaseOrder (domain) to a PurchaseOrderOrmEntity (persistence),
   * including details.
   * @param domain - The domain purchase order entity to convert
   * @returns A PurchaseOrderOrmEntity ready for TypeORM operations with mapped details
   */
  static toOrm(domain: PurchaseOrder): PurchaseOrderOrmEntity {
    const orm = new PurchaseOrderOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    orm.supplierId = domain.supplierId;
    orm.date = domain.date;
    orm.status = domain.status;
    orm.estimatedTotal = domain.estimatedTotal;
    orm.details = (domain.details || []).map((detail) =>
      PurchaseOrderMapper.detailToOrm(detail),
    );
    return orm;
  }

  /**
   * Converts a PurchaseOrderDetailOrmEntity (persistence) to a PurchaseOrderDetail (domain).
   * @param orm - The TypeORM detail entity to convert
   * @returns A PurchaseOrderDetail domain entity
   */
  static detailToDomain(
    orm: PurchaseOrderDetailOrmEntity,
  ): PurchaseOrderDetail {
    return new PurchaseOrderDetail({
      id: orm.id,
      orderId: orm.orderId,
      productId: orm.productId,
      quantity: orm.quantity,
      unitPrice: Number(orm.unitPrice),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Converts a PurchaseOrderDetail (domain) to a PurchaseOrderDetailOrmEntity (persistence).
   * @param domain - The domain detail entity to convert
   * @returns A PurchaseOrderDetailOrmEntity ready for TypeORM operations
   */
  static detailToOrm(
    domain: PurchaseOrderDetail,
  ): PurchaseOrderDetailOrmEntity {
    const orm = new PurchaseOrderDetailOrmEntity();
    if (domain.id) {
      orm.id = domain.id;
    }
    if (domain.orderId) {
      orm.orderId = domain.orderId;
    }
    orm.productId = domain.productId;
    orm.quantity = domain.quantity;
    orm.unitPrice = domain.unitPrice;
    return orm;
  }
}
