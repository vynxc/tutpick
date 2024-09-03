import { ConvexError, v } from 'convex/values';
import { generateIdFromEntropySize } from 'lucia';

import { Id } from './_generated/dataModel';
import { mutation } from './_generated/server';
import { mutationWithAuth, queryWithAuth } from './auth/withAuth';

export const getSession = queryWithAuth({
	args: {},
	handler: async (ctx) => {
		return JSON.stringify(ctx.userSessionContext);
	}
});

export const sendEmailLoginLink = mutation({
	args: {
		email: v.string()
	},
	handler: async (ctx, args) => {
		const token = generateIdFromEntropySize(32);
		const siteUrl = process.env.SITE_URL;
		const getMagicLink = (id: Id<'tokens'>) =>
			`${siteUrl}/auth/email-sign-in/${token}?id=${id}&email=${encodeURIComponent(args.email)}`;

		const existingToken = await ctx.db
			.query('tokens')
			.withIndex('byEmail', (q) => q.eq('email', args.email))
			.unique();

		if (existingToken) {
			await ctx.db.delete(existingToken._id);
		}

		const newTokenId = await ctx.db.insert('tokens', {
			email: args.email,
			token,
			expires_at: Date.now() + 1000 * 60 * 60
		});

		if (!newTokenId) {
			throw new ConvexError('Failed to create token');
		}

		const magicLink = getMagicLink(newTokenId);

		return { magicLink };
	}
});

export const performPasswordLessLogin = mutationWithAuth({
	args: {
		email: v.string(),
		token: v.string(),
		provider: v.string(),
		name: v.optional(v.string()),
		username: v.optional(v.string()),
		avatar: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Validate email format
		if (!args.email.includes('@')) {
			throw new ConvexError('Invalid email format');
		}

		// Check if the token is valid and not expired
		const tokenRecord = await ctx.db
			.query('tokens')
			.withIndex('byToken', (q) => q.eq('token', args.token))
			.unique();

		if (!tokenRecord || tokenRecord.expires_at < Date.now()) {
			throw new ConvexError('Token is invalid or expired');
		}

		const existingUser = await ctx.db
			.query('users')
			.withIndex('byEmail', (q) => q.eq('email', args.email))
			.unique();

		if (!existingUser) {
			throw new ConvexError('User not found');
		}

		const session = await ctx.auth.createSession(existingUser._id, {});

		const existingAccount = await ctx.db
			.query('accounts')
			.withIndex('byProviderUser', (q) =>
				q.eq('provider', args.provider).eq('user_id', existingUser._id)
			)
			.unique();

		if (!existingAccount) {
			await ctx.db.insert('accounts', {
				provider: args.provider,
				user_id: existingUser._id
			});
		}

		await ctx.db.delete(tokenRecord._id);

		return JSON.stringify(session);
	}
});
