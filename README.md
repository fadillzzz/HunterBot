# HunterBot

## Configuration

Copy the `config.json.sample` file as `config.json` (save in `src`) and fill out the JSON attributes.

| Attribute      | Required | Description                |
| -------------- | -------- | -------------------------- |
| `token`        | Y        | Login token                |
| `avatar`       | N        | Path to bot avatar         |
| `dbConnection` | Y        | Database connection string |

## Build

Use Yarn to install the packages and run the following command:

`yarn build`

By default the output directory is set to `./build`.

## Dev

Use the following command to rebuild every time the source changes:

`yarn dev`

## Testing

Try to write as many tests as you can, then run them with the following command:

`yarn test`

## To Do

-   Add more unit tests
-   Refactor stuff added from Database support
-   Standardize syntax using a constructor object?
-   Guild cards maybe?
