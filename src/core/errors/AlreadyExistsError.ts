export class AlreadyExistsError extends Error {
  readonly name: string
  readonly path: string
  readonly message: string

  constructor(path: string, message: string) {
    super()
    this.name = 'AlreadyExistsError'
    this.path = path
    this.message = message
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
