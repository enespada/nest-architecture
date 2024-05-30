export interface DatabaseDTO {
  /**
   * @property {string} type - Define el tipo de base de datos
   */
  type: string;
  /**
   * @property {string} host - Define la ubicación de su servidor y base de datos
   */
  host: string;
  /**
   * @property {number} port - Define el puerto de la base de datos al que conectarse
   */
  port: number;
  /**
   * @property {string} username - Define el usuario de la base de datos
   */
  username: string;
  /**
   * @property {string} password - Define la contraseña de la base de datos
   */
  password: string;
  /**
   * @property {string} database - Nombre de la base de datos a la que conectarse
   */
  database: string;
  /**
   * @property {Array<any>} entities - Entidades a cargar para esta conexión.
   *
   * Acepta clases de entidad y directorios desde donde se deben cargar las entidades.
   * Los directorios admiten patrones globales.
   */
  entities: Array<any>;
  synchronize: boolean;
}
