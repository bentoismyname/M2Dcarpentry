/* M2D Carpentry: one script for every page. Each part below first checks that its piece of the page is there,
   so the walk-in runs only on Home, the shop only on Shop, the quote form only on Carpentry, and so on.
   Ben's price calculator lives in calc.js (carried over from his page) and loads on the Carpentry page. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const WA = "6598221113";
const wa = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const money = (n) => "$" + n.toLocaleString("en-SG");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg>';

/* ───── Ben's pieces (names, sizes, prices and descriptions from his own page) ───── */
const PRODUCTS = [
  { id: "telok", type: "Dining tables", sub: "2.4 m walnut top on a tiered base. Seats up to eight.", name: "Telok dining table", room: "Dining", W: 2400, D: 1000, H: 750, price: 4800,
    desc: "A 2.4 m walnut top with softly rounded corners, on a sculpted tiered base and two slim black steel legs. Seats up to eight." },
  { id: "pasir", type: "Dining tables", sub: "2.0 m walnut top on two pebble legs. Seats six.", name: "Pasir dining table", room: "Dining", W: 2000, D: 900, H: 750, price: 3900,
    desc: "A 2.0 m walnut top with rounded corners, resting on two pebble-shaped solid legs. Seats six." },
  { id: "zh-tv", type: "Consoles and cabinets", sub: "Three rounded walnut volumes on a stone plinth.", name: "ZH26-01 TV console", room: "Living", W: 1800, D: 400, H: 400, price: 2600,
    desc: "Three rounded walnut volumes resting on a natural stone plinth. A low, sculptural console for the living room." },
  { id: "zh-cabinet", type: "Consoles and cabinets", sub: "Two rounded walnut doors on a stone base.", name: "ZH26-01 Decorative cabinet", room: "Living", W: 800, D: 320, H: 1200, price: 2200,
    desc: "Two rounded walnut doors standing on a stone base. Made to sit against a feature wall as a display piece." },
  { id: "marina", type: "Coffee sets", sub: "Oval coffee table and side table, stone tops.", name: "Marina coffee set", room: "Living", price: 3600,
    dimNote: "Coffee table W 1200 × D 800 × H 340 mm. Side table Ø 500 × H 440 mm",
    desc: "An oval coffee table and a round side table, rimmed in walnut with natural stone tops and a dark band between the layers." },
  { id: "sentosa", type: "Coffee sets", sub: "Half walnut, half stone, with a walnut side table.", name: "Sentosa coffee set", room: "Living", price: 3200,
    dimNote: "Coffee table W 1200 × D 800 × H 340 mm. Side table Ø 500 × H 440 mm",
    desc: "An oval coffee table with a top half walnut, half pale stone, paired with a walnut side table that has a bronze-tone collar." },
  { id: "tekong", type: "Coffee sets", sub: "Round walnut coffee table and tray-top side table.", name: "Tekong coffee set", room: "Living", price: 1900,
    dimNote: "Coffee table Ø 950 × H 340 mm. Side table Ø 550 × H 460 mm",
    desc: "A round walnut coffee table on three sculpted legs, with a matching tray-top side table." },
];
const byId = (id) => PRODUCTS.find((p) => p.id === id);

/* ───── Built-in carpentry. `calc` is the piece it opens in the price calculator. ───── */
// The pictures are M2D's own: a crew photo for wardrobes, and finished homes from the Portfolio for the rest.
const BESPOKE = {
  wardrobe: { name: "Wardrobes", img: "assets/crew/08167c7e.jpg", calc: "wardrobe",
    desc: "Swing or sliding doors, drawers, lighting and internal fittings." },
  kitchen: { name: "Kitchens", img: "assets/portfolio/bedok/01.jpg", calc: "kitchen",
    desc: "Top and bottom cabinets, countertops, tall units and drawer stacks." },
  feature: { name: "TV and feature walls", img: "assets/portfolio/cantonment/02.jpg", calc: "feature",
    desc: "Consoles, fluted, slatted and mirror panels." },
  study: { name: "Study and bay windows", img: "assets/portfolio/chaseki/03.jpg", calc: "study",
    desc: "Desks, shelves and window seats with storage." },
  shoe: { name: "Shoe and storage cabinets", img: "assets/portfolio/strathmore/04.jpg", calc: "shoe",
    desc: "Entryway cabinets and floor-to-ceiling bookshelves." },
  doors: { name: "Doors", img: "assets/doors/flush-1.jpg",
    desc: "Flush and sliding doors, made to fit. We make the doors and their frames, built to the opening on site and finished to match your carpentry.",
    btn: "Ask about doors", href: wa("Hi M2D Carpentry, I'd like to ask about doors.") },
};

/* ═════ Home hero: scroll to build the room ═════
   One fixed camera on an empty room. Scrolling plays the fit-out: cabinets, island and lights, then the furniture.
   The page shows the still picture at the start and at the end, and the filmed frames in between.
   Dot positions are shares of the picture (x across, y down). */
// Three versions to compare. The switcher on the hero (or ?hero=1, 2 or 3 in the address) picks one and it is remembered.
// TEMPORARY: once one is chosen, keep only that set here and delete the switcher and the other two folders.
const HERO_SETS = {
  1: { name: "Builds itself", dir: "assets/build-hero/",
       // sharper copies of the same frames, cut from the 4K version of the clip: [screen width in real pixels, folder]
       tiers: [[3400, "uhd/"], [1500, "hd/"]],
       heads: [0.55, 0.80], // the second header when the sofa and table arrive (55% of the build), the third when the chairs do (80%)
       focal: [[0, 0.84], [0.425, 0.84], [0.515, 0.36], [0.84, 0.36], [0.97, 0.84], [1, 0.84]],
       steps: [[0.06, "Empty room"], [0.38, "Cabinets go in"], [0.55, "Island and lights"], [0.97, "Furniture arrives"]] },
  2: { name: "Crew builds it", dir: "assets/build-hero-2/",
       heads: [0.56, 0.87], // sofa and table from 56% of the build (the rug is down), chairs from 87%
       focal: [[0, 0.84], [0.40, 0.84], [0.48, 0.36], [0.84, 0.36], [0.97, 0.84], [1, 0.84]],
       steps: [[0.06, "Empty room"], [0.42, "Cabinets go in"], [0.54, "Island and lights"], [0.97, "Furniture arrives"]] },
  3: { name: "Crew, furniture only", dir: "assets/build-hero-3/",
       heads: [0.24, 0.86], // the kitchen stands and the rug goes down, then the sofa and table (24% of the build), then the chairs (86%)
       focal: [[0, 0.36], [0.84, 0.36], [0.97, 0.84], [1, 0.84]],
       steps: [[0.05, "Kitchen ready"], [0.24, "Rug down"], [0.56, "Sofa and cushions"], [0.97, "Tables and stools"]] },
};
let heroPick = "1";
try {
  heroPick = new URLSearchParams(location.search).get("hero") || "1"; // 1 = the room builds itself, no people (the one in use)
  if (!HERO_SETS[heroPick]) heroPick = "1";
} catch (e) {}
const TOUR = {
  move: [0.05, 0.80],
  // `focal`: where a narrow screen centres the picture, as [share of the scroll, share of the picture's width]
  // `steps`: what is happening, by share of the build, as [until, caption]
  ...HERO_SETS[heroPick],
  dots: [
    [],
    [
      { x: 0.935, y: 0.3, label: "Kitchen cabinets · price it", open: "b:kitchen", left: true },
      { x: 0.356, y: 0.76, label: "Marina coffee set · $3,600", open: "p:marina" },
    ],
  ],
};
if (TOUR.tiers) { // phones keep the light frames; laptops get 2560 wide, very large screens the full 4K
  const px = innerWidth * Math.min(2, devicePixelRatio || 1), tier = TOUR.tiers.find((x) => px >= x[0]);
  if (tier) TOUR.dir += tier[1];
}
TOUR.from = TOUR.dir + "start.jpg"; TOUR.to = TOUR.dir + "end.jpg";
const IW = 1600, IH = 900; // the pictures' size
const tour = $(".tour"), stage = $(".stage"), topBar = $("#top");
const canvas = $(".tour-canvas"), ctx = canvas ? canvas.getContext("2d") : null, plate = $(".plate");
const dotBoxes = [0, 1].map((i) => $(`[data-dots="${i}"]`));
const logo = $(".tour-logo"), hint = $(".tour-hint"), panel = $(".tour-panel"), stepEl = $(".tour-step"), heads = $$(".tour-head");

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (p, [a, b]) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
// The picture stays put while you scroll: one spot for the whole build (where it starts), no sliding sideways.
function focalAt(p) {
  return TOUR.focal[0][1];
}
if (tour) TOUR.dots.forEach((list, i) => {
  dotBoxes[i].innerHTML = list.map((d) =>
    `<button type="button" class="dot${d.left ? " l" : ""}${d.side ? " p" + d.side : ""}" style="left:${d.x * 100}%;top:${d.y * 100}%" data-open="${d.open}"${d.px ? ` data-x="${d.x}" data-px="${d.px}"` : ""}>` +
    `<span class="pip"></span><span class="lab">${d.label}</span></button>`).join("");
});

