/* =========================================================
   CodeForge Academy — global site script
   ========================================================= */
(function () {
  "use strict";

  // ---- mobile nav toggle ----
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var expanded = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
      });
    });
  }

  // ---- highlight active nav link based on current page ----
  var here = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav-links a[data-page]").forEach(function (a) {
    if (a.getAttribute("data-page") === here) a.classList.add("active");
  });

  // ---- FAQ accordion (about.html / pricing.html) ----
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-a").style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        a.style.maxHeight = null;
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  // ---- contact form validation (client-side only, no backend) ----
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;

      var fields = [
        { id: "cf-name", check: function (v) { return v.trim().length > 1; } },
        { id: "cf-email", check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
        { id: "cf-subject", check: function (v) { return v.trim().length > 2; } },
        { id: "cf-message", check: function (v) { return v.trim().length > 9; } }
      ];

      fields.forEach(function (f) {
        var input = document.getElementById(f.id);
        var wrap = input.closest(".form-field");
        if (!f.check(input.value)) {
          wrap.classList.add("invalid");
          valid = false;
        } else {
          wrap.classList.remove("invalid");
        }
      });

      var status = document.getElementById("formStatus");
      if (valid) {
        status.textContent = "Message sent! Our team will get back to you within one business day.";
        status.classList.add("show");
        form.reset();
      } else {
        status.classList.remove("show");
      }
    });
  }

  // ---- course filter (courses.html) ----
  var filterBar = document.getElementById("courseFilter");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      document.querySelectorAll(".course-block").forEach(function (block) {
        var show = filter === "all" || block.getAttribute("data-cat") === filter;
        block.style.display = show ? "" : "none";
      });
    });
  }

  // ---- pricing monthly/yearly toggle ----
  var billToggle = document.getElementById("billToggle");
  if (billToggle) {
    billToggle.addEventListener("change", function () {
      var yearly = billToggle.checked;
      document.querySelectorAll("[data-monthly]").forEach(function (el) {
        el.textContent = yearly ? el.getAttribute("data-yearly") : el.getAttribute("data-monthly");
      });
      document.querySelectorAll(".bill-period").forEach(function (el) {
        el.textContent = yearly ? "/year" : "/month";
      });
    });
  }
})();
