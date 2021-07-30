#!/usr/bin/env node

import { Command } from 'commander'

import { handleErrors } from '@app/cli/errors'
import { CreateCommand } from '@app/cli/commands'

const packageJson = require('../../package.json')

const program = new Command('cpf')

try {
  program
    .version(packageJson?.version || 'Not Defined')
    .addCommand(CreateCommand)

  program.parse(process.argv)
} catch (e) {
  handleErrors(e)
}
