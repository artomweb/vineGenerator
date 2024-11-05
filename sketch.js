let seeds = []; // Array to store seed points for vines
let baseMaxLength = 900; // Maximum length for each vine
let vineColor = 0; // Color of the vine (black)
let minSeparation = 40; // Minimum separation between branches
let branchCooldown = 20; // Frames to wait after a branch has been created
let maxOriginSeeds = 1;
let currentSeeds = 1;

let gaussianRadius = 5; // Example radius for Gaussian blur
let thresholdValue = 128; // Example threshold value

let pageMargin = 100;

let canvas;

let originSeeds = 1;

const gridSize = 100; // Define the size of each grid cell
let grid; // 2D array to store the count of white pixels in each grid cell

let testingBuffer;

// Define an array of RGB colors for different branch levels
let colors = [
  [0, 0, 0], // Level 0: Black
  [255, 0, 0], // Level 1: Red
  [0, 255, 0], // Level 2: Green
  [0, 0, 255], // Level 3: Blue
  [255, 165, 0], // Level 4: Orange
  [128, 0, 128], // Level 5: Purple
  // Add more colors as needed for higher levels
];

function setup() {
  canvas = createCanvas(800, 800);
  canvas.parent("sketch");
  background(255);

  //   let randomx = pageMargin + random(width - pageMargin * 2);
  //   let randomy = pageMargin + random(height - pageMargin * 2);
  let randomx = 650;
  let randomy = 610;

  // Start with one seed
  //   spawnSeed(randomx, randomy);

  spawnSeed(100, 100);

  console.log(JSON.stringify(seeds[0]));
  loadPixels();
}

function spawnSeed(x, y) {
  let baseAngle = 0;
  if (y < height / 2 && x < width / 2) {
    // Top left quadrant - face in a random direction
    baseAngle = PI / 4; // Random direction
  } else if (y <= height / 2 && x >= width / 2) {
    // Top half - face down
    baseAngle = PI - PI / 4; // Face down
  } else if (y > height / 2 && x < width / 2) {
    // Left side - face right
    baseAngle = -PI / 4; // Face right
  } else if (y >= height / 2 && x >= width / 2) {
    // Left side - face right
    baseAngle = -PI + PI / 4; // Face right
  }
  // Randomize the angle by adding a random value within a specified range
  let randomOffset = random(-PI / 4, PI / 4); // Randomize the angle by ±45 degrees
  //   let randomOffset = 0;
  let angle = baseAngle + randomOffset;

  // Push the seed with its properties
  seeds.push({
    x: x,
    y: y,
    angle: angle, // Set a random angle
    rot: random() > 0.5 ? -1 : 1,
    length: 0, // Initial length
    canBranch: true, // Whether the seed can branch
    branchLevel: 0, // Branching level
    active: true, // Whether the seed is active
  });
}

function draw() {
  for (let i = 0; i < 100; i++) {
    for (let seed of seeds) {
      growVine(seed); // Grow each vine from its seed
    }
  }
  // Check for active seeds
  activeOriginSeedsCount = seeds.filter(
    (seed) => seed.branchLevel == 0 && seed.active
  ).length;
  activeSeedsCount = seeds.filter((seed) => seed.active).length;

  //   console.log(activeSeedsCount);

  // Add a new seed if all seeds have stopped growing
  //   if (activeOriginSeedsCount === 0 && currentSeeds < maxOriginSeeds) {
  //     addNewSeed();
  //   }

  console.log(activeOriginSeedsCount, activeSeedsCount);

  updatePixels(); // Update the pixel array on the canvas

  //   if (activeSeedsCount === 0 && originSeeds < maxOriginSeeds) {
  //     grid = createGrid();
  //     // console.log(grid);
  //     // console.table(grid);
  //     const bestCell = findCellWithMostWhite();
  //     // console.log(bestCell);
  //     //   noLoop();
  //     //   rectMode(CORNER);
  //     // fill("pink");
  //     // square(
  //     //   pageMargin + bestCell.x * gridSize,
  //     //   pageMargin + bestCell.y * gridSize,
  //     //   gridSize
  //     // );
  //     let point = getRandomPointInCell(bestCell);
  //     spawnSeed(point.x, point.y);
  //     console.log(point);
  //     originSeeds++;
  //   }
  if (activeSeedsCount === 0 && originSeeds >= maxOriginSeeds) {
    applyEffects();
    noLoop();
  }
}

