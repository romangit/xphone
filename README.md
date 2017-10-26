# XPhone.js

> The JS library for develop WebSocket/WebRTC phone apps based on lirax.ua (Phone Cloud System)


## Installation

In a browser:
```html
<script src="dist/xphone.js"></script>
```

Using npm:
```shell
npm install xphone --save
```

## Usage

```js
import XPhone from 'xphone'

/* Initialization */
let phone = new XPhone(); 

/* Call to echo-test */
phone.onOpen = () => {
  phone.makeCall("200");
};

/* Connection closed */
phone.onClose = () => console.log("Connection closed");

/* Icomming call */
phone.onCreate = call => {
  if (call.type === phone.INCOMING) {
    setTimeout(() => phone.acceptCall(call.line), 3000);
  }
};

/* Handling errors */
phone.onError = error => console.log("error", error);

/* Change the call parameters */
phone.onChange = call => {
  console.log("change", call);
};

/* Destroying the call */
phone.onDestroy = call => {
  console.log("destroy", call);
};

/* Authorization to LiraX */
phone.init({
  login: "1011011",
  password: "mypassword"
});
```

## Build Setup

```shell
# copy config file
cp .env.example.js .env.js

# install dependencies
npm install

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run all tests
npm test
```

## Tests

```shell
npm test
```
  
## Support

Tested in Chrome 54-55, Firefox 49-50


## Release History

* 1.0.0 Initial release