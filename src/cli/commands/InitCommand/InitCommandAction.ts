import { InitCommand } from '../../../core/commands'

export const initCommandAction = () => {
  new InitCommand().run()
}
