<script>
  import { onMount } from 'svelte';

  let canvas;
  let ctx;
  let playerImage;
  let platformImage;
  let imageLoaded = false;
  let platformImageLoaded = false;
  let lastFrameTime = 0;

  let gameState = {
    player: {
      x: 100,
      y: 300,
      width: 70,
      height: 104,
      velocityY: 0,
      isJumping: false,
    },
    platforms: [],
    gravity: 0.8 * 60, // pixels/sec^2
    jumpPower: -15,
    speed: 3 * 60,     // pixels/sec
    score: 0,
    gameRunning: true
  };

  let keys = {};

  function createPlatform(x) {
    return {
      x: x,
      y: Math.random() * 200 + 250,
      width: 227 * .35,
      height: 240 * .35,
      originalHeight: 240 * .35,
      permanentlySquashed: false
    };
  }

  function initGame() {
    gameState.platforms = [];
    for (let i = 0; i < 5; i++) {
      gameState.platforms.push(createPlatform(200 + i * 200));
    }
  }
  
  // FIXED: This function is now correct
  function updatePlayer(deltaTime) {
    const player = gameState.player;
    const deltaSeconds = deltaTime / 1000;

    // Apply gravity to velocity
    player.velocityY += gameState.gravity * deltaSeconds;
    
    // Apply velocity to position
    // THIS IS THE CORRECTED LINE:
    player.y += player.velocityY;

    // Ground collision
    if (player.y > 350) {
      player.y = 350;
      player.velocityY = 0;
      player.isJumping = false;
    }

    // Platform collisions
    if (player.velocityY > 0) { // Only check when falling
      for (const platform of gameState.platforms) {
        // Check if player is horizontally aligned with platform
        if (player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
          
          // Check if player is landing on top of platform
          const playerBottom = player.y + player.height;
          const platformTop = platform.y;
          
          // If player is passing through the platform top this frame
          if (playerBottom >= platformTop && 
              playerBottom - player.velocityY <= platformTop + 5) { // Small tolerance
            
            player.y = platformTop - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            gameState.score += 10;
            document.getElementById('score-board').textContent = gameState.score;
            
            if (!platform.permanentlySquashed) {
              platform.permanentlySquashed = true;
              platform.height = platform.originalHeight * 0.3;
              platform.y = platform.y + (platform.originalHeight - platform.height);
            }
            break;
          }
        }
      }
    }

    if (player.y > 500) {
      gameState.gameRunning = false;
    }
  }

  function updatePlatforms(deltaTime) {
    const deltaSeconds = deltaTime / 1000;

    for (const platform of gameState.platforms) {
      platform.x -= gameState.speed * deltaSeconds;
    }

    gameState.platforms = gameState.platforms.filter(p => p.x + p.width > 0);

    if (gameState.platforms.length < 5) {
      const lastPlatform = gameState.platforms[gameState.platforms.length - 1];
      const newX = lastPlatform ? lastPlatform.x + 150 + Math.random() * 100 : 800;
      gameState.platforms.push(createPlatform(newX));
    }

    const speedIncreasePerSecond = 0.06 * 60;
    gameState.speed += speedIncreasePerSecond * deltaSeconds;
  }

  function render() {
    if (!ctx) return;

    ctx.fillStyle = '#9e80ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#71c46c';
    ctx.fillRect(0, 390, canvas.width, 110);

    gameState.platforms.forEach(platform => {
      if (platformImageLoaded && platformImage) {
        ctx.drawImage(platformImage, platform.x, platform.y, platform.width, platform.height);
      } else {
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    });

    if (imageLoaded && playerImage) {
      ctx.drawImage(playerImage, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    } else {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    }

    // ctx.fillStyle = '#333';
    // ctx.font = '24px Arial';
    // ctx.fillText(`Score: ${gameState.score}`, 20, 40);
    
    // ctx.font = '16px Arial';
    // ctx.fillText(`Speed: ${(gameState.speed / 60).toFixed(2)}`, 20, 70);

    // ctx.fillStyle = '#666';
    // ctx.font = '16px Arial';
    // ctx.fillText('Press SPACE/W/UP ARROW or CLICK to jump!', 20, canvas.height - 20);

    if (!gameState.gameRunning) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#fff';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
      
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${gameState.score}`, canvas.width / 2, canvas.height / 2);
      ctx.fillText('Press R to restart', canvas.width / 2, canvas.height / 2 + 50);
      
      ctx.textAlign = 'left';
    }
  }

  function resetGame() {
    gameState = {
      player: {
        x: 100,
        y: 300,
        width: 70,
        height: 104,
        velocityY: 0,
        isJumping: false,
      },
      platforms: [],
      gravity: 0.8 * 60,
      jumpPower: -15,
      speed: 3 * 60,
      score: 0,
      gameRunning: true
    };
    initGame();
  }

  function gameLoop(currentTime) {
    const deltaTime = Math.min(currentTime - lastFrameTime, 50);
    lastFrameTime = currentTime;
    
    if (gameState.gameRunning) {
      updatePlayer(deltaTime);
      updatePlatforms(deltaTime);
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
  }

  function handleKeyDown(e) {
    if ((e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp' || e.code === 'KeyW') && 
        gameState.gameRunning && !gameState.player.isJumping) {
      gameState.player.velocityY = gameState.jumpPower;
      gameState.player.isJumping = true;
    }
    
    if (e.code === 'KeyR' && !gameState.gameRunning) {
      resetGame();
    }
    
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyR' || e.code === 'KeyW') {
      e.preventDefault();
    }
  }

  function handleClick() {
    canvas.focus();
    if (gameState.gameRunning && !gameState.player.isJumping) {
      gameState.player.velocityY = gameState.jumpPower;
      gameState.player.isJumping = true;
    } else if (!gameState.gameRunning) {
      resetGame();
    }
  }

  function loadPlayerImage() {
    playerImage = new Image();
    playerImage.onload = () => { imageLoaded = true; };
    playerImage.onerror = () => { console.error('Failed to load player image'); };
    playerImage.src = '/characters/game-char-white.png';
  }

  function loadPlatformImage() {
    platformImage = new Image();
    platformImage.onload = () => { platformImageLoaded = true; };
    platformImage.onerror = () => { console.error('Failed to load platform image'); };
    platformImage.src = '/characters/water-bottle.png';
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;
    canvas.tabIndex = 0;
    canvas.focus();
    
    loadPlayerImage();
    loadPlatformImage();
    
    resetGame();
    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<div id="score-board"></div>
<div class="game-container">
  <canvas bind:this={canvas} class="game-canvas"></canvas>
</div>

  <div>Press SPACE/W/UP ARROW or CLICK to jump!</div>
<style>
  .game-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .game-canvas {
    border: 2px solid #333;
    border-radius: 8px;
    background: #87ceeb;
    cursor: crosshair;
    outline: none;
  }
  
  .game-canvas:focus {
    border-color: #ff6b6b;
    box-shadow: 0 0 5px rgba(255, 107, 107, 0.5);
  }
</style>