import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * TypeORM entity mapping for the warehouses table.
 * Represents the persistence schema for Warehouse domain entities.
 */
@Entity('warehouses')
export class WarehouseOrmEntity {
  /** Auto-generated primary key */
  @PrimaryGeneratedColumn()
  id!: number;

  /** Warehouse display name */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /** Physical location or address */
  @Column({ type: 'varchar', length: 500 })
  location!: string;

  /** Timestamp of record creation */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  /** Timestamp of last record update */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
