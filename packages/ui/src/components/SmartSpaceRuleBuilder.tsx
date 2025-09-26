import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input, Select } from './Input';
import { RuleBuilder, type SmartSpaceRule, type SmartSpaceRules } from '@floe/shared';

interface SmartSpaceRuleBuilderProps {
  initialRules?: SmartSpaceRules;
  onChange?: (rules: SmartSpaceRules) => void;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
  className?: string;
}

export function SmartSpaceRuleBuilder({
  initialRules,
  onChange,
  onValidationChange,
  className = ''
}: SmartSpaceRuleBuilderProps) {
  const [rules, setRules] = useState<SmartSpaceRules>(initialRules || {
    conditions: [],
    logic: 'AND'
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const validation = RuleBuilder.validateRules(rules);
    setValidationErrors(validation.errors);
    onValidationChange?.(validation.valid, validation.errors);
    onChange?.(rules);
  }, [rules, onChange, onValidationChange]);

  const addCondition = () => {
    const newCondition: SmartSpaceRule = {
      field: 'type',
      operator: 'equals',
      value: ''
    };

    setRules({
      ...rules,
      conditions: [...rules.conditions, newCondition]
    });
  };

  const removeCondition = (index: number) => {
    setRules({
      ...rules,
      conditions: rules.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index: number, condition: SmartSpaceRule) => {
    const newConditions = [...rules.conditions];
    newConditions[index] = condition;
    setRules({
      ...rules,
      conditions: newConditions
    });
  };

  const updateLogic = (logic: 'AND' | 'OR') => {
    setRules({
      ...rules,
      logic
    });
  };

  const loadSampleRule = (sampleRules: SmartSpaceRules) => {
    setRules(sampleRules);
  };

  const availableFields = RuleBuilder.getAvailableFields();
  const sampleRules = RuleBuilder.getSampleRules();

  return (
    <div className={`space-y-lg ${className}`}>
      {/* Logic selector */}
      <div className="space-y-sm">
        <label className="block text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
          Logic
        </label>
        <div className="flex space-x-sm">
          <button
            onClick={() => updateLogic('AND')}
            className={`
              px-md py-sm text-sm border transition-colors duration-150
              ${rules.logic === 'AND'
                ? 'bg-selected-light dark:bg-selected-dark border-border-dark dark:border-border-light'
                : 'bg-transparent border-border-light dark:border-border-dark'
              }
              text-text-primary-light dark:text-text-primary-dark
              hover:bg-hover-light dark:hover:bg-hover-dark
            `}
          >
            AND
          </button>
          <button
            onClick={() => updateLogic('OR')}
            className={`
              px-md py-sm text-sm border transition-colors duration-150
              ${rules.logic === 'OR'
                ? 'bg-selected-light dark:bg-selected-dark border-border-dark dark:border-border-light'
                : 'bg-transparent border-border-light dark:border-border-dark'
              }
              text-text-primary-light dark:text-text-primary-dark
              hover:bg-hover-light dark:hover:bg-hover-dark
            `}
          >
            OR
          </button>
        </div>
        <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
          {rules.logic === 'AND' ? 'All conditions must match' : 'Any condition must match'}
        </p>
      </div>

      {/* Conditions */}
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <label className="text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
            Conditions
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={addCondition}
          >
            Add condition
          </Button>
        </div>

        {rules.conditions.length === 0 && (
          <div className="border-2 border-dashed border-border-light dark:border-border-dark p-lg text-center">
            <p className="text-sm text-text-tertiary-light dark:text-text-tertiary-dark">
              No conditions defined. Click "Add condition" to get started.
            </p>
          </div>
        )}

        {rules.conditions.map((condition, index) => (
          <ConditionEditor
            key={index}
            condition={condition}
            index={index}
            availableFields={availableFields}
            onUpdate={(updatedCondition) => updateCondition(index, updatedCondition)}
            onRemove={() => removeCondition(index)}
            showLogicConnector={index < rules.conditions.length - 1}
            logic={rules.logic}
          />
        ))}
      </div>

      {/* Rule description */}
      <div className="border border-border-light dark:border-border-dark p-md bg-bg-secondary-light dark:bg-bg-secondary-dark">
        <div className="space-y-sm">
          <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
            Rule Description
          </p>
          <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
            {RuleBuilder.rulesToDescription(rules)}
          </p>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="border border-red-500 p-md bg-red-50 dark:bg-red-950">
          <div className="space-y-xs">
            <p className="text-xs text-red-600 dark:text-red-400 font-mono tracking-wide uppercase">
              Validation Errors
            </p>
            {validationErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Sample rules */}
      <div className="space-y-sm">
        <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide uppercase">
          Quick Start Templates
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          {sampleRules.slice(0, 4).map((sample) => (
            <button
              key={sample.name}
              onClick={() => loadSampleRule(sample.rules)}
              className="
                p-sm border border-border-light dark:border-border-dark
                hover:bg-hover-light dark:hover:bg-hover-dark
                transition-colors duration-150
                text-left
              "
            >
              <div className="space-y-xs">
                <p className="text-sm text-text-primary-light dark:text-text-primary-dark font-medium">
                  {sample.name}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {sample.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ConditionEditorProps {
  condition: SmartSpaceRule;
  index: number;
  availableFields: any[];
  onUpdate: (condition: SmartSpaceRule) => void;
  onRemove: () => void;
  showLogicConnector: boolean;
  logic: 'AND' | 'OR';
}

function ConditionEditor({
  condition,
  index,
  availableFields,
  onUpdate,
  onRemove,
  showLogicConnector,
  logic
}: ConditionEditorProps) {
  const selectedField = availableFields.find(f => f.id === condition.field);
  const availableOperators = selectedField ? RuleBuilder.getOperatorsForField(condition.field) : [];

  const updateField = (fieldId: string) => {
    const field = availableFields.find(f => f.id === fieldId);
    if (!field) return;

    const firstOperator = field.operators[0];
    onUpdate({
      field: fieldId,
      operator: firstOperator,
      value: ''
    });
  };

  const updateOperator = (operator: string) => {
    onUpdate({
      ...condition,
      operator: operator as any
    });
  };

  const updateValue = (value: any) => {
    onUpdate({
      ...condition,
      value
    });
  };

  const renderValueInput = () => {
    if (!selectedField) return null;

    switch (selectedField.type) {
      case 'boolean':
        return (
          <Select
            value={condition.value?.toString() || ''}
            onChange={(e) => updateValue(e.target.value === 'true')}
            className="flex-1"
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        );

      case 'enum':
        return (
          <Select
            value={condition.value || ''}
            onChange={(e) => updateValue(e.target.value)}
            className="flex-1"
          >
            <option value="">Select...</option>
            {selectedField.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={condition.value ? new Date(condition.value).toISOString().split('T')[0] : ''}
            onChange={(e) => updateValue(e.target.value)}
            className="flex-1"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={condition.value || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Enter value..."
            className="flex-1"
          />
        );
    }
  };

  return (
    <div className="space-y-sm">
      <div className="border border-border-light dark:border-border-dark p-md">
        <div className="flex items-start space-x-sm">
          {/* Condition number */}
          <div className="flex-shrink-0 w-6 h-6 rounded-full border border-border-light dark:border-border-dark flex items-center justify-center">
            <span className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
              {index + 1}
            </span>
          </div>

          {/* Condition controls */}
          <div className="flex-1 space-y-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
              {/* Field selector */}
              <Select
                value={condition.field}
                onChange={(e) => updateField(e.target.value)}
              >
                {availableFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </Select>

              {/* Operator selector */}
              <Select
                value={condition.operator}
                onChange={(e) => updateOperator(e.target.value)}
                disabled={!selectedField}
              >
                {availableOperators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.label}
                  </option>
                ))}
              </Select>

              {/* Value input */}
              {renderValueInput()}
            </div>

            {selectedField?.description && (
              <p className="text-xs text-text-tertiary-light dark:text-text-tertiary-dark">
                {selectedField.description}
              </p>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="
              flex-shrink-0 text-text-tertiary-light dark:text-text-tertiary-dark
              hover:text-red-600 dark:hover:text-red-400
              transition-colors duration-150
            "
          >
            ×
          </button>
        </div>
      </div>

      {/* Logic connector */}
      {showLogicConnector && (
        <div className="flex justify-center">
          <span className="px-sm py-xs text-xs bg-selected-light dark:bg-selected-dark border border-border-light dark:border-border-dark text-text-tertiary-light dark:text-text-tertiary-dark font-mono tracking-wide">
            {logic}
          </span>
        </div>
      )}
    </div>
  );
}