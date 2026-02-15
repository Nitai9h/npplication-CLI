import { validateMetadata } from '../../utils/metadataValidator';

jest.mock('../../utils/metadataValidator');
jest.mock('fs');
jest.mock('path');
jest.mock('terser');

describe('buildCommand', () => {
  let mockFs: jest.Mocked<typeof import('fs')>;
  let mockPath: jest.Mocked<typeof import('path')>;

  beforeEach(() => {
    mockFs = require('fs');
    mockPath = require('path');
    jest.clearAllMocks();
  });

  it('should extract metadata block from plugin file', () => {
    const mockContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==

(function() {
    console.log('Hello World');
})();`;

    const metadataMatch = mockContent.match(/\/\/\s*==Npplication==\s*\n([\s\S]*?)\n\/\/\s*==\/Npplication==/);
    expect(metadataMatch).not.toBeNull();
    expect(metadataMatch?.[0]).toContain('// ==Npplication==');
    expect(metadataMatch?.[0]).toContain('// ==/Npplication==');
  });

  it('should separate metadata from code content', () => {
    const mockContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==

(function() {
    console.log('Hello World');
})();`;

    const metadataMatch = mockContent.match(/\/\/\s*==Npplication==\s*\n([\s\S]*?)\n\/\/\s*==\/Npplication==/);
    const metadataBlock = metadataMatch ? metadataMatch[0] : '';
    const codeContent = mockContent.replace(metadataBlock, '');

    expect(metadataBlock).toContain('// ==Npplication==');
    expect(codeContent).toContain('(function() {');
    expect(codeContent).not.toContain('// ==Npplication==');
  });

  it('should generate correct output filename', () => {
    const inputPath = 'plugin.js';
    const outputPath = inputPath.replace(/\.js$/, '-compressed.js');
    expect(outputPath).toBe('plugin-compressed.js');
  });

  it('should validate minified content', () => {
    const minifiedContent = `// ==Npplication==
// @name Test Plugin
// @id 1749401460000_550e8400-e29b-41d4-a716-446655440000
// @version 1.0.0
// ==/Npplication==
console.log("Hello World");`;

    (validateMetadata as jest.Mock).mockReturnValue({
      valid: true,
      errors: [],
      warnings: []
    });

    const result = validateMetadata(minifiedContent);
    expect(result.valid).toBe(true);
  });

  it('should handle validation errors in minified content', () => {
    const minifiedContent = `// ==Npplication==
// @name Test Plugin
// ==/Npplication==
console.log("Hello World");`;

    (validateMetadata as jest.Mock).mockReturnValue({
      valid: false,
      errors: ['缺少必需字段：@id', '缺少必需字段：@version'],
      warnings: []
    });

    const result = validateMetadata(minifiedContent);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
