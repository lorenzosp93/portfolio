<template>
	<resume-panel :dataLoaded="data.length > 0" :isLoading="isLoading" :ix="ix">
		<template v-slot:content>
			<ol
				v-if="data.length > 0"
				class="relative mx-10 my-1 flex flex-wrap"
			>
				<h1
					class="dark:text-white text-xl font-semibold capitalize pt-2 md:hidden"
				>
					Skills
				</h1>
				<div
					v-for="col in 4"
					:key="col"
					class="flex-[100%] md:flex-[50%] lg:flex-[25%] max-w-full md:max-w-[50%] lg:max-w-[25%] px-2.5 h-fit"
				>
					<skills-category
						class="my-5"
						v-for="category in data.filter(
							(_, idx) =>
								idx %
									(breakpoint == 'md'
										? 1
										: breakpoint == 'lg'
										? 2
										: 4) ==
								col - 1
						)"
						:key="category.name"
						v-bind="category"
						:isActive="isActive"
					>
					</skills-category>
				</div>
			</ol>
		</template>
	</resume-panel>
</template>

<script>
import { useBreakpoints } from "@/components/composables/breakpoint";
import ResumePanel from "../../UI/Panels/ResumePanel.vue";
import SkillsCategory from "./SkillsCategory.vue";

export default {
	components: {
		SkillsCategory,
		ResumePanel,
	},
	name: "ResumeSkills",
	data() {
		return {
			data: [],
			isLoading: false,
			error: null,
		};
	},
	setup() {
		const breakpoint = useBreakpoints();
		return {
			breakpoint,
		};
	},
	props: ["isActive", "observer", "ix"],
	inject: ["loadData"],
	watch: {
		isActive(value) {
			if (value && !this.data.length && !this.isLoading) {
				this.isloading = true;
				this.loadEntries();
			}
		},
	},
	methods: {
		loadEntries() {
			let url = "/api/resume/skillcategory/";
			this.loadData(url, this);
		},
	},
	created() {},
	mounted() {
		this.observer.observe(this.$el);
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
