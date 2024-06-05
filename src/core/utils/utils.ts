import { FindOperator, Like } from 'typeorm';

/**
 * Este método recoge un objeto con propiedades que contienen puntos y devuelve otro objeto que contiene
 * un nivel de anidacion equivalente al de los puntos de las propiedades
 * @param {any} obj - Objeto inicial con propiedades con puntos.
 * @returns {any} Objeto anidado.
 */
export function nestDottedObject(obj: any): any {
  const res: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const pieces = key.split('.');
      let nestedAux = res;
      for (let i = 0; i < pieces.length - 1; i++) {
        const piece = pieces[i];
        nestedAux[piece] = nestedAux[piece] || {};
        nestedAux = nestedAux[piece];
      }
      nestedAux[pieces[pieces.length - 1]] = value;
    }
  }
  return res;
}

/**
 * Este método recoge un objeto y devuelve el mismo objeto pero poniendo
 * en cada valor de cada propiedad string un Like de typeorm para ser utilizado en un where.
 * @param {any} obj - Objeto inicial con propiedades con puntos.
 * @returns {any} Objeto con Like.
 */
export function changeToLike(obj: any): any | undefined {
  const res: any = {};
  if (typeof obj === 'string') {
    return Like(`%${obj}%`);
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        res[key] = changeToLike(obj[key]);
      } else {
        res[key] = Like(`%${obj[key]}%`);
      }
    }
  }
  return res; // Valor no encontrado
}

export function getValueByNestedKey(obj: any): any | undefined {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nestedValue = getValueByNestedKey(obj[key]);
        if (nestedValue !== undefined) return nestedValue;
      } else {
        return obj[key];
      }
    }
  }
  return undefined; // Valor no encontrado
}

export function getNestedProperty(obj: any, path: string): any {
  const properties = path.split('.');
  let value = obj;

  for (const prop of properties) {
    if (value && typeof value === 'object' && prop in value) {
      value = value[prop];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Este método deuvelve una lista con los elementos que estén en ambas listas pasadas como parámetro.
 * Para comprobar que los elementos están en ambas listas estos elementos de tipo T deben tener una propiedad id.
 * @param {Array<T>} firstArray - Lista 1.
 * @param {Array<T>} secondArray - Lista 2.
 * @returns {Array<T>} Lista con los objetos que hay en ambas listas.
 */
export function intersectObjects<T>(
  firstArray: Array<T>,
  secondArray: Array<T>,
) {
  const provEntities: Array<T> = [];
  let firstArrayToTraverse: Array<T>;
  let secondArrayToTraverse: Array<T>;
  if (firstArray.length >= secondArray.length) {
    firstArrayToTraverse = firstArray;
    secondArrayToTraverse = secondArray;
  } else {
    firstArrayToTraverse = secondArray;
    secondArrayToTraverse = firstArray;
  }
  for (const sattItem of secondArrayToTraverse) {
    if (
      firstArrayToTraverse.filter((fattItem) => {
        return fattItem['id'] === sattItem['id'];
      }).length > 0
    )
      provEntities.push(sattItem);
  }
  return provEntities;
}

/**
 * Este método recoge una lista de objetos y devuelve un objeto con las propiedades de los objetos de la lista
 * situadas según el nivel de anidacion de los objetos de la lista. Ninguna propiedad cuyo valor NO sea un objeto puede
 * estar en mas de un objeto de la lista. Si no, el funcionamiento no sera el esperado.
 * @param {Array<any>} objects - Lista de objetos.
 * @returns {any} Objeto anidado.
 */
export function combineObjectsArray(objects: Array<any>): any {
  const result = {};
  for (const obj of objects) {
    mergeDeep(result, obj);
  }
  return result;
}

function mergeDeep(target: any, source: any): any {
  if (
    typeof target !== 'object' ||
    typeof source !== 'object' ||
    target === null ||
    source === null
  ) {
    return source;
  }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof FindOperator) {
        // Directly assign FindOperator instances
        target[key] = source[key];
      } else if (
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) {
          target[key] = {};
        }
        target[key] = mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return target;
}
