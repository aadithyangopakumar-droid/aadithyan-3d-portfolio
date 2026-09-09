/* Content is maintained separately in content.js. */
const PORTFOLIO = window.PORTFOLIO_DATA || null;

(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = $("#header");
  const menu = $(".menu-toggle");
  const navLinks = $("#nav-links");

  const setMenu = (open, restoreFocus = false) => {
    header.classList.toggle("is-menu-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.replaceChildren(document.createTextNode(open ? "Close " : "Menu "));
    const symbol = document.createElement("span");
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = open ? "−" : "+";
    menu.append(symbol);
    if (restoreFocus) menu.focus();
  };
  menu.hidden = false;
  header.classList.add("nav-ready");
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  navLinks.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const wasOpen = menu.getAttribute("aria-expanded") === "true";
    setMenu(false);
    if (wasOpen && link.hash) {
      const destination = document.getElementById(link.hash.slice(1));
      if (destination) {
        destination.setAttribute("tabindex", "-1");
        destination.focus({ preventScroll: true });
        destination.addEventListener("blur", () => destination.removeAttribute("tabindex"), { once: true });
      }
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", () => setMenu(false));

  // Accept ordinary web links and local project paths; reject executable URLs.
  const webUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value.trim(), window.location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  const element = (tag, className, value) => {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (value) item.textContent = value;
    return item;
  };
  const makeLink = (url, className, label) => {
    const link = element("a", className, label);
    link.href = url;
    if (new URL(url).origin !== window.location.origin) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  };

  const grid = $("#project-grid");
  const hasProjects = PORTFOLIO && Array.isArray(PORTFOLIO.projects);
  const projects = hasProjects ? PORTFOLIO.projects : [];
  // Preserve the HTML project entry if content.js is missing or invalid.
  if (hasProjects) grid.replaceChildren();
  for (const project of projects) {
    if (!project || typeof project.title !== "string" || !project.title.trim()) continue;
    const card = element("article", "project reveal");
    const url = webUrl(project.url);
    const imageUrl = webUrl(project.image);
    if (imageUrl) {
      const image = element("img");
      image.src = imageUrl;
      image.alt = project.imageAlt || project.title;
      image.loading = "lazy";
      image.decoding = "async";
      image.width = 1000;
      image.height = 750;
      image.addEventListener("error", () => {
        image.replaceWith(element("p", "project-media-note", "Project image unavailable."));
      }, { once: true });
      const media = url ? makeLink(url, "project-image-link", "") : element("div", "project-image-link");
      if (url) media.setAttribute("aria-label", "View " + project.title);
      media.append(image);
      card.append(media);
    }
    const meta = element("div", "project-meta");
    meta.append(element("span", "", project.category || ""), element("span", "", project.tools || ""));
    const heading = element("h3");
    if (url) heading.append(makeLink(url, "", project.title));
    else heading.textContent = project.title;
    card.append(meta, heading);
    if (project.description) card.append(element("p", "project-description", project.description));
    const notes = Array.isArray(project.details) ? project.details.filter((note) => typeof note === "string" && note.trim()) : [];
    const destinations = [
      ["Watch video", webUrl(project.videoUrl)],
      ["Open demo", webUrl(project.demoUrl)],
      ["View source", webUrl(project.sourceUrl)]
    ].filter(([, destination]) => destination);
    if (notes.length || destinations.length) {
      const details = element("details", "project-details");
      const summary = element("summary", "", "Read project details ");
      const symbol = element("span", "", "+");
      symbol.setAttribute("aria-hidden", "true");
      summary.append(symbol);
      const body = element("div", "project-detail-body");
      if (notes.length) {
        body.append(element("p", "small-label", "What I worked on"));
        const list = element("ul", "content-list");
        notes.forEach((note) => list.append(element("li", "", note)));
        body.append(list);
      }
      if (destinations.length) {
        const actions = element("div", "project-actions");
        destinations.forEach(([label, destination]) => actions.append(makeLink(destination, "text-link", label + " ↗")));
        body.append(actions);
      }
      details.append(summary, body);
      card.append(details);
    }
    grid.append(card);
  }
  grid.hidden = grid.children.length === 0;
  grid.classList.toggle("single-project", grid.children.length === 1);
  $("#work-empty").hidden = !grid.hidden;

  const contact = $("#contact-link");
  const email = typeof PORTFOLIO?.email === "string" ? PORTFOLIO.email.trim() : "";
  const github = webUrl(PORTFOLIO?.github);
  if (/^[^\s@:?&#]+@[^\s@:?&#]+\.[^\s@:?&#]+$/.test(email)) {
    contact.href = "mailto:" + email;
    contact.removeAttribute("target");
    contact.removeAttribute("rel");
    contact.textContent = "Email me ↗";
    $("#contact-email").href = "mailto:" + email;
    $("#contact-email").textContent = email;
  } else if (github) {
    contact.href = github;
    contact.target = "_blank";
    contact.rel = "noopener noreferrer";
    contact.textContent = "Find me on GitHub ↗";
    $("#contact-email").hidden = true;
  } else if (PORTFOLIO) {
    contact.hidden = true;
    $("#contact-email").hidden = true;
  }
  if (PORTFOLIO) {
    const phone = typeof PORTFOLIO.phone === "string" ? PORTFOLIO.phone.replace(/[^+\d]/g, "") : "";
    document.querySelectorAll("[data-phone-link]").forEach((link) => {
      link.hidden = !/^\+?\d{7,15}$/.test(phone);
      if (!link.hidden) {
        link.href = "tel:" + phone;
        link.textContent = PORTFOLIO.phoneDisplay || phone;
      }
    });
    const resumeUrl = webUrl(PORTFOLIO.resume);
    document.querySelectorAll("[data-resume-link]").forEach((link) => {
      link.hidden = !resumeUrl;
      if (resumeUrl) link.href = resumeUrl;
    });
    $("#github-link").hidden = !github;
    if (github) $("#github-link").href = github;
    const socials = Array.isArray(PORTFOLIO.socials) ? PORTFOLIO.socials : [];
    for (const social of socials) {
      const destination = webUrl(social?.url);
      if (destination && typeof social.label === "string" && social.label.trim()) {
        $("#extra-socials").append(makeLink(destination, "", social.label + " ↗"));
      }
    }
  }

  if ("IntersectionObserver" in window && !motionPreference.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((item) => {
      if (!item.hidden && item.getBoundingClientRect().top > window.innerHeight * .95) {
        item.classList.add("is-pending");
        revealObserver.observe(item);
      }
    });
    motionPreference.addEventListener("change", () => {
      if (!motionPreference.matches) return;
      document.querySelectorAll(".is-pending").forEach((item) => item.classList.remove("is-pending"));
      revealObserver.disconnect();
    });
  }

  const progress = $(".reading-progress");
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const value = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
    progress.style.transform = "scaleX(" + value + ")";
  };
  const requestProgress = () => {
    if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
  };
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress, { passive: true });
  window.addEventListener("load", requestProgress, { once: true });
  updateProgress();

  // Navigation and content stay usable if the optional 3D scene cannot load.
  import("./scene.js").then(({ initScene }) => initScene()).catch(() => {
    $("#hero-visual").hidden = true;
    $("#hero-layout").classList.remove("has-scene");
  });
})();
