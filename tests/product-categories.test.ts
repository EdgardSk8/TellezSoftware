import assert from 'node:assert/strict'
import test from 'node:test'
import { productKindForCategory } from '../shared/product-categories.ts'

test('uses product category instead of the workspace to choose product fields', () => {
  assert.equal(productKindForCategory('Bebidas', 'clothing'), 'beverages')
  assert.equal(productKindForCategory('Clothing', 'general'), 'clothing')
  assert.equal(productKindForCategory('Repuestos', 'food'), 'auto_parts')
  assert.equal(productKindForCategory('Tecnología', 'hardware'), 'electronics')
})

test('falls back to the business group for unrecognized categories', () => {
  assert.equal(productKindForCategory('Ropa', 'clothing'), 'clothing')
  assert.equal(productKindForCategory('Hogar', 'general'), 'general')
})
