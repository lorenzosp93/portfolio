<template>
	<resume-panel
		@load-entries="loadEntries(kind)"
		:ix="ix"
		:dataLoaded="data.length > 0"
		:isLoading="isLoading"
	>
		<template v-slot:content>
			<ol
				v-if="data.length > 0"
				class="relative border-l border-gray-200 dark:border-gray-600 ml-5 lg:ml-10 py-[1px]"
			>
				<h1
					class="dark:text-white text-xl font-semibold px-5 pt-2 capitalize md:hidden"
				>
					{{ kind }}
				</h1>
				<timeline-group
					v-for="entity in entities"
					:key="entity.uuid"
					:kind="kind"
					:groupKey="entity.uuid"
					:group="entity"
					:isActive="isActive"
				/>
				<div
					v-if="data.length < total && !isLoading"
					@click="loadEntries(kind)"
					class="h-10 w-10 bg-gray-200 dark:bg-gray-600 shadow-md rounded-full mx-auto stroke-1 fill-gray-500 dark:fill-white animate-bounce cursor-pointer"
				>
					<chevron-double-down-icon
						class="h-5 absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2"
					></chevron-double-down-icon>
				</div>
			</ol>
		</template>
	</resume-panel>
</template>

<script>
import TimelineGroup from "./TimelineGroup.vue";
import ResumePanel from "../../UI/Panels/ResumePanel.vue";
import { ChevronDoubleDownIcon } from "@heroicons/vue/24/outline";

export default {
	components: {
		TimelineGroup,
		ResumePanel,
		ChevronDoubleDownIcon,
	},
	name: "ResumeTimeline",
	data() {
		return {
			data: [],
			groups: {},
			entities: [],
			isLoading: false,
			error: null,
			total: 0,
		};
	},
	props: ["kind", "isActive", "observer", "ix"],
	inject: ["loadData", "entriesLimit"],
	emits: ["loadComplete"],
	watch: {
		isActive(value) {
			if (value) {
				if (!this.data.length && !this.isLoading) {
					this.isLoading = true;
					this.loadEntries(this.kind);
				}
			}
		},
	},
	methods: {
		loadEntries(kind) {
			let offset = this.data.length;
			let url = `/api/resume/${kind}/?limit=${this.entriesLimit()}&offset=${offset}`;
			this.loadData(url, this, true)
				.then(() => {
					this.data.forEach((el) => {
						el.entityId = el.entity.uuid;
					});
					this.groups = this.groupBy(this.data, "entityId");
					let entities = Object.keys(this.groups);
					entities.forEach((en) => {
						if (
							!this.entities.filter((old) => {
								return old.uuid == en;
							}).length
						) {
							this.entities.push(
								this.data.find((el) => {
									return el.entityId == en;
								}).entity
							);
						}
					});
					this.entities.forEach((en) => {
						en[this.kind] = this.groups[en.uuid];
					});
				})
				.then(() => {
					this.$emit("loadComplete");
				});
		},
		groupBy(xs, key) {
			return xs.reduce((rv, x) => {
				(rv[x[key]] = rv[x[key]] || []).push(x);
				return rv;
			}, {});
		},
	},
	computed: {},
	created() {},
	beforeUnmount() {},
	mounted() {
		this.observer.observe(this.$el);
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
