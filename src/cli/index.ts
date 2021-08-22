#!/usr/bin/env node

import { Command } from 'commander'

import { handleErrors } from './errors'
import { CreateCommand, InitCommand, RunCommand } from './commands'

const packageJson = require('../../package.json')

try {
  new Command('cpf')
    .version(packageJson?.version || 'Not Defined')
    .addCommand(CreateCommand)
    .addCommand(InitCommand)
    .addCommand(RunCommand)
    .parse(process.argv)
} catch (e) {
  handleErrors(e)
}
