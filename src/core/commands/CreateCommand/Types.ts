export interface CreateCommandOptions {
  name?: string
  templatesFolder?: string
  encoding?: BufferEncoding
  replaceNames?: string[]
  replaceContent?: string[]
  brackets?: boolean
  keyValueSeparator?: string
}

export interface CreateCommandOptionsWithDefaults extends CreateCommandOptions {
  name: string
  templatesFolder: string
  encoding: BufferEncoding
  brackets: boolean
  keyValueSeparator: string
}

export interface ParsedNamesToReplace {
  key: string
  name: string
}

export interface ReplaceContentObject {
  [key: string]: string
}

export type ResultTypes = 'file' | 'folder'

export interface CreateCommandResult {
  sourcePath: string
  destinationPath: string
  type: ResultTypes
}
