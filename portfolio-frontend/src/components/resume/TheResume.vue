<template>
	<div class="container relative min-h-screen w-full mx-auto mt-10">
		<div class="class container flex flex-wrap mx-auto mb-10">
			<h2
				class="text-center text-xl w-full font-bold mx-auto text-gray-600 dark:text-white"
			>
				Here are a few things I've done.
			</h2>
			<p class="text-center w-full text-gray-600 dark:text-gray-300">
				Because I definitely needed a website to host my CV.
				<span class="md:hidden">
					Swipe horizontally to change section!</span
				>
			</p>
		</div>
		<div
			class="z-10 sticky top-1/2 hidden md:block max-w-screen-lg mx-auto opacity-0"
			id="arrow-holder-resume"
		>
			<div
				@click="scrollToSibling(false)"
				class="absolute -left-5 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden hover:bg-gray-100 hover:dark:bg-gray-400 cursor-pointer select-none"
				:class="{ 'md:block': !isExperienceActive }"
			>
				<chevron-left-icon
					class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				></chevron-left-icon>
			</div>
			<div
				@click="scrollToSibling(true)"
				class="absolute -right-5 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden hover:dark:bg-gray-400 hover:bg-gray-100 cursor-pointer select-none"
				:class="{ 'md:block': !isSkillsActive }"
			>
				<chevron-right-icon
					class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				></chevron-right-icon>
			</div>
		</div>
		<div
			@click="scrollToTop"
			class="absolute right-10 bottom-3 z-10 h-10 w-10 rounded-full shadow-md bg-gray-50 dark:bg-gray-500 cursor-pointer select-none hover:dark:bg-gray-400 hover:bg-gray-100"
			id="top-scroller-resume"
		>
			<chevron-up-icon
				class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
			></chevron-up-icon>
		</div>
		<div
			class="container relative flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scroll-smooth w-full"
			id="resume-container"
		>
			<div class="flex-none w-full grow snap-center resume-panels">
				<resume-timeline
					:ix="'first'"
					:observer="observer"
					:isActive="isExperienceActive"
					:kind="'experience'"
					id="experience"
					class="scroll-my-10"
					@load-complete="refreshAnimations"
				/>
			</div>
			<div class="flex-none w-full grow snap-center resume-panels">
				<resume-timeline
					:ix="'center'"
					:observer="observer"
					:isActive="isEducationActive"
					:kind="'education'"
					id="education"
					class="scroll-my-10"
					@load-complete="refreshAnimations"
				/>
			</div>
			<div class="flex-none w-full grow snap-center resume-panels">
				<resume-projects
					:ix="'center'"
					:observer="observer"
					id="projects"
					:isActive="isProjectsActive"
					class="scroll-my-10"
					@load-complete="refreshAnimations"
				/>
			</div>
			<div class="flex-none w-full grow snap-center resume-panels">
				<resume-skills
					:ix="'last'"
					:observer="observer"
					id="skills"
					:isActive="isSkillsActive"
					class="scroll-my-10"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import ResumeProjects from "./Projects/ResumeProjects.vue";
import ResumeSkills from "./Skills/ResumeSkills.vue";
import ResumeTimeline from "./Timeline/ResumeTimeline.vue";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
} from "@heroicons/vue/24/outline";

export default {
	components: {
		ResumeTimeline,
		ResumeProjects,
		ResumeSkills,
		ChevronLeftIcon,
		ChevronRightIcon,
		ChevronUpIcon,
	},
	name: "TheResume",
	data() {
		return {
			t1: null,
			t2: null,
			t3: [],
		};
	},
	props: ["observer", "elementsInView"],
	inject: [],
	computed: {
		isExperienceActive() {
			return this.isActive("experience");
		},
		isEducationActive() {
			return this.isActive("education");
		},
		isProjectsActive() {
			return this.isActive("projects");
		},
		isSkillsActive() {
			return this.isActive("skills");
		},
	},
	methods: {
		scrollToTop() {
			this.$el.scrollIntoView({ behavior: "smooth", block: "start" });
		},
		isActive(kind) {
			return (
				this.elementsInView.filter(
					(e) => kind == e.target.id && e.isIntersecting
				)?.length > 0 ?? false
			);
		},
		scrollToSibling(next) {
			let scrollWidth = document.getElementById(
				"arrow-holder-resume"
			).clientWidth;
			let container = document.getElementById("resume-container");
			if (next) {
				container.scrollLeft += scrollWidth;
			} else {
				container.scrollLeft -= scrollWidth;
			}
		},
		setUpAnimations() {
			const t1 = this.$gsap.timeline({
				scrollTrigger: {
					trigger: "#resume-container",
					start: "10% center",
					end: "90% center",
					scrub: true,
				},
			});
			t1.to("#arrow-holder-resume", { opacity: 1, duration: 0.3 }).to(
				"#arrow-holder-resume",
				{ opacity: 0, duration: 0.3 },
				0.7
			);
			this.t1 = t1;
		},
		refreshAnimations() {
			this.t1.scrollTrigger.refresh(true);
		},
	},
	beforeUnmount() {
		this.t1?.kill();
	},
	mounted() {
		this.setUpAnimations();
	},
	created() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resume-panels {
	@apply flex-shrink-0;
}
</style>
