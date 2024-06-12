export interface AwsDTO {
  /**
   * @property {string} userPoolId - Identificador único definido por AWS para el grupo de usuarios en cognito
   */
  userPoolId: string;
  /**
   * @property {string} region - Recurso de autenticación del grupo de usuarios adjuntado a la aplicación
   */
  clientId: string;
  /**
   * @property {string} region - Región donde se aloja la aplicación
   */
  region: string;
  /**
   * @property {string} bucket - Nombre del depósito (bucket) en el que se iniciarán las acciones.
   */
  bucket: string;
  /**
   * @property {string} accessKeyId - Identificador de acceso a los servicios de aws
   */
  accessKeyId: string;
  /**
   * @property {string} secretAccessKey - Clave de acceso a los servicios de aws
   */
  secretAccessKey: string;
}
