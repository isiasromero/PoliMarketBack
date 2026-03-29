import { IsNumber, IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

/**
 * DTO for creating or updating a task (Tarea)
 */
export class CreateTareaDto {
  @IsNumber()
  sellerId!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['VENTA', 'ENTREGA', 'LLAMADA', 'SEGUIMIENTO', 'DEMO', 'REUNION'])
  type!: string;

  @IsEnum(['ALTA', 'MEDIA', 'BAJA'])
  priority!: string;

  @IsDateString()
  dueDate!: string;
}

/**
 * DTO for filtering tasks by status
 */
export class TareaFilterQueryDto {
  @IsOptional()
  @IsNumber()
  sellerId?: number;

  @IsOptional()
  @IsEnum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'ATRASADA'])
  status?: string;
}
