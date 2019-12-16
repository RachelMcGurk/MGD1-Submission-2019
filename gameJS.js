        
        // handles updating frames
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
        window.requestAnimationFrame = requestAnimationFrame;

        //sets the layers z-index
        var background = document.getElementById("layer1");
        var canvas = document.getElementById("layer2");
        var UI = document.getElementById("layer3");

        //sets the context by layers
        var ctx1 = background.getContext("2d");
        var ctx2 = canvas.getContext("2d");
        var ctx3 = UI.getContext("2d");

        //sets width and height of the screen
        var width = window.innerWidth;
        var height = window.innerHeight;

        // sets width and height for the layers
        background.width = width;
        background.height = height;
        UI.width = width;
        UI.height = height;
        canvas.width = width;
        canvas.height = height;
        ctx1.canvas.width = width;
        ctx1.canvas.height = height;

        //sets the different game states
        var gameStates = ["Menu", "Instructions", "Game", "Game Over", "Pause"];

        //declares the main assets
        var player;
        var lava;
        var platforms = [];
        var coins = [];

        //sets gameplay variables
        var lavaSpeed = 0.1;
        var friction = 0.8;

        //declares player score and local storage to store high score
        var playerScore = 0;
        var localStorageName = "highScoreStorage";
        var highScore;

        //conditional operator - gets data saved in local data aka high score or sets high score to zero if nothing is saved
        highScore = localStorage.getItem(localStorageName) == null ? 0 :
                    localStorage.getItem(localStorageName);

        //sets min and max width for asset spawning
        var minHeight = 5;
        var maxHeight = height - 200;

        var minWidth = 5;
        var maxWidth = width;

        //sets variables for gravity
        var gravity = 0.8;
        var gravitySpeed = 0;
        var jumping;
        var jumpVelocity = 0;
        var jumpMax = 25;

        //sets variable for sprite sheet animation
        var startTimeMS = 0;
        var frameX = 0;
        var frameXMax = 3;
        var frameY = 0;
        var frameYMax = 1;
        var frame = 0;
        var frameMax = 7;
        var frameTimer = 0.05;
        var frameTimeMax = 0.05;
        var spriteWidth = 282;
        var spriteHeight = 384;

        //sets keys for player input
        var keys = [];
        var isKeyPressed = false;

        //booleans for jumping and platform movement
        var standing;
        var canJump;

        var movingRight1 = true;
        var movingLeft1 = false;

        var movingRight2 = false;
        var movingLeft2 = true;

        //creates images for background and sprites
        var backgroundImg = new Image();
        var menuImg = new Image();        
        var img = new Image();
        var imgLava = new Image();
        var imgCrate = new Image();
        var arrowImg = new Image();
        var coinImg = new Image();

        //creates audio elements
        var jumpSFX = new Audio();
        var backgroundMusic = new Audio();
        var coinSFX = new Audio();

        //creates events for keyup and keydown inputs
        document.body.addEventListener("keydown", function (e) {
            keys[e.keyCode] = true;
            if (e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
                isKeyPressed = true;
            }
        });

        document.body.addEventListener("keyup", function (e) {
            keys[e.keyCode] = false;
            if (e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 37) {
                isKeyPressed = false;
            }
        });

        //sets functions for the game
        window.addEventListener("load", function () {
            start();
            update();

        });

        function start() {

            //sets current game state to main menu
            currentGameState = "Menu";

            //draws canvas and UI for the game
            drawUI();
            drawMenu();

        }


        function update() {
            
            // switches our methods based on which game state
            if (currentGameState == "Game")
            {
                updateGame();
            }            
            else if (currentGameState == "Game Over")
            {
                drawGameOver();               
            }
            else if (currentGameState == "Menu")
            {
                drawMenu();
                updateMenu();
            }
            else if (currentGameState == "Instructions")
            {
                drawInstructions();
            }
            else if (currentGameState == "Pause")
            {
                drawPause();
            }

            //updates the frame
            requestAnimationFrame(update);
        }

        function draw() {

            //draws the game once per frame
            drawBackground();
            drawCanvas();
        }

        function drawBackground() {

            //draws background image based on current state
            ctx1.clearRect(0, 0, width, height);
            if (currentGameState == "Game" || currentGameState == "Pause")
            {
                ctx1.drawImage(backgroundImg, 0, 0, width, height);
            }
            else
            {
                ctx1.drawImage(menuImg, 0, 0, width, height);
            }
        }

        function updateMenu() {

            //calls draw background method
            drawBackground();

            //draws the game scene if enter is pressed
            if (keys[13])
            {
                currentGameState = "Game";
                backgroundMusic.play();
                drawAssets();
                drawCoins();
            }
            //draws the instructions screen if I is pressed
            if (keys[73])
            {
                currentGameState = "Instructions";
                drawInstructions();
            }
            //draws the menu screen if M is pressed
            if (keys[66])
            {
                currentGameState = "Menu";
                drawMenu();
            }
        }

        function drawCanvas() {

            //clears layers
            ctx2.clearRect(0, 0, width, height);
            ctx3.clearRect(0, 0, width, height);

            for (var i = 0; i < platforms.length; i++) {
                // draws the platforms on canvas
                ctx2.rect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
                ctx2.drawImage(imgCrate, platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
            }

            for (var i = 0; i < coins.length; i++) {
                // show the coins on canvas
                ctx2.rect(coins[i].x, coins[i].y, coins[i].width, coins[i].height);
                ctx2.drawImage(coinImg, coins[i].x, coins[i].y, coins[i].width, coins[i].height);
            }

            //draws lava on canvas
            ctx2.rect(lava.x, lava.y, lava.width, lava.height);
            ctx2.drawImage(imgLava, lava.x, lava.y, lava.width, lava.height)

            // checks if movement key is pressed, and draws and stops the sprite animation to canvas
            if (isKeyPressed)
            {
                animationFrame();
                ctx2.drawImage(img, spriteWidth * frameX, spriteHeight * frameY, spriteWidth, spriteHeight, player.x, player.y, player.width, player.height);
            }
            else
            {
                ctx2.drawImage(img, spriteWidth * 2, spriteHeight * 1, spriteWidth, spriteHeight, player.x, player.y, player.width, player.height);
            }

            //draws players score to screen
            ctx3.font = "20px GameBoy";
            ctx3.fillStyle = "blue";
            ctx3.textAlign = "center";
            ctx3.fillText("Score: " + playerScore, 100, 30);

        }

        function drawGameOver() {

            //calculates the highest score between the player score and high score, and saves the highest score in local storage as new high score
            highScore = Math.max(playerScore, highScore);
            localStorage.setItem(localStorageName, highScore);

            //clears canvas
            ctx2.clearRect(0, 0, width, height);
            ctx3.clearRect(0, 0, width, height);

            // draws text on the screen
            ctx3.font = "50px GameBoy";
            ctx3.fillStyle = "yellow";
            ctx3.textAlign = "center";
            ctx3.fillText("Game Over!", width / 2, height / 3 - 100);

            ctx3.fillText("Your score: " + playerScore, width / 2, height / 2 - 100);

            ctx3.fillText("High Score: " + highScore, width / 2, height / 2);

            // draws message to screen if player has new high score
            if (playerScore == highScore)
            {
                ctx3.font = "20px GameBoy";
                ctx3.fillStyle = "red";
                ctx3.fillText("New High Score!", width / 2, height / 2 + 50);
            }

            ctx3.fillStyle = "yellow";
            ctx3.font = "30px GameBoy";
            ctx3.fillText("Press Enter to Replay", width / 2, height / 2 + 150);

            ctx3.fillText("Press 'M' for Menu", width / 2, height / 2 + 250);

            //replays game if enter is pressed
            if (keys[13])
            {
                currentGameState = "Game";
                drawAssets();
                drawCoins();
            }

            //draws the menu if M is pressed
            if (keys[77]) {
                currentGameState = "Menu";
                drawMenu();
            }
        }

        function drawMenu() {

            //clears the canvas
            ctx2.clearRect(0, 0, width, height);
            ctx3.clearRect(0, 0, width, height);

            //draws text to screen
            ctx3.font = "50px GameBoy";
            ctx3.fillStyle = "yellow";
            ctx3.textAlign = "center";
            ctx3.fillText("Ice Escape!", width / 2, height / 2 - 100);

            ctx3.font = "30px GameBoy";
            ctx3.fillText("Press Enter to Play", width / 2, height / 2 + 100);

            ctx3.fillText("Press 'I' for Instructions", width / 2, height / 2 + 200);
        }

        function drawInstructions() {

            //clears the canvas
            ctx3.clearRect(0, 0, width, height);

            //draws text to the canvas
            ctx3.font = "50px GameBoy";
            ctx3.fillStyle = "yellow";
            ctx3.textAlign = "center";
            ctx3.fillText("How To Play", width / 2, height / 5);

            ctx3.font = "15px GameBoy";
            ctx3.fillText("Avoid the lava! Collect coins to slow down the lava", width / 2, height / 2 - 100);

            ctx3.fillText("Press 'b' to go back", width / 2, height - 100);

            ctx3.drawImage(arrowImg, width / 2 - 100, height / 2, 200, 200,);

            // draws the menu screen if B is pressed
            if (keys[66])
            {
                currentGameState = "Menu";
                drawMenu();
            }
        }

        function drawPause() {

            //clears canvas
            ctx3.clearRect(0, 0, width, height);

            //draws a transparent rectangle over the canvas
            ctx3.globalAlpha = 0.7;
            ctx3.fillStyle = "black";
            ctx3.fillRect(0, 0, width, height);
            ctx3.globalAlpha = 1.0;

            //draws text to the screen
            ctx3.font = "50px GameBoy";
            ctx3.fillStyle = "yellow";
            ctx3.textAlign = "center";
            ctx3.fillText("Game Paused", width / 2, height / 5);

            ctx3.font = "20px GameBoy";
            ctx3.fillText("Press Enter To Continue", width / 2, height / 2);

            ctx3.fillText("Press 'M' for Menu", width / 2, height / 2 + 100);

            //continues the game if enter is pressed
            if (keys[13])
            {
                currentGameState = "Game";
            }
            //draws the menu screen if M is pressed
            if (keys[77])
            {
                currentGameState = "Menu";
                drawMenu();
            }

        }

        function drawUI() {

            //loads images from files
            img.src = 'Assets/running-sprite-sheet-2.png';
            backgroundImg.src = "Assets/snow.png";
            menuImg.src = "Assets/snowBackground.png";
            arrowImg.src = "Assets/arrows.png";
            imgCrate.src = 'Assets/icePlatform.png';
            coinImg.src = "Assets/coin.png";
            imgLava.src = "Assets/lava.png";

            //loads audio from files
            jumpSFX.src = "Assets/jump.mp3";
            backgroundMusic.src = "Assets/background.wav";
            coinSFX.src = "Assets/coin.wav";
        }

        function drawAssets() {

            //clears the player score and platform array
            playerScore = 0;
            platforms.length = 0;

            //sets the variables for the player object
            player = {
            x: width / 2,
            y: height / 3,
            width: 50,
            height: 70,
            velX: 0,
            velY: 0
        };

            //sets the variables for the lava object
            lava = {
            x: 0,
            y: height - 200,
            width: width,
            height: 500
        };

            //sets the variables for the platforms and pushes them to the array
            platforms.push({
                x: width / 2,
                y: height / 2,
                width: 150,
                height: 50,
            });
            platforms.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 150,
                height: 50,
            });
            platforms.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 150,
                height: 50,
            });
            platforms.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 150,
                height: 50,
            });
            platforms.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 150,
                height: 50,
            });
            platforms.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 150,
                height: 50,
            });
        }

        function drawCoins() {

                //clears the coin array
                coins.length = 0;

                //sets the variables for the platforms and pushes them to the array
                coins.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 40,
                height: 40
            });
                coins.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 40,
                height: 40
            });
                coins.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 40,
                height: 40
            });
                coins.push({
                x: Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth),
                y: Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight),
                width: 40,
                height: 40
            });

         }

        function updateGame() {

            updateInput();
            checkLavaCol();
            checkCoinCol();

            // checks if player is standing, and sets its velocity and gravity to 0
            if (standing)
            {
                player.velY = 0;
                gravity = 0;
            }

            //checks if player is jumping, decreases y pos by jump velocity and decreases jump velocity
            if (jumping)
            {        
                standing = false;
                player.y -= jumpVelocity;
                jumpVelocity -= 0.5;
            }

            //increases gravity speed by gravity, applies velocity to the player
            gravitySpeed += gravity;
            player.x += player.velX;
            player.y += player.velY + gravitySpeed;

            //increases the player's score every frame
            playerScore++;

            //moves the lava up the screen 
            lava.y = lava.y -= lavaSpeed;

            //updates max height to height of the lava
            maxHeight = lava.y;

            updatePlatform();
            updateCoins();
            draw();

            //draws a new set of coins if coins get covered by lava
            for (var i = 0; i < coins.length; i++)
            {
                if (coins[i].y > lava.y)
                {
                    drawCoins();
                }
            }

            //draws a new set of coins if the player collects them all
            if (coins.length == 0)
            {
                drawCoins();
            }
        }

        function updatePlatform() {

            for (var i = 0; i < platforms.length; i++)
            {
                // draws the platforms on canvas
                ctx2.rect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
                ctx2.drawImage(imgCrate, platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
                //moves platforms down the screen
                platforms[i].y += 0.5;

                // checks for collision with player and platforms
                var dir = colCheck(player, platforms[i]);

                //sets players x vel to 0 when colliding with edges of platform 
                if (dir === "l" || dir === "r")
                {
                    player.velX = 0;
                }
                //sets players y vel to 0 and allows player to jump when colliding with top of platform 
                else if (dir === "b")
                {
                    player.velY = 0;
                    standing = true;
                    jumping = false;
                    canJump = true;
                }
                //sets players y vel to 0 when colliding with bottom of platform
                else if (dir === "t")
                {
                    player.velY = 0;
                }

                //moves the platforms to top of screen if they are covered by lava
                if (platforms[i].y > lava.y)
                {
                    platforms[i].y = -0.8;
                }
            }

            for (var i = 0; i < platforms.length - 3; i++)
            {

                //checks which direction platforms are moving
                if (movingRight1 && !movingLeft1)
                { 
                    //moves the platforms to the right edge of the screen
                    if (platforms[i].x < (width - platforms[i].width - 20))
                    {
                        platforms[i].x += 1.5;
                    }
                    //changes direction when edge of screen is hit
                    else
                    {
                        movingLeft1 = true;
                        movingRight1 = false;
                    }
                }

                if (!movingRight1 && movingLeft1)
                { 
                    //moves platform to left edge of screen
                    if (platforms[i].x >= 0)
                    {
                        platforms[i].x -= 1.5;
                    }
                    else
                    {
                        movingRight1 = true;
                        movingLeft1 = false;
                    }
                }
            }

            for (var i = 3; i < platforms.length; i++)
            {

                if (movingRight2 && !movingLeft2)
                { 
                    if (platforms[i].x < (width - platforms[i].width - 20))
                    {
                        platforms[i].x += 1.5;
                    }
                    else
                    {
                        movingLeft2 = true;
                        movingRight2 = false;
                    }
                }
                if (!movingRight2 && movingLeft2)
                { 
                    if (platforms[i].x >= 0)
                    {
                        platforms[i].x -= 1.5;
                    }
                    else
                    {
                        movingRight2 = true;
                        movingLeft2 = false;
                    }
                }
            }           
        }


        function updateInput() {

            // if up arrow, jump
            if (keys[38])
            {
                if (canJump)
                {
                    jump();
                }
            }
            // if right arrow and player isn't at edge of screen, move player to right
            if (keys[39])
            {
                if (player.x < (canvas.width - player.width - 20))
                {
                    player.velX++;
                }
            }
            // if left arrow and player not at edge of screen, move player to left
            if (keys[37])
            {
                if (player.x > player.width)
                {
                    player.velX--;
                }
            }

            if (keys[27])
            {
                currentGameState = "Pause";
                drawPause();
            }

            //limits player from going past top of screen
            if (player.y <= 0)
            {
                player.y = 0;
            }

            //updates players velocity based on the friction
            player.velX *= friction;
            player.velY *= friction;
        }

        function checkLavaCol() {

            //checks if player has collided with the top of the lava, and ends the game
            var hit = colCheck(player, lava);

            if (hit === "b" )
            {
                currentGameState = "Game Over";
            }
        }

        function checkCoinCol() {

            //checks for collision with player and coins, and removes coin from array
            for (var i = 0; i < coins.length; i++)
            {
                var hit = colCheck(player, coins[i]);

                if (hit != null )
                {
                    coins.splice([i], 1);
                    coinSFX.play();

                    // moves the lava down the screen
                    if (lava.y < height + 200)
                    {
                        lava.y = lava.y + 10;
                    }
                }
            }
        }

        function updateCoins() {

            for (var i = 0; i < coins.length; i++)
            {
                //draws the coins to the canvas
                ctx2.rect(coins[i].x, coins[i].y, coins[i].width, coins[i].height);
                ctx2.drawImage(coinImg, coins[i].x, coins[i].y, coins[i].width, coins[i].height);
            }
        }

        function jump() {

            //checks if player can jump, and sets jump velocity to the max jump height        
            if (canJump)
            {
                jumpSFX.play();
                canJump = false;
                jumping = true;
                jumpVelocity = jumpMax;
            }
        }

        function colCheck(shapeA, shapeB) {
            // get the vectors to check against
            var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
                vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
                // add the half widths and half heights of the objects
                hWidths = (shapeA.width / 2) + (shapeB.width / 2),
                hHeights = (shapeA.height / 2) + (shapeB.height / 2),
                colDir = null;

            // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
            if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
                // figures out on which side of the object is colliding (top, bottom, left, or right)
                var oX = hWidths - Math.abs(vX),
                    oY = hHeights - Math.abs(vY);
                if (oX >= oY) {
                    if (vY > 0) {
                        colDir = "t";
                        
                        shapeA.y += oY;
                    } else {
                        colDir = "b";
                        shapeA.y -= oY;
                    }
                } else {
                    if (vX > 0) {
                        colDir = "l";
                        shapeA.x += oX;
                    } else {
                        colDir = "r";
                        shapeA.x -= oX;
                    }
                }
                return colDir;
            }
            
            return colDir;
        }


        function animationFrame() {

            var elapsed = (Date.now() - startTimeMS) / 1000;
            startTimeMS = Date.now();

            //only update frames when timer is below 0
            frameTimer = frameTimer - elapsed;
            if (frameTimer <= 0) {
                frameTimer = frameTimeMax;
                frameX++;
                if (frameX > frameXMax) {
                    frameX = 0;
                    frameY++;
                    //end of row, move down to next row in sheet
                    if (frameY > frameYMax) {
                        frameY = 0;
                    }
                }
                frame++;
                //reset frames to 0 in event that there are empty spaces on sprite sheet
                if (frame > frameMax) {
                    frame = 0;
                    frameX = 0;
                    frameY = 0;
                }
            }

        }

