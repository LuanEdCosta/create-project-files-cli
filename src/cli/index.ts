#!/usr/bin/env node

import { Command } from 'commander'

import { handleErrors } from '@app/cli/errors'
import { CreateCommand } from '@app/cli/commands'

const packageJson = require('../../package.json')

try {
  new Command('cpf')
    .version(packageJson?.version || 'Not Defined')
    .addCommand(CreateCommand)
    .parse(process.argv)
} catch (e) {
  handleErrors(e)
}
