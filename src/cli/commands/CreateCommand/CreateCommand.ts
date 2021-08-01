#!/usr/bin/env node

import { Command } from 'commander'

import { CREATE_COMMAND_DEFAULT_OPTIONS } from '@app/core/commands'

import { createCommandAction } from './CreateCommandAction'

export const CreateCommand = new Command('create')
  .arguments('<source> <destination>')
  .description(
    'Creates a file or folder based on the <source> at <destination>',
  )
  .option(
    '-n, --name [name]',
    'Changes the name of a file or folder',
    CREATE_COMMAND_DEFAULT_OPTIONS.name,
  )
  .option(
    '-t, --templates-folder [path]',
    'Path to templates folder',
    CREATE_COMMAND_DEFAULT_OPTIONS.templatesFolder,
  )
  .option(
    '-e, --encoding [encoding]',
    'Changes the content encoding of the read files',
    CREATE_COMMAND_DEFAULT_OPTIONS.encoding,
  )
  .option(
    '-rn, --replace-names [names...]',
    'Replaces the names of a file or folder',
    CREATE_COMMAND_DEFAULT_OPTIONS.replaceNames,
  )
  .option(
    '-nb, --no-brackets',
    'Makes brackets not required when using the --replace-names option',
    CREATE_COMMAND_DEFAULT_OPTIONS.brackets,
  )
  .option(
    '-rc, --replace-content [content...]',
    'Replaces parts of the contents of a file or files within a folder',
    CREATE_COMMAND_DEFAULT_OPTIONS.replaceContent,
  )
  .action(createCommandAction)
