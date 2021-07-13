let img = new Image();
let mat;
let resized;
var startX, startY, startWidth, startHeight;
var pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
document.getElementById('inp').onchange = function (e) {
  img.onload = draw;
  img.onerror = failed;
  img.src = URL.createObjectURL(this.files[0]);
};
let imgWidth, imgHeight, imgX, imgY;
document.getElementById('resize').onclick = function (e) {
  e.preventDefault();
  resize();
};
function draw() {
  mat = cv.imread(img);

  cv.imshow('canvas', mat);
  const canvas = document.getElementById('canvas');
  imgWidth = parseInt(
    document.defaultView.getComputedStyle(canvas).width,
    10
  );
  imgHeight = parseInt(
    document.defaultView.getComputedStyle(canvas).height,
    10
  );
  imgX = canvas.offsetLeft;
  imgY = canvas.offsetTop;
  p.style.display = 'block';
}
function resize() {
  if (!mat) {
    alert('Please upload image!!');
    return;
  }
  const btns = document.getElementsByClassName('btn-item');
  console.log(btns);
  if (btns[0]) btns[0].remove();

  let corner1 = new cv.Point(
    p[0].offsetLeft,
    p[0].offsetTop - imgY
  );
  let corner2 = new cv.Point(
    p[1].offsetLeft,
    p[1].offsetTop - imgY
  );
  let corner3 = new cv.Point(
    p[2].offsetLeft,
    p[2].offsetTop - imgY
  );
  let corner4 = new cv.Point(
    p[3].offsetLeft,
    p[3].offsetTop - imgY
  );
  let cornerArray = [
    { corner: corner1 },
    { corner: corner2 },
    { corner: corner3 },
    { corner: corner4 },
  ];
  let tl =
    cornerArray[0].corner.x < cornerArray[1].corner.x
      ? cornerArray[0]
      : cornerArray[1];
  let tr =
    cornerArray[0].corner.x > cornerArray[1].corner.x
      ? cornerArray[0]
      : cornerArray[1];
  let bl =
    cornerArray[2].corner.x < cornerArray[3].corner.x
      ? cornerArray[2]
      : cornerArray[3];
  let br =
    cornerArray[2].corner.x > cornerArray[3].corner.x
      ? cornerArray[2]
      : cornerArray[3];
  let widthBottom = Math.hypot(
    br.corner.x - bl.corner.x,
    br.corner.y - bl.corner.y
  );
  let widthTop = Math.hypot(
    tr.corner.x - tl.corner.x,
    tr.corner.y - tl.corner.y
  );
  let theWidth =
    widthBottom > widthTop ? widthBottom : widthTop;
  let heightRight = Math.hypot(
    tr.corner.x - br.corner.x,
    tr.corner.y - br.corner.y
  );
  let heightLeft = Math.hypot(
    tl.corner.x - bl.corner.x,
    tr.corner.y - bl.corner.y
  );
  let theHeight =
    heightRight > heightLeft ? heightRight : heightLeft;

  //Transform!
  let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0,
    0,
    theWidth - 1,
    0,
    theWidth - 1,
    theHeight - 1,
    0,
    theHeight - 1,
  ]); //
  let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
    tl.corner.x,
    tl.corner.y,
    tr.corner.x,
    tr.corner.y,
    br.corner.x,
    br.corner.y,
    bl.corner.x,
    bl.corner.y,
  ]);
  let dsize = new cv.Size(theWidth, theHeight);
  let M = cv.getPerspectiveTransform(
    srcCoords,
    finalDestCoords
  );
  let dst = new cv.Mat();
  cv.warpPerspective(
    mat,
    dst,
    M,
    dsize,
    cv.INTER_LINEAR,
    cv.BORDER_CONSTANT,
    new cv.Scalar()
  );
  cv.imshow('resized', dst);
  var link = document.createElement('a');
  link.download = 'croppedImage.png';
  link.href = document
    .getElementById('resized')
    .toDataURL();
  link.innerText = 'Download';
  link.className = 'btn-item';
  document.body.appendChild(link);
  window.scrollTo(0, document.body.scrollHeight);
}
function failed() {
  console.error(
    "The provided file couldn't be loaded as an Image media"
  );
}
const p = document.getElementsByClassName('corner');
for (let i = 0; i < p.length; i++) {
  dragElement(p[i]);
}

adjustLine(p[0], p[1], document.getElementById('line1'));
adjustLine(p[0], p[2], document.getElementById('line2'));
adjustLine(p[2], p[3], document.getElementById('line3'));
adjustLine(p[3], p[1], document.getElementById('line4'));

function dragElement(elmnt) {
  elmnt.addEventListener('mousedown', dragMouseDown);
  let wid, hgh;
  function dragMouseDown(e) {
    wid = parseInt(
      document.defaultView.getComputedStyle(elmnt).width,
      10
    );
    hgh = parseInt(
      document.defaultView.getComputedStyle(elmnt).height,
      10
    );
    e = e || window.event;
    e.preventDefault();

    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;

    document.onmousemove = elementDrag;
  }
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let x = elmnt.offsetLeft - pos1,
      y = elmnt.offsetTop - pos2;

    if (
      x < imgX ||
      y < imgY ||
      x + wid > imgX + imgWidth ||
      y + hgh > imgY + imgHeight
    )
      return;
    elmnt.style.top = y + 'px';
    elmnt.style.left = x + 'px';
    adjustLine(
      p[0],
      p[1],
      document.getElementById('line1')
    );
    adjustLine(
      p[0],
      p[2],
      document.getElementById('line2')
    );
    adjustLine(
      p[2],
      p[3],
      document.getElementById('line3')
    );
    adjustLine(
      p[3],
      p[1],
      document.getElementById('line4')
    );
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function adjustLine(from, to, line) {
  var fT = from.offsetTop + from.offsetHeight / 2;
  var tT = to.offsetTop + to.offsetHeight / 2;
  var fL = from.offsetLeft + from.offsetWidth / 2;
  var tL = to.offsetLeft + to.offsetWidth / 2;

  var CA = Math.abs(tT - fT);
  var CO = Math.abs(tL - fL);
  var H = Math.sqrt(CA * CA + CO * CO);
  var ANG = (180 / Math.PI) * Math.acos(CA / H);

  if (tT > fT) {
    var top = (tT - fT) / 2 + fT;
  } else {
    var top = (fT - tT) / 2 + tT;
  }
  if (tL > fL) {
    var left = (tL - fL) / 2 + fL;
  } else {
    var left = (fL - tL) / 2 + tL;
  }

  if (
    (fT < tT && fL < tL) ||
    (tT < fT && tL < fL) ||
    (fT > tT && fL > tL) ||
    (tT > fT && tL > fL)
  ) {
    ANG *= -1;
  }
  top -= H / 2;

  line.style['-webkit-transform'] =
    'rotate(' + ANG + 'deg)';
  line.style['-moz-transform'] = 'rotate(' + ANG + 'deg)';
  line.style['-ms-transform'] = 'rotate(' + ANG + 'deg)';
  line.style['-o-transform'] = 'rotate(' + ANG + 'deg)';
  line.style['-transform'] = 'rotate(' + ANG + 'deg)';
  line.style.top = top + 'px';
  line.style.left = left + 'px';
  line.style.height = H + 'px';
}
