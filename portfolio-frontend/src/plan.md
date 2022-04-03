# Masterplan for website design

## Hero section

Include high quality picture with a short introductory header text and about me.

## Navbar

Visual cue about scrolling down and hero section collapses to navbar when out of view:

* when seen from mobile device, navbar should be hidden within menu -> instead of hamburger, use resized version of the hero picture,
* scrollspy should be enabled for the sections of the main page

## Resume section

Each section (Experience, Education, Projects, Skills) has its own card, with a [timeline](https://tailwind-elements.com/docs/standard/components/timeline/) element, which is placed in a horizontal scroller (`overflow-x-auto`) which automatically [scroll-snaps on centered](https://tailwindcss.com/docs/scroll-snap-stop) - tabs with scrollspy to enable both swiping and tabbed navigation, but disable tabs when multiple cards are visible.

Each entry opens on an overlay detail view which can be scrolled away on mobile.

## Blog section

From the blog hero with horizontal list of blog entry cards, implement scroll snap but with smaller elements (see tailwindui component [From the blog]|(https://tailwindui.com/components/marketing/sections/blog-sections) for design inspiration).

Each entry opens on an overlay detail view which can be scrolled away on mobile.
