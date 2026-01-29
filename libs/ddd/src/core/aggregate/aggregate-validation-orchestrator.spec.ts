// Mock to avoid circular dependencies during testing
jest.mock('../validator-rules/impl/abstract-rule-validator', () => {
  return {
    AbstractRuleValidator: class MockAbstractRuleValidator {
      constructor(public subject: any) {}
      public addBrokenRule(property: string, description: string): void {}
      public addRules(): void {}
    },
  };
});

import { AggregateValidationOrchestrator } from './aggregate-validation-orchestrator';
import { BrokenRulesManager } from '../../broken-rules.manager';
import { ValidatorRuleManager } from '../../validator-rule.manager';
import { BrokenRule } from '../business-rules';

// Test entity for testing
class TestEntity {
  constructor(public name: string) {}
}

// Mock validator that doesn't extend AbstractRuleValidator
class TestValidator {
  private brokenRules: BrokenRule[] = [];

  constructor(private subject: TestEntity) {}

  public addRules(): void {
    if (this.subject.name === 'invalid') {
      this.brokenRules.push(new BrokenRule('name', 'Name is invalid', 'Error'));
    }
  }

  public validate(): BrokenRule[] {
    this.addRules();
    return this.brokenRules;
  }

  public getBrokenRules(): BrokenRule[] {
    return this.validate();
  }
}

describe('AggregateValidationOrchestrator', () => {
  let brokenRulesManager: BrokenRulesManager;
  let validatorRuleManager: ValidatorRuleManager<any>;
  let guardStrategy: jest.Mock;
  let validatorsStrategy: jest.Mock;

  beforeEach(() => {
    brokenRulesManager = new BrokenRulesManager();
    validatorRuleManager = new ValidatorRuleManager<any>();
    guardStrategy = jest.fn();
    validatorsStrategy = jest.fn();
  });

  describe('constructor', () => {
    it('should create an orchestrator with all dependencies', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      expect(orchestrator).toBeInstanceOf(AggregateValidationOrchestrator);
    });
  });

  describe('validate', () => {
    it('should execute guard strategy', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('valid');
      orchestrator.validate(entity);

      expect(guardStrategy).toHaveBeenCalled();
    });

    it('should execute validators strategy', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('valid');
      orchestrator.validate(entity);

      expect(validatorsStrategy).toHaveBeenCalledWith(validatorRuleManager);
    });

    it('should return zero broken rules for valid entity', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('valid');
      const count = orchestrator.validate(entity);

      expect(count).toBe(0);
    });

    it('should collect broken rules from validators', () => {
      validatorsStrategy.mockImplementation((manager) => {
        const entity = new TestEntity('invalid');
        manager.add(new TestValidator(entity));
      });

      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('invalid');
      const count = orchestrator.validate(entity);

      expect(count).toBeGreaterThan(0);
      expect(brokenRulesManager.getBrokenRules().length).toBeGreaterThan(0);
    });

    it('should add validator broken rules to broken rules manager', () => {
      validatorsStrategy.mockImplementation((manager) => {
        const entity = new TestEntity('invalid');
        manager.add(new TestValidator(entity));
      });

      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('invalid');
      orchestrator.validate(entity);

      const brokenRules = brokenRulesManager.getBrokenRules();
      expect(brokenRules.length).toBeGreaterThan(0);
      expect(brokenRules[0].property).toBe('name');
    });

    it('should execute all validation stages in order', () => {
      const executionOrder: string[] = [];

      guardStrategy.mockImplementation(() => {
        executionOrder.push('guard');
      });

      validatorsStrategy.mockImplementation(() => {
        executionOrder.push('validators');
      });

      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('valid');
      orchestrator.validate(entity);

      expect(executionOrder).toEqual(['guard', 'validators']);
    });
  });

  describe('isValid', () => {
    it('should return true when no broken rules', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      expect(orchestrator.isValid()).toBe(true);
    });

    it('should return false when broken rules exist', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      brokenRulesManager.add(
        new BrokenRule('test', 'Test broken rule', 'Error'),
      );

      expect(orchestrator.isValid()).toBe(false);
    });

    it('should reflect validation result', () => {
      validatorsStrategy.mockImplementation((manager) => {
        const entity = new TestEntity('invalid');
        manager.add(new TestValidator(entity));
      });

      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('invalid');
      orchestrator.validate(entity);

      expect(orchestrator.isValid()).toBe(false);
    });
  });

  describe('clearBrokenRules', () => {
    it('should clear all broken rules', () => {
      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      brokenRulesManager.add(
        new BrokenRule('test', 'Test broken rule', 'Error'),
      );
      expect(brokenRulesManager.getBrokenRules().length).toBe(1);

      orchestrator.clearBrokenRules();

      expect(brokenRulesManager.getBrokenRules().length).toBe(0);
    });

    it('should allow re-validation after clearing', () => {
      validatorsStrategy.mockImplementation((manager) => {
        const entity = new TestEntity('invalid');
        manager.add(new TestValidator(entity));
      });

      const orchestrator = new AggregateValidationOrchestrator(
        guardStrategy,
        validatorsStrategy,
        brokenRulesManager,
        validatorRuleManager,
      );

      const entity = new TestEntity('invalid');
      orchestrator.validate(entity);
      expect(orchestrator.isValid()).toBe(false);

      orchestrator.clearBrokenRules();
      expect(orchestrator.isValid()).toBe(true);
    });
  });
});
