import fs from 'fs'
import path from 'path'

import { ConfigFile, ConfigFileCommand } from './Types'

import { NotFoundError } from '../../errors'
import { replaceTextPieces } from '../../utils/TextUtils'
import { CreateCommand, CREATE_COMMAND_DEFAULT_OPTIONS } from '../CreateCommand'

export class RunCommand {
  private _commandName: string
  private _params: string[]

  private _configFile?: ConfigFile
  private _command: ConfigFileCommand = {}
  private _parsedParams: { [key: string]: string } = {}
  private _commandWithParams: ConfigFileCommand = {}

  public get params(): string[] {
    return this._params
  }

  public set params(params: string[]) {
    this._params = params || []
  }

  public get command(): string {
    return this._commandName
  }

  public set command(commandName: string) {
    this._commandName = commandName
  }

  constructor(commandName: string, params: string[] = []) {
    this._commandName = commandName
    this._params = params
  }

  private _getConfigFilePath(): string {
    return path.resolve(process.cwd(), 'cpf.config.json')
  }

  private _throwConfigFileNotFound() {
    const configFilePath = this._getConfigFilePath()
    const wasConfigFileFound = fs.existsSync(configFilePath)
    if (wasConfigFileFound) return
    throw new NotFoundError(configFilePath, 'The config file was not found')
  }

  private _readConfigFile() {
    const configFilePath = this._getConfigFilePath()
    const configFileData = fs.readFileSync(configFilePath, {
      encoding: 'utf-8',
    })

    try {
      this._configFile = JSON.parse(configFileData)
    } catch (e) {
      throw new Error(
        'Cannot parse the config file. Make sure it contains a valid JSON',
      )
    }
  }

  private _throwCommandNotFound() {
    const commandData = this._configFile?.commands?.[this._commandName]
    if (commandData) return
    throw new Error('The specified command was not found in the config file')
  }

  private _setCommandData() {
    if (this._configFile?.commands) {
      this._command = this._configFile.commands[this._commandName]
    }
  }

  private _throwMissingParams() {
    const commandParams = this._command.params || {}
    const commandParamsLength = Object.keys(commandParams).length
    const isMissingParams = commandParamsLength !== this._params.length
    if (isMissingParams) throw new Error('Some params are missing')
  }

  private _parseParams() {
    const commandParams = this._command.params || {}
    const commandParamsKeys = Object.keys(commandParams)
    commandParamsKeys.forEach((paramKey, index) => {
      const paramKeyWithCurlyBraces = `{${paramKey}}`
      this._parsedParams[paramKeyWithCurlyBraces] = this._params[index]
    })
  }

  private _useParamsValues() {
    this._commandWithParams = this._command

    const haveNoParsedParams = Object.keys(this._parsedParams).length === 0
    if (haveNoParsedParams) return

    const commandJsonWithParams = replaceTextPieces(
      JSON.stringify(this._command),
      this._parsedParams,
    )

    try {
      this._commandWithParams = JSON.parse(commandJsonWithParams)
    } catch (e) {
      throw new Error('An error ocurred when trying to parse the given params.')
    }
  }

  private _createFilesAndFolders() {
    if (this._commandWithParams.create) {
      const mapKeyValue = ([key, value]: [string, string]) => {
        return [
          key,
          CREATE_COMMAND_DEFAULT_OPTIONS.keyValueSeparator,
          value,
        ].join('')
      }

      this._commandWithParams.create.forEach(
        ({
          name,
          brackets,
          encoding,
          replaceNames,
          replaceContent,
          sourcePath = '',
          destinationPath = '',
          templatesPath,
        }) => {
          const replaceContentEntries = replaceContent
            ? Object.entries(replaceContent)
            : undefined

          const replaceNamesEntries = replaceNames
            ? Object.entries(replaceNames)
            : undefined

          const replaceNamesMapped = replaceNamesEntries?.map(mapKeyValue)
          const replaceContentMapped = replaceContentEntries?.map(mapKeyValue)

          const templatesFolder =
            templatesPath ||
            this._commandWithParams.templatesPath ||
            this._configFile?.defaults?.templatesPath ||
            undefined

          const createCommand = new CreateCommand(sourcePath, destinationPath, {
            name,
            encoding,
            brackets,
            templatesFolder,
            replaceNames: replaceNamesMapped,
            replaceContent: replaceContentMapped,
          })

          createCommand.run()
        },
      )
    }
  }

  public run() {
    this._throwConfigFileNotFound()
    this._readConfigFile()
    this._throwCommandNotFound()
    this._setCommandData()
    this._throwMissingParams()
    this._parseParams()
    this._useParamsValues()
    this._createFilesAndFolders()
  }
}
