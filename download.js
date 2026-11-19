/* Points the hero button at the release package for the visitor's system, so one
   click downloads the file instead of opening the list of five and leaving the
   reader to guess which one is theirs.

   Without this script, or if the GitHub API does not answer, the button keeps
   its plain href and opens the releases page: nothing breaks. */
(function () {
  'use strict';

  var API = 'https://api.github.com/repos/lw5hr/dx-agent-download/releases/latest';
  var button = document.querySelector('[data-download-button]');
  if (!button || !window.fetch) return;

  function system() {
    var ua = navigator.userAgent || '';
    // Phones and tablets take none of these packages.
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return null;
    var platform = (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform || ua;
    if (/Win/i.test(platform)) return 'windows';
    if (/Mac/i.test(platform)) return 'macos';
    if (/Linux|X11|BSD/i.test(platform)) return 'linux';
    return null;
  }

  var packages = {
    windows: /-win64\.zip$/,
    linux: /-linux-x86_64\.tar\.gz$/,
    macos: /-macos\.tar\.gz$/
  };

  var kind = system();
  if (!kind) return;

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (response) { return response.ok ? response.json() : null; })
    .then(function (release) {
      if (!release || !Array.isArray(release.assets)) return;
      var asset = null;
      for (var i = 0; i < release.assets.length; i++) {
        if (packages[kind].test(release.assets[i].name)) { asset = release.assets[i]; break; }
      }
      if (!asset) return;

      button.href = asset.browser_download_url;
      var label = button.getAttribute('data-label-' + kind);
      if (label) button.textContent = label;

      var file = document.querySelector('[data-download-file]');
      if (file) {
        file.textContent = asset.name + ', ' + Math.max(1, Math.round(asset.size / 1048576)) + ' MB';
      }
    })
    .catch(function () { /* keep the releases page link */ });
}());
