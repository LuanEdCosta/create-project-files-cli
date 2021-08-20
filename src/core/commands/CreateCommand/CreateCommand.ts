import fs from 'fs'
import path from 'path'

import {
  CreateCommandOptionsWithDefaults,
  CreateCommandOptions,
  ParsedNamesToReplace,
  ReplaceContentObject,
  CreateCommandResult,
} from './Types'

import { TextUtils } from '../../utils'
import { CREATE_COMMAND_DEFAULT_OPTIONS } from './Defaults'
import {
  NotFoundError,
  SyntaxError,
  MisusedOptionsError,
  AlreadyExistsError,
} from '../../errors'

export class CreateCommand {
  private _source: string
  private _destination: string
  private _options: CreateCommandOptionsWithDefaults
  private _createCommandResults: CreateCommandResult[]

  public get source() {
    return this._source
  }

  public set source(source: string) {
    this._source = source
  }

  public get destination() {
    return this._destination
  }

  public set destination(destination: string) {
    this._destination = destination
  }

  public get options() {
    return this._options
  }

  public changeOptions(options: CreateCommandOptions) {
    if (options) this._options = { ...this._options, ...options }
  }

  public resetOptions() {
    this._options = CREATE_COMMAND_DEFAULT_OPTIONS
  }

  constructor(
    source: string,
    destination: string,
    options: CreateCommandOptions = CREATE_COMMAND_DEFAULT_OPTIONS,
  ) {
    this._source = source
    this._destination = destination
    this._options = { ...CREATE_COMMAND_DEFAULT_OPTIONS, ...options }
    this._createCommandResults = []
  }

  private _addCreateCommandResult(createCommandResult: CreateCommandResult) {
    this._createCommandResults.push(createCommandResult)
  }

  private _clearCreateCommandResults() {
    this._createCommandResults = []
  }

  private _getTemplatesFolderPath(): string {
    return path.resolve(process.cwd(), this._options.templatesFolder)
  }

  private _getSourcePath(templatesFolderPath: string): string {
    return path.resolve(templatesFolderPath, this._source)
  }

  private _throwTemplatesFolderNotFound(templatesFolderPath: string): void {
    if (!fs.existsSync(templatesFolderPath)) {
      throw new NotFoundError(
        templatesFolderPath,
        `The ${templatesFolderPath} folder does not exist`,
      )
    }
  }

  private _throwSourcePathNotFound(sourcePath: string): void {
    if (!fs.existsSync(sourcePath)) {
      throw new NotFoundError(sourcePath, `${sourcePath} not found`)
    }
  }

