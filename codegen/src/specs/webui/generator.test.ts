import fs from 'fs';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, it, vi } from 'vitest';

import { WebUIGenerator } from './generator';
import type { APIRouteSpec } from './types/api-route-spec';
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
