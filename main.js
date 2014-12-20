var mainState = {
    // We define the 3 default Phaser functions
    preload: function() {
        // This function will be executed at the beginning
        // That's where we load the game's assets
        game.load.image('player', 'assets/player.png');
        
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        
        game.load.image('coin', 'assets/coin.png');
        
        game.load.image('enemy', 'assets/enemy.png');
    },
    create: function() {
        // This function is called after the preload function
        // Here we set up the game, display sprites, etc.
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.stage.backgroundColor = '#3498db';
        
        this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        
        // Tell Phaser the player will use the Arcade physics engine
        game.physics.arcade.enable(this.player);
        
        // Add vertical gravity to the player
        this.player.body.gravity.y = 500;
        
        // Control character with arrow keys
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.createWorld();
        
        // Display the coin
        this.coin = game.add.sprite(60, 140, 'coin');
        
        // Add Arcade physics to the coin
        game.physics.arcade.enable(this.coin);
        
        // Set the anchor point of the coint to its center
        this.coin.anchor.setTo(0.5, 0.5);
        
        // Display the score
        this.scoreLabel = game.add.text(30, 30, 'score: 0',
                                        {font: '18px Arial', fill: '#ffffff'});
        // Initialize the score variable
        this.score = 0;
        
        // Create an enemy group with Arcade physics
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        
        // Create 10 enemies with the 'enemy' image in the group
        // The enemies are 'dead' by default, so they are not visible in the game
        this.enemies.createMultiple(10, 'enemy');
        
        // Call 'addEnemy' every 2.2 seconds
        game.time.events.loop(2200, this.addEnemy, this);
    },
    update: function() {
        // This function is called 60 times per second
        // It contains the game's logic
        game.physics.arcade.collide(this.player, this.walls);
        
        this.movePlayer();
        
        if (!this.player.inWorld) {
            this.playerDie();
        }
        
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        
        // Make the enemies and wall collide
        game.physics.arcade.collide(this.enemies, this.walls);
        
        // Call the 'playerDie' function when the player and enemy overlap
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
    },
    
    // And here we will later add some of our own functions
    movePlayer: function() {
        // If the left arrow key is pressed
        if (this.cursor.left.isDown) {
            // Move the player to the left
            this.player.body.velocity.x = -200;
        }
        
        // If the right arrow key is pressed
        else if (this.cursor.right.isDown) {
            // Move the player to the right
            this.player.body.velocity.x = 200;
        }
        
        // If neither the right or left arrow key is pressed
        else {
            // Stop the player
            this.player.body.velocity.x = 0;
        }
        
        // If the up arrow key is pressed and the player is touching ground
        if (this.cursor.up.isDown && this.player.body.touching.down) {
            // Move the player upward (jump)
            this.player.body.velocity.y = -320;
        }
    },
    
    createWorld: function() {
        // Create our wall group with Arcade physics
        this.walls = game.add.group();
        this.walls.enableBody = true;
        
        // Create the 10 walls
        game.add.sprite(0, 0, 'wallV', 0, this.walls); // left
        game.add.sprite(480, 0, 'wallV', 0, this.walls); // right
        
        game.add.sprite(0, 0, 'wallH', 0, this.walls); // top left
        game.add.sprite(300, 0, 'wallH', 0, this.walls); // top right
        game.add.sprite(0, 320, 'wallH', 0, this.walls); // bottom left
        game.add.sprite(300, 320, 'wallH', 0, this.walls); // bottom right
        
        game.add.sprite(-100, 160, 'wallH', 0, this.walls); // middle left
        game.add.sprite(400, 160, 'wallH', 0, this.walls); // middle right
        
        var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);
        
        // Set all walls to immovable
        this.walls.setAll('body.immovable', true);
    },
    
    playerDie: function() {
        game.state.start('main');
    },
    
    takeCoin: function(player, coin) {
        // Increate the score by 5
        this.score += 5;
        
        // Update the score label
        this.scoreLabel.text = 'score: ' + this.score;
        
        // Change the coin position
        this.updateCoinPosition();
    },
    
    updateCoinPosition: function() {
        // Store all the possible coin positions in an array
        var coinPosition = [
            {x: 140, y: 60}, {x: 360, y: 60}, // top row
            {x: 60, y: 140}, {x: 440, y: 140}, // middle row
            {x: 130, y: 300}, {x: 370, y: 300} // bottom row
        ];
        
        // Remove the current coin position from the array
        // Otherwise the coin could appear at the same spot twice in a row
        
        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x === this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }
        
        // Randomly select a position from the array
        var newPosition = coinPosition[
            game.rnd.integerInRange(0, coinPosition.length-1)];
        
        // Set the new position of the coin
        this.coin.reset(newPosition.x, newPosition.y);
    },
    
    addEnemy: function() {
        // Get the first dead enemy of the group
        var enemy = this.enemies.getFirstDead();
        
        // If there isn't any dead enemy, do nothing
        if (!enemy) {
            return;
        }
        
        // Initialize the enemy
        // Set the anchor point centered at the bottom
        enemy.anchor.setTo(0.5, 1);
        
        // Put the enemy above the top hole
        enemy.reset(game.world.centerX, 0);
        
        // Add gravity to see it fall
        enemy.body.gravity.y = 500;
        
        // Make the enemy move either right or left, randomly
        enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
        
        // Bounce the enemy in the opposite direction when it hits a wall
        enemy.body.bounce.x = 1;
        
        // Kill the enemy when it leave the game world
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    }
};

// Create a 500px by 340px game in the 'gameDiv' element of index.html
var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');

// Add the 'mainState' to Phaser, and call it 'main'
game.state.add('main', mainState);
game.state.start('main');