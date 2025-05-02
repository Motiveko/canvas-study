const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

class Ball {
  radius: number;
  x:number;
  y: number;
  vx: number;
  vy:number;
  color: string = 'blue'

  constructor(radius: number, x: number, y: number, vx: number, vy: number, color: string) {
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const ball = new Ball(10, 10, 10, 1, 1, 'blue');

let id: number;
function update() {
  // trailing effect
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ball.draw();
  if(ball.x + ball.vx> canvas.width || ball.x + ball.vx < 0) {
    ball.vx = -ball.vx;
  }

  if(ball.y + ball.vy > canvas.height || ball.y + ball.vy < 0) {
    ball.vy = -ball.vy;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;
  id = window.requestAnimationFrame(update)
} 

canvas.addEventListener('mouseenter', () => {
  id = window.requestAnimationFrame(update);
})

canvas.addEventListener('mouseout', () => {
  console.log('mouseout',id)
  window.cancelAnimationFrame(id);
})
