/* =========================================================
   CodeForge Academy — lesson page script
   Expects each lesson page to define, before this script loads:
     window.LESSON_ID       e.g. "html-1"
     window.COURSE_ID       e.g. "html"
     window.COURSE_LESSONS  e.g. ["html-1","html-2","html-3"]
     window.QUIZ_DATA       array of {q, options:[], correct, explain}
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "codeforge_progress";

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch (e) {}
  }
  function isDone(id) { return !!getProgress()[id]; }
  function setDone(id, val) {
    var p = getProgress();
    if (val) p[id] = true; else delete p[id];
    saveProgress(p);
  }

  // ---- mark lesson-sidebar active link + done checkmarks ----
  document.addEventListener("DOMContentLoaded", function () {
    var progress = getProgress();

    document.querySelectorAll(".lesson-sidebar nav a[data-lesson-id]").forEach(function (a) {
      var id = a.getAttribute("data-lesson-id");
      if (progress[id]) {
        var check = document.createElement("span");
        check.textContent = " ✓";
        check.style.color = "var(--green)";
        a.appendChild(check);
      }
    });

    // ---- course progress bar ----
    if (window.COURSE_LESSONS && window.COURSE_LESSONS.length) {
      var total = window.COURSE_LESSONS.length;
      var done = window.COURSE_LESSONS.filter(function (id) { return progress[id]; }).length;
      var pct = Math.round((done / total) * 100);
      document.querySelectorAll(".js-progress-fill").forEach(function (el) { el.style.width = pct + "%"; });
      document.querySelectorAll(".js-progress-text").forEach(function (el) { el.textContent = done + " / " + total + " lessons complete (" + pct + "%)"; });
    }

    // ---- mark as completed button ----
    var markBtn = document.getElementById("markCompleteBtn");
    if (markBtn && window.LESSON_ID) {
      function refreshBtn() {
        var done = isDone(window.LESSON_ID);
        markBtn.classList.toggle("done", done);
        markBtn.textContent = done ? "✓ Completed" : "Mark as Completed";
      }
      refreshBtn();
      markBtn.addEventListener("click", function () {
        setDone(window.LESSON_ID, !isDone(window.LESSON_ID));
        refreshBtn();
        var evt = new Event("DOMContentLoaded");
        // refresh sidebar checkmark + progress bar without full reload
        document.querySelectorAll(".lesson-sidebar nav a[data-lesson-id='" + window.LESSON_ID + "'] span").forEach(function (s) { s.remove(); });
        var link = document.querySelector(".lesson-sidebar nav a[data-lesson-id='" + window.LESSON_ID + "']");
        if (link && isDone(window.LESSON_ID)) {
          var check = document.createElement("span");
          check.textContent = " ✓";
          check.style.color = "var(--green)";
          link.appendChild(check);
        }
        if (window.COURSE_LESSONS && window.COURSE_LESSONS.length) {
          var p2 = getProgress();
          var total2 = window.COURSE_LESSONS.length;
          var done2 = window.COURSE_LESSONS.filter(function (id) { return p2[id]; }).length;
          var pct2 = Math.round((done2 / total2) * 100);
          document.querySelectorAll(".js-progress-fill").forEach(function (el) { el.style.width = pct2 + "%"; });
          document.querySelectorAll(".js-progress-text").forEach(function (el) { el.textContent = done2 + " / " + total2 + " lessons complete (" + pct2 + "%)"; });
        }
      });
    }

    // ---- copy code buttons ----
    document.querySelectorAll(".code-block").forEach(function (block) {
      var btn = block.querySelector(".cb-copy");
      var codeEl = block.querySelector("pre code");
      if (!btn || !codeEl) return;
      btn.addEventListener("click", function () {
        var text = codeEl.textContent;
        var done = function () {
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(function () { btn.textContent = "Copy code"; btn.classList.remove("copied"); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
    });
    function fallbackCopy(text, cb) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      cb();
    }

    // ---- TOC scrollspy ----
    var tocLinks = document.querySelectorAll(".toc-box nav a");
    var targets = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      var el = document.getElementById(id);
      if (el) targets.push({ link: a, el: el });
    });
    function onScroll() {
      var pos = window.scrollY + 120;
      var current = null;
      targets.forEach(function (t) {
        if (t.el.offsetTop <= pos) current = t;
      });
      tocLinks.forEach(function (a) { a.classList.remove("active"); });
      if (current) current.link.classList.add("active");
    }
    if (targets.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // ---- practice challenge: reveal answer tracked, no auto action needed (native <details>) ----

    // ---- live demo runner (HTML/CSS/JS lessons) ----
    document.querySelectorAll(".live-demo").forEach(function (demo) {
      var runBtn = demo.querySelector(".ld-run");
      var textarea = demo.querySelector("textarea");
      var output = demo.querySelector(".ld-output");
      if (!runBtn || !textarea || !output) return;
      var mode = demo.getAttribute("data-mode") || "html";

      function run() {
        if (mode === "html") {
          output.innerHTML = "";
          var frame = document.createElement("iframe");
          frame.style.width = "100%";
          frame.style.border = "none";
          frame.style.minHeight = "120px";
          output.appendChild(frame);
          var doc = frame.contentDocument || frame.contentWindow.document;
          doc.open(); doc.write(textarea.value); doc.close();
        } else if (mode === "js") {
          var logs = [];
          var fakeConsole = { log: function () { logs.push(Array.prototype.slice.call(arguments).join(" ")); } };
          try {
            var fn = new Function("console", textarea.value);
            fn(fakeConsole);
            output.textContent = logs.length ? logs.join("\n") : "(no console output — try console.log(...))";
          } catch (err) {
            output.textContent = "Error: " + err.message;
          }
        }
      }
      runBtn.addEventListener("click", run);
      run(); // show initial output
    });

    // ---- quiz engine ----
    initQuiz();
  });

  function initQuiz() {
    var box = document.getElementById("quizBox");
    if (!box || !window.QUIZ_DATA || !window.QUIZ_DATA.length) return;

    var data = window.QUIZ_DATA;
    var current = 0;
    var answers = new Array(data.length).fill(null);

    var qContainer = box.querySelector(".quiz-questions");
    var progressEl = box.querySelector(".quiz-progress");
    var prevBtn = box.querySelector(".quiz-prev");
    var nextBtn = box.querySelector(".quiz-next");
    var submitBtn = box.querySelector(".quiz-submit");
    var resultEl = box.querySelector(".quiz-result");
    var restartBtn = box.querySelector(".quiz-restart");

    function render() {
      qContainer.innerHTML = "";
      data.forEach(function (q, i) {
        var div = document.createElement("div");
        div.className = "quiz-q" + (i === current ? " current" : "");
        var h4 = document.createElement("h4");
        h4.textContent = (i + 1) + ". " + q.q;
        div.appendChild(h4);
        var optsWrap = document.createElement("div");
        optsWrap.className = "quiz-options";
        q.options.forEach(function (opt, oi) {
          var label = document.createElement("label");
          label.className = "quiz-option" + (answers[i] === oi ? " selected" : "");
          label.innerHTML = '<input type="radio" name="q' + i + '" ' + (answers[i] === oi ? "checked" : "") + "> " + opt;
          label.addEventListener("click", function () {
            answers[i] = oi;
            render();
          });
          optsWrap.appendChild(label);
        });
        div.appendChild(optsWrap);
        qContainer.appendChild(div);
      });
      progressEl.textContent = "Question " + (current + 1) + " of " + data.length;
      prevBtn.disabled = current === 0;
      nextBtn.style.display = current === data.length - 1 ? "none" : "inline-flex";
      submitBtn.style.display = current === data.length - 1 ? "inline-flex" : "none";
    }

    prevBtn.addEventListener("click", function () { if (current > 0) { current--; render(); } });
    nextBtn.addEventListener("click", function () { if (current < data.length - 1) { current++; render(); } });

    submitBtn.addEventListener("click", function () {
      var score = 0;
      var feedback = document.createElement("div");
      feedback.className = "quiz-feedback-list";
      data.forEach(function (q, i) {
        var right = answers[i] === q.correct;
        if (right) score++;
        var item = document.createElement("div");
        item.className = "quiz-feedback-item " + (right ? "right" : "wrong");
        item.textContent = (i + 1) + ". " + (right ? "Correct — " : "Incorrect — correct answer: " + q.options[q.correct] + ". ") + q.explain;
        feedback.appendChild(item);
      });

      box.querySelector(".quiz-body").style.display = "none";
      resultEl.innerHTML = "";
      var scoreNum = document.createElement("div");
      scoreNum.className = "score-num";
      scoreNum.textContent = score + " / " + data.length;
      var scoreLabel = document.createElement("p");
      scoreLabel.textContent = score === data.length
        ? "Perfect score! Great work."
        : (score >= Math.ceil(data.length * 0.6) ? "Nice job — review the ones you missed below." : "Keep practicing — review the explanations below and try again.");
      resultEl.appendChild(scoreNum);
      resultEl.appendChild(scoreLabel);
      resultEl.appendChild(feedback);
      var restart = document.createElement("button");
      restart.className = "btn btn-outline restart-inner";
      restart.textContent = "Restart Quiz";
      restart.addEventListener("click", resetQuiz);
      resultEl.appendChild(restart);
      resultEl.classList.add("show");
    });

    function resetQuiz() {
      answers = new Array(data.length).fill(null);
      current = 0;
      resultEl.classList.remove("show");
      box.querySelector(".quiz-body").style.display = "";
      render();
    }

    render();
  }
})();
