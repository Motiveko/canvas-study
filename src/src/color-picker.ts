
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;


const img = new Image();
let imageData: ImageData;
img.src = './rhino.jpg';
img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.style.display = 'none';
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  console.log(imageData.data.length / 4 / 100 / 100)
  
}

const hoveredColor = document.getElementById('hovered-color') as HTMLElement;
const clickedColor = document.getElementById('clicked-color') as HTMLElement;




const pickColor = (x: number, y: number) => {
  const row = canvas.width * y * 4;
  const column = x * 4
  const index = row + column
  console.log({x, y, index})
  
  return [imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3]]
}
const pickColor2 = (x: number, y: number) => {
  const color = ctx.getImageData(x, y, 1, 1)
  return [color.data[0], color.data[1], color.data[2], color.data[3]]
}

const isEqual = (color1: number[], color2: number[]) => {
  return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2] && color1[3] === color2[3]
}

const pick = (event: MouseEvent, destination: HTMLElement) => {
  const bounding = canvas.getBoundingClientRect();
  console.log(bounding)
  const x = event.clientX - Math.floor(bounding.left);
  const y = event.clientY - Math.floor(bounding.top);

  const color = pickColor(x, y)
  const color2 = pickColor2(x, y)
  console.log(isEqual(color, color2))
  const rgbColor = `rgb(${color[0]} ${color[1]} ${color[2]} / ${color[3] / 255})`;

  destination.style.backgroundColor = rgbColor;
  destination.innerHTML = rgbColor;
}

canvas.addEventListener('mousemove', (e) => {
  pick(e, hoveredColor)
})

canvas.addEventListener('click', (e) => {
  pick(e, clickedColor)
})




