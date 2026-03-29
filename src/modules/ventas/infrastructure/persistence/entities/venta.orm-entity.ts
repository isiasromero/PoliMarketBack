import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SaleDetailOrmEntity } from './detalle-venta.orm-entity';

/**
 * TypeORM entity mapping the Sale domain entity to the "sales" database table.
 * Includes a one-to-many relationship with SaleDetailOrmEntity for line items.
 */
@Entity('sales')
export class SaleOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'seller_id', type: 'integer' })
  sellerId!: number;

  @Column({ name: 'client_id', type: 'integer' })
  clientId!: number;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: string;

  @OneToMany(() => SaleDetailOrmEntity, (detail: SaleDetailOrmEntity) => detail.sale, {
    cascade: true,
    eager: true,
  })
  details!: SaleDetailOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
