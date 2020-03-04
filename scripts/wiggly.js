let Application = PIXI.Application,
	loader = PIXI.loader,
	resources = PIXI.loader.resources,
	Sprite = PIXI.Sprite,
	Graphics = PIXI.Graphics

const app = new Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true,
	transparent: true,
	resolution: 1
})

document.body.appendChild(app.view)

let yOffset = 0
const c = {
	noiseStrength: 0.13,
	vertexCount: 23,
	yOffsetIncrement: 0.01,
	size: {
		value: 230,
		baseValue: 230,
		variation: 30
	},
	stroke: {
		size: 15,
		baseSize: 15,
		variation: 8
	}
}

const map = function(n, start1, stop1, start2, stop2) {
	return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}

let bg, mask
loader.add("./images/img.jpg").load(setup)
let pn = new Perlin("planting my seed owo")
function setup() {
	bg = new Sprite(resources["./images/img.jpg"].texture)
	bg.scale.set(0.85, 0.85)
	bg.anchor.set(0.5, 0.5)
	bg.x = window.innerWidth / 2
	bg.y = window.innerHeight / 2
	app.stage.addChild(bg)

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
		c.stroke.size += pn.noise(yOffset, 0, 0) * 2 - 1
		c.stroke.size = _.clamp(
			c.stroke.size,
			c.stroke.baseSize - c.stroke.variation,
			c.stroke.baseSize + c.stroke.variation
		)
		c.size.value += pn.noise(0, 0, yOffset) * 2 - 1
		c.size.value = _.clamp(
			c.size.value,
			c.size.baseValue - c.size.variation,
			c.size.baseValue + c.size.variation
		)

		mask.clear()
		mask.lineStyle(1, 0)
		mask.beginFill(0x8bc5ff, 0.4)
		let previousValue = [0, 0]
		let firstValue = [0, 0]
		for (let i = 0; i < c.vertexCount; i++) {
			let angle = ((i / c.vertexCount) * 360 * Math.PI) / 180
			let xValue =
				Math.cos(angle) *
				c.size.value *
				map(
					pn.noise(angle, yOffset, 0),
					0,
					1,
					1 - c.noiseStrength,
					1 + c.noiseStrength
				)
			let yValue =
				Math.sin(angle) *
				c.size.value *
				map(
					pn.noise(angle, yOffset, 0),
					0,
					1,
					1 - c.noiseStrength,
					1 + c.noiseStrength
				)
			if (i === 0) {
				mask.moveTo(xValue, yValue)
				firstValue = [xValue, yValue]
			}
			// mask.quadraticCurveTo(xValue * 1.6, yValue * 1.6, xValue, yValue)
			mask.lineTo(xValue, yValue)
			// mask.arcTo(previousValue[0], previousValue[1], xValue, yValue)
			previousValue = [xValue, yValue]
		}
		// mask.lineTo(firstValue[0], firstValue[1])
		mask.closePath()
		mask.endFill()
		// bg.mask = mask
	})

	app.renderer.render(app.stage)
}
