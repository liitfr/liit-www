import dynamics from 'dynamics.js';
import lazySizes from 'lazysizes';
import Hammer from 'hammerjs';

const bodyEl = document.body;
const onEndTransition = function onEndTransition(el, callback) {
  const onEndCallbackFn = function onEndCallbackFn(ev) {
    if (ev.target !== this) return;
    this.removeEventListener('webkitTransitionEnd', onEndCallbackFn);
    this.removeEventListener('transitionend', onEndCallbackFn);
    this.removeEventListener('oTransitionEnd', onEndCallbackFn);
    this.removeEventListener('MSTransitionEnd', onEndCallbackFn);
    if (callback && typeof callback === 'function') { callback.call(this); }
  };
  el.addEventListener('webkitTransitionEnd', onEndCallbackFn);
  el.addEventListener('transitionend', onEndCallbackFn);
  el.addEventListener('oTransitionEnd', onEndCallbackFn);
  el.addEventListener('MSTransitionEnd', onEndCallbackFn);
};
// window sizes
let win = { width: window.innerWidth, height: window.innerHeight };
// some helper vars to disallow scrolling
let lockScroll = false;
let xscroll;
let yscroll;
const scrollContainer = document.querySelector('#container');
// the main slider and its items
const sliderEl = document.querySelector('.slider');
const items = [].slice.call(sliderEl.querySelectorAll('.slide'));
// total number of items
const itemsTotal = items.length;
// navigation controls/arrows
const navRightCtrl = sliderEl.querySelector('.button--nav-next');
const navLeftCtrl = sliderEl.querySelector('.button--nav-prev');
const zoomCtrl = sliderEl.querySelector('.button--zoom');
// the main content element
const contentEl = document.querySelector('.content');
// close content control
const closeContentCtrl = contentEl.querySelector('button.button--close');
// index of current item
let current = 0;
// check if an item is "open"
let isOpen = false;
const isFirefox = typeof InstallTrigger !== 'undefined';
// scale body when zooming into the items,
// if not Firefox (the performance in Firefox is not very good)
const bodyScale = isFirefox ? false : 3;
// list of contents id
const contentList = items.map(item => item.getAttribute('data-content'));
// Does this request matches a page navigation (= true)
// or insted a direct browser navigation (=false) ?
let naturalRequest = false;
// current view : 'slider' or 'zoom'
let currentView = 'slider';
// current content id
let currentContent = contentList[current];
// index of required item
let required = current;
// required view : 'slider' or 'zoom'
let requiredView = currentView;
// required content id
let requiredContent = currentContent;
// First time page is rendered
let firstRendering = true;
// Direction when swiping
let direction;

// from http://www.sberry.me/articles/javascript-event-throttling-debouncing
function throttle(fn, delay) {
  let allowSample = true;

  return (e) => {
    if (allowSample) {
      allowSample = false;
      setTimeout(() => { allowSample = true; }, delay);
      fn(e);
    }
  };
}

// applies the necessary transform value to scale the item up
function applyTransforms(el, nobodyscale) {
  // zoomer area and scale value
  const zoomerArea = el.querySelector('.zoomer__area');
  const zoomerAreaSize = { width: zoomerArea.offsetWidth, height: zoomerArea.offsetHeight };
  const zoomerOffset = zoomerArea.getBoundingClientRect();
  let scaleVal = zoomerAreaSize.width / zoomerAreaSize.height < win.width / win.height
    ? win.width / zoomerAreaSize.width : win.height / zoomerAreaSize.height;

  if (bodyScale && !nobodyscale) {
    scaleVal /= bodyScale;
  }

  // apply transform
  el.style.WebkitTransform = `translate3d(${Number((win.width / 2) - (zoomerOffset.left + (zoomerAreaSize.width / 2)))}px,${Number((win.height / 2) - (zoomerOffset.top + (zoomerAreaSize.height / 2)))}px,0) scale3d(${scaleVal},${scaleVal},1)`;
  el.style.transform = `translate3d(${Number((win.width / 2) - (zoomerOffset.left + (zoomerAreaSize.width / 2)))}px,${Number((win.height / 2) - (zoomerOffset.top + (zoomerAreaSize.height / 2)))}px,0) scale3d(${scaleVal},${scaleVal},1)`;
}

