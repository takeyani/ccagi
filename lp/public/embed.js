(function() {
  "use strict";

  // Determine base URL from the script tag src
  var scripts = document.getElementsByTagName("script");
  var currentScript = scripts[scripts.length - 1];
  var scriptSrc = currentScript.getAttribute("src") || "";
  var baseUrl = scriptSrc.replace(/\/embed\.js(\?.*)?$/, "") || window.location.origin;

  function initWidgets() {
    var widgets = document.querySelectorAll("[data-ccagi-widget]");
    for (var i = 0; i < widgets.length; i++) {
      var el = widgets[i];
      if (el.getAttribute("data-ccagi-initialized")) continue;
      el.setAttribute("data-ccagi-initialized", "true");

      var type = el.getAttribute("data-type");
      var code = el.getAttribute("data-code");
      var slug = el.getAttribute("data-slug");
      var lotId = el.getAttribute("data-lot-id");

      var path = "";
      if (type === "lp" && code && slug && lotId) {
        path = "/embed/lp/" + encodeURIComponent(code) + "/" + encodeURIComponent(slug) + "/" + encodeURIComponent(lotId);
      } else if (type === "collection" && code && slug) {
        path = "/embed/collection/" + encodeURIComponent(code) + "/" + encodeURIComponent(slug);
      } else {
        continue;
      }

      var iframe = document.createElement("iframe");
      iframe.src = baseUrl + path;
      iframe.style.width = "100%";
      iframe.style.border = "none";
      iframe.style.overflow = "hidden";
      iframe.style.minHeight = "200px";
      iframe.scrolling = "no";
      iframe.setAttribute("allowfullscreen", "true");
      iframe.setAttribute("loading", "lazy");

      // Store reference for height sync
      iframe.setAttribute("data-ccagi-iframe", path);

      el.appendChild(iframe);
    }
  }

  // Listen for height resize messages from iframes
  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "ccagi-embed-resize") return;
    var height = event.data.height;
    if (typeof height !== "number" || height <= 0) return;

    // Find the iframe that sent this message
    var iframes = document.querySelectorAll("[data-ccagi-iframe]");
    for (var i = 0; i < iframes.length; i++) {
      var iframe = iframes[i];
      try {
        if (iframe.contentWindow === event.source) {
          iframe.style.height = height + "px";
          break;
        }
      } catch (e) {
        // Cross-origin access may fail; ignore
      }
    }
  });

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidgets);
  } else {
    initWidgets();
  }

  // Expose init for SPA usage
  window.ccagiEmbed = {
    init: initWidgets
  };
})();
