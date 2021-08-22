import { Command } from 'commander'

import { runCommandAction } from './RunCommandAction'

export const RunCommand = new Command('run')
  .argument(
    '<commandName>',
    'The command name you want to run. The command must be defined in the config file',
  )
  .argument(
    '[params...]',
    'All params defined for the command in the config file',
  )
  .description('Run a command defined in the config file')
  .action(runCommandAction)
