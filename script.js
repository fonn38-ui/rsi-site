(function () {
  var header = document.querySelector(".site-header");
  var burger = document.querySelector(".burger");
  if (burger && header) {
    burger.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    header.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var started = false;
    function run() {
      if (started) return;
      started = true;
      var t0 = performance.now();
      function frame(now) {
        var p = Math.min(1, (now - t0) / 900);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) {
      var co = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          run();
          co.disconnect();
        }
      }, { threshold: 0.4 });
      co.observe(el);
    } else run();
  });

  var chips = document.querySelectorAll(".chip");
  var rows = document.querySelectorAll(".case");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("on"); });
      chip.classList.add("on");
      var f = chip.getAttribute("data-f");
      rows.forEach(function (row) {
        var cats = (row.getAttribute("data-cat") || "").split(/\s+/);
        var show = f === "all" || cats.indexOf(f) !== -1;
        row.hidden = !show;
      });
    });
  });

  var dlg = document.getElementById("methodDialog");
  var dlgTitle = document.getElementById("dlgTitle");
  var dlgBody = document.getElementById("dlgBody");
  var dlgPhoto = document.getElementById("dlgPhoto");
  document.querySelectorAll("[data-method]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      dlgTitle.textContent = btn.getAttribute("data-title");
      dlgBody.textContent = btn.getAttribute("data-text");
      dlgPhoto.src = btn.getAttribute("data-photo");
      dlgPhoto.alt = btn.getAttribute("data-title");
      if (typeof dlg.showModal === "function") dlg.showModal();
    });
  });
  var dlgClose = document.getElementById("dlgClose");
  if (dlgClose) dlgClose.addEventListener("click", function () { dlg.close(); });
  if (dlg) dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close();
  });

  var facts = [
    { k: "СРО", v: "ЦСО · СРО-С-306-03092021" },
    { k: "Полис", v: "до 25.08.2027" },
    { k: "Штат", v: "6 + 57 по договору" },
    { k: "На рынке", v: "с 28.12.2018" }
  ];
  var fk = document.getElementById("factK");
  var fv = document.getElementById("factV");
  var fi = 0;
  function showFact() {
    if (!fk) return;
    fk.textContent = facts[fi].k;
    fv.textContent = facts[fi].v;
    fi = (fi + 1) % facts.length;
  }
  showFact();
  setInterval(showFact, 3200);

  var drop = document.getElementById("drop");
  var fileInput = document.getElementById("files");
  var fileList = document.getElementById("fileList");
  var picked = [];

  function renderFiles() {
    fileList.innerHTML = "";
    if (!picked.length) {
      fileList.hidden = true;
      return;
    }
    fileList.hidden = false;
    picked.forEach(function (f) {
      var li = document.createElement("li");
      li.textContent = f.name + " · " + Math.max(1, Math.round(f.size / 1024)) + " КБ";
      fileList.appendChild(li);
    });
  }

  function takeFiles(list) {
    var ok = /\.(pdf|dwg|xlsx|xls)$/i;
    Array.prototype.forEach.call(list, function (f) {
      if (!ok.test(f.name)) return;
      if (picked.some(function (p) { return p.name === f.name && p.size === f.size; })) return;
      picked.push(f);
    });
    renderFiles();
  }

  if (drop && fileInput) {
    drop.addEventListener("click", function () { fileInput.click(); });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener("change", function () { takeFiles(fileInput.files); });
    ["dragenter", "dragover"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.add("hot");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove("hot");
      });
    });
    drop.addEventListener("drop", function (e) {
      takeFiles(e.dataTransfer.files);
    });
  }

  var form = document.getElementById("lead");
  var note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var comment = form.comment.value.trim();
      if (name.length < 2 || phone.replace(/\D/g, "").length < 10) {
        note.hidden = false;
        note.textContent = "Укажите имя и телефон — иначе заявку некому вернуть.";
        return;
      }
      var files = picked.map(function (f) { return f.name; }).join(", ");
      var body = [
        "Заявка с локального сайта ООО «РСИ»",
        "Имя: " + name,
        "Телефон: " + phone,
        "Комментарий: " + (comment || "—"),
        "Файлы к письму: " + (files || "не выбраны"),
      ].join("\n");
      var href = "mailto:fonn@list.ru?subject=" + encodeURIComponent("Расчёт сметы — " + name)
        + "&body=" + encodeURIComponent(body);
      note.hidden = false;
      note.textContent = files
        ? "Откроется почта. Прикрепите выбранные файлы к письму."
        : "Откроется почта с текстом заявки. Если окно не появилось, напишите на fonn@list.ru.";
      window.location.href = href;
    });
  }

  var hero = document.querySelector(".hero-visual");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("scroll", function () {
      var y = Math.min(window.scrollY, 500);
      hero.style.transform = "translateY(" + (y * 0.12) + "px)";
    }, { passive: true });
  }

  var canvas = document.getElementById("earth");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var rot = 0.2;
    var drag = false;
    var lastX = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var shots = [
      { n: "Шпунт", src: "assets/sites/site-01.webp" },
      { n: "Труба в траншее", src: "assets/sites/site-02.webp" },
      { n: "Крепление", src: "assets/sites/site-03.webp" },
      { n: "Продавливание", src: "assets/sites/site-04.webp" },
      { n: "Оранжевая труба", src: "assets/sites/site-05.webp" },
      { n: "Котлован", src: "assets/sites/site-06.webp" }
    ];
    shots.forEach(function (s, i) {
      s.img = new Image();
      s.img.src = s.src;
      s.ang = i * (Math.PI * 2 / shots.length);
    });
    var pins = document.getElementById("globePoints");
    var pin = document.createElement("div");
    pin.className = "g-pin";
    pins.appendChild(pin);
    function cover(img, dx, dy, size) {
      var iw = img.naturalWidth;
      var ih = img.naturalHeight;
      var scale = Math.max(size / iw, size / ih);
      var sw = size / scale;
      var sh = size / scale;
      var sx = (iw - sw) / 2;
      var sy = (ih - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, size, size);
    }
    function draw() {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var cx = w * 0.5;
      var cy = h * 0.52;
      var R = Math.min(w, h) * 0.34;
      var glass = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
      glass.addColorStop(0, "rgba(70, 48, 32, 0.55)");
      glass.addColorStop(0.45, "rgba(16, 18, 22, 0.72)");
      glass.addColorStop(1, "rgba(6, 7, 9, 0.92)");
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = glass;
      ctx.fill();
      var front = shots[0];
      var frontZ = -2;
      var placed = shots.map(function (s) {
        var a = s.ang + rot;
        var x = Math.sin(a);
        var z = Math.cos(a);
        return { s: s, x: x, z: z, a: a };
      }).sort(function (a, b) { return a.z - b.z; });
      placed.forEach(function (p) {
        if (!p.s.img.complete || !p.s.img.naturalWidth) return;
        if (p.z < -0.15) return;
        var depth = (p.z + 1) / 2;
        var size = R * (0.34 + depth * 0.42);
        var px = cx + p.x * R * 0.62 - size / 2;
        var py = cy - size / 2 + Math.sin(p.a * 2) * 18;
        ctx.save();
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.35 + depth * 0.65;
        cover(p.s.img, px, py, size);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(px + size / 2, py + size / 2, size / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,107,0," + (0.35 + depth * 0.6) + ")";
        ctx.lineWidth = p.z > frontZ ? 2.5 : 1;
        ctx.stroke();
        if (p.z > frontZ) { frontZ = p.z; front = p.s; }
      });
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "rgba(190,230,255,0.8)";
      for (var sy = cy - R; sy < cy + R; sy += 4) {
        ctx.beginPath();
        ctx.moveTo(cx - R, sy);
        ctx.lineTo(cx + R, sy);
        ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,107,0,0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(255,107,0,0.7)";
      ctx.shadowBlur = 22;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 12, 0.7, 2.2);
      ctx.strokeStyle = "rgba(140,220,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      pin.textContent = front.n;
      pin.style.left = "68%";
      pin.style.top = "18%";
      pin.style.opacity = "1";
      if (!drag && !reduce) rot += 0.0035;
      requestAnimationFrame(draw);
    }
    canvas.addEventListener("pointerdown", function (e) {
      drag = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointerup", function () { drag = false; });
    canvas.addEventListener("pointermove", function (e) {
      if (!drag) return;
      rot += (e.clientX - lastX) * 0.006;
      lastX = e.clientX;
    });
    draw();
  }

  var stage = document.getElementById("stage");
  var stageImgs = stage ? stage.querySelectorAll(".stage-frame img") : [];
  var stageCap = document.getElementById("stageCap");
  var stageIndex = 0;
  function setStage(i) {
    if (!stageImgs.length) return;
    stageIndex = (i + stageImgs.length) % stageImgs.length;
    stageImgs.forEach(function (img, n) { img.classList.toggle("on", n === stageIndex); });
    if (stageCap) stageCap.textContent = stageImgs[stageIndex].getAttribute("data-cap") || "";
  }
  if (stage && stageImgs.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(function () { setStage(stageIndex + 1); }, 3400);
  }

  var mapPins = document.querySelectorAll("#cityMap .pin");
  var mapI = 0;
  function hotPin(i) {
    mapPins.forEach(function (p, n) { p.classList.toggle("hot", n === i); });
  }
  if (mapPins.length) {
    hotPin(0);
    mapPins.forEach(function (p, n) {
      p.addEventListener("mouseenter", function () { hotPin(n); mapI = n; });
      p.addEventListener("focus", function () { hotPin(n); mapI = n; });
    });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        mapI = (mapI + 1) % mapPins.length;
        hotPin(mapI);
      }, 2200);
    }
  }
  document.querySelectorAll(".exhibit-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ex = btn.closest(".exhibit");
      var open = ex.classList.toggle("open");
      btn.textContent = open ? "Свернуть ↑" : "Описание экспоната ↓";
    });
  });
})();
