// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { RegisteredDatabaseUserAttributes, Session, User } from 'lucia';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale: import('$lib/i18n/i18n-types.ts').Locales;
			user: (User & RegisteredDatabaseUserAttributes) | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
