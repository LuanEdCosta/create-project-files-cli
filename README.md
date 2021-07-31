<div>
  <img src="/resources/LogoRound.png" width="150px" height="150px" alt="Project Logo">

  <h1>Create Project Files CLI</h1>

  <div>
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/luanedcosta/create-project-files-cli.svg">
    <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/luanedcosta/create-project-files-cli.svg">
    <img alt="Repository size" src="https://img.shields.io/github/repo-size/luanedcosta/create-project-files-cli.svg">
    <img alt="GitHub" src="https://img.shields.io/github/license/luanedcosta/create-project-files-cli.svg">
    <a href="https://github.com/luanedcosta/create-project-files-cli/commits/master">
      <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/luanedcosta/create-project-files-cli.svg">
    </a>
    <a href="https://github.com/luanedcosta/create-project-files-cli/issues">
      <img alt="Repository issues" src="https://img.shields.io/github/issues/luanedcosta/create-project-files-cli.svg">
    </a>
  </div>
</div>

---

Create your project files faster using this CLI. You can create file templates and, with one command, create copies of your templates in the folder you want.

- :white_check_mark: Faster and easier than code snippets
- :white_check_mark: You can add the template files in the version control system
- :white_check_mark: Rename template files and folders
- :white_check_mark: Replace text inside your template files

## :zap: Installation

**Installing Globally**

With yarn

```
yarn global add create-project-files-cli
```

With npm

```
npm i -g create-project-files-cli
```

**Installing as Dev Dependency**

With yarn

```
yarn add -D create-project-files-cli
```

With npm

```
npm i -D create-project-files-cli
```

## :point_right: Getting Started

Follow the steps below to learn how to use this library.

1. Create a folder called `__file-templates__` in the root folder of your project.
2. Create a file called `test.txt` in the `__file-templates__` folder.
3. Open a terminal and type `cpf create text.txt .`
4. Now you should see a file called `text.txt` in your root folder.

## :page_facing_up: Documentation

- :large_blue_circle: `cpf create <source> <destination> [options]`

Creates a file or folder based on the `<source> at <destination>`.

| Option                              | Description                                                        | Example                                                |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| -n, --name [name]                   | Changes the name of a file or folder.                              | cpf create text.txt src -n newName.txt                 |
| -t, --templates-folder [path]       | Path to templates folder.                                          | cpf create text.txt src -t my-templates                |
| -e, --encoding [encoding]           | Changes the content encoding of the read files.                    | cpf create text.txt src -e base64                      |
| -rn, --replace-names [names...]     | Replaces the names of a file or folder.                            | cpf create [fileName].txt src -rn fileName=myFile      |
| -nb, --no-brackets                  | Makes brackets not required when using the --replace-names option. | cpf create fileName.txt src -rn fileName=otherFile -nb |
| -rc, --replace-content [content...] | Replaces parts of the contents of a file or files within a folder. | cpf create text.txt src -rc file=myFile                |

- :large_blue_circle: `cpf help [command]`

Display the help for a command or all commands.

## :hourglass: Coming Soon

- Find files and folders in multiple template folders.
- Create multiple files and folders with only one command.
- Ignore case when replacing the content of a file.
- Set an alias to a file or folder inside the templates folder.
- Create a config file to simplify the use of this library.
- Do not show success or error messages on console.
- Add uuid or timestamp to file names.

## :handshake: Contributing

:star: _This project can be better with your help_ :star:

- If you find a bug or have an good idea :small_blue_diamond: [Create a new issue](https://github.com/LuanEdCosta/create-project-files-cli/issues)
- If you want to contribute with code or documentation :small_blue_diamond: [Read the contributing guide](/CONTRIBUTING.md)

## :man: Author

Created with :heart: by Luan Eduardo da Costa | [Follow me on Linkedin](https://www.linkedin.com/in/luaneducosta/)
