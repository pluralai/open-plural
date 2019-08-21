/// <reference types="@types/segment-analytics" />
declare global {
	interface Window {
		analytics: SegmentAnalytics.AnalyticsJS;
	}
}
export interface SporInterface {
	initialize: (options?: InitializeOptions) => void;
	identify: (user: IdentifyOptions) => void;
	pageview: (page?: string, properties?: PageviewProperties) => void;
	track: (event: TrackingEvent) => TrackingEvent;
	getHistory: () => TrackingHistory | null;
}

export interface IdentifyOptions {
	name?: string;
	email: string;
}

export interface InitializeOptions {
	segment?: { key: string };
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

export interface PageviewProperties {
	[key: string]: unknown;
}

class Spor implements SporInterface {
	private history: TrackingHistory | null;
	private segment: SegmentAnalytics.AnalyticsJS | null;

	constructor() {
		this.history = null;
		this.segment = null;
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
	 * Spor.initialize();
	 * ```
	 *
	 * @see README.md for documentation on configuration options.
	 */
	public initialize(options?: InitializeOptions) {
		if (options && options.segment) {
			try {
				this.segment = window.analytics;
				this.segment.load(options.segment.key);
			} catch (error) {
				throw new Error(error);
			}
		}

		this.history = {
			...options,
			events: [],
		};
	}

	/**
	 * Use this function to identify the user that you are creating a tracking
	 * history for.
	 *
	 * @param user The user to identify and attach to the tracking history
	 *
	 * @example
	 * ```
	 * import Spor from '@pluralai/spor';
	 *
	 * Spor.identify({
	 *   name: 'Elon Musk',
	 *   email: 'musk@spacex.com',
	 * });
	 * ```
	 */
	public identify(user: IdentifyOptions) {
		if (!this.history) {
			throw new Error(
				'It looks like you forgot to initialize analytics before using it.'
			);
		} else if (!user) {
			throw new Error('You need to supply a user to the identify method');
		}

		if (this.segment) {
			this.segment.identify(user);
		}

		this.history['user'] = user.email;
	}

	/**
	 * Use this function on each page you want to register a view. The function
	 * takes a 'page' parameter which is used as the page label and a 'properties'
	 * object where you can attach extra information about the page.
	 *
	 * @param page The page you want to register a view to
	 * @param properties Optional properties to attach about the page viewed
	 *
	 * @example
	 * ```
	 * import Spor from '@pluralai/spor';
	 *
	 * Spor.pageview('INGREDIENT', {
	 *   url: '/ingredient/trout',
	 *   name: 'trout',
	 * });
	 * ```
	 */
	public pageview(page?: string, properties?: PageviewProperties) {
		let segmentProperties: PageviewProperties = {};

		if (!properties || !properties['url']) {
			segmentProperties['url'] = window.location.href;
		}

		this.segment && this.segment.page(page, properties);
	}

	/**
	 * Use this function to track events as they occur. The function takes a data
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
			throw new Error(
				'It looks like you forgot to initialize analytics before using it.'
			);
		} else if (!event.type && typeof event.type !== 'string') {
			throw new Error("The 'type' parameter was not provided");
		}

		if (this.segment) {
			this.segment.track(event.type, event);
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
