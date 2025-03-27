let health = 100, ammo = 30, shotgunActive = false, velocityY = 0;
const gravity = 0.02;
let keys = {};

document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => delete keys[e.code]);

function updatePlayer() {
    let delta = clock.getDelta();
    let direction = new THREE.Vector3();

    if (keys.KeyW) direction.z -= moveSpeed;
    if (keys.KeyS) direction.z += moveSpeed;
    if (keys.KeyA) direction.x -= moveSpeed;
    if (keys.KeyD) direction.x += moveSpeed;
    if (keys.Space && checkGrounded()) velocityY = 0.15;
    if (keys.ShiftLeft) direction.multiplyScalar(1.5);

    velocityY -= gravity;
    direction.applyQuaternion(camera.quaternion);

    // Horizontal movement
    let newPos = camera.position.clone().add(direction);
    if (!checkCollision(new THREE.Vector3(newPos.x, camera.position.y, newPos.z))) {
        camera.position.copy(newPos);
    }

    // Vertical movement
    let verticalPos = camera.position.clone().add(new THREE.Vector3(0, velocityY, 0));
    if (!checkCollision(verticalPos)) {
        camera.position.y += velocityY;
    }

    if (camera.position.y < 1.6) {
        camera.position.y = 1.6;
        velocityY = 0;
    }
}

function checkGrounded() {
    const groundCheck = camera.position.clone();
    groundCheck.y -= 1.6;
    return checkCollision(groundCheck, 0.1);
}

function shoot() {
    if (ammo <= 0) return;
    ammo -= shotgunActive ? 3 : 1;

    playSound(playerShootSound);

    const spread = shotgunActive ? 0.2 : 0;
    for (let i = 0; i < (shotgunActive ? 8 : 1); i++) {
        // Create laser-like shape (much longer and thinner)
        const laserGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
        const laserMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        let laser = new THREE.Mesh(laserGeometry, laserMaterial);

        let direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        let offset = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
        ).normalize();

        let hipOffset = new THREE.Vector3(0.5, -0.5, 0);
        hipOffset.applyQuaternion(camera.quaternion);
        laser.position.copy(camera.position).add(hipOffset);

        let finalDirection = direction.clone().add(offset).normalize();
        laser.velocity = finalDirection.multiplyScalar(0.05);

        laser.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            finalDirection
        );

        bullets.push(laser);
        scene.add(laser);

        const glowGeometry = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2
        });
        let glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(laser.position);
        glow.quaternion.copy(laser.quaternion);
        laser.glow = glow;
        scene.add(glow);
    }
}