const path = require('path')
const fs = require('fs')

const testTemplatesFolderPath = path.resolve(
  process.cwd(),
  '__file-templates__',
)

const cleanTestTemplatesFolder = () => {
  if (fs.existsSync(testTemplatesFolderPath)) {
    fs.rmSync(testTemplatesFolderPath, { recursive: true })
  }
  fs.mkdirSync(testTemplatesFolderPath)
}

const createTemplateFolders = () => {
  fs.mkdirSync(`${testTemplatesFolderPath}/empty`)

  const docsFolderPath = `${testTemplatesFolderPath}/docs`
  fs.mkdirSync(docsFolderPath)
  fs.writeFileSync(`${docsFolderPath}/info.txt`, 'Some info')
  fs.writeFileSync(`${docsFolderPath}/testing.txt`, 'File to test something')

  const simpleFolderPath = `${testTemplatesFolderPath}/[folderName]`
  fs.mkdirSync(simpleFolderPath)
  fs.writeFileSync(
    `${simpleFolderPath}/[fileName].txt`,
    'Replace the name of this file',
  )

  const componentFolderPath = `${testTemplatesFolderPath}/[componentName]`
  fs.mkdirSync(componentFolderPath)
  fs.writeFileSync(
    `${componentFolderPath}/index.ts`,
    `import ComponentName from './ComponentName'\r\nexport default ComponentName\r\n`,
  )
  fs.writeFileSync(
    `${componentFolderPath}/[componentName].tsx`,
    `const ComponentName = ({ text }) => {\r\n  return <div>{text}</div>\r\n}\r\n\r\nexport default ComponentName\r\n`,
  )
}

const createTemplateFiles = () => {
  fs.writeFileSync(`${testTemplatesFolderPath}/text.txt`, 'This is a file')
  fs.writeFileSync(`${testTemplatesFolderPath}/[theFile].txt`, 'A other file')
  fs.writeFileSync(
    `${testTemplatesFolderPath}/[firstPart]Of[secondPart].txt`,
    'The firstPart of secondPart',
  )
}

cleanTestTemplatesFolder()
createTemplateFolders()
createTemplateFiles()
