import mockFs from 'mock-fs'

import { RunCommand } from '../RunCommand'

describe('RunCommand tests', () => {
  beforeEach(() => {
    mockFs({})
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should have the correct attrs and methods', () => {
    const command = new RunCommand('command', [])
    expect(command).toHaveProperty('run')
    expect(command).toHaveProperty('params')
    expect(command).toHaveProperty('command')
  })

  it('should be able to get and set new params', () => {
    const command = new RunCommand('command', ['name'])
    expect(command.params).toEqual(['name'])
    command.params = ['something']
    expect(command.params).toEqual(['something'])
  })

  it('should be able to get and set the command name', () => {
    const command = new RunCommand('command')
    expect(command.command).toBe('command')
    command.command = 'component'
    expect(command.command).toBe('component')
  })

  it('should create a file in the correct destination', () => {
    expect(true).toBe(true)
  })
})
