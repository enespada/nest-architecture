export interface MailConfigDTO {
  /**
   * @property {string} host - El nombre de host o la dirección IP para conectarse
   */
  host: string;
  /**
   * @property {string} service - Define el proveedor de la conexión SMTP
   * @see https://nodemailer.com/smtp/well-known/
   */
  service: string;
  /**
   * @property {boolean} secure - Define si la conexión debe usar SSL
   */
  secure: boolean;
  /**
   * @property {number} port - El puerto para conectarse
   */
  port: number;
  /**
   * @property {MailConfigAuthDTO} auth - Define las credenciales de acceso a la cuenta
   */
  auth: MailConfigAuthDTO;
  /**
   * @property {MailConfigTlsDTO} tls - Define opciones adicionales para pasar al constructor de socket
   */
  tls: MailConfigTlsDTO;
}

export interface MailConfigAuthDTO {
  /**
   * @property {string} user - Define el usuario de la cuenta
   */
  user: string;
  /**
   * @property {string} pass - Define la contraseña de la cuenta
   */
  pass: string;
}

export interface MailConfigTlsDTO {
  /**
   * @property {string} ciphers - Especificación de conjunto de cifrado, reemplazando el valor predeterminado. Para más información, consulte la modificación del conjunto de cifrado predeterminado. Permitido los cifrados se pueden obtener a través de tls.getCiphers(). Los nombres cifrados deben ser mayúsculas para que OpenSSL las acepte.
   */
  ciphers: string;
}
