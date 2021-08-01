import chalk from 'chalk'

import { logResultsInTerminal } from '../LogResultsInTerminal'

describe('CreateCommandAction tests', () => {
  const log = console.log

  beforeEach(() => {
    console.log = jest.fn()
  })

  afterAll(() => {
    console.log = log
  })

  it('should log the create command results correctly', () => {
    logResultsInTerminal([
      {
        type: 'file',
        sourcePath: 'the/first/source',
        destinationPath: 'the/first/destination',
      },
      {
        type: 'folder',
        sourcePath: 'the/second/source',
        destinationPath: 'the/second/destination',
      },
    ])

    expect(console.log).toHaveBeenNthCalledWith(
      1,
      chalk.green('File created at the/first/destination'),
    )

    expect(console.log).toHaveBeenNthCalledWith(
      2,
      chalk.green('Folder created at the/second/destination'),
    )
  })
})
