const fs = require('fs');
const path = require('path');

/**
 * Mirrors the runtime src/ directory into Jest's sandboxed node_modules
 * so module paths resolve identically inside tests.
 */
class LinkSrcNodeModules {
  constructor() {
    this.rootDir = path.resolve(__dirname, '../..');
    this.testDir = path.resolve(__dirname);
    this.mocksDir = path.join(this.testDir, '__mocks__');
    this.srcDir = path.join(this.rootDir, 'src');
    this.mockSrcDir = path.join(this.mocksDir, 'src');
    this.logDir = path.join(this.testDir, '.log');
  }

  /**
   * Sets up the directory structure and symlinks
   */
  setup() {
    this.ensureDirectories();
    this.copySrcFiles();
    this.setupSymlinks();
    this.logActions();
  }

  /**
   * Ensures required directories exist
   */
  ensureDirectories() {
    [this.mocksDir, this.mockSrcDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Copies src/ helpers into test-tooling/tests/__mocks__/src
   */
  copySrcFiles() {
    if (!fs.existsSync(this.srcDir)) {
      console.warn(`Source directory ${this.srcDir} does not exist`);
      return;
    }

    this.copyDirectory(this.srcDir, this.mockSrcDir);
  }

  /**
   * Recursively copies a directory
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      // Skip node_modules and other common non-source directories
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'build') {
        console.log(`Skipping directory: ${entry.name}`);
        continue;
      }

      try {
        if (entry.isDirectory()) {
          this.copyDirectory(srcPath, destPath);
        } else if (entry.isFile()) {
          fs.copyFileSync(srcPath, destPath);
        } else if (entry.isSymbolicLink()) {
          // Handle symbolic links by recreating them
          const linkTarget = fs.readlinkSync(srcPath);
          fs.symlinkSync(linkTarget, destPath);
        }
      } catch (error) {
        console.warn(`Could not copy ${srcPath} to ${destPath}:`, error.message);
      }
    }
  }

  /**
   * Sets up symlinks for module resolution
   */
  setupSymlinks() {
    const nodeModulesDir = path.join(this.testDir, 'node_modules');
    
    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir, { recursive: true });
    }

    // Create symlink to src in node_modules for module resolution
    const srcLinkPath = path.join(nodeModulesDir, 'src');
    
    if (fs.existsSync(srcLinkPath)) {
      if (fs.lstatSync(srcLinkPath).isSymbolicLink()) {
        fs.unlinkSync(srcLinkPath);
      } else {
        // Remove existing directory/file
        fs.rmSync(srcLinkPath, { recursive: true, force: true });
      }
    }

    // Create symlink pointing to the actual src directory
    fs.symlinkSync(this.srcDir, srcLinkPath, 'dir');
  }

  /**
   * Logs actions for troubleshooting
   */
  logActions() {
    const logFile = path.join(this.logDir, 'linkSrcNodeModules.log');
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] Setup completed\n` +
                    `- Source: ${this.srcDir}\n` +
                    `- Mock: ${this.mockSrcDir}\n` +
                    `- Node modules link: ${path.join(this.testDir, 'node_modules', 'src')}\n\n`;

    fs.appendFileSync(logFile, logEntry);
  }
}

// Run the setup
const linker = new LinkSrcNodeModules();
linker.setup();

module.exports = linker;
