// Disclaimer Checkbox 
jQuery(document).ready(function () {
    $('#disclaimerCheck').change(function () {
        if ($('#disclaimerCheck').is(':checked')) {
            $('.process-upsell').removeClass('btn-disabled')
        } else {
            $('.process-upsell').addClass('btn-disabled')
        }
    })
})

/**
 * Countdown Timer
 */
let spd     = 100
let spdVal  = 10
let cntDown = 12 * 60 * spdVal
setInterval(function () {
    let mn, sc, ms
    cntDown--
    if (cntDown < 0) {
        return false
    }
    mn           = Math.floor((cntDown / spdVal) / 60)
    mn           = (mn < 10 ? '0' + mn : mn)
    sc           = Math.floor((cntDown / spdVal) % 60)
    sc           = (sc < 10 ? '0' + sc : sc)
    ms           = Math.floor(cntDown % spdVal)
    ms           = (ms < 10 ? '0' + ms : ms)
    let result   = mn.toString() + sc.toString();

    let resultArray = result.split('');


    
    $('.min-1 .top').html(resultArray[0]);
    $('.min-2 .top').html(resultArray[1]);

    $('.sec-1 .top').html(resultArray[2]);
    $('.sec-2 .top').html(resultArray[3]);
}, spd)


// POPUP MODALS