// event binding
function initEvents() {
  // open items
  zoomCtrl.addEventListener('click', () => {
    window.location.hash = `#zoom/${currentContent}`;
  });

  // close content
  closeContentCtrl.addEventListener('click', () => {
    window.location.hash = `#slider/${currentContent}`;
  });

  // navigation
  navRightCtrl.addEventListener('click', () => {
    direction = 'R';
    window.location.hash = `#slider/${contentList[current === itemsTotal - 1 ? 0 : current + 1]}`;
  });
  navLeftCtrl.addEventListener('click', () => {
    direction = 'L';
    window.location.hash = `#slider/${contentList[current === 0 ? itemsTotal - 1 : current - 1]}`;
  });

  // window resize
  window.addEventListener('resize', throttle(() => {
    // reset window sizes
    win = { width: window.innerWidth, height: window.innerHeight };

    // reset transforms for the items (slider items)
    items.forEach((item, pos) => {
      if (pos === current) return;
      const el = item.querySelector('.slide__mover');
      dynamics.css(el, { translateX: el.offsetWidth });
    });
  }, 10));

  // keyboard navigation events
  document.addEventListener('keydown', (ev) => {
    const keyCode = ev.keyCode || ev.which;
    if (!isOpen) {
      switch (keyCode) {
        case 37:
          direction = 'L';
          window.location.hash = `#slider/${contentList[current === 0 ? itemsTotal - 1 : current - 1]}`;
          break;
        case 39:
          direction = 'R';
          window.location.hash = `#slider/${contentList[current === itemsTotal - 1 ? 0 : current + 1]}`;
          break;
        case 13:
          window.location.hash = `#zoom/${currentContent}`;
          break;
        default:
          break;
      }
    } else {
      switch (keyCode) {
        case 27:
          window.location.hash = `#slider/${currentContent}`;
          break;
        default:
          break;
      }
    }
  });

  // swipes
  const hammertime = new Hammer(sliderEl);
  hammertime.on('swipeleft', () => {
    direction = 'R';
    window.location.hash = `#slider/${contentList[current === itemsTotal - 1 ? 0 : current + 1]}`;
  });
  hammertime.on('swiperight', () => {
    direction = 'L';
    window.location.hash = `#slider/${contentList[current === 0 ? itemsTotal - 1 : current - 1]}`;
  });

  // click or tap on screens
  const screens = document.querySelectorAll('.zoomer__image, .preview');
  let i;
  for (i = 0; i < screens.length; i += 1) {
    screens[i].addEventListener('click', () => {
      window.location.hash = `#zoom/${currentContent}`;
    });
  }
}

// disallow scrolling (on the scrollContainer)
function noscroll() {
  if (!lockScroll) {
    lockScroll = true;
    xscroll = scrollContainer.scrollLeft;
    yscroll = scrollContainer.scrollTop;
  }
  scrollContainer.scrollTop = yscroll;
  scrollContainer.scrollLeft = xscroll;
}

