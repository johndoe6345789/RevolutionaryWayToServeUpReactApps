/**
 * Generated Preview/Generate Workflow
 *
 * Select snippet/language and generate preview or artifact
 *
 * Auto-generated from spec.json
 */

import React, { useMemo, useState } from 'react';

type InputName = 'snippet' | 'language';
type ActionName = 'preview' | 'generate';

interface GeneratedPreviewGenerateWorkflowProps {
  title?: string;
  summary?: string;
  inputs?: Partial<Record<InputName, string>>;
  actions?: Partial<Record<ActionName, string>>;
  onInputChange?: (name: InputName, value: string) => void;
  onAction?: (action: ActionName, values: Record<InputName, string>) => void;
}

const inputDefinitions: Array<{
  name: InputName;
  label: string;
  type: 'select';
  placeholder: string;
  defaultValue: string;
  options: string[];
  helperText: string;
}> = [
  {
    name: 'snippet',
    label: 'Snippet or group',
    type: 'select',
    placeholder: 'Choose a snippet to render',
    defaultValue: 'api-handler',
    options: ['api-handler', 'react-widget', 'cli-tool'],
    helperText: 'Pick the snippet or collection you want to preview',
  },
  {
    name: 'language',
    label: 'Target language',
    type: 'select',
    placeholder: 'Select output language',
    defaultValue: 'TypeScript',
    options: ['TypeScript', 'Python', 'Rust', 'Go'],
    helperText: 'Language passed to preview and generation requests',
  },
];

const actionDefinitions: Array<{
  name: ActionName;
  label: string;
  helperText?: string;
}> = [
  {
    name: 'preview',
    label: 'Generate Preview',
    helperText: 'Generate a quick preview without saving an artifact',
  },
  {
    name: 'generate',
    label: 'Build Artifact',
    helperText: 'Trigger backend build to produce zip/tarball',
  },
];

const defaultTitle = 'Preview/Generate Workflow';
const defaultSummary = 'Select snippet/language and generate preview or artifact';

const GeneratedPreviewGenerateWorkflow: React.FC<GeneratedPreviewGenerateWorkflowProps> = ({
  title = defaultTitle,
  summary = defaultSummary,
  inputs = {},
  actions: actionOverrides = {},
  onInputChange,
  onAction,
}) => {
  const defaultInputs = useMemo(
    () =>
      inputDefinitions.reduce<Record<InputName, string>>((acc, input) => {
        acc[input.name] = input.defaultValue;
        return acc;
      }, {} as Record<InputName, string>),
    [],
  );

  const [formValues, setFormValues] = useState<Record<InputName, string>>({
    ...defaultInputs,
    ...inputs,
  });

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

      <div className="generated-inputs" role="form">
        {inputDefinitions.map((input) => {
          const value = formValues[input.name] ?? '';
          const inputId = `preview-generate-workflow-${input.name}`;

          return (
            <label key={input.name} htmlFor={inputId} className="generated-input">
              <span className="generated-input__label">{input.label}</span>
              <select
                id={inputId}
                value={value}
                onChange={(event) => handleInputChange(input.name, event.target.value)}
              >
                <option value="" disabled>
                  {input.placeholder}
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
        })}
      </div>

      <div className="generated-actions" role="group" aria-label="Actions">
        {actionDefinitions.map((action) => (
          <button
            key={action.name}
            type="button"
            onClick={() => handleAction(action.name)}
            aria-label={action.helperText ?? action.label}
          >
            {actionOverrides[action.name] ?? action.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default GeneratedPreviewGenerateWorkflow;
