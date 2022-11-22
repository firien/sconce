// @ts-check
import { test, expect } from '@playwright/test'
import testConfig from '../../playwright.config.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dropFiles = async (page, selector, ...files) => {
  let buffers = files.map((file) => {
    let buffer = readFileSync(join(__dirname, file))
    return Array.from(buffer)
  })
  let dataTransfer = await page.evaluateHandle((buffers) => {
    let dt = new DataTransfer()
    for (let buffer of buffers) {
      let file = new File([new Uint8Array(buffer)], 'image.png', { type: 'image/png' })
      dt.items.add(file)
    }
    return dt
  }, buffers)
  await page.dispatchEvent(selector, 'drop', { dataTransfer })
}

test('drop png', async ({ page }) => {
  await page.goto(`http://localhost:${testConfig.webServer.port}/sconce/`)
  await dropFiles(page, '#thirty-two', './images/icon-32.png')
  await expect(page.locator('img#thirty-two[src]')).toHaveAttribute('src', /^blob:/)
  page.on('download', download => console.log(download))
})
