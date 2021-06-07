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

    const isSourcePathDirectory = fs.lstatSync(sourcePath).isDirectory()
    const isSourcePathFile = fs.lstatSync(sourcePath).isFile()

    if (isSourcePathDirectory) {
      console.log(chalk.red('This functionality is not available yet'))
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
