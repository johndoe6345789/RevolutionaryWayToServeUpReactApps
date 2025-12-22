/**
 * Language Scoring
 * Calculates detection scores for languages based on project files
 */

const fs = require('fs');
const path = require('path');

class LanguageScoring {
  /**
   * Calculates a detection score for a language
   * @param {Object} language - Language configuration
   * @param {string} projectPath - Path to scan
   * @returns {Promise<number>} - Detection score
   */
  async calculateLanguageScore(language, projectPath) {
    let score = 0;

    // Check project files (highest weight)
    score += this.scoreProjectFiles(language, projectPath);
    
    // Check build systems (medium-high weight)
    score += this.scoreBuildSystems(language, projectPath);
    
    // Check file extensions (lower weight, but many files add up)
    score += this.scoreFileExtensions(language, projectPath);

    // Apply language priority multiplier
    score = score * (language.priority / 100);

    // Run custom plugin detection if available
    if (language.plugin) {
      try {
        const customDetected = await language.plugin.detectProject(projectPath);
        if (customDetected) {
          score += 25; // Bonus for custom detection
        }
      } catch (error) {
        // Ignore custom detection errors
      }
    }

    return score;
  }

  /**
   * Scores based on project files
   * @param {Object} language - Language configuration
   * @param {string} projectPath - Path to scan
   * @returns {number} - Score from project files
   */
  scoreProjectFiles(language, projectPath) {
    let score = 0;
    
    for (const projectFile of language.projectFiles) {
      const filePath = path.join(projectPath, projectFile);
      if (fs.existsSync(filePath)) {
        score += 50;
      }
    }
    
    return score;
  }

  /**
   * Scores based on build systems
   * @param {Object} language - Language configuration
   * @param {string} projectPath - Path to scan
   * @returns {number} - Score from build systems
   */
  scoreBuildSystems(language, projectPath) {
    let score = 0;
    
    for (const buildFile of language.buildSystems) {
      const filePath = path.join(projectPath, buildFile);
      if (fs.existsSync(filePath)) {
        score += 30;
      }
    }
    
    return score;
  }

  /**
   * Scores based on file extensions
   * @param {Object} language - Language configuration
   * @param {string} projectPath - Path to scan
   * @returns {Promise<number>} - Score from file extensions
   */
  async scoreFileExtensions(language, projectPath) {
    let score = 0;

    for (const ext of language.fileExtensions) {
      const files = await this.countFilesByExtension(projectPath, ext);
      score += Math.min(files * 2, 20); // Cap at 20 points per extension
    }

    return score;
  }

  /**
   * Counts files by extension in a directory
   * @param {string} dir - Directory to search
   * @param {string} ext - File extension to match
   * @returns {Promise<number>} - Count of matching files
   */
  async countFilesByExtension(dir, ext) {
    let count = 0;

    const scan = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      try {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
          const fullPath = path.join(currentDir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip common ignore directories
            if (!this.shouldIgnoreDirectory(item)) {
              scan(fullPath);
            }
          } else if (item.endsWith(ext)) {
            count++;
          }
        }
      } catch (error) {
        // Ignore permission errors
      }
    };

    scan(dir);
    return count;
  }

  /**
   * Determines if a directory should be ignored during scanning
   * @param {string} dirName - Directory name
   * @returns {boolean} - True if should ignore
   */
  shouldIgnoreDirectory(dirName) {
    const ignoreDirs = [
      'node_modules', '.git', 'dist', 'build', 'target', '__pycache__',
      '.vscode', '.idea', 'coverage', '.nyc_output', 'tmp', 'temp'
    ];
    return ignoreDirs.includes(dirName);
  }

  /**
   * Sorts languages by score (descending)
   * @param {Map} languageScores - Map of language names to scores
   * @returns {Array} - Array of language names sorted by score
   */
  sortLanguagesByScore(languageScores) {
    return Array.from(languageScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }

  /**
   * Gets top scoring languages
   * @param {Map} languageScores - Map of language names to scores
   * @param {number} limit - Maximum number of languages to return
   * @returns {Array} - Array of top language names
   */
  getTopLanguages(languageScores, limit = 3) {
    return this.sortLanguagesByScore(languageScores).slice(0, limit);
  }
}

module.exports = LanguageScoring;
