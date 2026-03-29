import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeliveryOrmEntity } from './entrega.orm-entity';

/**
 * TypeORM entity mapping the DeliveryItem domain entity to the "delivery_items" database table.
 * Includes a many-to-one relationship back to DeliveryOrmEntity.
 */
@Entity('delivery_items')
export class DeliveryItemOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'delivery_id', type: 'integer' })
  deliveryId!: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId!: number;

  @Column({ type: 'integer' })
  quantity!: number;

  @ManyToOne(
    () => DeliveryOrmEntity,
    (delivery: DeliveryOrmEntity) => delivery.items,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'delivery_id' })
  delivery!: DeliveryOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
