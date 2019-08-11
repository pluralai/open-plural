# spor

- [Getting Started](#getting-started)
- [Usage](#usage)
- [Documentation](#documentation)
  - [`initialize`](#initialize)
  - [`track`](#track)
  - [`getHistory`](#gethistory)
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

To ensure that no tracking information is lost, this could be done by adding a listener on the browsers `unload` event and then getting the history.

```ts
import Spor from 'spor';

window.addEventListener('unload', () => {
	const history = Spor.getHistory();

	// Save to a database of your choice
	saveHistory(history);
});
```

## Documentation

The `Spor` class implements the `SporInterface` and exposes a set of functions to initialize, track and store tracking data:

```ts
interface SporInterface {
	track: (event: TrackingEvent) => TrackingEvent;
	initialize: (options?: InitializeOptions) => void;
	getHistory: () => TrackingHistory | null;
}
```

### `initialize`

The `initialize` function is used to initialize the module and set up the internal history. As seen by the function alias, it takes an optional `options` object of type `InitializeOptions`.

```ts
interface InitializeOptions {
	[key: string]: unknown;
}
```

The options is typed with with an index signature allowing you to add whatever information you want to the root of the tracked history. Cannot be changed after the initialization.

The simplest way to initialize the module is to call it without any options:

```ts
Spor.initialize();
```

To attach additional information to the root of the tracking history, for example about the which user performed the action and what environment the event was tracked within, simply pass it to the `initialize`:

```ts
Spor.initialize({
	user: '5201830',
	environment: 'production',
});

// {
// 	 user: '5201830',
// 	 environment: 'production',
// 	 data: [],
// }
```

### `track`

The `track` function is used to track an event and add it to the tracking history. The functions accepts an object, which describes the event, as an argument. The `event` objects type is `TrackingEvent` which requires a `type` of event to be set. The `type` should be a reusable string used to group type of events together. If you need to distinguish between different tracked events, you should add the nested `data` object with that information.

```ts
interface TrackingEvent {
	type: string;
	data?: TrackingEventData;
	timestamp?: string;
}
```

Apart from requiring an event `type`, the `event` object take an optional `timestamp` and nested `data` object. The nested `data` object is of type `TrackingEventData` which is structured as a index signature with an `unknown` value, meaning you can store any key-value pair.

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
	user: '320340',
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

## Issues

If any issues occur using this library, please fill out a detailed bug report on [GitHub](https://github.com/pluralai/open-plural/issues).

If you want to take a stab at solving the issue yourself, check out the [Contributing](https://github.com/pluralai/open-plural/blob/master/CONTRIBUTING.md) document on how to get started.
