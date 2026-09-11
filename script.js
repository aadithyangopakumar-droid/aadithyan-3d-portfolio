/* Shared behaviour for the home page and the Work page. */
(() => {
  "use strict";
  const data = window.PORTFOLIO_DATA;
  const $ = (selector) => document.querySelector(selector);
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const progress = $(".reading-progress");
  let progressFrame = 0;

  function updateProgress() {
    progressFrame = 0;
    if (!progress) return;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
    progress.style.transform = "scaleX(" + fraction + ")";
  }
  function requestProgress() {
    if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  }
  function webUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value.trim(), window.location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  }
  function element(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  }
  function makeLink(url, className, text) {
    const link = element("a", className, text);
    link.href = url;
    if (new URL(url).origin !== window.location.origin) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  const header = $("#header");
  const menu = $(".menu-toggle");
  const navLinks = $("#nav-links");
  if (header && menu && navLinks) {
    function setMenu(open, restoreFocus = false) {
      header.classList.toggle("is-menu-open", open);
      menu.setAttribute("aria-expanded", String(open));
      menu.replaceChildren(document.createTextNode(open ? "Close " : "Menu "));
      const symbol = element("span", "", open ? "−" : "+");
      symbol.setAttribute("aria-hidden", "true");
      menu.append(symbol);
      if (restoreFocus) menu.focus();
    }
    menu.hidden = false;
    header.classList.add("nav-ready");
    menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
    navLinks.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      const wasOpen = menu.getAttribute("aria-expanded") === "true";
      setMenu(false);
      const samePage = new URL(link.href).pathname === window.location.pathname;
      if (wasOpen && samePage && link.hash) {
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
      if (!header.contains(event.target) && menu.getAttribute("aria-expanded") === "true") setMenu(false);
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", () => setMenu(false));
  }

  // One shared image viewer. The browser provides modal focus management.
  let viewer;
  let viewerImage;
  let viewerTitle;
  let viewerCounter;
  let viewerStatus;
  let previousButton;
  let nextButton;
  let viewerItems = [];
  let viewerIndex = 0;
  let viewerOpener;
  function showViewerImage(index) {
    viewerIndex = (index + viewerItems.length) % viewerItems.length;
    const item = viewerItems[viewerIndex];
    viewerStatus.textContent = "Loading image…";
    viewerImage.hidden = false;
    viewerImage.onload = () => { viewerStatus.textContent = ""; };
    viewerImage.onerror = () => {
      viewerImage.hidden = true;
      viewerStatus.textContent = "This image could not be loaded.";
    };
    viewerImage.alt = item.alt;
    viewerImage.src = item.src;
    viewerCounter.textContent = viewerItems.length > 1 ? (viewerIndex + 1) + " / " + viewerItems.length : "";
    previousButton.hidden = nextButton.hidden = viewerItems.length < 2;
  }
  function ensureViewer() {
    if (viewer) return;
    viewer = element("dialog", "media-viewer");
    viewer.setAttribute("aria-labelledby", "media-viewer-title");
    const bar = element("div", "media-viewer-bar");
    viewerTitle = element("h2", "");
    viewerTitle.id = "media-viewer-title";
    const close = element("button", "viewer-close", "Close ×");
    close.type = "button";
    close.setAttribute("aria-label", "Close image viewer");
    close.autofocus = true;
    close.addEventListener("click", () => viewer.close());
    bar.append(viewerTitle, close);
    const stage = element("div", "media-viewer-stage");
    viewerImage = element("img", "media-viewer-image");
    viewerStatus = element("p", "media-viewer-status");
    viewerStatus.setAttribute("role", "status");
    stage.append(viewerImage, viewerStatus);
    const controls = element("div", "media-viewer-controls");
    previousButton = element("button", "viewer-step", "← Previous");
    nextButton = element("button", "viewer-step", "Next →");
    previousButton.type = nextButton.type = "button";
    previousButton.setAttribute("aria-label", "Previous image");
    nextButton.setAttribute("aria-label", "Next image");
    previousButton.addEventListener("click", () => showViewerImage(viewerIndex - 1));
    nextButton.addEventListener("click", () => showViewerImage(viewerIndex + 1));
    viewerCounter = element("span", "viewer-counter");
    viewerCounter.setAttribute("aria-live", "polite");
    controls.append(previousButton, viewerCounter, nextButton);
    viewer.append(bar, stage, controls);
    viewer.addEventListener("click", (event) => {
      if (event.target !== viewer) return;
      const rect = viewer.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
    });
    viewer.addEventListener("keydown", (event) => {
      if (viewerItems.length < 2) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); showViewerImage(viewerIndex - 1); }
      if (event.key === "ArrowRight") { event.preventDefault(); showViewerImage(viewerIndex + 1); }
    });
    viewer.addEventListener("close", () => {
      document.documentElement.classList.remove("viewer-open");
      if (viewerOpener?.isConnected) viewerOpener.focus({ preventScroll: true });
    });
    document.body.append(viewer);
  }
  function openViewer(items, index, title, opener) {
    ensureViewer();
    if (typeof viewer.showModal !== "function") {
      window.open(items[index].src, "_blank", "noopener,noreferrer");
      return;
    }
    viewerItems = items;
    viewerOpener = opener;
    viewerTitle.textContent = title;
    showViewerImage(index);
    if (!viewer.open) viewer.showModal();
    document.documentElement.classList.add("viewer-open");
  }
  function getImages(project) {
    const candidates = [
      { src: project.image, alt: project.imageAlt || project.title },
      ...(Array.isArray(project.images) ? project.images : []).map((item) => typeof item === "string" ? { src: item, alt: project.title } : item)
    ];
    const seen = new Set();
    return candidates.flatMap((item) => {
      const src = webUrl(item?.src);
      if (!src || seen.has(src)) return [];
      seen.add(src);
      return [{ src, alt: typeof item.alt === "string" && item.alt ? item.alt : project.title }];
    });
  }
  function imageButton(project, images, index, thumbnail = false) {
    const item = images[index];
    const button = element("button", thumbnail ? "project-thumbnail" : "project-image-link");
    button.type = "button";
    button.setAttribute("aria-label", "View " + project.title + (images.length > 1 ? ", image " + (index + 1) : " image"));
    const image = element("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = project.collection === "posters" ? 800 : 1280;
    image.height = project.collection === "posters" ? 1000 : 720;
    image.style.objectFit = project.imageFit === "cover" ? "cover" : "contain";
    image.addEventListener("error", () => {
      image.replaceWith(element("span", "project-media-note", "Image unavailable"));
      button.disabled = true;
    }, { once: true });
    button.append(image);
    if (!thumbnail) {
      const hint = element("span", "image-preview-hint", "View image ↗");
      hint.setAttribute("aria-hidden", "true");
      button.append(hint);
    }
    button.addEventListener("click", () => openViewer(images, index, project.title, button));
    return button;
  }
  function createProject(project, fullGallery) {
    const card = element("article", "project reveal collection-" + project.collection);
    card.dataset.collection = project.collection || "";
    if (project.id) card.id = "work-" + String(project.id).replace(/[^a-z0-9_-]/gi, "");
    const images = getImages(project);
    if (images.length) card.append(imageButton(project, images, 0));
    else card.classList.add("text-project");
    const meta = element("div", "project-meta");
    meta.append(element("span", "", project.category || ""), element("span", "", project.tools || ""));
    const heading = element(fullGallery ? "h2" : "h3", "", project.title);
    card.append(meta, heading);
    if (project.role) card.append(element("p", "project-role", project.role));
    if (project.description) card.append(element("p", "project-description", project.description));
    const playable = webUrl(project.demoUrl);
    if (playable) card.append(makeLink(playable, "text-link", "Play game ↗"));
    const notes = Array.isArray(project.details) ? project.details.filter((item) => typeof item === "string" && item.trim()) : [];
    const destinations = [
      ["View project", webUrl(project.url)],
      ["Watch video", webUrl(project.videoUrl)],
      ["View source", webUrl(project.sourceUrl)],
      ["Open on Google Drive", webUrl(project.driveUrl)]
    ].filter(([, url]) => url);
    const videoUrl = webUrl(project.videoFile);
    if (notes.length || destinations.length || images.length > 1 || videoUrl) {
      const details = element("details", "project-details");
      const summary = element("summary", "", "Read project details ");
      const symbol = element("span", "", "+");
      symbol.setAttribute("aria-hidden", "true");
      summary.append(symbol);
      const body = element("div", "project-detail-body");
      if (notes.length) {
        body.append(element("p", "small-label", "About this work"));
        const list = element("ul", "content-list");
        notes.forEach((note) => list.append(element("li", "", note)));
        body.append(list);
      }
      if (images.length > 1) {
        const gallery = element("div", "project-thumbnails");
        images.forEach((_, index) => gallery.append(imageButton(project, images, index, true)));
        body.append(gallery);
      }
      if (videoUrl) {
        const video = element("video", "project-video");
        video.controls = true;
        video.preload = "none";
        video.playsInline = true;
        video.setAttribute("aria-label", project.title + " video");
        if (images[0]) video.poster = images[0].src;
        video.src = videoUrl;
        video.addEventListener("error", () => {
          video.hidden = true;
          body.append(element("p", "project-media-note", "Video preview unavailable."));
        }, { once: true });
        body.append(video);
      }
      if (destinations.length) {
        const actions = element("div", "project-actions");
        destinations.forEach(([label, url]) => actions.append(makeLink(url, "text-link", label + " ↗")));
        body.append(actions);
      }
      details.append(summary, body);
      details.addEventListener("toggle", () => {
        if (!details.open) details.querySelectorAll("video").forEach((video) => video.pause());
        requestProgress();
      });
      card.append(details);
    }
    return card;
  }

  const grid = $("#project-grid");
  if (grid && Array.isArray(data?.projects)) {
    const fullGallery = grid.dataset.galleryMode === "all";
    const valid = data.projects.filter((project) => project && typeof project.title === "string" && project.title.trim());
    const projects = fullGallery ? valid : valid.filter((project) => project.featured !== false).slice(0, 4);
    grid.replaceChildren(...projects.map((project) => createProject(project, fullGallery)));
    const cards = [...grid.children];
    const empty = $("#work-empty");
    const filters = $("#work-filters");
    const status = $("#gallery-status");
    const collections = Array.isArray(data.collections) ? data.collections.filter((item) => item && /^[a-z0-9-]+$/.test(item.id) && typeof item.label === "string") : [];
    const choices = [{ id: "all", label: "All work" }, ...collections];
    const filterButtons = [];
    function applyFilter(requested, writeUrl = false, animate = false) {
      const current = choices.find((item) => item.id === requested) || choices[0];
      let count = 0;
      for (const card of cards) {
        const matches = current.id === "all" || card.dataset.collection === current.id;
        card.hidden = !matches;
        if (matches) {
          card.classList.remove("is-pending");
          if (animate && !motionPreference.matches && typeof card.animate === "function") {
            card.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 350, delay: Math.min(count * 45, 180), easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
          }
          count++;
        } else card.querySelectorAll("video").forEach((video) => video.pause());
      }
      grid.hidden = count === 0;
      grid.classList.toggle("single-project", count === 1);
      if (empty) empty.hidden = count !== 0;
      if ($("#empty-category")) $("#empty-category").textContent = current.label;
      if ($("#empty-title")) $("#empty-title").textContent = current.id === "all" ? "More work is on the way." : current.label + " coming soon.";
      if (status) status.textContent = count + (count === 1 ? " project" : " projects") + (current.id === "all" ? "" : " · " + current.label);
      filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === current.id)));
      if (writeUrl) {
        const url = new URL(window.location.href);
        if (current.id === "all") url.searchParams.delete("category");
        else url.searchParams.set("category", current.id);
        history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
      requestProgress();
    }
    if (fullGallery && filters) {
      filters.replaceChildren();
      for (const choice of choices) {
        const button = element("button", "filter-button", choice.label);
        button.type = "button";
        button.dataset.filter = choice.id;
        button.setAttribute("aria-controls", "project-grid");
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => applyFilter(choice.id, true, true));
        filters.append(button);
        filterButtons.push(button);
      }
      filters.hidden = false;
      applyFilter(new URLSearchParams(window.location.search).get("category"));
      window.addEventListener("popstate", () => applyFilter(new URLSearchParams(window.location.search).get("category")));
    } else applyFilter("all");
  }

  if (data) {
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const validEmail = /^[^\s@:?&#]+@[^\s@:?&#]+\.[^\s@:?&#]+$/.test(email);
    const github = webUrl(data.github);
    const contact = $("#contact-link");
    const address = $("#contact-email");
    if (contact) {
      contact.hidden = !validEmail && !github;
      if (validEmail) {
        contact.href = "mailto:" + email;
        contact.textContent = "Email me ↗";
        contact.removeAttribute("target");
        contact.removeAttribute("rel");
      } else if (github) {
        contact.href = github;
        contact.target = "_blank";
        contact.rel = "noopener noreferrer";
        contact.textContent = "Find me on GitHub ↗";
      }
    }
    if (address) {
      address.hidden = !validEmail;
      if (validEmail) { address.href = "mailto:" + email; address.textContent = email; }
    }
    document.querySelectorAll("[data-email-link]").forEach((link) => {
      link.hidden = !validEmail;
      if (validEmail) link.href = "mailto:" + email;
    });
    const phone = typeof data.phone === "string" ? data.phone.replace(/[^+\d]/g, "") : "";
    document.querySelectorAll("[data-phone-link]").forEach((link) => {
      link.hidden = !/^\+?\d{7,15}$/.test(phone);
      if (!link.hidden) { link.href = "tel:" + phone; link.textContent = data.phoneDisplay || phone; }
    });
    const resume = webUrl(data.resume);
    document.querySelectorAll("[data-resume-link]").forEach((link) => {
      link.hidden = !resume;
      if (resume) link.href = resume;
    });
    if ($("#github-link")) { $("#github-link").hidden = !github; if (github) $("#github-link").href = github; }
    const socials = (Array.isArray(data.socials) ? data.socials : []).filter((social) => social && typeof social.label === "string" && social.label.trim() && webUrl(social.url));
    document.querySelectorAll("[data-social-links]").forEach((container) => {
      container.replaceChildren(...socials.map((social) => makeLink(webUrl(social.url), "", social.label + " ↗")));
    });
    document.querySelectorAll("[data-social-label]").forEach((link) => {
      const social = socials.find((item) => item.label === link.dataset.socialLabel);
      link.hidden = !social;
      if (social) link.href = webUrl(social.url);
    });
  }

  if ("IntersectionObserver" in window && !motionPreference.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.remove("is-pending"); observer.unobserve(entry.target); }
      });
    }, { threshold: .08 });
    document.querySelectorAll(".reveal").forEach((item) => {
      if (!item.hidden && item.getBoundingClientRect().top > innerHeight * .95) {
        item.classList.add("is-pending");
        observer.observe(item);
      }
    });
    motionPreference.addEventListener("change", () => {
      if (motionPreference.matches) {
        document.querySelectorAll(".is-pending").forEach((item) => item.classList.remove("is-pending"));
        observer.disconnect();
      }
    });
  }
  window.addEventListener("scroll", requestProgress, { passive: true });
  window.addEventListener("resize", requestProgress, { passive: true });
  window.addEventListener("load", requestProgress, { once: true });
  updateProgress();

  // Only the home page needs the optional 3D module; the Work page stays light.
  if ($("#webgl") && $("#hero-visual")) {
    import("./scene.js").then(({ initScene }) => initScene()).catch(() => {
      $("#hero-visual").hidden = true;
      $("#hero-layout")?.classList.remove("has-scene");
    });
  }
})();
