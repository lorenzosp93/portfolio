<template>
  <div class="bg-gray-100 dark:bg-gray-700 absolute">
    <the-hero :observer="observer" id='the-hero' @hero-loaded="setupAnimation" :isHeroLogoVisible="isHeroLogoVisible" />

    <the-navbar id='the-navbar' :isHeroLogoVisible="isHeroLogoVisible" :elementInView="elementInView" @image-loaded="setupAnimation" />

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
      innerWidth: null,
      loadData: (url, self) => {
        self.isLoading = true;
        let backendUrl = process.env.VUE_APP_BACKEND_URL;
        fetch(backendUrl + url).then(
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
    truncationAmount () {
      let w = this.innerWidth;
      return w > 1024 ? 350 : w > 640 ? 200 : 75
    },
    elementInView () {
      const a = this.elementsInView;
      a.sort(
        (x, y) => {
          return x.intersectionRatio < y.intersectionRatio ? 1 : -1
        }
      );
      return a.length > 0 ? a[0].target.id : null
    },
  },
  methods: {
    isHeroLogoVisible () {
      const e = this.elementsInView.filter(elem => elem.target.id == 'the-hero');
      if (e.length == 0) {return false}
      return e.filter(elem => elem.intersectionRatio > 0)?.length != 0
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
      if (coordinates?.scaleX && coordinates?.scaleY) {
          this.addAnimation(coordinates)
      }
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
    resizeEventHandler (event) {
      if (this.innerWidth != event.target.innerWidth) {
        this.innerWidth = event.target.innerWidth;
        this.setupAnimation();
      }
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
    this.innerWidth = window.innerWidth;
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
