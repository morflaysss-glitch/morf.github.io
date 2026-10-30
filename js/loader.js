/* Экран загрузки «Шнуруем бутсы». Показывается один раз за визит, включается классом ld-on в <head>. */
(function () {
  var root = document.documentElement;
  var el = document.getElementById('ld');
  if (!el || !root.classList.contains('ld-on')) return;

  var video = el.querySelector('video');
  var logo = el.querySelector('img[data-src]');
  var fill = el.querySelector('.ld-fill');
  var pct = el.querySelector('.ld-pct');
  var skip = el.querySelector('.ld-skip');
  var DURATION = 4700; // длина ролика с шнуровкой, мс
  var loaded = document.readyState === 'complete';
  var t0 = null;
  var finished = false;

  window.addEventListener('load', function () { loaded = true; });

  if (logo) logo.src = logo.getAttribute('data-src');

  function begin() {
    if (t0 !== null) return;
    t0 = performance.now();
    requestAnimationFrame(tick);
    setTimeout(function () { skip.classList.add('ld-show'); }, 900);
  }

  if (video) {
    video.muted = true;
    video.addEventListener('playing', begin);
    video.addEventListener('error', function () { setTimeout(begin, 0); });
    video.poster = video.getAttribute('data-poster');
    var h264 = video.canPlayType('video/mp4; codecs="avc1.42E01E"');
    video.src = video.getAttribute(h264 ? 'data-src' : 'data-src-webm');
    var p = video.play();
    if (p && p.catch) p.catch(function () { begin(); });
  }
  setTimeout(begin, 1500); // если ролик не стартовал, шкала всё равно пойдёт

  function tick(now) {
    if (finished) return;
    var p = Math.min(1, (now - t0) / DURATION);
    var shown = Math.floor(p * 100);
    if (!loaded && shown > 99) shown = 99; // 100% только когда страница реально загрузилась
    fill.style.transform = 'scaleX(' + (shown >= 100 ? 1 : p) + ')';
    pct.textContent = shown + '%';
    if (shown >= 100) { setTimeout(finish, 450); return; }
    requestAnimationFrame(tick);
  }

  function finish() {
    if (finished) return;
    finished = true;
    el.classList.add('ld-out');
    try { sessionStorage.setItem('jg_ld', '1'); } catch (e) {}
    setTimeout(function () {
      root.classList.remove('ld-on');
      if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    }, 800);
  }

  skip.addEventListener('click', finish);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
})();