const pic = (src) => new Promise((res) => { const im = new Image(); im.decoding = "async"; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
const stills = [null, null];
let frames = [];
if (tour) [TOUR.from, TOUR.to].forEach((src, i) => pic(src).then((im) => { stills[i] = im; draw(cur); }));
async function loadFrames() {
  if (reduce) return; // no camera move: the two pictures fade into each other
  const man = await fetch(TOUR.dir + "manifest.json").then((r) => r.json()).catch(() => null);
  const n = man && man.n;
  if (!n) return;
  frames = new Array(n).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < n) {
      const i = next++;
      frames[i] = await pic(TOUR.dir + String(i + 1).padStart(3, "0") + ".webp");
      if (i % 6 === 0) draw(cur);
    }
  };
  for (let k = 0; k < 6; k++) worker();
}
const nearest = (arr, i) => { for (let d = 0; d < arr.length; d++) { if (arr[i - d]) return arr[i - d]; if (arr[i + d]) return arr[i + d]; } return null; };

let W = 0, H = 0, w = 0, h = 0, y0 = 0, dpr = 1;
function layout() {
  W = stage.clientWidth; H = stage.clientHeight;
  dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const s = Math.max(W / IW, H / IH);
  w = IW * s; h = IH * s; y0 = (H - h) / 2;
  plate.style.width = w + "px"; plate.style.height = h + "px"; plate.style.top = y0 + "px";
  // The M2D name hangs on the bare wall, below the floating header bar.
  const phone = W <= 820;
  let lt = Math.max(phone ? 100 : 124, y0 + (phone ? 0.30 : 0.17) * h); // on a phone the first view is the kitchen corner: sit below the lamp cables
  let lh = clamp(0.13 * h, 44, 120);
  lh = Math.min(lh, (W - 72) / 3.04);
  if (logo) { logo.style.top = lt + "px"; logo.style.height = lh + "px"; }
  // A dot that would be off a narrow screen moves to the matching spot that is in view (the other door).
  const x0 = clamp(W / 2 - TOUR.focal[0][1] * w, W - w, 0);
  $$(".dot[data-px]").forEach((d) => {
    const sx = x0 + d.dataset.x * w, off = sx < 30 || sx > W - 30;
    d.style.left = (off ? d.dataset.px : d.dataset.x) * 100 + "%";
  });
  draw(cur);
}
function paint(im, x, alpha) {
  if (!im) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(im, x * dpr, y0 * dpr, w * dpr, h * dpr);
}
function draw(p) {
  const x = clamp(W / 2 - focalAt(p) * w, W - w, 0);
  plate.style.transform = `translate3d(${x}px,0,0)`;
  ctx.globalAlpha = 1; ctx.clearRect(0, 0, canvas.width, canvas.height);
  const t = seg(p, TOUR.move), EDGE = 0.05; // the first and last moments blend with the approved pictures
  if (t <= 0) paint(stills[0], x, 1);
  else if (t >= 1) paint(stills[1], x, 1);
  else {
    const fr = frames.length ? nearest(frames, Math.round(t * (frames.length - 1))) : null;
    if (!fr) { paint(stills[0], x, 1); paint(stills[1], x, ease(t)); }
    else if (t < EDGE) { paint(stills[0], x, 1); paint(fr, x, t / EDGE); }
    else if (t > 1 - EDGE) { paint(fr, x, 1); paint(stills[1], x, (t - (1 - EDGE)) / EDGE); }
    else paint(fr, x, 1);
  }
  ctx.globalAlpha = 1;
  if (stepEl) { // the caption for this moment of the build
    const k = t <= 0 || t >= 1 ? -1 : TOUR.steps.findIndex((s) => t < s[0]);
    stepEl.classList.toggle("on", k >= 0);
    if (k >= 0 && stepEl.dataset.k !== String(k)) { stepEl.dataset.k = k; stepEl.innerHTML = "<b>0" + (k + 1) + "</b>" + TOUR.steps[k][1]; }
  }
  dotBoxes[0].classList.toggle("off", p > TOUR.move[0] - 0.01);
  dotBoxes[1].classList.toggle("off", p < TOUR.move[1] - 0.005);
  if (panel) panel.classList.toggle("off", p < TOUR.move[1] - 0.005);
  const lo = seg(p, [0.02, 0.09]);
  if (logo) { logo.style.opacity = 1 - lo; logo.style.transform = `translateX(-50%) translateY(${-24 * lo}px)`; }
  if (hint) hint.style.opacity = 1 - seg(p, [0.005, 0.04]);
  if (heads.length) { // one header at a time: kitchen, then sofa and table, then the chairs (which stays)
    const k = TOUR.heads.filter((mark) => t >= mark).length; // how many stages have gone by
    heads.forEach((el, i) => el.classList.toggle("on", i === k));
  }
  topBar.classList.toggle("at-start", p < 0.08 && !topBar.classList.contains("solid"));
  document.body.classList.toggle("at-top", p < 0.05); // the floating WhatsApp button waits until the walk has started
}
let cur = 0, want = 0, raf = 0, lastT = 0;
function read() {
  if (!tour) { readBuild(); return; }
  const r = tour.getBoundingClientRect();
  want = clamp(-r.top / (tour.offsetHeight - innerHeight));
  topBar.classList.toggle("solid", r.bottom < 80);
  if (reduce) { cur = want; draw(cur); } else if (!raf) raf = requestAnimationFrame(tick);
  readBuild();
}
function tick(now) {
  // Time-based glide, so a slow frame rate never leaves the walk lagging behind the page.
  const dt = lastT ? Math.min(100, now - lastT) : 16; lastT = now;
  cur += (want - cur) * (1 - Math.exp(-dt / 110));
  if (Math.abs(want - cur) < 0.0004) cur = want;
  draw(cur);
  if (cur === want) { raf = 0; lastT = 0; } else raf = requestAnimationFrame(tick);
}

/* ═════ Scroll to build: empty room, cabinets in, finished ═════ */
const build = $(".build"), buildImgs = $$(".build-stage img"), buildSteps = $$("#buildSteps li");
function readBuild() {
  if (!build) return;
  const r = build.getBoundingClientRect();
  const p = clamp(-r.top / (build.offsetHeight - innerHeight));
  // 0 to 0.15 empty, then cabinets fade in, hold, then the finished room fades in, hold.
  const a = ease(seg(p, [0.15, 0.4])), b = ease(seg(p, [0.6, 0.85]));
  buildImgs[1].style.opacity = a; buildImgs[2].style.opacity = b;
  const step = p < 0.28 ? 0 : p < 0.72 ? 1 : 2;
  buildSteps.forEach((li, i) => li.classList.toggle("on", i === step));
}
addEventListener("scroll", read, { passive: true });
addEventListener("resize", () => { if (tour) layout(); read(); });
if (tour) { layout(); read(); cur = want; draw(cur); loadFrames(); } else read();

/* ═════ Opening ═════
   1. The M2D name and "Carpentry" sit alone on cream.
   2. They part, and a small window onto the house opens between them.
   3. The window grows until it is the page. The name fades away where it is, and the header logo fades in.
   Every step is also on a timer, so the page always opens even if the animation cannot run. */
