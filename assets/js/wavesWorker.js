const AMOUNTX = 50;
const AMOUNTY = 50;

self.onmessage = function computeParticuleProps(e) {
  const count = e.data.count;
  const particulesProps = [];
  let scale = 0;

  for (let ix = 0; ix < AMOUNTX; ix += 1) {
    for (let iy = 0; iy < AMOUNTY; iy += 1) {
      scale = ((Math.sin((ix + count) * 0.3) + 1) * 4) + ((Math.sin((iy + count) * 0.5) + 1) * 4);
      particulesProps.push({
        position: {
          y: (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50),
        },
        scale: {
          x: scale,
          y: scale,
        },
      });
    }
  }

  self.postMessage(particulesProps);
};
