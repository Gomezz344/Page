const links = document.querySelectorAll('.nav-link');

links.forEach(link => {
  if (link.href === window.location.href) {
    link.parentElement.classList.add('active');
  }
});

const nav = document.querySelector(".nav-menu");
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }
});

// Theme footer: ticks + floating icon
const lineContainer = document.querySelector(".line-cont");

if (lineContainer) {
  const TOTAL_TICKS = 21;
  const MID_INDEX = Math.floor(TOTAL_TICKS / 2);
  const rootEl = document.documentElement;

  lineContainer.innerHTML = "";

  const ticks = [];

  for (let i = 0; i < TOTAL_TICKS; i++) {
    const tickButton = document.createElement("button");
    tickButton.type = "button";
    tickButton.classList.add(
      "theme-tick",
      i % 2 === 0 ? "theme-tick--tall" : "theme-tick--short"
    );

    const isLight = i >= MID_INDEX;
    tickButton.dataset.theme = isLight ? "light" : "dark";
    tickButton.setAttribute("role", "radio");
    tickButton.setAttribute(
      "aria-label",
      isLight ? "Light theme" : "Dark theme"
    );

    lineContainer.appendChild(tickButton);
    ticks.push(tickButton);
  }

  const icon = document.createElement("div");
  icon.className = "theme-icon";
  icon.innerHTML = `
    <div class="theme-icon__stem"></div>
    <div class="theme-icon__circle">
      <span class="theme-icon__glyph" aria-hidden="true"></span>
    </div>
  `;
  lineContainer.appendChild(icon);

  const glyphEl = icon.querySelector(".theme-icon__glyph");

  function setThemeOnRoot(theme) {
    rootEl.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("preferred-theme", theme);
    } catch (e) {
      // ignore storage errors
    }
  }

  function updateIconTheme(theme) {
    icon.dataset.theme = theme;
    if (glyphEl) {
      glyphEl.textContent = theme === "dark" ? "☾" : "☀";
    }
  }

  function moveIconToIndex(index) {
    const activeTick = ticks[index];
    if (!activeTick) return;

    const tickRect = activeTick.getBoundingClientRect();
    const containerRect = lineContainer.getBoundingClientRect();
    const offsetLeft = tickRect.left - containerRect.left + tickRect.width / 2;

    icon.style.left = `${offsetLeft}px`;
  }

  function applyActiveIndex(index) {
    ticks.forEach((tick, i) => {
      const isActive = i === index;
      tick.classList.toggle("theme-tick--active", isActive);
      tick.setAttribute("aria-checked", isActive ? "true" : "false");
      if (isActive) {
        const theme = tick.dataset.theme === "dark" ? "dark" : "light";
        setThemeOnRoot(theme);
        updateIconTheme(theme);
      }
    });

    moveIconToIndex(index);
  }

  function getInitialTheme() {
    const fromMarkup = rootEl.getAttribute("data-theme");
    if (fromMarkup === "light" || fromMarkup === "dark") {
      return fromMarkup;
    }

    try {
      const stored = window.localStorage.getItem("preferred-theme");
      if (stored === "light" || stored === "dark") {
        return stored;
      }
    } catch (e) {
      // ignore storage errors
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    return "light";
  }

  function findClosestIndexForTheme(theme) {
    const step = theme === "light" ? 1 : -1;
    let index = MID_INDEX;

    while (index >= 0 && index < TOTAL_TICKS) {
      if (ticks[index].dataset.theme === theme) {
        return index;
      }
      index += step;
    }

    return MID_INDEX;
  }

  const initialTheme = getInitialTheme();
  const initialIndex = findClosestIndexForTheme(initialTheme);
  applyActiveIndex(initialIndex);

  ticks.forEach((tick, index) => {
    tick.addEventListener("click", () => {
      applyActiveIndex(index);
    });

    tick.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowLeft" ? -1 : 1;
        let newIndex = index + direction;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= TOTAL_TICKS) newIndex = TOTAL_TICKS - 1;
        applyActiveIndex(newIndex);
        ticks[newIndex].focus();
      }
    });
  });

  window.addEventListener("resize", () => {
    const currentIndex = ticks.findIndex((tick) =>
      tick.classList.contains("theme-tick--active")
    );
    if (currentIndex >= 0) {
      moveIconToIndex(currentIndex);
    }
  });
}