(function opening() {
  const root = document.documentElement, pre = $("#pre");
  if (!pre || !root.classList.contains("pre-on")) return;
  const done = () => { pre.classList.add("out"); root.classList.remove("pre-on"); setTimeout(() => pre.remove(), 600); };
  if (scrollY > 40 || !pre.animate) { done(); return; }
  const win = $(".pre-win"), plogo = $(".pre-logo"), cap = $(".pre-cap");
  const play = () => {
    const P = pre.getBoundingClientRect(), S = stage.getBoundingClientRect(), phone = P.width <= 820;
    // the window shows the house exactly as the page draws it, so the hand-over cannot be seen
    const s = Math.max(S.width / IW, S.height / IH), pw = IW * s;
    const px = clamp(S.width / 2 - TOUR.focal[0][1] * pw, S.width - pw, 0);
    win.style.height = S.height + "px";
    win.style.backgroundImage = `url(${TOUR.from})`;
    win.style.backgroundPosition = `${S.width - pw < -0.5 ? (px / (S.width - pw)) * 100 : 50}% 50%`;
    const K = phone ? 0.34 : 0.22, CUT = phone ? 31 : 12, R = 0; // small window: size, crop top and bottom, corner
    const half = (K * S.height * (1 - CUT / 50)) / 2;                            // half its height on screen
    const lh = plogo.offsetHeight, L = (logo || $(".top .brand img")).getBoundingClientRect(); // the name lands on the header logo
    const up = half + 22 + lh / 2, down = half + 26;
    const at = (y, x = 0, k = 1) => `translate(-50%,-50%) translate(${x}px,${y}px) scale(${k})`;
    const A = "cubic-bezier(.65,0,.25,1)", T1 = 1150, D1 = 800, T2 = 2150, D2 = 1000;
    const small = `inset(${CUT}% 0 ${CUT}% 0 round ${R}px)`;
    const opt = (delay, duration, easing = A) => ({ delay, duration, easing, fill: "forwards" });
    win.animate([{ clipPath: `inset(50% 0 50% 0 round ${R}px)` }, { clipPath: small }], opt(T1, D1));
    plogo.animate([{ transform: at(phone ? -12 : -14) }, { transform: at(-up) }], opt(T1, D1));
    cap.animate([{ transform: at(phone ? 34 : 40) }, { transform: at(down) }], opt(T1, D1));
    win.animate([{ transform: `scale(${K})`, clipPath: small }, { transform: "scale(1)", clipPath: "inset(0% 0 0% 0 round 0px)" }], opt(T2, D2));
    // the name fades away where it is; the logo in the header then fades in on its own
    plogo.animate([{ opacity: 1 }, { opacity: 0 }], opt(T2, 620, "ease"));
    const brand = $(".top .brand");
    if (brand) brand.animate([{ opacity: 0 }, { opacity: 1 }], { delay: T2 + D2 - 150, duration: 1100, easing: "ease", fill: "backwards" });
    cap.animate([{ opacity: 1 }, { opacity: 0 }], opt(T2, 260, "linear"));
    setTimeout(done, T2 + D2 + 120);
  };
  // wait for the house picture, but never for long
  let started = false;
  const go = () => { if (!started) { started = true; play(); } };
  pic(TOUR.from).then(go); setTimeout(go, 2500);
})();

/* ═════ Shop ═════
   A plain grid: photo, name, one line, price, how many, Add. The photo and name open the piece's own page. */
const asset = (s) => (typeof A === "function" ? A(s) : s); // the one-file copy of the site keeps its pictures inside the page

