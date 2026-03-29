import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrderDetailOrmEntity } from './detalle-orden-compra.orm-entity';
import { SupplierOrmEntity } from './proveedor.orm-entity';

/**
 * TypeORM entity mapping the PurchaseOrder domain entity to the "purchase_orders" database table.
 * Includes a one-to-many relationship with PurchaseOrderDetailOrmEntity for line items.
 */
@Entity('purchase_orders')
export class PurchaseOrderOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'supplier_id', type: 'integer' })
  supplierId!: number;

  @ManyToOne(() => SupplierOrmEntity)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierOrmEntity;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status!: string;

  @Column({
    name: 'estimated_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  estimatedTotal!: number;

  @OneToMany(
    () => PurchaseOrderDetailOrmEntity,
    (detail: PurchaseOrderDetailOrmEntity) => detail.order,
    {
      cascade: true,
      eager: true,
    },
  )
  details!: PurchaseOrderDetailOrmEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
