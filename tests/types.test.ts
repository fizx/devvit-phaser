import { describe, it, expect } from 'vitest';
import { DataManagerId, DataManagerMutation, DataManagerSubscription } from '../src/types';

describe('Types', () => {
  it('should create valid DataManagerId', () => {
    const id: DataManagerId = { id: 'test' };
    expect(id.id).toBe('test');
    expect(id.isGlobal).toBeUndefined();

    const globalId: DataManagerId = { id: 'global_test', isGlobal: true };
    expect(globalId.id).toBe('global_test');
    expect(globalId.isGlobal).toBe(true);
  });

  it('should create valid DataManagerMutation', () => {
    const mutation: DataManagerMutation = {
      dataManagerId: { id: 'test' },
      updates: { score: 100 },
      deletes: ['oldKey'],
      increments: { counter: 1 }
    };

    expect(mutation.dataManagerId.id).toBe('test');
    expect(mutation.updates?.score).toBe(100);
    expect(mutation.deletes?.[0]).toBe('oldKey');
    expect(mutation.increments?.counter).toBe(1);
  });

  it('should create valid DataManagerSubscription', () => {
    const subscription: DataManagerSubscription = {
      add: [{ id: 'test1' }, { id: 'test2' }],
      remove: [{ id: 'old' }]
    };

    expect(subscription.add?.length).toBe(2);
    expect(subscription.add?.[0].id).toBe('test1');
    expect(subscription.remove?.length).toBe(1);
    expect(subscription.remove?.[0].id).toBe('old');
  });
});