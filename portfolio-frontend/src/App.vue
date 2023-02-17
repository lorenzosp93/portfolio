<template>
  <section class="w-full">
    <the-hero
      id="the-hero"
      :observer="observer"
      @hero-loaded="setupAnimation"
    />
    <the-navbar
      id="the-navbar"
      :element-in-view="elementInView"
      @image-loaded="setupAnimation"
    />
    <the-resume
      id="the-resume"
      :observer="observer"
      :elements-in-view="elementsInView"
      class="scroll-mt-16"
    />
    <the-blog
      id="the-blog"
      :observer="observer"
      :is-active="isBlogActive"
      class="scroll-mt-16"
    />
    <the-contacts id="the-contacts" :observer="observer" class="scroll-mt-16" />

    <footer>
      <p class="px-5 pb-2 text-sm dark:text-white text-gray-700">
        © Lorenzo Spinelli, 2023
      </p>
    </footer>
  </section>
</template>

<script>
import TheNavbar from "./components/UI/TheNavbar.vue";
import TheHero from "./components/TheHero.vue";
import TheResume from "./components/resume/TheResume.vue";
import TheBlog from "./components/blog/TheBlog.vue";
import TheContacts from "./components/TheContacts.vue";

export default {
  name: "App",
  components: {
    TheNavbar,
    TheHero,
    TheResume,
    TheBlog,
    TheContacts,
  },
  provide() {
    return {
      truncationAmount: this.truncationAmount,
      loadData: this.loadData,
      entriesLimit: this.entriesLimit,
    };
  },
  data() {
    return {
      observer: null,
      elementsInView: [],
      tl: null,
      innerWidth: null,
      truncationAmount: () => {
        let w = window.innerWidth;
        return w > 1024 ? 350 : w > 640 ? 200 : 75;
      },
      entriesLimit: () => {
        let w = window.innerWidth;
        return w > 1024 ? 6 : w > 640 ? 5 : 3;
      },
      loadData: (url, self, isPaginated) => {
        self.isLoading = true;
        let backendUrl = import.meta.env.VITE_BACKEND_URL;
        return fetch(backendUrl + url)
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
          })
          .then((data) => {
            if (data) {
              self.isLoading = false;
              if (isPaginated) {
                self.total = data.count;
                self.data.push(...data.results);
              } else {
                self.data = data;
              }
            }
          })
          .catch((error) => {
            self.isLoading = false;
            self.error = "Something went wrong when loading the site data...";
            console.log(error);
          });
      },
    };
  },
  computed: {
    isBlogActive() {
      return (
        this.elementsInView?.filter(
          (elem) => elem.target.id == "the-blog" && elem.isIntersecting
        )?.length > 0
      );
    },
    elementInView() {
      const a = this.elementsInView;
      a.sort((x, y) => {
        return x.intersectionRatio < y.intersectionRatio ? 1 : -1;
      });
      return a.length > 0 ? a[0].target.id : null;
    },
  },
  created() {
    this.observer = new IntersectionObserver(this.onElementObserved, {
      threshold: [0, 0.5],
    });
  },
  beforeUnmount() {
    this.observer.disconnect();
    window.removeEventListener("resize", this.resizeEventHandler);
    this.cleanupAnimation();
  },
  mounted() {
    this.innerWidth = window.innerWidth;
    window.addEventListener("resize", this.resizeEventHandler);
  },
  methods: {
    onElementObserved(entries) {
      entries.forEach((entry) => {
        if (this.elementsInView.length > 0) {
          const ix = this.elementsInView.findIndex((elem) => {
            return elem.target.id == entry.target.id;
          });
          if (ix != -1) {
            this.elementsInView.splice(ix, 1, entry);
            return;
          }
        }
        this.elementsInView.push(entry);
      });
    },
    setupAnimation() {
      const coordinates = this.calculateCoordinatesAnimation(
        "heroPicture",
        "heroLogo"
      );
      if (coordinates?.scaleX && coordinates?.scaleY) {
        this.addHeroAnimation(coordinates);
      }
    },
    cleanupAnimation() {
      this.tl?.kill();
    },
    addHeroAnimation(coordinates) {
      this.cleanupAnimation();
      const tl = this.$gsap.timeline({
        scrollTrigger: {
          trigger: "#the-hero",
          scrub: true,
          start: "top top",
          end: "bottom top",
        },
      });
      tl.to("#heroPicture", {
        x: coordinates.deltaX,
        y: coordinates.deltaY,
        scaleX: coordinates.scaleX,
        scaleY: coordinates.scaleY,
        ease: "slow (0.1, 0.7, false)",
        duration: 0.7,
      })
        .to(
          "#the-navbar",
          { opacity: 1, ease: "power1.in", duration: 0.3 },
          0.7
        )
        .set("#heroPicture", { opacity: 0 }, 0.97);
      this.tl = tl;
    },
    calculateCoordinatesAnimation(originTag, destinationTag) {
      const originBox = document
        .getElementById(originTag)
        ?.getBoundingClientRect();
      const destinationBox = document
        .getElementById(destinationTag)
        ?.getBoundingClientRect();
      if (!originBox || !destinationBox) {
        return;
      }
      return {
        deltaX:
          destinationBox.x +
          destinationBox.width / 2 -
          originBox.x -
          originBox.width / 2,
        deltaY:
          destinationBox.y +
          destinationBox.height / 2 -
          originBox.y -
          originBox.height / 2,
        scaleX: destinationBox.width / originBox.width,
        scaleY: destinationBox.height / originBox.height,
      };
    },
    resizeEventHandler(event) {
      if (this.innerWidth != event.target.innerWidth) {
        this.tl?.restart();
        window.scrollTo({ top: 0 });
        this.setupAnimation();
        this.innerWidth = event.target.innerWidth;
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
