import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DeliveryItemOrmEntity } from './entrega-item.orm-entity';

/**
 * TypeORM entity mapping the Delivery domain entity to the "deliveries" database table.
 * Includes a one-to-many relationship with DeliveryItemOrmEntity for line items.
 */
@Entity('deliveries')
export class DeliveryOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'sale_id', type: 'integer' })
  saleId!: number;

  @Column({ name: 'delivery_date', type: 'datetime' })
  deliveryDate!: Date;

  @Column({ name: 'destination_address', type: 'varchar', length: 500 })
  destinationAddress!: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: string;

  @OneToMany(
    () => DeliveryItemOrmEntity,
    (item: DeliveryItemOrmEntity) => item.delivery,
    {
      cascade: true,
      eager: true,
    },
  )
  items!: DeliveryItemOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
