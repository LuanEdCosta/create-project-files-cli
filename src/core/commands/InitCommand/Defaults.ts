export const DEFAULT_CONFIG_FILE_NAME = 'cpf.config.json'

export const DEFAULT_CONFIG_FILE_DATA = {
  commands: {
    example: {
      params: {
        name: 'Whats the name of the file (without extension)?',
      },
      create: [
        {
          sourcePath: 'text.txt',
          destinationPath: '.',
          brackets: false,
          replaceNames: {
            text: '{name}',
          },
        },
      ],
    },
  },
}
