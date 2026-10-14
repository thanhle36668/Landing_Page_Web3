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

  // Năm hiện tại ở footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
