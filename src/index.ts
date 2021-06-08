#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { Command } from 'commander'

const program = new Command()

program
  .version('1.0.0')
  .command('create <source> <destination>')
  .description(
    'Creates a file or folder based on the <source> at <destination>',
  )
  .action((source: string, destination: string) => {
    const templatesDir = path.resolve(process.cwd(), '__file-templates__')
    const sourcePath = path.resolve(templatesDir, source)

    const templatesDirExists = fs.existsSync(templatesDir)
    if (!templatesDirExists) {
      console.log(
        chalk.red(
          'The __file-templates__ directory does not exist in your project root',
        ),
      )
    }

    const sourcePathExists = fs.existsSync(sourcePath)
    if (!sourcePathExists) {
      console.log(chalk.red(`${sourcePathExists} not found`))
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
      const directoryName = directoryParts[directoryParts.length - 1]
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
        const fileContent = fs.readFileSync(filePath, 'utf-8')
        fs.writeFileSync(fileDestinationPath, fileContent)
        console.log(chalk.green(`File created at ${fileDestinationPath}`))
      })

      return
    } else if (isSourcePathFile) {
      const sourceParts = source.split('/')
      const fileName = sourceParts[sourceParts.length - 1]
      const destinationPath = path.resolve(process.cwd(), destination, fileName)
      const fileContent = fs.readFileSync(sourcePath, 'utf-8')
      fs.writeFileSync(destinationPath, fileContent)
      console.log(chalk.green(`File created at ${destinationPath}`))
      return
    }

    console.log(chalk.red('The source can only be a file or a directory'))
  })

program.parse(process.argv)
