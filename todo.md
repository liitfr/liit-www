# Now

clean `sgr` (and its `svg`)
clean `sss`
"bientôt disponible" anim
`nojs` fallback + message
remove portfolio for now
redirect all `404` & `403` to index for now
semantic web
google analytics
check if `/index` is available as `/index.html` is
CI (ftp deploy ?) + Greenkeeper + david-dm + codacy
grid content on mobile: are fonts too small ?
snackbar colors
center icons on mobile rendering
text of #mh on mobile rendering
center title on mobile rendering
mixin for grid generation

# Tomorrow

## Every page

nojs fallback + message
semantic web

## Index content

Anchors : Strava / linkedin ~ viadeo / photos
i18n
nogrid fallback
find a way to tree shake three example
design animations on grid elements

## Others

Create `404` & `403` pages

# Bugs

BUG: eslint-import-resolver-webpack doesn't work with webpack 2
BUG: on mobile, index sometimes has a very high bottom margin

# Done ~ Fixed

BUG: Logo doesn't move in prod version => went from #polylogo to .polylogo (id is agressively removed by SVGO minification)
BUG: snackbar display on mobile
BUG: waves aren't 100% width on mobile because of `document.body.clientWidth`
"Invenieur Informatifien" to the same level as snackbars
BUG: .remote is recursively replicated in .remote
snackbar refresh bind
Service worker notifications
remove unused font
`nogrid` message
go from grid to absolute
