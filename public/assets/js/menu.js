(() => {
  const menuWraps = [...document.querySelectorAll(".header-menu-wrap")];

  const closeAllMenus = () => {
    menuWraps.forEach((wrap) => {
      wrap.classList.remove("is-menu-open");
      wrap.querySelectorAll(".has-submenu.is-submenu-open").forEach((row) => {
        row.classList.remove("is-submenu-open");
      });
      const button = wrap.querySelector(".header-menu");
      if (button) button.setAttribute("aria-expanded", "false");
    });
  };

  const isMobileMenu = () => window.matchMedia("(max-width: 760px)").matches;

  menuWraps.forEach((wrap) => {
    const button = wrap.querySelector(".header-menu");
    if (!button) return;

    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldOpen = !wrap.classList.contains("is-menu-open");
      closeAllMenus();
      wrap.classList.toggle("is-menu-open", shouldOpen);
      button.setAttribute("aria-expanded", String(shouldOpen));
    });

    wrap.querySelectorAll(".has-submenu > a, .has-submenu > span").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        if (!isMobileMenu()) return;

        event.preventDefault();
        event.stopPropagation();
        const row = trigger.closest(".has-submenu");
        const shouldOpen = !row.classList.contains("is-submenu-open");

        wrap.querySelectorAll(".has-submenu.is-submenu-open").forEach((openRow) => {
          if (openRow !== row) openRow.classList.remove("is-submenu-open");
        });
        row.classList.toggle("is-submenu-open", shouldOpen);
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".header-menu-wrap")) return;
    closeAllMenus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllMenus();
  });
})();
