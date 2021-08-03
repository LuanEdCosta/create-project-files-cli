import {
  CreateCommand,
  CreateCommandOptionsWithDefaults,
} from '../../../core/commands'

import { logResultsInTerminal } from './LogResultsInTerminal'

export const createCommandAction = (
  source: string,
  destination: string,
  options: CreateCommandOptionsWithDefaults,
) => {
  const results = new CreateCommand(source, destination, options).run()
  logResultsInTerminal(results)
}
