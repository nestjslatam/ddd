[![CI](https://github.com/Borewit/peek-readable/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/Borewit/peek-readable/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Borewit/peek-readable/actions/workflows/github-code-scanning/codeql/badge.svg?branch=master)](https://github.com/Borewit/peek-readable/actions/workflows/github-code-scanning/codeql)
[![NPM version](https://badge.fury.io/js/peek-readable.svg)](https://npmjs.org/package/peek-readable)
[![npm downloads](http://img.shields.io/npm/dm/peek-readable.svg)](https://npmcharts.com/compare/peek-readable?start=600&interval=30)
[![Coverage Status](https://coveralls.io/repos/github/Borewit/peek-readable/badge.svg?branch=master)](https://coveralls.io/github/Borewit/peek-readable?branch=master)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/d4b511481b3a4634b6ca5c0724407eb9)](https://www.codacy.com/gh/Borewit/peek-readable/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Borewit/peek-readable&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/Borewit/peek-readable/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Borewit/peek-readable?targetFile=package.json)

# peek-readable

A promise based asynchronous stream reader, which makes reading from a stream easy.

Allows to read and peek from a [Readable Stream](https://nodejs.org/api/stream.html#stream_readable_streams)

This module is used by [strtok3](https://github.com/Borewit/strtok3)

The `peek-readable` contains one class: `StreamReader`, which reads from a [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable).

- Class `StreamReader` is used to read from Node.js [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable).
- Class `WebStreamByobReader` is used to read from [ReadableStream<Uint8Array>](https://developer.mozilla.org/docs/Web/API/ReadableStream)

## Compatibility

Module: version 5 migrated from [CommonJS](https://en.wikipedia.org/wiki/CommonJS) to [pure ECMAScript Module (ESM)](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
JavaScript is compliant with [ECMAScript 2019 (ES10)](https://en.wikipedia.org/wiki/ECMAScript#10th_Edition_%E2%80%93_ECMAScript_2019).
Requires a modern browser or Node.js ≥ 18 engine.

For TypeScript CommonJs backward compatibility, you can use [load-esm](https://github.com/Borewit/load-esm).

## Usage

### Installation

```shell script
npm install --save peek-readable
```

## API Documentation

Both `StreamReader` and `WebStreamByobReader` implement the [IStreamReader interface](#istreamreader-interface).

### `IStreamReader` Interface

The `IStreamReader` interface defines the contract for a stream reader,
which provides methods to read and peek data from a stream into a `Uint8Array` buffer.
The methods are asynchronous and return a promise that resolves with the number of bytes read.

#### Methods

##### `peek` function
This method allows you to inspect data from the stream without advancing the read pointer.
It reads data into the provided Uint8Array at a specified offset but does not modify the stream's internal position, 
allowing you to look ahead in the stream.

```ts  
peek(buffer: Uint8Array, offset: number, length: number): Promise<number>
```

Parameters:
- `buffer`: `Uint8Array`: The buffer into which the data will be peeked.
  This is where the peeked data will be stored.
- `maybeBeLess`: If true, the buffer maybe partially filled.

Returns `Promise<number>`: 
A promise that resolves with the number of bytes actually peeked into the buffer. 
This number may be less than the requested length if the end of the stream is reached.

##### `read` function
```ts  
read(buffer: Uint8Array, offset: number, length: number): Promise<number>
```

Parameters:
- `buffer`: `Uint8Array`: The buffer into which the data will be read.
  This is where the read data will be stored.
- `maybeBeLess`: If true, the buffer maybe partially filled.

Returns `Promise<number>`:
A promise that resolves with the number of bytes actually read into the buffer.
This number may be less than the requested length if the end of the stream is reached.

##### `abort` function

Abort active asynchronous operation (`read` or `peak`) before it has completed.

```ts  
abort(): Promise<void>
```

## Examples

In the following example we read the first 16 bytes from a stream and store them in our buffer.
Source code of examples can be found [here](test/examples.ts).

```js
import fs from 'node:fs';
import { StreamReader } from 'peek-readable';

(async () => {
  const readable = fs.createReadStream('JPEG_example_JPG_RIP_001.jpg');
  const streamReader = new StreamReader(readable);
  const uint8Array = new Uint8Array(16);
  const bytesRead = await streamReader.read(uint8Array);;
  // buffer contains 16 bytes, if the end-of-stream has not been reached
})();
```

End-of-stream detection:
```js
(async () => {

  const fileReadStream = fs.createReadStream('JPEG_example_JPG_RIP_001.jpg');
  const streamReader = new StreamReader(fileReadStream);
  const buffer = Buffer.alloc(16); // or use: new Uint8Array(16);

  try {
    await streamReader.read(buffer);
    // buffer contains 16 bytes, if the end-of-stream has not been reached
  } catch(error) {
    if (error instanceof EndOfStreamError) {
      console.log('End-of-stream reached');
    }
  }
})();
```

With `peek` you can read ahead:
```js
import fs from 'node:fs';
import { StreamReader } from 'peek-readable';

function closeNodeStream(stream: ReadStream): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.close(err => {
      if(err)
        reject(err);
      else
        resolve();
    });
  })
}

(async () => {

  const fileReadStream = fs.createReadStream('JPEG_example_JPG_RIP_001.jpg');
  try {
    const streamReader = new StreamReader(fileReadStream);
    try {
      const buffer = Buffer.alloc(20);

      let bytesRead = await streamReader.peek(buffer.subarray(0, 3));
      if (bytesRead === 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        console.log('This is a JPEG file');
      } else {
        throw Error('Expected a JPEG file');
      }

      bytesRead = await streamReader.read(buffer); // Read JPEG header
      if (bytesRead === 20) {
        console.log('Got the JPEG header');
      } else {
        throw Error('Failed to read JPEG header');
      }
    } finally {
      await streamReader.close(); // Release fileReadStream
    }    
  } finally {
    await closeNodeStream(fileReadStream);
  }


})();
```

## Licence

This project is licensed under the [MIT License](LICENSE.txt). Feel free to use, modify, and distribute as needed.
