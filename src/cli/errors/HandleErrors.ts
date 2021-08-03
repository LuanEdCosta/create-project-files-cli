import chalk from 'chalk'

import { NotFoundError, SyntaxError } from '../../core/errors'

export const handleErrors = (error: Error) => {
  if (error instanceof SyntaxError) {
    const syntaxError = error as SyntaxError
    console.log(chalk.red(syntaxError.message))

    console.log()
    console.log(chalk.green('Expected:'))
    console.log(chalk.green(syntaxError.expected))

    console.log()
    console.log(chalk.redBright('Received:'))
    console.log(chalk.redBright(syntaxError.received))
  } else if (error instanceof NotFoundError) {
    const notFoundError = error as NotFoundError
    console.log(chalk.red(notFoundError.message))
  } else {
    console.log(chalk.red(error.message))
  }
}
