import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * TypeORM entity representing the authorizations table.
 * Maps to the Authorization domain entity via the AuthorizationMapper.
 */
@Entity('authorizations')
export class AuthorizationOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'employee_id', type: 'integer' })
  employeeId!: number;

  @Column({ name: 'seller_id', type: 'integer' })
  sellerId!: number;

  @Column({ name: 'target_system', type: 'varchar', length: 255 })
  targetSystem!: string;

  @Column({ name: 'authorization_date', type: 'datetime' })
  authorizationDate!: Date;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
