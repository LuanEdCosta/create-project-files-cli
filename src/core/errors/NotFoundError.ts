export class NotFoundError extends Error {
  readonly path: string
  readonly message: string

  constructor(path: string, message: string) {
    super()
    this.path = path
    this.message = message
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
