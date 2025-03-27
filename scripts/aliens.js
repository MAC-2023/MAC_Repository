let enemies = [], enemyBullets = [];
let alienDeathSound;

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy || !enemy.position) continue;

        let direction = new THREE.Vector3()
            .subVectors(camera.position, enemy.position)
            .normalize()
            .multiplyScalar(enemy.speed);

        let newPos = enemy.position.clone().add(direction);
        if (!checkCollision(newPos, 1)) {
            enemy.position.copy(newPos);
        }

        enemy.lookAt(camera.position);

        const currentTime = clock.getElapsedTime();
        const distanceToPlayer = enemy.position.distanceTo(camera.position);

        if (distanceToPlayer < 20 && currentTime - enemy.lastShot >= enemy.shootCooldown) {
            const ray = new THREE.Raycaster();
            ray.set(enemy.position, direction);

            const intersects = ray.intersectObjects(obstacles);

            if (intersects.length === 0 || intersects[0].distance > distanceToPlayer) {
                playSound(enemyShootSound);

                let bullet = new THREE.Mesh(
                    new THREE.SphereGeometry(0.2),
                    new THREE.MeshBasicMaterial({
                        color: enemy.material.color.getHex()
                    })
                );
                bullet.position.copy(enemy.position);

                let bulletDirection = new THREE.Vector3()
                    .subVectors(camera.position, enemy.position);
                bulletDirection.y = 0;
                bulletDirection.normalize();

                bulletDirection.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    0,
                    (Math.random() - 0.5) * 0.1
                )).normalize();

                bullet.velocity = bulletDirection.multiplyScalar(0.2);
                enemyBullets.push(bullet);
                scene.add(bullet);
                enemy.lastShot = currentTime;
            }
        }

        if (enemy.position.distanceTo(camera.position) < 2) {
            if (!shieldActive) {
                health -= 5;
            }
            scene.remove(enemy);
            enemies.splice(i, 1);
        }
    }
}

function updateEnemyBullets() {
    enemyBullets.forEach((bullet, index) => {
        bullet.position.add(bullet.velocity);

        if (bullet.position.distanceTo(camera.position) > 100) {
            scene.remove(bullet);
            enemyBullets.splice(index, 1);
            return;
        }

        if (bullet.position.distanceTo(camera.position) < 1.5) {
            if (!shieldActive) {
                health -= 5;
            }
            scene.remove(bullet);
            enemyBullets.splice(index, 1);
        }
    });
}

function spawnEnemies() {
    for (let i = 0; i < wave * 5; i++) {
        let enemyType = Math.random();
        let enemy;

        if (enemyType < 0.2) {
            enemy = createEnemy(0xff0000, 0.03, 3, 30);
        } else if (enemyType < 0.4) {
            enemy = createEnemy(0x0000ff, 0.05, 1, 15);
        } else if (enemyType < 0.6) {
            enemy = createEnemy(0xffff00, 0.015, 2, 20);
            enemy.isBomber = true;
        } else if (enemyType < 0.8) {
            enemy = createEnemy(0x800080, 0.02, 2, 25);
            enemy.isTeleporter = true;
            enemy.teleportCooldown = 0;
        } else {
            enemy = createEnemy(0x00ff00, 0.02, 1, 10);
        }

        let position = findValidPosition();
        enemy.position.copy(position);
        enemies.push(enemy);
        scene.add(enemy);
    }
}