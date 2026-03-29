import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ObtenerTareasPorVendedorUseCase } from '../../modules/tareas/application/use-cases/obtener-tareas-por-vendedor.use-case';
import { IniciarTareaUseCase } from '../../modules/tareas/application/use-cases/iniciar-tarea.use-case';
import { CompletarTareaUseCase } from '../../modules/tareas/application/use-cases/completar-tarea.use-case';
import { CrearTareaUseCase } from '../../modules/tareas/application/use-cases/crear-tarea.use-case';
import { ListarTareasUseCase } from '../../modules/tareas/application/use-cases/listar-tareas.use-case';
import { CreateTareaDto, TareaFilterQueryDto } from '../dto/tareas.dto';
import { unwrapResult } from '../filters/result-exception.filter';
import { Tarea } from '../../modules/tareas/domain/entities/tarea.entity';
import { AdministracionFacade } from '../../facades/administracion.facade';

/**
 * REST controller for tasks (Tareas) operations.
 *
 * Exposes endpoints for managing tasks assigned to sellers,
 * including creating, starting, completing, and retrieving tasks.
 */
@ApiTags('Tasks')
@Controller('api/tasks')
export class TareasController {
  constructor(
    private readonly obtenerTareasPorVendedorUseCase: ObtenerTareasPorVendedorUseCase,
    private readonly iniciarTareaUseCase: IniciarTareaUseCase,
    private readonly completarTareaUseCase: CompletarTareaUseCase,
    private readonly crearTareaUseCase: CrearTareaUseCase,
    private readonly listarTareasUseCase: ListarTareasUseCase,
    private readonly administracionFacade: AdministracionFacade,
  ) {}

  /**
   * Retrieves tasks with optional filtering by seller and status.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List tasks (optional filters)' })
  @ApiQuery({ name: 'sellerId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDIENTE','EN_PROGRESO','COMPLETADA','CANCELADA','ATRASADA'] })
  @ApiResponse({ status: 200, description: 'Tasks listed successfully.' })
  async listarTareas(@Query() query: TareaFilterQueryDto): Promise<Tarea[]> {
    const result = await this.listarTareasUseCase.execute({
      sellerId: query.sellerId,
      status: query.status as any,
    });
    return unwrapResult(result, HttpStatus.OK);
  }

  /**
   * Alias para obtener vendedores desde el contexto de Tasks.
   */
  @Get('sellers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all sellers (alias)' })
  @ApiResponse({ status: 200, description: 'List of sellers returned successfully.' })
  async getSellersAlias(): Promise<any[]> {
    const result = await this.administracionFacade.obtenerVendedores();
    return unwrapResult(result, HttpStatus.OK);
  }

  /**
   * Retrieves all tasks assigned to a specific seller.
   *
   * @param sellerId - Path parameter identifying the seller
   * @returns An array of Task entities for the given seller
   */
  @Get('seller/:sellerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tasks for a seller' })
  @ApiParam({ name: 'sellerId', type: Number, description: 'Seller ID' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks returned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid seller ID.',
  })
  async getTareasPorVendedor(
    @Param('sellerId', ParseIntPipe) sellerId: number,
  ): Promise<Tarea[]> {
    const result = await this.obtenerTareasPorVendedorUseCase.execute(sellerId);
    return unwrapResult(result, HttpStatus.OK);
  }

  /**
   * Starts a task, transitioning its status from PENDIENTE to EN_PROGRESO.
   *
   * @param taskId - The task ID to start
   * @returns The updated Task entity
   */
  @Patch(':taskId/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a task (change status to EN_PROGRESO)' })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task started successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task ID or task not found.',
  })
  async iniciarTarea(
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<Tarea> {
    const result = await this.iniciarTareaUseCase.execute(taskId);
    return unwrapResult(result, HttpStatus.OK);
  }

  /**
   * Completes a task, transitioning its status to COMPLETADA and setting completion date.
   *
   * @param taskId - The task ID to complete
   * @returns The updated Task entity
   */
  @Patch(':taskId/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a task' })
  @ApiParam({ name: 'taskId', type: Number, description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task completed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid task ID or task not found.',
  })
  async completarTarea(
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<Tarea> {
    const result = await this.completarTareaUseCase.execute(taskId);
    return unwrapResult(result, HttpStatus.OK);
  }

  /**
   * Creates a new task assigned to a seller.
   *
   * @param body - CreateTareaDto with task fields
   * @returns The created Task entity
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async crearTarea(@Body() body: CreateTareaDto): Promise<Tarea> {
    const result = await this.crearTareaUseCase.execute({
      sellerId: body.sellerId,
      title: body.title,
      description: body.description,
      type: body.type as any,
      priority: body.priority as any,
      dueDate: body.dueDate,
    });
    return unwrapResult(result, HttpStatus.CREATED);
  }
}
