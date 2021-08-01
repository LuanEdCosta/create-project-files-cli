export interface SyntaxErrorOptions {
  message: string
  received: string
  expected: string
}

export class SyntaxError extends Error {
  readonly name: string
  readonly message: string
  readonly received: string
  readonly expected: string

  constructor(options: SyntaxErrorOptions) {
    super()
    this.name = 'SyntaxError'
    this.message = options.message
    this.expected = options.expected
    this.received = options.received
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
