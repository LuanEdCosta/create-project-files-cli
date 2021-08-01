import chalk from 'chalk'

import {
  CreateCommand,
  CreateCommandResult,
  CreateCommandOptionsWithDefaults,
} from '@app/core/commands'

export const showResultsInConsole = (results: CreateCommandResult[]) => {
  results.forEach((result) => {
    const isFile = result.type === 'file'
    const typeText = isFile ? 'File' : 'Folder'
    const message = `${typeText} created at ${result.destinationPath}`
    console.log(chalk.green(message))
  })
}

export const createCommandAction = (
  source: string,
  destination: string,
  options: CreateCommandOptionsWithDefaults,
) => {
  const results = new CreateCommand(source, destination, options).run()
  showResultsInConsole(results)
}