// Shop hero: a short film of daylight coming in from the window plays when the page opens, then hands over
// to the photo. Big screens get the 4K film, phones the lighter one. If the film cannot start (some phones block
// it in low power mode, or the connection is slow) the light drawn in CSS runs instead. shop.html?light=code shows that one.
(function shopLight() {
  const plate = $(".sh-plate");
  if (!plate) return;
  let pick = "";
  try { pick = new URLSearchParams(location.search).get("light") || ""; } catch (e) {}
  if (pick === "code" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement, v = document.createElement("video");
  const big = innerWidth * Math.min(2, devicePixelRatio || 1) >= 2000;
  v.className = "sh-vid";
  v.muted = true; v.playsInline = true; v.preload = "auto";
  v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
  v.src = asset(big ? "assets/shop/light-4k.mp4" : "assets/shop/light.mp4");
  root.classList.add("light-video");
  plate.appendChild(v);
  let gone = false;
  const back = () => { if (gone) return; gone = true; root.classList.remove("light-video", "light-play"); v.remove(); };
  const wait = setTimeout(() => { if (!root.classList.contains("light-play")) back(); }, 4500); // too slow: use the coded light
  const quick = () => { if (v.duration) v.playbackRate = Math.min(4, Math.max(1, v.duration / 2)); }; // the film runs in about 2 seconds
  v.addEventListener("loadedmetadata", quick);
  v.addEventListener("playing", () => { quick(); clearTimeout(wait); root.classList.add("light-play"); }); // the heading brightens with the film
  v.addEventListener("ended", () => root.classList.add("light-done")); // the sharp photo takes over from the last frame
  v.addEventListener("error", back);
  const p = v.play();
  if (p && p.catch) p.catch(back);
})();

/* Cards arrive one after another, left to right: each drops down a little and fades in.
   Called every time a grid of tiles is filled. */
function dropCards(grid) {
  if (!grid || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = dropCards.io || (dropCards.io = new IntersectionObserver((es) => {
    const now = es.filter((e) => e.isIntersecting).map((e) => e.target)
      .sort((a, b) => (a.offsetTop - b.offsetTop) || (a.offsetLeft - b.offsetLeft));
    now.forEach((el, i) => {
      dropCards.io.unobserve(el);
      el.style.setProperty("--d", i * 140 + "ms");
      el.classList.add("in");
      setTimeout(() => { el.classList.remove("drop", "in"); el.style.removeProperty("--d"); }, i * 140 + 1400);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }));
  [...grid.children].forEach((el) => { el.classList.add("drop"); io.observe(el); });
}
const TYPES = ["Everything", "Dining tables", "Coffee sets", "Consoles and cabinets"];
const QUICK = ["Dining table", "Coffee table", "TV console", "Cabinet", "Stone top"];
let type = "Everything", find = "";
const qtyPick = {}; // quantity chosen for each piece before it is added
const ITEM = $("#item") ? "" : "shop.html"; // a piece's own page lives on the Shop page
const qtyHTML = (id) => `<div class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="Fewer">−</button><output data-qo="${id}">${qtyPick[id] || 1}</output><button type="button" data-q="${id}" data-d="1" aria-label="More">+</button></div>`;
// A tile is a link to the piece (square room picture, then type, name and price) with a bare cart icon
// at the top right of the picture. The icon adds one to the cart without leaving the page.
// Pointing at a tile zooms into the picture.
const BAG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
const cardHTML = (p) => `
    <div class="sc">
      <a class="sc-link" href="${ITEM}#item-${p.id}">
        <span class="sc-pic">
          <img class="cover" src="${asset("assets/shop/cover/" + p.id + ".jpg")}" alt="${p.name} in a room" loading="lazy" width="1200" height="1200">
        </span>
        <span class="sc-meta"><small>${p.type}</small><strong>${p.name}</strong><em>${money(p.price)}</em></span>
      </a>
      <button type="button" class="sc-add" data-add="${p.id}" data-n="1" aria-label="Add ${p.name} to cart" title="Add to cart">${BAG}</button>
    </div>`;
const matches = (p) => {
  if (type !== "Everything" && p.type !== type) return false;
  const words = find.toLowerCase().split(/\s+/).filter(Boolean), hay = `${p.name} ${p.type} ${p.room} ${p.desc} ${p.sub}`.toLowerCase();
  return words.every((w) => hay.includes(w));
};
function renderShop() {
  $("#shopFilter").innerHTML = TYPES.map((t) => `<button type="button" data-type="${t}" aria-pressed="${t === type}">${t}</button>`).join("");
  $("#shopGrid").innerHTML = PRODUCTS.filter(matches).map(cardHTML).join("");
  dropCards($("#shopGrid"));
}
if ($("#shopGrid")) {
  $("#shopFilter").addEventListener("click", (e) => { const b = e.target.closest("[data-type]"); if (b) { type = b.dataset.type; renderShop(); } });
  renderShop();
}
// Home shows four pieces and sends you to the Shop page for the rest
if ($("#featGrid")) { $("#featGrid").innerHTML = ["telok", "marina", "zh-tv", "sentosa"].map(byId).map(cardHTML).join(""); dropCards($("#featGrid")); }

/* ═════ One piece ═════
   #item-<id> shows that piece on a page of its own: the rest of the page is put away until you go back. */
function renderItem(p) {
  const shots = [["assets/shop/cover/" + p.id + ".jpg", "In a room", "room"], ["assets/shop/cut/" + p.id + ".webp", "The piece", "cut"], ["assets/shop/" + p.id + ".jpg", "Up close", "room"], ["assets/shop/" + p.id + "-sheet.jpg", "Sizes", "sheet"]];
  const main = $("#itMain"), pick = (i) => {
    main.src = asset(shots[i][0]); main.alt = `${p.name}: ${shots[i][1].toLowerCase()}`; main.parentElement.dataset.kind = shots[i][2];
    $$("#itThumbs button").forEach((b, k) => b.setAttribute("aria-pressed", k === i));
  };
  $("#itThumbs").innerHTML = shots.map(([s, label, kind], i) => `<button type="button" data-shot="${i}" data-kind="${kind}" aria-label="${label}"><img src="${asset(s)}" alt=""><span>${label}</span></button>`).join("");
  $("#itThumbs").onclick = (e) => { const b = e.target.closest("[data-shot]"); if (b) pick(+b.dataset.shot); };
  pick(0);
  $("#itType").textContent = p.type; $("#itCrumb").textContent = p.name; $("#itTag").textContent = p.type;
  $("#itName").textContent = p.name; $("#itPrice").textContent = money(p.price); $("#itDesc").textContent = p.desc;
  $("#itBuy").innerHTML = `<button type="button" class="btn" data-add="${p.id}" data-n="1">Add to cart</button>`;
  $("#itWa").href = wa(`Hi M2D Carpentry, I'm interested in the ${p.name} (${money(p.price)}).`);
  $("#itFacts").innerHTML = [["Size", p.dimNote || `W ${p.W} × D ${p.D} × H ${p.H} mm`], ["Finish", "Walnut"], ["Built to order", "4–6 weeks for most pieces"], ["Installed by", "Our own team"]]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("#itMore").innerHTML = PRODUCTS.filter((x) => x.id !== p.id).sort((x, y) => (y.type === p.type) - (x.type === p.type)).slice(0, 4).map(cardHTML).join("");
  dropCards($("#itMore"));
  document.title = `${p.name} | M2D Carpentry`;
}
const HOME_TITLE = document.title;
let onItem = false;
function route() {
  if (!$("#item")) return;
  const m = location.hash.match(/^#item-([a-z0-9-]+)$/), p = m && byId(m[1]), was = onItem;
  onItem = !!p;
  document.documentElement.classList.toggle("on-item", onItem);
  $("#item").hidden = !onItem;
  if (onItem) { renderItem(p); if (typeof hide === "function") hide(); scrollTo({ top: 0, behavior: "instant" }); }
  else if (was) {
    document.title = HOME_TITLE;
    if (tour) { layout(); read(); cur = want; draw(cur); } // the walk-in was put away: measure it again
    let to = null; try { to = location.hash.length > 1 ? document.querySelector(location.hash) : null; } catch (e) {}
    (to || $("#shop")).scrollIntoView({ behavior: "instant", block: "start" });
  }
}
addEventListener("hashchange", route);

// Doors have their own block under the tiles, as on Ben's page.
if ($("#bespokeGrid")) $("#bespokeGrid").innerHTML = Object.entries(BESPOKE).filter(([k]) => k !== "doors").map(([k, b]) => `
  <button type="button" class="ctile btile${b.img ? "" : " plain"}" data-open="b:${k}"${b.img ? ` style="background-image:url(${b.img})"` : ""}>
    <span class="notch"><span class="go">${ARROW}</span></span>
    <strong>${b.name}</strong><span class="bdesc">${b.desc.split(". ")[0].replace(/\.$/, "")}.</span>
  </button>`).join("");

$$("[data-arrow]").forEach((e) => { e.innerHTML = ARROW; });

/* ═════ Request a quote: the form writes the request out and opens WhatsApp with it ═════ */
const NEEDS = ["Wardrobe", "Kitchen", "TV / feature wall", "Study / bay window", "Shoe / storage", "Doors", "Furniture piece", "Commercial"];
const PROPS = ["HDB / BTO", "Condo", "Landed", "Commercial"];
const NEED_MAP = { wardrobe: "Wardrobe", kitchen: "Kitchen", tv: "TV / feature wall", feature: "TV / feature wall", shoe: "Shoe / storage", bookshelf: "Shoe / storage", study: "Study / bay window", bay: "Study / bay window" };
const segs = (el, name, arr, type) => { el.innerHTML = arr.map((v, i) => `<label><input type="${type}" name="${name}" value="${v}"${type === "radio" && i === 0 ? " checked" : ""}>${v}</label>`).join(""); };
if ($("#quoteForm")) {
  segs($("#needSeg"), "need", NEEDS, "checkbox"); segs($("#propSeg"), "prop", PROPS, "radio");
  let estText = "";
  const setNeed = (v) => $$("#needSeg input").forEach((i) => { i.checked = i.value === v; });
  const toQuote = (focus) => { $("#quote").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); if (focus) setTimeout(() => $(focus).focus({ preventScroll: true }), 600); };
  // From the calculator: carry the estimate into the request, as on Ben's page.
  window.M2DQuote = (e) => {
    setNeed(NEED_MAP[e.item]);
    $("#bW").value = Math.round(e.W); $("#bH").value = e.H ? Math.round(e.H) : "";
    estText = `Online estimate: ${e.label}, ${money(e.lo)} – ${money(e.hi)}.\n` + e.rows.map((r) => `${r[0]}: ${r[1]}`).join("\n");
    const q = $("#qEst"); q.hidden = false;
    q.innerHTML = `<small>Your estimate, before GST</small><strong>${money(e.lo)} – ${money(e.hi)}</strong>${e.label}, attached to your request.`;
    toQuote("#bNotes");
  };
  $$("[data-door]").forEach((b) => b.addEventListener("click", (ev) => {
    ev.preventDefault(); setNeed("Doors");
    $("#bNotes").value = `Door type: ${b.dataset.door}. Opening size (W × H mm) and how many doors: `;
    toQuote("#bNotes");
  }));
  $$("[data-need]").forEach((b) => b.addEventListener("click", (ev) => { ev.preventDefault(); setNeed(b.dataset.need); toQuote("#bNotes"); }));
  $("#quoteForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const name = $("#bName").value.trim(), phone = $("#bPhone").value.trim();
    if (!name || !phone) { $("#qErr").textContent = "Add your name and mobile number."; (name ? $("#bPhone") : $("#bName")).focus(); return; }
    $("#qErr").textContent = "";
    const needs = $$("#needSeg input:checked").map((i) => i.value).join(", ") || "Not specified";
    const prop = ($("#propSeg input:checked") || {}).value;
    const notes = $("#bNotes").value.trim();
    const text = `M2D Carpentry bespoke quote request\n\nNeed: ${needs}\nProperty: ${prop}\nRough size: ${$("#bW").value || "?"} W × ${$("#bH").value || "?"} H mm\n\n${estText ? estText + "\n\n" : ""}${notes || (estText ? "" : "(no notes)")}\n\nName: ${name}\nMobile: ${phone}`;
    window.open(wa(text), "_blank", "noopener");
  });
  // arriving from another page with a request already chosen
  const qs = new URLSearchParams(location.search);
  if (qs.get("need")) setNeed(qs.get("need"));
  if (qs.get("door")) { setNeed("Doors"); $("#bNotes").value = "Door type: " + qs.get("door") + ". Opening size (W × H mm) and how many doors: "; }
  if (qs.get("price")) addEventListener("DOMContentLoaded", () => { if (window.M2DCalc) M2DCalc.setItem(qs.get("price")); });
} else {
  $$("a[data-need]").forEach((l) => { l.href = "carpentry.html?need=" + encodeURIComponent(l.dataset.need) + "#quote"; });
  $$("a[data-door]").forEach((l) => { l.href = "carpentry.html?door=" + encodeURIComponent(l.dataset.door) + "#quote"; });
}

const TICK = ["Made in Singapore", "Built to order", "Site measurement", "Delivery and installation", "Soft-close hinges", "1-year warranty"];
if ($("#ticker")) $("#ticker").innerHTML = [...TICK, ...TICK, ...TICK, ...TICK].map((t) => `<span>${t}</span><i>✱</i>`).join("");

/* ═════ Cart: kept on this device, sent to the workshop on WhatsApp ═════ */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("m2dc-cart") || "[]").filter((l) => byId(l.id) && l.qty > 0); } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem("m2dc-cart", JSON.stringify(cart)); } catch (e) {} };
const toast = (m) => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200); };
function addToCart(id, n) {
  const line = cart.find((l) => l.id === id);
  if (line) line.qty = Math.min(20, line.qty + n); else cart.push({ id, qty: n });
  saveCart(); renderCart(); toast(`${byId(id).name} added to your cart`);
}
function renderCart() {
  const count = cart.reduce((s, l) => s + l.qty, 0), total = cart.reduce((s, l) => s + l.qty * byId(l.id).price, 0);
  const c = $("#cartCount"); c.textContent = count; c.hidden = !count;
  $("#cartBtn").setAttribute("aria-label", count ? `Open your cart, ${count} item${count > 1 ? "s" : ""}` : "Open your cart");
  if (!cart.length) {
    $("#cartLines").innerHTML = `<p class="cempty">Nothing here yet. Add a piece from the shop and it will wait for you here.</p>`;
    $("#cartFoot").innerHTML = `<a class="btn block" href="shop.html" data-close>See the furniture</a>`;
    return;
  }
  $("#cartLines").innerHTML = cart.map((l) => { const p = byId(l.id); return `
    <div class="cline">
      <div class="th" style="background-image:url(assets/shop/${p.id}.jpg)"></div>
      <div><strong>${p.name}</strong><em>${money(p.price)} · Walnut</em></div>
      <div><div class="qty"><button type="button" data-cq="${p.id}" data-d="-1" aria-label="Fewer">−</button><output>${l.qty}</output><button type="button" data-cq="${p.id}" data-d="1" aria-label="More">+</button></div>
        <button type="button" class="rm" data-rm="${p.id}">Remove</button></div>
    </div>`; }).join("");
  const text = "Hi M2D Carpentry, I'd like to order:\n" + cart.map((l) => `${l.qty} × ${byId(l.id).name} (${money(byId(l.id).price)} each)`).join("\n") + `\nTotal: ${money(total)}`;
  $("#cartFoot").innerHTML = `
    <div class="ctotal"><span>Total</span><strong>${money(total)}</strong></div>
    <p class="cnote">Built to order. We confirm measurements and a delivery date before taking payment. Delivery and placement are free within mainland Singapore for orders above $1,500.</p>
    <a class="btn block" href="${wa(text)}" target="_blank" rel="noopener">Send order on WhatsApp</a>`;
}
renderCart();

