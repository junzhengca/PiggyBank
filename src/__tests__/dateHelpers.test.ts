/**
 * Unit tests for date helpers
 */

import { describe, it, expect } from 'vitest';
import {
  serializeDate,
  deserializeDate,
  serializeDates,
  deserializeDates,
  serializeObjectDates,
  deserializeObjectDates,
  serializeArrayDates,
  deserializeArrayDates,
} from '@/lib/dateHelpers';

describe('serializeDate', () => {
  it('should serialize a valid Date object to ISO string', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');
    const result = serializeDate(date);
    expect(result).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should return null for null input', () => {
    const result = serializeDate(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined input', () => {
    const result = serializeDate(undefined);
    expect(result).toBeNull();
  });

  it('should preserve milliseconds in ISO string', () => {
    const date = new Date('2024-01-15T10:30:00.123Z');
    const result = serializeDate(date);
    expect(result).toBe('2024-01-15T10:30:00.123Z');
  });
});

describe('deserializeDate', () => {
  it('should deserialize a valid ISO string to Date object', () => {
    const isoString = '2024-01-15T10:30:00.000Z';
    const result = deserializeDate(isoString);
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toBe(isoString);
  });

  it('should return null for null input', () => {
    const result = deserializeDate(null);
    expect(result).toBeNull();
  });

  it('should return null for undefined input', () => {
    const result = deserializeDate(undefined);
    expect(result).toBeNull();
  });

  it('should return null for invalid date string', () => {
    const result = deserializeDate('not-a-valid-date');
    expect(result).toBeNull();
  });

  it('should handle ISO strings with milliseconds', () => {
    const isoString = '2024-01-15T10:30:00.123Z';
    const result = deserializeDate(isoString);
    expect(result?.toISOString()).toBe(isoString);
  });
});

describe('serializeDates', () => {
  it('should serialize an array of Date objects', () => {
    const dates = [
      new Date('2024-01-15T10:30:00.000Z'),
      new Date('2024-02-20T14:45:00.000Z'),
      null,
      undefined,
    ];
    const result = serializeDates(dates);
    expect(result).toEqual([
      '2024-01-15T10:30:00.000Z',
      '2024-02-20T14:45:00.000Z',
      null,
      null,
    ]);
  });

  it('should handle empty array', () => {
    const result = serializeDates([]);
    expect(result).toEqual([]);
  });

  it('should handle array with only null/undefined values', () => {
    const dates = [null, undefined, null];
    const result = serializeDates(dates);
    expect(result).toEqual([null, null, null]);
  });
});

