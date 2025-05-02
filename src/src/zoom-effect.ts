import "./style.css"; // CSS 파일 가져오기 (필요하다면)

document.body.innerHTML = `
    <div id="container">
      <canvas id="canvas" width="600" height="400" style="border: 1px solid black;"></canvas>
      <canvas id="canvas2" width="200" height="200" style="border: 1px solid black;"></canvas>
      <canvas id="canvas3" width="200" height="200" style="border: 1px solid black;"></canvas>
    </div>
`
const canvas = document.querySelector("#canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const canvas2 = document.querySelector("#canvas2") as HTMLCanvasElement;
const smoothedZoomCtx = canvas2.getContext("2d") as CanvasRenderingContext2D;

const canvas3 = document.querySelector("#canvas3") as HTMLCanvasElement;
const pixelatedZoomCtx = canvas3.getContext("2d") as CanvasRenderingContext2D;

const img = new Image();
img.src = "./rhino.jpg";

img.onload = () => {
  draw(img)
};

const draw = (image: HTMLImageElement) => 
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  smoothedZoomCtx.imageSmoothingEnabled = true;
  pixelatedZoomCtx.imageSmoothingEnabled = false;

  const zoom = (ctx: CanvasRenderingContext2D, x: number, y: number) =>  {
    console.log(x,y)

    let sx = Math.max(0, x-5);
    let sy = Math.max(0, y-5);
    if(sx + 10 > canvas.width) sx = canvas.width - 10;
    if(sy + 10 > canvas.height) sy = canvas.height - 10;

    const originBox: [number, number, number, number] = [
      sx,
      sy,
      10,
      10,
    ]
    console.log(originBox)
    ctx.drawImage(
      canvas,
      ...originBox,
      0,
      0,
      200,
      200,
    );

  }  
  
  canvas.addEventListener('mousemove', (e) => {
    const x = Math.min(Math.max(0, e.offsetX), canvas.width - 10);
    const y = Math.min(Math.max(0, e.offsetY), canvas.height - 10);
    zoom(smoothedZoomCtx, x, y);
    zoom(pixelatedZoomCtx, x, y);  
  })
  canvas.addEventListener('click', (e) => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.png';
    a.click();
  })
;

