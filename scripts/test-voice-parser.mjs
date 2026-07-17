#!/usr/bin/env node
/**
 * Smoke test for local voice parser heuristics (no browser).
 */
import { localParseVoiceActions } from '../src/services/voiceParser.js'

const cases = [
  ['新增待辦明天買牛奶', 'create_task'],
  ['完成報告', 'complete_task'],
  ['日誌：今天學了很多 React', 'create_journal'],
  ['花了2小時在 Personal OS 專案', 'log_activity'],
  ['筆記：React hooks 原理', 'create_study'],
]

let failed = 0
for (const [input, expectedType] of cases) {
  const actions = localParseVoiceActions(input)
  const type = actions[0]?.type
  if (type !== expectedType) {
    console.error(`FAIL: "${input}" → ${type}, expected ${expectedType}`)
    failed++
  } else {
    console.info(`OK: "${input}" → ${type}`)
  }
}

if (failed) {
  process.exit(1)
}
console.info('\nPASS: voice parser smoke test')
