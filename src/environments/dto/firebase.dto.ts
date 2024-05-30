export interface FirebaseDTO {
  /**
   * @property {string} projectId - Identificador único definido por el usuario para el proyecto en todo Firebase y Google Cloud
   */
  projectId: string;
  /**
   * @property {string} clientEmail - Cuenta de servicio de Firebase para acceso de administrador
   */
  clientEmail: string;
  /**
   * @property {string} privateKey - Clave privada de servicio de Firebase para acceso de administrador
   */
  privateKey: string;
  /**
   * @property {FirestoreDTO} firestore - Parámetros de configuración de la base de datos Cloud Firestore
   * @see https://firebase.google.com/docs/firestore
   */
  firestore: FirestoreDTO;
}

export interface FirestoreDTO {
  /**
   * @property {boolean} syncronize - Indica si se sincronizará la base de datos
   */
  syncronize: boolean;
}
