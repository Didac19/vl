const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro resolve modules from both the app and workspace node_modules.
// The pnpm virtual store is at the workspace root, so we need to include it.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// NOTE: Do NOT set disableHierarchicalLookup = true with pnpm.
// pnpm stores transitive deps in nested node_modules inside the virtual store,
// and hierarchical lookup is required for Metro to find them (e.g. semver inside reanimated).

module.exports = config;
