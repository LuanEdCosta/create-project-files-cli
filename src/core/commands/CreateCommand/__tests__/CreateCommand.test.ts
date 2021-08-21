import fs from 'fs'
import path from 'path'
import mockFs from 'mock-fs'

import { CreateCommand } from '../CreateCommand'
import { CreateCommandResult, CreateCommandOptions } from '../Types'
import { CREATE_COMMAND_DEFAULT_OPTIONS, TIMESTAMP_KEY } from '../Defaults'
import {
  SyntaxError,
  NotFoundError,
  AlreadyExistsError,
  MisusedOptionsError,
} from '../../../errors'

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

  const readFromTemplatesFolder = (
    pathSegment: string,
    encoding: BufferEncoding = 'utf-8',
  ): string => {
    return fs.readFileSync(path.resolve(templatesFolder, pathSegment), {
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
        '[({.+^$})].txt': '[({.+^$})]',
        [`file-${TIMESTAMP_KEY}.txt`]: 'This file has a timestamp in the name',
        [`${TIMESTAMP_KEY}-${TIMESTAMP_KEY}.txt`]: 'Multiple timestamps',
        'folder_[({.+^$})]': {
          'file.txt': '[({.+^$})]',
        },
        '[({.+^$})]': {
          '[({.+^$})].txt': '[({.+^$})]',
        },
        '[folderName]': {
          '[fileName].txt': 'Replace the names',
        },
        '[component]': {
          '[component].component.jsx': '// React component',
          '[component].styles.css': '.component {}',
        },
        [`timestamp-${TIMESTAMP_KEY}`]: {
          [`file-${TIMESTAMP_KEY}.txt`]:
            'This file has a timestamp in the name',
        },
        myFolder: {
          'myFile.txt': 'This is my file',
        },
        docs: {
          'info.txt': 'Some info',
          'testing.txt': 'File to test something',
        },
        nested: {
          folder: {
            'file.txt': 'File inside nested folder',
          },
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
    expect(command).toHaveProperty('resetOptions')
    expect(command).toHaveProperty('changeOptions')
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
      keyValueSeparator: '@',
    }

    const command = new CreateCommand('text.txt', testingFolder, newOptions)
    expect(command.options).toEqual(newOptions)
  })

  it('should be able to change the source', () => {
    const command = new CreateCommand('text.txt', testingFolder)
    expect(command.source).toBe('text.txt')
    command.source = 'file.js'
    expect(command.source).toBe('file.js')
  })

  it('should be able to change the destination', () => {
    const command = new CreateCommand('text.txt', 'folder')
    expect(command.destination).toBe('folder')
    command.destination = testingFolder
    expect(command.destination).toBe(testingFolder)
  })

  it('should be able to change options', () => {
    const command = new CreateCommand('text.txt', testingFolder)
    expect(command.options).toEqual(CREATE_COMMAND_DEFAULT_OPTIONS)

    command.changeOptions({
      name: 'file.txt',
      templatesFolder: customTemplatesFolder,
    })

    expect(command.options).toEqual({
      ...CREATE_COMMAND_DEFAULT_OPTIONS,
      name: 'file.txt',
      templatesFolder: customTemplatesFolder,
    })
  })

  it('should be able to reset options to default values', () => {
    const command = new CreateCommand('text.txt', testingFolder, {
      name: 'file.txt',
      templatesFolder: customTemplatesFolder,
    })

    expect(command.options).toEqual({
      ...CREATE_COMMAND_DEFAULT_OPTIONS,
      name: 'file.txt',
      templatesFolder: customTemplatesFolder,
    })

    command.resetOptions()

    expect(command.options).toEqual(CREATE_COMMAND_DEFAULT_OPTIONS)
  })

  it('should create a text.txt file', () => {
    const results = new CreateCommand('text.txt', testingFolder).run()

    expect(readFromTemplatesFolder('text.txt')).toBe(
      readFromTestingFolder('text.txt'),
    )

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should create a docs folder', () => {
    const results = new CreateCommand('docs', testingFolder).run()

    expect(readFromTemplatesFolder('docs/info.txt')).toBe(
      readFromTestingFolder('docs/info.txt'),
    )

    expect(readFromTemplatesFolder('docs/testing.txt')).toBe(
      readFromTestingFolder('docs/testing.txt'),
    )

    expect(results).toEqual([
      getCreateCommandResult('folder', 'docs', 'docs'),
      getCreateCommandResult('file', 'docs/info.txt', 'docs/info.txt'),
      getCreateCommandResult('file', 'docs/testing.txt', 'docs/testing.txt'),
    ])
  })

  it('should clear previous results if run the same command two times', () => {
    const command = new CreateCommand('text.txt', testingFolder)
    const firstResults = command.run()
    expect(firstResults).toHaveLength(1)
    command.source = 'file_file.txt'
    const secondResults = command.run()
    expect(secondResults).toHaveLength(1)
  })

  it('should create a folder with another folder inside', () => {
    const results = new CreateCommand('nested', testingFolder).run()
    expect(results).toEqual([
      getCreateCommandResult('folder', 'nested', 'nested'),
      getCreateCommandResult('folder', 'nested/folder', 'nested/folder'),
      getCreateCommandResult(
        'file',
        'nested/folder/file.txt',
        'nested/folder/file.txt',
      ),
    ])
  })

  it('should create a folder and rename the nested folder', () => {
    const results = new CreateCommand('nested', testingFolder, {
      replaceNames: ['folder=content'],
      brackets: false,
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('folder', 'nested', 'nested'),
      getCreateCommandResult('folder', 'nested/folder', 'nested/content'),
      getCreateCommandResult(
        'file',
        'nested/folder/file.txt',
        'nested/content/file.txt',
      ),
    ])
  })

  it('should create a text file with a custom name', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      name: 'customName.txt',
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'customName.txt'),
    ])
  })

  it('should create a folder with a custom name', () => {
    const results = new CreateCommand('docs', testingFolder, {
      name: 'folder',
    }).run()

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

    expect(results).toEqual([
      getCreateCommandResult('file', 'file.txt', 'file.txt', true),
    ])
  })

  it('should create a text file with a custom encoding', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      encoding: 'base64',
    }).run()

    const fileContent = readFromTestingFolder('text.txt')
    expect(validateBase64(fileContent)).toBe(true)

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should replace the file content and then change the encoding', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      encoding: 'base64',
      replaceContent: ['file=custom file'],
    }).run()

    const oldFileContent = readFromTemplatesFolder('text.txt')
    const newFileContent = readFromTestingFolder('text.txt')

    expect(validateBase64(oldFileContent)).toBe(false)
    expect(validateBase64(newFileContent)).toBe(true)

    expect(Buffer.from(newFileContent, 'base64').toString('utf-8')).toBe(
      oldFileContent.replace('file', 'custom file'),
    )

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should create a folder with custom encoding', () => {
    const results = new CreateCommand('docs', testingFolder, {
      encoding: 'base64',
    }).run()

    const firstFileContent = readFromTestingFolder('docs/info.txt')
    expect(validateBase64(firstFileContent)).toBe(true)

    const secondFileContent = readFromTestingFolder('docs/testing.txt')
    expect(validateBase64(secondFileContent)).toBe(true)

    expect(results).toEqual([
      getCreateCommandResult('folder', 'docs', 'docs'),
      getCreateCommandResult('file', 'docs/info.txt', 'docs/info.txt'),
      getCreateCommandResult('file', 'docs/testing.txt', 'docs/testing.txt'),
    ])
  })

  it('should change the encoding of folder files after replace the content', () => {
    const results = new CreateCommand('docs', testingFolder, {
      encoding: 'base64',
      replaceContent: ['info=information', 'something=the app'],
    }).run()

    const oldContent = {
      firstFile: readFromTemplatesFolder('docs/info.txt'),
      secondFile: readFromTemplatesFolder('docs/testing.txt'),
    }

    const newContent = {
      firstFile: readFromTestingFolder('docs/info.txt'),
      secondFile: readFromTestingFolder('docs/testing.txt'),
    }

    expect(validateBase64(oldContent.firstFile)).toBe(false)
    expect(validateBase64(oldContent.secondFile)).toBe(false)

    expect(validateBase64(newContent.firstFile)).toBe(true)
    expect(validateBase64(newContent.secondFile)).toBe(true)

    expect(Buffer.from(newContent.firstFile, 'base64').toString('utf-8')).toBe(
      oldContent.firstFile.replace('info', 'information'),
    )

    expect(Buffer.from(newContent.secondFile, 'base64').toString('utf-8')).toBe(
      oldContent.secondFile.replace('something', 'the app'),
    )

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

    expect(results).toEqual([
      getCreateCommandResult('file', '[file].txt', 'password.txt'),
    ])
  })

  it('should replace multiple parts of the file name', () => {
    const results = new CreateCommand('[First]Of[Second].txt', testingFolder, {
      replaceNames: ['First=History', 'Second=Cats'],
    }).run()

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

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'something.txt'),
    ])
  })

  it('should replace regex chars in the file name', () => {
    const results = new CreateCommand('[({.+^$})].txt', testingFolder, {
      replaceNames: ['[({.+^$})]=text'],
      brackets: false,
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('file', '[({.+^$})].txt', `text.txt`),
    ])
  })

  it('should replace the text inside brackets in the folder name', () => {
    const results = new CreateCommand('[folderName]', testingFolder, {
      replaceNames: ['folderName=photos'],
    }).run()

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

    expect(results).toEqual([
      getCreateCommandResult('folder', 'myFolder', 'math'),
      getCreateCommandResult('file', 'myFolder/myFile.txt', 'math/myFile.txt'),
    ])
  })

  it('should replace regex chars in the folder name', () => {
    const results = new CreateCommand('folder_[({.+^$})]', testingFolder, {
      replaceNames: ['[({.+^$})]=folder'],
      brackets: false,
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('folder', 'folder_[({.+^$})]', `folder_folder`),
      getCreateCommandResult(
        'file',
        'folder_[({.+^$})]/file.txt',
        `folder_folder/file.txt`,
      ),
    ])
  })

  it('should replace the folder name and the name of its files', () => {
    const results = new CreateCommand('[component]', testingFolder, {
      replaceNames: ['component=Button'],
    }).run()

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

  it('should replace regex chars in the folder name and in its files', () => {
    const results = new CreateCommand('[({.+^$})]', testingFolder, {
      replaceNames: ['[({.+^$})]=project'],
      brackets: false,
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('folder', '[({.+^$})]', `project`),
      getCreateCommandResult(
        'file',
        '[({.+^$})]/[({.+^$})].txt',
        `project/project.txt`,
      ),
    ])
  })

  it('should work normally when pass the --replace-names as boolean', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      replaceNames: true as any,
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should replace a part of the content of a file', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['a file=not a simple text file'],
    }).run()

    const fileContent = readFromTestingFolder('text.txt')
    expect(fileContent).toBe('This is not a simple text file')

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

    expect(results).toEqual([
      getCreateCommandResult('file', 'file_file.txt', 'file_file.txt'),
    ])
  })

  it('should replace all regex chars in the file content', () => {
    const results = new CreateCommand('[({.+^$})].txt', testingFolder, {
      replaceContent: ['[({.+^$})]=This is a text file'],
    }).run()

    const fileContent = readFromTestingFolder('[({.+^$})].txt')
    expect(fileContent).toBe('This is a text file')

    expect(results).toEqual([
      getCreateCommandResult('file', '[({.+^$})].txt', '[({.+^$})].txt'),
    ])
  })

  it('should replace regex chars of the content of a file that is inside a folder', () => {
    const results = new CreateCommand('folder_[({.+^$})]', testingFolder, {
      replaceContent: ['[({.+^$})]=New file content'],
    }).run()

    const fileContent = readFromTestingFolder('folder_[({.+^$})]/file.txt')
    expect(fileContent).toBe('New file content')

    expect(results).toEqual([
      getCreateCommandResult(
        'folder',
        'folder_[({.+^$})]',
        `folder_[({.+^$})]`,
      ),
      getCreateCommandResult(
        'file',
        'folder_[({.+^$})]/file.txt',
        `folder_[({.+^$})]/file.txt`,
      ),
    ])
  })

  it('should replace the content of a file inside nested folder', () => {
    const results = new CreateCommand('nested', testingFolder, {
      replaceContent: ['File=The text file'],
    }).run()

    const fileContent = readFromTestingFolder('nested/folder/file.txt')
    expect(fileContent).toBe('The text file inside nested folder')

    expect(results).toEqual([
      getCreateCommandResult('folder', 'nested', 'nested'),
      getCreateCommandResult('folder', 'nested/folder', 'nested/folder'),
      getCreateCommandResult(
        'file',
        'nested/folder/file.txt',
        'nested/folder/file.txt',
      ),
    ])
  })

  it('should work normally when pass the --replace-content as boolean', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      replaceContent: true as any,
    }).run()

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'text.txt'),
    ])
  })

  it('should work with a custom key value separator', () => {
    const results = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['text@anything'],
      replaceContent: ['file@complex concept'],
      keyValueSeparator: '@',
      brackets: false,
    }).run()

    const fileContent = readFromTestingFolder('anything.txt')
    expect(fileContent).toBe('This is a complex concept')

    expect(results).toEqual([
      getCreateCommandResult('file', 'text.txt', 'anything.txt'),
    ])
  })

  it('should add a timestamp in the file name', () => {
    const timestamp = new Date('2021-01-01').getTime()
    jest.useFakeTimers('modern').setSystemTime(timestamp)

    const results = new CreateCommand(
      `file-${TIMESTAMP_KEY}.txt`,
      testingFolder,
    ).run()

    expect(results).toEqual([
      getCreateCommandResult(
        'file',
        `file-${TIMESTAMP_KEY}.txt`,
        `file-${timestamp}.txt`,
      ),
    ])

    jest.useRealTimers()
  })

  it('should add a timestamp before replace parts of the file name', () => {
    const timestamp = new Date('2021-01-01').getTime()
    jest.useFakeTimers('modern').setSystemTime(timestamp)

    const results = new CreateCommand(
      `file-${TIMESTAMP_KEY}.txt`,
      testingFolder,
      {
        replaceNames: [`${TIMESTAMP_KEY}=TEST`, 'file=log'],
        brackets: false,
      },
    ).run()

    expect(results).toEqual([
      getCreateCommandResult(
        'file',
        `file-${TIMESTAMP_KEY}.txt`,
        `log-${timestamp}.txt`,
      ),
    ])

    jest.useRealTimers()
  })

  it('should add a timestamp in multiple parts of the file name', () => {
    const timestamp = new Date('2021-01-01').getTime()
    jest.useFakeTimers('modern').setSystemTime(timestamp)
    const source = `${TIMESTAMP_KEY}-${TIMESTAMP_KEY}.txt`
    const results = new CreateCommand(source, testingFolder).run()
    const destination = `${timestamp}-${timestamp}.txt`
    expect(results).toEqual([
      getCreateCommandResult('file', source, destination),
    ])
    jest.useRealTimers()
  })

  it('should add a timestamp in the folder name and in its files', () => {
    const timestamp = new Date('2021-01-01').getTime()
    jest.useFakeTimers('modern').setSystemTime(timestamp)

    const results = new CreateCommand(
      `timestamp-${TIMESTAMP_KEY}`,
      testingFolder,
    ).run()

    expect(results).toEqual([
      getCreateCommandResult(
        'folder',
        `timestamp-${TIMESTAMP_KEY}`,
        `timestamp-${timestamp}`,
      ),
      getCreateCommandResult(
        'file',
        `timestamp-${TIMESTAMP_KEY}/file-${TIMESTAMP_KEY}.txt`,
        `timestamp-${timestamp}/file-${timestamp}.txt`,
      ),
    ])

    jest.useRealTimers()
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

  it('should throw AlreadyExistsError if the file already exists', () => {
    new CreateCommand('text.txt', testingFolder).run()
    const otherCommand = new CreateCommand('text.txt', testingFolder)
    expect(otherCommand.run.bind(otherCommand)).toThrowError(AlreadyExistsError)
  })

  it('should throw AlreadyExistsError if the folder already exists', () => {
    new CreateCommand('docs', testingFolder).run()
    const otherCommand = new CreateCommand('docs', testingFolder)
    expect(otherCommand.run.bind(otherCommand)).toThrowError(AlreadyExistsError)
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

    const seventhCommand = new CreateCommand('text.txt', testingFolder, {
      replaceNames: ['text=file'],
      keyValueSeparator: '#',
    })

    expect(firstCommand.run.bind(firstCommand)).toThrowError(SyntaxError)
    expect(secondCommand.run.bind(secondCommand)).toThrowError(SyntaxError)
    expect(thirdCommand.run.bind(thirdCommand)).toThrowError(SyntaxError)
    expect(fourthCommand.run.bind(fourthCommand)).toThrowError(SyntaxError)
    expect(fifthCommand.run.bind(fifthCommand)).toThrowError(SyntaxError)
    expect(sixthCommand.run.bind(sixthCommand)).toThrowError(SyntaxError)
    expect(seventhCommand.run.bind(seventhCommand)).toThrowError(SyntaxError)
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

    const seventhCommand = new CreateCommand('text.txt', testingFolder, {
      replaceContent: ['file=tutorial'],
      keyValueSeparator: '#',
    })

    expect(firstCommand.run.bind(firstCommand)).toThrowError(SyntaxError)
    expect(secondCommand.run.bind(secondCommand)).toThrowError(SyntaxError)
    expect(thirdCommand.run.bind(thirdCommand)).toThrowError(SyntaxError)
    expect(fourthCommand.run.bind(fourthCommand)).toThrowError(SyntaxError)
    expect(fifthCommand.run.bind(fifthCommand)).toThrowError(SyntaxError)
    expect(sixthCommand.run.bind(sixthCommand)).toThrowError(SyntaxError)
    expect(seventhCommand.run.bind(seventhCommand)).toThrowError(SyntaxError)
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

  it('should throw MisusedOptionsError if uses the name option together with the replaceNames option', () => {
    const command = new CreateCommand('text.txt', testingFolder, {
      name: 'file.txt',
      replaceNames: ['text=documentation'],
    })

    expect(command.run.bind(command)).toThrowError(MisusedOptionsError)
  })

  it('should throw MisusedOptionsError if uses the name option and the timestamp key in the file/folder name', () => {
    const commandToCreateFile = new CreateCommand(
      `file-${TIMESTAMP_KEY}.txt`,
      testingFolder,
      {
        name: 'file.txt',
      },
    )

    const commandToCreateFolder = new CreateCommand(
      `timestamp-${TIMESTAMP_KEY}`,
      testingFolder,
      {
        name: 'timestamp-custom',
      },
    )

    expect(commandToCreateFile.run.bind(commandToCreateFile)).toThrowError(
      MisusedOptionsError,
    )

    expect(commandToCreateFolder.run.bind(commandToCreateFolder)).toThrowError(
      MisusedOptionsError,
    )
  })
})
