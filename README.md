# Kahla

[![Build Status](https://travis-ci.org/AiursoftWeb/Kahla.App.svg?branch=master)](https://travis-ci.org/AiursoftWeb/Kahla.App)

Welcome to Kahla. Kahla is a cross platform bussiness messaging app.

Kahla currently targets Windows, Linux, macOS, Android, iOS, and Windows Mobile.

## How to develope

### Visual Studio Code

We **strongly suggest** using [Visual Studio Code](https://code.visualstudio.com/) to develope this project.

Using `Visual Studio Code` to open the directory directly.

### Visual Studio

Instead, you could open the project using [Visual Studio](https://www.visualstudio.com/). Before opening the project, please install `Mobile Development tool with JavaScript` for Visual Studio.

Double click `kahla.jsproj` to open it.

## How to run

### How to run in browser

Excute following command in the root directory of this repository.

* [npm install](https://yarnpkg.com/en/)
* [npm start](https://cli.angular.io/)

### How to run as desktop app

Currently we are using [Electron](https://electron.atom.io/) to target Windows, Mac and Linux platform.

Supports Windows 7+, Linux and macOS 10.9+.

* npm run electron

### How to run as mobile app

Currently we are using [Apache Cordova](https://cordova.apache.org/) to target Android and iOS platform.

Before running, please [prepare](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) your Android development environment and an Android device.

Run the following command.

* npm run android

## How to publish

### How to publish to a web server

* ng build --prod

If you want to create Chinese version, please use the following command instead.

* ng build --prod --local zh --i18n-file ./src/message.zh.xlf

### How to publish as Electron production version

Please view [here](https://electron.atom.io/docs/tutorial/application-distribution/) for Electron distribution document.

### How to publish as Cordova production version

Please view [here](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html) for Cordova distribution document.

## How to contribute

There are many ways to contribute to the project: logging bugs, submitting pull requests, reporting issues, and creating suggestions.

Even if you have push rights on the repository, you should create a personal fork and create feature branches there when you need them. This keeps the main repository clean and your personal workflow cruft out of sight.

We're also interested in your feedback for the future of this project. You can submit a suggestion or feature request through the issue tracker. To make this process more effective, we're asking that these include more information to help define them more clearly.