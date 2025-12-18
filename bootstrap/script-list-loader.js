(function () {
  if (typeof document === "undefined") {
    return;
  }

  const SCRIPT_MANIFEST_URL = "bootstrap/script-list.html";
  const log = (msg, data) => {
    if (typeof console !== "undefined" && console.error) {
      console.error("rwtra:scripts", msg, data || "");
    }
  };

  async function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load " + src));
      const parent = document.head || document.documentElement;
      parent.appendChild(script);
    });
  }

  async function loadFromManifest() {
    const res = await fetch(SCRIPT_MANIFEST_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(
        "Failed to load script manifest " +
          SCRIPT_MANIFEST_URL +
          ": " +
          res.status
      );
    }
    const html = await res.text();
    const template = document.createElement("template");
    template.innerHTML = html;
    const scripts = Array.from(
      template.content.querySelectorAll("script[src]")
    );
    for (const script of scripts) {
      const src = script.getAttribute("src");
      if (!src) continue;
      await loadScript(src);
    }
  }

  loadFromManifest().catch((err) => log("load:error", err));
})();
