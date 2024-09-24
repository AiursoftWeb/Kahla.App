<p align="center">
    <a href="https://www.kahla.app/"><img width="100px" src="https://raw.githubusercontent.com/AiursoftWeb/Kahla.App/master/src/assets/144x144.png"></a>
    <h3 align="center">Kahla</h3>
    <p align="center">Kahla is a cross-platform business messaging app.<p>
</p>

[![Build status](https://aiursoft.visualstudio.com/Star/_apis/build/status/Kahla%20App%20Build)](https://aiursoft.visualstudio.com/Star/_build/latest?definitionId=4)
[![GitHub Release](https://img.shields.io/github/release/AiursoftWeb/Kahla.App.svg?style=flat)]() 
[![ManHours](https://manhours.aiursoft.cn/r/gitlab.aiursoft.cn/aiursoft/kahla.app.svg)](https://gitlab.aiursoft.cn/aiursoft/kahla.app/-/commits/master?ref_type=heads)
[![Maintainability](https://api.codeclimate.com/v1/badges/b7d4a3f5746bcbbe99c1/maintainability)](https://codeclimate.com/github/AiursoftWeb/Kahla.App/maintainability)
[![npm](https://img.shields.io/npm/v/kahla.svg?style=flat)](https://www.npmjs.com/package/kahla)
[![Issues](https://img.shields.io/github/issues/AiursoftWeb/Kahla.App.svg)](https://github.com/AiursoftWeb/Kahla.App/issues)
[![GitHub contributors](https://img.shields.io/github/contributors/AiursoftWeb/Kahla.App.svg?style=flat)](https://github.com/AiursoftWeb/Kahla.App/graphs/contributors)
[![LICENSE](https://img.shields.io/github/license/AiursoftWeb/Kahla.App)](https://github.com/AiursoftWeb/Kahla.App/blob/dev/LICENSE)

------

<p align="center">
<img src="https://ui.aiursoft.com/images/kahla-demo-wide2.png" alt="screenshot" width="1000"/>
</p>

Try it here: [web.kahla.app](https://web.kahla.app)

<a href='https://play.google.com/store/apps/details?id=com.aiursoft.kahla'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png' height="80" /></a><a href="https://www.microsoft.com/en-us/p/kahla/9pc6j2lz180m">
<img src="https://assets.windowsphone.com/85864462-9c82-451e-9355-a3d5f874397a/English_get-it-from-MS_InvariantCulture_Default.png" alt="English badge" height="60"></a>

Kahla currently targets Windows, Linux, macOS, Android, and iOS.

Kahla is built with Angular 8 and typescript. And [Kahla Server](https://github.com/AiursoftWeb/Kahla) is built with .NET Core.

For more document about Kahla project and Kahla API, please view document [here](https://wiki.aiursoft.com/ReadDoc/Kahla/What%20is%20Kahla.md).

For our official website, please view [here](https://www.kahla.app).

## How to develope

### Before starting

To develope Kahla, you need to install the following components:

* Git
* Nodejs and npm

We **strongly suggest** using [Visual Studio Code](https://code.visualstudio.com) to develope this project.

Using Visual Studio Code to open the directory directly.

## How to run

### How to run in browser

Excute following command in the root directory of this repository to restore all dependencies.

```bash
npm install
```

Excute following command to run and start a debugging server at `localhost:8001`.

```bash
npm start
```

### How to run as desktop app

**Currently Electron is out of support, we cannot g**

Currently, we are using [Electron](https://electron.atom.io/) to target Windows, Mac and Linux platform.

Supports Windows 7+, Linux and macOS 10.9+.

```bash
npm run electron
```

## How to publish

### How to publish to a web server

```bash
yarn run prod
```

### How to publish for electron production version

Please view [here](https://electron.atom.io/docs/tutorial/application-distribution/) for Electron distribution document.

Please view [here](https://www.electron.build/) for Electron builder document.

Run:

```bash
./publish.sh
```

And you will publish the distributable version of Kahla desktop.

## Document

For more info please view [Kahla Wiki](https://wiki.aiursoft.com/ReadDoc/Kahla/What%20is%20Kahla.md)

## How to contribute

There are many ways to contribute to the project: logging bugs, submitting pull requests, reporting issues, and creating suggestions.

Even if you have push rights on the repository, you should create a personal fork and create feature branches there when you need them. This keeps the main repository clean, and your personal workflow cruft out of sight.

We're also interested in your feedback for the future of this project. You can submit a suggestion or feature request through the issue tracker. To make this process more effective, we're asking that these include more information to help define them more clearly.
