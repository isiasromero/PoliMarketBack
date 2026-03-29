import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrderOrmEntity } from './orden-compra.orm-entity';

/**
 * TypeORM entity mapping the PurchaseOrderDetail domain entity
 * to the "purchase_order_details" database table.
 * Includes a many-to-one relationship back to PurchaseOrderOrmEntity.
 */
@Entity('purchase_order_details')
export class PurchaseOrderDetailOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_id', type: 'integer' })
  orderId!: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId!: number;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @ManyToOne(
    () => PurchaseOrderOrmEntity,
    (order: PurchaseOrderOrmEntity) => order.details,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'order_id' })
  order!: PurchaseOrderOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
