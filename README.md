![KahlaLogo](./src/assets/144x144.png)

# Kahla

[![Build status](https://aiursoft.visualstudio.com/Star/_apis/build/status/Kahla%20App%20Build)](https://aiursoft.visualstudio.com/Star/_build/latest?definitionId=4)

Welcome to Kahla. Kahla is a cross-platform business messaging app. Kahla also achieved one target to use one copy of code and target all platforms.

<img src="https://ui.cdn.aiursoft.com/images/kahla-demo.png" alt="screenshot" width="500"/>

Try it here: [web.kahla.app](https://web.kahla.app)

<a href='https://play.google.com/store/apps/details?id=com.aiursoft.kahla'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png' height="80" /></a><a href="//www.microsoft.com/store/apps/9PC6J2LZ180M?cid=storebadge&amp;ocid=badge">
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

Excute following command to run and start a debug server at `localhost:8001`.

```bash
npm start
```

### How to run as desktop app

Currently we are using [Electron](https://electron.atom.io/) to target Windows, Mac and Linux platform.

Supports Windows 7+, Linux and macOS 10.9+.

```bash
npm run electron
```

## How to publish

### How to publish to a web server

```bash
ng build --prod
```

If you want to create Chinese version, please use the following command instead.

```bash
ng build --prod --local zh --i18n-file ./src/message.zh.xlf
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

Even if you have push rights on the repository, you should create a personal fork and create feature branches there when you need them. This keeps the main repository clean and your personal workflow cruft out of sight.

We're also interested in your feedback for the future of this project. You can submit a suggestion or feature request through the issue tracker. To make this process more effective, we're asking that these include more information to help define them more clearly.
