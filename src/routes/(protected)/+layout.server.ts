import { redirect } from '@sveltejs/kit';

import { loginRoute } from '$lib/auth/routes';

import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async ({ locals: { session, user } }) => {
	console.log(`user ${user?.name} appeared.`, user);
	if (!session) {
		redirect(303, loginRoute);
	}

	return { session };
};
