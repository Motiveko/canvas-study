interface Vector {
  x: number;
  y: number;
}

type Box = {
  width: number;
  height: number;
};

interface Ball {
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  radius: number;
  color: string;
  update(box: Box, deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}


const initCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = "#ddd";
  document.body.appendChild(canvas);
  return canvas;
}


const GRAVITY = 1;

class Ball implements Ball {
  private bounciness: number = 0.8;
  public isDragging: boolean = true;

  constructor(
    public position: Vector, 
    public velocity: Vector, 
    public acceleration: Vector, 
    public radius: number, 
    public color: string,
  ) {}


  update(box: Box, deltaTime: number) {
    if(this.isDragging) {
      return;
    }

    this.acceleration.y = GRAVITY;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // 바닥에 부딪히는경우
    if(this.position.y + this.radius > box.height) {  
      this.velocity.y *= -this.bounciness;
      this.position.y = box.height - this.radius;
    }
    
    // 천장에 부딪히는경우
    if(this.position.y - this.radius < 0) { 
      this.velocity.y *= -this.bounciness;
      this.position.y = this.radius;
    }

    this.velocity.x += this.acceleration.x * deltaTime;
    this.position.x += this.velocity.x * deltaTime;

    // 오른쪽 벽에 부딪히는경우
    if(this.position.x + this.radius > box.width) {
      this.velocity.x *= -this.bounciness;
      this.position.x = box.width - this.radius;
    }

    // 왼쪽벽에 부딪히는경우
    if(this.position.x - this.radius < 0) { 
      this.velocity.x *= -this.bounciness;
      this.position.x = this.radius;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

const createPhysicalEngine = () => {
  const canvas = initCanvas();  
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const balls: Ball[] = [];

  // 스와이프?를 통해 새로운 공 추가
  let draggingBall: Ball | null = null;
  let isDragging: boolean = false;
  let lastMousePosition: Vector | null = null;
  let lastPositionTime: number | null = null;
  let lastVelocity: Vector | null = null;

  // 공 추가, 마우스 떼거나 canvas에서 벗어나면 공이 움직임
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    lastMousePosition = { x: e.offsetX, y: e.offsetY };
    const position = { x: e.offsetX, y: e.offsetY };
    const velocity = { x: 0, y: 0 };
    const acceleration = { x: 0, y: 0 };
    draggingBall = new Ball(
      position,
      velocity,
      acceleration,
      10, "red");
      balls.push(draggingBall);
  });

  // mousedown 상태면 공이 커서를 따라다님, 커서 속도를 계산함.
  canvas.addEventListener("mousemove", (e) => {
    if(!isDragging) {
      return;
    }

    if(lastMousePosition) {
      const currentTime = Date.now();
      const timeSinceLastPosition = currentTime - (lastPositionTime || currentTime);
      const currentPosition = { x: e.offsetX, y: e.offsetY };
      const delta = 10 / timeSinceLastPosition; // 속도 보정값
      const velocity = { x: (currentPosition.x - lastMousePosition.x) * delta, y: (currentPosition.y - lastMousePosition.y) * delta };
      lastVelocity = velocity;
      lastMousePosition = currentPosition;
      lastPositionTime = currentTime;
    }

    if(draggingBall) {
      draggingBall.position = { x: e.offsetX, y: e.offsetY };
    }
  });

  // 마우스 떼면 공 추가됨
  const handleMouseOut = () => {
    isDragging = false;
    if (!draggingBall) {
      return;
    }

    if (lastVelocity) {
      draggingBall.velocity = lastVelocity;
    }

    draggingBall.isDragging = false;
    lastMousePosition = null;
    lastVelocity = null;
    draggingBall = null;
  };

  canvas.addEventListener("mouseup", handleMouseOut);
  canvas.addEventListener("mouseleave", handleMouseOut);
  let lastTimestamp = 0;

  const animate = (timestamp: number) => { 
    // 60fps에서는 16ms 주기로 호출됨. 120ms 등 주사율이 달라지면 프레임 속도가 달라져 공의 속도가 달리지므로 보정값필요함
    const deltaTime = (timestamp - lastTimestamp) / 16;
    lastTimestamp = timestamp;
    const box: Box = {
      width: canvas.width,
      height: canvas.height
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
      ball.update(box, deltaTime);
      ball.draw(ctx);
    });
    requestAnimationFrame(animate);
  }

  animate(0);
}

export {createPhysicalEngine}