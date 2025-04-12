export const extendConfig = [
	'semantic-release-npm-github-publish',
];
export const branches = [
	{ name: 'main', channel: 'latest', range: 'main' },
];
export const plugins = [
	[
		"@semantic-release/commit-analyzer",
		{
			"releaseRules": [
				{
					"type": "build",
					"release": "patch"
				},
				{
					"type": "ci",
					"release": "patch"
				},
				{
					"type": "chore",
					"release": "patch"
				},
				{
					"type": "docs",
					"release": "patch"
				},
				{
					"type": "refactor",
					"release": "patch"
				},
				{
					"type": "style",
					"release": "patch"
				},
				{
					"type": "test",
					"release": "patch"
				},
				{
					"type": "feat",
					"release": "minor"
				},
				{
					"type": "fix",
					"release": "patch"
				},
				{
					"type": "perf",
					"release": "patch"
				},
				{
					"type": "BREAKING CHANGE",
					"release": "major"
				}
			]
		}
	],
	'@semantic-release/release-notes-generator',
	'@semantic-release/changelog',
	'@semantic-release/npm',
	[
		'@semantic-release/git',
		{
			assets: ['package.json', 'pnpm-lock.yaml', 'CHANGELOG.md', 'README.md', 'dist/**', 'docs/**'],
			message: 'release(version): Release ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
		}
	],
	"@semantic-release/github",
];