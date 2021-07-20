#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'

const packageJson = require('../package.json')

const program = new Command()

interface ProgramOptions {
  name: string
  templatesFolder: string
  encoding: BufferEncoding
  replaceNames?: string[]
  replaceContent?: string[]
  brackets: boolean
}

const replaceTextPieces = (
  text: string,
  pieces: { [key: string]: string },
): string => {
  const regex = new RegExp(Object.keys(pieces).join('|'), 'g')
  return text.replace(regex, (matched) => pieces[matched])
}

program
  .version(packageJson?.version || 'Not Defined')
  .command('create <source> <destination>')
  .description(
    'Creates a file or folder based on the <source> at <destination>',
  )
  .option('-n, --name [name]', 'Changes the name of a file or directory', '')
  .option(
    '-t, --templates-folder [path]',
    'Path to templates directory',
    '__file-templates__',
  )
  .option(
    '-e, --encoding [encoding]',
    'Changes the content encoding of the read files',
    'utf-8',
  )
  .option(
    '-rn, --replace-names [names...]',
    'Replaces the names of a file or directory',
    undefined,
  )
  .option(
    '-nb, --no-brackets',
    'Makes brackets not required when using the --replace-names option',
  )
  .option(
    '-rc, --replace-content [content...]',
    'Replaces parts of the contents of a file or files within a directory',
    undefined,
  )
  .action((source: string, destination: string, options: ProgramOptions) => {
    const templatesDir = path.resolve(process.cwd(), options.templatesFolder)
    const sourcePath = path.resolve(templatesDir, source)

    const templatesDirExists = fs.existsSync(templatesDir)
    if (!templatesDirExists) {
      console.log(chalk.red(`The ${templatesDir} directory does not exist`))
      return
    }

    const sourcePathExists = fs.existsSync(sourcePath)
    if (!sourcePathExists) {
      console.log(chalk.red(`${sourcePathExists} not found`))
      return
    }

    const fsStatus = fs.lstatSync(sourcePath)
    const isSourcePathDirectory = fsStatus.isDirectory()
    const isSourcePathFile = fsStatus.isFile()

    const parsedNamesToReplace = options.replaceNames?.map((keyAndName) => {
      const [key, name] = keyAndName.split('=')
      return { key, name }
    })

    const isReplaceNamesOptionIncorrectly = parsedNamesToReplace?.some(
      ({ key, name }) => !key || !name,
    )

    if (isReplaceNamesOptionIncorrectly) {
      console.log(
        chalk.red(`The --replace-names option is incorrectly formatted`),
      )

      console.log(
        chalk.green('Expected: '),
        chalk.green('-rn key1=name1 key2=name2'),
      )

      console.log(
        chalk.redBright('Received: '),
        chalk.redBright(`-rn ${options.replaceNames}`),
      )

      return
    }

    const replaceContentObject: { [key: string]: string } = {}

    options.replaceContent?.forEach((keyAndText) => {
      const [key, text] = keyAndText.split('=')
      replaceContentObject[key] = text
    })

    const isReplaceContentOptionIncorrectly = Object.entries(
      replaceContentObject,
    ).some(([key, text]) => !key || !text)

    if (isReplaceContentOptionIncorrectly) {
      console.log(
        chalk.red(`The --replace-content option is incorrectly formatted`),
      )

      console.log(
        chalk.green('Expected: '),
        chalk.green('-rc key1=text1 key2=text2'),
      )

      console.log(
        chalk.redBright('Received: '),
        chalk.redBright(`-rc ${options.replaceContent}`),
      )

      return
    }

    const canReplaceContent = Object.keys(replaceContentObject).length > 0

    if (isSourcePathDirectory) {
      const directoryFiles = fs.readdirSync(sourcePath)

      if (directoryFiles.length === 0) {
        console.log(chalk.red(`No files found at ${sourcePath}`))
        return
      }

      const directoryParts = source.split('/')
      const defaultDirectoryName = directoryParts[directoryParts.length - 1]

      let replacedDirectoryName = defaultDirectoryName
      if (parsedNamesToReplace) {
        parsedNamesToReplace.forEach(({ key, name }) => {
          const keyToUse = options.brackets ? `[${key}]` : key
          if (replacedDirectoryName.includes(keyToUse)) {
            replacedDirectoryName = replacedDirectoryName.replace(
              keyToUse,
              name,
            )
          }
        })
      }

      const directoryName = options.name || replacedDirectoryName
      const destinationPath = path.resolve(
        process.cwd(),
        destination,
        directoryName,
      )

      fs.mkdirSync(destinationPath)

      directoryFiles.forEach((fileName) => {
        const filePath = path.resolve(sourcePath, fileName)
        const fileContent = fs.readFileSync(filePath, options.encoding)
        const newFileContent = canReplaceContent
          ? replaceTextPieces(fileContent, replaceContentObject)
          : fileContent

        let replacedFileName = fileName
        if (parsedNamesToReplace) {
          parsedNamesToReplace.forEach(({ key, name }) => {
            const keyToUse = options.brackets ? `[${key}]` : key
            if (replacedFileName.includes(keyToUse)) {
              replacedFileName = replacedFileName.replace(keyToUse, name)
            }
          })
        }

        const fileDestinationPath = path.resolve(
          process.cwd(),
          destinationPath,
          replacedFileName,
        )

        fs.writeFileSync(fileDestinationPath, newFileContent)
        console.log(chalk.green(`File created at ${fileDestinationPath}`))
      })
    } else if (isSourcePathFile) {
      const sourceParts = source.split('/')
      const defaultFileName = sourceParts[sourceParts.length - 1]

      let replacedFileName = defaultFileName
      if (parsedNamesToReplace) {
        parsedNamesToReplace.forEach(({ key, name }) => {
          const keyToUse = options.brackets ? `[${key}]` : key
          if (replacedFileName.includes(keyToUse)) {
            replacedFileName = replacedFileName.replace(keyToUse, name)
          }
        })
      }

      const fileName = options.name || replacedFileName
      const destinationPath = path.resolve(process.cwd(), destination, fileName)
      const fileContent = fs.readFileSync(sourcePath, options.encoding)
      const newFileContent = canReplaceContent
        ? replaceTextPieces(fileContent, replaceContentObject)
        : fileContent
      fs.writeFileSync(destinationPath, newFileContent)

      console.log(chalk.green(`File created at ${destinationPath}`))
    } else {
      console.log(chalk.red('The source can only be a file or a directory'))
    }
  })

program.parse(process.argv)
