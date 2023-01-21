<template>
	<detail-card @card-closed="cardClosed" :isOpen="isOpen">
		<template v-slot:title>
			{{ name }}
		</template>
		<template v-slot:extra-title-content>
			<p>{{ location ? location + " — " : "" }}{{ created_at_date }}</p>
		</template>
		<template v-slot:subtitle>
			{{
				created_by__fullname
					? created_by__fullname
					: created_by.username
			}}
		</template>
		<template v-slot:inner-content>
			<div class="text-sm px-3 prose dark:prose-invert">
				<p v-html="html_content" />
			</div>
		</template>
	</detail-card>
</template>

<script>
import { marked } from "marked";
import DetailCard from "../UI/Card/DetailCard.vue";

export default {
	components: {
		DetailCard,
	},
	name: "BlogEntryDetail",
	data() {
		return {};
	},
	props: [
		"name",
		"created_at",
		"created_by",
		"location",
		"picture",
		"content",
		"attachments",
		"isOpen",
	],
	emits: ["cardClosed"],
	computed: {
		created_by__fullname() {
			return (
				(this.created_by?.firstname ?? "") +
				(this.created_by?.lastname ?? "")
			);
		},
		created_at_date() {
			let date = new Date(this.created_at);
			return date.toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		},
		html_content() {
			return marked.parse(this.content);
		},
	},
	methods: {
		cardClosed() {
			this.$emit("cardClosed");
		},
	},
	mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.contentClassesOptions {
	@apply pl-5 list-disc list-decimal list-inside underline;
}
</style>
