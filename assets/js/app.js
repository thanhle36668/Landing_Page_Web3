/* Web3VN — interactions */
(function () {
  "use strict";

  // Navbar: đổi nền khi cuộn
  var nav = document.getElementById("mainNav");
  function onScrollNav() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  // Đóng menu mobile sau khi bấm link
  var navMenu = document.getElementById("navMenu");
  navMenu.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      if (navMenu.classList.contains("show")) {
        var collapse = bootstrap.Collapse.getInstance(navMenu);
        if (collapse) collapse.hide();
      }
    });
  });

  // Hiệu ứng hiện dần khi cuộn tới
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // Đánh dấu nav-link đang xem (scrollspy đơn giản)
  var sections = document.querySelectorAll("header[id], section[id]");
  var navLinks = document.querySelectorAll('#mainNav .nav-link[href^="#"]');
  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  // Nút về đầu trang
  var backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Thanh tiến trình cuộn
  var progress = document.getElementById("scrollProgress");
  if (progress) {
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }, { passive: true });
  }

  // Năm hiện tại ở footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Tài liệu tham khảo: fetch JSON + render + lọc =====
  (function initResources() {
    var grid = document.getElementById("resourceGrid");
    if (!grid) return;

    var LEVEL_NAMES = { "co-ban": "Cơ bản", "trung-cap": "Trung cấp", "nang-cao": "Nâng cao" };
    var TYPE_ICONS = {
      "Tài liệu chính thức": "📄", "Tài liệu gốc": "📜", "Bài viết": "📝",
      "Video": "🎬", "Khóa học": "🎓", "Sách": "📚",
      "Tổng hợp": "🗂️", "Nghiên cứu": "🔬", "Cộng đồng": "💬"
    };
    var allResources = [];

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function cardHtml(r) {
      var icon = TYPE_ICONS[r.type] || "🔗";
      var levelName = LEVEL_NAMES[r.level] || r.level;
      var free = r.free ? "🆓 Miễn phí" : "💳 Trả phí";
      return (
        '<div class="col-md-6 col-lg-4 resource-item">' +
          '<div class="glass-card resource-card h-100 d-flex flex-column">' +
            '<div class="d-flex justify-content-between align-items-center gap-2 mb-2">' +
              '<span class="type-badge">' + icon + " " + esc(r.type) + "</span>" +
              '<span class="level-badge ' + esc(r.level) + '">' + esc(levelName) + "</span>" +
            "</div>" +
            "<h3>" + esc(r.title) + "</h3>" +
            '<p class="flex-grow-1">' + esc(r.description) + "</p>" +
            '<div class="resource-meta">🌐 ' + esc(r.language) + " &nbsp;·&nbsp; " + free + "</div>" +
            '<a class="resource-link" href="' + esc(r.url) + '" target="_blank" rel="noopener">Mở tài liệu →</a>' +
          "</div>" +
        "</div>"
      );
    }

    function render(level) {
      var list = level === "all" ? allResources : allResources.filter(function (r) { return r.level === level; });
      if (!list.length) {
        grid.innerHTML = '<div class="col-12 text-center py-4"><p class="section-sub">Chưa có tài liệu nào ở mục này.</p></div>';
        return;
      }
      grid.innerHTML = list.map(cardHtml).join("");
    }

    function showError() {
      var loading = document.getElementById("resourceLoading");
      if (loading) loading.remove();
      var err = document.getElementById("resourceError");
      if (err) err.classList.remove("d-none");
    }

    // Lọc theo trình độ
    document.querySelectorAll("#resourceFilters .filter-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("#resourceFilters .filter-pill").forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        render(btn.getAttribute("data-level"));
      });
    });

    fetch("assets/data/resources.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        allResources = Array.isArray(data.resources) ? data.resources : [];
        var loading = document.getElementById("resourceLoading");
        if (loading) loading.remove();
        render("all");
      })
      .catch(function () { showError(); });
  })();
})();
