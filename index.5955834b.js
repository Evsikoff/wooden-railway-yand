        isElem: !1
        isElem: !1
            this.autoplay = !0;
            var e = this.audioObject;
            e && !e.isPlaying && (this.elem ? (this.elem.play(),
            e.isPlaying = !0,
            this.onPlayed.dispatch(this)) : e.buffer ? (e.play(),
            this.onPlayed.dispatch(this)) : null)
            i.load(),
