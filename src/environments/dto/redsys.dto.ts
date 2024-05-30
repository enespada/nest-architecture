export interface RedsysDTO {
  /**
   * @property {string} redsysUrl - URL del entorno a conectarse de Redsys
   */
  redsysUrl: string;
  /**
   * @property {string} MERCHANT_KEY - Clave de la firma
   */
  MERCHANT_KEY: string;
  /**
   * @property {string} DS_SIGNATURE_VERSION - Versión concreta de algoritmo que se está utilizando para la firma
   */
  DS_SIGNATURE_VERSION: string;
  /**
   * @property {string} DS_MERCHANT_MERCHANTCODE - Código FUC asignado al comercio.(Nº de comercio)
   */
  DS_MERCHANT_MERCHANTCODE: string;
  /**
   * @property {string} DS_MERCHANT_CURRENCY - Código numérico de la moneda según el ISO-4217
   */
  DS_MERCHANT_CURRENCY: string;
  /**
   * @property {string} DS_MERCHANT_TRANSACTIONTYPE - Tipo de operación
   */
  DS_MERCHANT_TRANSACTIONTYPE: string;
  /**
   * @property {string} DS_MERCHANT_TERMINAL - Número de terminal que le asignará su banco
   */
  DS_MERCHANT_TERMINAL: string;
  /**
   * @property {string} DS_MERCHANT_MERCHANTURL - Si el comercio tiene configurada notificación online "HTTP" en el módulo de administración, se enviará una petición post con el resultado de la transacción a la URL especificada
   */
  DS_MERCHANT_MERCHANTURL: string;
  /**
   * @property {string} DS_MERCHANT_URLOK - URL en la que se enviará una petición HTTP get cuando el resultado de la transacción sea OK. Si este parámetro no viene informado se usará la configuración en el módulo de administración
   */
  DS_MERCHANT_URLOK: string;
  /**
   * @property {string} DS_MERCHANT_URLKO - URL en la que se enviará una petición HTTP get cuando el resultado de la transacción sea KO. Si este parámetro no viene informado se usará la configuración en el módulo de administración
   */
  DS_MERCHANT_URLKO: string;
  /**
   * @property {string} DS_MERCHANT_NAME - Nombre del comercio
   */
  DS_MERCHANT_NAME: string;
}