describe('deserializeDates', () => {
  it('should deserialize an array of ISO strings', () => {
    const isoStrings = [
      '2024-01-15T10:30:00.000Z',
      '2024-02-20T14:45:00.000Z',
      null,
      undefined,
    ];
    const result = deserializeDates(isoStrings);
    expect(result).toHaveLength(4);
    expect(result[0]).toBeInstanceOf(Date);
    expect(result[0]?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    expect(result[1]).toBeInstanceOf(Date);
    expect(result[1]?.toISOString()).toBe('2024-02-20T14:45:00.000Z');
    expect(result[2]).toBeNull();
    expect(result[3]).toBeNull();
  });

  it('should handle empty array', () => {
    const result = deserializeDates([]);
    expect(result).toEqual([]);
  });

  it('should handle array with only null/undefined values', () => {
    const isoStrings = [null, undefined, null];
    const result = deserializeDates(isoStrings);
    expect(result).toEqual([null, null, null]);
  });

  it('should return null for invalid date strings', () => {
    const isoStrings = ['not-a-date', 'also-not-a-date'];
    const result = deserializeDates(isoStrings);
    expect(result).toEqual([null, null]);
  });
});

describe('serializeObjectDates', () => {
  it('should serialize Date fields in an object', () => {
    const obj = {
      id: '123',
      name: 'Test',
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
      updatedAt: new Date('2024-02-20T14:45:00.000Z'),
    };
    const result = serializeObjectDates(obj, ['createdAt', 'updatedAt']);
    expect(result.id).toBe('123');
    expect(result.name).toBe('Test');
    expect(result.createdAt).toBe('2024-01-15T10:30:00.000Z');
    expect(result.updatedAt).toBe('2024-02-20T14:45:00.000Z');
  });

  it('should handle null/undefined Date fields', () => {
    const obj = {
      id: '123',
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
      updatedAt: null,
      deletedAt: undefined,
    };
    const result = serializeObjectDates(obj, ['createdAt', 'updatedAt', 'deletedAt']);
    expect(result.createdAt).toBe('2024-01-15T10:30:00.000Z');
    expect(result.updatedAt).toBeNull();
    expect(result.deletedAt).toBeNull();
  });

  it('should not modify non-Date fields', () => {
    const obj = {
      id: '123',
      count: 42,
      active: true,
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
    };
    const result = serializeObjectDates(obj, ['createdAt']);
    expect(result.id).toBe('123');
    expect(result.count).toBe(42);
    expect(result.active).toBe(true);
  });

  it('should handle empty dateFields array', () => {
    const obj = {
      id: '123',
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
    };
    const result = serializeObjectDates(obj, []);
    expect(result.id).toBe('123');
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});

describe('deserializeObjectDates', () => {
  it('should deserialize ISO string fields in an object', () => {
    const obj = {
      id: '123',
      name: 'Test',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-02-20T14:45:00.000Z',
    };
    const result = deserializeObjectDates(obj, ['createdAt', 'updatedAt']);
    expect(result.id).toBe('123');
    expect(result.name).toBe('Test');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.updatedAt?.toISOString()).toBe('2024-02-20T14:45:00.000Z');
  });

  it('should handle null/undefined ISO string fields', () => {
    const obj = {
      id: '123',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: null,
      deletedAt: undefined,
    };
    const result = deserializeObjectDates(obj, ['createdAt', 'updatedAt', 'deletedAt']);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeNull();
    expect(result.deletedAt).toBeNull();
  });

  it('should return null for invalid date strings', () => {
    const obj = {
      id: '123',
      createdAt: 'not-a-date',
    };
    const result = deserializeObjectDates(obj, ['createdAt']);
    expect(result.createdAt).toBeNull();
  });

  it('should not modify non-date string fields', () => {
    const obj = {
      id: '123',
      name: 'Test Name',
      createdAt: '2024-01-15T10:30:00.000Z',
    };
    const result = deserializeObjectDates(obj, ['createdAt']);
    expect(result.id).toBe('123');
    expect(result.name).toBe('Test Name');
  });
});

describe('serializeArrayDates', () => {
  it('should serialize Date fields in an array of objects', () => {
    const objects = [
      {
        id: '1',
        createdAt: new Date('2024-01-15T10:30:00.000Z'),
        updatedAt: new Date('2024-02-20T14:45:00.000Z'),
      },
      {
        id: '2',
        createdAt: new Date('2024-03-10T08:00:00.000Z'),
        updatedAt: null,
      },
    ];
    const result = serializeArrayDates(objects, ['createdAt', 'updatedAt']);
    expect(result).toHaveLength(2);
    expect(result[0].createdAt).toBe('2024-01-15T10:30:00.000Z');
    expect(result[0].updatedAt).toBe('2024-02-20T14:45:00.000Z');
    expect(result[1].createdAt).toBe('2024-03-10T08:00:00.000Z');
    expect(result[1].updatedAt).toBeNull();
  });

  it('should handle empty array', () => {
    const result = serializeArrayDates([], ['createdAt']);
    expect(result).toEqual([]);
  });

  it('should handle array with objects having different Date fields', () => {
    const objects = [
      { id: '1', date: new Date('2024-01-15T10:30:00.000Z') },
      { id: '2', date: null },
      { id: '3', date: undefined },
    ];
    const result = serializeArrayDates(objects, ['date']);
    expect(result[0].date).toBe('2024-01-15T10:30:00.000Z');
    expect(result[1].date).toBeNull();
    expect(result[2].date).toBeNull();
  });
});

describe('deserializeArrayDates', () => {
  it('should deserialize ISO string fields in an array of objects', () => {
    const objects = [
      {
        id: '1',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-02-20T14:45:00.000Z',
      },
      {
        id: '2',
        createdAt: '2024-03-10T08:00:00.000Z',
        updatedAt: null,
      },
    ];
    const result = deserializeArrayDates(objects, ['createdAt', 'updatedAt']);
    expect(result).toHaveLength(2);
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].createdAt?.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    expect(result[0].updatedAt).toBeInstanceOf(Date);
    expect(result[0].updatedAt?.toISOString()).toBe('2024-02-20T14:45:00.000Z');
    expect(result[1].createdAt).toBeInstanceOf(Date);
    expect(result[1].createdAt?.toISOString()).toBe('2024-03-10T08:00:00.000Z');
    expect(result[1].updatedAt).toBeNull();
  });

  it('should handle empty array', () => {
    const result = deserializeArrayDates([], ['createdAt']);
    expect(result).toEqual([]);
  });

  it('should return null for invalid date strings', () => {
    const objects = [
      { id: '1', date: 'not-a-date' },
      { id: '2', date: 'also-not-a-date' },
    ];
    const result = deserializeArrayDates(objects, ['date']);
    expect(result[0].date).toBeNull();
    expect(result[1].date).toBeNull();
  });
});

describe('roundtrip serialization', () => {
  it('should preserve data through serialize then deserialize', () => {
    const originalDate = new Date('2024-01-15T10:30:00.123Z');
    const serialized = serializeDate(originalDate);
    const deserialized = deserializeDate(serialized);
    expect(deserialized?.toISOString()).toBe(originalDate.toISOString());
  });

  it('should preserve array data through serialize then deserialize', () => {
    const originalDates = [
      new Date('2024-01-15T10:30:00.000Z'),
      new Date('2024-02-20T14:45:00.000Z'),
      null,
    ];
    const serialized = serializeDates(originalDates);
    const deserialized = deserializeDates(serialized);
    expect(deserialized[0]?.toISOString()).toBe(originalDates[0]?.toISOString());
    expect(deserialized[1]?.toISOString()).toBe(originalDates[1]?.toISOString());
    expect(deserialized[2]).toBeNull();
  });

  it('should preserve object data through serialize then deserialize', () => {
    const originalObject = {
      id: '123',
      name: 'Test',
      createdAt: new Date('2024-01-15T10:30:00.000Z'),
      updatedAt: new Date('2024-02-20T14:45:00.000Z'),
    };
    const serialized = serializeObjectDates(originalObject, ['createdAt', 'updatedAt']);
    const deserialized = deserializeObjectDates(serialized, ['createdAt', 'updatedAt']);
    expect(deserialized.id).toBe(originalObject.id);
    expect(deserialized.name).toBe(originalObject.name);
    expect(deserialized.createdAt?.toISOString()).toBe(originalObject.createdAt.toISOString());
    expect(deserialized.updatedAt?.toISOString()).toBe(originalObject.updatedAt.toISOString());
  });

  it('should preserve array of objects through serialize then deserialize', () => {
    const originalObjects = [
      {
        id: '1',
        createdAt: new Date('2024-01-15T10:30:00.000Z'),
        updatedAt: new Date('2024-02-20T14:45:00.000Z'),
      },
      {
        id: '2',
        createdAt: new Date('2024-03-10T08:00:00.000Z'),
        updatedAt: null,
      },
    ];
    const serialized = serializeArrayDates(originalObjects, ['createdAt', 'updatedAt']);
    const deserialized = deserializeArrayDates(serialized, ['createdAt', 'updatedAt']);
    expect(deserialized[0].id).toBe(originalObjects[0].id);
    expect(deserialized[0].createdAt?.toISOString()).toBe(originalObjects[0].createdAt.toISOString());
    expect(deserialized[0].updatedAt?.toISOString()).toBe(originalObjects[0].updatedAt?.toISOString());
    expect(deserialized[1].id).toBe(originalObjects[1].id);
    expect(deserialized[1].createdAt?.toISOString()).toBe(originalObjects[1].createdAt.toISOString());
    expect(deserialized[1].updatedAt).toBeNull();
  });
});
