// browser window scroll (in pixels) after which the "back to top" link is shown
const offset = 300;
// browser window scroll (in pixels) after which the "back to top" link opacity is reduced
const offsetOpacity = 1200;
// duration of the top scrolling animation (in ms)
const scrollTopDuration = 700;
// grab the "back to top" link
const backToTop = document.getElementById('goto-top');

function scrollTo(element, to, duration) {
  if (duration <= 0) return;
  const difference = to - element.scrollTop;
  const perTick = (difference / duration) * 10;

  setTimeout(() => {
    element.scrollTop += perTick;
    if (element.scrollTop === to) return;
    scrollTo(element, to, duration - 10);
  }, 10);
}

// hide or show the "back to top" link
window.onscroll = () => {
  const scrollTop = document.body.scrollTop;
  if (scrollTop > offset) {
    backToTop.classList.add('is-visible');
  } else {
    backToTop.classList.remove('fade-out');
    backToTop.classList.remove('is-visible');
  }
  if (scrollTop > offsetOpacity) {
    backToTop.classList.add('fade-out');
  }
};

// smooth scroll to top
backToTop.onclick = (ev) => {
  ev.preventDefault();
  scrollTo(document.body, 0, scrollTopDuration);
};
