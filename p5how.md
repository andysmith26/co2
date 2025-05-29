# Complete Step-by-Step Side-Scroller Tutorial

## Step 1: Basic Setup & Static Character

**Goal:** Create a simple character that appears on screen

**What you're learning:** How to set up p5.js, create objects to store data, and draw shapes

### Complete Code:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"></script>
</head>
<body>
    <script>
        // Character properties stored in an object
        let char = {
            x: 200,  // Horizontal position (center of screen)
            y: 245,  // Vertical position (near bottom)
            width: 30,
            height: 60
        };

        function setup() {
            createCanvas(400, 500);
        }

        function draw() {
            background(255); // White background
            
            // Draw character as blue rectangle
            fill(0, 100, 200); // Blue color
            rect(char.x - char.width/2, char.y - char.height/2, char.width, char.height);
            
            // Draw ground line for reference
            stroke(0); // Black line
            line(0, 275, width, 275);
        }
    </script>
</body>
</html>
```

### What to add:
1. Create HTML file with p5.js script tag
2. Add `char` object with position and size properties
3. Add `setup()` function to create canvas
4. Add `draw()` function with background, character rectangle, and ground line

### Code explanation:
- **`char` object:** Stores all character data in one place (like a folder for character info)
- **`char.x - char.width/2`:** Centers the rectangle on the character's position
- **`fill(0, 100, 200)`:** Sets blue color for the character
- **`line(0, 275, width, 275)`:** Draws horizontal ground line across screen

### Test: You should see a blue rectangle sitting on a black line

---

## Step 2: World Movement System

**Goal:** Make the world move when you press arrow keys

**What you're learning:** The core side-scroller concept - character stays put, world moves

### Code to ADD (add after the char object):
```javascript
// World offset - this is what creates the side-scrolling effect
let worldX = 0;  // Negative = world moved left, Positive = world moved right
```

### Code to REPLACE (replace the entire draw() function):
```javascript
function draw() {
    background(255);
    
    // Handle input - move world instead of character
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A key
        worldX += 3; // Move world right (character appears to go left)
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D key
        worldX -= 3; // Move world left (character appears to go right)
    }
    
    // Draw character (always at same screen position)
    fill(0, 100, 200);
    rect(char.x - char.width/2, char.y - char.height/2, char.width, char.height);
    
    // Draw ground line that moves with world
    stroke(0);
    line(worldX, 275, worldX + 800, 275); // Extended ground line
    
    // Debug info
    fill(0);
    noStroke();
    text("World X: " + worldX, 10, 20);
}
```

### Code explanation:
- **`worldX += 3`:** When going "left", we move the world right by 3 pixels
- **`worldX -= 3`:** When going "right", we move the world left by 3 pixels
- **`line(worldX, 275, worldX + 800, 275)`:** Ground line starts at `worldX` and extends 800 pixels
- **Debug text:** Shows the world offset value so you can see it changing

### Test: Press arrow keys - ground line should move, character should stay in same place

---

## Step 3: Jumping Mechanics

**Goal:** Add gravity and jumping physics

**What you're learning:** Physics simulation, velocity, and gravity

### Code to ADD (add two more properties to the char object):
```javascript
let char = {
    x: 200,
    y: 245,
    width: 30,
    height: 60,
    velocityY: 0,    // How fast moving up/down (negative = up, positive = down)
    onGround: true   // Whether character can jump
};
```

### Code to ADD (add after worldX):
```javascript
let worldY = 0;  // Vertical world offset for jumping
```

### Code to REPLACE (replace the entire draw() function):
```javascript
function draw() {
    background(255);
    
    // Handle horizontal movement
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A key
        worldX += 3;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D key
        worldX -= 3;
    }
    
    // Handle jumping
    if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && char.onGround) { // W key
        char.velocityY = -4.5; // Negative shoots upward
        char.onGround = false; // Can't jump again until landing
    }
    
    // Apply gravity and movement
    char.velocityY += 0.2; // Gravity constantly pulls down
    worldY -= char.velocityY; // World moves opposite to character jump
    
    // Check if landed on ground
    if (worldY <= 0) { // Back to ground level
        worldY = 0;
        char.velocityY = 0;
        char.onGround = true;
    }
    
    // Draw character (fixed position)
    fill(0, 100, 200);
    rect(char.x - char.width/2, char.y - char.height/2, char.width, char.height);
    
    // Draw ground (moves with world)
    stroke(0);
    line(worldX, 275 + worldY, worldX + 800, 275 + worldY);
    
    // Debug info
    fill(0);
    noStroke();
    text("World X: " + worldX, 10, 20);
    text("World Y: " + worldY.toFixed(1), 10, 40);
}
```

### Code explanation:
- **`char.velocityY = -4.5`:** Initial jump speed (negative = upward)
- **`char.velocityY += 0.2`:** Gravity pulls down every frame
- **`worldY -= char.velocityY`:** When character goes up, world goes down
- **`char.onGround`:** Prevents double-jumping
- **`275 + worldY`:** Ground line moves vertically with world offset

### Test: Press UP arrow to jump - character stays put, ground moves down then back up

---

## Step 4: Add Platform/Shelf

**Goal:** Create a platform that moves with the world

**What you're learning:** World coordinates vs screen coordinates

### Code to ADD (add after worldY):
```javascript
// Platform properties (in world coordinates)
let shelf = {
    x: 300,      // Position in world (300 pixels to the right)
    y: 230,      // Height in world (45 pixels above ground)
    width: 100,
    height: 45
};
```

### Code to ADD (add this section in draw() after drawing the character):
```javascript
// Draw platform (moves with world)
fill(139, 69, 19); // Brown color
let shelfScreenX = shelf.x + worldX; // Convert world X to screen X
let shelfScreenY = shelf.y + worldY; // Convert world Y to screen Y
rect(shelfScreenX, shelfScreenY, shelf.width, shelf.height);
```

### Code explanation:
- **`shelf.x = 300`:** Platform exists 300 pixels to the right in the "world"
- **`shelfScreenX = shelf.x + worldX`:** Converts world position to screen position
- **`shelfScreenY = shelf.y + worldY`:** Platform moves up/down when jumping
- **Brown color:** Makes platform visually distinct from character

### Test: You should see a brown platform that moves when you walk/jump

---

## Step 5: Platform Landing Collision

**Goal:** Enable landing on top of the platform

**What you're learning:** Collision detection and coordinate conversion

### Code to REPLACE (replace the landing check section in draw()):
```javascript
// Check collision with platform (landing on top)
let charWorldX = char.x - worldX; // Character's position in world coordinates
let charBottom = char.y - worldY + char.height/2; // Character's bottom edge

