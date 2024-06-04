// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '*?lqip' {
	const lqip: {
		lqip: string;
		width: number;
		height: number;
		src: string;
	};
}

export { lqip };