// opens one item
function openItem(item) {
  if (isOpen) return;
  isOpen = true;

  // the element that will be transformed
  const zoomer = item.querySelector('.zoomer');
  // slide screen preview
  zoomer.classList.add('zoomer--active');
  // disallow scroll
  scrollContainer.addEventListener('scroll', noscroll);
  // apply transforms
  applyTransforms(zoomer);
  // also scale the body so it looks the camera moves to the item.
  if (bodyScale) {
    dynamics.animate(bodyEl, { scale: bodyScale }, { type: dynamics.easeInOut, duration: 500 });
  }
  // after the transition is finished:
  onEndTransition(zoomer, () => {
    // reset body transform
    if (bodyScale) {
      dynamics.stop(bodyEl);
      dynamics.css(bodyEl, { scale: 1 });

      // fix for safari (allowing fixed children to keep position)
      bodyEl.style.WebkitTransform = 'none';
      bodyEl.style.transform = 'none';
    }
    // no scrolling
    bodyEl.classList.add('noscroll');
    contentEl.classList.add('content--open');
    const contentItem = document.getElementById(item.getAttribute('data-content'));
    contentItem.classList.add('content__item--current');
    contentItem.classList.add('content__item--reset');


    // reset zoomer transform - back to its original position/transform without a transition
    zoomer.classList.add('zoomer--notrans');
    zoomer.style.WebkitTransform = 'translate3d(0,0,0) scale3d(1,1,1)';
    zoomer.style.transform = 'translate3d(0,0,0) scale3d(1,1,1)';
  });
}

// closes the item/content
function closeContent() {
  const contentItem = contentEl.querySelector('.content__item--current');
  const zoomer = items[current].querySelector('.zoomer');

  contentEl.classList.remove('content--open');
  contentItem.classList.remove('content__item--current');
  bodyEl.classList.remove('noscroll');

  if (bodyScale) {
    // reset fix for safari (allowing fixed children to keep position)
    bodyEl.style.WebkitTransform = '';
    bodyEl.style.transform = '';
  }

  /* fix for safari flickering */
  const nobodyscale = true;
  applyTransforms(zoomer, nobodyscale);
  /* fix for safari flickering */

  // wait for the inner content to finish the transition
  onEndTransition(contentItem, function contentItemOnEndTransition() {
    this.classList.remove('content__item--reset');

    // reset scrolling permission
    lockScroll = false;
    scrollContainer.removeEventListener('scroll', noscroll);

    /* fix for safari flickering */
    zoomer.style.WebkitTransform = 'translate3d(0,0,0) scale3d(1,1,1)';
    zoomer.style.transform = 'translate3d(0,0,0) scale3d(1,1,1)';
    /* fix for safari flickering */

    // scale up - behind the scenes - the item again (without transition)
    applyTransforms(zoomer);

    // animate/scale down the item
    setTimeout(() => {
      zoomer.classList.remove('zoomer--notrans');
      zoomer.classList.remove('zoomer--active');
      zoomer.style.WebkitTransform = 'translate3d(0,0,0) scale3d(1,1,1)';
      zoomer.style.transform = 'translate3d(0,0,0) scale3d(1,1,1)';
    }, 25);

    if (bodyScale) {
      dynamics.css(bodyEl, { scale: bodyScale });
      dynamics.animate(bodyEl, { scale: 1 }, {
        type: dynamics.easeInOut,
        duration: 500,
      });
    }

    isOpen = false;
  });
}

// navigate the slider
function navigate() {
  const itemCurrent = items[current];
  const currentEl = itemCurrent.querySelector('.slide__mover');
  const currentTitleEl = itemCurrent.querySelector('.slide__title');

  const itemNext = items[required];
  const nextEl = itemNext.querySelector('.slide__mover');
  const nextTitleEl = itemNext.querySelector('.slide__title');

  // animate the current element out
  dynamics.animate(currentEl, { opacity: 0, translateX: direction === 'R' ? (-1 * currentEl.offsetWidth) / 2 : currentEl.offsetWidth / 2, rotateZ: direction === 'R' ? -10 : 10 }, {
    type: dynamics.spring,
    duration: 2000,
    friction: 600,
    complete: () => {
      dynamics.css(itemCurrent, { opacity: 0, visibility: 'hidden' });
    },
  });

  // animate the current title out
  dynamics.animate(currentTitleEl, { translateX: direction === 'R' ? -250 : 250, opacity: 0 }, {
    type: dynamics.bezier,
    points: [{ x: 0, y: 0, cp: [{ x: 0.2, y: 1 }] }, { x: 1, y: 1, cp: [{ x: 0.3, y: 1 }] }],
    duration: 450,
  });

  // set the right properties for the next element to come in
  dynamics.css(itemNext, { opacity: 1, visibility: 'visible' });
  dynamics.css(nextEl, { opacity: 0, translateX: direction === 'R' ? nextEl.offsetWidth / 2 : (-1 * nextEl.offsetWidth) / 2, rotateZ: direction === 'R' ? 10 : -10 });

  // animate the next element in
  dynamics.animate(nextEl, { opacity: 1, translateX: 0 }, {
    type: dynamics.spring,
    duration: 2000,
    friction: 600,
    complete: () => {
      items.forEach((item) => { item.classList.remove('slide--current'); });
      itemNext.classList.add('slide--current');
    },
  });

  // set the right properties for the next title to come in
  dynamics.css(nextTitleEl, { translateX: direction === 'R' ? 250 : -250, opacity: 0 });
  // animate the next title in
  dynamics.animate(nextTitleEl, { translateX: 0, opacity: 1 }, {
    type: dynamics.bezier,
    points: [{ x: 0, y: 0, cp: [{ x: 0.2, y: 1 }] }, { x: 1, y: 1, cp: [{ x: 0.3, y: 1 }] }],
    duration: 650,
  });
}

