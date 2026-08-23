import "./sass/main.scss";
import "/src/tailwind.css";

import { createIcons, icons } from "lucide";

import {
  initStickyHeader,
  initMenu,
  initCardsAnimation,
  initSmoothScroll,
  freeTourToTurixe,
  initAccordionsFQ,
  initAccordionsRQ,
  initCookies,
  initCtaFooterSticky,
} from "./modules/ui.js";

import { initGoogleReviews } from "./modules/reviews.js";

// 👇 AQUÍ IMPORTAMOS EL MEGAMENU
import { initMegaMenu } from "./modules/megaMenu.js";

import { initTourStats } from "./modules/tourStats.js";

import { initTourReviews } from "./modules/tourReviews.js";

import { Analytics } from '@vercel/analytics/react';

// ============================================
// ICONOS
// ============================================
createIcons({ icons });

// ============================================
// CARRUSEL DE COMENTARIOS
// Los botones/anclas siguen funcionando sin JS (scroll nativo dentro
// del contenedor con overflow-x). Con JS cargado, interceptamos el
// click para evitar que el navegador salte a la parte de arriba de
// la página si por lo que sea el contenedor pierde su overflow.
// ============================================
function initCommentCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    if (!track) return;

    const getStep = () => {
      const item = track.querySelector("[data-carousel-item]");
      if (!item) return track.clientWidth;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0");
      return item.getBoundingClientRect().width + gap;
    };

    carousel.querySelectorAll("[data-carousel-prev]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        track.scrollBy({ left: -getStep(), behavior: "smooth" });
      });
    });

    carousel.querySelectorAll("[data-carousel-next]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        track.scrollBy({ left: getStep(), behavior: "smooth" });
      });
    });

    carousel.querySelectorAll("[data-carousel-dot]").forEach((dot, index) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        track.scrollTo({ left: index * getStep(), behavior: "smooth" });
      });
    });
  });
}

// ============================================
// DRAWERS LATERALES (menú móvil, submenú usuario, etc.)
// ============================================
function initDrawers() {
  const getDrawerEls = (name) => ({
    root: document.querySelector(`[data-drawer="${name}"]`),
    backdrop: document.querySelector(`[data-drawer-backdrop="${name}"]`),
    panel: document.querySelector(`[data-drawer-panel="${name}"]`),
    triggers: document.querySelectorAll(`[data-drawer-trigger="${name}"]`),
  });

  const anyDrawerOpen = () =>
    document.querySelector('[data-drawer][aria-hidden="false"]');

  const openDrawer = (name) => {
    const { root, backdrop, panel, triggers } = getDrawerEls(name);
    if (!root || !panel) return;

    root.classList.remove("pointer-events-none");
    root.setAttribute("aria-hidden", "false");

    backdrop?.classList.remove("opacity-0");
    backdrop?.classList.add("opacity-100");

    panel.classList.remove(panel.dataset.closed);
    panel.classList.add("translate-x-0");

    triggers.forEach((t) => t.setAttribute("aria-expanded", "true"));
    document.documentElement.classList.add("overflow-hidden");
  };

  const closeDrawer = (name) => {
    const { root, backdrop, panel, triggers } = getDrawerEls(name);
    if (!root || !panel) return;

    backdrop?.classList.remove("opacity-100");
    backdrop?.classList.add("opacity-0");

    panel.classList.remove("translate-x-0");
    panel.classList.add(panel.dataset.closed);

    triggers.forEach((t) => t.setAttribute("aria-expanded", "false"));
    root.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      if (root.getAttribute("aria-hidden") === "true") {
        root.classList.add("pointer-events-none");
      }
    }, 300);

    if (!anyDrawerOpen()) {
      document.documentElement.classList.remove("overflow-hidden");
    }
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-drawer-trigger]");
    if (trigger) {
      const name = trigger.getAttribute("data-drawer-trigger");
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      isOpen ? closeDrawer(name) : openDrawer(name);
      return;
    }

    const closer = e.target.closest("[data-drawer-close]");
    if (closer) {
      closeDrawer(closer.getAttribute("data-drawer-close"));
      return;
    }

    const backdrop = e.target.closest("[data-drawer-backdrop]");
    if (backdrop) {
      closeDrawer(backdrop.getAttribute("data-drawer-backdrop"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document
        .querySelectorAll('[data-drawer][aria-hidden="false"]')
        .forEach((root) => closeDrawer(root.getAttribute("data-drawer")));
    }
  });
}

