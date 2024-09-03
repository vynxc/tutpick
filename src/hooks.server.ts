import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { Session, User } from 'lucia';
import { initAcceptLanguageHeaderDetector } from 'typesafe-i18n/detectors';

import { api } from '$convex/_generated/api';
import { client } from '$lib/convex';
// import { protectRoutes } from '$lib/auth/middlewares';
import { detectLocale } from '$lib/i18n/i18n-util.js';

async function urlRewrite({ event, resolve }) {
	if (event.url.pathname.match(/[A-Z]/)) {
		throw redirect(302, event.url.pathname.toLowerCase());
	}

	return resolve(event);
}

async function i18n({ event, resolve }) {
	const acceptLanguageHeaderDetector = initAcceptLanguageHeaderDetector(event.request);
	const locale = detectLocale(acceptLanguageHeaderDetector);
	event.locals.locale = locale;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});
}

export const auth: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');

	if (!sessionCookie) return await resolve(event);

	const sessionJson = await client.query(api.users.getSession, { sessionId: sessionCookie });

	const session = JSON.parse(sessionJson) as { user: User | null; session: Session | null };

	event.locals.user = session.user;
	event.locals.session = session.session;

	return await resolve(event);
};

export const handle = sequence(urlRewrite, i18n, auth) satisfies Handle;
