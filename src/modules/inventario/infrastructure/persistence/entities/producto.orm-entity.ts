import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * TypeORM entity mapping for the products table.
 * Represents the persistence schema for Product domain entities.
 */
@Entity('products')
export class ProductOrmEntity {
  /** Auto-generated primary key */
  @PrimaryGeneratedColumn()
  id!: number;

  /** Product display name */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /** Detailed product description */
  @Column({ type: 'text' })
  description!: string;

  /** Unit price stored as a decimal value */
  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: number;

  /** Product category classification */
  @Column({ type: 'varchar', length: 100 })
  category!: string;

  /** Primary supplier ID for auto-restocking (optional, can be null) */
  @Column({ name: 'primary_supplier_id', type: 'integer', nullable: true })
  primarySupplierId?: number;

  /** Timestamp of record creation */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  /** Timestamp of last record update */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
