# :handshake: Contributing With This Project

**Thank you** for reading the contribution guide. Your help is appreciated :heart:

## What you can do

There are many ways to contribute with this project, but we can divide it in two groups: contributing **with code** and **with docs or other things**.

- :point_right: **Contributing With Code**
  - Creating new features
  - Fixing bugs
  - Fixing typos in code
  - Refactoring code
  - Improving organization
- :point_right: **Contributing With Docs or Other Things**
  - Improving the documentation
  - Fixing typos in documentation
  - Helping other people to use the library
  - Sharing this library with people you know
  - Staring the project on GitHub

## How to contribute with code

:point_down: Basically you have to do the steps below: :point_down:

- Create a personal fork of the project on Github.
- Clone the fork on your local machine. Your remote repo on Github is called `origin`.
- Add the original repository as a remote called `upstream`.
- If you created your fork a while ago be sure to pull upstream changes into your local repository.
- Create a new branch from the `master` branch to work on!
- Make the changes you want in the code.
- Run the tests with `yarn test`.
- Write or adapt tests as needed.
- Add or change the documentation as needed.
- Push your branch to your fork on Github, the remote `origin`.
- From your fork open a pull request in the correct branch. Target the `master` branch from the original.
- Once the pull request is approved and merged you can pull the changes from `upstream` to your local repo and delete your extra branch(es).

**And last but not least:** Always write your commit messages in the present tense. Your commit message should describe what the commit, when applied, does to the code – not what you did to the code.

## How to Test Changes

- Create the `__file-templates__` folder to store the template files and folders.
- Create a folder called `__testing__` to store the created files.
- Open a terminal instance and run the library locally. _See scripts below to know how to do that_.

## Helpful Scripts

**Run The Library Locally**

Syntax: `yarn dev <command> [...options]`

```
yarn dev create text.txt src
```

**Run Tests**

```
yarn test
```

**Clean Local Tests**

```
yarn clean:tests
```

**Install Globally on Windows**

```
yarn install:windows
```

**Install Globally on Unix Based Systems**

```
yarn install:unix
```

**Clean /lib Folder**

```
yarn clean:lib
```

**Format Code With Eslint**

```
yarn eslint:fix
```

---

_P.S._ See other scripts in the [package.json](/package.json) file.
