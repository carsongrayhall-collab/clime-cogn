(() => {
  const menuWraps = [...document.querySelectorAll(".header-menu-wrap")];

  const closeAllMenus = () => {
    menuWraps.forEach((wrap) => {
      wrap.classList.remove("is-menu-open");
      const button = wrap.querySelector(".header-menu");
      if (button) button.setAttribute("aria-expanded", "false");
    });
  };

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
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".header-menu-wrap")) return;
    closeAllMenus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllMenus();
  });
})();
