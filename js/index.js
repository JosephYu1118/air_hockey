// ====================
//      CLASS_GameObject
// ==============================
var GameObject = function(selector, size, position){
  this.$el = $(selector)
  this.size = size
  this.position = position
  this.updateCss()
}

GameObject.prototype.updateCss = function(){
  this.$el.css({
    width: this.size.width + "px", 
    height: this.size.height + "px",  
    top: this.position.y + "px", 
    left: this.position.x + "px"
  })
}

GameObject.prototype.collide = function(other_object){
  let pos = other_object.position
  let range_x = (pos.x >= this.position.x - 25) && (pos.x <= this.position.x + this.size.width + 25)
  let range_y = (pos.y >= this.position.y + 10) && (pos.y <= this.position.y + this.size.height - 10)
  return range_x && range_y
}

// ====================
//      CLASS_Puck
// ==============================
var Puck = function(){
  this.size = {
    width: 40, 
    height: 40
  }
  this.initialPosition()
  GameObject.call(this, ".puck", this.size, this.position)
  // 因為球只有一個，所以可以在初始化的時候就給他寫死
}

Puck.prototype = Object.create(GameObject.prototype)
Puck.prototype.constructor = Puck.constructor
// 繼承的三大步驟

Puck.prototype.updatePosition = function(){
  this.position.x += this.velocity.x
  this.position.y += this.velocity.y
  this.updateCss()
  if(this.position.x < 0 || this.position.x > 450){
    this.velocity.x = -this.velocity.x
  }
  if(this.position.y < 0 || this.position.y > 500){
    this.velocity.y = -this.velocity.y
  }
}

Puck.prototype.initialPosition = function(){
  let speed = 8, 
      angle = Math.random() * Math.PI * 2
  // 記得 Math.random() 是方法，而 Math.PI 只是屬性
  this.position = {
    x: 250, 
    y: 250
  }
  this.velocity = {
    x: speed * Math.cos(angle), 
    y: speed * Math.sin(angle)
  }
}

// ====================
//      CLASS_Mallet
// ==============================
var Mallet = function(selector, position){
  this.size = {
    width: 50, 
    height: 50
  }
  GameObject.call(this, selector, this.size, position)
  // 因為板子有兩個，所以只要先將 size 定義出來就好
}

Mallet.prototype = Object.create(GameObject.prototype)
Mallet.prototype.constructor = Mallet.constructor

Mallet.prototype.updatePosition = function(){
  if(this.position.x < 0){
    this.position.x = 0
  }
  if(this.position.x + this.size.width > 500){
    this.position.x = 500 - this.size.width
  }
  this.updateCss()
}

// ====================
//      CLASS_GameRule
// ==============================
var GameRule = function(){
  this.timer = null
  this.score = 0
  this.initialControl()
  this.control = {}
}

GameRule.prototype.countDown = function(){
  let count = 3
  puck.initialPosition()
  $(".btn_start").hide()
  $(".infomation").text("Ready")
  this.timer = setInterval(() => {
    $(".infomation").text(count)
    if(count <= 0){
      clearInterval(this.timer)
      $(".infomation_box").hide(300)
      this.startGame()
    }
    count--
  }, 1000)
}

GameRule.prototype.startGame = function(){
  this.timer = setInterval(() => {
    if(mallet_computer.collide(puck)){
      puck.velocity.y = Math.abs(puck.velocity.y)
      puck.velocity.x *= 1.1
      puck.velocity.y *= 1.1
      puck.velocity.x += 0.5 - Math.random()
      puck.velocity.y += 0.5 - Math.random()
    }
    if(mallet_player.collide(puck)){
      puck.velocity.y = -Math.abs(puck.velocity.y)
      this.score += 10
    }
    if(puck.position.y <= 0){
      this.endGame("You Win!")
    }
    if(puck.position.y >= 500){
      this.endGame("You Lose!")
    }
    if(this.control["ArrowLeft"]){
      mallet_player.position.x -= 12
    }
    if(this.control["ArrowRight"]){
      mallet_player.position.x += 12
    }
    
    mallet_computer.position.x += (puck.position.x > mallet_computer.position.x + mallet_computer.size.width / 2 + 5) ? 12 : 0
    mallet_computer.position.x += (puck.position.x < mallet_computer.position.x + mallet_computer.size.width / 2 - 5) ? -12 : 0
    
    puck.updatePosition()
    mallet_computer.updatePosition()
    mallet_player.updatePosition()
    $(".score").text("Score: " + this.score)
  }, 30)
  // setInterval() 裡的 this 會指向這個函式本身，因此如果要指向 Game 的話，必須先把外層的 this 存起來，或是直接使用箭頭函式
}

GameRule.prototype.endGame= function(result){
  clearInterval(this.timer)
  $(".infomation_box").show(300)
  $(".infomation").html(result + "<br>Your Score: " + this.score)
  $(".btn_start").show()
  this.score = 0
}

GameRule.prototype.initialControl = function(){
  $(window).keydown(event => {
    this.control[event.key] = true
    // 由於 event.key 已有一個 . ，因此要再繼續選擇其物件的屬性時，需加上 [] 來表達
    console.log(event.key)
    console.log(this.control)
    // keydown() 裡的 this 會指向這個函式本身，因此如果要指向 Game 的話，必須先把外層的 this 存起來，或是直接使用箭頭函式
  })
  $(window).keyup(event => {
    this.control[event.key] = false
    console.log(event.key)
    console.log(this.control)
  })
}

// ====================
//      OBJECT_puck
// ==============================
var puck = new Puck()

// ====================
//      OBJECT_mallet
// ==============================
var mallet_computer = new Mallet(
  ".mallet_computer", {x: 0, y: 25}
)
var mallet_player = new Mallet(
  ".mallet_player", {x: 0, y: 425}
)

// ====================
//      OBJECT_game_rule
// ==============================
var game_rule = new GameRule()