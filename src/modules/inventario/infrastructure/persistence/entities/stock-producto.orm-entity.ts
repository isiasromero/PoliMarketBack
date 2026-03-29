import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductOrmEntity } from './producto.orm-entity';
import { WarehouseOrmEntity } from './bodega.orm-entity';

/**
 * TypeORM entity mapping for the stock_products table.
 * Represents the persistence schema for StockProduct domain entities.
 * Has ManyToOne relationships to both ProductOrmEntity and WarehouseOrmEntity.
 */
@Entity('stock_products')
export class StockProductOrmEntity {
  /** Auto-generated primary key */
  @PrimaryGeneratedColumn()
  id!: number;

  /** Foreign key to the products table */
  @Column({ name: 'product_id', type: 'integer' })
  productId!: number;

  /** Foreign key to the warehouses table */
  @Column({ name: 'warehouse_id', type: 'integer' })
  warehouseId!: number;

  /** Current available quantity in stock */
  @Column({ name: 'available_quantity', type: 'integer', default: 0 })
  availableQuantity!: number;

  /** Minimum quantity threshold for restocking alerts */
  @Column({ name: 'minimum_quantity', type: 'integer', default: 0 })
  minimumQuantity!: number;

  /** Physical shelf or aisle location within the warehouse */
  @Column({ name: 'shelf_location', type: 'varchar', length: 100, default: '' })
  shelfLocation!: string;

  /** Timestamp of record creation */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  /** Timestamp of last record update */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /** ManyToOne relation to the associated product */
  @ManyToOne(() => ProductOrmEntity, { eager: false })
  @JoinColumn({ name: 'product_id' })
  product?: ProductOrmEntity;

  /** ManyToOne relation to the associated warehouse */
  @ManyToOne(() => WarehouseOrmEntity, { eager: false })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: WarehouseOrmEntity;
}