/* ═════ Panels: the piece card and the cart ═════ */
const card = $("#card"), cartEl = $("#cart"), back = $("#cardBack");
let openEl = null, lastFocus = null;
function show(el) {
  if (openEl && openEl !== el) { openEl.classList.remove("in"); openEl.hidden = true; }
  else lastFocus = document.activeElement;
  openEl = el; el.hidden = back.hidden = false; el.scrollTop = 0;
  requestAnimationFrame(() => { el.classList.add("in"); back.classList.add("in"); $(".card-x", el).focus({ preventScroll: true }); });
}
function hide() {
  if (!openEl) return;
  const el = openEl; openEl = null;
  el.classList.remove("in"); back.classList.remove("in");
  setTimeout(() => { if (!openEl) back.hidden = true; if (openEl !== el) el.hidden = true; }, reduce ? 0 : 320);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}
function goCalc(key) {
  if (!$("#calc")) { location.href = "carpentry.html?price=" + encodeURIComponent(key || "") + "#calc"; return; }
  hide();
  if (window.M2DCalc && key) M2DCalc.setItem(key);
  $("#calc").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}
function openCard(key) {
  const [kind, id] = key.split(":");
  const facts = [], btn = $("#cardBtn"), alt = $("#cardAlt"), buy = $("#cardBuy");
  btn.onclick = null; buy.innerHTML = "";
  if (kind === "p") {
    const p = byId(id);
    $("#cardImgs").innerHTML = `<img src="assets/shop/${p.id}.jpg" alt="${p.name}"><img class="sheet" src="assets/shop/${p.id}-sheet.jpg" alt="${p.name}, dimensions" loading="lazy">`;
    $("#cardRoom").textContent = p.room; $("#cardName").textContent = p.name;
    $("#cardPrice").textContent = money(p.price); $("#cardDesc").textContent = p.desc;
    facts.push(["Size", p.dimNote || `W ${p.W} × D ${p.D} × H ${p.H} mm`], ["Finish", "Walnut"],
      ["Built to order", "4–6 weeks for most pieces"], ["Installed by", "Our own team"]);
    buy.innerHTML = `<button type="button" class="btn" data-add="${p.id}" data-n="1">Add to cart</button>`;
    btn.className = "btn ghost block"; btn.textContent = "Enquire on WhatsApp"; btn.target = "_blank"; btn.rel = "noopener";
    btn.href = wa(`Hi M2D Carpentry, I'm interested in the ${p.name} (${money(p.price)}).`);
    alt.hidden = false; alt.textContent = "See the full page for this piece"; alt.target = "";
    alt.href = `${ITEM}#item-${p.id}`;
  } else {
    const b = BESPOKE[id];
    $("#cardImgs").innerHTML = b.img ? `<img src="${b.img}" alt="${b.name}">` : "";
    $("#cardRoom").textContent = "Bespoke carpentry"; $("#cardName").textContent = b.name;
    $("#cardPrice").textContent = ""; $("#cardDesc").textContent = b.desc;
    facts.push(["Made to", "Your size and laminate"], ["Installed by", "Our own team"]);
    btn.className = "btn block";
    if (b.calc) { btn.textContent = "Price it"; btn.href = "#calc"; btn.target = ""; btn.rel = ""; btn.onclick = (e) => { e.preventDefault(); goCalc(b.calc); }; }
    else { btn.textContent = b.btn; btn.href = b.href; btn.target = "_blank"; btn.rel = "noopener"; }
    alt.hidden = !b.calc; alt.textContent = "Or ask us on WhatsApp"; alt.target = "_blank";
    alt.href = wa(`Hi M2D Carpentry, I'd like to ask about ${b.name.toLowerCase()}.`);
  }
  $("#cardFacts").innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  $("#cardImgs").scrollLeft = 0;
  show(card);
}
document.addEventListener("click", (e) => {
  const t = e.target;
  const q = t.closest("[data-q]");
  if (q) { const id = q.dataset.q; qtyPick[id] = clamp((qtyPick[id] || 1) + +q.dataset.d, 1, 20); $$(`[data-qo="${id}"]`).forEach((o) => { o.textContent = qtyPick[id]; }); return; }
  const add = t.closest("[data-add]");
  if (add) { addToCart(add.dataset.add, +add.dataset.n || qtyPick[add.dataset.add] || 1); return; }
  const cq = t.closest("[data-cq]");
  if (cq) { const l = cart.find((x) => x.id === cq.dataset.cq); l.qty += +cq.dataset.d; if (l.qty < 1) cart = cart.filter((x) => x !== l); saveCart(); renderCart(); return; }
  const rm = t.closest("[data-rm]");
  if (rm) { cart = cart.filter((x) => x.id !== rm.dataset.rm); saveCart(); renderCart(); return; }
  if (t.closest("[data-close]")) { hide(); return; }
  const o = t.closest("[data-open]");
  if (o) openCard(o.dataset.open);
});
$("#cartBtn").addEventListener("click", () => show(cartEl));
$("#cardX").addEventListener("click", hide);
$("#cartX").addEventListener("click", hide);
back.addEventListener("click", hide);
back.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
back.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });

route(); // open straight onto a piece when the address names one

/* TEMPORARY: the 1 / 2 / 3 switcher for comparing the three home heroes */
(function heroTry() {
  const box = $("#heroTry");
  if (!box) return;
  box.innerHTML = "<span>Try the hero</span>" + Object.entries(HERO_SETS).map(([k, v]) =>
    `<button type="button" data-hero="${k}" aria-pressed="${k === heroPick}">${k} · ${v.name}</button>`).join("");
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-hero]"); if (!b) return;
    try { localStorage.setItem("m2dc-hero-v2", b.dataset.hero); } catch (err) {}
    location.href = "index.html?hero=" + b.dataset.hero;
  });
})();

/* ═════ Header: the menu button on phones ═════ */
(function menu() {
  const btn = $("#menuBtn"), bar = $("#top");
  if (!btn) return;
  const set = (open) => { bar.classList.toggle("open", open); btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => set(!bar.classList.contains("open")));
  $("#topNav").addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#top")) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
})();

/* ═════ Behind the scenes: the crew ferris wheel ═════
   The photos sit on the rim of a big wheel whose middle is off to the right, so the part we see is a gentle arc.
   The wheel turns upwards on its own; scrolling the page nudges it along, pointing at it slows it to a stop,
   and with a mouse you can drag it up or down. The photos stay upright like the cabins on a wheel. */