function getRandomPointInCell(cell) {
  const randomX = pageMargin + cell.x * gridSize + random(gridSize); // Random X within the cell
  const randomY = pageMargin + cell.y * gridSize + random(gridSize); // Random Y within the cell
  return { x: randomX, y: randomY };
}

function createGrid() {
  const cols = Math.ceil((width - pageMargin * 2) / gridSize); // Adjust columns based on margin
  const rows = Math.ceil((height - pageMargin * 2) / gridSize); // Adjust rows based on margin
  let grid = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let x = pageMargin; x < width - pageMargin; x++) {
    for (let y = pageMargin; y < height - pageMargin; y++) {
      let pix = (x + y * width) * 4;

      // Count white pixels in each grid cell
      if (
        pixels[pix] === 255 &&
        pixels[pix + 1] === 255 &&
        pixels[pix + 2] === 255
      ) {
        const gridX = Math.floor((x - pageMargin) / gridSize); // Adjust for margin when calculating grid position
        const gridY = Math.floor((y - pageMargin) / gridSize); // Adjust for margin when calculating grid position
        grid[gridX][gridY]++;
      }
    }
  }
  return grid;
}

function findCellWithMostWhite() {
  const cellCounts = []; // Array to hold cells with their white pixel counts
  const maxCells = 3; // Number of top cells to consider

  // Collect all cells with their white pixel counts
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] > 0) {
        cellCounts.push({ x, y, count: grid[x][y] });
      }
    }
  }

  // Sort cells by white pixel count in descending order
  cellCounts.sort((a, b) => b.count - a.count);

  //   console.log(cellCounts);

  // Take the top 5 cells (or fewer if there aren't enough cells)
  const topCells = cellCounts.slice(0, maxCells);

  // Choose one randomly from the top cells
  if (topCells.length > 0) {
    const randomIndex = floor(random(topCells.length));
    return topCells[randomIndex]; // Return a random top cell
  }
  return null; // Return null if no cells found
}

function getCellCentroid(cell) {
  const cellX = cell.x * gridSize + gridSize / 2;
  const cellY = cell.y * gridSize + gridSize / 2;
  return { x: cellX, y: cellY }; // Return the centroid of the grid cell
}

function applyEffects() {
  // Define new dimensions for the buffer
  let newWidth = 3000;
  let newHeight = 3000;

  // Create a new buffer to hold the graphics
  let buffer = createGraphics(newWidth, newHeight);

  buffer.copy(
    // source
    get(),
    // source x, y, w, h
    0,
    0,
    width,
    height,
    // destination x, y, w, h
    0,
    0,
    newWidth,
    newHeight
  );

  background(255);
  console.log("background");

  // Update the canvas size to the new dimensions
  resizeCanvas(newWidth, newHeight);
  // Draw the buffer onto the canvas
  image(buffer, 0, 0);
  //   clear();

  // Apply the blur filter to the whole canvas
  filter(BLUR, 10);
  filter(THRESHOLD, 0.75);
}

