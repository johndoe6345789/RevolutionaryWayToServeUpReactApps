/**
 * WebUIGenerator - Generates Next.js WebUI from spec
 * Creates web user interface with tree navigation, search, and Monaco editor integration
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ISpec } from '../../core/interfaces';

/**
 *
 */
interface WebUIGeneratorSpec extends ISpec {
  specsPath?: string;
  outputPath?: string;
}

/**
 *
 */
interface GeneratedFile {
  file: string;
  type: string;
  name: string;
}

/**
 *
 */
interface ComponentSpec {
  id: string;
  search: {
    title: string;
    summary: string;
  };
  features?: string[];
  capabilities?: string[];
  searchFields?: string[];
  filters?: {
    name: string;
    values: string[];
  }[];
}

/**
 *
 */
interface PageSpec {
  id: string;
  route: string;
  components: string[];
}

/**
 *
 */
interface APIRouteSpec {
  id: string;
  route: string;
  method: string;
  description: string;
}

/**
 *
 */
interface WebUISpecData {
  components: Record<string, ComponentSpec>;
  pages: Record<string, PageSpec>;
  'api-routes': Record<string, APIRouteSpec>;
  search: {
    title: string;
    summary: string;
  };
}

/**
 *
 */
interface ExecutionResult {
  success: boolean;
  generated: GeneratedFile[];
  specs: WebUISpecData;
}

/**
 *
 */
export class WebUIGenerator {
  public readonly uuid: string;
  public readonly id: string;
  public readonly search: ISpec['search'];
  protected specsPath: string;
  protected outputPath: string;

  constructor(spec: WebUIGeneratorSpec) {
    this.uuid = spec.uuid;
    this.id = spec.id;
    this.search = spec.search;
    this.specsPath = spec.specsPath || __dirname;
    this.outputPath = spec.outputPath || path.join(__dirname, '../../../src/webui');
  }

  /**
   *
   */
  public async initialise(): Promise<WebUIGenerator> {
    this._ensureDirectories();
    return this;
  }

  /**
   *
   * @param context
   */
  public async execute(context: Record<string, unknown>): Promise<ExecutionResult> {
    const specs = this._loadSpecs(),
      generatedFiles = this._generateWebUI(specs);

    return { success: true, generated: generatedFiles, specs };
  }

  /**
   *
   */
  private _loadSpecs(): WebUISpecData {
    const specPath = path.join(this.specsPath, 'spec.json');
    return JSON.parse(fs.readFileSync(specPath, 'utf8')) as WebUISpecData;
  }

  /**
   *
   * @param specs
   */
  private _generateWebUI(specs: WebUISpecData): GeneratedFile[] {
    const generated: GeneratedFile[] = [];

    // Generate components
    for (const [componentName, componentSpec] of Object.entries(specs.components)) {
      generated.push(this._generateComponent(componentName, componentSpec));
    }

    // Generate pages
    for (const [pageName, pageSpec] of Object.entries(specs.pages)) {
      generated.push(this._generatePage(pageName, pageSpec, specs.components));
    }

    // Generate API routes
    for (const [apiName, apiSpec] of Object.entries(specs['api-routes'])) {
      generated.push(this._generateAPIRoute(apiName, apiSpec));
    }

    return generated;
  }

  /**
   *
   * @param componentName
   * @param componentSpec
   */
  private _generateComponent(componentName: string, componentSpec: ComponentSpec): GeneratedFile {
    const componentCode = this._generateComponentCode(componentName, componentSpec),
      filePath = path.join(this.outputPath, 'components', `generated-${componentName}.tsx`);

    fs.writeFileSync(filePath, componentCode);
    return { file: filePath, type: 'component', name: componentName };
  }

  /**
   *
   * @param pageName
   * @param pageSpec
   * @param components
   */
  private _generatePage(
    pageName: string,
    pageSpec: PageSpec,
    components: Record<string, ComponentSpec>,
  ): GeneratedFile {
    const pageCode = this._generatePageCode(pageName, pageSpec, components),
      filePath = path.join(this.outputPath, 'app', pageSpec.route, 'page.tsx');

    fs.writeFileSync(filePath, pageCode);
    return { file: filePath, type: 'page', name: pageName };
  }