(function crewWheel() {
  const box = $("#crewWheel");
  if (!box) return;
  const cards = [...box.querySelectorAll(".wh-card")], n = cards.length, frame = $(".wh-frame", box);
  const no = $("#crewNo"), cap = $("#crewCap");
  let W = 0, H = 0, cw = 0, ch = 0, R = 0, gap = 0, L = 0, cx = 0, cy = 0;
  let off = 0, speed = 0, last = 0, seen = true, over = false, drag = null, push = 0, lastY = scrollY, front = -1;
  const size = () => {
    W = box.clientWidth; H = box.clientHeight;
    const phone = innerWidth <= 820;
    cw = Math.min(W * (phone ? 0.8 : 0.7), 560); ch = cw * 0.75;
    gap = ch * 1.1; L = gap * n;
    R = Math.max(H * 1.25, 760);
    cx = W * (phone ? 0.47 : 0.44) + R; cy = H / 2;           // the middle of the wheel, off to the right
    box.style.setProperty("--cw", cw + "px");
    if (frame) frame.style.transform = `translate(${cx - R - cw / 2}px,${cy - ch / 2}px)`;
  };
  const place = () => {
    let best = 1e9, bi = 0;
    cards.forEach((c, i) => {
      let s = (i * gap + off) % L; if (s < 0) s += L; if (s >= L / 2) s -= L;   // distance along the rim from the middle
      const th = s / R, x = cx - R * Math.cos(th), y = cy - R * Math.sin(th);
      const far = Math.min(1, Math.abs(s) / (H * 0.58));
      const k = 1 - 0.34 * Math.pow(far, 1.25);
      const edge = (H / 2 + ch * 0.35 - Math.abs(y - cy)) / (ch * 0.95);
      const o = Math.max(0, Math.min(1, edge));
      if (o <= 0 || Math.abs(s) > H * 0.8) { c.style.visibility = "hidden"; return; } // only the front of the wheel is seen
      c.style.visibility = "";
      c.style.transform = `translate3d(${x - cw / 2}px,${y - ch / 2}px,0) scale(${k})`;
      c.style.opacity = o;
      c.style.zIndex = 100 - Math.round(Math.abs(s) / gap * 10);
      c.style.setProperty("--d", far.toFixed(3));
      if (Math.abs(s) < best) { best = Math.abs(s); bi = i; }
    });
    if (bi !== front) {
      front = bi;
      if (no) no.textContent = String(bi + 1).padStart(2, "0");
      if (cap) { cap.classList.remove("on"); void cap.offsetWidth; cap.textContent = cards[bi].querySelector("img").alt; cap.classList.add("on"); }
    }
  };
  size(); place();
  try { new ResizeObserver(() => { size(); place(); }).observe(box); } catch (e) { addEventListener("resize", () => { size(); place(); }); }
  if (reduce) return; // stays still, showing the first photo in the middle
  try { new IntersectionObserver((es) => { seen = es[0].isIntersecting; }, { rootMargin: "120px 0px" }).observe(box); } catch (e) {}
  box.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") over = true; });
  box.addEventListener("pointerleave", () => { over = false; });
  box.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; drag = { y: e.clientY, o: off }; box.classList.add("drag"); box.setPointerCapture(e.pointerId); });
  box.addEventListener("pointermove", (e) => { if (drag) off = drag.o - (e.clientY - drag.y); });
  const up = () => { drag = null; box.classList.remove("drag"); };
  box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
  addEventListener("scroll", () => { const d = scrollY - lastY; lastY = scrollY; if (seen) push += Math.max(-60, Math.min(60, d)) * 0.45; }, { passive: true });
  const step = (now) => {
    const dt = Math.min(64, now - (last || now)); last = now;
    if (seen) {
      const want = drag || over ? 0 : (innerWidth <= 820 ? 0.03 : 0.038);   // pixels of rim per millisecond
      speed += (want - speed) * Math.min(1, dt / 420);                       // ease to a stop and back up to speed
      const nudge = push * Math.min(1, dt / 160); push -= nudge;
      if (!drag) off += speed * dt + nudge;
      place();
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();

/* The calculator's 3D preview is a large file, so it loads only when the calculator is near. */
try {
  const io = new IntersectionObserver((es) => {
    if (!es.some((x) => x.isIntersecting)) return;
    io.disconnect();
    const s = document.createElement("script"); s.src = "m2d3d.js?v=12";
    s.onload = () => window.M2DCalc && M2DCalc.recalc();
    document.body.appendChild(s);
  }, { rootMargin: "1200px 0px" });
  io.observe($("#calc"));
} catch (e) {}

/* ═════ Words ease in as they scroll into view ═════
   Headings, paragraphs, buttons, list items and pictures in the text sections rise a little and fade in,
   each a beat after the one before. The class is taken off again afterwards so hover effects work as normal.
   The hero, the tiles, the calculator and the forms are left alone. */
(function reveal() {
  const root = document.documentElement;
  if (!root.classList.contains("rv-pre")) return;
  try {
    const SKIP = ".pgrid, .item, #calc, form, .crew, .ticker, .tour, .shop-hero, .tm, .rvw-cols, .intro-h, .process, .pfh, .rp, .arts, .qc, .svc-grid, .counts, .mag, [hidden]";
    const all = $$("main section.block").flatMap((sec) => [...sec.querySelectorAll(".eyebrow, h1, h2, h3, .lede, p, .btn, figure, li, dl > div, details, blockquote, .chips")])
      .filter((el) => !el.closest(SKIP));
    const set = new Set(all);
    const els = all.filter((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) if (set.has(p)) return false; // animate the outer block, not each thing inside it
      const cs = getComputedStyle(el);
      return cs.transform === "none" && cs.animationName === "none" && cs.display !== "none";
    });
    // things on the left of the page come in from the left, things on the right from the right;
    // in the middle, words come from the left and pictures from the right
    const vw = root.clientWidth;
    els.forEach((el) => {
      const r = el.getBoundingClientRect(), cx = (r.left + r.right) / 2, pic = el.matches("figure, .ctile");
      el.classList.add("rv", cx > vw * 0.56 ? "rv-r" : cx < vw * 0.44 ? "rv-l" : pic ? "rv-r" : "rv-l");
    });
    const io = new IntersectionObserver((es) => {
      const now = es.filter((e) => e.isIntersecting).map((e) => e.target).sort((a, b) => {
        const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
        return (A.top - B.top) || (A.left - B.left);
      });
      now.forEach((el, i) => {
        io.unobserve(el);
        const d = Math.min(i, 7) * 90;
        el.style.transitionDelay = d + "ms";
        el.classList.add("in");
        setTimeout(() => { el.classList.remove("rv", "rv-l", "rv-r", "in"); el.style.transitionDelay = ""; }, d + 1250);
      });
    }, { rootMargin: "0px 0px -7% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } catch (e) {}
  root.classList.remove("rv-pre");
})();

/* ═════ The three numbered crew photos on Home ═════
   As each row scrolls into view its photo wipes in from the side, the thin outline slides out from behind it,
   the number appears and the words rise. All of that is CSS; this only says when a row has arrived. */
(function teamRows() {
  // the label, the big heading, the buttons and the three rows: each plays its entrance every time it comes back into view
  const rows = $$(".tm-row, .intro-h, .rp");
  if (!rows.length || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("tm-on");
  const show = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
    { rootMargin: "0px 0px -12% 0px", threshold: 0.18 });
  // once a piece has left the screen completely it is put back to its starting place, ready to play again
  const hide = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) e.target.classList.remove("in"); }), { threshold: 0 });
  rows.forEach((r) => { show.observe(r); hide.observe(r); });
})();

/* Reviews: each column of cards is doubled so it can drift round without a visible join. */
$$(".rvw-track").forEach((t) => [...t.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); t.appendChild(c); }));

/* Calculator: the preview card stays in view on the right. If a short screen cannot fit all of it,
   it sits lower so the price and buttons stay on screen. */
(function keepCardInView() {
  const card = $(".est-card");
  if (!card) return;
  const fit = () => { const room = innerHeight - 112; card.style.top = innerWidth > 900 && card.offsetHeight > room ? (innerHeight - card.offsetHeight - 16) + "px" : ""; };
  fit(); addEventListener("resize", fit);
  try { new ResizeObserver(fit).observe(card); } catch (e) {}
})();

