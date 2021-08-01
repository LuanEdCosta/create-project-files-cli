import { SyntaxError } from '../SyntaxError'

describe('SyntaxError tests', () => {
  const expected = '--something key=value'
  const received = '--something key value'
  const message = 'The --something option is incorrectly formatted'

  it('should has the correct structure', () => {
    const syntaxError = new SyntaxError({ expected, received, message })
    expect(syntaxError.expected).toBe(expected)
    expect(syntaxError.received).toBe(received)
    expect(syntaxError.message).toBe(message)
    expect(syntaxError.name).toBe('SyntaxError')
  })

  it('should throws the message', () => {
    const throwSyntaxError = () => {
      throw new SyntaxError({ expected, received, message })
    }
    expect(throwSyntaxError).toThrow(message)
  })
})
