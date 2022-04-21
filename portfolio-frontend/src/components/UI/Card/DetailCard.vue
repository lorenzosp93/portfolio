<template>
<Teleport to="body">
  <div v-on="handlers" class="bottom-sheet shadlw-lg" :class="{opened: opened, closed: opened === false, moving:moving}" style="{'pointer-events': 'all'}" ref="bottomSheet">
    <div class="backdrop-blur-md bottom-sheet__backdrop" />
    <div class="bg-white dark:bg-gray-800 bottom-sheet__card fx-default" :class="{stripe: stripe}" :style="[{ bottom: cardP+'px', maxWidth: '640px', maxHeight: maxHeight+'%'},{'height': 'auto'},{'pointer-events': 'all'}, {'padding-bottom': paddingBottom+'px'}]" id='detail-card' ref="card">
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
      <div class="bottom-sheet__content" :style="{height: contentH}" ref="content">
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
import Hammer from "hammerjs";

export default {
  name: 'DetailCard',
  data () {
    const vm = this;
    return {
      initiated: false,
      opened: false,
      contentScroll: 0,
      moving: false,
      cardP: null,
      cardH: null,
      contentH: "auto",
      hammer: {
        pan: null,
        content: null,
      },
      stripe: 0,
      handlers: {
        mousedown: vm.clickOnBottomSheet,
        touchstart: vm.clickOnBottomSheet
      },
      paddingBottom: 12,
    }
  },
  computed: {
    maxHeight () {
      return 85 + (this.paddingBottom > 12 ? 5 : 0)
    },
  },
  methods: {
    hasNotch () {
      let iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
      let aspect = window.screen.width / window.screen.height;
      return iPhone && aspect.toFixed(3) === "0.462";
    },
    init () {
      return new Promise(resolve => {
        this.stripe = this.hasNotch() ? 20 : 0;
        this.cardH = this.$refs.card.clientHeight;
        this.contentH = `${this.cardH - this.$refs.pan.clientHeight}px`;
        this.cardP =  -this.cardH - this.stripe;
        if (!this.initiated) {
          this.initiated = true;
          let options = {
            recognizers: [
              [Hammer.Pan, {direction: Hammer.DIRECTION_VERTICAL}]
            ]
          }
          this.hammer.pan = new Hammer(this.$refs.pan, options);
          this.hammer.pan.on("panstart panup pandown panend", e => {
            this.move(e)
          })
        }
        setTimeout(() => {
          resolve();
        }, 100);
      });
    },
    open () {
      this.init().then(() => {
        this.opened = true;
        this.cardP = 0;
        document.body.style.overflow = "hidden";
        this.$emit("cardOpened");
      });
  },
    close () {
      if (this.opened) {
        document.body.style.overflow = "";
        this.cardP = - this.cardH - this.stripe;
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
    move(event) {
      let delta = -event.deltaY;
      if (event.type === 'panup' || event.type === 'pandown') {
        this.moving = true;
        if (- delta > 0) {
          this.cardP = delta;
        } else if (- delta > -150) {
          this.cardP = 0;
          this.paddingBottom = 12 + delta;
        }
      }
      if (event.isFinal) {
        this.contentScroll = this.$refs.content.scrollTop;
        this.moving = false;
        if (this.cardP < -100) {
          this.close()
        } else {
          this.cardP = 0;
          this.paddingBottom = 12;
        }
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
    this.hammer?.pan?.destroy();
    this.hammer?.content?.destroy();
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
  transition: all 0.4s ease-in;
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
  opacity: 0;
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
  transition: bottom 0.4s ease-out;
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
.closed {
  opacity: 0;
  visibility: hidden;
}

.moving .bottom-sheet__card{
  transition: none; 
}
.opened {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.opened .bottom-sheet__backdrop {
  opacity: 1;
  visibility: visible;
}

</style>
