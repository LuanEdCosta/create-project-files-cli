import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

describe('Program tests', () => {
  const cli = (commands: string, cwd: string) => {
    return new Promise((resolve) => {
      exec(`yarn dev ${commands}`, { cwd }, (error, stdout, stderr) => {
        resolve({
          errorCode: error?.code || 0,
          error,
          stdout,
          stderr,
        })
      })
    })
  }

  it('should create a single file in the correct folder', async () => {
    await cli('create text.txt __testing-folder__', '.')
    const wasFileCreated = fs.existsSync(
      path.resolve(process.cwd(), '__testing-folder__', 'text.txt'),
    )
    expect(wasFileCreated).toBe(true)
  })
})