let onShelf = (charWorldX > shelf.x && 
               charWorldX < shelf.x + shelf.width && 
               charBottom >= shelf.y && 
               charBottom <= shelf.y + 10 && // Small tolerance for landing
               char.velocityY >= 0); // Only when falling down

// Landing checks
if (onShelf) {
    // Land on platform
    worldY = -(shelf.y - char.y - char.height/2);
    char.velocityY = 0;
    char.onGround = true;
} else if (worldY <= 0) {
    // Land on ground
    worldY = 0;
    char.velocityY = 0;
    char.onGround = true;
}
```

### Code explanation:
- **`charWorldX = char.x - worldX`:** Converts character's screen position to world position
- **`charBottom = char.y - worldY + char.height/2`:** Character's bottom edge in world
- **`onShelf` conditions:** Check if character is above platform horizontally and vertically
- **`char.velocityY >= 0`:** Only land when falling down, not jumping up
- **`worldY = -(shelf.y - char.y - char.height/2)`:** Sets correct world offset for platform height

### Test: You should be able to jump onto the platform and jump again from the higher position

---

## Step 6: Horizontal Collision Detection

**Goal:** Prevent walking through the platform sides

**What you're learning:** "Test first, move second" collision pattern

### Code to REPLACE (replace the horizontal movement section in draw()):
```javascript
// Movement input with collision detection
let newWorldX = worldX; // Test new position first

if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // A key
    newWorldX += 3;
}
if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // D key
    newWorldX -= 3;
}

// Test if new position would cause collision
let charNewWorldX = char.x - newWorldX; // Character's world position with new movement
let charLeft = charNewWorldX - char.width/2;
let charRight = charNewWorldX + char.width/2;
let charTop = char.y - worldY - char.height/2;
let charBottom = char.y - worldY + char.height/2;

// AABB (Axis-Aligned Bounding Box) collision detection
let colliding = (charRight > shelf.x && 
                charLeft < shelf.x + shelf.width &&
                charBottom > shelf.y &&
                charTop < shelf.y + shelf.height);

