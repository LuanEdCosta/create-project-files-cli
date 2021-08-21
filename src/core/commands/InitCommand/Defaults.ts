export const DEFAULT_CONFIG_FILE_NAME = 'cpf.config.json'

export const DEFAULT_CONFIG_FILE_DATA = {
  defaults: {
    templatesPath: '__file-templates__',
  },
  commands: {
    component: {
      description: 'This command creates a text file',
      sourcePath: 'text.txt',
      destinationPath: '.',
      brackets: false,
      replaceNames: {
        text: '{name}',
      },
      replaceContent: {
        name: '{name}',
      },
      params: {
        name: 'Whats the name of the file (without extension)?',
      },
    },
  },
}
