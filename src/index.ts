export {
  ResultTypes,
  CreateCommand,
  CreateCommandResult,
  ParsedNamesToReplace,
  ReplaceContentObject,
  CreateCommandOptions,
  CREATE_COMMAND_DEFAULT_OPTIONS,
  CreateCommandOptionsWithDefaults,
} from './core/commands'

export {
  SyntaxError,
  NotFoundError,
  AlreadyExistsError,
  SyntaxErrorOptions,
  MisusedOptionsError,
  MisusedOptionsErrorOptions,
} from './core/errors'

export { CreateCommand as default } from './core/commands'
