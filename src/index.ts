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

    if (isSourcePathDirectory) {
      const directoryFiles = fs.readdirSync(sourcePath)

      if (directoryFiles.length === 0) {
        console.log(chalk.red(`No files found at ${sourcePath}`))
        return
      }

      const directoryParts = source.split('/')
      const defaultDirectoryName = directoryParts[directoryParts.length - 1]
      const directoryName = options.name || defaultDirectoryName
      const destinationPath = path.resolve(
        process.cwd(),
        destination,
        directoryName,
      )

      fs.mkdirSync(destinationPath)

      directoryFiles.forEach((fileName) => {
        const fileDestinationPath = path.resolve(
          process.cwd(),
          destinationPath,
          fileName,
        )

        const filePath = path.resolve(sourcePath, fileName)
        const fileContent = fs.readFileSync(filePath, options.encoding)
        fs.writeFileSync(fileDestinationPath, fileContent)
        console.log(chalk.green(`File created at ${fileDestinationPath}`))
      })

      return
    } else if (isSourcePathFile) {
      const sourceParts = source.split('/')
      const defaultFileName = sourceParts[sourceParts.length - 1]
      const fileName = options.name || defaultFileName
      const destinationPath = path.resolve(process.cwd(), destination, fileName)
      const fileContent = fs.readFileSync(sourcePath, options.encoding)
      fs.writeFileSync(destinationPath, fileContent)
      console.log(chalk.green(`File created at ${destinationPath}`))
      return
    }

    console.log(chalk.red('The source can only be a file or a directory'))
  })

program.parse(process.argv)
