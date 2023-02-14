<template>
	<div class="relative min-h-screen w-full mx-auto mt-10">
		<div class="flex flex-wrap w-full mx-auto mb-10">
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
			class="z-10 absolute w-full top-1/2 hidden md:block mx-auto"
			id="arrow-holder-resume"
		>
			<div
				@click="scrollToSibling(false)"
				class="absolute left-2 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden hover:bg-gray-100 hover:dark:bg-gray-400 cursor-pointer select-none"
				:class="{ 'md:block': !isExperienceActive }"
			>
				<chevron-left-icon
					class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				></chevron-left-icon>
			</div>
			<div
				@click="scrollToSibling(true)"
				class="absolute right-2 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden hover:dark:bg-gray-400 hover:bg-gray-100 cursor-pointer select-none"
				:class="{ 'md:block': !isSkillsActive }"
			>
				<chevron-right-icon
					class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				></chevron-right-icon>
			</div>
		</div>
		<div
			class="relative flex gap-6 overflow-x-scroll no-scrollbar snap-x snap-mandatory scroll-smooth w-full"
			id="resume-container"
		>
			<div class="flex-none w-full snap-center">
				<resume-timeline
					:ix="'first'"
					:observer="observer"
					:isActive="isExperienceActive"
					:kind="'experience'"
					id="experience"
				/>
			</div>
			<div class="flex-none w-full snap-center">
				<resume-timeline
					:ix="'center'"
					:observer="observer"
					:isActive="isEducationActive"
					:kind="'education'"
					id="education"
				/>
			</div>
			<div class="flex-none w-full snap-center">
				<resume-projects
					:ix="'center'"
					:observer="observer"
					id="projects"
					:isActive="isProjectsActive"
				/>
			</div>
			<div class="flex-none w-full snap-center">
				<resume-skills
					:ix="'last'"
					:observer="observer"
					id="skills"
					:isActive="isSkillsActive"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import ResumeProjects from "./Projects/ResumeProjects.vue";
import ResumeSkills from "./Skills/ResumeSkills.vue";
import ResumeTimeline from "./Timeline/ResumeTimeline.vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

export default {
	components: {
		ResumeTimeline,
		ResumeProjects,
		ResumeSkills,
		ChevronLeftIcon,
		ChevronRightIcon,
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
	},
	created() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
