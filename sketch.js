let seeds = []; // Array to store seed points for vines
let baseMaxLength = 900; // Maximum length for each vine
let vineColor = 0; // Color of the vine (black)
let minSeparation = 40; // Minimum separation between branches
let branchCooldown = 20; // Frames to wait after a branch has been created

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
  createCanvas(800, 900);
  background(255);
  //   frameRate(500);

  //   for (let i = 1; i < 6; i++) {
  //     seeds.push({
  //       x: random(width),
  //       y: random(height),
  //       angle: random(-TWO_PI, TWO_PI), // Random initial angle
  //       rot: 1,
  //       length: 0, // Initial length
  //       canBranch: true, // Whether the seed can branch
  //       branchLevel: 0, // Branching level
  //     });
  //   }

  // Initialize the main seed
  seeds.push({
    x: width / 2,
    y: height / 2,
    angle: 0, // Random initial angle
    rot: 1,
    length: 0, // Initial length
    canBranch: true, // Whether the seed can branch
    branchLevel: 0, // Branching level
  });
  loadPixels(); // Prepare pixel array for manipulation
}

function draw() {
  //   loadPixels();
  for (let i = 0; i < 100; i++) {
    for (let seed of seeds) {
      growVine(seed); // Grow each vine from its seed
    }
  }
  updatePixels(); // Update the pixel array on the canvas
}

function growVine(seed) {
  let maxLength = baseMaxLength / Math.pow(1.7, seed.branchLevel);
  //   console.log(seed.branchLevel, maxLength);

  if (seed.length >= maxLength) return; // Stop if max length reached

  let stepSize = 1;

  // Calculate new position based on current angle
  let newX = seed.x + cos(seed.angle) * stepSize;
  let newY = seed.y + sin(seed.angle) * stepSize;

  // Check bounds to keep within the canvas
  if (newX < 0 || newX >= width || newY < 0 || newY >= height) return;

  // Apply some randomness to angle for curling effect based on branching level
  let curlFactor = Math.pow(3, seed.branchLevel); // Curl factor based on branching level
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
    seed.length < maxLength - minSeparation
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
