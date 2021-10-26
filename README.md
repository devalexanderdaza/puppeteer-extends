# puppeteer-extends 
> 

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Getting started](#getting-started)
  - [Complete directory layout](#complete-directory-layout)
- [Technologies](#technologies)
- [How to use](#how-to-use)
- [Publishing your code](#publishing-your-code)
- [Changelog](#changelog)
- [How to contribute](#how-to-contribute)
- [How to make pull request](#how-to-make-pull-request)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```
npm install puppeteer-extends --save
```

## Getting Started

* Run: `npm install` inside your project to install dependencies.
* Run: `npm install typings -g` (If [typings](https://www.npmjs.com/package/typings) is not installed before run this command)
* Run:`npm install gulp -g` to install [Gulp](https://www.npmjs.com/package/gulp) globally
* Follow the Complete Directory Layout to get to know about the project.

### Complete Directory Layout

```
.
├── /coverage/                  # Code coverage for source files of the project
├── /docs/                      # Documentation files for the project
├── /gulp/                      # The folder contains gulp tasks required to build the project
│   ├── /build.js               # Builds the project from source to output(lib) folder
│   ├── /clean.js               # Contain clean tasks required for the prject
│   ├── /conf.js                # Contains the variables used in other gulp files
│   ├── /lint.js                # Common lint support with jshint and tslint
│   ├── /scripts.js             # Build scripts
│   ├── /tests.js               # Run tests and generate coverage reports
│   ├── /tsconfig.js            # Updates tsconfig.json with project sources
│   ├── /tsdocs.js              # Generates documentation for the project
│   ├── /version.js             # Updated version
│   └── /watch.js               # Watches all the .ts, .js files for changes
├── /lib/                       # The folder for compiled output with typings for node module consume
├── /node_modules/              # 3rd-party libraries and utilities
├── /src/                       # The source code(.ts) of the application
│   ├── /sub_srcs               # Contain any sub sources(files or folders)
│   └── /index.ts               # Expose the acceseble properties by outside
├── /test/                      # Contain tests(.ts) for all the source files
├── /typings/                   # Typings files for specific node modules for the project
├── .editorconfig               # Define and maintain consistent coding styles between different editors and IDEs
├── .gitattributes              # Defining attributes per path
├── .gitignore                  # Contains files to be ignored when pushing to git
├── .jshintrc                   # JShint rules for the project
├── .npmignore                  # Contains files to be ignored when pushing to npm
├── .npmrc                      # NPM config file
├── .travis.yml                 # Travis CI configuration file
├── CHANGELOG.md                # Detailed recent changes in the versions
├── CONTRIBUTING.md             # Shows how to contribute to your module
├── gulpfile.js                 # Link all splittered gulp tasks  
├── LICENSE                     # Contains License Agreement file
├── package.json                # Holds various metadata relevant to the project
├── PULL_REQUEST_TEMPLATE.md    # Shows how to make pull request to you project
├── README.md                   # Contains the details of the generated project
├── tsconfig.json               # Contains typescript compiler options
├── tslint.json                 # Lint rules for the project
└── typings.json                # Typings information to generate typings folder
```

## Technologies

Usage          	            | Technology
--------------------------	| --------------------------
Javascript Framework        | Typescript
Unit Testing Framework     	| Mocha and Chai
Coverage Generator         	| Istanbul
Documentation              	| Typedoc
Build Tool                	| Gulp
Code Quality Tools         	| JS Hint, TS Lint
Dependency Registries      	| NPM

## How to Use

Here is the list of tasks available out of the box and run these via `npm run <task>`
```
  typings-install   Install typings to the project
  build             Perform npm build
  clean             Cleans lib directory
  test              Run spec tests
  coverage          Generate coverage reports by running all the tests
  doc               Generate API Documentation
  tsconfig-update   Update files section in tsconfig.json using filesGlob entries
  watch             Watches ts source files and runs tslint, jshint on change
  patch             Update patch version and create tag
  feature           Update feature version and create tag
  release           Update release version and create tag
```

## Publishing Your Code

*Once your tests are passing (ideally with a Travis CI green run), you might be ready to publish your code to npm.*

Bumping version number and tagging the repository with it can be done as mentioned below.
For more details read [http://semver.org/](http://semver.org/)
 
Available options to update version 
```  
npm run patch     # makes v0.1.0 → v0.1.1
npm run feature   # makes v0.1.1 → v0.2.0
npm run release   # makes v0.2.1 → v1.0.0
```
Publishing updated version can be done via,
```
npm run <release | feature | patch>
npm publish
```

## Changelog
Recent changes can be viewed on the [CHANGELOG.md](CHANGELOG.md)

## How to Contribute
Read to contribute [CONTRIBUTING.md](CONTRIBUTING.md)

[Referred via](https://github.com/joeybaker/generator-iojs)

## How to Make Pull Request
Read to contribute [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md)

[Referred via](https://github.com/joeybaker/generator-iojs)

## License

Copyright (c) Alexander Daza.
This source code is licensed under the Apache-2.0 license.
