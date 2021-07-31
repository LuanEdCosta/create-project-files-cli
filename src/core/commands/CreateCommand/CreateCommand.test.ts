import path from 'path'
import mockFs from 'mock-fs'

import { CreateCommand } from './CreateCommand'
import { CreateCommandResult } from './Types'

describe('CreateCommand tests', () => {
  const testingFolder = '__testing-folder__'
  const templatesFolder = '__file-templates__'

  beforeEach(() => {
    mockFs({
      [templatesFolder]: {
        'text.txt': 'This is a file',
        '/empty': {},
      },
      [testingFolder]: {},
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should create a text.txt file', () => {
    const results = new CreateCommand('text.txt', testingFolder).run()
    const expectedResults: CreateCommandResult[] = [
      {
        sourcePath: path.resolve(`${templatesFolder}/text.txt`),
        destinationPath: path.resolve(`${testingFolder}/text.txt`),
        type: 'file',
      },
    ]

    expect(results).toHaveLength(1)
    expect(results).toEqual(expectedResults)
  })
})
