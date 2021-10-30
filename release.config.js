module.exports = {
	branches: [
		'main'
	],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		[
			'@semantic-release/changelog',
			{
				changelogFile: 'CHANGELOG.md'
			}
		],
		["@semantic-release/npm", {
			"pkgRoot": "dist",
		}],
		'@semantic-release/github',
		[
			'@semantic-release/git',
			{
				assets: ['package.json', 'package-lock.json', 'CHANGELOG.md', 'README.md', 'dist/**', 'docs/**'],
				message: 'chore(release): set `package.json` to ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
			}
		]
	]
}
