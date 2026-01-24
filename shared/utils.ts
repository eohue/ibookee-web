/**
 * PostgreSQL text columns do not allow null bytes (0x00).
 * This utility removes them from string inputs.
 */
export const sanitizeString = <T>(str: T): T => {
    if (str === null || str === undefined) return str;
    if (typeof str !== 'string') return str;
    return (str as string).replace(/\x00/g, '') as T;
};

/**
 * Recursively sanitizes all string properties in an object.
 */
export const sanitizeObject = <T extends object>(obj: T): T => {
    if (!obj) return obj;

    const newObj = { ...obj };

    for (const key in newObj) {
        if (Object.prototype.hasOwnProperty.call(newObj, key)) {
            const value = newObj[key];
            if (typeof value === 'string') {
                (newObj as any)[key] = sanitizeString(value);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
                (newObj as any)[key] = sanitizeObject(value as any);
            }
        }
    }

    return newObj;
};
