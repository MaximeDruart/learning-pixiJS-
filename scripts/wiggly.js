let Application = PIXI.Application,
	loader = PIXI.loader,
	resources = PIXI.loader.resources,
	Sprite = PIXI.Sprite,
	Graphics = PIXI.Graphics

const app = new Application({
	width: window.innerWidth,
	height: window.innerHeight * 2,
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
	},
	fill: false
}

function setup() {
	bg = new Sprite(resources["./images/img.jpg"].texture)
	bg.scale.set(1.1, 1.1)
	bg.anchor.set(0.5, 0.5)
	bg.x = window.innerWidth / 2
	bg.y = window.innerHeight / 2

	mask = new PIXI.Graphics()
	app.stage.addChild(mask)
	mask.x = window.innerWidth / 2
	mask.y = window.innerHeight / 2
	mask.lineStyle(0)

	app.ticker.speed = 0.1
	app.ticker.add(() => {
		yOffset += c.yOffsetIncrement
		c.size.value += map(noise.simplex3(0, 0, yOffset), -1, 1, -0.25, 0.25)
		c.size.value = constrain(c.size.value, c.size.baseValue - c.size.variation, c.size.baseValue + c.size.variation)

		const getCircle = data => {
			let points = []
			for (let i = 0; i < data.vertexCount; i++) {
				let angleRad = ((i / data.vertexCount) * 360 * Math.PI) / 180
				let angleDeg = (i / data.vertexCount) * 360
				let noiseVal = map(noise.simplex2(angleDeg, yOffset), -1, 1, 1 - data.noiseStrength, 1 + data.noiseStrength)
				let x = Math.cos(angleRad) * data.size.value * noiseVal
				let y = Math.sin(angleRad) * data.size.value * noiseVal

				points.push({ x, y })
			}
			return points
		}

		const draw = (graphics, points) => {
			graphics.clear()
			graphics.lineStyle(15, 0xffffff)
			c.fill && graphics.beginFill(0xffffff)

			// https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
			graphics.moveTo(points[0].x, points[0].y)
			for (let i = 1; i <= points.length - 2; i++) {
				const xc = (points[i].x + points[i + 1].x) / 2
				const yc = (points[i].y + points[i + 1].y) / 2
				graphics.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
			}
			// curve through the last two points
			let xc = (points[points.length - 1].x + points[0].x) / 2
			let yc = (points[points.length - 1].y + points[0].y) / 2
			graphics.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, xc, yc)
			xc = (points[0].x + points[1].x) / 2
			yc = (points[0].y + points[1].y) / 2
			graphics.quadraticCurveTo(points[0].x, points[0].y, xc, yc)

			c.fill && graphics.endFill()
			// bg.mask = graphics
		}

		let points = getCircle(c)
		draw(mask, points)
	})

	window.addEventListener("mousemove", e => {
		let distanceToCenter = {
			x: ((app.screen.width / 2 - Math.abs(app.screen.width / 2 - e.clientX)) / app.screen.width) * 2,
			y: ((app.screen.height / 2 - Math.abs(app.screen.height / 2 - e.clientY)) / app.screen.height) * 2
		}
		c.yOffsetIncrement = map(distanceToCenter.x * distanceToCenter.y, 0, 1, 0.01, 0.05)
	})

	window.addEventListener("mousedown", () => {
		let tl = gsap.timeline({ ease: Power1.easeInOut, onComplete: filter })
		tl.to(c.size, 1, {
			ease: Power1.easeInOut,
			baseValue: 0,
			variation: 0,
			onComplete: function() {
				app.stage.addChild(bg)
				c.fill = true
				bg.mask = mask
			}
		})
		tl.to(c.size, 1, { ease: Power1.easeInOut, baseValue: 230, variation: 15 })
	})

	window.addEventListener("keydown", () => {
		let openTl = gsap.timeline({ ease: Power2.easeInOut })
		openTl.to(c, 0.8, { noiseStrength: 0.6 })
		openTl.to(c.size, 0.2, { baseValue: c.size.baseValue * 0.7, delay: -0.2 })
		openTl.to(c.size, 1, { ease: Power2.easeIn, baseValue: window.innerWidth })
	})

	const filter = () => {
		let colorTl = gsap.timeline({ ease: "linear", paused: true, repeat: -1, yoyo: true, delay: 2 })
		// colorTl.to(bg, 1, { pixi: { colorize: "red" } })
		// colorTl.to(bg, 1, { delay: -0.5, pixi: { contrast: "3" } })
		// colorTl.to(bg, 1, { delay: -0.3, pixi: { brightness: "3" } })
		// colorTl.addLabel("sync")
		// colorTl.to(bg, 1, { pixi: { blurX: 10 } })
		// colorTl.to(bg, 1, { pixi: { blurY: 10 } })
	}

	app.renderer.render(app.stage)
}
