/**
 * Date helper functions for import/export functionality
 * Handles serialization and deserialization of Date objects
 */

/**
 * Serialize a Date object to ISO string
 * @param date - Date object to serialize
 * @returns ISO string representation or null if date is null/undefined
 */
export function serializeDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Deserialize an ISO string to Date object
 * @param isoString - ISO string to deserialize
 * @returns Date object or null if string is null/undefined/invalid
 */
export function deserializeDate(isoString: string | null | undefined): Date | null {
  if (!isoString) return null;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Serialize an array of Date objects to ISO strings
 * @param dates - Array of Date objects to serialize
 * @returns Array of ISO strings
 */
export function serializeDates(dates: (Date | null | undefined)[]): (string | null)[] {
  return dates.map(serializeDate);
}

/**
 * Deserialize an array of ISO strings to Date objects
 * @param isoStrings - Array of ISO strings to deserialize
 * @returns Array of Date objects
 */
export function deserializeDates(isoStrings: (string | null | undefined)[]): (Date | null)[] {
  return isoStrings.map(deserializeDate);
}

/**
 * Convert an object with Date fields to one with ISO string fields
 * @param obj - Object with Date fields
 * @param dateFields - Array of field names that contain Date objects
 * @returns Object with Date fields converted to ISO strings
 */
export function serializeObjectDates<T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): Record<string, any> {
  const result: Record<string, any> = { ...obj };
  for (const field of dateFields) {
    result[field as string] = serializeDate(obj[field]);
  }
  return result;
}

/**
 * Convert an object with ISO string fields to one with Date fields
 * @param obj - Object with ISO string fields
 * @param dateFields - Array of field names that should be Date objects
 * @returns Object with ISO string fields converted to Date objects
 */
export function deserializeObjectDates<T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): Record<string, any> {
  const result: Record<string, any> = { ...obj };
  for (const field of dateFields) {
    result[field as string] = deserializeDate(obj[field]);
  }
  return result;
}

/**
 * Convert an array of objects with Date fields to one with ISO string fields
 * @param objects - Array of objects with Date fields
 * @param dateFields - Array of field names that contain Date objects
 * @returns Array of objects with Date fields converted to ISO strings
 */
export function serializeArrayDates<T extends Record<string, any>>(
  objects: T[],
  dateFields: (keyof T)[]
): Record<string, any>[] {
  return objects.map((obj) => serializeObjectDates(obj, dateFields));
}

/**
 * Convert an array of objects with ISO string fields to one with Date fields
 * @param objects - Array of objects with ISO string fields
 * @param dateFields - Array of field names that should be Date objects
 * @returns Array of objects with ISO string fields converted to Date objects
 */
export function deserializeArrayDates<T extends Record<string, any>>(
  objects: T[],
  dateFields: (keyof T)[]
): Record<string, any>[] {
  return objects.map((obj) => deserializeObjectDates(obj, dateFields));
}
