export interface ConfigFileCreationSteps {
  sourcePath?: string
  destinationPath?: string
  templatesPath?: string
  name?: string
  encoding?: BufferEncoding
  brackets?: boolean
  replaceNames?: { [key: string]: string }
  replaceContent?: { [key: string]: string }
}

export interface ConfigFileCommand {
  templatesPath?: string
  params?: { [key: string]: string }
  create?: ConfigFileCreationSteps[]
}

export interface ConfigFile {
  defaults?: {
    templatesPath?: string
  }
  commands?: {
    [key: string]: ConfigFileCommand
  }
}
