import { MisusedOptionsError } from '../MisusedOptionsError'

describe('MisusedOptionsError tests', () => {
  const message =
    'The --something option cannot be used together with the --random option'

  const options = {
    something: 'something',
    random: 'random',
  }

  it('should has the correct structure', () => {
    const misusedOptionsError = new MisusedOptionsError({ message, options })
    expect(misusedOptionsError.message).toBe(message)
    expect(misusedOptionsError.options).toEqual(options)
    expect(misusedOptionsError.name).toBe('MisusedOptionsError')
  })

  it('should throws the message', () => {
    const throwMisusedOptionsError = () => {
      throw new MisusedOptionsError({ message, options })
    }
    expect(throwMisusedOptionsError).toThrow(message)
  })
})
