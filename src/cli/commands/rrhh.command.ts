import { Injectable } from '@nestjs/common';
import * as chalk from "chalk";;
import inquirer from 'inquirer';
import Table from 'cli-table3';
import { AdministracionFacade } from '../../facades/administracion.facade';

/**
 * Controlador de comandos CLI para el módulo de RRHH (Recursos Humanos).
 * Proporciona un submenú interactivo para gestionar autorizaciones de vendedores:
 * otorgar, revocar, listar y validar permisos de acceso.
 */
@Injectable()
export class RRHHCommand {
  constructor(private readonly adminFacade: AdministracionFacade) {}

  /**
   * Ejecuta el bucle del submenú interactivo de RRHH.
   * Muestra opciones y delega al método de fachada apropiado.
   */
  async run(): Promise<void> {
    let back = false;

    while (!back) {
      const { option } = await inquirer.prompt<{ option: string }>([
        {
          type: 'list',
          name: 'option',
          message: (chalk as any).yellow('RRHH - Seleccione una opcion:'),
          choices: [
            { name: '1. Autorizar vendedor', value: 'authorize' },
            { name: '2. Revocar autorizacion', value: 'revoke' },
            { name: '3. Ver autorizaciones de vendedor', value: 'list' },
            { name: '4. Validar acceso de vendedor', value: 'validate' },
            new inquirer.Separator(),
            { name: '0. Volver al menu principal', value: 'back' },
          ],
        },
      ]);

      switch (option) {
        case 'authorize':
          await this.handleAuthorizeSeller();
          break;
        case 'revoke':
          await this.handleRevokeAuthorization();
          break;
        case 'list':
          await this.handleGetAuthorizations();
          break;
        case 'validate':
          await this.handleValidateAccess();
          break;
        case 'back':
          back = true;
          break;
      }
    }
  }

  /**
   * Prompts for seller, employee, and system data then authorizes the seller.
   * @private
   */
  private async handleAuthorizeSeller(): Promise<void> {
    const answers = await inquirer.prompt<{
      sellerId: number;
      employeeId: number;
      system: string;
    }>([
      {
        type: 'number',
        name: 'sellerId',
        message: 'ID del vendedor:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'number',
        name: 'employeeId',
        message: 'ID del empleado RRHH:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'input',
        name: 'system',
        message: 'Sistema objetivo (ej: POS, CRM, ERP):',
        validate: (v: string) =>
          v.trim().length > 0 ? true : 'El sistema no puede estar vacio',
      },
    ]);

    const result = await this.adminFacade.authorizeSeller({
      sellerId: answers.sellerId,
      employeeId: answers.employeeId,
      system: answers.system,
    });

    if (result.success) {
      console.log((chalk as any).green('\n  Autorizacion creada exitosamente:'));
      console.log((chalk as any).white(`    ID: ${result.value.id}`));
      console.log((chalk as any).white(`    Sistema: ${result.value.targetSystem}`));
      console.log((chalk as any).white(`    Estado: ${result.value.status}\n`));
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Prompts for an authorization ID and revokes it.
   * @private
   */
  private async handleRevokeAuthorization(): Promise<void> {
    const { authorizationId } = await inquirer.prompt<{
      authorizationId: number;
    }>([
      {
        type: 'number',
        name: 'authorizationId',
        message: 'ID de la autorizacion a revocar:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const result = await this.adminFacade.revokeAuthorization(authorizationId);

    if (result.success) {
      console.log((chalk as any).green('\n  Autorizacion revocada exitosamente.\n'));
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }

  /**
   * Prompts for a seller ID and displays all their authorizations in a table.
   * @private
   */
  private async handleGetAuthorizations(): Promise<void> {
    const { sellerId } = await inquirer.prompt<{ sellerId: number }>([
      {
        type: 'number',
        name: 'sellerId',
        message: 'ID del vendedor:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
    ]);

    const authorizations = await this.adminFacade.getAuthorizations(sellerId);

    if (authorizations.length === 0) {
      console.log(
        (chalk as any).yellow('\n  No se encontraron autorizaciones para este vendedor.\n'),
      );
      return;
    }

    const table = new Table({
      head: [
        (chalk as any).cyan('ID'),
        (chalk as any).cyan('Empleado ID'),
        (chalk as any).cyan('Sistema'),
        (chalk as any).cyan('Estado'),
        (chalk as any).cyan('Fecha'),
      ],
    });

    for (const auth of authorizations) {
      table.push([
        String(auth.id),
        String(auth.employeeId),
        auth.targetSystem,
        auth.status === 'ACTIVE'
          ? (chalk as any).green(auth.status)
          : (chalk as any).red(auth.status),
        auth.authorizationDate
          ? new Date(auth.authorizationDate).toLocaleDateString()
          : 'N/A',
      ]);
    }

    console.log(`\n  Autorizaciones del vendedor ${sellerId}:`);
    console.log(table.toString());
    console.log('');
  }

  /**
   * Prompts for a seller ID and system, then validates access.
   * @private
   */
  private async handleValidateAccess(): Promise<void> {
    const answers = await inquirer.prompt<{
      sellerId: number;
      system: string;
    }>([
      {
        type: 'number',
        name: 'sellerId',
        message: 'ID del vendedor:',
        validate: (v: number) => (v > 0 ? true : 'Debe ser un numero positivo'),
      },
      {
        type: 'input',
        name: 'system',
        message: 'Sistema a validar:',
        validate: (v: string) =>
          v.trim().length > 0 ? true : 'El sistema no puede estar vacio',
      },
    ]);

    const result = await this.adminFacade.validateAccess(
      answers.sellerId,
      answers.system,
    );

    if (result.success) {
      if (result.value) {
        console.log(
          (chalk as any).green(
            `\n  El vendedor ${answers.sellerId} TIENE acceso al sistema "${answers.system}".\n`,
          ),
        );
      } else {
        console.log(
          (chalk as any).yellow(
            `\n  El vendedor ${answers.sellerId} NO tiene acceso al sistema "${answers.system}".\n`,
          ),
        );
      }
    } else {
      console.log((chalk as any).red(`\n  Error: ${result.error}\n`));
    }
  }
}
