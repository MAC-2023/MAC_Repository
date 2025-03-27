document.addEventListener('DOMContentLoaded', (event) => {
    let scene, camera, renderer, controls;
    let bullets = [], obstacles = [], powerups = [];
    let moveSpeed = 0.1, mouseSensitivity = 0.002;
    let clock = new THREE.Clock();
    let minimapCanvas, minimapCtx;

    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Load wall texture
        const textureLoader = new THREE.TextureLoader();
        wallTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(0.5, 0.5);

        // Star field
        const stars = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 2000; i++) {
            starVertices.push(
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000),
                THREE.MathUtils.randFloatSpread(2000)
            );
        }
        stars.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xFFFFFF })));

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        const light = new THREE.PointLight(0xffffff, 0.3);
        light.position.set(0, 10, 0);
        scene.add(light);

        const torchPositions = [
            { x: 5, z: 5 }, { x: -5, z: 5 }, { x: 5, z: -5 }, { x: -5, z: -5 },
            { x: 0, z: 0 }, { x: 8, z: 8 }, { x: -8, z: 8 }, { x: 8, z: -8 }, { x: -8, z: -8 }
        ];
        torchPositions.forEach(pos => addTorch(pos.x, pos.z));

        controls = new THREE.PointerLockControls(camera, document.body);
        document.addEventListener('click', () => controls.lock());

        const floorTexture = textureLoader.load('https://threejs.org/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(8, 8);

        let floor = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({
                map: floorTexture,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);

        generateObstacles();

        minimapCanvas = document.getElementById('minimap');
        minimapCtx = minimapCanvas.getContext('2d');
        minimapCanvas.width = 200;
        minimapCanvas.height = 200;

        document.addEventListener('mousedown', () => {
            if (controls.isLocked) {
                shoot();
            }
        });

        animate();
    }

    function addTorch(x, z) {
        const torchLight = new THREE.PointLight(0xff6600, 0.5);
        torchLight.position.set(x, 2, z);
        torchLight.distance = 8;
        torchLight.decay = 1.5;
        scene.add(torchLight);
    }

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

    function animate() {
        requestAnimationFrame(animate);

        updatePlayer();
        updateEnemies();
        updateEnemyBullets();
        updateBullets();
        updateExplosions();
        checkPowerups();

        renderer.render(scene, camera);
    }

    function startGame() {
        // Ensure audio context is created or resumed after user gesture
        if (!audioContext || audioContext.state === 'suspended') {
            initAudio();
        }

        // Reset game variables
        health = 100;
        ammo = 30;
        score = 0;
        wave = 1;
        enemies = [];
        bullets = [];
        powerups = [];
        enemyBullets = [];
        
        // Hide game over menu
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('menu').style.display = 'none';
        
        // Start the game loop
        animate();
    }

    document.getElementById('startButton').addEventListener('click', () => {
        startGame();
    });

    init();
});