<template>
	<div
		@click="toggleDetails"
		class="snap-center container flex-none rounded-2xl border-1 border-gray-200 shadow-md dark:bg-gray-600 bg-white hover:scale-102.5 transition duration-300 ease-in-out cursor-pointer"
		:class="{ 'pointe-events-none': detailsVisible }"
	>
		<img
			class="object-cover aspect-video w-full overflow-hidden rounded-t-2xl pb-1 border-b-2 border-gray-300"
			:src="picture"
			:alt="'Picture for ' + name"
		/>
		<div
			class="flex flex-wrap p-3 w-full text-lg text-black dark:text-white"
		>
			<p class="text-xs w-full text-gray-400">
				{{ location }}{{ status }}
			</p>
			<h2 class="font-semibold w-full text-gray-900 dark:text-white">
				{{ name }}
			</h2>
			<p
				v-html="truncatedContent"
				class="text-sm my-3 w-full text-ellipsis text-gray-500 dark:text-gray-300 after:content-['_⏎'] after:text-gray-400"
			/>
		</div>
		<blog-entry-detail
			v-if="type == 'blog' && isActive"
			:isOpen="detailsVisible"
			@card-closed="toggleDetails"
			:name="name"
			:created_at="created_at"
			:created_by="created_by"
			:location="location"
			:picture="picture"
			:content="content"
			:attachments="attachments"
		/>
		<project-entry-detail
			v-if="type == 'project' && isActive"
			:isOpen="detailsVisible"
			@card-closed="toggleDetails"
			:name="name"
			:location="location"
			:picture="picture"
			:content="content"
			:status="status"
			:attachments="attachments"
		/>
	</div>
</template>

<script>
import { marked } from "marked";
import BlogEntryDetail from "../../blog/BlogEntryDetail.vue";
import ProjectEntryDetail from "../../resume/Projects/ProjectEntryDetail.vue";

export default {
	components: { BlogEntryDetail, ProjectEntryDetail },
	name: "ListCard",
	data() {
		return {
			detailsVisible: false,
		};
	},
	computed: {
		truncatedContent() {
			return marked.parse(
				this.content.slice(0, this.truncationAmount()) +
					(this.truncationAmount() < this.content.length
						? "... "
						: " ")
			);
		},
	},
	inject: ["truncationAmount"],
	props: [
		"type",
		"uuid",
		"name",
		"created_at",
		"created_by",
		"location",
		"picture",
		"content",
		"status",
		"attachments",
		"isActive",
	],
	methods: {
		toggleDetails() {
			this.detailsVisible = !this.detailsVisible;
		},
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