function growVine(seed) {
  seed.maxLength = baseMaxLength / Math.pow(1.7, seed.branchLevel);
  //   console.log(seed.branchLevel, seed.maxLength);

  if (seed.length >= seed.maxLength) {
    seed.active = false;
    return;
  } // Stop if max length reached

  let stepSize = 1;
  let lookaheadSteps = 14; // Number of steps to look ahead

  // Check for potential overlap
  if (willOverlap(seed, lookaheadSteps)) {
    seed.active = false;
    return; // Stop growing if overlap detected
  }

  // Calculate new position based on current angle
  let newX = seed.x + cos(seed.angle) * stepSize;
  let newY = seed.y + sin(seed.angle) * stepSize;

  // Check bounds to keep within the canvas
  if (newX < 0 || newX >= width || newY < 0 || newY >= height) return;

  // Apply some randomness to angle for curling effect based on branching level
  let curlFactor = Math.pow(3.4, seed.branchLevel); // Curl factor based on branching level
  seed.angle += 0.03 * seed.rot * curlFactor * (seed.length * 0.0005); // Adjust angle with curl factor

  // Set pixels for this part of the vine with thickness
  let thickness = 4;
  let vineColor = colors[seed.branchLevel % colors.length];
  for (let dx = -thickness; dx <= thickness; dx++) {
    for (let dy = -thickness; dy <= thickness; dy++) {
      let x = floor(newX + dx);
      let y = floor(newY + dy);
      if (x >= 0 && x < width && y >= 0 && y < height) {
        let pix = (x + y * width) * 4;
        // pixels[pix + 0] = vineColor[0]; // Red component
        // pixels[pix + 1] = vineColor[1]; // Green component
        // pixels[pix + 2] = vineColor[2]; // Blue component
        pixels[pix + 0] = 0; // Red component
        pixels[pix + 1] = 0; // Green component
        pixels[pix + 2] = 0; // Blue component
        pixels[pix + 3] = 255; // Alpha
      }
    }
  }

  // Increment the vine's length
  seed.length++;

  // Occasionally branch to create a new vine if conditions are met
  if (
    seed.canBranch &&
    random() < 0.008 &&
    seed.length > 50 &&
    seed.length < seed.maxLength - minSeparation
  ) {
    let canCreateBranch = true;
    for (let otherSeed of seeds) {
      if (otherSeed !== seed) {
        // Check the distance to other seeds to ensure minimum separation
        let d = dist(newX, newY, otherSeed.x, otherSeed.y);
        if (d < minSeparation) {
          canCreateBranch = false;
          break;
        }
      }
    }

    if (canCreateBranch) {
      seeds.push({
        x: newX,
        y: newY,
        rot: seed.rot * -1,
        angle: seed.angle + (PI / 4) * seed.rot * -1, // New branch angle
        length: 0,
        canBranch: false, // Set cooldown to not branch again immediately
        branchLevel: seed.branchLevel + 1, // Increment branch level
      });
    }
  }

  // Update the seed's position
  seed.x = newX;
  seed.y = newY;

  // Manage the branch cooldown
  if (!seed.canBranch) {
    branchCooldown--;
    if (branchCooldown <= 0) {
      seed.canBranch = true; // Allow branching again after cooldown
      branchCooldown = 20; // Reset cooldown
    }
  }
}

// Function to check if the vine will overlap with any existing parts
function willOverlap(seed, lookaheadSteps) {
  let stepSize = 1;
  let newX = seed.x;
  let newY = seed.y;

  for (let i = 0; i < lookaheadSteps; i++) {
    newX += cos(seed.angle) * stepSize;
    newY += sin(seed.angle) * stepSize;

    // Check bounds to keep within the canvas
    if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
      return true; // Out of bounds, treat as overlap
    }

    // Check if the next pixel to grow onto is white (255, 255, 255)
    if (i >= 10) {
      let pix = (floor(newX) + floor(newY) * width) * 4;
      if (
        pixels[pix + 0] !== 255 || // Red component
        pixels[pix + 1] !== 255 || // Green component
        pixels[pix + 2] !== 255 // Blue component
      ) {
        return true; // Non-white pixel found, overlap detected
      }
    }
  }

  return false; // No overlap detected
}
