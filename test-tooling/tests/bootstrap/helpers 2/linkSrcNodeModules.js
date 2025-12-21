const fs = require("fs");
const path = require("path");

const nodeModulesDir = path.resolve(__dirname, "../node_modules");
const linkDir = path.resolve(__dirname, "../../src");
const linkTarget = path.join(linkDir, "node_modules");
const expectedTarget = fs.realpathSync(nodeModulesDir);

const linkPointsToTarget = () => {
  try {
    return fs.realpathSync(linkTarget) === expectedTarget;
  } catch {
    return false;
  }
};

if (!linkPointsToTarget()) {
  fs.rmSync(linkTarget, { recursive: true, force: true });
  fs.mkdirSync(linkDir, { recursive: true });

  try {
    fs.symlinkSync(nodeModulesDir, linkTarget, "junction");
  } catch (error) {
    // If another worker created the correct link between checks, treat it as success.
    if (error.code === "EEXIST" && linkPointsToTarget()) {
      /* no-op */
    } else {
      throw error;
    }
  }
}