  /**
   *
   * @param apiName
   * @param apiSpec
   */
  private _generateAPIRoute(apiName: string, apiSpec: APIRouteSpec): GeneratedFile {
    const apiCode = this._generateAPICode(apiName, apiSpec),
      filePath = path.join(this.outputPath, 'app', 'api', apiSpec.route, 'route.ts');

    fs.writeFileSync(filePath, apiCode);
    return { file: filePath, type: 'api', name: apiName };
  }

  /**
   *
   * @param componentName
   * @param componentSpec
   */
  private _generateComponentCode(componentName: string, componentSpec: ComponentSpec): string {
    return `/**
 * Generated ${componentSpec.search.title}
 *
 * ${componentSpec.search.summary}
 *
 * Auto-generated from spec.json
 */

import React from 'react';

interface Generated${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props {
  // TODO: Define props based on spec
}

export const Generated${componentName.charAt(0).toUpperCase() + componentName.slice(1)}: React.FC<Generated${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Props> = (props) => {
  return (
    <div>
      <h2>${componentSpec.search.title}</h2>
      <p>${componentSpec.search.summary}</p>
      {/* TODO: Implement component based on spec capabilities */}
    </div>
  );
};

export default Generated${componentName.charAt(0).toUpperCase() + componentName.slice(1)};`;
  }

  /**
   *
   * @param pageName
   * @param pageSpec
   * @param components
   */
  private _generatePageCode(
    pageName: string,
    pageSpec: PageSpec,
    components: Record<string, ComponentSpec>,
  ): string {
    const imports = pageSpec.components
        .map(
          (comp) =>
            `import { Generated${comp.charAt(0).toUpperCase() + comp.slice(1)} } from '../../components/generated-${comp}';`,
        )
        .join('\n'),
      componentUsage = pageSpec.components
        .map((comp) => `      <Generated${comp.charAt(0).toUpperCase() + comp.slice(1)} />`)
        .join('\n');

    return `/**
 * Generated ${pageName} Page
 *
 * Auto-generated from spec.json
 */

import React from 'react';
${imports}

export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {
  return (
    <div>
      <h1>${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page</h1>
${componentUsage}
    </div>
  );
}`;
  }

  /**
   *
   * @param apiName
   * @param apiSpec
   */
  private _generateAPICode(apiName: string, apiSpec: APIRouteSpec): string {
    return `/**
 * Generated ${apiSpec.description}
 *
 * ${apiSpec.description}
 *
 * Auto-generated from spec.json
 */

import { NextRequest, NextResponse } from 'next/server';

export async function ${apiSpec.method.toUpperCase()}(request: NextRequest) {
  try {
    // TODO: Implement ${apiName} API logic
    return NextResponse.json({
      message: '${apiSpec.description}',
      success: true
    });
  } catch (error) {
    return NextResponse.json({
      message: 'API Error',
      error: (error as Error).message
    }, { status: 500 });
  }
}`;
  }

  /**
   *
   */
  private _ensureDirectories(): void {
    const dirs = [
      this.outputPath,
      path.join(this.outputPath, 'components'),
      path.join(this.outputPath, 'app'),
      path.join(this.outputPath, 'app', 'api'),
    ];

    // Add page directories
    for (const pageName of Object.keys(this._loadSpecs().pages)) {
      const pageSpec = this._loadSpecs().pages[pageName];
      dirs.push(path.join(this.outputPath, 'app', pageSpec.route));
    }

    // Add API route directories
    for (const apiName of Object.keys(this._loadSpecs()['api-routes'])) {
      const apiSpec = this._loadSpecs()['api-routes'][apiName];
      dirs.push(path.join(this.outputPath, 'app', 'api', apiSpec.route));
    }

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   *
   * @param input
   */
  public validate(input: unknown): boolean {
    return (
      input !== null &&
      input !== undefined &&
      typeof input === 'object' &&
      'specsPath' in input &&
      'outputPath' in input
    );
  }
}

module.exports = WebUIGenerator;
