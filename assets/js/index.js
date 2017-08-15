// TODO : Three.js treeshacking
// BUG : eslint-import-resolver-webpack doesn't work with webpack 2

import 'Projector';
import 'CanvasRenderer';

// -----------------------------------------------------------------------------
// Push Effect

// detect if IE : from http://stackoverflow.com/a/16657946
const ie = (() => {
  const undef = -1;
  const ua = window.navigator.userAgent;
  const msie = ua.indexOf('MSIE ');
  const trident = ua.indexOf('Trident/');
  let rv = -1; // Return value assumes failure.
  if (msie > 0) {
    // IE 10 or older => return version number
    rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  } else if (trident > 0) {
    // IE 11 (or newer) => return version number
    const rvNum = ua.indexOf('rv:');
    rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
  }
  return ((rv > -1) ? rv : undef);
})();

// disable/enable scroll (mousewheel and keys) from http://stackoverflow.com/a/4770179
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
const keys = [32, 37, 38, 39, 40];

function preventDefault(e) {
  const ev = e || window.event;
  if (ev.preventDefault) {
    ev.preventDefault();
  }
  ev.returnValue = false;
}

function keydown(e) {
  let i = 0;
  for (; i < keys.length; i += 1) {
    if (e.keyCode === keys[i]) {
      preventDefault(e);
      return;
    }
  }
}

function disableScroll() {
  window.onmousewheel = null;
  document.onmousewheel = null;
  document.onkeydown = keydown;
}

function enableScroll() {
  window.onmousewheel = null;
  document.onmousewheel = null;
  document.onkeydown = null;
  document.body.ontouchmove = null;
}

const docElem = window.document.documentElement;
let scrollVal;
let isRevealed;
let noscroll;
let isAnimating;
const containerPush = document.getElementById('container');
const trigger = containerPush.querySelector('#discover');

function scrollY() {
  return window.pageYOffset || docElem.scrollTop;
}

function toggle(reveal) {
  isAnimating = true;
  if (reveal) {
    containerPush.classList.add('modify');
  } else {
    noscroll = true;
    disableScroll();
    containerPush.classList.remove('modify');
  }
  // simulating the end of the transition:
  setTimeout(() => {
    isRevealed = !isRevealed;
    isAnimating = false;
    if (reveal) {
      noscroll = false;
      enableScroll();
    }
  }, 1200);
}

function scrollPage() {
  scrollVal = scrollY();
  if (noscroll && !ie) {
    if (scrollVal < 0) return false;
    // keep it that way
    window.scrollTo(0, 0);
  }
  if (containerPush.classList.contains('notrans')) {
    containerPush.classList.remove('notrans');
    return false;
  }
  if (isAnimating) {
    return false;
  }
  if (scrollVal <= 0 && isRevealed) {
    toggle(0);
  } else if (scrollVal > 0 && !isRevealed) {
    toggle(1);
  }
  return undefined;
}

// refreshing the page...
const pageScroll = scrollY();
noscroll = pageScroll === 0;

disableScroll();

if (pageScroll) {
  isRevealed = true;
  containerPush.classList.add('notrans');
  containerPush.classList.add('modify');
}

window.addEventListener('scroll', scrollPage);
trigger.addEventListener('click', () => { toggle('reveal'); });

// -----------------------------------------------------------------------------
// Three.js anim

const containerWaves = document.querySelector('#waves');
let renderer;

if (!Window.waves) {
  const SEPARATION = 100;
  const AMOUNTX = 50;
  const AMOUNTY = 50;
  const AMOUNTXY = AMOUNTX * AMOUNTY;
  const wavesWorker = new Worker('/js/wavesWorker.js');
  let camera;
  let scene;
  let particles;
  let particle;
  let count = 0;
  let mouseX = 0;
  let mouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;

  wavesWorker.onmessage = (e) => {
    for (let i = 0; i < AMOUNTXY; i += 1) {
      particles[i].position.y = e.data[i].position.y;
      particles[i].scale.x = e.data[i].scale.x;
      particles[i].scale.y = e.data[i].scale.y;
    }
  };

  const onWindowResize = () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const onDocumentMouseMove = (event) => {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  };

  const onDocumentTouchStart = (event) => {
    if (event.touches.length === 1) {
      // LIIT : avoid chrome console warning
      // event.preventDefault();
      mouseX = event.touches[0].pageX - windowHalfX;
      mouseY = event.touches[0].pageY - windowHalfY;
    }
  };

  const onDocumentTouchMove = (event) => {
    if (event.touches.length === 1) {
      // LIIT : avoid chrome console warning
      // event.preventDefault();
      mouseX = event.touches[0].pageX - windowHalfX;
      mouseY = event.touches[0].pageY - windowHalfY;
    }
  };

  const init = () => {
    camera = new THREE.PerspectiveCamera(75,
      window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene = new THREE.Scene();
    particles = [];
    const PI2 = Math.PI * 2;
    const material = new THREE.SpriteCanvasMaterial({
      color: 0xf000000,
      program: (context) => {
        context.beginPath();
        context.arc(0, 0, 0.5, 0, PI2, true);
        context.fill();
      },
    });
    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix += 1) {
      for (let iy = 0; iy < AMOUNTY; iy += 1) {
        particle = new THREE.Sprite(material);
        particles[i] = particle;
        i += 1;
        particle.position.x = (ix * SEPARATION) - ((AMOUNTX * SEPARATION) / 2);
        particle.position.z = (iy * SEPARATION) - ((AMOUNTY * SEPARATION) / 2);
        scene.add(particle);
      }
    }
    renderer = new THREE.CanvasRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerWaves.appendChild(renderer.domElement);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('resize', onWindowResize, false);
    Window.waves = renderer;
  };

  init();

  const render = () => {
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    wavesWorker.postMessage({ count });
    renderer.render(scene, camera);
    count += 0.1;
  };

  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };

  animate();
} else {
  containerWaves.innerHTML = '';
  containerWaves.appendChild(Window.waves.domElement);
}

// -----------------------------------------------------------------------------
// Features to come

const features = document.getElementsByClassName('soon');
const soon = document.getElementById('soon');
let i;
for (i = 0; i < features.length; i += 1) {
  features[i].addEventListener('mouseenter', () => { soon.classList.toggle('show'); }, false);
  features[i].addEventListener('mouseleave', () => { soon.classList.toggle('show'); }, false);
}
