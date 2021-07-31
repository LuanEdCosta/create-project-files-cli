import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

describe('Program happy path tests', () => {
  const currentTimestamp = new Date().getTime()
  const testFolderName = `__testing-${currentTimestamp}__`
  const testFolderPath = path.resolve(process.cwd(), testFolderName)

  const cmd = (commands: string) => {
    return new Promise((resolve) => {
      exec(
        `yarn dev ${commands}`,
        { cwd: process.cwd() },
        (error, stdout, stderr) => {
          resolve({
            errorCode: error?.code || 0,
            error,
            stdout,
            stderr,
          })
        },
      )
    })
  }

  const existsInTestFolder = (pathSegment: string): boolean => {
    return fs.existsSync(path.resolve(testFolderPath, pathSegment))
  }

  const readFileFromTestFolder = (
    pathSegment: string,
    encoding: BufferEncoding,
  ): string => {
    return fs.readFileSync(path.resolve(testFolderPath, pathSegment), {
      encoding,
    })
  }

  const validateBase64 = (base64: string): boolean => {
    const regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/
    return regex.test(base64)
  }

  beforeEach(() => {
    fs.mkdirSync(testFolderPath)
  })

  afterEach(() => {
    fs.rmSync(testFolderPath, { recursive: true })
  })

  it('should create a file in the correct destination', async () => {
    await cmd(`create text.txt ${testFolderName}`)
    expect(existsInTestFolder('text.txt')).toBe(true)
  })

  it('should create a folder in the correct destination', async () => {
    await cmd(`create docs ${testFolderName}`)
    expect(existsInTestFolder('docs')).toBe(true)
  })

  it('should create a file with a custom name', async () => {
    await cmd(`create text.txt ${testFolderName} -n myFile.txt`)
    expect(existsInTestFolder('myFile.txt')).toBe(true)
  })

  it('should create a folder with a custom name', async () => {
    await cmd(`create docs ${testFolderName} -n myFolder`)
    expect(existsInTestFolder('myFolder')).toBe(true)
  })

  it('should create a file from a custom template folder', async () => {
    const customFolderName = `__custom-${currentTimestamp}__`
    const customFolderPath = path.resolve(process.cwd(), customFolderName)
    fs.mkdirSync(customFolderPath)

    const fileName = 'simpleFile.txt'
    const filePath = path.resolve(customFolderPath, fileName)
    fs.writeFileSync(filePath, '#')

    await cmd(`create ${fileName} ${testFolderName} -t ${customFolderPath}`)
    expect(existsInTestFolder(fileName)).toBe(true)

    fs.rmSync(customFolderPath, { recursive: true })
  })

  it('should use a custom encoding to read the file', async () => {
    await cmd(`create text.txt ${testFolderName} -e base64`)
    expect(existsInTestFolder('text.txt')).toBe(true)
    const fileContent = readFileFromTestFolder('text.txt', 'base64')
    const isValidBase64 = validateBase64(fileContent)
    expect(isValidBase64).toBe(true)
  })

  it('should use a custom encoding to read the folder files', async () => {
    await cmd(`create docs ${testFolderName} -e base64`)

    const firstFilePath = 'docs/info.txt'
    const secondFilePath = 'docs/testing.txt'

    expect(existsInTestFolder(firstFilePath)).toBe(true)
    expect(existsInTestFolder(secondFilePath)).toBe(true)

    const firstFileContent = readFileFromTestFolder(firstFilePath, 'base64')
    const isFirstFileBase64Valid = validateBase64(firstFileContent)
    expect(isFirstFileBase64Valid).toBe(true)

    const secondFileContent = readFileFromTestFolder(secondFilePath, 'base64')
    const isSecondFileBase64Valid = validateBase64(secondFileContent)
    expect(isSecondFileBase64Valid).toBe(true)
  })

  it('should replace the brackets content in the file name', async () => {
    await cmd(`create [theFile].txt ${testFolderName} -rn theFile=myFile`)
    expect(existsInTestFolder('myFile.txt')).toBe(true)
  })

  it('should replace multiple parts of the file name', async () => {
    const fileName = '[firstPart]Of[secondPart].txt'
    const replaceNamesOption = '-rn firstPart=History secondPart=Cats'
    await cmd(`create ${fileName} ${testFolderName} ${replaceNamesOption}`)
    expect(existsInTestFolder('HistoryOfCats.txt')).toBe(true)
  })

  it('should replace the file name without brackets', async () => {
    await cmd(`create text.txt ${testFolderName} -rn text=anything -nb`)
    expect(existsInTestFolder('anything.txt')).toBe(true)
  })

  it('should replace the brackets content in the folder name', async () => {
    await cmd(`create [folderName] ${testFolderName} -rn folderName=myFolder`)
    expect(existsInTestFolder('myFolder')).toBe(true)
  })

  it('should replace the folder name without brackets', async () => {
    await cmd(`create docs ${testFolderName} -rn docs=documentation -nb`)
    expect(existsInTestFolder('documentation')).toBe(true)
  })

  it('should replace folder name and the names of its files', async () => {
    const folderName = '[folderName]'
    const replaceNamesOption = '-rn folderName=myFolder fileName=myFile'
    await cmd(`create ${folderName} ${testFolderName} ${replaceNamesOption}`)
    expect(existsInTestFolder('myFolder')).toBe(true)
    expect(existsInTestFolder('myFolder/myFile.txt')).toBe(true)
  })
})
