<template>
<Teleport to="body">
  <div v-on="handlers" class="bottom-sheet shadlw-lg" :class="{opened: opened, closed: opened === false, moving:moving}" style="{'pointer-events': 'all'}" ref="bottomSheet">
    <div class="backdrop-blur-md bottom-sheet__backdrop" ref="backdrop" />
    <div class="bg-white dark:bg-gray-800 bottom-sheet__card fx-default" :style="[{ bottom: cardP+'px', maxWidth: '640px', maxHeight: maxHeight+'%'},{'height': 'auto'},{'pointer-events': 'all'}, {'padding-bottom': paddingBottom+'px'}]" id='detail-card' ref="card">
      <div class="bottom-sheet__pan" ref="pan">
        <div class="bottom-sheet__bar bg-gray-300 dark:bg-white" />
        <div class="dark:text-white p-3 mt-auto border-b-2">
          <div class="text-gray-400 text-md dark:text-gray-300 sm:ml-auto sm:order-last">
            <slot name="extra-title-content">Extra title content</slot>
          </div>
          <div>
            <div class="text-gray-600 text-2xl font-semibold dark:text-white">
              <slot name="title">Some title for the card</slot>
            </div>
            <div class="text-gray-400 text-md dark:text-gray-300 pb-auto">
              <slot name="subtitle">A subtitle for the card. This should be somewhat longer</slot>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-sheet__content lg:min-h-[60vh]" :style="{height: contentH}" ref="content">
        <div class="container p-3 mt-3 text-sm text-gray-700 dark:text-white">
          <slot name="inner-content">
            Here goes the main content of the card.
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorem alias, maiores ad dolor cum culpa similique voluptatibus. Molestias laudantium dolorum minus eaque minima qui, autem, veritatis earum pariatur, accusantium fugit.
          </slot>
        </div>
      </div>
    </div>
  </div>
</Teleport>
</template>

<script>

export default {
  name: 'DetailCard',
  data () {
    const vm = this;
    return {
      initiated: false,
      maxHeight: 85,
      opened: false,
      contentScroll: 0,
      moving: false,
      cardP: null,
      cardH: null,
      tl: null,
      contentH: "auto",
      handlers: {
        mousedown: vm.clickOnBottomSheet,
        touchstart: vm.clickOnBottomSheet
      },
      paddingBottom: 12,
    }
  },
  computed: {
  },
  methods: {
    init () {
      this.cardP = 0;
      this.cardH = this.$refs.card.clientHeight;
      this.contentH = `${this.cardH - this.$refs.pan.clientHeight}px`;
      if (!this.initiated) {
        this.initiated = true;
      const tl = this.$gsap.timeline();
      tl
        .from(this.$refs.card, {y: this.cardH, duration: 0.4, ease: 'power2'})
        .from(this.$refs.backdrop, {opacity: 0, duration: 0.3}, 0)
      this.tl = tl;
        let startY = 0;
        this.$drag.create(this.$refs.card, {
          type: 'y',
          trigger: this.$refs.pan,
          bounds: {
            maxY: 0,
            minY: 0,
          },
          edgeResistance: 0,
          snap: {top: startY},
          onDragStart: event => {startY = event.y},
          onMove: function (event) {
            let deltaY = startY - event.y;
            if (deltaY > 0) {
              this.endDrag(event);
            }
          },
          onDragEnd: event => {
            let deltaY = startY - event.y;
            if (deltaY < - 150) {
              this.close(deltaY);
            }
          },
        })
      } else {
        this.tl.restart();
      }
    },
    open () {
      this.init()
      this.opened = true;
      document.body.style.overflow = "hidden";
      this.$emit("cardOpened");
  },
    close (deltaY) {
      if (this.opened) {
        document.body.style.overflow = "";
        if (deltaY) {
          const tl = this.$gsap.timeline();
          tl
            .to(this.$refs.card, { y: this.cardH - deltaY, duration: 0.4 })
            .to(this.$refs.backdrop, { opacity: 0, duration: 0.3 }, 0.1)
        } else {
          this.tl.reverse()
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
    isOpen (value) {
      if (value) {
        this.open();
      } else {
        this.close();
      }
    }
  },
  inject: [
  ],
  emits: [
    'cardOpened',
    'cardClosed',
  ],
  beforeUnmount () {
  },
  mounted () {
  },
}
</script>

<style scoped>
.bottom-sheet * {
  box-sizing: border-box;
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
  padding-bottom: 20px;
}
.bottom-sheet__card.fx-default {
  transform: translate(-50%,0);
}
.bottom-sheet__pan {
  padding-bottom: 20px;
  padding-top: 15px;
}
.bottom-sheet__bar {
  display: block;
  width: 40px;
  height: 3px;
  border-radius: 14px;
  margin: 0 auto;
  cursor: grab;
}
.bottom-sheet__bar:active{
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
