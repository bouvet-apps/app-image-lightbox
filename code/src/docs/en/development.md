Welcome to the Image lightbox App app for Enonic XP. This repo contains source code and build scripts to build and deploy a package to be run in Enonic XP.

# Repositories
This project has 1 repository:

| Repository           | Description          | Type      | Path           |
| -------------------- | -------------------- | --------- | -------------- |
| app-image-lightbox   | application          | Main      | /              |

# Local project setup
## Tools
All build scripts are made for running either on MacOS or Linux.

[Git](https://git-scm.com/): Version control FTW.

[nvm](https://github.com/nvm-sh/nvm): Node and npm version manager. Node and npm are used for managing dependencies.

A modern IDE such as [IntelliJ IDEA](https://www.jetbrains.com/idea/), [WebStorm](https://www.jetbrains.com/webstorm/), [Visual Studio Code](https://code.visualstudio.com/), or any other that you prefer.

[sdkman](https://sdkman.io/): Version manager for a plethora of tools, most notably Java and Gradle.

## Development environment
Make sure to use Java version 11. Check by running `java -version`. Use `sdkman` to adjust if necessary.

Enonic CLI (Command Line Interface) needs to be installed. See
[documentation for Enonic CLI](https://developer.enonic.com/docs/enonic-cli/master/install) for details.
Check your version by executing `enonic latest`. Upgrade if not on the latest version.

We use `make` to run a lot of commands in the terminal from the project's root folder.
`make help` will show a list of all available make commands and their purposes.

### Make commands you should know in this project

#### Start, deploy and develop project

`make` or `make package` (default) will build the app. The jar can be found below the `deploy` folder. This can be dragged into "Applications" in an instance of Enonic.

`make deploy` will deploy the app to a sandbox. If you want to deploy to another sandbox, you can set your own `APP_NAME` in the [Makefile](../../../../Makefile) (ex: change `APP_NAME := $(shell cd $(CODE_DIR) && ./gradlew appName -q)` to `APP_NAME := 'starter''` if the sandbox is named 'starter'). We start the sandbox in dev mode, so _this command should only be necessary to run once_.

`make watch` will watch the codebase for any changed or added files and rebuild as necessary. When editing files that will be transpiled, it is necessary to have this command running.

`make start` will start the sandbox with name `APP_NAME` from the [Makefile](../../../../Makefile). If it does not exist, it will be created for you. The sandbox will start in dev mode.


#### Updating dependencies
If you change package.json so it is no longer in sync with the package-lock.json, building of the application will fail, because the `ci` command we use to install packages safely will not allow this.

If you update package.json on purpose, you will need to `make install_new_dependencies` before building the application again.

If you update the `node` or `npm` versions in the build.gradle files, which the packages are dependent on, simply delete the .gradle folders, and run `make install_new_dependencies` before running `make` again.

If you upgrade `gradleVersion` in the code/build.gradle file, simply delete the code/.gradle folder, and run `gradle wrapper` inside the `code` folder.

#### Other relevant commands
Note that all these commands will first run any tasks they depend upon.
`make test`: Run tests only.
`make lint`: Run lint only. Note that linting is also run pre-commit. Your IDE should also continuously tell you about any linting errors if configured properly.
`make clean`: Delete all dependencies and build folders.

# Documentation of code and architecture
See [code documentation](../../../README.md) for documentation of how we develop applications.

# Dependabot
See [dependabot documentation](dependabot.md) for documentation of how we use dependabot.
