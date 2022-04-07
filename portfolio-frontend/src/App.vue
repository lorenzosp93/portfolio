<template>
  <div class="snap-y snap-mandatory bg-gray-100 dark:bg-gray-700 absolute">
    <the-hero :observer="observer" :elementsInView="elementsInView" id='the-hero' @imageLoaded="setupAnimation"/>

    <the-navbar id='the-navbar' :elementsInView="elementsInView" @imageLoaded="setupAnimation" />

    <the-resume :observer="observer" :elementsInView="elementsInView" id="the-resume" />

    <the-blog :observer="observer" :isVisible="isBlogVisible" id="the-blog"/>

  </div>
</template>

<script>
import TheNavbar from './components/UI/TheNavbar.vue'
import TheHero from './components/UI/TheHero.vue'
import TheResume from './components/resume/TheResume.vue'
import TheBlog from './components/blog/TheBlog.vue'

export default {
  name: 'App',
  components: {
    TheNavbar,
    TheHero,
    TheResume,
    TheBlog
  },
  data () {
    return{
      observer: null,
      elementsInView: [],
      truncationAmount: 150,
      loadData: (url, self) => {
        self.isLoading = true;
        fetch(window.VUE_APP_BACKEND + url).then(
          response => {
            if (response.ok) {
              return response.json();
            }
          }
        ).then(
          data => {
            if (data) {
              self.isLoading = false;
              self.data = data;
            }
          }
        ).catch(
          error => {
            self.isLoading = false;
            self.error = "Something went wrong when loading the site settings...";
            console.log(error);
          }
        )
      },
    }
  },
  computed: {
    isBlogVisible () {
      return this.elementsInView?.filter(elem => elem.target.id == 'the-blog' && elem.isIntersecting)?.length > 0
    },
  },
  methods: {
    calculateTruncationAmount () {
      let w = window.innerWidth;
      return w > 1024 ? 350 : w > 640 ? 200 : 100
    },
    onElementObserved (entries) {
      entries.every(
        entry => {
          if (this.elementsInView.length > 0) {
            const ix = this.elementsInView.findIndex(elem => {
              return elem.target.id == entry.target.id;
            })
            if (ix != -1) {
              this.elementsInView.splice(ix, 1, entry);
              return
            }
          }
          this.elementsInView.push(entry);
        }
      )
    },
    setupAnimation () {
      const coordinates = this.calculateCoordinatesAnimation('heroPicture', 'heroLogo')
      if (!coordinates?.scaleX || !coordinates?.scaleY) {
        return
      }
      this.addAnimation(coordinates)
    },
    addAnimation (coordinates) {
      this.$lax.addElements(
      '#heroPicture',
      {
        scrollY: {
          translateX: [
            [0, coordinates.deltaY],
            [0, coordinates.deltaX],
            {
              inertia: 10,
            }
          ],
          translateY: [
            [0, coordinates.deltaY],
            [0, coordinates.deltaY],
            {
              inertia: 10,
            }
          ],
          translateZ: [
            [0, coordinates.deltaY],
            [100, 50]
          ],
          scaleX: [
            [0, coordinates.deltaY],
            [1, coordinates.scaleX],
          ],
          scaleY: [
            [0, coordinates.deltaY],
            [1, coordinates.scaleY],
          ]
        }
      },
    )
    },
    calculateCoordinatesAnimation (originTag, destinationTag) {
      const originBox = document.getElementById(originTag)?.getBoundingClientRect()
      const destinationBox = document.getElementById(destinationTag)?.getBoundingClientRect();
      if (!originBox || !destinationBox) { return }
      return {
        deltaX: destinationBox.x + destinationBox.width / 2 - originBox.x - originBox.width / 2,
        deltaY: destinationBox.y + destinationBox.height / 2 - originBox.y - originBox.height / 2,
        scaleX: destinationBox.width / originBox.width,
        scaleY: destinationBox.height / originBox.height,
      }
    },
    resizeEventHandler () {
      this.truncationAmount = this.calculateTruncationAmount();
      this.setupAnimation();
    }
  },
  created () {
    this.$lax.init();
    this.$lax.addDriver('scrollY', function () {
      return window.scrollY
    }, {})
    this.observer = new IntersectionObserver(
      this.onElementObserved,
      {
        threshold: [0]
      }
    );
  },
  beforeUnmount () {
    this.observer.disconnect();
    window.removeEventListener("resize", this.resizeEventHandler);
  },
  mounted () {
    this.truncationAmount = this.calculateTruncationAmount();
    window.addEventListener("resize", this.resizeEventHandler);
  },
  provide () {
    return {
      'truncationAmount': this.truncationAmount,
      'loadData': this.loadData,
    }
  },
}
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
