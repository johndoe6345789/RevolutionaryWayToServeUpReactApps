import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, it, vi } from 'vitest';

import { WebUIGenerator } from './generator';
import type { APIRouteSpec } from './types/api-route-spec';
import type { ComponentSpec } from './types/component-spec';
import type { PageSpec } from './types/page-spec';
import type { WebUIGeneratorSpec } from './types/webui-generator-spec';
import type { WebUISpecData } from './types/webui-spec-data';

vi.mock('next/server', () => {
  class MockRequest {
    url: string;
    private body: unknown;

    constructor(url: string, body?: unknown) {
      this.url = url;
      this.body = body;
    }

    async json() {
      return this.body;
    }
  }

  const NextResponse = {
    json: (payload: unknown, init?: { status?: number }) => ({ status: init?.status ?? 200, body: payload }),
  };

  return { NextRequest: MockRequest, NextResponse };
});

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

function writeSpec(specsPath: string, apiSpec: APIRouteSpec) {
  const spec: WebUISpecData = {
    uuid: 'test',
    id: 'webui',
    type: 'interface',
    components: {},
    pages: {},
    'api-routes': {
      [apiSpec.id]: apiSpec,
    },
    search: { title: 'Web UI', summary: 'Generated for tests' },
  } as WebUISpecData;

  fs.writeFileSync(path.join(specsPath, 'spec.json'), JSON.stringify(spec, null, 2));
}

async function generateRouteModule(apiSpec: APIRouteSpec) {
  const specsPath = fs.mkdtempSync(path.join(os.tmpdir(), 'webui-specs-'));
  const outputPath = fs.mkdtempSync(path.join(os.tmpdir(), 'webui-output-'));
  writeSpec(specsPath, apiSpec);

  const generator = new WebUIGenerator({ uuid: 'test', id: 'webui', search: { title: 't', summary: 's' }, specsPath, outputPath });
  await generator.initialise();
  await generator.execute({});

  const normalisedRoute = apiSpec.route.replace(/^\/+/, '');
  const modulePath = path.join(outputPath, 'app', 'api', normalisedRoute, 'route.ts');
  const moduleUrl = pathToFileURL(modulePath).href;
  // eslint-disable-next-line vitest/await-expect
  return import(moduleUrl);
}

const successResponse = {
  status: 201,
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      orderId: { type: 'string' },
      name: { type: 'string' },
      quantity: { type: 'number' },
    },
  },
};

const errorResponse = {
  status: 422,
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      errors: { type: 'array', items: { type: 'string' } },
      message: { type: 'string' },
    },
  },
};

const baseApiSpec: APIRouteSpec = {
  id: 'orders',
  route: '/orders',
  method: 'post',
  description: 'Create orders',
  params: [
    { name: 'tenant', in: 'query', type: 'string', required: true },
    { name: 'priority', in: 'query', type: 'boolean' },
  ],
  body: {
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        quantity: { type: 'number', required: true },
      },
    },
  },
  responses: {
    success: successResponse,
    errors: [errorResponse],
  },
};

describe('WebUIGenerator API route generation', () => {
  it('returns structured success responses when validation passes', async () => {
    const module = await generateRouteModule(baseApiSpec);
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('https://example.com/api/orders?tenant=acme&priority=true', {
      name: 'Widget',
      quantity: 2,
    });

    const response = await module.POST(request);

    expect(response.status).toBe(successResponse.status);
    expect(response.body).toMatchObject({
      success: true,
      name: 'Widget',
      quantity: 2,
    });
    expect(response.body).toHaveProperty('orderId');
  });

  it('returns schema-aligned errors when validation fails', async () => {
    const module = await generateRouteModule(baseApiSpec);
    const { NextRequest } = await import('next/server');

    const request = new NextRequest('https://example.com/api/orders', {
      name: 'Widget',
    });

    const response = await module.POST(request);

    expect(response.status).toBe(errorResponse.status);
    expect(response.body).toMatchObject({ success: false });
    expect(response.body.errors?.length).toBeGreaterThan(0);
  });
});
