import chalk from 'chalk'

import { CreateCommand, CreateCommandOptions } from '@app/core/commands'

export const createCommandAction = (
  source: string,
  destination: string,
  options: CreateCommandOptions,
) => {
  const results = new CreateCommand(source, destination, options).run()

  results.forEach((result) => {
    const isFile = result.type === 'file'
    const typeText = isFile ? 'File' : 'Folder'
    const message = `${typeText} created at ${result.destinationPath}`
    console.log(chalk.green(message))
  })
}
