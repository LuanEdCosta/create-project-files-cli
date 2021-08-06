import chalk from 'chalk'

import { handleErrors } from '../HandleErrors'
import {
  NotFoundError,
  SyntaxError,
  MisusedOptionsError,
} from '../../../core/errors'

describe('HandleErrors tests', () => {
  const log = console.log

  beforeEach(() => {
    console.log = jest.fn()
  })

  afterAll(() => {
    console.log = log
  })

  it('should log the Error message in the terminal', () => {
    const error = new Error('The error message')
    handleErrors(error)
    expect(console.log).toHaveBeenCalledWith(chalk.red(error.message))
  })

  it('should log the NotFoundError message in the terminal', () => {
    const notFoundError = new NotFoundError(
      'this/is/the/path',
      'The file or folder was not found',
    )
    handleErrors(notFoundError)
    expect(console.log).toHaveBeenCalledWith(chalk.red(notFoundError.message))
  })

  it('should log the SyntaxError message in the terminal', () => {
    const syntaxError = new SyntaxError({
      expected: '--something some=value',
      received: '--something =value',
      message: 'The --something option is incorrectly formatted',
    })
    handleErrors(syntaxError)
    expect(console.log).toHaveBeenNthCalledWith(
      1,
      chalk.red(syntaxError.message),
    )
    expect(console.log).toHaveBeenNthCalledWith(2)
    expect(console.log).toHaveBeenNthCalledWith(3, chalk.green('Expected:'))
    expect(console.log).toHaveBeenNthCalledWith(
      4,
      chalk.green(syntaxError.expected),
    )
    expect(console.log).toHaveBeenNthCalledWith(5)
    expect(console.log).toHaveBeenNthCalledWith(6, chalk.redBright('Received:'))
    expect(console.log).toHaveBeenNthCalledWith(
      7,
      chalk.redBright(syntaxError.received),
    )
  })

  it('should log the MisusedOptionsError message in the terminal', () => {
    const misusedOptionsError = new MisusedOptionsError({
      message:
        'The --something option cannot be used together with the --random option',
      options: {
        something: 'something',
        random: 'random',
      },
    })

    handleErrors(misusedOptionsError)
    expect(console.log).toHaveBeenCalledWith(
      chalk.red(misusedOptionsError.message),
    )
  })
})
