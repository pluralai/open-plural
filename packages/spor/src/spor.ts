export interface SporInterface {
	track: (event: TrackingEvent) => TrackingEvent;
	initialize: (options?: InitializeOptions) => void;
	getHistory: () => TrackingHistory | null;
}

export interface InitializeOptions {
	[key: string]: unknown;
}

export interface TrackingHistory {
	user?: string;
	environment?: string;
	events: TrackingEvent[] | [];
}

export interface TrackingEvent {
	type: string;
	data?: TrackingEventData;
	timestamp?: string;
}

export interface TrackingEventData {
	[key: string]: unknown;
}

class Spor implements SporInterface {
	private history: TrackingHistory | null;

	constructor() {
		this.history = null;
	}

	/**
	 * To use this library, call the "initialize" function as early as possible
	 * in the main entry module. To track events or get the history,
	 * use the provided methods.
	 *
	 * @param options The initialization options
	 *
	 * @example
	 * ```
	 * import Spor from '@pluralai/spor';
	 *
	 * Spor.init();
	 * ```
	 *
	 * @see README.md for documentation on configuration options.
	 */
	public initialize(options?: InitializeOptions) {
		this.history = {
			...options,
			events: [],
		};
	}

	/**
	 * Use this method to track events as they occur. The function takes a data
	 * object and pushes it to the history.
	 *
	 * @param event The data for the event to track
	 *
	 * You can track event with no associated data
	 *
	 * @example
	 * ```
	 * import Spor from '@pluralai/spor';
	 *
	 * Spor.track({ type: 'SOME_EVENT });
	 * ```
	 *
	 * Or you can track it with optional data and timestamp
	 *
	 * @example
	 * ```
	 * import Spor from '@pluralai/spor';
	 *
	 * Spor.track({
	 *   type: 'EVENT_TYPE',
	 *   data: {
	 *     someKey: 'someValue',
	 *     // ...
	 *   }
	 *   timestamp: new Date(),
	 * });
	 * ```
	 *
	 * @see README.md for documentation on data options.
	 */
	public track(event: TrackingEvent) {
		if (!this.history) {
			const error = new Error(
				'It looks like you forgot to initialize analytics before using it.'
			);
			throw error;
		} else if (!event.type && typeof event.type !== 'string') {
			const error = new Error("The 'type' parameter was not provided");
			throw error;
		}

		this.history.events = [...this.history.events, event];
		return event;
	}

	/**
	 * Use to get accesses to the history of tracked events.
	 *
	 * @see README.md for documentation on the history data structure.
	 */
	public getHistory() {
		return this.history;
	}
}

export default new Spor();
