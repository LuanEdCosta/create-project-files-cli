#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'

const program = new Command()

interface ProgramOptions {
  name: string
  templatesFolder: string
  encoding: BufferEncoding
  replaceNames?: string[]
  brackets: boolean
}

program
  .version('1.0.0')
  .command('create <source> <destination>')
  .description(
    'Creates a file or folder based on the <source> at <destination>',
  )
  .option('-n, --name [name]', 'Change the file or directory name', '')
  .option(
    '-t, --templates-folder [path]',
    'Path to the templates directory',
    '__file-templates__',
  )
  .option(
    '-e, --encoding [encoding]',
    'Change the content encoding of the read files',
    'utf-8',
  )
  .option(
    '-rn, --replace-names [names...]',
    'Replace file or directory names',
    undefined,
  )
  .option(
    '-nb, --no-brackets',
    'Make brackets not required when using the --replace-names option',
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

        fs.writeFileSync(fileDestinationPath, fileContent)
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
      fs.writeFileSync(destinationPath, fileContent)
      console.log(chalk.green(`File created at ${destinationPath}`))
    } else {
      console.log(chalk.red('The source can only be a file or a directory'))
    }
  })

program.parse(process.argv)
