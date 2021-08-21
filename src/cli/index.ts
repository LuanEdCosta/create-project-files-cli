#!/usr/bin/env node

import { Command } from 'commander'

import { handleErrors } from './errors'
import { CreateCommand, InitCommand } from './commands'

const packageJson = require('../../package.json')

try {
  new Command('cpf')
    .version(packageJson?.version || 'Not Defined')
    .addCommand(InitCommand)
    .addCommand(CreateCommand)
    .parse(process.argv)
} catch (e) {
  handleErrors(e)
}
