import { generatePluginId, validatePluginId } from '../idGenerator';

describe('idGenerator', () => {
  describe('generatePluginId', () => {
    it('should generate a valid plugin ID', () => {
      const id = generatePluginId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should generate ID with timestamp and UUID format', () => {
      const id = generatePluginId();
      const parts = id.split('_');
      expect(parts).toHaveLength(2);
      
      const timestamp = parts[0];
      const uuid = parts[1];
      
      expect(timestamp).toMatch(/^\d{13}$/);
      expect(uuid).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/);
    });

    it('should generate unique IDs', () => {
      const id1 = generatePluginId();
      const id2 = generatePluginId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('validatePluginId', () => {
    it('should validate a correct plugin ID', () => {
      const validId = '1749401460000_550e8400-e29b-41d4-a716-446655440000';
      expect(validatePluginId(validId)).toBe(true);
    });

    it('should reject ID with invalid format', () => {
      expect(validatePluginId('invalid-id')).toBe(false);
      expect(validatePluginId('')).toBe(false);
      expect(validatePluginId('123_abc')).toBe(false);
    });

    it('should reject ID with invalid UUID version', () => {
      const invalidUuidId = '1749401460000_550e8400-e29b-51d4-a716-446655440000';
      expect(validatePluginId(invalidUuidId)).toBe(false);
    });

    it('should reject ID with timestamp below minimum', () => {
      const oldTimestampId = '1000000000000_550e8400-e29b-41d4-a716-446655440000';
      expect(validatePluginId(oldTimestampId)).toBe(false);
    });

    it('should accept ID with minimum timestamp', () => {
      const minTimestampId = '1749401460000_550e8400-e29b-41d4-a716-446655440000';
      expect(validatePluginId(minTimestampId)).toBe(true);
    });

    it('should accept ID with current timestamp', () => {
      const currentTimestamp = Date.now().toString();
      const currentId = `${currentTimestamp}_550e8400-e29b-41d4-a716-446655440000`;
      expect(validatePluginId(currentId)).toBe(true);
    });
  });
});
