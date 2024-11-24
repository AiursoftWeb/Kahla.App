module.exports = {
	globDirectory: './dist/browser',
	globPatterns: [
		'**/*.{png,icns,js,ico,html,json,ttf,woff2,txt,css,config}'
	],
	swDest: 'dist/browser/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/,
	],
	importScripts: [
		'./sw_notifications.js'
	],
	sourcemap: false,
	cleanupOutdatedCaches: true,
	navigateFallback: '/index.html',
	navigateFallbackDenylist: [
		/^\/api\//
	]
};