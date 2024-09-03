import { error, type RequestEvent } from '@sveltejs/kit';
import type { Session, User } from 'lucia';

import { api } from '$convex/_generated/api';
import { appHomeRoute } from '$lib/auth/routes';
import { client } from '$lib/convex';

export type PasswordLessUserData = {
	email: string;
	name?: string;
	username?: string;
	avatar?: string;
};

export async function passwordLessAuthHandler(
	event: RequestEvent,
	userData: PasswordLessUserData,
	provider: string = 'email'
) {
	const token = event.params.token;
	if (!token) return error(400, 'Login link is invalid');
	const { email, name, username, avatar } = userData;
	const data = await client.mutation(api.users.performPasswordLessLogin, {
		email,
		provider,
		name,
		username,
		avatar,
		token
	});

	const session = JSON.parse(data) as Session;

	return new Response(null, {
		status: 307,
		headers: {
			Location: appHomeRoute,
			'Set-Cookie': `session=${session.id}; path=/; expires=${new Date(session.expiresAt).toUTCString()};`
		}
	});
}
