import fs from 'fs'
import path from 'path'
import mockFs from 'mock-fs'

import { CreateCommand } from '../CreateCommand'
import { NotFoundError, SyntaxError } from '../../../errors'
import { CREATE_COMMAND_DEFAULT_OPTIONS } from '../Defaults'
import { CreateCommandResult, CreateCommandOptions } from '../Types'

describe('CreateCommand tests', () => {
  const testingFolder = '__testing__'
  const customTemplatesFolder = '__custom-templates__'
  const templatesFolder = CREATE_COMMAND_DEFAULT_OPTIONS.templatesFolder

  const getCreateCommandResult = (
    type: CreateCommandResult['type'],
    sourcePathSegment: string,
    destinationPathSegment: string,
    isFromCustomTemplatesFolder: boolean = false,
  ): CreateCommandResult => {
    const sourcePath = path.resolve(
      isFromCustomTemplatesFolder ? customTemplatesFolder : templatesFolder,
      sourcePathSegment,
    )

    return {
      type,
      sourcePath,
      destinationPath: path.resolve(testingFolder, destinationPathSegment),
    }
  }

  const readFromTestingFolder = (
    pathSegment: string,
    encoding: BufferEncoding = 'utf-8',
  ): string => {
    return fs.readFileSync(path.resolve(testingFolder, pathSegment), {
      encoding,
    })
  }

  const validateBase64 = (base64: string): boolean => {
    const regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    return regex.test(base64)
  }

  beforeEach(() => {
    mockFs({
      [templatesFolder]: {
        'text.txt': 'This is a file',
        'file_file.txt': 'This file is a file',
        '[file].txt': 'A file with brackets in the name',
        '[First]Of[Second].txt': '123456',
        '[folderName]': {
          '[fileName].txt': 'Replace the names',
        },
        '[component]': {
          '[component].component.jsx': '// React component',
          '[component].styles.css': '.component {}',
        },
        myFolder: {
          'myFile.txt': 'This is my file',
        },
        docs: {
          'info.txt': 'Some info',
          'testing.txt': 'File to test something',
        },
        empty: {},
      },
      [customTemplatesFolder]: {
        'file.txt': 'This is another file',
      },
      [testingFolder]: {},
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should have the correct attrs and methods', () => {
    const command = new CreateCommand('text.txt', testingFolder)
    expect(command).toHaveProperty('run')
    expect(command).toHaveProperty('source')
    expect(command).toHaveProperty('options')
    expect(command).toHaveProperty('destination')
  })

  it('should use the default options correctly', () => {
    const command = new CreateCommand('text.txt', testingFolder)
    expect(command.options).toEqual(CREATE_COMMAND_DEFAULT_OPTIONS)
  })

  it('should override the default options with new ones', () => {
    const newOptions: CreateCommandOptions = {
      brackets: false,
      encoding: 'base64',
      name: 'NewName.txt',
      replaceContent: ['text=something'],
      replaceNames: ['text=NewName'],
      templatesFolder: '__custom-templates__',
    }

    const command = new CreateCommand('text.txt', testingFolder, newOptions)
    expect(command.options).toEqual(newOptions)
  })

  it('should create a text.txt file', () => {
    const results = new CreateCommand('text.txt', testingFolder).run()
    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should create a docs folder', () => {
    const results = new CreateCommand('docs', testingFolder).run()
    expect(results).toHaveLength(3)
    expect(results).toEqual([
      getCreateCommandResult('folder', 'docs', 'docs'),
      getCreateCommandResult('file', 'docs/info.txt', 'docs/info.txt'),
      getCreateCommandResult('file', 'docs/testing.txt', 'docs/testing.txt'),
    ])
  })

  it('should create a text file with a custom name', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      name: 'customName.txt',
    }).run()

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'customName.txt'),
    ])
  })

  it('should create a folder with a custom name', () => {
    const results = new CreateCommand('docs', testingFolder, {
      name: 'folder',
    }).run()

    expect(results).toHaveLength(3)
    expect(results).toEqual([
      getCreateCommandResult('folder', 'docs', 'folder'),
      getCreateCommandResult('file', 'docs/info.txt', 'folder/info.txt'),
      getCreateCommandResult('file', 'docs/testing.txt', 'folder/testing.txt'),
    ])
  })

  it('should create a file from a custom template folder', () => {
    const results = new CreateCommand('file.txt', testingFolder, {
      templatesFolder: customTemplatesFolder,
    }).run()

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'file.txt', 'file.txt', true),
    ])
  })

  it('should create a text file with a custom encoding', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      encoding: 'base64',
    }).run()

    const fileContent = readFromTestingFolder('text.txt', 'base64')
    const isBase64Valid = validateBase64(fileContent)

    expect(isBase64Valid).toBe(true)
    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should create a folder with custom encoding', () => {
    const results = new CreateCommand('docs', testingFolder, {
      encoding: 'base64',
    }).run()

    const firstFileContent = readFromTestingFolder('docs/info.txt', 'base64')
    const isFirstFileBase64Valid = validateBase64(firstFileContent)
    expect(isFirstFileBase64Valid).toBe(true)

    const secondFileContent = readFromTestingFolder(
      'docs/testing.txt',
      'base64',
    )
    const isSecondFileBase64Valid = validateBase64(secondFileContent)
    expect(isSecondFileBase64Valid).toBe(true)

    expect(results).toHaveLength(3)
    expect(results).toEqual([
      getCreateCommandResult('folder', 'docs', 'docs'),
      getCreateCommandResult('file', 'docs/info.txt', 'docs/info.txt'),
      getCreateCommandResult('file', 'docs/testing.txt', 'docs/testing.txt'),
    ])
  })

  it('should replace the text inside brackets in the file name', () => {
    const results = new CreateCommand('[file].txt', testingFolder, {
      replaceNames: ['file=password'],
    }).run()

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', '[file].txt', 'password.txt'),
    ])
  })

  it('should replace multiple parts of the file name', () => {
    const results = new CreateCommand('[First]Of[Second].txt', testingFolder, {
      replaceNames: ['First=History', 'Second=Cats'],
    }).run()

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult(
        'file',
        '[First]Of[Second].txt',
        'HistoryOfCats.txt',
      ),
    ])
  })

  it('should replace a text in the file name without brackets', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['text=something'],
      brackets: false,
    }).run()

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'something.txt'),
    ])
  })

  it('should replace the text inside brackets in the folder name', () => {
    const results = new CreateCommand('[folderName]', testingFolder, {
      replaceNames: ['folderName=photos'],
    }).run()

    expect(results).toHaveLength(2)
    expect(results).toEqual([
      getCreateCommandResult('folder', '[folderName]', 'photos'),
      getCreateCommandResult(
        'file',
        '[folderName]/[fileName].txt',
        'photos/[fileName].txt',
      ),
    ])
  })

  it('should replace the text in a folder name without brackets', () => {
    const results = new CreateCommand('myFolder', testingFolder, {
      replaceNames: ['myFolder=math'],
      brackets: false,
    }).run()

    expect(results).toHaveLength(2)
    expect(results).toEqual([
      getCreateCommandResult('folder', 'myFolder', 'math'),
      getCreateCommandResult('file', 'myFolder/myFile.txt', 'math/myFile.txt'),
    ])
  })

  it('should replace the folder name and the name of its files', () => {
    const results = new CreateCommand('[component]', testingFolder, {
      replaceNames: ['component=Button'],
    }).run()

    expect(results).toHaveLength(3)
    expect(results).toEqual([
      getCreateCommandResult('folder', '[component]', 'Button'),
      getCreateCommandResult(
        'file',
        '[component]/[component].component.jsx',
        'Button/Button.component.jsx',
      ),
      getCreateCommandResult(
        'file',
        '[component]/[component].styles.css',
        'Button/Button.styles.css',
      ),
    ])
  })

  it('should replace a part of the content of a file', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['a file=not a simple text file'],
    }).run()

    const fileContent = readFromTestingFolder('text.txt')
    expect(fileContent).toBe('This is not a simple text file')

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should replace multiple parts of the content of a file', () => {
    const results = new CreateCommand('file_file.txt', testingFolder, {
      replaceContent: ['file=cat'],
    }).run()

    const fileContent = readFromTestingFolder('file_file.txt')
    expect(fileContent).toBe('This cat is a cat')

    expect(results).toHaveLength(1)
    expect(results).toEqual([
      getCreateCommandResult('file', 'file_file.txt', 'file_file.txt'),
    ])
  })

  it('should throw NotFoundError if do not find the templates folder', () => {
    const command = new CreateCommand('text.txt', testingFolder, {
      templatesFolder: 'NonExistingFolder',
    })
    expect(command.run.bind(command)).toThrowError(NotFoundError)
  })

  it('should throw NotFoundError if do not find the source', () => {
    const command = new CreateCommand('NotExistingFile.txt', testingFolder)
    expect(command.run.bind(command)).toThrowError(NotFoundError)
  })

  it('should throw SyntaxError if --replace-names is incorrectly formatted', () => {
    const firstCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['something'],
    })

    const secondCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['key='],
    })

    const thirdCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['=value'],
    })

    const fourthCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['key value'],
    })

    const fifthCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['key,value'],
    })

    const sixthCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: [''],
    })

    expect(firstCommand.run.bind(firstCommand)).toThrowError(SyntaxError)
    expect(secondCommand.run.bind(secondCommand)).toThrowError(SyntaxError)
    expect(thirdCommand.run.bind(thirdCommand)).toThrowError(SyntaxError)
    expect(fourthCommand.run.bind(fourthCommand)).toThrowError(SyntaxError)
    expect(fifthCommand.run.bind(fifthCommand)).toThrowError(SyntaxError)
    expect(sixthCommand.run.bind(sixthCommand)).toThrowError(SyntaxError)
  })

  it('should throw SyntaxError if --replace-content is incorrectly formatted', () => {
    const firstCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['something'],
    })

    const secondCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['key='],
    })

    const thirdCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['=value'],
    })

    const fourthCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['key value'],
    })

    const fifthCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['key,value'],
    })

    const sixthCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: [''],
    })

    expect(firstCommand.run.bind(firstCommand)).toThrowError(SyntaxError)
    expect(secondCommand.run.bind(secondCommand)).toThrowError(SyntaxError)
    expect(thirdCommand.run.bind(thirdCommand)).toThrowError(SyntaxError)
    expect(fourthCommand.run.bind(fourthCommand)).toThrowError(SyntaxError)
    expect(fifthCommand.run.bind(fifthCommand)).toThrowError(SyntaxError)
    expect(sixthCommand.run.bind(sixthCommand)).toThrowError(SyntaxError)
  })

  it('should throw NotFoundError if the source folder is empty', () => {
    const command = new CreateCommand('empty', testingFolder)
    expect(command.run.bind(command)).toThrowError(NotFoundError)
  })

  it('should throw Error if the source is not a file or folder', () => {
    fs.symlinkSync(
      path.resolve(templatesFolder, 'text.txt'),
      path.resolve(templatesFolder, 'symLink'),
      'file',
    )

    const command = new CreateCommand('symLink', testingFolder)
    expect(command.run.bind(command)).toThrowError(Error)
  })
})