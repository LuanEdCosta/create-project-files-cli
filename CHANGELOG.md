# Changelog

This file documents all version releases.

## 1.0.2 - 2021-07-19

- Use version from package.json
- Fix line ending bug on Linux and Mac OS

## 1.0.1 - 2021-07-18

- Fix installation guide in the readme and other documentation details

## 1.0.0 - 2021-07-18

This is the first version of the library that allows you to create a file or folder based on what's on the templates folder in any location you want. You can change the name or encoding of created files, use other folder to store templates, and replace parts of the content of template files.

### Commands

- `cpf create <source> <destination> [...options]` - Create a file or folder based on `<source>` at `<destination>`

**Options**

- `-n, --name [name]` - Changes the name of a file or folder
- `-t, --templates-folder [path]` - Path to templates folder
- `-e, --encoding [encoding]` - Changes the content encoding of the read files
- `-rn, --replace-names [names...]` - Replaces the names of a file or folder
- `-nb, --no-brackets` - Makes brackets not required when using the --replace-names option
- `-rc, --replace-content [content...]` - Replaces parts of the contents of a file or files within a folder
