import { NextResponse } from "next/server";

// 外部サイト埋め込み用トラッキングスクリプトを返すAPI
export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const script = `
(function() {
  var CCAGI_ASP = {
    baseUrl: "${baseUrl}",
    cookieDays: 30,

    init: function(programId) {
      this.programId = programId;
      this._checkReferral();
    },

    _checkReferral: function() {
      var params = new URLSearchParams(window.location.search);
      var code = params.get("ref") || params.get("affiliate");
      if (code) {
        this._setCookie("ccagi_asp_ref", code, this.cookieDays);
        this._setCookie("ccagi_asp_program", this.programId, this.cookieDays);
        this._trackClick(code);
      }
    },

    _trackClick: function(code) {
      var self = this;
      fetch(this.baseUrl + "/api/asp/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_id: this.programId,
          affiliate_code: code,
          referrer_url: document.referrer,
          landing_url: window.location.href
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.click_id) {
          self._setCookie("ccagi_asp_click", data.click_id, self.cookieDays);
        }
      })
      .catch(function() {});
    },

    trackConversion: function(orderId, amount, apiKey) {
      var clickId = this._getCookie("ccagi_asp_click");
      if (!clickId) return Promise.resolve(null);

      return fetch(this.baseUrl + "/api/asp/conversion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey
        },
        body: JSON.stringify({
          click_id: clickId,
          order_id: orderId,
          amount: amount
        })
      })
      .then(function(r) { return r.json(); });
    },

    _setCookie: function(name, value, days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 86400000);
      document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + d.toUTCString() + ";path=/;SameSite=Lax";
    },

    _getCookie: function(name) {
      var v = document.cookie.match("(^|;)\\\\s*" + name + "\\\\s*=\\\\s*([^;]+)");
      return v ? decodeURIComponent(v.pop()) : null;
    }
  };

  window.CCAGI_ASP = CCAGI_ASP;
})();
`.trim();

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
