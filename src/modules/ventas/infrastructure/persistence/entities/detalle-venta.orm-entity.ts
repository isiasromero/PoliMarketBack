import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SaleOrmEntity } from './venta.orm-entity';

/**
 * TypeORM entity mapping the SaleDetail domain entity to the "sale_details" database table.
 * Includes a many-to-one relationship back to SaleOrmEntity.
 */
@Entity('sale_details')
export class SaleDetailOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'sale_id', type: 'integer' })
  saleId!: number;

  @Column({ name: 'product_id', type: 'integer' })
  productId!: number;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  @ManyToOne(() => SaleOrmEntity, (sale: SaleOrmEntity) => sale.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_id' })
  sale!: SaleOrmEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
