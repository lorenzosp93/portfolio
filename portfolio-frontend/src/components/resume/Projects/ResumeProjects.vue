<template>
	<resume-panel :dataLoaded="data.length > 0" :ix="ix" :isLoading="isLoading">
		<template v-slot:content>
			<ol
				v-if="data.length > 0"
				class="relative mx-10 my-1 flex flex-wrap"
			>
				<h1
					class="dark:text-white text-xl font-semibold capitalize pt-2 md:hidden"
				>
					Projects
				</h1>
				<div
					v-for="col in 4"
					:key="col"
					class="flex-[100%] md:flex-[50%] lg:flex-[25%] max-w-full md:max-w-[50%] lg:max-w-[25%] px-2.5 h-fit"
				>
					<list-card
						type="project"
						class="my-5"
						v-for="project in data.filter(
							(_, idx) =>
								idx %
									(breakpoint == 'md'
										? 1
										: breakpoint == 'lg'
										? 2
										: 4) ==
								col - 1
						)"
						:key="project.uuid"
						v-bind="project"
						:isActive="isActive"
					/>
				</div>
			</ol>
			<div
				v-if="data.length < total && !isLoading"
				@click="loadEntries"
				class="w-10 h-10 bg-gray-200 dark:bg-gray-600 shadow-md rounded-full mx-auto my-3 stroke-1 fill-gray-500 dark:fill-white animate-bounce cursor-pointer"
			>
				<chevron-double-down-icon
					class="h-5 absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2"
				></chevron-double-down-icon>
			</div>
		</template>
	</resume-panel>
</template>

<script>
import ListCard from "../../UI/Card/ListCard.vue";
import ResumePanel from "../../UI/Panels/ResumePanel.vue";
import { useBreakpoints } from "@/components/composables/breakpoint";
import { ChevronDoubleDownIcon } from "@heroicons/vue/24/outline";

export default {
	components: {
		ListCard,
		ResumePanel,
		ChevronDoubleDownIcon,
	},
	name: "ResumeProjects",
	data() {
		return {
			data: [],
			isLoading: false,
			error: null,
			total: 0,
		};
	},
	setup() {
		const breakpoint = useBreakpoints();
		return { breakpoint };
	},
	props: ["isActive", "observer", "ix"],
	inject: ["loadData", "entriesLimit"],
	emits: ["loadComplete"],
	watch: {
		isActive(value) {
			if (value && !this.data.length && !this.isLoading) {
				this.isLoading = true;
				this.loadEntries(this.kind);
			}
		},
	},
	methods: {
		loadEntries() {
			let offset = this.data.length;
			let url = `/api/resume/projects/?limit=${this.entriesLimit()}&offset=${offset}`;
			this.loadData(url, this, true).then(() => {
				this.$emit("loadComplete");
			});
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
