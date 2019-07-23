# HunterBot

## Configuration

Copy the `config.json.sample` (in `src`) file as `config.json` and fill out the JSON attributes, with the most important ones being `loginToken`, `listenChannel`, and `postHubChannel`.

| Attribute        | Required | Description                                               |
| ---------------- | -------- | --------------------------------------------------------- |
| `token`          | Y        | Login token                                               |
| `prefix`         | N        | Command prefix                                            |
| `listenChannel`  | Y        | Text channel where the bot will be listening for commands |
| `postHubChannel` | Y        | Text channel where hub will be posted                     |
| `avatar`         | N        | Path to bot avatar                                        |
| `timer`          | N        | Timer (in seconds) for hub deletion                       |

## Build

Use Yarn to install the packages and run the following command:

`yarn run build`

By default the output directory is set to `./build`.

## To Do

-   Post Hubs to different channels depending on the Game & Platform
-   Database support
-   Guild cards maybe?
