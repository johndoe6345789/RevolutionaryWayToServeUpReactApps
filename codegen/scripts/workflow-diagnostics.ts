#!/usr/bin/env bun

import { promises as fs } from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { parse } from 'yaml';
import { fileURLToPath } from 'url';

interface Diagnostic {
  severity: 'error' | 'warning';
  message: string;
  workflow: string;
  jobId?: string;
  stepName?: string;
  hint?: string;
}

interface WorkflowReport {
  file: string;
  jobs: number;
  diagnostics: Diagnostic[];
}

async function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const filter = args.find((arg) => arg.startsWith('--workflow='))?.split('=')[1];

  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const workflowsDir = join(repoRoot, '.github', 'workflows');

  const workflowFiles = await getWorkflowFiles(workflowsDir, filter);

  if (!workflowFiles.length) {
    console.error('No workflow files found.');
    process.exit(1);
  }

  const reports: WorkflowReport[] = [];
  for (const file of workflowFiles) {
    const report = await analyzeWorkflow(file);
    reports.push(report);
  }

  if (outputJson) {
    console.log(JSON.stringify({ reports }, null, 2));
    return;
  }

  printSummary(reports);
}

async function getWorkflowFiles(workflowsDir: string, filter?: string): Promise<string[]> {
  let entries: string[] = [];
  try {
    entries = await fs.readdir(workflowsDir);
  } catch (error) {
    throw new Error(`Unable to read workflows directory at ${workflowsDir}: ${error}`);
  }

  return entries
    .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
    .filter((file) => (filter ? file.includes(filter) : true))
    .map((file) => join(workflowsDir, file));
}

async function analyzeWorkflow(filePath: string): Promise<WorkflowReport> {
  const contents = await fs.readFile(filePath, 'utf8');
  const report: WorkflowReport = { file: basename(filePath), jobs: 0, diagnostics: [] };

  let workflow: any;
  try {
    workflow = parse(contents);
  } catch (error) {
    report.diagnostics.push({
      severity: 'error',
      message: `YAML parse failed: ${error}`,
      workflow: report.file,
      hint: 'Check for indentation, spacing, or stray characters.'
    });
    return report;
  }

  if (!workflow || typeof workflow !== 'object') {
    report.diagnostics.push({
      severity: 'error',
      message: 'Workflow is empty or not an object.',
      workflow: report.file,
      hint: 'Ensure the workflow YAML starts with valid keys like "name" and "on".'
    });
    return report;
  }

  if (!workflow.on) {
    report.diagnostics.push({
      severity: 'warning',
      message: 'Workflow has no triggers defined under "on".',
      workflow: report.file,
      hint: 'Add event triggers (push, pull_request, workflow_dispatch, etc.) so the workflow can run.'
    });
  }

  if (!workflow.jobs || typeof workflow.jobs !== 'object') {
    report.diagnostics.push({
      severity: 'error',
      message: 'No jobs block found in workflow.',
      workflow: report.file,
      hint: 'Define at least one job under the top-level "jobs" key.'
    });
    return report;
  }

  const jobIds = Object.keys(workflow.jobs);
  report.jobs = jobIds.length;

  for (const jobId of jobIds) {
    const job = workflow.jobs[jobId];
    const isReusableWorkflow = typeof job.uses === 'string';

    if (!isReusableWorkflow && !job['runs-on']) {
      report.diagnostics.push({
        severity: 'error',
        message: 'Job is missing a "runs-on" target.',
        workflow: report.file,
        jobId,
        hint: 'Set runs-on to a GitHub-hosted runner (e.g., ubuntu-latest) or a self-hosted label.'
      });
    }

    const needs = normalizeNeeds(job.needs);
    for (const neededJob of needs) {
      if (!workflow.jobs[neededJob]) {
        report.diagnostics.push({
          severity: 'error',
          message: `Job depends on missing job "${neededJob}".`,
          workflow: report.file,
          jobId,
          hint: 'Update the needs list so it only references defined jobs.'
        });
      }
    }

    const steps = Array.isArray(job.steps) ? job.steps : [];
    for (const step of steps) {
      if (typeof step.uses === 'string') {
        const usesDiagnostic = validateActionReference(step.uses, report.file, jobId, step.name);
        if (usesDiagnostic) {
          report.diagnostics.push(usesDiagnostic);
        }
      }
    }
  }

  return report;
}

function normalizeNeeds(needs: unknown): string[] {
  if (!needs) return [];
  if (Array.isArray(needs)) return needs.filter((entry) => typeof entry === 'string');
  if (typeof needs === 'string') return [needs];
  return [];
}

function validateActionReference(
  usesValue: string,
  workflow: string,
  jobId?: string,
  stepName?: string
): Diagnostic | null {
  if (usesValue.startsWith('./') || usesValue.startsWith('../') || usesValue.startsWith('docker://')) {
    return null;
  }

  const hasVersion = usesValue.includes('@');
  if (!hasVersion) {
    return {
      severity: 'warning',
      message: 'Action reference is not version-pinned.',
      workflow,
      jobId,
      stepName,
      hint: 'Pin actions to a tag, release, or commit (e.g., actions/checkout@v4) to avoid breaking changes.'
    };
  }

  const version = usesValue.split('@')[1];
  const floatingVersions = ['main', 'master', 'latest', 'HEAD'];
  if (floatingVersions.includes(version)) {
    return {
      severity: 'warning',
      message: `Action reference uses a floating version (${version}).`,
      workflow,
      jobId,
      stepName,
      hint: 'Switch to a stable tag or commit SHA to guarantee reproducibility.'
    };
  }

  return null;
}

function printSummary(reports: WorkflowReport[]) {
  console.log('🔍 GitHub Actions workflow diagnostics');
  console.log(`📁 Checked ${reports.length} workflow file(s)`);

  for (const report of reports) {
    console.log(`\n• ${report.file} (${report.jobs} job${report.jobs === 1 ? '' : 's'})`);
    if (!report.diagnostics.length) {
      console.log('  ✅ No issues detected');
      continue;
    }

    for (const diag of report.diagnostics) {
      const icon = diag.severity === 'error' ? '❌' : '⚠️';
      const scope = [diag.jobId, diag.stepName].filter(Boolean).join(' → ');
      const location = scope ? ` [${scope}]` : '';
      console.log(`  ${icon} ${diag.message}${location}`);
      if (diag.hint) {
        console.log(`     ↳ ${diag.hint}`);
      }
    }
  }

  const totals = reports.reduce(
    (acc, report) => {
      for (const diag of report.diagnostics) {
        acc[diag.severity] += 1;
      }
      return acc;
    },
    { error: 0, warning: 0 }
  );

  console.log('\nSummary:');
  console.log(`  Errors: ${totals.error}`);
  console.log(`  Warnings: ${totals.warning}`);

  if (totals.error === 0 && totals.warning === 0) {
    console.log('  ✅ Workflows look healthy.');
  }
}

await main();
