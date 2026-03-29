import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';

// ORM entities
import { TareaOrmEntity } from './infrastructure/persistence/entities/tarea.orm-entity';

// Repository implementation
import { TypeOrmTareaRepository } from './infrastructure/persistence/repositories/typeorm-tarea.repository';

// Repository token
import { TAREA_REPOSITORY_TOKEN } from './domain/ports/tarea.repository.port';

// Use cases
import { ObtenerTareasPorVendedorUseCase } from './application/use-cases/obtener-tareas-por-vendedor.use-case';
import { IniciarTareaUseCase } from './application/use-cases/iniciar-tarea.use-case';
import { CompletarTareaUseCase } from './application/use-cases/completar-tarea.use-case';
import { CrearTareaUseCase } from './application/use-cases/crear-tarea.use-case';
import { ListarTareasUseCase } from './application/use-cases/listar-tareas.use-case';

/**
 * NestJS module for the Tareas (Tasks) bounded context.
 * Configures TypeORM entities, binds the repository implementation to
 * its domain port token, and provides application use cases.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([TareaOrmEntity]),
    DatabaseModule,
  ],
  providers: [
    // Repository binding (port -> adapter)
    {
      provide: TAREA_REPOSITORY_TOKEN,
      useClass: TypeOrmTareaRepository,
    },

    // Use cases
    CrearTareaUseCase,
    ListarTareasUseCase,
    ObtenerTareasPorVendedorUseCase,
    IniciarTareaUseCase,
    CompletarTareaUseCase,
  ],
  exports: [
    CrearTareaUseCase,
    ListarTareasUseCase,
    ObtenerTareasPorVendedorUseCase,
    IniciarTareaUseCase,
    CompletarTareaUseCase,
  ],
})
export class TareasModule {}
