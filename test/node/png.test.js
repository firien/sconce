import test from 'node:test'
import assert from 'node:assert/strict'
import pngDimensions from '../../javascripts/png.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

test('png dimensions test 1', () => {
  let buffer = readFileSync(join(__dirname, '../../images/icon-152.png'))
  let png = pngDimensions(new Uint8Array(buffer).buffer)
  assert.strictEqual(152, png.width)
  assert.strictEqual(152, png.height)
})

test('png dimensions test 2', () => {
  let buffer = readFileSync(join(__dirname, '../../images/icon-192.png'))
  let png = pngDimensions(new Uint8Array(buffer).buffer)
  assert.strictEqual(192, png.width)
  assert.strictEqual(192, png.height)
})