// Only move if no collision
if (!colliding) {
    worldX = newWorldX;
}
```

### Code explanation:
- **`newWorldX = worldX`:** Test the new position before applying it
- **AABB collision:** Standard 2D rectangle collision detection
- **`charRight > shelf.x`:** Character's right edge past platform's left edge
- **`charLeft < shelf.x + shelf.width`:** Character's left edge before platform's right edge
- **Similar for top/bottom:** Check vertical overlap
- **`if (!colliding)`:** Only move if the movement is safe

### Test: You should not be able to walk through the platform, but can still jump on top

---

## Step 7: Separate X/Y Collision (Final)

**Goal:** Fix diagonal corner clipping issues

**What you're learning:** Why separating collision axes prevents bugs

### COMPLETE FINAL CODE:
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"></script>
</head>
<body>
    <script>
        // Character properties
        let char = {
            x: 200,
            y: 245,
            width: 30,
            height: 60,
            velocityY: 0,
            onGround: true
        };

        // World offset
        let worldX = 0;
        let worldY = 0;

        // Platform properties
        let shelf = {
            x: 300,
            y: 230,
            width: 100,
            height: 45
        };

        function setup() {
            createCanvas(400, 500);
        }

        function draw() {
            background(255);
            
            // HORIZONTAL MOVEMENT with collision
            let newWorldX = worldX;
            
            if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
                newWorldX += 3;
            }
            if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
                newWorldX -= 3;
            }
            
            // Test horizontal collision
            let charNewWorldX = char.x - newWorldX;
            let charLeft = charNewWorldX - char.width/2;
            let charRight = charNewWorldX + char.width/2;
            let charTop = char.y - worldY - char.height/2;
            let charBottom = char.y - worldY + char.height/2;
            
            let horizontalCollision = (charRight > shelf.x && 
                                     charLeft < shelf.x + shelf.width &&
                                     charBottom > shelf.y &&
                                     charTop < shelf.y + shelf.height);
            
            if (!horizontalCollision) {
                worldX = newWorldX;
            }
            
            // JUMPING INPUT
            if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && char.onGround) {
                char.velocityY = -4.5;
                char.onGround = false;
            }
            
            // VERTICAL PHYSICS with collision
            char.velocityY += 0.2;
            let newWorldY = worldY - char.velocityY;
            
            // Test vertical collision
            let charCurrentWorldX = char.x - worldX;
            let charLeftCurrent = charCurrentWorldX - char.width/2;
            let charRightCurrent = charCurrentWorldX + char.width/2;
            let charTopNew = char.y - newWorldY - char.height/2;
            let charBottomNew = char.y - newWorldY + char.height/2;
            
            let verticalCollision = (charRightCurrent > shelf.x && 
                                   charLeftCurrent < shelf.x + shelf.width &&
                                   charBottomNew > shelf.y &&
                                   charTopNew < shelf.y + shelf.height &&
                                   char.velocityY > 0);
            
            if (verticalCollision) {
                // Land on platform
                worldY = -(shelf.y - char.y - char.height/2);
                char.velocityY = 0;
                char.onGround = true;
            } else {
                worldY = newWorldY;
            }
            
            // Ground landing
            if (worldY <= 0) {
                worldY = 0;
                char.velocityY = 0;
                char.onGround = true;
            }
            
            // DRAWING
            // Character
            fill(0, 100, 200);
            rect(char.x - char.width/2, char.y - char.height/2, char.width, char.height);
            
            // Platform
            fill(139, 69, 19);
            let shelfScreenX = shelf.x + worldX;
            let shelfScreenY = shelf.y + worldY;
            rect(shelfScreenX, shelfScreenY, shelf.width, shelf.height);
            
            // Ground
            stroke(0);
            line(worldX, 275 + worldY, worldX + 800, 275 + worldY);
            
            // Debug
            fill(0);
            noStroke();
            text("World X: " + worldX, 10, 20);
            text("World Y: " + worldY.toFixed(1), 10, 40);
        }
    </script>
</body>
</html>
```

### Code explanation:
- **Separated collision:** Horizontal and vertical movements tested independently
- **`horizontalCollision`:** Tests X movement with current Y position
- **`verticalCollision`:** Tests Y movement with current X position
- **`charCurrentWorldX`:** Uses actual current position for vertical test
- **No corner clipping:** Can't slip through corners by moving diagonally

### Test: Try jumping diagonally at corners - should cleanly land on top or bounce off sides

---

## Summary of Key Concepts

1. **Side-scroller illusion:** Character stays put, world moves
2. **Coordinate conversion:** World coordinates ↔ Screen coordinates  
3. **Physics simulation:** Velocity + gravity = realistic movement
4. **Collision detection:** AABB rectangles, test before moving
5. **Separated axes:** X and Y collision handled independently
6. **State management:** Track character state (onGround, velocities)

Each step builds on the previous one, so make sure each step works before moving to the next!
