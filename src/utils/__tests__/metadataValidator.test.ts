import { validateMetadata } from '../metadataValidator';

describe('metadataValidator', () => {
  describe('validateMetadata', () => {
    it('should validate correct metadata', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @description Test description
// @author Test Author
// @time body
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject metadata without Npplication block', () => {
      const content = `// @name Test Plugin
// @version 1.0.0`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('元数据块格式错误：未匹配到 ==Npplication==');
    });

    it('should reject metadata without required @name field', () => {
      const content = `// ==Npplication==
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必需字段(Must)：@name');
    });

    it('should reject metadata without required @id field', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @version 1.0.0
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必需字段(Must)：@id');
    });

    it('should reject metadata with invalid @id format', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @id invalid-id
// @version 1.0.0
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('无效的 @id 格式：应为 13 位时间戳 + UUID v4');
    });

    it('should reject metadata without required @version field', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少必需字段(Must)：@version');
    });

    it('should reject metadata with invalid @version format', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version invalid
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('无效的 @version 格式');
    });

    it('should warn about missing @time field', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.warnings).toContain('未发现 @time，将使用默认值: body');
    });

    it('should reject invalid @time value', () => {
      const content = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @time invalid
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('无效的 @time 值：应为 head 或 body');
    });

    it('should accept valid @time values', () => {
      const headContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @time head
// ==/Npplication==`;

      const bodyContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @time body
// ==/Npplication==`;

      expect(validateMetadata(headContent).valid).toBe(true);
      expect(validateMetadata(bodyContent).valid).toBe(true);
    });

    it('should validate translate plugin with required @translates', () => {
      const content = `// ==Npplication==
// @name Translate Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @type translate
// @translates zh-CN
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(true);
    });

    it('should reject translate plugin without @translates', () => {
      const content = `// ==Npplication==
// @name Translate Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @type translate
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('翻译插件缺少必需字段(Must for translate)：@translates');
    });

    it('should reject translate plugin with invalid @translates', () => {
      const content = `// ==Npplication==
// @name Translate Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @type translate
// @translates invalid
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('无效的 @translates 值：应为有效的语言代码（如 zh-CN, en-US）');
    });

    it('should accept valid language codes', () => {
      const zhContent = `// ==Npplication==
// @name Translate Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @type translate
// @translates zh-CN
// ==/Npplication==`;

      const enContent = `// ==Npplication==
// @name Translate Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// @type translate
// @translates en-US
// ==/Npplication==`;

      expect(validateMetadata(zhContent).valid).toBe(true);
      expect(validateMetadata(enContent).valid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const content = `// ==Npplication==
// @version invalid
// @time invalid
// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('缺少必需字段(Must)：@name');
      expect(result.errors).toContain('缺少必需字段(Must)：@id');
      expect(result.errors).toContain('无效的 @version 格式');
      expect(result.errors).toContain('无效的 @time 值：应为 head 或 body');
    });

    it('should handle metadata with extra whitespace', () => {
      const content = `// ==Npplication==

// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0

// ==/Npplication==`;

      const result = validateMetadata(content);
      expect(result.valid).toBe(true);
    });
  });
});
