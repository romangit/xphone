# XPhone.js

> The JS library for develop WebSocket/WebRTC phone apps based on lirax.net (Phone Cloud System)


## Download

[Full build](https://cdn.jsdelivr.net/npm/xphone@latest/dist/xphone.js)


## Installation

In a browser:
```html
<script src="dist/xphone.js"></script>
```

CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/xphone@latest/dist/xphone.js"></script>
```

Using npm:
```shell
npm install xphone --save
```

## Usage

### Initialization

ES6 
```js
import XPhone from 'xphone';
```

### Make calls

```js
/* Initialization */
const phone = new XPhone(); 

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

Tested in Chrome 54-61, Firefox 49-56

## Documentation

### Instance Methods

#### init(credentials)
Connection to the service

*Parameters*

| Name                 | Type   | Description                        |
|----------------------|--------|------------------------------------|
| credentials          | Object | Object with parameters (see below) |
| credentials.login    | String | SIP number                         |
| credentials.password | String | SIP password                       |

*Example*

```js
phone.init({
  login: '1111111',
  password: 'secret_password',
});
```

#### close()
Close the connection

*Example*

```js
phone.close();
```

#### isOpen()
Check the connection

*Returns*

| Type    | Description                                                      |
|---------|----------------------------------------------------------------- |
| Boolean | true if the WebSocket connection is established, false otherwise |

*Example*

```js
phone.isOpen() && console.log('Connection established');
```

#### makeCall(phoneNumber)
Make a call

*Parameters*

| Name                 | Type   | Description    |
|----------------------|--------|--------------- |
| phoneNumber          | String | A Phone Number |

*Returns*

| Type    | Description        |
|---------|------------------- |
| Integer | The number of line |

*Example*

```js
let line = phone.makeCall('380442388744');
```

#### finishCall(line)
Hungup a call

*Parameters*

| Name          | Type    | Description        |
|---------------|---------|--------------------|
| line          | Integer | The number of line |

*Example*

```js
let line = phone.makeCall('380442388744');
setTimeout(() => phone.finishCall(line), 10000);
```

#### acceptCall(line)
Accept a call

*Parameters*

| Name          | Type    | Description        |
|---------------|---------|--------------------|
| line          | Integer | The number of line |


*Example*

```js
phone.onCreate = call => {
  if (call.type === phone.INCOMING) {
    setTimeout(() => phone.acceptCall(call.line), 10000);
  }
};
```

#### sendDTMF(line, symbol)
Send a DTMF

*Parameters*

| Name          | Type    | Description                                     |
|---------------|---------|-------------------------------------------------|
| line          | Integer | The number of line                              |
| symbol        | String  | The symbol 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, *, #   |

*Example*

```js
phone.onCreate = call => {
  setTimeout(() => {
    phone.sendDTMF(call.line, '5');
    phone.sendDTMF(call.line, '7');
    phone.sendDTMF(call.line, '9');
    phone.sendDTMF(call.line, '#');
  }, 5000);
};
```

#### holdCall(line)
Hold a call

*Parameters*

| Name          | Type    | Description        |
|---------------|---------|--------------------|
| line          | Integer | The number of line |

*Example*

```js
phone.onCreate = call => {
  const line = call.line;
  setTimeout(() => phone.holdCall(line), 10000);
};
```

#### conferenceCall(line)
Enable conferencing mode

*Parameters*

| Name          | Type    | Description        |
|---------------|---------|--------------------|
| line          | Integer | The number of line |

*Example*

```js
phone.onCreate = call => {
  const line = call.line;
  setTimeout(() => phone.conferenceCall(line), 3000);
};
```

#### forwardCall(line)
Enable redirection mode

*Parameters*

| Name          | Type    | Description        |
|---------------|---------|--------------------|
| line          | Integer | The number of line |

*Example*

```js
// Call forwarding 380442388744 to 380442388745
const lineFoo = phone.makeCall('380442388744');
const lineBar = phone.makeCall('380442388745');

setTimeout(() => {
  phone.forwardCall(lineFoo);
  phone.forwardCall(lineBar);
}, 5000);
```

#### getCalls()
Returns the array of all active calls

*Returns*

| Type      | Description        |
|-----------|--------------------|
| Array     | The Array of calls |

*Example*

```js
console.log(phone.getCalls());
```
### Events

#### onOpen()
Connection is established

*Example*

```js
phone.onOpen = () => console.log('Connection is established');
```

#### onClose()
Connection is closed

*Example*

```js
phone.onClose = () => console.log('Connection is closed');
```

#### onError(error)
Application error

*Parameters*

| Name           | Type   | Description         |
|----------------|--------|---------------------|
| error          | Object | The Error message   |

*Example*

```js
phone.onError = error => console.log(error);
```

#### onCreate(call)
The call is created

*Parameters*

| Name             | Type    | Description                                                                    |
|------------------|---------|--------------------------------------------------------------------------------|
| call             | Object  | The Object with call properties (see below)                                    |
| call.line        | Integer | The number of line                                                             |
| call.startDate   | Object  | The date of start call                                                         |
| call.connectDate | Object  | The date of connection call                                                    |
| call.phoneNumber | String  | The phone number                                                               |
| call.type        | Integer | The type of call (0 - incoming, 1 - outgoing)                                  |
| call.hold        | Boolean | The hold mode of call, true if the hold mode is enabled, false otherwise       |
| call.conference  | Boolean | The conference mode of call, true if the hold mode is enabled, false otherwise |
| call.forward     | Boolean | The forward mode of call, true if the hold mode is enabled, false otherwise    |
| call.file        | String  | Link to the voice file                                                         |

*Example*

```js
phone.onCreate = call => {
  console.log(call);
};
```

#### onChange(call)
The properties of the call have changed

*Parameters*

| Name             | Type    | Description                                                                    |
|------------------|---------|-------------------------------------------------------|
| call             | Object  | The Object with call properties (see onCreate event)  |

*Example*

```js
phone.onChange = call => {
  console.log(call);
};
```

#### onDestroy(call)
Call ended

*Parameters*

| Name             | Type    | Description                                                                    |
|------------------|---------|-------------------------------------------------------|
| call             | Object  | The Object with call properties (see onCreate event)  |

*Example*

```js
phone.onDestroy = call => {
  console.log(call);
};
```

### Instance Variables

#### wsURL
(String) The URL to which to connect, Default: 'wss://lirax***:1887'

*Example*

```js
phone.wsURL = 'wss://test.com:1887';
```

#### callOut
(String) External number, Default: ''

*Example*

```js
phone.callOut = '380001234567';
```

#### reConnect
(Boolean) Automatic reconnection when disconnected, Default: true

*Example*

```js
phone.reConnect = false;
```

## Official Site

[http://www.lirax.net](http://www.lirax.net)
