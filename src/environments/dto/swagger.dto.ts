export interface SwaggerDTO {
  /**
   * @property {string} title - Define el título de la ventana de la API en Swagger
   */
  title: string;
  /**
   * @property {string} description - Define la descripción de la API en Swagger
   */
  description: string;
  /**
   * @property {string} description - Define la versión de la API en Swagger
   */
  version: string;
  /**
   * @property {string} authLocation - Define el lugar de la autenticación
   */
  authLocation: string;
  /**
   * @property {string} authLocation - Define el título principal de la API en Swagger
   */
  customHtmlTitle: string;
  /**
   * @property {string} username - Define el usuario de acceso para la API en Swagger
   */
  username: string;
  /**
   * @property {string} password - Define la contraseña de acceso para la API en Swagger
   */
  password: string;
  /**
   * @property {string} prefix - Define la ruta de acceso a la API de Swagger
   */
  prefix: string;
}
