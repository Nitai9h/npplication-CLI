import { generateMetadata } from '../metadataGenerator';
import { CreatePluginOptions } from '../../types';

describe('metadataGenerator', () => {
  describe('generateMetadata', () => {
    it('should generate metadata with required fields', () => {
      const options: CreatePluginOptions = {
        name: 'Test Plugin',
      };

      const result = generateMetadata(options);
      expect(result).toContain('// ==Npplication==');
      expect(result).toContain('// @name Test Plugin');
      expect(result).toContain('// @version 0.0.1');
      expect(result).toContain('// ==/Npplication==');
    });

    it('should generate metadata with all optional fields', () => {
      const options: CreatePluginOptions = {
        name: 'Test Plugin',
        description: 'Test description',
        author: 'Test Author',
        type: 'custom',
        time: 'head',
        icon: 'https://example.com/icon.svg',
        screen: 'main',
        forced: true,
        setting: true,
        dependencies: 'plugin1,plugin2',
        associations: 'app1,app2',
        translates: 'zh-CN',
      };

      const result = generateMetadata(options);
      expect(result).toContain('// @name Test Plugin');
      expect(result).toContain('// @description Test description');
      expect(result).toContain('// @author Test Author');
      expect(result).toContain('// @type custom');
      expect(result).toContain('// @time head');
      expect(result).toContain('// @icon https://example.com/icon.svg');
      expect(result).toContain('// @screen main');
      expect(result).toContain('// @forced true');
      expect(result).toContain('// @setting true');
      expect(result).toContain('// @dependencies plugin1,plugin2');
      expect(result).toContain('// @associations app1,app2');
      expect(result).toContain('// @translates zh-CN');
    });

    it('should use default values for optional fields', () => {
      const options: CreatePluginOptions = {
        name: 'Test Plugin',
      };

      const result = generateMetadata(options);
      expect(result).toContain('// @description @npplication:no-description');
      expect(result).toContain('// @author @npplication:no-author');
      expect(result).toContain('// @time body');
      expect(result).toContain('// @icon https://nitai-images.pages.dev/nitaiPage/defeatNpp.svg');
      expect(result).toContain('// @forced false');
      expect(result).toContain('// @setting false');
    });

    it('should generate unique ID for each call', () => {
      const options: CreatePluginOptions = {
        name: 'Test Plugin',
      };

      const result1 = generateMetadata(options);
      const result2 = generateMetadata(options);

      const id1 = result1.match(/\/\/ @id (.+)/)?.[1];
      const id2 = result2.match(/\/\/ @id (.+)/)?.[1];

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should handle empty description and author', () => {
      const options: CreatePluginOptions = {
        name: 'Test Plugin',
        description: '',
        author: '',
      };

      const result = generateMetadata(options);
      expect(result).toContain('// @description @npplication:no-description');
      expect(result).toContain('// @author @npplication:no-author');
    });

    it('should format metadata correctly', () => {
      const options: CreatePluginOptions = {
        name: 'Test Plugin',
      };

      const result = generateMetadata(options);
      const lines = result.split('\n');

      expect(lines[0]).toBe('// ==Npplication==');
      expect(lines[lines.length - 1]).toBe('// ==/Npplication==');
      expect(lines.some(line => line.startsWith('// @name'))).toBe(true);
      expect(lines.some(line => line.startsWith('// @id'))).toBe(true);
      expect(lines.some(line => line.startsWith('// @version'))).toBe(true);
    });
  });
});
