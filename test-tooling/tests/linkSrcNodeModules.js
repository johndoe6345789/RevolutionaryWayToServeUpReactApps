const fs = require("fs");
const path = require("path");

const nodeModulesDir = path.resolve(__dirname, "../node_modules");
const linkDir = path.resolve(__dirname, "../../src");
const linkTarget = path.join(linkDir, "node_modules");

const linkExists = fs.existsSync(linkTarget);
const isSymlink = linkExists && fs.lstatSync(linkTarget).isSymbolicLink();

if (!isSymlink) {
  if (linkExists) {
    fs.rmSync(linkTarget, { recursive: true, force: true });
  }
  fs.mkdirSync(linkDir, { recursive: true });
  fs.symlinkSync(nodeModulesDir, linkTarget, "junction");
}
