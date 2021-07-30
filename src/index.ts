#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'

import { CreateCommand, CreateCommandOptions } from '@app/commands'

import { NotFoundError, SyntaxError } from './errors'

const packageJson = require('../package.json')

const program = new Command()

try {
  program
    .version(packageJson?.version || 'Not Defined')
    .command('create <source> <destination>')
    .description(
      'Creates a file or folder based on the <source> at <destination>',
    )
    .option('-n, --name [name]', 'Changes the name of a file or folder', '')
    .option(
      '-t, --templates-folder [path]',
      'Path to templates folder',
      '__file-templates__',
    )
    .option(
      '-e, --encoding [encoding]',
      'Changes the content encoding of the read files',
      'utf-8',
    )
    .option(
      '-rn, --replace-names [names...]',
      'Replaces the names of a file or folder',
      undefined,
    )
    .option(
      '-nb, --no-brackets',
      'Makes brackets not required when using the --replace-names option',
    )
    .option(
      '-rc, --replace-content [content...]',
      'Replaces parts of the contents of a file or files within a folder',
      undefined,
    )
    .action(
      (source: string, destination: string, options: CreateCommandOptions) => {
        const command = new CreateCommand(source, destination, options)
        const results = command.run()
        results.forEach((result) => {
          const isFile = result.type === 'file'
          console.log(
            chalk.green(
              `${isFile ? 'File' : 'Folder'} created at ${
                result.destinationPath
              }`,
            ),
          )
        })
      },
    )

  program.parse(process.argv)
} catch (e) {
  if (e instanceof SyntaxError) {
    const syntaxError = e as SyntaxError
    console.log(chalk.red(syntaxError.message))

    console.log()
    console.log(chalk.green('Expected:'))
    console.log(chalk.green(syntaxError.expected))

    console.log()
    console.log(chalk.redBright('Received:'))
    console.log(chalk.redBright(syntaxError.received))
  } else if (e instanceof NotFoundError) {
    const notFoundError = e as NotFoundError
    console.log(chalk.red(notFoundError.message))
  } else {
    const error = e as Error
    console.log(chalk.red(error.message))
  }
}
