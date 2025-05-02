
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const img = new Image();


document.body.innerHTML = `
  <div id="container">
    <canvas id="canvas" width="600" height="400" style="border: 1px solid black; width: 300px; height: 200px"></canvas>
    <div>
      <input type="radio" id="original" name="filter" value="original" checked>
      <label for="original">original</label>
      <input type="radio" id="grayscale" name="filter" value="grayscale">
      <label for="grayscale">grayscale</label>
      <input type="radio" id="inverted" name="filter" value="inverted">
      <label for="inverted">inverted</label>
      <input type="radio" id="sepia" name="filter" value="sepia">
      <label for="sepia">sepia</label>
    </div>
  </div>
`.trim();

let imageData: ImageData;
img.src = "./rhino.jpg";
let originalData: Uint8ClampedArray<ArrayBufferLike>;
img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.style.display = "none";
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  originalData = imageData.data;
};

const invert = (data: Uint8ClampedArray<ArrayBufferLike>) => {
  const newData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length / 4; i++) {
    const startIndex = i * 4;
    const pixels = data.slice(startIndex, startIndex + 4);
    const inverted = pixels.map((p, i) => {
      if (i === 3) return p; // alpha value
      return 255 - p;
    });
    newData.set(inverted, startIndex);
  }
  return newData;
};

const grayscale = (data: Uint8ClampedArray<ArrayBufferLike>) => {
  const red = 0.299;
  const green = 0.587;
  const blue = 0.114;
  const newData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length / 4; i++) {
    const startIndex = i * 4;
    const pixels = data.slice(startIndex, startIndex + 4);
    const average = pixels[0] * red + pixels[1] * green + pixels[2] * blue;
    newData[startIndex] = average;
    newData[startIndex + 1] = average;
    newData[startIndex + 2] = average;
    newData[startIndex + 3] = pixels[3];
  }
  return newData;
};

const sepia = (data: Uint8ClampedArray<ArrayBufferLike>) => {
  const newData = new Uint8ClampedArray(data.length);
  const sepiaMatrix = [
    [0.393, 0.769, 0.189],
    [0.349, 0.686, 0.168],
    [0.272, 0.534, 0.131],
  ];
  for (let i = 0; i < data.length / 4; i++) {
    const startIndex = i * 4;
    const pixels = data.slice(startIndex, startIndex + 4);
    const sepia = sepiaMatrix.map((row) => {  
      return row.map((p, i) => p * pixels[i]).reduce((a, b) => a + b, 0);
    });
    newData[startIndex] = sepia[0];
    newData[startIndex + 1] = sepia[1];
    newData[startIndex + 2] = sepia[2];
    newData[startIndex + 3] = pixels[3];
  }
  return newData;
};

const original = (data: Uint8ClampedArray<ArrayBufferLike>) => {
  return data;
};

document.addEventListener("click", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.tagName !== "INPUT") return;
  const filter = target.value;
  console.log(filter);
  const newData =
    filter === "original"
      ? originalData
      : filter === "inverted"
      ? invert(originalData)
      : filter === "grayscale"
      ? grayscale(originalData)
      : sepia(originalData);

  console.log(newData);
  ctx.putImageData(new ImageData(newData, canvas.width, canvas.height), 0, 0);
});
