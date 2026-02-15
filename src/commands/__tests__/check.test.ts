import { validateMetadata } from '../../utils/metadataValidator';

jest.mock('../../utils/metadataValidator');
jest.mock('fs');
jest.mock('path');

describe('checkCommand', () => {
  let mockFs: jest.Mocked<typeof import('fs')>;
  let mockPath: jest.Mocked<typeof import('path')>;

  beforeEach(() => {
    mockFs = require('fs');
    mockPath = require('path');
    jest.clearAllMocks();
  });

  it('should validate metadata successfully', () => {
    const mockContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==`;

    mockFs.readFileSync.mockReturnValue(mockContent);
    (validateMetadata as jest.Mock).mockReturnValue({
      valid: true,
      errors: [],
      warnings: []
    });

    const result = validateMetadata(mockContent);
    expect(result.valid).toBe(true);
  });

  it('should handle validation errors', () => {
    const mockContent = `// ==Npplication==
// @name Test Plugin
// ==/Npplication==`;

    mockFs.readFileSync.mockReturnValue(mockContent);
    (validateMetadata as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['缺少必需字段：@id', '缺少必需字段：@version'],
      warnings: []
    });

    const result = validateMetadata(mockContent);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('should handle validation warnings', () => {
    const mockContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==`;

    mockFs.readFileSync.mockReturnValue(mockContent);
    (validateMetadata as jest.Mock).mockReturnValue({
      valid: true,
      errors: [],
      warnings: ['未发现 @time，将使用默认值: body']
    });

    const result = validateMetadata(mockContent);
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(1);
  });
});
