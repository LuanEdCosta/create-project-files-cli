import fs from 'fs'
import path from 'path'
import mockFs from 'mock-fs'

import { InitCommand } from '../InitCommand'
import { AlreadyExistsError } from '../../../errors'
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_FILE_DATA } from '../Defaults'

describe('InitCommand tests', () => {
  beforeEach(() => {
    mockFs({})
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should have the correct attrs and methods', () => {
    const command = new InitCommand()
    expect(command).toHaveProperty('run')
  })

  it('should create the config file in the root directory', () => {
    new InitCommand().run()
    const configFilePath = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME)
    const configFileExists = fs.existsSync(configFilePath)
    const configFileContent = fs.readFileSync(configFilePath, {
      encoding: 'utf-8',
    })
    expect(configFileExists).toBe(true)
    expect(JSON.parse(configFileContent)).toEqual(DEFAULT_CONFIG_FILE_DATA)
  })

  it('should throw AlreadyExistsError if the file already exists', () => {
    const command = new InitCommand()
    command.run() // Create the config file
    expect(command.run.bind(command)).toThrowError(AlreadyExistsError)
  })
})
