/* eslint no-console: ["error", { allow: ["info", "warn", "error"] }] */
// TODO : GSAP treeshacking
// BUG : eslint-import-resolver-webpack doesn't work with webpack 2

import * as FastClick from 'fastclick';
import * as LogStyle from 'log-with-style';
import * as TweenLite from 'TweenLite';
import * as AttrPlugin from 'AttrPlugin';

// -----------------------------------------------------------------------------
// Related to -webkit-tap-highlight-color css rule

// document.addEventListener('touchstart', () => {}, true);

// -----------------------------------------------------------------------------
// Console message

const logBold = 'font-weight: bold';
const logItalic = 'font-style: italic';
const logTitle = 'font-family: Helvetica, Arial, sans-serif; color: #fff; font-size: 20px; padding: 15px 20px; background: #444; border-radius: 4px; line-height: 100px; text-shadow: 0 1px #000';

LogStyle('%cBienvenue !', logTitle);
LogStyle('%cVous voyez ce message ?%c Nous pouvons travailler ensemble !', logItalic, logBold);

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
  TweenLite.to('#polylogo', updateInterval, { attr: { d: generate(false, 40) }, onComplete: flickLogo });
}

if (document.contains(document.getElementById('polylogo'))) {
  document.querySelector('#polylogo').setAttribute('d', generate(false, 40));
  flickLogo();
}
