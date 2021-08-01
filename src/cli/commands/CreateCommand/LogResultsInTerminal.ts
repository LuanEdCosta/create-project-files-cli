import chalk from 'chalk'

import { CreateCommandResult } from '@app/core/commands'

export const logResultsInTerminal = (results: CreateCommandResult[]) => {
  results.forEach((result) => {
    const isFile = result.type === 'file'
    const typeText = isFile ? 'File' : 'Folder'
    const message = `${typeText} created at ${result.destinationPath}`
    console.log(chalk.green(message))
  })
}
