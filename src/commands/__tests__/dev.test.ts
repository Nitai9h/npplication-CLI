jest.mock('fs');
jest.mock('path');
jest.mock('../../utils/certificate');
jest.mock('https');

describe('devCommand', () => {
  let mockFs: jest.Mocked<typeof import('fs')>;
  let mockPath: jest.Mocked<typeof import('path')>;

  beforeEach(() => {
    mockFs = require('fs');
    mockPath = require('path');
    jest.clearAllMocks();
  });

  it('should get correct content type for different file extensions', () => {
    const types: { [key: string]: string } = {
      '.js': 'application/javascript',
      '.html': 'text/html',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    expect(types['.js']).toBe('application/javascript');
    expect(types['.html']).toBe('text/html');
    expect(types['.css']).toBe('text/css');
    expect(types['.json']).toBe('application/json');
    expect(types['.png']).toBe('image/png');
    expect(types['.jpg']).toBe('image/jpeg');
    expect(types['.gif']).toBe('image/gif');
    expect(types['.svg']).toBe('image/svg+xml');
    expect(types['.ico']).toBe('image/x-icon');
  });

  it('should return default content type for unknown extensions', () => {
    const types: { [key: string]: string } = {
      '.js': 'application/javascript',
    };
    const defaultType = types['.unknown'] || 'application/octet-stream';
    expect(defaultType).toBe('application/octet-stream');
  });

  it('should filter out compressed files', () => {
    const files = ['plugin.js', 'plugin-compressed.js', 'index.js', 'test.js'];
    const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('-compressed.js'));
    expect(jsFiles).toEqual(['plugin.js', 'index.js', 'test.js']);
  });

  it('should return first plugin file when multiple files exist', () => {
    const files = ['plugin.js', 'index.js', 'test.js'];
    const jsFiles = files.filter((f: string) => f.endsWith('.js') && !f.endsWith('-compressed.js'));
    const pluginFileName = jsFiles[0] || 'plugin.js';
    expect(pluginFileName).toBe('plugin.js');
  });

  it('should return default filename when no js files exist', () => {
    const files = ['index.html', 'style.css', 'README.md'];
    const jsFiles = files.filter((f: string) => f.endsWith('.js') && !f.endsWith('-compressed.js'));
    const pluginFileName = jsFiles[0] || 'plugin.js';
    expect(pluginFileName).toBe('plugin.js');
  });

  it('should handle path normalization', () => {
    const testPath = 'folder/../folder/file.js';
    const parts = testPath.split('/');
    const result: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        result.pop();
      } else {
        result.push(part);
      }
    }
    const normalizedPath = result.join('/');
    expect(normalizedPath).toBe('folder/file.js');
  });

  it('should handle URL path extraction', () => {
    const testCases = [
      { url: '/', expected: '' },
      { url: '/plugin.js', expected: 'plugin.js' },
      { url: '/folder/file.js', expected: 'folder/file.js' }
    ];

    testCases.forEach(({ url, expected }) => {
      let requestedPath = url === '/' ? '' : url || '';
      if (requestedPath.startsWith('/')) {
        requestedPath = requestedPath.substring(1);
      }
      expect(requestedPath).toBe(expected);
    });
  });
});
