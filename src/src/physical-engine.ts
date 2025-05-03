interface Vector {
  x: number;
  y: number;
}

interface Box {
  width: number;
  height: number;
};

interface Ball {
  position: Vector;
  velocity: Vector;
  radius: number;
  color: string;
  isDragging: boolean;
  update(box: Box, deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}
type DraggingState = {
  state: "idle"
  draggingBall: null;
  isDragging: false;
  lastMousePosition: null;
  lastPositionTime: null;
  lastVelocity: null;
} | {
  state: "dragging"
  draggingBall: Ball;
  isDragging: true;
  lastMousePosition: Vector;
  lastPositionTime: number;
  lastVelocity: Vector;
};

const VELOCITY_SCALING_FACTOR = 5;
const MIN_TIME_DELTA = 11;
const GRAVITY = 1;
const IDLE_DRAGGING_STATE: DraggingState = {
  state: "idle",
  draggingBall: null,
  isDragging: false,
  lastMousePosition: null,
  lastPositionTime: null,
  lastVelocity: null,
};

const initCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.backgroundColor = "#ddd";
  document.body.appendChild(canvas);
  return canvas;
}

class NormalBall implements Ball {
  private bounciness: number = 0.8;
  public isDragging: boolean = true;
  private mass: number = 1;
  private area: number;
  private dragCoefficient: number = 0.47;
  private airDensity: number = 0.00001;
  private acceleration: Vector = { x: 0, y: 0 };
  
  constructor(
    public position: Vector, 
    public velocity: Vector, 
    public radius: number, 
    public color: string,
  ) {
    this.area = Math.PI * this.radius * this.radius;
  }

  update(box: Box, deltaTime: number) {
    if(this.isDragging) {
      return;
    }
    
    this.acceleration = {x: 0, y: GRAVITY};
    this.applyDamping();
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

  private applyDamping() {
    this.applyAirResistance();
    this.applyFriction();
  }

  private applyAirResistance () {
    // velocity scalar 값을 기반으로 계산
    // F= 1/2​ρC​Av^2
    // F : 저항 힘, ρ: 공기 밀도, C: 항력 계수, A: 단면적
    // 힘의 방향
    const directionX = this.velocity.x < 0 ? -1 : 1;
    const directionY = this.velocity.y < 0 ? -1 : 1;
    const forceX = directionX * 0.5 * this.airDensity * this.dragCoefficient * this.area * Math.pow(this.velocity.x, 2);
    const forceY = directionY * 0.5 * this.airDensity * this.dragCoefficient * this.area * Math.pow(this.velocity.y, 2);
    this.acceleration.x -= forceX / this.mass;
    this.acceleration.y -= forceY / this.mass;
  }

  private applyFriction() {
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
}

function setupBallDragAndThrow(canvas: HTMLCanvasElement, addBall: (ball: NormalBall) => void) {
  let draggingState = IDLE_DRAGGING_STATE;

  // 공 추가, 마우스 떼거나 canvas에서 벗어나면 공이 움직임
  const handleMouseDown = (e: MouseEvent): void => {
    const position = { x: e.offsetX, y: e.offsetY };
    const velocity = { x: 0, y: 0 };
    const draggingBall = new NormalBall(
      position,
      velocity,
      10, "red");
    const isDragging = true;
    const lastMousePosition = { x: e.offsetX, y: e.offsetY };
    const lastPositionTime = Date.now();
    draggingState = {
      state: "dragging",
      draggingBall,
      isDragging,
      lastMousePosition,
      lastPositionTime,
      lastVelocity: { x: 0, y: 0 },
    }
    addBall(draggingBall);
  };

  // mousedown 상태면 공이 커서를 따라다님, 커서 속도를 계산함.
  const handleMouseMove = (e: MouseEvent): void => {
    if (draggingState.state !== "dragging") {
      return;
    }

    const currentPosition = { x: e.offsetX, y: e.offsetY };

    if (draggingState.lastMousePosition && draggingState.lastPositionTime) {
      const currentTime = Date.now();
      const dx = currentPosition.x - draggingState.lastMousePosition.x;
      const dy = currentPosition.y - draggingState.lastMousePosition.y;
      const dt = Math.max(currentTime - draggingState.lastPositionTime, MIN_TIME_DELTA);
      const velocity = { x: VELOCITY_SCALING_FACTOR * dx / dt, y: VELOCITY_SCALING_FACTOR * dy / dt };

      draggingState.lastVelocity = velocity;
      draggingState.lastMousePosition = currentPosition;
      draggingState.lastPositionTime = currentTime;
    }

    draggingState.draggingBall.position = currentPosition;
  };

  // 마우스 떼면 공 추가됨
  const handleDragOut = () => {
    draggingState.isDragging = false;
    if (!draggingState.draggingBall) {
      return;
    }

    if (draggingState.lastVelocity) {
      draggingState.draggingBall.velocity = draggingState.lastVelocity;
    }

    draggingState.draggingBall.isDragging = false;
    draggingState = IDLE_DRAGGING_STATE;
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleDragOut);
  canvas.addEventListener("mouseleave", handleDragOut);
}

const createPhysicalEngine = () => {
  const canvas = initCanvas();  
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  const balls: Ball[] = [];
  const addBall = (ball: Ball) => {
    balls.push(ball);
  }
  setupBallDragAndThrow(canvas, addBall);
  
  let lastTimestamp = 0;
  const animate = (timestamp: number) => { 
    // 60fps에서는 16ms 주기로 호출됨. 120ms 등 주사율이 달라지면 프레임 속도가 달라져 공의 속도가 달리지므로 보정값필요함
    // TODO : 이걸 16으로 나누는게 아니라 delta에 중력이나 각종 상수값을 곱해서 속도를 조절하는 방식이 일반적이라고함
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
