<template>
	<Teleport to="body">
		<div
			@click="clickOnBottomSheet"
			class="bottom-sheet shadow-xl"
			:class="{
				opened: opened,
				closed: opened === false,
				moving: moving,
			}"
			style="{'pointer-events': 'all'}"
			ref="bottomSheet"
		>
			<div
				class="backdrop-blur-md bottom-sheet__backdrop"
				ref="backdrop"
			/>
			<div
				class="bg-white dark:bg-gray-800 bottom-sheet__card fx-default md:max-w-lg lg:max-w-2xl"
				:style="[
					{
						bottom: cardP + 'px',
						maxHeight: maxHeight + '%',
					},
					{ height: 'auto' },
					{ 'padding-bottom': paddingBottom + 'px' },
				]"
				id="detail-card"
				ref="card"
			>
				<div class="bottom-sheet__pan" ref="pan">
					<div class="bottom-sheet__bar bg-gray-300 dark:bg-white" />
					<div class="dark:text-white p-3 mt-auto border-b-2">
						<div
							class="text-gray-400 text-md dark:text-gray-300 sm:ml-auto sm:order-last"
						>
							<slot name="extra-title-content"
								>Extra title content</slot
							>
						</div>
						<div>
							<div
								class="text-gray-600 text-2xl font-semibold dark:text-white"
							>
								<slot name="title"
									>Some title for the card</slot
								>
							</div>
							<div
								class="text-gray-400 text-md dark:text-gray-300 pb-auto"
							>
								<slot name="subtitle"
									>A subtitle for the card. This should be
									somewhat longer</slot
								>
							</div>
						</div>
					</div>
				</div>
				<div
					style="min-height: 40vh; min-height: 40svh"
					class="bottom-sheet__content min-h-[40vh] lg:min-h-[70vh]"
					:style="{ height: contentH }"
					ref="content"
				>
					<div
						class="container my-3 text-sm text-gray-700 dark:text-white px-auto"
					>
						<slot name="inner-content">
							Here goes the main content of the card. Lorem ipsum
							dolor sit, amet consectetur adipisicing elit.
							Dolorem alias, maiores ad dolor cum culpa similique
							voluptatibus. Molestias laudantium dolorum minus
							eaque minima qui, autem, veritatis earum pariatur,
							accusantium fugit.
						</slot>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script>
import { useEventListener } from "@vueuse/core";

export default {
	name: "DetailCard",
	data() {
		return {
			initiated: false,
			maxHeight: 85,
			opened: false,
			moving: false,
			cardP: null,
			cardH: null,
			drag: null,
			tl: null,
			contentH: "auto",
			paddingBottom: 12,
		};
	},
	methods: {
		init() {
			this.drag?.applyBounds({ maxY: 0, minY: 0 });
			this.cardP = 0;
			this.cardH = this.$refs.card.clientHeight;
			this.contentH = `${this.cardH - this.$refs.pan.clientHeight}px`;
			if (!this.initiated) {
				this.initiated = true;
				const tl = this.$gsap.timeline();
				tl.from(this.$refs.card, {
					y: this.cardH,
					opacity: 0,
					duration: 0.4,
					ease: "power3",
				}).from(this.$refs.backdrop, { opacity: 0, duration: 0.3 }, 0);
				this.tl = tl;
				let startY = 0;
				const drag = this.$drag.create(this.$refs.card, {
					type: "y",
					trigger: this.$refs.pan,
					bounds: {
						maxY: 0,
						minY: 0,
					},
					liveSnap: (value) => {
						return value < 0 ? 0 : value;
					},
					inertia: true,
					edgeResistance: 0,
					autoScroll: 0,
					onPress: () => {
						startY = this.drag.pointerY;
					},
					onDrag: () => {
						let deltaY = startY - this.drag.pointerY;
						if (deltaY > 0) {
							this.$gsap.set(this.$refs.card, {
								"border-bottom": `${
									deltaY / 5
								}px solid transparent`,
							});
						}
					},
					onDragEnd: () => {
						this.$gsap.set(this.$refs.card, {
							"border-bottom": `0px solid transparent`,
						});
						let deltaY = startY - this.drag.pointerY;
						if (deltaY < -150) {
							this.close(deltaY);
						}
					},
				});
				this.drag = drag[0];
			} else {
				this.tl.restart();
			}
		},
		open() {
			this.init();
			this.opened = true;
			document.body.style.overflowY = "hidden";
			this.$emit("cardOpened");
		},
		close(deltaY) {
			if (this.opened) {
				document.body.style.overflowY = "";
				if (deltaY != null) {
					const tl = this.$gsap.timeline();
					tl.fromTo(
						this.$refs.card,
						{ y: -deltaY },
						{ y: this.cardH - deltaY, opacity: 0, duration: 0.4 }
					).to(
						this.$refs.backdrop,
						{ opacity: 0, duration: 0.3 },
						0.1
					);
					tl.eventCallback("onComplete", function () {
						this.kill();
					});
				} else {
					this.tl.reverse();
				}
				this.opened = false;
				this.$emit("cardClosed");
			}
		},
		clickOnBottomSheet(event) {
			if (
				event.target.classList.contains("bottom-sheet__backdrop") ||
				event.target.classList.contains("bottom-sheet")
			) {
				this.close();
			}
		},
	},
	props: {
		isOpen: Boolean,
	},
	watch: {
		isOpen(value) {
			if (value) {
				this.open();
			} else {
				this.close();
			}
		},
	},
	inject: [],
	emits: ["cardOpened", "cardClosed"],
	beforeUnmount() {
		this.tl?.kill();
		this.drag?.kill();
	},
	mounted() {
		useEventListener("keyup", (event) => {
			if (event.key == "Escape") {
				this.close();
			}
		});
	},
};
</script>

<style scoped>
.bottom-sheet * {
	box-sizing: content-box;
}
.bottom-sheet {
	z-index: 100;
	position: relative;
	overscroll-behavior: none !important;
}
.bottom-sheet__content {
	overflow-y: scroll;
	overscroll-behavior: contain !important;
}
.bottom-sheet__backdrop {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 100;
	opacity: 1;
	visibility: hidden;
}
.bottom-sheet__card {
	width: 100%;
	position: fixed;
	border-radius: 14px 14px 0 0;
	left: 50%;
	z-index: 100;
	margin: 0 auto;
}
.bottom-sheet__card.stripe {
	padding-bottom: 15px;
}
.bottom-sheet__card.fx-default {
	transform: translate(-50%, 0);
}
.bottom-sheet__pan {
	padding-bottom: 8px;
	padding-top: 12px;
}
.bottom-sheet__bar {
	display: block;
	width: 35px;
	height: 3px;
	border-radius: 14px;
	margin: 0 auto;
	cursor: grab;
}
.bottom-sheet__bar:active {
	cursor: grabbing;
}
.opened {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
.opened .bottom-sheet__backdrop {
	visibility: visible;
}
</style>
