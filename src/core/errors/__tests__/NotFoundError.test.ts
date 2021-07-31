import { NotFoundError } from '../NotFoundError'

describe('NotFoundError tests', () => {
  const path = 'path/to/the/folder'
  const message = 'The folder was not found'

  it('should has the correct structure', () => {
    const notFoundError = new NotFoundError(path, message)
    expect(notFoundError.path).toBe(path)
    expect(notFoundError.message).toBe(message)
    expect(notFoundError.name).toBe('NotFoundError')
  })

  it('should throws the message', () => {
    const throwNotFoundError = () => {
      throw new NotFoundError(path, message)
    }
    expect(throwNotFoundError).toThrow(message)
  })
})
