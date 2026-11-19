import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BUSINESS_TYPES,
  businessGroupForType,
  inventoryProfileForBusinessType,
  isBusinessType,
  isSelectableBusinessType,
} from '../shared/business-types.ts'

test('offers four business groups while accepting existing workspace types', () => {
  assert.deepEqual(BUSINESS_TYPES, ['clothing', 'hardware', 'food', 'general'])
  for (const businessType of BUSINESS_TYPES) {
    assert.equal(isBusinessType(businessType), true)
    assert.equal(isSelectableBusinessType(businessType), true)
  }
  assert.equal(isBusinessType('liquor'), true)
  assert.equal(isSelectableBusinessType('liquor'), false)
  assert.equal(isBusinessType('unknown'), false)
  assert.equal(isBusinessType(null), false)
})

test('groups historical business types without deleting their workspaces', () => {
  assert.equal(businessGroupForType('auto_parts'), 'hardware')
  assert.equal(businessGroupForType('liquor'), 'food')
  assert.equal(businessGroupForType('electronics'), 'general')
  assert.equal(businessGroupForType('personal'), 'general')
})

test('maps business types to compatible initial product profiles', () => {
  assert.equal(inventoryProfileForBusinessType('clothing'), 'clothing')
  assert.equal(inventoryProfileForBusinessType('hardware'), 'hardware')
  assert.equal(inventoryProfileForBusinessType('personal'), 'personal')
  for (const businessType of ['electronics', 'auto_parts', 'food', 'liquor', 'general'] as const) {
    assert.equal(inventoryProfileForBusinessType(businessType), 'solid_goods')
  }
})
