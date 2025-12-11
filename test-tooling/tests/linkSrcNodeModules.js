const fs = require("fs");
const path = require("path");

const nodeModulesDir = path.resolve(__dirname, "../node_modules");
const linkDir = path.resolve(__dirname, "../../src");
const linkTarget = path.join(linkDir, "node_modules");

if (fs.existsSync(linkTarget)) {
  const stat = fs.lstatSync(linkTarget);
  if (stat.isSymbolicLink()) {
    process.exit(0);
  }
  fs.rmSync(linkTarget, { recursive: true, force: true });
}

fs.mkdirSync(linkDir, { recursive: true });
fs.symlinkSync(nodeModulesDir, linkTarget, "junction");