if ("undefined" == typeof jQuery) throw new Error("Bootstrap's JavaScript requires jQuery");
! function(t) {
    "use strict";
    var e = jQuery.fn.jquery.split(" ")[0].split(".");
    if (e[0] < 2 && e[1] < 9 || 1 == e[0] && 9 == e[1] && e[2] < 1 || e[0] > 3) throw new Error("Bootstrap's JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4")
}(),
function(t) {
    "use strict";
    var e = function(e, i) {
        this.options = i, this.$body = t(document.body), this.$element = t(e), this.$dialog = this.$element.find(".modal-dialog"), this.$backdrop = null, this.isShown = null, this.originalBodyPad = null, this.scrollbarWidth = 0, this.ignoreBackdropClick = !1, this.fixedContent = ".navbar-fixed-top, .navbar-fixed-bottom", this.options.remote && this.$element.find(".modal-content").load(this.options.remote, t.proxy(function() {
            this.$element.trigger("loaded.bs.modal")
        }, this))
    };

    function i(i, o) {
        return this.each(function() {
            var s = t(this),
                n = s.data("bs.modal"),
                a = t.extend({}, e.DEFAULTS, s.data(), "object" == typeof i && i);
            n || s.data("bs.modal", n = new e(this, a)), "string" == typeof i ? n[i](o) : a.show && n.show(o)
        })
    }
    e.VERSION = "3.4.1", e.TRANSITION_DURATION = 300, e.BACKDROP_TRANSITION_DURATION = 150, e.DEFAULTS = {
        backdrop: !0,
        keyboard: !0,
        show: !0
    }, e.prototype.toggle = function(t) {
        return this.isShown ? this.hide() : this.show(t)
    }, e.prototype.show = function(i) {
        var o = this,
            s = t.Event("show.bs.modal", {
                relatedTarget: i
            });
        this.$element.trigger(s), this.isShown || s.isDefaultPrevented() || (this.isShown = !0, this.checkScrollbar(), this.setScrollbar(), this.$body.addClass("modal-open"), this.escape(), this.resize(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', t.proxy(this.hide, this)), this.$dialog.on("mousedown.dismiss.bs.modal", function() {
            o.$element.one("mouseup.dismiss.bs.modal", function(e) {
                t(e.target).is(o.$element) && (o.ignoreBackdropClick = !0)
            })
        }), this.backdrop(function() {
            var s = t.support.transition && o.$element.hasClass("fade");
            o.$element.parent().length || o.$element.appendTo(o.$body), o.$element.show().scrollTop(0), o.adjustDialog(), s && o.$element[0].offsetWidth, o.$element.addClass("in"), o.enforceFocus();
            var n = t.Event("shown.bs.modal", {
                relatedTarget: i
            });
            s ? o.$dialog.one("bsTransitionEnd", function() {
                o.$element.trigger("focus").trigger(n)
            }).emulateTransitionEnd(e.TRANSITION_DURATION) : o.$element.trigger("focus").trigger(n)
        }))
    }, e.prototype.hide = function(i) {
        i && i.preventDefault(), i = t.Event("hide.bs.modal"), this.$element.trigger(i), this.isShown && !i.isDefaultPrevented() && (this.isShown = !1, this.escape(), this.resize(), t(document).off("focusin.bs.modal"), this.$element.removeClass("in").off("click.dismiss.bs.modal").off("mouseup.dismiss.bs.modal"), this.$dialog.off("mousedown.dismiss.bs.modal"), t.support.transition && this.$element.hasClass("fade") ? this.$element.one("bsTransitionEnd", t.proxy(this.hideModal, this)).emulateTransitionEnd(e.TRANSITION_DURATION) : this.hideModal())
    }, e.prototype.enforceFocus = function() {
        t(document).off("focusin.bs.modal").on("focusin.bs.modal", t.proxy(function(t) {
            document === t.target || this.$element[0] === t.target || this.$element.has(t.target).length || this.$element.trigger("focus")
        }, this))
    }, e.prototype.escape = function() {
        this.isShown && this.options.keyboard ? this.$element.on("keydown.dismiss.bs.modal", t.proxy(function(t) {
            27 == t.which && this.hide()
        }, this)) : this.isShown || this.$element.off("keydown.dismiss.bs.modal")
    }, e.prototype.resize = function() {
        this.isShown ? t(window).on("resize.bs.modal", t.proxy(this.handleUpdate, this)) : t(window).off("resize.bs.modal")
    }, e.prototype.hideModal = function() {
        var t = this;
        this.$element.hide(), this.backdrop(function() {
            t.$body.removeClass("modal-open"), t.resetAdjustments(), t.resetScrollbar(), t.$element.trigger("hidden.bs.modal")
        })
    }, e.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove(), this.$backdrop = null
    }, e.prototype.backdrop = function(i) {
        var o = this,
            s = this.$element.hasClass("fade") ? "fade" : "";
        if (this.isShown && this.options.backdrop) {
            var n = t.support.transition && s;
            if (this.$backdrop = t(document.createElement("div")).addClass("modal-backdrop " + s).appendTo(this.$body), this.$element.on("click.dismiss.bs.modal", t.proxy(function(t) {
                    this.ignoreBackdropClick ? this.ignoreBackdropClick = !1 : t.target === t.currentTarget && ("static" == this.options.backdrop ? this.$element[0].focus() : this.hide())
                }, this)), n && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"), !i) return;
            n ? this.$backdrop.one("bsTransitionEnd", i).emulateTransitionEnd(e.BACKDROP_TRANSITION_DURATION) : i()
        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass("in");
            var a = function() {
                o.removeBackdrop(), i && i()
            };
            t.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one("bsTransitionEnd", a).emulateTransitionEnd(e.BACKDROP_TRANSITION_DURATION) : a()
        } else i && i()
    }, e.prototype.handleUpdate = function() {
        this.adjustDialog()
    }, e.prototype.adjustDialog = function() {
        var t = this.$element[0].scrollHeight > document.documentElement.clientHeight;
        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && t ? this.scrollbarWidth : "",
            paddingRight: this.bodyIsOverflowing && !t ? this.scrollbarWidth : ""
        })
    }, e.prototype.resetAdjustments = function() {
        this.$element.css({
            paddingLeft: "",
            paddingRight: ""
        })
    }, e.prototype.checkScrollbar = function() {
        var t = window.innerWidth;
        if (!t) {
            var e = document.documentElement.getBoundingClientRect();
            t = e.right - Math.abs(e.left)
        }
        this.bodyIsOverflowing = document.body.clientWidth < t, this.scrollbarWidth = this.measureScrollbar()
    }, e.prototype.setScrollbar = function() {
        var e = parseInt(this.$body.css("padding-right") || 0, 10);
        this.originalBodyPad = document.body.style.paddingRight || "";
        var i = this.scrollbarWidth;
        this.bodyIsOverflowing && (this.$body.css("padding-right", e + i), t(this.fixedContent).each(function(e, o) {
            var s = o.style.paddingRight,
                n = t(o).css("padding-right");
            t(o).data("padding-right", s).css("padding-right", parseFloat(n) + i + "px")
        }))
    }, e.prototype.resetScrollbar = function() {
        this.$body.css("padding-right", this.originalBodyPad), t(this.fixedContent).each(function(e, i) {
            var o = t(i).data("padding-right");
            t(i).removeData("padding-right"), i.style.paddingRight = o || ""
        })
    }, e.prototype.measureScrollbar = function() {
        var t = document.createElement("div");
        t.className = "modal-scrollbar-measure", this.$body.append(t);
        var e = t.offsetWidth - t.clientWidth;
        return this.$body[0].removeChild(t), e
    };
    var o = t.fn.modal;
    t.fn.modal = i, t.fn.modal.Constructor = e, t.fn.modal.noConflict = function() {
        return t.fn.modal = o, this
    }, t(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function(e) {
        var o = t(this),
            s = o.attr("href"),
            n = o.attr("data-target") || s && s.replace(/.*(?=#[^\s]+$)/, ""),
            a = t(document).find(n),
            r = a.data("bs.modal") ? "toggle" : t.extend({
                remote: !/#/.test(s) && s
            }, a.data(), o.data());
        o.is("a") && e.preventDefault(), a.one("show.bs.modal", function(t) {
            t.isDefaultPrevented() || a.one("hidden.bs.modal", function() {
                o.is(":visible") && o.trigger("focus")
            })
        }), i.call(a, r, this)
    })
}(jQuery);

// POPUP MODALS