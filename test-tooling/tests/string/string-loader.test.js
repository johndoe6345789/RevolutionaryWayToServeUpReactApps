const { StringLoader } = require('../../../string/string-loader.js');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('StringLoader', () => {
  const mockData = { test: 'data' };
  const mockJsonString = JSON.stringify(mockData);

  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFileSync.mockReturnValue(mockJsonString);
    fs.existsSync.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      const loader = new StringLoader();

      expect(loader.config).toEqual({});
      expect(loader.filePath).toContain('strings.json');
    });

    it('should create instance with custom config', () => {
      const config = { filePath: '/custom/path.json' };
      const loader = new StringLoader(config);

      expect(loader.config).toEqual(config);
      expect(loader.filePath).toBe('/custom/path.json');
    });
  });

  describe('load', () => {
    it('should load and parse JSON data successfully', async () => {
      const loader = new StringLoader();

      const result = await loader.load();

      expect(fs.readFileSync).toHaveBeenCalledWith(loader.filePath, 'utf8');
      expect(result).toEqual(mockData);
    });

    it('should throw error for invalid JSON', async () => {
      fs.readFileSync.mockReturnValue('invalid json');

      const loader = new StringLoader();

      await expect(loader.load()).rejects.toThrow('Failed to load string data');
    });

    it('should throw error for invalid structure', async () => {
      fs.readFileSync.mockReturnValue(JSON.stringify('invalid structure'));

      const loader = new StringLoader();

      await expect(loader.load()).rejects.toThrow('Invalid string data structure');
    });
  });

  describe('isValidStructure', () => {
    it('should return true for valid object', () => {
      const loader = new StringLoader();

      expect(loader.isValidStructure({})).toBe(true);
      expect(loader.isValidStructure({ key: 'value' })).toBe(true);
    });

    it('should return false for invalid structures', () => {
      const loader = new StringLoader();

      expect(loader.isValidStructure(null)).toBe(false);
      expect(loader.isValidStructure(undefined)).toBe(false);
      expect(loader.isValidStructure('string')).toBe(false);
      expect(loader.isValidStructure(123)).toBe(false);
      expect(loader.isValidStructure([])).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when file exists', () => {
      fs.existsSync.mockReturnValue(true);
      const loader = new StringLoader();

      expect(loader.exists()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(loader.filePath);
    });

    it('should return false when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);
      const loader = new StringLoader();

      expect(loader.exists()).toBe(false);
    });

    it('should handle filesystem errors', () => {
      fs.existsSync.mockImplementation(() => {
        throw new Error('Filesystem error');
      });
      const loader = new StringLoader();

      expect(loader.exists()).toBe(false);
    });
  });
});
