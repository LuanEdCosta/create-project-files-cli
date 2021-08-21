import { Command } from 'commander'

import { initCommandAction } from './InitCommandAction'

export const InitCommand = new Command('init')
  .description('Creates the default config file')
  .action(initCommandAction)
