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
  let cropX = p.offsetLeft,
    cropY = p.offsetTop,
    cropWidth = parseInt(
      document.defaultView.getComputedStyle(p).width
    ),
    cropHeight = parseInt(
      document.defaultView.getComputedStyle(p).height
    );
  let corner1 = new cv.Point(cropX - imgX, cropY - imgY);
  let corner2 = new cv.Point(
    cropX - imgX + cropWidth,
    cropY - imgY
  );
  let corner3 = new cv.Point(
    cropX - imgX,
    cropY - imgY + cropHeight
  );
  let corner4 = new cv.Point(
    cropX - imgX + cropWidth,
    cropHeight + cropY - imgY
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
const p = document.getElementsByClassName(
  'resize-container'
)[0];
dragElement(p);
const resizer =
  document.getElementsByClassName('resizer')[0];
resizer.addEventListener('mousedown', initDrag, false);

function initDrag(e) {
  e.stopPropagation();
  startX = e.clientX;
  startY = e.clientY;
  startWidth = parseInt(
    document.defaultView.getComputedStyle(p).width,
    10
  );
  startHeight = parseInt(
    document.defaultView.getComputedStyle(p).height,
    10
  );
  document.documentElement.addEventListener(
    'mousemove',
    doDrag,
    false
  );
  document.documentElement.addEventListener(
    'mouseup',
    stopDrag,
    false
  );
}

function doDrag(e) {
  let x = startWidth + e.clientX - startX,
    y = startHeight + e.clientY - startY;

  if (x < imgWidth - p.offsetLeft) {
    p.style.width = x + 'px';
  }

  if (y < imgHeight + imgY - p.offsetTop) {
    p.style.height = y + 'px';
  }
}

function stopDrag(e) {
  document.documentElement.removeEventListener(
    'mousemove',
    doDrag,
    false
  );
  document.documentElement.removeEventListener(
    'mouseup',
    stopDrag,
    false
  );
}

function dragElement(elmnt) {
  p.addEventListener('mousedown', dragMouseDown);
  let wid, hgh;
  function dragMouseDown(e) {
    wid = parseInt(
      document.defaultView.getComputedStyle(p).width,
      10
    );
    hgh = parseInt(
      document.defaultView.getComputedStyle(p).height,
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
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
