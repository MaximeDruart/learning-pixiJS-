let Application = PIXI.Application,
	loader = PIXI.loader,
	resources = PIXI.loader.resources,
	Sprite = PIXI.Sprite

const app = new Application({
	width: window.innerWidth,
	height: window.innerHeight,
	antialias: true,
	transparent: false,
	resolution: 1
})

document.body.appendChild(app.view)

loader.add("./images/img.jpg").load(setup)

function setup() {
	let bg = new Sprite(resources["./images/img.jpg"].texture)
	bg.scale.set(0.5, 0.5)
	bg.anchor.set(0.5, 0.5)
	bg.x = window.innerWidth / 2
	bg.y = window.innerHeight / 2
	// bg.rotation = Math.PI
	app.stage.addChild(bg)

	app.renderer.render(app.stage)
}
