#!/usr/bin/env node

import chalk from 'chalk'
import { Command } from 'commander'

import {
  CreateCommand,
  DefaultOptions,
  CreateCommandOptions,
} from '@app/core/commands'

export default new Command('create')
  .arguments('<source> <destination>')
  .description(
    'Creates a file or folder based on the <source> at <destination>',
  )
  .option(
    '-n, --name [name]',
    'Changes the name of a file or folder',
    DefaultOptions.name,
  )
  .option(
    '-t, --templates-folder [path]',
    'Path to templates folder',
    DefaultOptions.templatesFolder,
  )
  .option(
    '-e, --encoding [encoding]',
    'Changes the content encoding of the read files',
    DefaultOptions.encoding,
  )
  .option(
    '-rn, --replace-names [names...]',
    'Replaces the names of a file or folder',
    DefaultOptions.replaceNames,
  )
  .option(
    '-nb, --no-brackets',
    'Makes brackets not required when using the --replace-names option',
    DefaultOptions.brackets,
  )
  .option(
    '-rc, --replace-content [content...]',
    'Replaces parts of the contents of a file or files within a folder',
    DefaultOptions.replaceContent,
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
