import { RunCommand } from '../../../core/commands'

export const runCommandAction = (commandName: string, params: string[]) => {
  new RunCommand(commandName, params).run()
}
