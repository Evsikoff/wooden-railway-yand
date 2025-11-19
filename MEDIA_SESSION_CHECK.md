# Media Session usage audit

To ensure the main bundle doesn't expose metadata or Media Session handlers, run the following commands from the repo root:

```
rg -n "mediaSession" index.5955834b.js
rg -n "setActionHandler" index.5955834b.js
rg -n "navigator.mediaSession" index.5955834b.js
```

As of this audit, all commands return no matches, which confirms that `index.5955834b.js` neither accesses `navigator.mediaSession`, nor invokes `setActionHandler`, nor references Media Session metadata fields.
