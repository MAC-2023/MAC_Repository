const gridSize = 20;
const cellSize = 5;
let maze;
let wallTexture;

function generateObstacles() {
    maze = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (i === 0 || i === gridSize - 1 || j === 0 || j === gridSize - 1) {
                maze[i][j] = 1;
            } else if (Math.random() < 0.3) {
                maze[i][j] = 1;
            }
        }
    }

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (maze[i][j] === 1) {
                let wall = new THREE.Mesh(
                    new THREE.BoxGeometry(cellSize, 5, cellSize),
                    new THREE.MeshBasicMaterial({
                        map: wallTexture,
                        color: 0xffffff
                    })
                );
                wall.position.set(
                    (i - gridSize / 2) * cellSize + cellSize / 2,
                    2.5,
                    (j - gridSize / 2) * cellSize + cellSize / 2
                );
                obstacles.push(wall);
                scene.add(wall);
            }
        }
    }
}

function findValidPosition() {
    const maxAttempts = 100;
    let attempts = 0;
    let position;

    do {
        position = new THREE.Vector3(
            Math.random() * 80 - 40,
            1,
            Math.random() * 80 - 40
        );
        attempts++;
    } while (checkCollision(position, 1) && attempts < maxAttempts);

    return position;
}