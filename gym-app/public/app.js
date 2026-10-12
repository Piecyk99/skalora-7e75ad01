(function () {
  "use strict";
  var app = document.getElementById("app");
  var now0 = new Date();
  var state = {
    tab: "today", day: today(), sets: [], exercises: [], selEx: null, progMode: "ex",
    catalog: null, byId: {}, byName: {}, catFilter: "all", catQuery: "",
    prefillEx: null, planId: null, planMode: "plans", session: null, rest: null,
    userPlans: [], schedule: {}, edit: null,
    cal: { y: now0.getFullYear(), m: now0.getMonth(), sel: null }
  };
  var DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];
  var DOW_NAMES = { 0: "Niedziela", 1: "Poniedziałek", 2: "Wtorek", 3: "Środa", 4: "Czwartek", 5: "Piątek", 6: "Sobota" };
  var DOW_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

  // ---------- helpers ----------
  function p2(n) { return n < 10 ? "0" + n : "" + n; }
  function dstr(d) { return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); }
  function today() { return dstr(new Date()); }
  function parseDay(s) { return new Date(s + "T00:00:00"); }
  function fmtDay(s) { return parseDay(s).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" }); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "value") e.value = attrs[k];
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function fmt(n) { return (Math.round(n * 10) / 10).toString().replace(".", ","); }
  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + p2(s % 60); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function api(path, method, body) {
    return fetch(path, { method: method || "GET", headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin" })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || "err"); e.status = r.status; e.data = j; throw e; } return j; }); });
  }
  function clear() { while (app.firstChild) app.removeChild(app.firstChild); }
  function scrollTop() { window.scrollTo(0, 0); }
  function minutes(sess) {
    if (!sess || !sess.started_at || !sess.finished_at) return null;
    var m = Math.round((Date.parse(sess.finished_at) - Date.parse(sess.started_at)) / 60000);
    return m > 0 && m < 600 ? m : null;
  }

  // ---------- catalog & plans ----------
  function loadCatalog() {
    if (state.catalog) return Promise.resolve();
    return fetch("/exercises.json").then(function (r) { return r.json(); }).then(function (c) {
      state.catalog = c;
      c.exercises.forEach(function (e) { state.byId[e.id] = e; state.byName[e.name_pl] = e; });
    });
  }
  function loadUserData() {
    return Promise.all([api("/api/plans"), api("/api/schedule")]).then(function (r) { state.userPlans = r[0]; state.schedule = r[1].schedule; });
  }
  function allPlans() { return state.catalog.plans.concat(state.userPlans); }
  function planById(id) { return allPlans().filter(function (p) { return p.id === id; })[0]; }
  function planName(id, fallback) {
    if (id === "rest") return "Odpoczynek";
    var p = planById(id); return p ? p.name : (fallback || "Usunięty plan");
  }
  function planItems(p) { return p.items.filter(function (it) { return state.byId[it.exercise_id]; }); }
  function plannedFor(day, overrides) {
    if (overrides && overrides[day] !== undefined) return overrides[day];
    return state.schedule[parseDay(day).getDay()] || null;
  }
  function planSelect(value, withDefault, onchange) {
    var sel = el("select", { onchange: function (e) { onchange(e.target.value); } });
    sel.appendChild(el("option", { value: "", text: withDefault ? "Wg harmonogramu" : "— brak planu —" }));
    sel.appendChild(el("option", { value: "rest", text: "Odpoczynek" }));
    var g1 = el("optgroup", { label: "Gotowe plany" }); state.catalog.plans.forEach(function (p) { g1.appendChild(el("option", { value: p.id, text: p.name })); });
    sel.appendChild(g1);
    if (state.userPlans.length) { var g2 = el("optgroup", { label: "Moje plany" }); state.userPlans.forEach(function (p) { g2.appendChild(el("option", { value: p.id, text: p.name })); }); sel.appendChild(g2); }
    sel.value = value || "";
    return sel;
  }
  function parseReps(s) {
    var m = String(s).match(/(\d+)\s*[–-]\s*(\d+)/);
    if (m) return { lo: +m[1], hi: +m[2] };
    var n = String(s).match(/\d+/);
    return n ? { lo: +n[0], hi: +n[0] } : { lo: 0, hi: 0 };
  }
  function increment(ex) { return ex.equipment.join(" ").toLowerCase().indexOf("hantl") >= 0 ? 2 : 2.5; }
  // Rozgrzewka wg zasad katalogu: pierwsze wielostawowe 50%x10, 70%x5, 85%x2; kolejne wielostawowe 1 seria 70%x5; izolacje bez.
  function warmupPlan(ex, firstMulti, workW) {
    if (!(workW > 0) || ex.type !== "wielostawowe") return [];
    var scheme = firstMulti ? [[0.5, 10], [0.7, 5], [0.85, 2]] : [[0.7, 5]];
    var eq = ex.equipment;
    var step = eq.join(" ").toLowerCase().indexOf("hantl") >= 0 ? 1 : 2.5;
    var bar = eq.some(function (e) { return e === "sztanga" || e.indexOf("sztanga +") === 0; });
    var out = [];
    scheme.forEach(function (sc) {
      var w = Math.round(workW * sc[0] / step) * step;
      if (bar) w = Math.max(w, 20);
      if (w >= workW || (out.length && out[out.length - 1].w >= w)) return;
      out.push({ w: w, r: sc[1] });
    });
    return out;
  }
  // Progresja podwójna z katalogu: wszystkie serie na górze zakresu => dołóż ciężar.
  function suggestion(item, ex, last) {
    if (!last || !last.sets || !last.sets.length) return null;
    var r = parseReps(item.reps);
    var maxW = Math.max.apply(null, last.sets.map(function (s) { return s.weight; }));
    var allTop = last.sets.length >= item.sets && last.sets.every(function (s) { return s.reps >= r.hi; });
    var txt = last.sets.map(function (s) { return fmt(s.weight) + "×" + s.reps; }).join(", ");
    if (allTop) return { weight: maxW + increment(ex), reps: r.lo, text: "Ostatnio (" + last.day + "): " + txt + ". Góra zakresu we wszystkich seriach: dołóż do " + fmt(maxW + increment(ex)) + " kg i wróć do " + r.lo + " powt." };
    return { weight: last.sets[0].weight, reps: last.sets[0].reps, text: "Ostatnio (" + last.day + "): " + txt + ". Celuj w więcej powtórzeń do " + r.hi + "." };
  }

  // ---------- rest timer ----------
  var restBar = el("div", { id: "restbar", class: "hidden" });
  var restTick = null, audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination); o.frequency.value = 880; g.gain.value = 0.15;
      o.start(); o.stop(audioCtx.currentTime + 0.35);
    } catch (e) { /* brak dźwięku */ }
  }
  function startRest(sec, label) {
    try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === "suspended") audioCtx.resume(); } catch (e) { /* ok */ }
    state.rest = { end: Date.now() + sec * 1000, label: label || "" };
    document.body.classList.add("resting");
    drawRest();
    if (!restTick) restTick = setInterval(drawRest, 250);
  }
  function stopRest() {
    state.rest = null;
    if (restTick) { clearInterval(restTick); restTick = null; }
    restBar.className = "hidden";
    document.body.classList.remove("resting");
  }
  function drawRest() {
    if (!state.rest) return;
    var left = (state.rest.end - Date.now()) / 1000;
    if (left <= 0) { stopRest(); if (navigator.vibrate) navigator.vibrate([250, 120, 250]); beep(); return; }
    while (restBar.firstChild) restBar.removeChild(restBar.firstChild);
    restBar.className = "";
    restBar.appendChild(el("div", { class: "t", text: mmss(left) }));
    restBar.appendChild(el("div", { class: "l", text: "Przerwa" + (state.rest.label ? " · " + state.rest.label : "") }));
    restBar.appendChild(el("button", { class: "sec", text: "+30 s", onclick: function () { state.rest.end += 30000; drawRest(); } }));
    restBar.appendChild(el("button", { class: "sec", text: "Pomiń", onclick: stopRest }));
  }

  // ---------- auth ----------
  function authScreen(setup) {
    clear();
    var pin = el("input", { type: "password", inputmode: "numeric", pattern: "[0-9]*", maxlength: "12", class: "pin", autocomplete: setup ? "new-password" : "current-password", placeholder: "••••" });
    var pin2 = setup ? el("input", { type: "password", inputmode: "numeric", pattern: "[0-9]*", maxlength: "12", class: "pin mt", placeholder: "powtórz" }) : null;
    var err = el("div", { class: "err" });
    var btn = el("button", { class: "mt", text: setup ? "Ustaw PIN" : "Wejdź", onclick: go });
    function go() {
      err.textContent = "";
      if (setup && pin.value !== pin2.value) { err.textContent = "PIN-y się różnią"; return; }
      api(setup ? "/api/setup" : "/api/login", "POST", { pin: pin.value }).then(boot).catch(function (e) {
        err.textContent = e.data && e.data.error === "locked" ? "Za dużo prób. Spróbuj za " + Math.ceil(e.data.retry_s / 60) + " min" :
          e.data && e.data.error === "pin_format" ? "PIN: 4-12 cyfr" : "Zły PIN";
      });
    }
    pin.addEventListener("keydown", function (e) { if (e.key === "Enter" && !setup) go(); });
    app.appendChild(el("div", { class: "center" }, [
      el("h1", { text: setup ? "Ustaw PIN" : "Gym" }),
      el("p", { class: "mut", text: setup ? "To pierwsze uruchomienie. PIN chroni Twoje dane (4-12 cyfr)." : "Podaj PIN" }),
      pin, pin2, btn, err
    ]));
    setTimeout(function () { pin.focus(); }, 50);
  }

  // ---------- shell ----------
  function goTab(t) { state.tab = t; state.planId = null; state.session = null; state.edit = null; render(); scrollTop(); }
  function shell(content) {
    clear();
    app.appendChild(content);
    var tabs = [["today", "🏋️", "Dziś"], ["cal", "📅", "Kalendarz"], ["plan", "📋", "Plan"], ["prog", "📈", "Postępy"], ["more", "⚙️", "Więcej"]];
    var old = document.querySelector("nav"); if (old) old.remove();
    document.body.appendChild(el("nav", {}, tabs.map(function (t) {
      return el("button", { class: state.tab === t[0] ? "on" : "", onclick: function () { goTab(t[0]); } }, [el("span", { text: t[1] }), t[2]]);
    })));
    if (!restBar.parentNode) document.body.appendChild(restBar);
  }
  function render() {
    if (state.tab === "today") viewToday();
    else if (state.tab === "cal") viewCalendar();
    else if (state.tab === "plan") {
      if (state.session) viewSession();
      else if (state.edit) viewEdit();
      else if (state.planId) viewPlan();
      else if (state.planMode === "catalog") viewCatalog();
      else viewPlans();
    }
    else if (state.tab === "prog") viewProg();
    else viewMore();
  }

  // ---------- exercise detail sheet ----------
  function closeModal() { var m = document.getElementById("modal"); if (m) m.remove(); document.body.classList.remove("lock"); }
  function listBlock(title, arr, ordered) {
    if (!arr || !arr.length) return null;
    return el("div", {}, [el("h2", { text: title }), el(ordered ? "ol" : "ul", {}, arr.map(function (t) { return el("li", { text: t }); }))]);
  }
  function openDetail(id) {
    var ex = state.byId[id]; if (!ex) return;
    closeModal();
    var d = ex.default;
    var sheet = el("div", { class: "sheet", onclick: function (e) { e.stopPropagation(); } }, [
      el("div", { class: "bar" }, [el("button", { class: "mini", text: "Zamknij ✕", onclick: closeModal })]),
      el("img", { class: "ex", src: "/" + ex.image, alt: ex.name_pl }),
      el("h1", { class: "mt", text: ex.name_pl }),
      el("div", { class: "mut mb", text: ex.name_en }),
      el("div", {}, [cap(ex.category), cap(ex.type)].concat(ex.equipment).map(function (t) { return el("span", { class: "tag", text: t }); })),
      el("p", { class: "mut", text: "Główne: " + ex.muscles_primary.join(", ") + (ex.muscles_secondary.length ? ". Pomocnicze: " + ex.muscles_secondary.join(", ") : "") + "." }),
      el("p", { text: "Domyślnie: " + d.sets + " × " + d.reps + ", przerwa " + mmss(d.rest_s) + ", RIR " + d.rir }),
      ex.solo_safety ? el("div", { class: "callout", text: ex.solo_safety }) : null,
      listBlock("Wykonanie", ex.steps, true),
      listBlock("Wskazówki", ex.tips),
      listBlock("Częste błędy", ex.mistakes),
      ex.alternatives.length ? el("div", {}, [el("h2", { text: "Zamienniki" }), el("div", { class: "chips" }, ex.alternatives.map(function (a) {
        return el("button", { class: "chip", text: state.byId[a] ? state.byId[a].name_pl : a, onclick: function () { openDetail(a); } });
      }))]) : null,
      el("button", { class: "mt", text: "Dodaj serię tego ćwiczenia", onclick: function () { closeModal(); state.prefillEx = ex.name_pl; state.tab = "today"; state.day = today(); render(); scrollTop(); } })
    ]);
    document.body.appendChild(el("div", { class: "modal", id: "modal", onclick: closeModal }, [sheet]));
    document.body.classList.add("lock");
  }

  // ---------- today ----------
  function dayCard(day, cal) {
    var sess = cal.sessions[0];
    var ov = {}; cal.overrides.forEach(function (o) { ov[o.day] = o.plan_id; });
    var pid = plannedFor(day, ov);
    var body;
    if (sess && sess.finished_at) {
      var mn = minutes(sess);
      body = [el("div", { class: "ex", text: "✓ Trening zakończony: " + planName(sess.plan_id, sess.plan_name) + (mn ? " · " + mn + " min" : "") }), sess.note ? el("div", { class: "note", text: sess.note }) : null];
    } else if (sess) {
      body = [el("div", { class: "ex", text: "Trening w toku: " + planName(sess.plan_id, sess.plan_name) }),
        el("button", { class: "mt", text: "Wróć do treningu", onclick: function () { startSession(sess.plan_id, day); } })];
    } else if (pid === "rest") {
      body = [el("div", { class: "ex", text: "Dzień odpoczynku 😴" }), el("div", { class: "note", text: "Zaplanowany odpoczynek. Zmienisz to w Kalendarzu." })];
    } else if (pid && planById(pid)) {
      var p = planById(pid);
      body = [el("div", { class: "ex", text: "Zaplanowane: " + p.name }), el("div", { class: "mut", text: planItems(p).length + " ćwiczeń" + (p.when ? " · " + p.when : "") }),
        el("button", { class: "mt", text: "Start treningu", onclick: function () { startSession(pid, day); } })];
    } else {
      body = [el("div", { class: "ex", text: "Brak planu na ten dzień" }),
        el("button", { class: "sec mt", text: "Ustaw harmonogram", onclick: function () { goTab("plan"); } })];
    }
    return el("div", { class: "card" + (sess && sess.finished_at ? " done" : "") }, body);
  }
  function loadToday() {
    return Promise.all([api("/api/sets?day=" + state.day), api("/api/exercises"), api("/api/calendar?from=" + state.day + "&to=" + state.day)])
      .then(function (r) { state.sets = r[0]; state.exercises = r[1]; return r[2]; });
  }
  function viewToday() {
    loadToday().then(function (cal) {
      var names = {}; state.exercises.forEach(function (e) { names[e.exercise] = 1; });
      var dl = el("datalist", { id: "exlist" });
      var catNames = state.catalog ? state.catalog.exercises.map(function (e) { return e.name_pl; }) : [];
      state.exercises.map(function (e) { return e.exercise; }).concat(catNames.filter(function (n) { return !names[n]; })).forEach(function (n) { dl.appendChild(el("option", { value: n })); });
      var dayIn = el("input", { type: "date", value: state.day, onchange: function (e) { if (e.target.value) { state.day = e.target.value; viewToday(); } } });
      var exIn = el("input", { id: "exin", list: "exlist", placeholder: "Ćwiczenie", autocomplete: "off", autocapitalize: "sentences" });
      var wIn = el("input", { id: "win", type: "number", inputmode: "decimal", step: "0.25", min: "0", placeholder: "0" });
      var rIn = el("input", { id: "rin", type: "number", inputmode: "numeric", step: "1", min: "1", placeholder: "0" });
      var hint = el("div", { class: "mut mt" });
      var info = el("div", {});
      var warmIn = el("input", { type: "checkbox" });
      warmIn.checked = !!state.todayWarm;
      warmIn.addEventListener("change", function () { state.todayWarm = warmIn.checked; });
      function prefill() {
        var name = exIn.value.trim();
        var f = state.exercises.filter(function (e) { return e.exercise === name; })[0];
        if (f) { wIn.value = f.last_weight; rIn.value = f.last_reps; hint.textContent = "Ostatnio: " + fmt(f.last_weight) + " kg × " + f.last_reps + " (" + f.last_day + ")"; }
        else hint.textContent = "";
        while (info.firstChild) info.removeChild(info.firstChild);
        var c = state.byName[name];
        if (c) info.appendChild(el("button", { class: "link mt", text: "Pokaż opis i technikę →", onclick: function () { openDetail(c.id); } }));
      }
      exIn.addEventListener("change", prefill); exIn.addEventListener("input", prefill);
      var err = el("div", { class: "err" });
      var add = el("button", { class: "mt", text: "Dodaj serię", onclick: function () {
        err.textContent = "";
        api("/api/sets", "POST", { day: state.day, exercise: exIn.value, weight: wIn.value, reps: rIn.value, warmup: warmIn.checked }).then(function () { state.prefillEx = exIn.value; viewToday(); }).catch(function () { err.textContent = "Uzupełnij ćwiczenie, ciężar i powtórzenia"; });
      } });
      var form = el("div", { class: "card" }, [
        el("label", { text: "Dzień" }), dayIn,
        el("label", { class: "mt", text: "Ćwiczenie" }), exIn, dl,
        el("div", { class: "row mt" }, [el("div", {}, [el("label", { text: "Ciężar (kg)" }), wIn]), el("div", {}, [el("label", { text: "Powtórzenia" }), rIn])]),
        hint, info,
        el("label", { class: "chk" }, [warmIn, "Rozgrzewka (nie liczy się do statystyk)"]),
        add, err
      ]);
      var groups = {}, order = [], vol = 0;
      state.sets.forEach(function (s) { if (!groups[s.exercise]) { groups[s.exercise] = []; order.push(s.exercise); } groups[s.exercise].push(s); if (!s.warmup) vol += s.weight * s.reps; });
      var list = el("div", {});
      if (!order.length) list.appendChild(el("p", { class: "mut", text: "Brak serii tego dnia." }));
      order.forEach(function (name) {
        var c = el("div", { class: "card" }, [el("div", { class: "ex", text: name })]);
        var wn = 0;
        groups[name].forEach(function (s) {
          if (!s.warmup) wn++;
          c.appendChild(el("div", { class: "set" }, [
            el("div", { text: (s.warmup ? "R.  " : wn + ".  ") + fmt(s.weight) + " kg × " + s.reps + (s.warmup ? "  (rozgrzewka)" : "") }),
            el("div", { class: "row", style: "flex:none;gap:6px" }, [
              el("button", { class: "mini", text: s.warmup ? "Roboczą" : "Rozgrzewka", onclick: function () { api("/api/sets/" + s.id, "PATCH", { warmup: !s.warmup }).then(viewToday).catch(handleErr); } }),
              el("button", { class: "mini", text: "Usuń", onclick: function () { api("/api/sets/" + s.id, "DELETE").then(viewToday); } })
            ])
          ]));
        });
        list.appendChild(c);
      });
      shell(el("div", {}, [el("h1", { text: state.day === today() ? "Dziś" : fmtDay(state.day) }), dayCard(state.day, cal), form,
        order.length ? el("h2", { text: "Serie · objętość " + Math.round(vol) + " kg" }) : null, list]));
      if (state.prefillEx) { exIn.value = state.prefillEx; state.prefillEx = null; prefill(); }
    }).catch(handleErr);
  }

  // ---------- calendar ----------
  function viewCalendar() {
    var c = state.cal;
    var first = new Date(c.y, c.m, 1), dim = new Date(c.y, c.m + 1, 0).getDate(), offset = (first.getDay() + 6) % 7;
    var from = dstr(first), to = dstr(new Date(c.y, c.m, dim));
    api("/api/calendar?from=" + from + "&to=" + to).then(function (data) {
      var trained = {}, sess = {}, ov = {}, setsBy = {}, tdy = today();
      data.days.forEach(function (d) { trained[d.day] = d; });
      data.sessions.forEach(function (s) { sess[s.day] = s; });
      data.overrides.forEach(function (o) { ov[o.day] = o.plan_id; });
      data.sets.forEach(function (s) { (setsBy[s.day] = setsBy[s.day] || []).push(s); });
      var planned = 0, done = 0, totSets = 0, totVol = 0;
      var cells = [];
      DOW_SHORT.forEach(function (n) { cells.push(el("div", { class: "dow", text: n })); });
      for (var i = 0; i < offset; i++) cells.push(el("div", {}));
      for (var d = 1; d <= dim; d++) {
        (function (day, dn) {
          var t = trained[day], pid = plannedFor(day, ov), isPlan = pid && pid !== "rest";
          if (isPlan && day <= tdy) { planned++; if (t) done++; }
          var cls = "cell" + (day === tdy ? " today" : "") + (day === c.sel ? " sel" : "");
          var mark = null;
          if (t) mark = el("i", { class: "m on" });
          else if (isPlan) mark = el("i", { class: "m " + (day < tdy ? "miss" : "plan") });
          else if (pid === "rest") mark = el("i", { class: "m rest" });
          cells.push(el("button", { class: cls, "aria-label": fmtDay(day), onclick: function () { c.sel = day; viewCalendar(); } }, [el("span", { text: String(dn) }), mark]));
        })(dstr(new Date(c.y, c.m, d)), d);
      }
      data.days.forEach(function (d) { totSets += d.sets; totVol += d.volume; });
      var title = cap(first.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }));
      var head = el("div", { class: "calhead" }, [
        el("button", { class: "mini", text: "‹", "aria-label": "Poprzedni miesiąc", onclick: function () { c.m--; if (c.m < 0) { c.m = 11; c.y--; } c.sel = null; viewCalendar(); } }),
        el("div", { class: "ex", text: title }),
        el("button", { class: "mini", text: "›", "aria-label": "Następny miesiąc", onclick: function () { c.m++; if (c.m > 11) { c.m = 0; c.y++; } c.sel = null; viewCalendar(); } })
      ]);
      var legend = el("div", { class: "legend" }, [
        el("span", {}, [el("i", { class: "m on" }), " trening"]), el("span", {}, [el("i", { class: "m plan" }), " plan"]),
        el("span", {}, [el("i", { class: "m miss" }), " opuszczony"]), el("span", {}, [el("i", { class: "m rest" }), " odpoczynek"])
      ]);
      var stats = el("div", { class: "grid mt" }, [
        el("div", { class: "stat" }, [el("div", { class: "mut", text: "Dni z treningiem" }), el("div", { class: "big", text: String(data.days.length) })]),
        el("div", { class: "stat" }, [el("div", { class: "mut", text: "Realizacja planu" }), el("div", { class: "big", text: planned ? done + "/" + planned : "–" })]),
        el("div", { class: "stat" }, [el("div", { class: "mut", text: "Serie" }), el("div", { class: "big", text: String(totSets) })]),
        el("div", { class: "stat" }, [el("div", { class: "mut", text: "Objętość" }), el("div", { class: "big", text: Math.round(totVol / 1000 * 10) / 10 + " t" })])
      ]);
      shell(el("div", {}, [el("h1", { text: "Kalendarz" }), el("div", { class: "card" }, [head, el("div", { class: "calgrid" }, cells), legend]),
        c.sel ? dayPanel(c.sel, trained[c.sel], sess[c.sel], ov, setsBy[c.sel] || []) : el("p", { class: "mut", text: "Wybierz dzień, aby zobaczyć trening albo zmienić plan." }),
        stats]));
    }).catch(handleErr);
  }
  function dayPanel(day, t, sess, ov, sets) {
    var pid = plannedFor(day, ov), custom = ov[day] !== undefined;
    var kids = [el("h3", { text: cap(fmtDay(day)) })];
    if (sess) {
      var mn = minutes(sess);
      kids.push(el("div", { class: "mut mb", text: (sess.finished_at ? "✓ " : "W toku: ") + planName(sess.plan_id, sess.plan_name) + (mn ? " · " + mn + " min" : "") }));
      if (sess.note) kids.push(el("div", { class: "note", text: "Notatka: " + sess.note }));
    }
    if (t) {
      var by = {}, ord = [];
      sets.forEach(function (s) { if (!by[s.exercise]) { by[s.exercise] = []; ord.push(s.exercise); } by[s.exercise].push((s.warmup ? "R " : "") + fmt(s.weight) + "×" + s.reps); });
      ord.forEach(function (n) { kids.push(el("div", { class: "set" }, [el("div", { text: n }), el("div", { class: "mut", text: by[n].join(", ") })])); });
      kids.push(el("div", { class: "mut mt", text: t.sets + " serii · objętość " + Math.round(t.volume) + " kg" }));
    } else {
      kids.push(el("div", { class: "mut mb", text: "Brak zapisanych serii." }));
    }
    kids.push(el("label", { class: "mt", text: "Plan na ten dzień" }));
    kids.push(planSelect(custom ? pid : "", true, function (v) {
      api("/api/planned", "POST", { day: day, plan_id: v || null }).then(viewCalendar).catch(handleErr);
    }));
    kids.push(el("div", { class: "mut mt", text: custom ? "Ustawione ręcznie dla tej daty." : (pid ? "Z harmonogramu tygodnia: " + planName(pid) : "Nic nie zaplanowano.") }));
    var actions = [];
    if (pid && pid !== "rest" && planById(pid) && !(sess && sess.finished_at))
      actions.push(el("button", { text: sess ? "Wróć do treningu" : "Start: " + planName(pid), onclick: function () { startSession(pid, day); } }));
    actions.push(el("button", { class: "sec", text: t ? "Edytuj serie tego dnia" : "Dodaj serie ręcznie", onclick: function () { state.day = day; goTab("today"); } }));
    if (sess) actions.push(el("button", { class: "mini", text: "Usuń zapis sesji (serie zostają)", onclick: function () { api("/api/sessions/" + day, "DELETE").then(viewCalendar); } }));
    kids.push(el("div", { class: "stack mt" }, actions));
    return el("div", { class: "card" }, kids);
  }

  // ---------- plans ----------
  function planCard(p) {
    var sets = planItems(p).reduce(function (a, it) { return a + it.sets; }, 0);
    var btns = [el("button", { class: "sec", text: "Podgląd", onclick: function () { state.planId = p.id; render(); scrollTop(); } }),
      el("button", { text: "Start", onclick: function () { startSession(p.id, today()); } })];
    return el("div", { class: "card" }, [
      el("h3", { text: p.name }),
      el("div", { class: "mut mb", text: (p.when ? p.when + " · " : "") + planItems(p).length + " ćwiczeń · " + sets + " serii" }),
      el("div", { class: "row" }, btns)
    ]);
  }
  function planSeg() {
    return el("div", { class: "seg" }, [["plans", "Plany"], ["catalog", "Katalog ćwiczeń"]].map(function (t) {
      return el("button", { class: state.planMode === t[0] ? "on" : "", text: t[1], onclick: function () { state.planMode = t[0]; render(); } });
    }));
  }
  function viewPlans() {
    var r = state.catalog.rules;
    var sched = el("div", { class: "card" }, DOW_ORDER.map(function (dow) {
      return el("div", { class: "row mb", style: "align-items:center" }, [
        el("div", { class: "mut", style: "flex:0 0 110px", text: DOW_NAMES[dow] }),
        planSelect(state.schedule[dow], false, function (v) {
          api("/api/schedule", "POST", { dow: dow, plan_id: v || null }).then(function () { if (v) state.schedule[dow] = v; else delete state.schedule[dow]; }).catch(handleErr);
        })
      ]);
    }));
    var mine = el("div", {}, state.userPlans.length ? state.userPlans.map(planCard) : [el("p", { class: "mut", text: "Nie masz jeszcze własnych planów. Skopiuj gotowy albo stwórz nowy." })]);
    var labels = { progression: "Progresja", rir: "RIR (zapas powtórzeń)", rest: "Przerwy", warmup: "Rozgrzewka", tempo: "Tempo", deload: "Deload" };
    var rules = el("div", {}, Object.keys(labels).filter(function (k) { return r[k]; }).map(function (k) {
      return el("details", {}, [el("summary", { text: labels[k] }), el("p", { text: r[k] })]);
    }));
    shell(el("div", {}, [el("h1", { text: "Plan" }), planSeg(),
      el("h2", { text: "Harmonogram tygodnia" }), sched,
      el("h2", { text: "Moje plany" }), mine,
      el("button", { class: "sec", text: "+ Nowy plan", onclick: function () { state.edit = { id: null, name: "", when: "", items: [] }; render(); scrollTop(); } }),
      el("h2", { text: "Gotowe plany" }), el("div", {}, state.catalog.plans.map(planCard)),
      el("h2", { text: "Zasady" }), rules]));
  }
  function viewPlan() {
    var p = planById(state.planId);
    if (!p) { state.planId = null; return render(); }
    var acts = [el("button", { text: "Start treningu", onclick: function () { startSession(p.id, today()); } })];
    if (p.custom) {
      acts.push(el("button", { class: "sec", text: "Edytuj plan", onclick: function () { state.edit = JSON.parse(JSON.stringify({ id: p.id, name: p.name, when: p.when, items: p.items })); render(); scrollTop(); } }));
      acts.push(el("button", { class: "mini", text: "Usuń plan", onclick: function () {
        if (confirm("Usunąć plan „" + p.name + "”? Zniknie też z harmonogramu.")) api("/api/plans/" + p.id, "DELETE").then(loadUserData).then(function () { state.planId = null; render(); }).catch(handleErr);
      } }));
    } else {
      acts.push(el("button", { class: "sec", text: "Kopiuj do moich planów", onclick: function () {
        state.edit = { id: null, name: p.name + " (kopia)", when: p.when || "", items: JSON.parse(JSON.stringify(p.items)) }; render(); scrollTop();
      } }));
    }
    shell(el("div", {}, [
      el("button", { class: "link mb", text: "← Plany", onclick: function () { state.planId = null; render(); } }),
      el("h1", { text: p.name }), el("div", { class: "mut mb", text: p.when || "" }),
      el("div", { class: "stack" }, acts),
      el("div", { class: "card mt" }, planItems(p).map(function (it) {
        var ex = state.byId[it.exercise_id];
        return el("div", { class: "planitem" }, [
          el("img", { class: "th", src: "/" + ex.image, alt: "", loading: "lazy" }),
          el("div", {}, [
            el("button", { class: "link", text: ex.name_pl, onclick: function () { openDetail(ex.id); } }),
            el("div", { class: "mut", text: it.sets + " × " + it.reps + (it.superset_group ? " · superseria " + it.superset_group : "") }),
            it.note ? el("div", { class: "note", text: it.note }) : null
          ])
        ]);
      }))
    ]));
  }

  // ---------- plan editor ----------
  function viewEdit() {
    var E = state.edit;
    var nameIn = el("input", { type: "text", maxlength: "60", placeholder: "Nazwa planu", value: E.name, oninput: function (e) { E.name = e.target.value; } });
    var whenIn = el("input", { type: "text", maxlength: "80", placeholder: "Kiedy / uwagi (opcjonalnie)", value: E.when, oninput: function (e) { E.when = e.target.value; } });
    var err = el("div", { class: "err" });
    var items = E.items.map(function (it, i) {
      var ex = state.byId[it.exercise_id];
      var move = function (d) { var j = i + d; if (j < 0 || j >= E.items.length) return; var t = E.items[i]; E.items[i] = E.items[j]; E.items[j] = t; viewEdit(); };
      return el("div", { class: "card" }, [
        el("div", { class: "head" }, [
          ex ? el("img", { class: "th", src: "/" + ex.image, alt: "" }) : null,
          el("div", { style: "flex:1" }, [el("div", { class: "ex", text: ex ? ex.name_pl : it.exercise_id })]),
          el("button", { class: "mini", text: "↑", "aria-label": "W górę", onclick: function () { move(-1); } }),
          el("button", { class: "mini", text: "↓", "aria-label": "W dół", onclick: function () { move(1); } }),
          el("button", { class: "mini", text: "✕", "aria-label": "Usuń", onclick: function () { E.items.splice(i, 1); viewEdit(); } })
        ]),
        el("div", { class: "row" }, [
          el("div", {}, [el("label", { text: "Serie" }), el("input", { type: "number", inputmode: "numeric", min: "1", max: "20", value: String(it.sets), oninput: function (e) { it.sets = Number(e.target.value); } })]),
          el("div", {}, [el("label", { text: "Powtórzenia" }), el("input", { type: "text", maxlength: "20", value: it.reps, oninput: function (e) { it.reps = e.target.value; } })])
        ]),
        el("div", { class: "row mt" }, [
          el("div", {}, [el("label", { text: "Przerwa (s, opcjonalnie)" }), el("input", { type: "number", inputmode: "numeric", min: "0", max: "900", value: it.rest_s ? String(it.rest_s) : "", oninput: function (e) { if (e.target.value) it.rest_s = Number(e.target.value); else delete it.rest_s; } })]),
          el("div", {}, [el("label", { text: "Superseria (litera)" }), el("input", { type: "text", maxlength: "1", value: it.superset_group || "", oninput: function (e) { var v = e.target.value.toUpperCase().trim(); if (v) it.superset_group = v; else delete it.superset_group; } })])
        ])
      ]);
    });
    var picker = el("select", {});
    var byCat = {};
    state.catalog.exercises.forEach(function (e) { (byCat[e.category] = byCat[e.category] || []).push(e); });
    Object.keys(byCat).forEach(function (cat) {
      var g = el("optgroup", { label: cap(cat) });
      byCat[cat].forEach(function (e) { g.appendChild(el("option", { value: e.id, text: e.name_pl })); });
      picker.appendChild(g);
    });
    var addBtn = el("button", { class: "sec", text: "Dodaj ćwiczenie", onclick: function () {
      var ex = state.byId[picker.value]; if (!ex) return;
      E.items.push({ exercise_id: ex.id, sets: ex.default.sets, reps: ex.default.reps });
      viewEdit();
    } });
    var save = el("button", { text: "Zapisz plan", onclick: function () {
      err.textContent = "";
      if (!E.name.trim()) { err.textContent = "Podaj nazwę planu"; return; }
      if (!E.items.length) { err.textContent = "Dodaj przynajmniej jedno ćwiczenie"; return; }
      for (var i = 0; i < E.items.length; i++) {
        var it = E.items[i];
        if (!(it.sets >= 1 && it.sets <= 20) || !String(it.reps).trim()) { err.textContent = "Uzupełnij serie (1-20) i powtórzenia przy każdym ćwiczeniu"; return; }
      }
      save.disabled = true;
      api("/api/plans", "POST", { id: E.id, name: E.name, when: E.when, items: E.items }).then(function (p) {
        return loadUserData().then(function () { state.edit = null; state.planId = p.id; render(); scrollTop(); });
      }).catch(function () { save.disabled = false; err.textContent = "Nie udało się zapisać planu"; });
    } });
    shell(el("div", {}, [
      el("button", { class: "link mb", text: "← Anuluj", onclick: function () { state.edit = null; render(); } }),
      el("h1", { text: E.id ? "Edytuj plan" : "Nowy plan" }),
      el("div", { class: "card" }, [el("label", { text: "Nazwa" }), nameIn, el("label", { class: "mt", text: "Opis" }), whenIn]),
      el("h2", { text: "Ćwiczenia (" + E.items.length + ")" }), el("div", {}, items),
      el("div", { class: "card" }, [el("label", { text: "Dodaj z katalogu" }), picker, el("div", { class: "mt" }, [addBtn])]),
      save, err
    ]));
  }

  // ---------- guided session ----------
  var wakeLock = null;
  function keepAwake() { try { if (navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { wakeLock = l; }).catch(function () {}); } catch (e) { /* ok */ } }
  function releaseAwake() { if (wakeLock) { try { wakeLock.release(); } catch (e) { /* ok */ } wakeLock = null; } }
  function startSession(planId, day) {
    var plan = planById(planId);
    if (!plan) return;
    state.tab = "plan"; state.planId = planId; state.edit = null;
    state.session = { planId: planId, day: day, last: {}, note: "", warm: {}, swap: {} };
    keepAwake();
    api("/api/sessions/start", "POST", { day: day, plan_id: planId, plan_name: plan.name }).then(function () {
      return Promise.all(planItems(plan).map(function (it) {
        var ex = state.byId[it.exercise_id];
        return api("/api/last?exercise=" + encodeURIComponent(ex.name_pl) + "&before=" + day).then(function (l) { state.session.last[it.exercise_id] = l; });
      }));
    }).then(function () { viewSession(); scrollTop(); }).catch(handleErr);
  }
  // Ćwiczenie faktycznie wykonywane w danym miejscu planu: wybrany zamiennik albo, po wznowieniu treningu,
  // zamiennik, który ma dziś serie (o ile nie jest osobną pozycją tego planu).
  function effId(it, all, items) {
    var S = state.session, orig = state.byId[it.exercise_id];
    var chosen = S.swap[it.exercise_id];
    if (chosen && state.byId[chosen]) return chosen;
    if (all.some(function (s) { return s.exercise === orig.name_pl; })) return it.exercise_id;
    for (var i = 0; i < orig.alternatives.length; i++) {
      var alt = state.byId[orig.alternatives[i]];
      if (!alt || items.some(function (x) { return x.exercise_id === alt.id; })) continue;
      if (all.some(function (s) { return s.exercise === alt.name_pl; })) return alt.id;
    }
    return it.exercise_id;
  }
  function openSwap(it, currentId, items) {
    var S = state.session, orig = state.byId[it.exercise_id], cur = state.byId[currentId];
    var ids = [orig.id].concat(orig.alternatives, cur.alternatives).filter(function (id, i, arr) {
      return state.byId[id] && id !== currentId && arr.indexOf(id) === i && (id === orig.id || !items.some(function (x) { return x.exercise_id === id; }));
    });
    closeModal();
    var sheet = el("div", { class: "sheet", onclick: function (e) { e.stopPropagation(); } }, [
      el("div", { class: "bar" }, [el("button", { class: "mini", text: "Zamknij ✕", onclick: closeModal })]),
      el("h1", { text: "Zamień ćwiczenie" }),
      el("div", { class: "mut mb", text: "Teraz: " + cur.name_pl + ". Serie zapiszą się pod nazwą wybranego ćwiczenia, więc historia i rekordy nie mieszają się z oryginałem." }),
      el("div", { class: "card" }, ids.map(function (id) {
        var e = state.byId[id];
        return el("div", { class: "planitem" }, [
          el("img", { class: "th", src: "/" + e.image, alt: "", loading: "lazy" }),
          el("div", { style: "flex:1" }, [
            el("button", { class: "link", text: e.name_pl, onclick: function () {
              S.swap[it.exercise_id] = id;
              closeModal(); viewSession();
            } }),
            el("div", { class: "mut", text: (id === orig.id ? "oryginał z planu · " : "") + e.equipment.join(", ") })
          ])
        ]);
      }))
    ]);
    document.body.appendChild(el("div", { class: "modal", id: "modal", onclick: closeModal }, [sheet]));
    document.body.classList.add("lock");
  }
  function viewSession() {
    var S = state.session, plan = planById(S.planId), y = window.scrollY;
    var items = planItems(plan);
    api("/api/sets?day=" + S.day).then(function (all) {
      var need = [];
      items.forEach(function (it) { var id = effId(it, all, items); if (S.last[id] === undefined && need.indexOf(id) < 0) need.push(id); });
      return Promise.all(need.map(function (id) {
        return api("/api/last?exercise=" + encodeURIComponent(state.byId[id].name_pl) + "&before=" + S.day).then(function (l) { S.last[id] = l; });
      })).then(function () { return all; });
    }).then(function (all) {
      var cards = [], doneItems = 0, vol = 0, nsets = 0;
      all.forEach(function (s) { if (!s.warmup) { vol += s.weight * s.reps; nsets++; } });
      items.forEach(function (it, idx) {
        var eid = effId(it, all, items);
        var ex = state.byId[eid];
        var swapped = eid !== it.exercise_id;
        var both = all.filter(function (s) { return s.exercise === ex.name_pl; });
        var mine = both.filter(function (s) { return !s.warmup; });
        var warmSets = both.filter(function (s) { return s.warmup; });
        var isWarm = !!S.warm[it.exercise_id];
        var done = mine.length >= it.sets; if (done) doneItems++;
        var prevGroup = idx > 0 ? items[idx - 1].superset_group : null;
        var nextItem = items[idx + 1];
        var sg = it.superset_group;
        var isLastInGroup = !sg || !nextItem || nextItem.superset_group !== sg;
        var sug = suggestion(it, ex, S.last[eid]);
        var wIn = el("input", { type: "number", inputmode: "decimal", step: "0.25", min: "0", placeholder: "kg" });
        var rIn = el("input", { type: "number", inputmode: "numeric", step: "1", min: "1", placeholder: "powt." });
        if (mine.length) { var ls = mine[mine.length - 1]; wIn.value = ls.weight; rIn.value = ls.reps; }
        else if (sug) { wIn.value = sug.weight; rIn.value = sug.reps; }
        else if (warmSets.length) { var lw = warmSets[warmSets.length - 1]; wIn.value = lw.weight; rIn.value = lw.reps; }
        var restS = it.rest_s || ex.default.rest_s;
        var serText = "Zapisz serię " + (mine.length + 1) + "/" + it.sets;
        var btn = el("button", { text: isWarm ? "Zapisz rozgrzewkę" : serText });
        var warmCb = el("input", { type: "checkbox" });
        warmCb.checked = isWarm;
        warmCb.addEventListener("change", function () { S.warm[it.exercise_id] = warmCb.checked; btn.textContent = warmCb.checked ? "Zapisz rozgrzewkę" : serText; });
        var lastS = S.last[eid];
        var baseW = sug ? sug.weight : (lastS && lastS.sets.length ? Math.max.apply(null, lastS.sets.map(function (s) { return s.weight; })) : 0);
        var firstMulti = items.findIndex(function (x) { return state.byId[x.exercise_id].type === "wielostawowe"; }) === idx;
        var wu = warmupPlan(ex, firstMulti, baseW);
        var wuBox = null;
        if (wu.length) {
          if (warmSets.length >= wu.length) wuBox = el("div", { class: "note", text: "✓ Rozgrzewka zrobiona" });
          else wuBox = el("div", {}, [
            el("div", { class: "note", text: "Rozgrzewka wg zasad (dotknij, aby wpisać):" }),
            el("div", { class: "chips" }, wu.slice(warmSets.length).map(function (x) {
              return el("button", { class: "chip", text: fmt(x.w) + " × " + x.r, onclick: function () {
                wIn.value = x.w; rIn.value = x.r; warmCb.checked = true; S.warm[it.exercise_id] = true; btn.textContent = "Zapisz rozgrzewkę";
              } });
            }))
          ]);
        } else if (ex.type === "izolacja") wuBox = el("div", { class: "note", text: "Izolacja: bez osobnej rozgrzewki." });
        btn.addEventListener("click", function () {
          btn.disabled = true;
          api("/api/sets", "POST", { day: S.day, exercise: ex.name_pl, weight: wIn.value, reps: rIn.value, warmup: warmCb.checked }).then(function () {
            if (isLastInGroup) startRest(warmCb.checked ? 60 : restS, ex.name_pl); else stopRest();
            viewSession();
          }).catch(function () { btn.disabled = false; btn.textContent = "Uzupełnij kg i powtórzenia"; });
        });
        var chips = el("div", { class: "mb" }, both.map(function (s) {
          return el("span", { class: "setchip" + (s.warmup ? " warm" : "") }, [el("button", { class: "tg", title: s.warmup ? "Zmień na serię roboczą" : "Zmień na rozgrzewkę", text: (s.warmup ? "R " : "") + fmt(s.weight) + " × " + s.reps, onclick: function () { api("/api/sets/" + s.id, "PATCH", { warmup: !s.warmup }).then(viewSession).catch(handleErr); } }), el("button", { text: "×", "aria-label": "Usuń serię", onclick: function () { api("/api/sets/" + s.id, "DELETE").then(viewSession); } })]);
        }));
        cards.push(el("div", {}, [
          sg && sg !== prevGroup ? el("h2", { text: "Superseria " + sg + " (przerwa po ostatnim)" }) : null,
          el("div", { class: "card" + (done ? " done" : "") + (sg ? " grp" : "") }, [
            el("div", { class: "head" }, [
              el("img", { class: "th", src: "/" + ex.image, alt: "", loading: "lazy", onclick: function () { openDetail(ex.id); } }),
              el("div", {}, [
                el("button", { class: "link", text: (done ? "✓ " : "") + ex.name_pl, onclick: function () { openDetail(ex.id); } }),
                el("div", { class: "mut", text: it.sets + " × " + it.reps + " · przerwa " + mmss(restS) + " · RIR " + ex.default.rir }),
                swapped ? el("div", { class: "note", text: "↔ zamiast: " + state.byId[it.exercise_id].name_pl }) : null,
                el("button", { class: "link", style: "font-size:13px", text: "Zamień ćwiczenie", onclick: function () { openSwap(it, eid, items); } })
              ])
            ]),
            it.note ? el("div", { class: "note", text: it.note }) : null,
            sug ? el("div", { class: "hint", text: sug.text }) : el("div", { class: "note", text: "Pierwszy raz: zacznij lekko i dobierz ciężar tak, by zostało " + ex.default.rir + " powt. w zapasie." }),
            wuBox,
            chips,
            both.length ? el("div", { class: "note", text: "Dotknij serii, aby zmienić ją na rozgrzewkę lub z powrotem." }) : null,
            el("div", { class: "row" }, [el("div", {}, [el("label", { text: "Ciężar (kg)" }), wIn]), el("div", {}, [el("label", { text: "Powtórzenia" }), rIn])]),
            el("label", { class: "chk" }, [warmCb, "Rozgrzewka (nie liczy się do planu ani statystyk)"]),
            el("div", { class: "mt" }, [btn])
          ])
        ]));
      });
      var warm = state.catalog.rules.warmup;
      var noteIn = el("input", { type: "text", maxlength: "500", placeholder: "Notatka do treningu (opcjonalnie)", value: S.note || "", oninput: function (e) { S.note = e.target.value; } });
      var leave = function () { state.session = null; stopRest(); releaseAwake(); };
      shell(el("div", {}, [
        el("button", { class: "link mb", text: "← Wyjdź (trening zostaje w toku)", onclick: function () { leave(); render(); scrollTop(); } }),
        el("h1", { text: plan.name }),
        el("div", { class: "mut mb", text: (S.day === today() ? "" : fmtDay(S.day) + " · ") + "Zrobione: " + doneItems + "/" + items.length + " ćwiczeń · " + nsets + " serii · objętość " + Math.round(vol) + " kg" }),
        warm ? el("details", {}, [el("summary", { text: "Rozgrzewka" }), el("p", { text: warm })]) : null,
        el("div", { class: "mt" }, cards),
        el("div", { class: "card" }, [el("label", { text: "Notatka" }), noteIn]),
        el("button", { text: "Zakończ trening", onclick: function () {
          api("/api/sessions/finish", "POST", { day: S.day, note: S.note || "" }).then(function () {
            var d = parseDay(S.day); state.cal = { y: d.getFullYear(), m: d.getMonth(), sel: S.day };
            leave(); state.planId = null; goTab("cal");
          }).catch(handleErr);
        } })
      ]));
      window.scrollTo(0, y);
    }).catch(handleErr);
  }

  // ---------- catalog ----------
  function viewCatalog() {
    var cats = ["all"]; state.catalog.exercises.forEach(function (e) { if (cats.indexOf(e.category) < 0) cats.push(e.category); });
    var q = el("input", { type: "search", placeholder: "Szukaj ćwiczenia lub mięśnia", value: state.catQuery });
    var grid = el("div", { class: "cat" });
    function fill() {
      while (grid.firstChild) grid.removeChild(grid.firstChild);
      var t = state.catQuery.trim().toLowerCase();
      var list = state.catalog.exercises.filter(function (e) {
        if (state.catFilter !== "all" && e.category !== state.catFilter) return false;
        if (!t) return true;
        return (e.name_pl + " " + e.name_en + " " + e.muscles_primary.join(" ") + " " + e.muscles_secondary.join(" ") + " " + e.equipment.join(" ")).toLowerCase().indexOf(t) >= 0;
      });
      if (!list.length) grid.appendChild(el("p", { class: "mut", text: "Brak wyników." }));
      list.forEach(function (e) {
        grid.appendChild(el("button", { onclick: function () { openDetail(e.id); } }, [el("img", { src: "/" + e.image, alt: "", loading: "lazy" }), el("span", { text: e.name_pl })]));
      });
    }
    q.addEventListener("input", function () { state.catQuery = q.value; fill(); });
    var chips = el("div", { class: "chips" }, cats.map(function (c) {
      return el("button", { class: "chip" + (state.catFilter === c ? " on" : ""), text: c === "all" ? "Wszystkie" : cap(c), onclick: function () { state.catFilter = c; viewCatalog(); } });
    }));
    fill();
    shell(el("div", {}, [el("h1", { text: "Plan" }), planSeg(), q, chips, grid]));
  }

  // ---------- progress & weight ----------
  function lineChart(points) {
    var W = 320, H = 160, pad = 28;
    if (!points.length) return el("p", { class: "mut", text: "Brak danych." });
    var xs = points.map(function (p) { return p.t; }), ys = points.map(function (p) { return p.y; });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    if (y1 === y0) { y1 += 1; y0 -= 1; }
    var m = (y1 - y0) * 0.1; y0 -= m; y1 += m;
    function X(t) { return x1 === x0 ? W / 2 : pad + (t - x0) / (x1 - x0) * (W - pad - 8); }
    function Y(v) { return H - 18 - (v - y0) / (y1 - y0) * (H - 18 - 10); }
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    function add(tag, a, txt) { var n = document.createElementNS(ns, tag); for (var k in a) n.setAttribute(k, a[k]); if (txt) n.textContent = txt; svg.appendChild(n); }
    [0, 0.5, 1].forEach(function (f) { var v = y0 + (y1 - y0) * f; add("line", { x1: pad, x2: W - 8, y1: Y(v), y2: Y(v), stroke: "#262a33" }); add("text", { x: 2, y: Y(v) + 4, fill: "#8b919d", "font-size": 10 }, fmt(v)); });
    var d = points.map(function (p, i) { return (i ? "L" : "M") + X(p.t).toFixed(1) + " " + Y(p.y).toFixed(1); }).join(" ");
    add("path", { d: d, fill: "none", stroke: "#34d399", "stroke-width": 2.5, "stroke-linejoin": "round" });
    points.forEach(function (p) { add("circle", { cx: X(p.t), cy: Y(p.y), r: 3.5, fill: "#34d399" }); });
    add("text", { x: pad, y: H - 3, fill: "#8b919d", "font-size": 10 }, points[0].label);
    add("text", { x: W - 8, y: H - 3, fill: "#8b919d", "font-size": 10, "text-anchor": "end" }, points[points.length - 1].label);
    return svg;
  }
  function tms(day) { return parseDay(day).getTime(); }
  function segControl() {
    return el("div", { class: "seg" }, [["ex", "Ćwiczenia"], ["w", "Waga ciała"]].map(function (t) {
      return el("button", { class: state.progMode === t[0] ? "on" : "", text: t[1], onclick: function () { state.progMode = t[0]; viewProg(); } });
    }));
  }
  function viewProg() { if (state.progMode === "w") viewWeight(); else viewExProg(); }
  function viewExProg() {
    api("/api/exercises").then(function (ex) {
      state.exercises = ex;
      if (!ex.length) { shell(el("div", {}, [el("h1", { text: "Postępy" }), segControl(), el("p", { class: "mut", text: "Dodaj pierwsze serie, a tu pojawi się wykres." })])); return; }
      if (!state.selEx || !ex.some(function (e) { return e.exercise === state.selEx; })) state.selEx = ex[0].exercise;
      return api("/api/history?exercise=" + encodeURIComponent(state.selEx)).then(function (h) {
        var sel = el("select", { onchange: function (e) { state.selEx = e.target.value; viewExProg(); } }, ex.map(function (e) { var o = el("option", { value: e.exercise, text: e.exercise }); if (e.exercise === state.selEx) o.selected = true; return o; }));
        var best = h.reduce(function (a, d) { return Math.max(a, d.best_e1rm); }, 0);
        var top = h.reduce(function (a, d) { return Math.max(a, d.top_weight); }, 0);
        var pts = h.map(function (d) { return { t: tms(d.day), y: d.best_e1rm, label: d.day.slice(5) }; });
        var recent = el("div", { class: "card" });
        h.slice(-8).reverse().forEach(function (d) {
          recent.appendChild(el("div", { class: "set" }, [el("div", { text: d.day }), el("div", { class: "mut", text: d.sets + " serii · max " + fmt(d.top_weight) + " kg · e1RM " + fmt(d.best_e1rm) })]));
        });
        shell(el("div", {}, [el("h1", { text: "Postępy" }), segControl(), sel,
          el("div", { class: "grid mt" }, [
            el("div", { class: "stat" }, [el("div", { class: "mut", text: "Szac. 1RM (rekord)" }), el("div", { class: "big", text: fmt(best) + " kg" })]),
            el("div", { class: "stat" }, [el("div", { class: "mut", text: "Najcięższa seria" }), el("div", { class: "big", text: fmt(top) + " kg" })])]),
          el("h2", { text: "Szacowany 1RM w czasie" }), el("div", { class: "card" }, [lineChart(pts)]),
          el("h2", { text: "Ostatnie treningi" }), recent]));
      });
    }).catch(handleErr);
  }
  function viewWeight() {
    api("/api/weight").then(function (w) {
      var dayIn = el("input", { type: "date", value: today() });
      var kgIn = el("input", { type: "number", inputmode: "decimal", step: "0.1", placeholder: w.length ? String(w[w.length - 1].kg) : "kg" });
      var err = el("div", { class: "err" });
      var form = el("div", { class: "card" }, [
        el("div", { class: "row" }, [el("div", {}, [el("label", { text: "Dzień" }), dayIn]), el("div", {}, [el("label", { text: "Waga (kg)" }), kgIn])]),
        el("button", { class: "mt", text: "Zapisz wagę", onclick: function () {
          api("/api/weight", "POST", { day: dayIn.value, kg: kgIn.value }).then(viewWeight).catch(function () { err.textContent = "Podaj poprawną wagę"; });
        } }), err]);
      var pts = w.map(function (d) { return { t: tms(d.day), y: d.kg, label: d.day.slice(5) }; });
      var list = el("div", { class: "card" });
      w.slice(-10).reverse().forEach(function (d) {
        list.appendChild(el("div", { class: "set" }, [el("div", { text: d.day + "  ·  " + fmt(d.kg) + " kg" }),
          el("button", { class: "mini", text: "Usuń", onclick: function () { api("/api/weight/" + d.day, "DELETE").then(viewWeight); } })]));
      });
      shell(el("div", {}, [el("h1", { text: "Postępy" }), segControl(), form, el("h2", { text: "Wykres" }), el("div", { class: "card" }, [lineChart(pts)]),
        w.length ? el("h2", { text: "Pomiary" }) : null, w.length ? list : null]));
    }).catch(handleErr);
  }

  // ---------- more ----------
  function viewMore() {
    var msg = el("div", { class: "mut mt" });
    var file = el("input", { type: "file", accept: "application/json", class: "hidden", onchange: function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (t) { return api("/api/import", "POST", JSON.parse(t)); })
        .then(function (r) { msg.textContent = "Zaimportowano pozycji: " + r.imported; return loadUserData(); })
        .catch(function () { msg.textContent = "Nie udało się zaimportować pliku"; });
    } });
    shell(el("div", {}, [el("h1", { text: "Więcej" }),
      el("div", { class: "card" }, [
        el("p", { class: "mut", text: "Dane są w Twojej bazie Cloudflare D1: serie, sesje, harmonogram, własne plany i waga. Eksport do JSON to pełna kopia." }),
        el("button", { class: "sec", text: "Eksportuj dane (JSON)", onclick: function () { location.href = "/api/export"; } }),
        el("button", { class: "sec mt", text: "Importuj dane (JSON)", onclick: function () { file.click(); } }), file, msg]),
      el("div", { class: "card" }, [
        el("p", { class: "mut", text: "iPhone: Safari → Udostępnij → Dodaj do ekranu głównego. Android: Chrome → menu → Zainstaluj aplikację." }),
        el("button", { class: "sec", text: "Wyloguj", onclick: function () { api("/api/logout", "POST").then(boot); } })])]));
  }

  function handleErr(e) { if (e && e.status === 401) boot(); else { clear(); app.appendChild(el("p", { class: "err", text: "Błąd połączenia. Odśwież stronę." })); } }

  function boot() {
    var nav = document.querySelector("nav"); if (nav) nav.remove();
    stopRest(); closeModal();
    Promise.all([api("/api/state"), loadCatalog()]).then(function (r) {
      var s = r[0];
      if (!s.setup) return authScreen(true);
      if (!s.authed) return authScreen(false);
      return loadUserData().then(render);
    }).catch(function () { clear(); app.appendChild(el("p", { class: "err", text: "Brak połączenia. Odśwież stronę." })); });
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(function () {});
  boot();
})();
