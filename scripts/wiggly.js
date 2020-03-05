let Application = PIXI.Application,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  Graphics = PIXI.Graphics

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  //   transparent: true,
  backgroundColor: 0x131313,
  resolution: 1
})

document.body.appendChild(app.view)
loader.add("./images/img.jpg").load(setup)

const map = (n, start1, stop1, start2, stop2) => ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
const constrain = (n, low, high) => Math.max(Math.min(n, high), low)
noise.seed(Math.random())

let yOffset = 0
const c = {
  noiseStrength: 0.07,
  vertexCount: 30,
  yOffsetIncrement: 0.01,
  size: {
    value: 230,
    baseValue: 230,
    variation: 15
  }
}

const listenToMouseEvents = () => {
  window.addEventListener("mousemove", e => {
    let distanceToCenter = {
      x: ((app.screen.width / 2 - Math.abs(app.screen.width / 2 - e.clientX)) / app.screen.width) * 2,
      y: ((app.screen.height / 2 - Math.abs(app.screen.height / 2 - e.clientY)) / app.screen.height) * 2
    }
    c.yOffsetIncrement = map(distanceToCenter.x * distanceToCenter.y, 0, 1, 0.01, 0.05)
  })
}

function setup() {
  bg = new Sprite(resources["./images/img.jpg"].texture)
  bg.scale.set(0.85, 0.85)
  bg.anchor.set(0.5, 0.5)
  bg.x = window.innerWidth / 2
  bg.y = window.innerHeight / 2
  //   app.stage.addChild(bg)

  mask = new PIXI.Graphics()
  app.stage.addChild(mask)
  // mask.anchor.set(0.5, 0.5)
  mask.x = window.innerWidth / 2
  mask.y = window.innerHeight / 2
  mask.lineStyle(0)
  // mask.moveTo(0, 0)
  // mask.moveTo(app.screen.width / 2, app.screen.height / 2)

  app.ticker.speed = 0.1
  app.ticker.add(() => {
    yOffset += c.yOffsetIncrement
    c.size.value += map(noise.simplex3(0, 0, yOffset), -1, 1, -0.25, 0.25)
    c.size.value = constrain(c.size.value, c.size.baseValue - c.size.variation, c.size.baseValue + c.size.variation)

    let points = []
    const getCircle = () => {
      for (let i = 0; i < c.vertexCount; i++) {
        let angleRad = ((i / c.vertexCount) * 360 * Math.PI) / 180
        let angleDeg = (i / c.vertexCount) * 360
        let noiseVal = map(noise.simplex2(angleDeg, yOffset), -1, 1, 1 - c.noiseStrength, 1 + c.noiseStrength)
        let x = Math.cos(angleRad) * c.size.value * noiseVal
        let y = Math.sin(angleRad) * c.size.value * noiseVal

        points.push({ x, y })
      }
    }

    getCircle()

    mask.clear()
    mask.lineStyle(6, 0xffffff)
    // mask.beginFill(0)

    // https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas

    mask.moveTo(points[0].x, points[0].y)

    for (let i = 1; i <= points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2
      const yc = (points[i].y + points[i + 1].y) / 2
      mask.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
    }
    // curve through the last two points
    let xc = (points[points.length - 1].x + points[0].x) / 2
    let yc = (points[points.length - 1].y + points[0].y) / 2
    mask.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, xc, yc)
    xc = (points[0].x + points[1].x) / 2
    yc = (points[0].y + points[1].y) / 2
    mask.quadraticCurveTo(points[0].x, points[0].y, xc, yc)

    mask.endFill()
    // bg.mask = mask
  })

  listenToMouseEvents()

  app.renderer.render(app.stage)
}