  private _getSourceType(sourcePath: string): {
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

  private _getParsedNamesToReplace(): ParsedNamesToReplace[] | undefined {
    return this._options.replaceNames?.map?.((keyAndName) => {
      const [key, name] = keyAndName.split(this._options.keyValueSeparator)
      return { key, name }
    })
  }

  private _throwNamesToReplaceIncorrectlyFormatted(
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ) {
    if (!parsedNamesToReplace || !this._options.replaceNames) return

    const isReplaceNamesOptionIncorrectly = parsedNamesToReplace.some(
      ({ key, name }) => !key || !name,
    )

    if (isReplaceNamesOptionIncorrectly) {
      const separator = this._options.keyValueSeparator
      throw new SyntaxError({
        message: 'The --replace-names (-rn) option is incorrectly formatted',
        expected: `key1${separator}name1 key2${separator}name2`,
        received: this._options.replaceNames.join(' '),
      })
    }
  }

  private _getReplaceContentObject(): ReplaceContentObject {
    const replaceContentObject: { [key: string]: string } = {}
    this._options.replaceContent?.forEach?.((keyAndText) => {
      const [key, text] = keyAndText.split(this._options.keyValueSeparator)
      replaceContentObject[key] = text
    })
    return replaceContentObject
  }

  private _throwReplaceContentOptionIncorrectlyFormatted(
    replaceContentObject: ReplaceContentObject,
  ) {
    const isReplaceContentOptionIncorrectly = Object.entries(
      replaceContentObject,
    ).some(([key, text]) => !key || !text)

    if (this._options.replaceContent && isReplaceContentOptionIncorrectly) {
      const separator = this._options.keyValueSeparator
      throw new SyntaxError({
        message: 'The --replace-content (-rc) option is incorrectly formatted',
        expected: `key1${separator}text1 key2${separator}text2`,
        received: this._options.replaceContent.join(' '),
      })
    }
  }

  private _throwEmptySourceFolder(sourcePath: string) {
    if (fs.readdirSync(sourcePath).length === 0) {
      throw new NotFoundError(sourcePath, `No files found at ${sourcePath}`)
    }
  }

  private _getPathLastPart(path: string): string {
    const pathParts = path.split('/')
    return pathParts[pathParts.length - 1]
  }

  private _getReplacedName(
    name: string,
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ): string {
    let replacedName = name
    if (parsedNamesToReplace) {
      parsedNamesToReplace.forEach(({ key, name }) => {
        const keyToUse = this._options.brackets ? `[${key}]` : key
        if (replacedName.includes(keyToUse)) {
          replacedName = replacedName.replace(keyToUse, name)
        }
      })
    }
    return replacedName
  }

  private _getSourceName(
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ): string {
    const defaultName = this._getPathLastPart(this._source)
    const replacedName = this._getReplacedName(
      defaultName,
      parsedNamesToReplace,
    )
    return this._options.name || replacedName
  }

  private _getDestinationPath(
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
  ): string {
    const folderName = this._getSourceName(parsedNamesToReplace)
    return path.resolve(process.cwd(), this._destination, folderName)
  }

  private _getFileContent(
    filePath: string,
    replaceContentObject: ReplaceContentObject,
    canReplaceContent: boolean,
  ): string {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const newFileContent = canReplaceContent
      ? TextUtils.replaceTextPieces(fileContent, replaceContentObject)
      : fileContent
    return Buffer.from(newFileContent).toString(this._options.encoding)
  }

  private _throwMisusedOptionsError() {
    const hasNameOption = !!this._options.name
    const hasReplaceNamesOption = !!this._options.replaceNames
    if (hasNameOption && hasReplaceNamesOption) {
      throw new MisusedOptionsError({
        message:
          'The --name (-n) option cannot be used together with the --replace-names (-rn) option to prevent unexpected results',
        options: {
          name: this._options.name,
          replaceNames: this._options.replaceNames,
        },
      })
    }
  }

  private _createFolderRecursively(
    sourcePath: string,
    destinationPath: string,
    replaceContentObject: ReplaceContentObject,
    parsedNamesToReplace: ParsedNamesToReplace[] | undefined,
    canReplaceContent: boolean,
  ) {
    const folderContentItems = fs.readdirSync(sourcePath)

    folderContentItems.forEach((itemName) => {
      const itemPath = path.resolve(sourcePath, itemName)

      const itemStatus = fs.lstatSync(itemPath)
      const isFolderItemDirectory = itemStatus.isDirectory()
      const isFolderItemFile = itemStatus.isFile()

      const replacedName = this._getReplacedName(itemName, parsedNamesToReplace)

      if (isFolderItemFile) {
        const fileContent = this._getFileContent(
          itemPath,
          replaceContentObject,
          canReplaceContent,
        )

        const fileDestinationPath = path.resolve(destinationPath, replacedName)

        fs.writeFileSync(fileDestinationPath, fileContent)

        this._addCreateCommandResult({
          type: 'file',
          sourcePath: itemPath,
          destinationPath: fileDestinationPath,
        })
      } else if (isFolderItemDirectory) {
        const nestedFolderPath = path.resolve(destinationPath, replacedName)

        fs.mkdirSync(nestedFolderPath)

        this._addCreateCommandResult({
          type: 'folder',
          sourcePath: itemPath,
          destinationPath: nestedFolderPath,
        })

        this._createFolderRecursively(
          itemPath,
          nestedFolderPath,
          replaceContentObject,
          parsedNamesToReplace,
          canReplaceContent,
        )
      }

      // * Ignore if is not a file or directory
    })
  }

  private _throwAlreadyExistsOnDestination(destinationPath: string) {
    const alreadyExists = fs.existsSync(destinationPath)
    if (alreadyExists) {
      throw new AlreadyExistsError(
        destinationPath,
        `Cannot create ${destinationPath} because it already exists`,
      )
    }
  }

  public run(): CreateCommandResult[] {
    this._throwMisusedOptionsError()
    this._clearCreateCommandResults()

    const templatesFolderPath = this._getTemplatesFolderPath()
    this._throwTemplatesFolderNotFound(templatesFolderPath)

    const sourcePath = this._getSourcePath(templatesFolderPath)
    this._throwSourcePathNotFound(sourcePath)

    const parsedNamesToReplace = this._getParsedNamesToReplace()
    this._throwNamesToReplaceIncorrectlyFormatted(parsedNamesToReplace)

    const replaceContentObject = this._getReplaceContentObject()
    this._throwReplaceContentOptionIncorrectlyFormatted(replaceContentObject)
    const canReplaceContent = Object.keys(replaceContentObject).length > 0

    const destinationPath = this._getDestinationPath(parsedNamesToReplace)
    this._throwAlreadyExistsOnDestination(destinationPath)

    const sourceType = this._getSourceType(sourcePath)

    if (sourceType.isDirectory) {
      this._throwEmptySourceFolder(sourcePath)

      fs.mkdirSync(destinationPath)

      this._addCreateCommandResult({
        sourcePath,
        destinationPath,
        type: 'folder',
      })

      this._createFolderRecursively(
        sourcePath,
        destinationPath,
        replaceContentObject,
        parsedNamesToReplace,
        canReplaceContent,
      )

      return this._createCommandResults
    } else if (sourceType.isFile) {
      const fileContent = this._getFileContent(
        sourcePath,
        replaceContentObject,
        canReplaceContent,
      )

      fs.writeFileSync(destinationPath, fileContent)

      this._addCreateCommandResult({
        sourcePath,
        destinationPath,
        type: 'file',
      })

      return this._createCommandResults
    }

    throw new Error('The source can only be a file or a folder')
  }
}
