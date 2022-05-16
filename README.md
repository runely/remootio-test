# Remootio Test

## Setup

1. Create a `.env` file
```text
IP=<ip-address-of-you-Remootio-device>
SECRET_KEY=<secret-key>
AUTH_KEY=<auth-key>
```
1. Run `npm i` to install dependencies
1. Run `node index.js` to start the project. This will connect to your Remootio device and when connected and authenticated, it will fire away `5` **open**/**close** commands with *500ms* apart.
