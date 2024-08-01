export const debounce = (callback, delay = 100) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback(...args);
    }, delay);
  };
};

export const throttle = (callback, limit = 100) => {
  let wait = false;
  return () => {
    if (!wait) {
      callback.call();
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
    }
  };
};

export function handleScroll(ref) {
  if (ref.current === null) {
    return;
  }

  if (window.scrollY > 60) {
    const transparency = Math.min(window.scrollY / 250, 0.75);
    const blur = Math.min(window.scrollY / 750, 0.375);

    document.documentElement.style.setProperty(
      "--navbar-transparency",
      transparency
    );
    document.documentElement.style.setProperty("--navbar-blur", `${blur}rem`);
  } else {
    document.documentElement.style.setProperty("--navbar-transparency", 0);
    document.documentElement.style.setProperty("--navbar-blur", 0);
  }
}
