import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM entities
import { HREmployeeOrmEntity } from './infrastructure/persistence/entities/empleado-rrhh.orm-entity';
import { AuthorizationOrmEntity } from './infrastructure/persistence/entities/autorizacion.orm-entity';

// Repository implementations
import { TypeOrmHREmployeeRepository } from './infrastructure/persistence/repositories/typeorm-empleado-rrhh.repository';
import { TypeOrmAuthorizationRepository } from './infrastructure/persistence/repositories/typeorm-autorizacion.repository';

// Repository tokens
import { HR_EMPLOYEE_REPOSITORY_TOKEN } from './domain/ports/outbound/empleado-rrhh.repository.port';
import { AUTHORIZATION_REPOSITORY_TOKEN } from './domain/ports/outbound/autorizacion.repository.port';

// Use cases
import { AuthorizeSellerUseCase } from './application/use-cases/autorizar-vendedor.use-case';
import { RevokeAuthorizationUseCase } from './application/use-cases/revocar-autorizacion.use-case';
import { GetAuthorizationsUseCase } from './application/use-cases/consultar-autorizaciones.use-case';
import { ValidateAccessUseCase } from './application/use-cases/validar-acceso.use-case';

/**
 * NestJS module for the RRHH (Human Resources) bounded context.
 * Registers ORM entities, binds repository implementations to their
 * domain port tokens, and provides all use cases for external consumption.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([HREmployeeOrmEntity, AuthorizationOrmEntity]),
  ],
  providers: [
    // Repository bindings
    {
      provide: HR_EMPLOYEE_REPOSITORY_TOKEN,
      useClass: TypeOrmHREmployeeRepository,
    },
    {
      provide: AUTHORIZATION_REPOSITORY_TOKEN,
      useClass: TypeOrmAuthorizationRepository,
    },
    // Use cases
    AuthorizeSellerUseCase,
    RevokeAuthorizationUseCase,
    GetAuthorizationsUseCase,
    ValidateAccessUseCase,
  ],
  exports: [
    // Export repository providers for cross-module injection
    AUTHORIZATION_REPOSITORY_TOKEN,
    HR_EMPLOYEE_REPOSITORY_TOKEN,
    AuthorizeSellerUseCase,
    RevokeAuthorizationUseCase,
    GetAuthorizationsUseCase,
    ValidateAccessUseCase,
  ],
})
export class RRHHModule {}
