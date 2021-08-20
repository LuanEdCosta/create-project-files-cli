# Changelog

This file documents all version releases.

## 1.2.0 - 2021-08-19

**Fixes**

- All options values are required. If you type the option, you must pass a valid value for it
- The previous Create command results are cleared when running the same command instance again

**New Features**

- Create --key-value-separator or -kvs option to define a custom key-value separator for the --replace-names and --replace-content options
- The Create command source, destination, and all options can be modified after create an instance

## 1.1.5 - 2021-08-18

**Fixes**

- Update all dependencies (using commander.js 8.x.x now)
- Throw AlreadyExistsError if you try to create a file or folder that already exists

## 1.1.4 - 2021-08-14

**Fixes**

- The create command runs normally when pass the --replace-content or the --replace-names options as booleans
- Add options short syntax in the MisusedOptionsError message
- Replace the content before changing the encoding
- Fix the SyntaxError received param formatting

## 1.1.3 - 2021-08-10

**Fixes**

- Make possible to use regex characters in the keys of the --replace-content option.

## 1.1.2 - 2021-08-08

**Fixes**

- Make possible to create a folder that contains nested folders

## 1.1.1 - 2021-08-06

**Fixes**

- Throw MisusedError error when the --name and --replace-names options are used together to prevent unexpected results, because the --name option overrides the --replace-names option.

## 1.1.0 - 2021-08-02

**Fixes**

- Improve errors visualization in the terminal
- Show `cpf` when use the help command
- Add success log for the created folder when using the `cpf create` command

**New Features**

- Now you can use the library in your code. You can install as a dev dependency, import the command you want and create your NodeJs script file. See code examples in the [README](/README.md).

## 1.0.2 - 2021-07-19

**Fixes**

- Use version from package.json
- Fix line ending bug on Linux and Mac OS

## 1.0.1 - 2021-07-18

**Fixes**

- Fix installation guide in the readme and other documentation details

## 1.0.0 - 2021-07-18

This is the first version of the library that allows you to create a file or folder based on what's on the templates folder in any location you want. You can change the name or encoding of created files, use other folder to store templates, and replace parts of the content of template files.

**Commands**

- `cpf create <source> <destination> [...options]` - Create a file or folder based on `<source>` at `<destination>`
  - Options:
  - `-n, --name [name]` - Changes the name of a file or folder
  - `-t, --templates-folder [path]` - Path to templates folder
  - `-e, --encoding [encoding]` - Changes the content encoding of the read files
  - `-rn, --replace-names [names...]` - Replaces the names of a file or folder
  - `-nb, --no-brackets` - Makes brackets not required when using the --replace-names option
  - `-rc, --replace-content [content...]` - Replaces parts of the contents of a file or files within a folder
