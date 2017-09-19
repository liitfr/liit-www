import FastClick from 'fastclick';
import LogStyle from 'log-with-style';
import TweenLite from 'TweenLite'; // eslint-disable-line
import AttrPlugin from 'AttrPlugin'; // eslint-disable-line
import SnackBar from 'node-snackbar';
import Turbolinks from 'turbolinks';

// -----------------------------------------------------------------------------
// Turbolinks

Turbolinks.start();

// -----------------------------------------------------------------------------
// Avoid page jumps when url bar appears / disappears on mobile

function calculateHeight() {
  const fixedHeightElems = document.getElementsByClassName('fixed-height');
  [].forEach.call(fixedHeightElems, (el) => {
    el.style.height = `${window.innerHeight}px`; // eslint-disable-line
  });
}

window.onresize = calculateHeight;

// -----------------------------------------------------------------------------
// when a page loads

document.addEventListener('turbolinks:load', () => {
  FastClick.attach(document.body);
  calculateHeight();
});

// -----------------------------------------------------------------------------
// Console message

const logBold = 'font-weight: bold';
const logItalic = 'font-style: italic';
const logTitle = 'font-family: Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000';

LogStyle('%cBienvenue !', logTitle);
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', logItalic, logBold);

// -----------------------------------------------------------------------------
// Service Worker
// https://github.com/GoogleChrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js

const offlineMsg = 'Vous êtes passé(e) en mode déconnecté.';
const onlineMsg = 'Vous êtes de nouveau connecté(e).';
const redundantMsg = 'SW : The installing service worker became redundant.';
const errorMsg = 'SW : Error during service worker registration : ';
const refreshMsg = 'Du nouveau contenu est disponible sur le site, vous pouvez y accéder en rafraichissant cette page.';
const availableMsg = 'SW : Content is now available offline.';
const close = 'Fermer';
const refresh = 'Rafraîchir';

if ('serviceWorker' in navigator) {
  document.addEventListener('turbolinks:load', () => {
    function updateOnlineStatus() {
      SnackBar.show({
        text: navigator.onLine ? onlineMsg : offlineMsg,
        backgroundColor: '#000000',
        actionText: close,
        actionTextColor: '#d2de2f',
        customClass: 'custom-snackbar',
      });
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      reg.onupdatefound = () => { // eslint-disable-line
        const installingWorker = reg.installing;
        installingWorker.onstatechange = () => {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                SnackBar.show({
                  text: refreshMsg,
                  backgroundColor: '#000000',
                  actionText: refresh,
                  actionTextColor: '#d2de2f',
                  onActionClick: () => { location.reload(); },
                  customClass: 'custom-snackbar',
                  duration: 7500,
                });
              } else {
                console.info(availableMsg); // eslint-disable-line
              }
              break;
            case 'redundant':
              console.info(redundantMsg); // eslint-disable-line
              break;
            default:
              break;
          }
        };
      };
    }).catch((e) => {
      console.error(errorMsg, e); // eslint-disable-line
    });
  });
}

// -----------------------------------------------------------------------------
// Logo

const updateInterval = 1.351;
const logoSize = 200;
const radius = 100;

function generatePoint(index, logoSides) {
  const logoRadius = radius;
  const minRadius = radius * 0.9;
  const x = 0;
  const y = Math.ceil(minRadius + (Math.random() * (logoRadius - minRadius)));
  const angle = ((Math.PI * 2) / logoSides) * index;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tx = Math.floor(((x * cos) - (y * sin)) + (logoSize / 2));
  const ty = Math.floor((x * sin) + (y * cos) + (logoSize / 2));
  return { x: tx, y: ty };
}

function generate(mask, logoSides) {
  const path = (`M ${Array(...{ length: logoSides }).map((obj, index) => {
    const point = generatePoint(logoSides - index, logoSides);
    return `${point.x} ${point.y}`;
  }).join(' L ')} Z`);
  return path;
}

function flickLogo() {
  TweenLite.to('.polylogo', updateInterval, { attr: { d: generate(false, 40) }, onComplete: flickLogo });
}

if (document.getElementsByClassName('polylogo').length > 0) {
  document.querySelector('.polylogo').setAttribute('d', generate(false, 40));
  flickLogo();
}
