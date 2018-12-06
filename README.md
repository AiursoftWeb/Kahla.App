# Kahla

[![Build status](https://aiursoft.visualstudio.com/Kahla/_apis/build/status/Kahla.App%20CI)](https://aiursoft.visualstudio.com/Kahla/_build/latest?definitionId=9)

Welcome to Kahla. Kahla is a cross-platform business messaging app. Kahla also achieved one target to use one copy of code and target all platforms.

![screenshot](https://oss.aiursoft.com/ColossusPublic/d505f40c7f6943bda7f2106673f27140.png?w=1440&h=875)

![KahlaLogo](./src/assets/144x144.png)

Kahla currently targets Windows, Linux, macOS, Android, iOS, and Windows Mobile.

Kahla is built with Angular 5 and typescript. And Kahla Server is built with ASP.Net Core.

For more document about Kahla project and Kahla API, please view document [here](https://wiki.aiursoft.com/ReadDoc/Kahla/What%20is%20Kahla.md).

For our official website, please view [here](https://kahla.aiursoft.com).

## How to develope

### Before starting

To develope Kahla, you need to install the following components:

* Git
* Nodejs and npm

We **strongly suggest** using [Visual Studio Code](https://code.visualstudio.com/) to develope this project.

Use `Visual Studio Code` to open the directory directly.

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

### How to run as mobile app

Currently we are using [Apache Cordova](https://cordova.apache.org/) to target Android and iOS platform.

Before running, please [prepare](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) your Android development environment and an Android device.

Run the following command to install Apache Cordova.

```bash
npm i -g cordova
cordova platform add android
```

Run the following command to run on a Android device.

```bash
cordova run android
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

### How to publish as Electron production version

Please view [here](https://electron.atom.io/docs/tutorial/application-distribution/) for Electron distribution document.

Please view [here](https://www.electron.build/) for Electron builder document.

Run:

```bash
./publish.sh
```

And you will publish the distributable version of Kahla desktop.

### How to publish as Cordova production version

Please view [here](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) for Cordova distribution document.

## Document

For more info please view [Kahla Wiki](https://wiki.aiursoft.com/ReadDoc/Kahla/What%20is%20Kahla.md)

## How to contribute

There are many ways to contribute to the project: logging bugs, submitting pull requests, reporting issues, and creating suggestions.

Even if you have push rights on the repository, you should create a personal fork and create feature branches there when you need them. This keeps the main repository clean and your personal workflow cruft out of sight.

We're also interested in your feedback for the future of this project. You can submit a suggestion or feature request through the issue tracker. To make this process more effective, we're asking that these include more information to help define them more clearly.
