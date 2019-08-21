import Spor, { TrackingEvent, TrackingHistory } from '../src/spor';

describe('track', () => {
	it('throws when not initialized', async () => {
		const data = {
			type: 'TOKEN_SELECTED',
			data: {
				token: 'Aviation Engineering',
				index: 2,
				typed: 'Avi',
			},
			timestamp: new Date().toLocaleString(),
		};

		expect(() => Spor.track(data)).toThrowError();
	});

	it('throws when no type is supplied', () => {
		const data = {
			data: {
				token: 'Aviation Engineering',
				index: 2,
				typed: 'Avi',
			},
			timestamp: new Date(),
		};

		// @ts-ignore
		expect(() => Spor.track(data)).toThrowError();
	});

	it('throws when bad type is supplied', () => {
		const data = {
			type: 1234,
			data: {
				token: 'Aviation Engineering',
				index: 2,
				typed: 'Avi',
			},
			timestamp: new Date(),
		};

		// @ts-ignore
		expect(() => Spor.track(data)).toThrowError();
	});

	it('correctly initializes, identifies, tracks, and get history', () => {
		Spor.initialize({
			environment: 'staging',
		});

		Spor.identify({
			name: 'Elon Musk',
			email: 'elon@spacex.com',
		});

		const event: TrackingEvent = {
			type: 'TOKEN_SELECTED',
			data: {
				token: 'Aviation Engineering',
				index: 2,
				typed: 'Avi',
			},
			timestamp: new Date().toLocaleString(),
		};

		const expectedHistory: TrackingHistory = {
			user: 'elon@spacex.com',
			environment: 'staging',
			events: [event],
		};

		Spor.track(event);

		expect(Spor.getHistory()).toStrictEqual(expectedHistory);
	});
});