// ============================================
// HEADER TRANSPARENTE SOBRE EL HERO (solo escritorio)
// ============================================
const SCROLL_THRESHOLD = 40;

function initHeaderScroll() {
  const header = document.querySelector("[data-site-header]");
  const headerLogo = document.querySelector("[data-header-logo]");
  const headerLinks = document.querySelectorAll("[data-header-link]");

  function setHeaderScrolled(isScrolled) {
    if (!header) return;

    header.classList.toggle("md:bg-white", isScrolled);
    header.classList.toggle("md:shadow-sm", isScrolled);
    header.classList.toggle("md:bg-transparent", !isScrolled);
    header.classList.toggle("md:shadow-none", !isScrolled);

    if (headerLogo) {
      headerLogo.classList.toggle("md:brightness-0", !isScrolled);
      headerLogo.classList.toggle("md:invert", !isScrolled);
    }

    headerLinks.forEach((link) => {
      link.classList.toggle("md:text-white!", !isScrolled);
      link.classList.toggle("md:text-[#222222]", isScrolled);
    });
  }

  function handleScroll() {
    setHeaderScrolled(window.scrollY > SCROLL_THRESHOLD);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

// ============================================
// CONTADOR DE RESEÑAS (Google / GuruWalk / FreeTour / Turixe)
// ============================================
function calculateReviews(startDateStr, baseCount, daysPerReview) {
  const startDate = new Date(startDateStr);
  const currentDate = new Date();

  const diffTime = Math.max(0, currentDate - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const addedReviews = Math.floor(diffDays / daysPerReview);
  return baseCount + addedReviews;
}

const START_DATE = "2026-08-10";

export const reviewCounts = {
  google: calculateReviews(START_DATE, 130, 5),
  guruwalk: calculateReviews(START_DATE, 750, 0.7),
  freetour: calculateReviews(START_DATE, 180, 7),
  turixe: calculateReviews(START_DATE, 120, 7), // Suma +1 cada 7 días (+2 cada 14 días)
};

function initReviewCounters() {
  const googleEl = document.getElementById("review-count-google");
  const guruEl = document.getElementById("review-count-guru");
  const freetourEl = document.getElementById("review-count-freetour");

  if (googleEl) googleEl.textContent = `+${reviewCounts.google}`;
  if (guruEl) guruEl.textContent = `+${reviewCounts.guruwalk}`;
  if (freetourEl) freetourEl.textContent = `+${reviewCounts.freetour}`;
}

// ============================================
// CLICK DELEGADO EN [data-url] (tarjetas clicables)
// ============================================
function initDataUrlLinks() {
  document.addEventListener("click", (e) => {
    const element = e.target.closest("[data-url]");
    if (element) {
      const url = element.getAttribute("data-url");
      if (url) window.location.href = url;
    }
  });
}

// ============================================
// ARRANQUE
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Web cargada y lista");

  initMenu();
  initCookies();
  initCardsAnimation();
  initAccordionsRQ();
  initAccordionsFQ();
  initStickyHeader();
  initSmoothScroll();
  freeTourToTurixe();
  initCtaFooterSticky();
  initHeaderScroll();
  initCommentCarousels();
  initDrawers();
  initDataUrlLinks();
  initReviewCounters();

  // 👇 AQUÍ INICIALIZAMOS EL MEGAMENU
  initMegaMenu();

  if (document.getElementById("reviews-swiper")) {
    initGoogleReviews();
  }

  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

// Ejecutar cuando el HTML esté listo
document.addEventListener("DOMContentLoaded", () => {
  initTourStats();
  initTourReviews();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Analytics />
  </React.StrictMode>
);
