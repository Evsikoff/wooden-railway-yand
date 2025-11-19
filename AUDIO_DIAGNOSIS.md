# Audio playback diagnosis

## Why Yandex Browser still shows the system player
The runtime log you captured (`source: "document.createElement(\"audio\")"`) matches the code path inside the main bundle where `AudioItem` instantiates DOM `<audio>` elements for any asset marked with `isElem`.

In `index.5955834b.js`, the background music track (`bgm.mp3`) is defined with `isElem: !0`, so the loader always creates a media element and wires it into the Web Audio graph:

```
music: [{
    id: "bgm",
    url: "bgm.mp3",
    isLoopable: !0,
    isPositional: !1,
    isPreload: !1,
    isElem: !0
}]
...
this.isElem && !this.elem && (this.elem = document.createElement("audio"),
this.elem.src = this.url),
this.elem ? (this.elem.loop = this.isLoopable,
this.audioObject.setMediaElementSource(this.elem),
this.elem.addEventListener("ended", this.onEnd.bind(this)),
this.autoplay && this.play()) : (...)
```

Because a real `<audio>` element is what actually plays `bgm.mp3`, Yandex Browser treats the session as standard media playback and surfaces its system-level controls even though we neutralize `navigator.mediaSession` and hide player UI.

## What would stop the system player
To completely avoid the Media Session UI you need to stop using media elements for long-running tracks:

1. Remove `isElem: !0` from `bgm` (and any other looping tracks) so `AudioItem` goes down the buffer/XHR path instead of `document.createElement("audio")`.
2. Let the asset decode into an `AudioBuffer` and play via `AudioContext` only (`createBufferSource`). Web Audio sources do not register as document-level media sessions, so Yandex Browser has nothing to expose.

## Fix applied
`bgm.mp3` and the only other looping DOM-backed asset (`cricket.mp3`) no longer declare `isElem: !0` inside `index.5955834b.js`. This forces
`AudioItem` to stay on the XHR/`AudioBuffer` code path, so background music and ambient loops are generated purely through `AudioContext`
sources. Because no DOM `<audio>` element is created for those tracks anymore, Yandex Browser has nothing to promote to its system player UI.
