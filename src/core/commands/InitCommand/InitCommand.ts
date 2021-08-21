import fs from 'fs'
import path from 'path'

import { AlreadyExistsError } from '../../errors'
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_FILE_DATA } from './Defaults'

export class InitCommand {
  private _getConfigFilePath(): string {
    return path.resolve(process.cwd(), DEFAULT_CONFIG_FILE_NAME)
  }

  private _throwAlreadyExistsConfigFile() {
    if (fs.existsSync(DEFAULT_CONFIG_FILE_NAME)) {
      throw new AlreadyExistsError(
        this._getConfigFilePath(),
        'The config file already exists',
      )
    }
  }

  private _createConfigFile() {
    fs.writeFileSync(
      this._getConfigFilePath(),
      JSON.stringify(DEFAULT_CONFIG_FILE_DATA, undefined, 2),
    )
  }

  public run(): void | never {
    this._throwAlreadyExistsConfigFile()
    this._createConfigFile()
  }
}
