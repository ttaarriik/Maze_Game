const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

//Matter.js config
const cellsHorizontal = 3;
const cellsVertical = 3;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

const startGame = () => {
    //Creating walls
    const walls = [
        Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
        Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
        Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
        Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
      ];
      World.add(world, walls);
    
    //Maze generation

    const shuffle = (array) => {
        let counter = array.length;

        while(counter > 0){
            let index = Math.floor(Math.random() * counter)
            counter--;
            let temp = array[counter]; 
            array[counter] = array[index];
            array[index] = temp; 
        }
            return array;
        };
    
      const grid = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
      
      const verticals = Array(cellsVertical)
        .fill(null)
        .map(() => Array(cellsHorizontal - 1).fill(false));
      
      const horizontals = Array(cellsVertical - 1)
        .fill(null)
        .map(() => Array(cellsHorizontal).fill(false));
      
      const startRow = Math.floor(Math.random() * cellsVertical);
      const startColumn = Math.floor(Math.random() * cellsHorizontal);
      

      const stepThroughCell = (row, column) => {
        // If i have visted the cell at [row, column], then return
        if (grid[row][column]) {
          return;
        }
      
        // Mark this cell as being visited
        grid[row][column] = true;
      
        // Assemble randomly-ordered list of neighbors
        const neighbors = shuffle([
          [row - 1, column, 'up'],
          [row, column + 1, 'right'],
          [row + 1, column, 'down'],
          [row, column - 1, 'left']
        ]);
        // For each neighbor....
        for (let neighbor of neighbors) {
          const [nextRow, nextColumn, direction] = neighbor;
      
          // See if that neighbor is out of bounds
          if (
            nextRow < 0 ||
            nextRow >= cellsVertical ||
            nextColumn < 0 ||
            nextColumn >= cellsHorizontal
          ) {
            continue;
          }
      
          // If we have visited that neighbor, continue to next neighbor
          if (grid[nextRow][nextColumn]) {
            continue;
          }
      
          // Remove a wall from either horizontals or verticals
          if (direction === 'left') {
            verticals[row][column - 1] = true;
          } else if (direction === 'right') {
            verticals[row][column] = true;
          } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
          } else if (direction === 'down') {
            horizontals[row][column] = true;
          }
      
          stepThroughCell(nextRow, nextColumn);
        }
      };
      
      stepThroughCell(startRow, startColumn);

    let i = 0;
    wall = [];

    horizontals.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
    if(column){
        return;
    }
        let x = columnIndex * unitLengthX + unitLengthX / 2;
        let y = rowIndex * unitLengthY + unitLengthY;
        wall.push(Bodies.rectangle(x,y,unitLengthX,5,{ isStatic: true,
        label: "wall", render: {fillStyle: "red"}}));
        World.add(world, wall[i]);
        i++;

    })
    })

    verticals.forEach((row, rowIndex) => {
    row.forEach((column, columnIndex) => {
        if(column){
            return;
        }
        let x = columnIndex * unitLengthX + unitLengthX; 
        let y = rowIndex * unitLengthY + unitLengthY / 2;
        wall.push(Bodies.rectangle(x,y,5,unitLengthY,{ isStatic: true,
        label: "wall", render: {fillStyle: "red"}}));
        World.add(world, wall[i]);
        i++;

    })
    })

    //Goal 

    goal = Bodies.rectangle(width - unitLengthX / 2,
    height - unitLengthY / 2, unitLengthX * 0.7, unitLengthY * 0.7,{
    isStatic: true,
    label: "goal",
    render: {
    fillStyle: "green"
    }
    });

    World.add(world, goal);

    //Ball

    const ballRadius = Math.min(unitLengthX / 4, unitLengthY / 4);
    ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, 
    {label: "ball",  render: {fillStyle: "blue"}});

    World.add(world, ball);

    document.body.addEventListener("keydown", (event) => {
        const {x, y} = ball.velocity;

        if(event.keyCode === 87){
        Body.setVelocity(ball, {x, y: y - 5})
        }
        if(event.keyCode === 83){
        Body.setVelocity(ball, {x, y: y + 5})
        }
        if(event.keyCode === 65){
        Body.setVelocity(ball, {x: x - 5, y})
        }
        if(event.keyCode === 68){
        Body.setVelocity(ball, {x: x + 5, y})
        }
    })

    //Win Condition

    Events.on(engine, "collisionStart", (event) => {
        event.pairs.forEach((collision) => {
        if(
        collision.bodyA.label === "goal" &&
        collision.bodyB.label === "ball"
        ){
        world.gravity.y = 1;
        document.querySelector(".winner").classList.remove("hidden");
        world.bodies.forEach((body) => {
            if(body.label === "wall"){
                Body.setStatic(body, false);
            }
        })

        }
        })
    })

}
const removeBodies = () => {
    World.remove(world, wall);
    World.remove(world, goal);
    World.remove(world, ball);

}

startGame();

button = document.querySelector("button");
button.addEventListener("click", () => {
    document.querySelector(".winner").classList.add("hidden");
   removeBodies();
   startGame();
})


