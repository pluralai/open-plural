# spor

- [Getting Started](#getting-started)
- [Usage](#usage)
- [Documentation](#documentation)
  - [`initialize`](#initialize)
  - [`track`](#track)
  - [`getHistory`](#gethistory)
  - [`terminate`](#terminate)
- [Issues](#issues)

## Getting Started

This module is distributed with [npm](https://www.npmjs.com) which is bundled with [node](https://nodejs.org) and should be installed as one of your project's `dependencies`:

```shell
npm install --save @pluralai/spor
```

or using [yarn](https://yarnpkg.com/):

```shell
yarn add @pluralai/spor
```

This library carries no `dependencies` or `peerDependencies` allowing it to leave almost no trace on your bundle size.

## Usage

To use this library, call `Spor.initialize(options)` as early as possible after loading the page. This will initialize the library and hook into the environment.

```ts
import Spor from '@pluralai/spor';

Spor.initialize();
```

To track events or inspect the tracking history, use the exported functions. Note that these functions will not perform any actions before you have called `Spor.initialize()`:

```ts
import Spor, { TrackingData } from 'spor';

// Construct the tracking data
const data: TrackingData = {
	type: 'TOKEN_SELECTED',
	data: {
		token: 'Aviation Engineering',
		index: 2,
		typed: 'Avi',
	},
	timestamp: new Date(),
};

// Track the event
Spor.track(data);
```

If you need to inspect the tracking history from the current session, you can get read-only access to the tracking history by invoking the `getHistory()` function.

```ts
import Spor from 'spor';

// Create a connection for a specific user
Spor.initialize({
	user: '8762357',
	environment: 'staging',
});

// Track an event
Spor.track({
	type: 'SOME_EVENT',
	data: {
		message: 'Important event',
		trigger: 'Very important button',
	},
});

const history = Spor.getHistory();

// {
//   user: '8762357',
//   environment: 'staging',
//   data: [
//     {
//       type: 'SOME_EVENT',
//       data: {
//         message: 'Important event',
//         trigger: 'Very important button',
//       },
//     },
//   ],
// }
```

When a user is done with their interaction and ends their session, the tracking history can be retrieved and stored in using whatever medium you are working with.

To ensure that no tracking information is lost, this could be done by adding a listener on the browsers `unload` event and then triggering the `terminate()` function:

```ts
import Spor from 'spor';

window.addEventListener('unload', () => Spor.terminate());
```

The function then purges the initializeialization options and tracking history, allowing it to be re-initialized the next time the user starts a session.

## Documentation

The `Spor` class implements the `SporInterface` and exposes a set of functions to initialize, track and store tracking data:

```ts
SporInterface {
	initialize: (options: SporOptions) => Promise<boolean>;
	track: (data: TrackingOptions) => void;
	getHistory: () => TrackingInterface | null;
	dispatchAndClose: () => Promise<TrackingResponse>;
}
```

### `initialize`

The `initialize` function is used to initialize the SDK and set up the internal history and mongo connector. As seen by the function alias, it takes an `options` object of type `SporOptions`.

```ts
SporOptions {
  userID?: number;
  environment?: 'staging' | 'production';
  connection: string;
}
```

`SporOptions` requires at the minimum a `connection` string which is used to initialize the mongo connector. It optionally contains a `environment` used to denote which in which cluster the data was tracked, and a `userID` which is a unique identifier used to tie different tracked sessions together around the same user.

The function returns a `Promise` which resolves to `true` if the initializeialization succeeds, or gets rejected with the error if one occurs. This means that you can `await` the function if you need access to it immediately after calling it.

The simplest way to initialize the SDK is to just provide the `connection` string:

```ts
Spor.initialize({ connection: 'mongodb://127.0.0.1:27017' });
```

To attach the information about the which user performed the search, simply attach it to the `initialize`:

```ts
Spor.initialize({
	connection: 'mongodb://127.0.0.1:27017',
	userID: 5201830,
	environment: 'production',
});
```

### `track`

The `track` function is used to track an event and add it to the tracking history. The functions accepts an object, which describes the event, as an argument. The `data` objects type is `TrackingOptions` which requires a `type` of event to be set. The `type` should be a reusable string used to group type of events together. If you need to distinguish between different tracked events, you should add the nested `data` object with that information.

```ts
TrackingOptions {
	type: string;
	data?: TrackingData;
	timestamp?: Date;
}
```

Apart from requiring an event `type`, the `data` object take an optional `timestamp` and nested `data` object. The nested `data` object is of type `TrackingData` which is structured as a index signature with an `unknown` value, meaning you can store any key-value pair.

The simplest way to track an event is with no associated data, only setting the `type`:

```ts
Spor.track({ type: 'PRODUCT_CLICK' });
```

If you wanted to attach information about exactly what product was clicked, you can supply that information in the nested `data` object:

```ts
Spor.track({
	type: 'PRODUCT_CLICKED',
	data: {
		name: 'Salmon',
		price: '£12.4',
		quantity: '100g',
	},
	timestamp: 'Fri Aug 09 2019 10:48:55 GMT+0100',
});
```

### `getHistory`

In case you need access to the sessions tracking history, a snapshot of the data can be read by calling the `getHistory` function. The history is passed by value and is therefore read-only. If you need to add event to the history, you should use the [`track`](#track) method.

```ts
const history = Spor.getHistory();
```

The schema for the history is JSON compliant, making it easy to store and render. As an example, you can imagine a few different events have been tracked during the session. The history is of type `TrackingHistory` and will look like this:

```ts
{
	userID: 320340,
	environment: 'production',
	data: [
		{
			type: 'SEARCH_FOCUSED',
			timestamp: 'Fri Aug 02 2019 18:10:58 GMT+0100',
		},
		{
			type: 'TOKEN_SELECTED',
			data: {
				token: 'Aviation Engineering',
				index: 2,
				typed: 'Avi',
			},
			timestamp: 'Fri Aug 02 2019 18:11:28 GMT+0100',
		},
		{
			type: 'TOKEN_SELECTED',
			data: {
				token: 'Turnover',
				index: 0,
				typed: 'Turn',
				range: '£2m+',
			},
			timestamp: 'Fri Aug 02 2019 18:11:34 GMT+0100',
		},
		{
			type: 'SEARCH_EXECUTED',
			timestamp: 'Fri Aug 02 2019 18:11:36 GMT+0100',
		},
		{
			type: 'COMPANY_SELECTED',
			data: {
				companyIdentifier: '3256197',
				index: 5
			},
			timestamp: 'Fri Aug 02 2019 18:11:52 GMT+0100',
		},
	],
}
```

### `dispatchAndClose`

When the user session ends, the tracking history should be cleared and all connections purged to ensure that one session is isolated from another. This also means that you want to store the result in the database before clearing it. The `dispatchAndClose` function does exactly this.

```ts
Spor.dispatchAndClose();
```

Calling the above snippet at the end of a user session will dispatch the tracking history to the mongo database determined by the `connection` string from the [`initialize`](#initialize) function.

## Issues

If any issues occur using this library, please fill out a detailed bug report on [Clubhouse](https://app.clubhouse.io/pluralai/stories) by arrow next to the "Create Story" button and selecting the "new bug" template under the "Web app".

If you can solve the issue yourself, check out the [Contributing](https://github.com/pluralai/plural-app/blob/develop/CONTRIBUTING.md) document on how to get started developing on platform and how to submit your proposed updates.

You can always contact [michael@plural.ai](mailto:michael@plural.ai) in case you have any questions.
