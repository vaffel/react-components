module.exports = {
    'page-title': 'React Components',
    'npm-keyword': 'react-component',
    'poll-interval': 300000,
    'exclude-keywords': ['react', 'react-component'],
    'codemirror-modes': {
        'cs': 'coffeescript',
        'coffeescript': 'coffeescript',
        'coffee': 'coffeescript',
        'css': 'css',
        'html': 'htmlmixed',
        'javascript': 'javscript',
        'js': 'javascript',
        'perl': 'perl',
        'pl': 'perl',
        'php': 'php',
        'ruby': 'ruby',
        'rb': 'rb',
        'shell': 'shell',
        'sh': 'shell',
        'bash': 'shell',
        'batch': 'shell',
        'xml': 'xml',
        'yaml': 'yaml'
    },
    'github': {
        'type': 'oauth',
        'key': process.env.GITHUB_KEY,
        'secret': process.env.GITHUB_SECRET
    },
    'cache': {
        'starCounts': __dirname + '/../data/starCounts.json'
    }
};