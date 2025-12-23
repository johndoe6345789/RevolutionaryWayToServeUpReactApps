/**
 * WebUIGenerator - Generates Next.js WebUI from spec
 * Creates web user interface with tree navigation, search, and Monaco editor integration
 * TypeScript strict typing with no 'any' types
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ISpec } from '../../core/interfaces';
import type { APIRouteSpec } from './types/api-route-spec';
import type { ComponentSpec } from './types/component-spec';
import type { ExecutionResult } from './types/execution-result';
import type { GeneratedFile } from './types/generated-file';
import type { PageSpec } from './types/page-spec';
import type { WebUIGeneratorSpec } from './types/webui-generator-spec';
import type { WebUISpecData } from './types/webui-spec-data';

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
    const pascalName = WebUIGenerator.pascalCase(componentName);
    const inputDefinitions = JSON.stringify(componentSpec.inputs ?? [], null, 2);
    const actionDefinitions = JSON.stringify(componentSpec.actions ?? [], null, 2);
    const defaultInputs = JSON.stringify(
      (componentSpec.inputs ?? []).reduce<Record<string, string>>((acc, input) => {
        acc[input.name] = input.defaultValue ?? '';
        return acc;
      }, {}),
      null,
      2,
    );

    return `/**
 * Generated ${componentSpec.search.title}
 *
 * ${componentSpec.search.summary}
 *
 * Auto-generated from spec.json
 */

import React, { useMemo, useState } from 'react';

const inputDefinitions = ${inputDefinitions} as const;
const actionDefinitions = ${actionDefinitions} as const;

type InputName = (typeof inputDefinitions)[number] extends { name: infer N } ? N : never;
type ActionName = (typeof actionDefinitions)[number] extends { name: infer N } ? N : never;

interface Generated${pascalName}Props {
  /** Override the default title derived from the spec search metadata */
  title?: string;
  /** Override the default summary derived from the spec search metadata */
  summary?: string;
  /** Provide initial input values mapped by the spec input names */
  inputs?: Partial<Record<InputName, string>>;
  /** Override action labels mapped by the spec action names */
  actions?: Partial<Record<ActionName, string>>;
  /** Input change callback invoked with the spec-defined input name and current value */
  onInputChange?: (name: InputName, value: string) => void;
  /** Action callback invoked with the action name and the current form values */
  onAction?: (action: ActionName, values: Record<InputName, string>) => void;
}

const defaultTitle = ${JSON.stringify(componentSpec.search.title)};
const defaultSummary = ${JSON.stringify(componentSpec.search.summary)};
const defaultInputs = ${defaultInputs} as Record<InputName, string>;

export const Generated${pascalName}: React.FC<Generated${pascalName}Props> = ({
  title = defaultTitle,
  summary = defaultSummary,
  inputs = {} as Partial<Record<InputName, string>>,
  actions: actionOverrides = {} as Partial<Record<ActionName, string>>,
  onInputChange,
  onAction,
}) => {
  const [formValues, setFormValues] = useState<Record<InputName, string>>({
    ...defaultInputs,
    ...(inputs as Partial<Record<InputName, string>>),
  });

  const hasInputs = useMemo(() => inputDefinitions.length > 0, []);
  const hasActions = useMemo(() => actionDefinitions.length > 0, []);

  const handleInputChange = (name: InputName, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    onInputChange?.(name, value);
  };

  const handleAction = (action: ActionName) => {
    onAction?.(action, formValues);
  };

  return (
    <section aria-label={title} className="generated-component">
      <header>
        <h2>{title}</h2>
        <p>{summary}</p>
      </header>

      {hasInputs && (
        <div className="generated-inputs" role="form">
          {inputDefinitions.map((input) => {
            const value = formValues[input.name as InputName] ?? '';
            const inputId = '${componentName}-input-' + String(input.name);

            if (input.type === 'select' && input.options?.length) {
              return (
                <label key={input.name} htmlFor={inputId} className="generated-input">
                  <span className="generated-input__label">{input.label}</span>
                  <select
                    id={inputId}
                    value={value ?? ''}
                    onChange={(event) => handleInputChange(input.name as InputName, event.target.value)}
                  >
                    <option value="" disabled>
                      {input.placeholder ?? 'Select an option'}
                    </option>
                    {input.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {input.helperText && <small className="generated-input__help">{input.helperText}</small>}
                </label>
              );
            }

            if (input.type === 'textarea') {
              return (
                <label key={input.name} htmlFor={inputId} className="generated-input">
                  <span className="generated-input__label">{input.label}</span>
                  <textarea
                    id={inputId}
                    placeholder={input.placeholder}
                    value={value ?? ''}
                    onChange={(event) => handleInputChange(input.name as InputName, event.target.value)}
                  />
                  {input.helperText && <small className="generated-input__help">{input.helperText}</small>}
                </label>
              );
            }

            return (
              <label key={input.name} htmlFor={inputId} className="generated-input">
                <span className="generated-input__label">{input.label}</span>
                <input
                  id={inputId}
                  type={input.type ?? 'text'}
                  placeholder={input.placeholder}
                  value={value ?? ''}
                  onChange={(event) => handleInputChange(input.name as InputName, event.target.value)}
                />
                {input.helperText && <small className="generated-input__help">{input.helperText}</small>}
              </label>
            );
          })}
        </div>
      )}

      {hasActions && (
        <div className="generated-actions" role="group" aria-label="Actions">
          {actionDefinitions.map((action) => (
            <button
              key={action.name}
              type="button"
              onClick={() => handleAction(action.name as ActionName)}
              aria-label={action.helperText ?? action.label}
            >
              {actionOverrides[action.name as ActionName] ?? action.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default Generated${pascalName};`;
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
            `import { Generated${WebUIGenerator.pascalCase(comp)} } from '../../components/generated-${comp}';`,
        )
        .join('\n'),
      componentUsage = pageSpec.components
        .map((comp) => `      <Generated${WebUIGenerator.pascalCase(comp)} />`)
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

  private static pascalCase(value: string): string {
    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
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