/* ═════ Portfolio: the slanted wall of photos ═════
   Three columns on a tilted plane. Columns one and three drift up, the middle one drifts down, each at its own pace,
   for ever (each column holds its photos three times over). Scrolling the page pushes them along, and the whole wall
   leans a little towards the mouse. Pointing at it does not stop it. */
(function pfWall() {
  const stage = $(".pfh-stage"), wall = $("#pfWall");
  if (!wall) return;
  const cols = $$(".wl-col", wall).map((col, i) => {
    const track = $(".wl-track", col), n = track.children.length, first = [...track.children];
    for (let k = 0; k < 2; k++) first.forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); d.tabIndex = -1; track.appendChild(d); });
    return { track, n, dir: i % 2 ? -1 : 1, speed: [0.03, 0.024, 0.036][i % 3], pos: 0, set: 0, at: [0.15, 0.6, 0.4][i % 3] };
  });
  const measure = () => cols.forEach((c) => { const s = c.track.children[c.n].offsetTop - c.track.children[0].offsetTop; if (s > 0) { c.pos = c.set ? c.pos / c.set * s : s * c.at; c.set = s; } });
  const place = () => cols.forEach((c) => { c.track.style.transform = `translate3d(0,${-c.pos}px,0)`; });
  measure(); place();
  try { new ResizeObserver(() => { measure(); place(); }).observe(wall); } catch (e) { addEventListener("resize", () => { measure(); place(); }); }
  if (reduce) return;
  let last = 0, seen = true, push = 0, lastY = scrollY, mx = 0, my = 0, rx = 14, ry = -16;
  try { new IntersectionObserver((es) => { seen = es[0].isIntersecting; }, { rootMargin: "100px 0px" }).observe(stage); } catch (e) {}
  addEventListener("scroll", () => { const d = scrollY - lastY; lastY = scrollY; push += clamp(d, -90, 90) * 0.55; }, { passive: true });
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = clamp((e.clientX - innerWidth / 2) / (innerWidth / 2), -1, 1); my = clamp((e.clientY - innerHeight / 2) / (innerHeight / 2), -1, 1);
  }, { passive: true });
  const step = (now) => {
    const dt = Math.min(64, now - (last || now)); last = now;
    if (seen) {
      const nudge = push * Math.min(1, dt / 180); push -= nudge;
      cols.forEach((c) => { if (!c.set) return; c.pos += c.dir * (c.speed * dt + nudge * (0.7 + c.speed * 10)); c.pos = ((c.pos % c.set) + c.set) % c.set; });
      rx += (14 - my * 5 - rx) * 0.06; ry += (-16 + mx * 7 - ry) * 0.06;   // the lean eases towards the mouse
      wall.style.setProperty("--rx", rx.toFixed(2) + "deg"); wall.style.setProperty("--ry", ry.toFixed(2) + "deg");
      place();
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();
if ($("#pjGrid")) dropCards($("#pjGrid"));
$$(".arts").forEach((g) => dropCards(g)); // article cards drop in one after another too

/* Opening a home: the photo you pressed swells a little while the page fades to white, then the home opens. */
document.addEventListener("click", (e) => {
  const a = e.target.closest("a.wl-card, .pj a.sc-link, .proj-nav a");
  if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
  e.preventDefault();
  const veil = document.createElement("div"); veil.className = "veil"; document.body.appendChild(veil);
  const img = a.querySelector("img");
  if (img) { img.style.transition = "transform 1s cubic-bezier(.5,0,.2,1)"; img.style.transform = "scale(1.22)"; }
  requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add("on")));
  setTimeout(() => { location.href = a.href; }, 560);
});
addEventListener("pageshow", () => $$(".veil").forEach((v) => v.remove())); // coming back with the Back button

/* A home's page: each mosaic's photos fly in from their own corners when it scrolls into view (as on m2decor.com). */
(function mosaics() {
  const list = $$("[data-mz]");
  if (!list.length || reduce || !("IntersectionObserver" in window) || !document.body.animate) return;
  const far = Math.max(innerWidth, innerHeight) * 0.55;
  list.forEach((mz) => {
    const box = mz.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
    $$(".mz__t", mz).forEach((t) => {
      const r = t.getBoundingClientRect(), dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy, len = Math.hypot(dx, dy) || 1;
      t.dataset.from = `translate(${(dx / len * far).toFixed(1)}px,${(dy / len * far).toFixed(1)}px) scale(.85)`; // out past its own corner
      t.style.opacity = "0";
    });
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const tiles = $$(".mz__t", e.target), order = tiles.map((_, i) => i).sort(() => Math.random() - 0.5);
    tiles.forEach((t, i) => {
      t.style.opacity = "";
      t.animate([{ opacity: 0, transform: t.dataset.from }, { opacity: 1, transform: "none" }],
        { duration: 1250, delay: order.indexOf(i) * 70, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
    });
  }), { rootMargin: "0px 0px -16% 0px", threshold: 0.05 });
  list.forEach((mz) => io.observe(mz));
})();

/* Home, the process: the step crossing the middle of the screen is the live one, and the photo follows it. */
(function procSteps() {
  const steps = $$(".pstep"), pics = $$(".process-media img");
  if (!steps.length || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const k = steps.indexOf(e.target);
    steps.forEach((s, i) => s.classList.toggle("on", i === k));
    pics.forEach((p, i) => p.classList.toggle("on", i === k));
  }), { rootMargin: "-49% 0px -49% 0px" });
  steps.forEach((s) => io.observe(s));
})();

/* ═════ Home: the small price calculator ═════
   Piece, width and colour on the left; the live 3D preview and the price follow. The sums are Ben's own (calc.js),
   and both that file and the 3D drawing code load only when this part of the page is near. */
(function quickCalc() {
  const box = $("#quick");
  if (!box) return;
  const cv = $("#qcCanvas"), FT = 304.8;
  const load = (src) => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.body.appendChild(s); });
  let item = "wardrobe", ft = 8, col = "oak", studio = null, timer = 0, shown = "";
  const COLS = ["oak", "walnut", "teak", "blackteak", "flat"];
  const paint = () => {
    const M = window.M2DPrice;
    if (!M) return;
    const it = M.PRICING.items[item], W = ft * FT, r = M.quick(item, W, it.H, col);
    $("#qcPrice").textContent = `${money(r.lo)} – ${money(r.hi)}`;
    $("#qcSub").textContent = it.unit === "sqft" ? `${it.label}, ${r.qty} sq ft` : `${it.label}, ${r.ft} ft run`;
    $("#qcSize").textContent = Math.round(W).toLocaleString("en-SG") + " mm wide";
    $("#qcMore").href = "carpentry.html?price=" + item + "#calc";
    $$("#qcItems button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.item === item));
    $$("#qcWidths button").forEach((b) => b.setAttribute("aria-pressed", +b.dataset.ft === ft));
    $$("#qcCols button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.col === col));
    if (!studio) return;
    try {
      if (shown !== item) { studio.resetView(); shown = item; }
      const [name, opts] = M.view(item, W, it.H, r.v);
      studio.show(name, opts, col);
      clearTimeout(timer); studio.quickTo(cv); timer = setTimeout(() => studio.progressive(cv, 12), 120);
    } catch (e) {}
  };
  const widths = () => {
    const it = window.M2DPrice.PRICING.items[item];
    $("#qcWidths").innerHTML = it.presets.map((f) => `<button type="button" data-ft="${f}">${f} ft</button>`).join("");
    ft = it.presets.reduce((a, b) => (Math.abs(b * FT - it.W) < Math.abs(a * FT - it.W) ? b : a)); // start at the usual width
  };
  const start = async () => {
    try { await load("calc.js?v=" + (document.querySelector('script[src^="app.js"]') || { src: "" }).src.split("v=")[1]); } catch (e) { return; }
    const M = window.M2DPrice;
    if (!M) return;
    $("#qcItems").innerHTML = Object.entries(M.PRICING.items).map(([k, it]) => `<button type="button" data-item="${k}">${it.label}</button>`).join("");
    $("#qcCols").innerHTML = COLS.map((c) => M.swatch(c, c === col)).join("");
    widths(); paint();
    box.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.item) { item = b.dataset.item; widths(); }
      else if (b.dataset.ft) ft = +b.dataset.ft;
      else if (b.dataset.col) col = b.dataset.col;
      else return;
      paint();
    });
    try {
      if (!window.M2D3D) await load("m2d3d.js?v=12");
      const sharp = (devicePixelRatio || 1) > 1 && !matchMedia("(pointer:coarse)").matches, off = document.createElement("canvas");
      cv.width = sharp ? 1280 : 960; cv.height = sharp ? 960 : 720;
      studio = M2D3D.createStudio(off, cv.width, cv.height, { shadow: 2048, ao: !matchMedia("(pointer:coarse)").matches });
      let drag = null;
      cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener("pointermove", (e) => { if (!drag) return; studio.orbit(-(e.clientX - drag.x) * 0.35, (e.clientY - drag.y) * 0.15); drag = { x: e.clientX, y: e.clientY }; studio.quickTo(cv); });
      const up = () => { if (drag) { drag = null; studio.progressive(cv, 12); } };
      cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
      box.classList.add("ready");
      paint();
    } catch (e) {}
  };
  try {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "1400px 0px" });
    io.observe(box);
  } catch (e) { start(); }
})();

