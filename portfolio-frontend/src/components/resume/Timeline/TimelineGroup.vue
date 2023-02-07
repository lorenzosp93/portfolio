<template>
	<div
		class="m-5 justify-start bg-gray-50 rounded-lg shadow-md dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 z-1"
	>
		<span
			class="flex absolute mt-3 -left-3.5 justify-center items-center w-7 h-7 rounded-full ring-4 ring-white dark:ring-gray-900 dark:bg-gray-900"
		>
			<img
				class="object-contain rounded-full shadow-lg"
				:src="entityPicture"
				:alt="entityName + 'logo'"
			/>
		</span>
		<h3
			class="flex items-center mx-5 pt-3 align-text-bottom text-lg font-semibold text-gray-900 dark:text-white"
		>
			{{ entityName }}
		</h3>
		<ol class="pb-0.5">
			<timeline-entry
				v-for="entry in group[kind]"
				:key="entry.uuid"
				v-bind="entry"
				:isActive="isActive"
			/>
		</ol>
	</div>
</template>

<script>
import TimelineEntry from "./TimelineEntry.vue";
export default {
	name: "TimelineGroup",
	components: { TimelineEntry },
	data() {
		return {};
	},
	computed: {
		entityName() {
			return this.group.name;
		},
		entityPicture() {
			return this.group.picture;
		},
	},
	methods: {},
	props: {
		groupKey: String,
		group: Object,
		kind: String,
		isActive: Boolean,
	},
	mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
