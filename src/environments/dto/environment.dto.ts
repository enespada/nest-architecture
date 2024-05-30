import { ENV } from '../../app/core/constants/constants';

export interface EnvironmentDTO {
  /**
   * @property {ENV} env - Define el entorno actual de desarrollo
   */
  env: ENV;
  /**
   * @property {boolean} development - Indica si el entorno actual es desarrollo
   */
  development: boolean;
  /**
   * @property {boolean} preproduction - Indica si el entorno actual es preproducción
   */
  preproduction: boolean;
  /**
   * @property {boolean} production - Indica si el entorno actual es producción
   */
  production: boolean;
}
