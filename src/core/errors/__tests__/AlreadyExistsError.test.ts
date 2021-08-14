import { AlreadyExistsError } from '../AlreadyExistsError'

describe('AlreadyExistsError tests', () => {
  const path = 'path/to/the/folder'
  const message = 'Cannot create src/text.txt because it already exists'

  it('should have the correct structure', () => {
    const alreadyExistsError = new AlreadyExistsError(path, message)
    expect(alreadyExistsError.path).toBe(path)
    expect(alreadyExistsError.message).toBe(message)
    expect(alreadyExistsError.name).toBe('AlreadyExistsError')
  })

  it('should throw the message', () => {
    const throwAlreadyExistsError = () => {
      throw new AlreadyExistsError(path, message)
    }
    expect(throwAlreadyExistsError).toThrow(message)
  })
})
