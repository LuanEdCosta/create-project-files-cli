import fs from 'fs'
import path from 'path'

import { TextUtils } from '@app/core/utils'
import { NotFoundError, SyntaxError } from '@app/core/errors'

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

export class CreateCommand {
  readonly options: CreateCommandOptions
  readonly source: string
  readonly destination: string

  public getDefaultOptions(): CreateCommandOptions {
    return {
      name: '',
      templatesFolder: '__file-templates__',
      encoding: 'utf-8',
      replaceNames: undefined,
      replaceContent: undefined,
      brackets: true,
    }
  }

  constructor(
    source: string,
    destination: string,
    options?: CreateCommandOptions,
  ) {
    this.source = source
    this.destination = destination
    this.options = options || this.getDefaultOptions()
  }

  private getTemplatesFolderPath(): string {
    return path.resolve(process.cwd(), this.options.templatesFolder)
  }

  private getSourcePath(templatesFolderPath: string): string {
    return path.resolve(templatesFolderPath, this.source)
  }

  private throwTemplatesFolderNotFound(templatesFolderPath: string): void {
    if (!fs.existsSync(templatesFolderPath)) {
      throw new NotFoundError(
        templatesFolderPath,
        `The ${templatesFolderPath} folder does not exist`,
      )
    }
  }

  private throwSourcePathNotFound(sourcePath: string): void {
    if (!fs.existsSync(sourcePath)) {
      throw new NotFoundError(sourcePath, `${sourcePath} not found`)
    }
  }

  private getSourceType(sourcePath: string): {
    isDirectory: boolean
    isFile: boolean
  } {
    const fsStatus = fs.lstatSync(sourcePath)
    const isDirectory = fsStatus.isDirectory()
    const isFile = fsStatus.isFile()
    return {
      isDirectory,
      isFile,
    }
  }

  private getParsedNamesToReplace(): ParsedNamesToReplace[] | undefined {
    return this.options.replaceNames?.map((keyAndName) => {
      const [key, name] = keyAndName.split('=')
      return { key, name }
    })
  }

  private throwNamesToReplaceIncorrectlyFormatted(
    parsedNamesToReplace: ParsedNamesToReplace[],
  ) {
    const isReplaceNamesOptionIncorrectly = parsedNamesToReplace?.some(
      ({ key, name: value }) => !key || !value,
    )
    if (isReplaceNamesOptionIncorrectly) {
      throw new SyntaxError({
        message: 'The --replace-names (-rn) option is incorrectly formatted',
        expected: 'key1=name1 key2=name2',
        received: `${this.options.replaceNames}`,
      })
    }
  }

  private getReplaceContentObject(): ReplaceContentObject {
    const replaceContentObject: { [key: string]: string } = {}
    this.options.replaceContent?.forEach((keyAndText) => {
      const [key, text] = keyAndText.split('=')
      replaceContentObject[key] = text
    })
    return replaceContentObject
  }

  private throwReplaceContentOptionIncorrectlyFormatted(
    replaceContentObject: ReplaceContentObject,
  ) {
    const isReplaceContentOptionIncorrectly = Object.entries(
      replaceContentObject,
    ).some(([key, text]) => !key || !text)
    if (isReplaceContentOptionIncorrectly) {
      throw new SyntaxError({
        message: 'The --replace-content (-rc) option is incorrectly formatted',
        expected: 'key1=text1 key2=text2',
        received: `${this.options.replaceContent}`,
      })
    }
  }

  private throwEmptySourceFolder(
    sourcePath: string,
    folderFileNames: string[],
  ) {
    if (folderFileNames.length === 0) {
      throw new NotFoundError(sourcePath, `No files found at ${sourcePath}`)
    }
  }

  private getPathLastPart(path: string): string {
    const pathParts = path.split('/')
    return pathParts[pathParts.length - 1]
  }

  private getReplacedName(
    name: string,
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ): string {
    let replacedName = name
    if (parsedNamesToReplace) {
      parsedNamesToReplace.forEach(({ key, name }) => {
        const keyToUse = this.options.brackets ? `[${key}]` : key
        if (replacedName.includes(keyToUse)) {
          replacedName = replacedName.replace(keyToUse, name)
        }
      })
    }
    return replacedName
  }

  private getSourceName(
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ): string {
    const defaultName = this.getPathLastPart(this.source)
    const replacedName = this.getReplacedName(defaultName, parsedNamesToReplace)
    return this.options.name || replacedName
  }

  private getDestinationPath(
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ): string {
    const folderName = this.getSourceName(parsedNamesToReplace)
    return path.resolve(process.cwd(), this.destination, folderName)
  }

  private getFileContent(
    filePath: string,
    replaceContentObject: ReplaceContentObject,
    canReplaceContent: boolean,
  ): string {
    const fileContent = fs.readFileSync(filePath, this.options.encoding)
    return canReplaceContent
      ? TextUtils.replaceTextPieces(fileContent, replaceContentObject)
      : fileContent
  }

  public run(): CreateCommandResult[] {
    const templatesFolderPath = this.getTemplatesFolderPath()
    this.throwTemplatesFolderNotFound(templatesFolderPath)

    const sourcePath = this.getSourcePath(templatesFolderPath)
    this.throwSourcePathNotFound(sourcePath)

    const parsedNamesToReplace = this.getParsedNamesToReplace()
    this.throwNamesToReplaceIncorrectlyFormatted(parsedNamesToReplace || [])

    const replaceContentObject = this.getReplaceContentObject()
    this.throwReplaceContentOptionIncorrectlyFormatted(replaceContentObject)
    const canReplaceContent = Object.keys(replaceContentObject).length > 0

    const sourceType = this.getSourceType(sourcePath)

    if (sourceType.isDirectory) {
      const folderFileNames = fs.readdirSync(sourcePath)
      this.throwEmptySourceFolder(sourcePath, folderFileNames)

      const destinationPath = this.getDestinationPath(parsedNamesToReplace)
      fs.mkdirSync(destinationPath)

      const createCommandResults: CreateCommandResult[] = []

      createCommandResults.push({
        sourcePath,
        destinationPath,
        type: 'folder',
      })

      folderFileNames.forEach((fileName) => {
        const filePath = path.resolve(sourcePath, fileName)

        const fileContent = this.getFileContent(
          filePath,
          replaceContentObject,
          canReplaceContent,
        )

        const replacedFileName = this.getReplacedName(
          fileName,
          parsedNamesToReplace,
        )

        const fileDestinationPath = path.resolve(
          process.cwd(),
          destinationPath,
          replacedFileName,
        )

        fs.writeFileSync(fileDestinationPath, fileContent)

        createCommandResults.push({
          type: 'file',
          sourcePath: filePath,
          destinationPath: fileDestinationPath,
        })
      })

      return createCommandResults
    } else if (sourceType.isFile) {
      const destinationPath = this.getDestinationPath(parsedNamesToReplace)

      const fileContent = this.getFileContent(
        sourcePath,
        replaceContentObject,
        canReplaceContent,
      )

      fs.writeFileSync(destinationPath, fileContent)

      return [
        {
          sourcePath,
          destinationPath,
          type: 'file',
        },
      ]
    }

    return []
  }
}