/* Footer: the big word is sized so it runs exactly from one side of the footer to the other. */
(function footBig() {
  const p = $(".foot-big"), s = p && p.firstElementChild;
  if (!s) return;
  const fit = () => { p.style.fontSize = "100px"; const w = s.getBoundingClientRect().width; if (w > 0) p.style.fontSize = (100 * p.clientWidth / w).toFixed(2) + "px"; };
  fit(); addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();

/* Home, the four divisions: the panels open one after another, left to right, when they scroll into view. */
(function divisions() {
  if (reduce || !("IntersectionObserver" in window)) return;
  $$(".svc-grid").forEach((grid) => { // Home's four divisions and the Carpentry page's four doors
    grid.classList.add("wait");
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { grid.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -14% 0px", threshold: 0.12 });
    io.observe(grid);
  });
})();

/* ═════ Contact form ═════
   Sent the way M2D's own contact form is: by FormSubmit, straight to the enquiry inbox named on the form.
   A hidden field catches bots, and the visitor is never left waiting more than 30 seconds. */
(function enquiry() {
  const form = $("#enquiry");
  if (!form) return;
  const status = $(".cform__status", form), btn = $("button[type=submit]", form), was = btn.textContent;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form);
    if ((d.get("_honey") || "").trim()) return; // a bot filled the hidden field
    const name = (d.get("name") || "").trim();
    btn.disabled = true; form.classList.add("is-sending"); btn.textContent = form.dataset.sending;
    status.textContent = form.dataset.wait; status.className = "cform__status"; status.hidden = false;
    const stop = new AbortController(), timer = setTimeout(() => stop.abort(), 30000);
    try {
      const r = await fetch("https://formsubmit.co/ajax/" + encodeURIComponent(form.dataset.to), {
        method: "POST", signal: stop.signal, headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "M2D Carpentry website enquiry: " + name + " (" + d.get("property") + ")", _template: "table", _captcha: "false", _replyto: d.get("email"),
          Name: name, Email: d.get("email"), Phone: d.get("phone"), Property: d.get("property"), "How they know us": d.get("source"), Message: d.get("message") || "-", Page: location.href,
        }),
      });
      const out = await r.json().catch(() => ({}));
      if (!r.ok || String(out.success) === "false") throw new Error(out.message || "send failed");
      form.reset(); form.classList.add("is-sent");
      status.textContent = form.dataset.thanks; status.className = "cform__status is-ok";
    } catch (err) {
      status.textContent = form.dataset.error; status.className = "cform__status is-err";
    }
    clearTimeout(timer); btn.textContent = was; status.hidden = false; btn.disabled = false; form.classList.remove("is-sending");
  });
})();

/* Carpentry page: the team build film plays once behind the heading and stops on the finished room. It never loops.
   If the film cannot play (reduced motion, a phone saving power, a failed download) the finished room is shown instead. */
(function buildFilm() {
  const hero = $("#cph");
  if (!hero) return;
  const bg = hero.querySelector(".chero__bg"), still = bg.querySelector("img");
  const finished = () => { still.src = asset("assets/carpentry-hero/end.jpg"); };
  if (reduce) { finished(); return; }
  const v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.loop = false;
  v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
  v.src = asset(innerWidth * Math.min(2, devicePixelRatio || 1) >= 1100 ? "assets/carpentry-hero/build-1080.mp4" : "assets/carpentry-hero/build-720.mp4");
  bg.appendChild(v);
  let gone = false;
  const back = () => { if (gone) return; gone = true; v.remove(); hero.classList.remove("playing"); finished(); };
  v.addEventListener("playing", () => hero.classList.add("playing"));
  v.addEventListener("ended", finished); // the film stays on its last frame; the same picture now sits behind it
  v.addEventListener("error", back);
  const p = v.play();
  if (p && p.catch) p.catch(back);
})();

/* Reviews: with the pointer over the cards the drift stops (CSS) and the wheel scrolls the reviews instead of the page,
   as on voila.sg. The drift is a CSS animation, so scrolling simply moves that animation's clock forwards or backwards;
   it loops, so the cards never run out. Laptops only: on phones the cards are a sideways strip. */
(function reviewsWheel() {
  const box = $("#rvwCols");
  if (!box || reduce || !matchMedia("(hover:hover)").matches) return;
  const tracks = $$(".rvw-track", box);
  let target = 0, at = 0, raf = 0;
  const step = () => {
    const d = (target - at) * 0.18;
    at += d;
    tracks.forEach((t) => {
      const an = t.getAnimations ? t.getAnimations()[0] : null;
      if (!an || !an.effect) return;
      const D = an.effect.getComputedTiming().duration, half = t.scrollHeight / 2;
      if (!D || !half) return;
      const dir = t.parentElement.classList.contains("b") ? -1 : 1; // the second column drifts the other way
      const ct = (an.currentTime || 0) + dir * (d / half) * D;
      an.currentTime = ((ct % D) + D) % D;
    });
    raf = Math.abs(target - at) > 0.5 ? requestAnimationFrame(step) : 0;
  };
  box.addEventListener("wheel", (e) => {
    if (innerWidth <= 900 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    e.preventDefault();
    target += e.deltaY;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: false });
})();

/* Home, the brown band: each number counts up from zero when it scrolls into view, one after another
   (the timing of the counters on m2decor.com). The page already holds the finished numbers, so nothing is lost
   where motion is turned off or the counting cannot run. */
(function counters() {
  const els = $$("[data-count]");
  if (!els.length || reduce || !("IntersectionObserver" in window)) return;
  const box = els[0].closest(".counts");
  if (box) box.classList.add("wait");
  els.forEach((el) => { el.textContent = "0"; });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    if (box) box.classList.add("in");
    const el = e.target, end = parseFloat(el.dataset.count), dur = 2200, t0 = performance.now() + els.indexOf(el) * 180;
    const step = (t) => { const k = clamp((t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = v; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(() => { el.textContent = end; }, dur + 1400); // the finished number, even if the page was in the background
  }), { threshold: 0.5 });
  els.forEach((el) => io.observe(el));
})();

/* Our story: the big title and each row slide in from their own side, and play again each time they come back
   into view (the same behaviour as the numbered rows on Home). */
(function magStory() {
  const els = $$(".mag [data-mag]");
  if (!els.length || reduce || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("mag-on");
  const show = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }), { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  const hide = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) e.target.classList.remove("in"); }), { threshold: 0 });
  els.forEach((el) => { show.observe(el); hide.observe(el); });
})();

/* Buttons, as on m2decor.com: the label is written twice, one above the other; on hover the first rolls up and
   away and the second rolls in from below. Buttons that scripts add or relabel later are wrapped as well. */
(function rollButtons() {
  if (reduce) return;
  const wrap = (b) => {
    if (b.classList.contains("sc-add")) return;
    [...b.childNodes].forEach((n) => {
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const t = n.textContent.trim(), w = document.createElement("span");
      w.className = "btn__t";
      const one = document.createElement("span"), two = document.createElement("span");
      one.textContent = t; two.textContent = t; two.setAttribute("aria-hidden", "true");
      w.append(one, two);
      n.replaceWith(w);
    });
  };
  const all = (root) => { if (root.matches && root.matches(".btn")) wrap(root); if (root.querySelectorAll) root.querySelectorAll(".btn").forEach(wrap); };
  all(document);
  if ("MutationObserver" in window) new MutationObserver((ms) => ms.forEach((m) => {
    if (m.target.nodeType === 1 && m.target.closest(".btn__t")) return;
    m.addedNodes.forEach((n) => { if (n.nodeType === 1) all(n); else if (n.nodeType === 3 && m.target.matches && m.target.matches(".btn")) wrap(m.target); });
  })).observe(document.body, { childList: true, subtree: true });
})();
