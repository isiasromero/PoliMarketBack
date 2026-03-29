/**
 * Entidad de Dominio: Tarea
 * Representa una tarea o actividad asignada a un vendedor
 */
export class Tarea {
  idTarea: number;
  idVendedor: number;
  titulo: string;
  descripcion?: string;
  tipo: 'VENTA' | 'ENTREGA' | 'LLAMADA' | 'SEGUIMIENTO' | 'DEMO' | 'REUNION';
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'ATRASADA';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  fechaVencimiento: Date;
  fechaCreacion: Date;
  fechaCompletacion?: Date;

  constructor(
    idTarea: number,
    idVendedor: number,
    titulo: string,
    tipo: 'VENTA' | 'ENTREGA' | 'LLAMADA' | 'SEGUIMIENTO' | 'DEMO' | 'REUNION',
    estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'ATRASADA',
    prioridad: 'ALTA' | 'MEDIA' | 'BAJA',
    fechaVencimiento: Date,
    fechaCreacion: Date,
    descripcion?: string,
    fechaCompletacion?: Date
  ) {
    this.idTarea = idTarea;
    this.idVendedor = idVendedor;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.estado = estado;
    this.prioridad = prioridad;
    this.fechaVencimiento = fechaVencimiento;
    this.fechaCreacion = fechaCreacion;
    this.fechaCompletacion = fechaCompletacion;
  }

  /**
   * Inicia la tarea (cambia estado a EN_PROGRESO)
   */
  iniciar(): void {
    if (this.estado === 'PENDIENTE') {
      this.estado = 'EN_PROGRESO';
    }
  }

  /**
   * Completa la tarea
   */
  completar(): void {
    this.estado = 'COMPLETADA';
    this.fechaCompletacion = new Date();
  }

  /**
   * Cancela la tarea
   */
  cancelar(): void {
    this.estado = 'CANCELADA';
  }

  /**
   * Verifica si la tarea está vencida
   */
  estaVencida(): boolean {
    return new Date() > this.fechaVencimiento && this.estado !== 'COMPLETADA' && this.estado !== 'CANCELADA';
  }
}
