import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * TypeORM entity mapping the Tarea domain entity to the "tasks" database table.
 * Represents a task or activity assigned to a seller with state transitions.
 */
@Entity('tasks')
export class TareaOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'seller_id', type: 'integer' })
  sellerId!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['VENTA', 'ENTREGA', 'LLAMADA', 'SEGUIMIENTO', 'DEMO', 'REUNION'],
  })
  type!: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'ATRASADA'],
    default: 'PENDIENTE',
  })
  status!: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: ['ALTA', 'MEDIA', 'BAJA'],
    default: 'MEDIA',
  })
  priority!: string;

  @Column({ name: 'due_date', type: 'datetime' })
  dueDate!: Date;

  @Column({ name: 'completion_date', type: 'datetime', nullable: true })
  completionDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