// Router will be executed everytime url changes
function router() {
  // get request
  const query = decodeURI(window.location.hash).substr(1);
  let params;

  // define a util function that allows to switch from a slide to any other
  const switchSlide = () => {
    items.forEach((item) => { item.classList.remove('slide--current'); });
    items.forEach((item) => { item.removeAttribute('style'); });
    const children = Array.prototype.slice.call(items[required].children);
    children.forEach((child) => { child.removeAttribute('style'); });
    items[required].classList.add('slide--current');
  };

  // what are the requested view & content ?
  if (query.length > 0) {
    params = query.split('/');
    // is the query relevant ?
    if ((params[0] === 'zoom' || params[0] === 'slider') && (contentList.indexOf(params[1]) > -1)) {
      requiredView = params[0];
      requiredContent = params[1];
      required = contentList.indexOf(requiredContent);
    } else {
      // If the query is not relevant, reinit state & go back to default page
      currentView = 'slider';
      current = 0;
      currentContent = contentList[0];
      window.location.hash = `${currentView}/${currentContent}`;
      return;
    }
  }

  // Identify if request is triggered by supported event or else from a direct browser interaction ?
  // open items or close content action ?
  if ((requiredView !== currentView && current === required) ||
    // navigate in slider
    ((requiredView === currentView && requiredView === 'slider')
      && (Math.abs(required - current) === 1
        || (current === itemsTotal - 1 && required === 0)
        || (required === itemsTotal - 1 && current === 0)))) {
    naturalRequest = true;
  } else {
    // User manually changed url or used backward / forward navigation
    naturalRequest = false;
  }

  // launch suitable animated transition
  if (requiredView === 'slider') {
    if (firstRendering) {
      items[required].classList.add('slide--current');
    } else if (currentView === 'slider') {
      if (naturalRequest) {
        navigate();
      } else {
        switchSlide();
      }
    } else {
      closeContent();
      if (!naturalRequest) {
        switchSlide();
      }
    }
  } else if (firstRendering) {
    items[required].classList.add('slide--current');
    openItem(items[required]);
  } else if (currentView === 'slider') {
    if (!naturalRequest) {
      switchSlide();
    }
    openItem(items[required]);
  } else {
    closeContent();
    // workaround to wait until close animation is done
    setTimeout(() => {
      switchSlide();
      openItem(items[required]);
    }, 400);
  }

  // former required become new current
  current = required;
  currentView = requiredView;
  currentContent = requiredContent;
}

// bind hash changes to router function
window.onhashchange = router;

function init() {
  // directly execute router for first rendering
  router();
  initEvents();
}

init();

// first rendering has been done.
firstRendering = false;

// config LazySizes
Object.assign(lazySizes.cfg, {
  preloadAfterLoad: true,
});
