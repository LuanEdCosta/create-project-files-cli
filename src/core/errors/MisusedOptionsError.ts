export interface MisusedOptionsErrorOptions<T = object> {
  message: string
  options: T
}

export class MisusedOptionsError<T = object> extends Error {
  readonly name: string
  readonly message: string
  readonly options: T

  constructor(options: MisusedOptionsErrorOptions<T>) {
    super()
    this.name = 'MisusedOptionsError'
    this.message = options.message
    this.options = options.options
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
