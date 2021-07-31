export interface CreateCommandOptions {
  name: string
  templatesFolder: string
  encoding: BufferEncoding
  replaceNames?: string[]
  replaceContent?: string[]
  brackets: boolean
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
