const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');
const almanachRoot = path.join(projectRoot, 'AleriaAlmanach');
const mainHtmlPath = path.join(almanachRoot, 'AleriaAlmanach.html');
const orteLoaderPath = path.join(projectRoot, 'Orte', 'assets', 'js', 'orte-scene-session.js');
const templatesPath = path.join(almanachRoot, 'modules', 'module-editor', 'module-editor-templates.js');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function collect(source, pattern) {
  return [...source.matchAll(pattern)].map(match => match[1]);
}

function collectFiles(directory, extension, target = []) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(filePath, extension, target);
    else if (entry.name.endsWith(extension)) target.push(filePath);
  });
  return target;
}

function findDuplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

const mainHtml = read(mainHtmlPath);
const orteLoader = read(orteLoaderPath);
const templates = read(templatesPath);
const inlineEditorPath = path.join(almanachRoot, 'modules', 'inline-editor', 'inline-module-editor.js');
const inlineEditor = read(inlineEditorPath);
const moduleAssetPattern = 'modules\\/(?:module-editor|inline-editor|bounty|court|goods|trade-catalog|map-template|language|name-list|script-table|landing|character-inventory|guest-register|hierarchy|family|house-warriors)\\/[^"?]+\\.js';
const mainScripts = collect(mainHtml, new RegExp(`src="\\.\\/(${moduleAssetPattern})`, 'g'));
const orteScripts = collect(orteLoader, new RegExp(`"(${moduleAssetPattern})(?:\\?[^" ]*)?"`, 'g'));
const mainStyles = collect(mainHtml, /href="\.\/(styles\/(?:module-page-[^"?]+|family-editor)\.css)/g);
const orteStyles = collect(orteLoader, /"(styles\/(?:module-page-[^"?]+|family-editor)\.css)(?:\?[^" ]*)?"/g);
const mainVendorAssets = [
  ...collect(mainHtml, /src="\.\/(vendor\/[^"?]+\.(?:js))(?:\?[^" ]*)?"/g),
  ...collect(mainHtml, /href="\.\/(vendor\/[^"?]+\.(?:css))(?:\?[^" ]*)?"/g)
];
const orteVendorAssets = collect(orteLoader, /"(vendor\/[^"?]+\.(?:js|css))(?:\?[^" ]*)?"/g);
const requiredVendorFiles = [
  'vendor/d3/7.9.0/LICENSE',
  'vendor/d3/7.9.0/d3.min.js',
  'vendor/family-chart/0.9.0/LICENSE.txt',
  'vendor/family-chart/0.9.0/family-chart.css',
  'vendor/family-chart/0.9.0/family-chart.min.js'
];
const dependencyBlock = templates.match(/const MODULE_TEMPLATE_RUNTIME_DEPENDENCIES = \{([\s\S]*?)\n\};/)?.[1] || '';
const registryBlock = templates.match(/const MODULE_TEMPLATE_REGISTRY = \{([\s\S]*?)\r?\n\};\r?\n\r?\nconst MODULE_TEMPLATE_OPTIONS/)?.[1] || '';
const registryIds = [...registryBlock.matchAll(/^  (?:'([^']+)'|([a-z][a-z-]*)):\s*\{/gm)]
  .map(match => match[1] || match[2]);
const dependencyTemplateIds = [...dependencyBlock.matchAll(/^  (?:'([^']+)'|([a-z][a-z-]*)):\s*\[/gm)]
  .map(match => match[1] || match[2]);
const dependencyNames = collect(dependencyBlock, /'([A-Za-z][A-Za-z0-9]+)'/g)
  .filter(name => /^(build|collect)/.test(name));
const moduleSources = collectFiles(path.join(almanachRoot, 'modules'), '.js').map(read).join('\n');
const registryPageTypes = [...registryBlock.matchAll(/\n\s+pageType:\s*'([^']+)'/g)].map(match => match[1]);
const inlineDispatchedTypes = collect(inlineEditor, /if \(type === '([^']+)'\)/g);
const inlineBuilderNames = collect(inlineEditor, /return wrapInlineEditor\([^;]*?(buildInline[A-Za-z0-9]+Editor)\(/g);

const failures = {
  missingOrteScripts: mainScripts.filter(asset => !orteScripts.includes(asset)),
  missingOrteStyles: mainStyles.filter(asset => !orteStyles.includes(asset)),
  missingOrteVendorAssets: mainVendorAssets.filter(asset => !orteVendorAssets.includes(asset)),
  missingFiles: [...orteScripts, ...orteStyles, ...requiredVendorFiles].filter(asset => !fs.existsSync(path.join(almanachRoot, asset))),
  duplicateOrteScripts: findDuplicates(orteScripts),
  duplicateOrteStyles: findDuplicates(orteStyles),
  templatesWithoutDependencyContract: registryIds.filter(id => !dependencyTemplateIds.includes(id)),
  dependencyContractsWithoutTemplate: dependencyTemplateIds.filter(id => !registryIds.includes(id)),
  duplicateTemplateIds: findDuplicates(registryIds),
  duplicateDependencyContracts: findDuplicates(dependencyTemplateIds),
  missingRuntimeDependencies: dependencyNames.filter(name => !new RegExp(`function\\s+${name}\\s*\\(`).test(moduleSources)),
  missingInlineDispatch: registryPageTypes.filter(type => type !== 'standard' && !inlineDispatchedTypes.includes(type)),
  inlineDispatchWithoutTemplate: inlineDispatchedTypes.filter(type => !registryPageTypes.includes(type)),
  missingInlineBuilders: inlineBuilderNames.filter(name => !new RegExp(`function\\s+${name}\\s*\\(`).test(moduleSources))
};

const messages = Object.entries(failures)
  .filter(([, values]) => values.length)
  .map(([name, values]) => `${name}:\n  - ${values.join('\n  - ')}`);

if (messages.length) {
  console.error(`Modultemplate-Asset-Pruefung fehlgeschlagen.\n\n${messages.join('\n\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Modultemplate-Assets OK: ${registryIds.length} Templates, ${mainScripts.length} Scripts, ${mainStyles.length} Styles, ${mainVendorAssets.length} Vendorassets, ${dependencyNames.length} Laufzeitabhaengigkeiten, Inline-Coverage vollstaendig.`);
}
