export interface HttpConfigDTO {
  /**
   * @property {string} globalPrefix - Establece un prefijo para cada ruta registrada en una aplicación HTTP
   */
  globalPrefix: string;
  /**
   * @property {string} apiVersion - Define la versión de la API y se incrusta en la URI base
   */
  apiVersion: string;
  /**
   * @property {number} port - Define el puerto para conectarse a la API
   */
  port: number;
  /**
   * @property {string} hostname - Define el nombre de dominio de la API
   */
  hostname: string;
  /**
   * @property {string} url - Define la url completa de la API
   */
  url: string;
  /**
   * @property {string} name - Define el nombre interno de la aplicación
   */
  name: string;
  /**
   * @property {string} encriptionKey - Define la clave de encriptación a usar
   */
  encriptionKey: string;
  /**
   * @property {TokenConfigDTO} token - Define la configuración del JWT
   */
  token: TokenConfigDTO;
}

export interface TokenConfigDTO {
  /**
   * @property {string} expirationTime - Establece el tiempo de validez del JWT
   */
  expirationTime: string;

  /**
   * @property {string} refreshExpirationTime - Establece el tiempo de validez del JWT de refresco
   */
  refreshExpirationTime: string;

  /**
   * @property {string} expirationTime - Establece el tiempo de validez del JWT de contraseña
   */
  passwordExpirationTime: string;

  /**
   * @property {string} type - Establece el tipo de token
   */
  type: string;

  /**
   * @property {string} secret - Establece la clave secreta del JWT
   */
  secret: string;
}
