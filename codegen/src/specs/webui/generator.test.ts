import { describe, expect, it } from 'vitest';
import { WebUIGenerator } from './generator';
import type { ComponentSpec } from './types/component-spec';
import type { PageSpec } from './types/page-spec';
import type { WebUIGeneratorSpec } from './types/webui-generator-spec';

const generatorConfig = {
  uuid: 'test',
  id: 'interface.webui',
  search: { title: 'Web UI', summary: 'spec driven' },
  specsPath: '',
  outputPath: '',
} as WebUIGeneratorSpec;

describe('WebUIGenerator component generation', () => {
  const baseComponentSpec: ComponentSpec = {
    id: 'webui.component.preview-generate',
    search: {
      title: 'Preview/Generate Workflow',
      summary: 'Select snippet/language and generate preview or artifact',
    },
    inputs: [
      {
        name: 'snippet',
        label: 'Snippet or group',
        type: 'select',
        placeholder: 'Choose a snippet to render',
        defaultValue: 'api-handler',
        options: ['api-handler', 'react-widget', 'cli-tool'],
      },
      {
        name: 'language',
        label: 'Target language',
        type: 'select',
        placeholder: 'Select output language',
        defaultValue: 'TypeScript',
        options: ['TypeScript', 'Python', 'Rust', 'Go'],
      },
    ],
    actions: [
      { name: 'preview', label: 'Generate Preview' },
      { name: 'generate', label: 'Build Artifact' },
    ],
  };

  it('derives prop types, defaults, and JSX bindings from the spec', () => {
    const generator = new WebUIGenerator(generatorConfig);

    const componentCode = (generator as unknown as { _generateComponentCode: (name: string, spec: ComponentSpec) => string }).
      _generateComponentCode('preview-generate-workflow', baseComponentSpec);

    expect(componentCode).toContain('GeneratedPreviewGenerateWorkflow');
    expect(componentCode).toContain('onAction?: (action: ActionName, values: Record<InputName, string>) => void;');
    expect(componentCode).toContain('const defaultTitle = "Preview/Generate Workflow"');
    expect(componentCode).toContain('const defaultInputs = {\n  "snippet": "api-handler",\n  "language": "TypeScript"\n}');
    expect(componentCode).toContain('Build Artifact');
    expect(componentCode).toContain('language');
  });

  it('uses pascal-cased component identifiers for page imports and usage', () => {
    const generator = new WebUIGenerator(generatorConfig);
    const pageSpec: PageSpec = {
      uuid: 'page-editor',
      id: 'webui.page.editor',
      route: '/editor',
      components: ['preview-generate-workflow'],
    };
    const pageCode = (generator as unknown as {
      _generatePageCode: (name: string, page: PageSpec, components: Record<string, ComponentSpec>) => string;
    })._generatePageCode('editor', pageSpec, {
      'preview-generate-workflow': baseComponentSpec,
    });

    expect(pageCode).toContain("import { GeneratedPreviewGenerateWorkflow } from '../../components/generated-preview-generate-workflow';");
    expect(pageCode).toContain('<GeneratedPreviewGenerateWorkflow />');
  });
});
