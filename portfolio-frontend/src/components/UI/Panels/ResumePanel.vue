<template>
	<div
		class="m-auto mt-5 rounded-lg md:max-w-xl lg:max-w-3xl xl:max-w-5xl overflow-y-scroll shadow-md bg-white dark:bg-gray-900 py-1 mx-auto no-scrollbar"
		style="max-height: 90vh; max-height: 90svh"
	>
		<div class="p-auto w-full overflow-x-hidden">
			<div
				class="absolute top-1/2 -right-2.5 md:hidden"
				:class="{ hidden: ix == 'last' }"
			>
				<div
					class="w-10 p-0.5 rounded-lg cursor-grab active:cursor-grabbing bg-gray-300 rotate-90"
				/>
			</div>
			<slot name="content"> </slot>
			<loading-card v-if="isLoading" />
			<retry-button
				v-else-if="!dataLoaded"
				@load-entries="$emit('loadEntries')"
			/>
		</div>
	</div>
</template>

<script>
import LoadingCard from "../Card/LoadingCard.vue";
import RetryButton from "../Buttons/RetryButton.vue";
export default {
	components: { LoadingCard, RetryButton },
	name: "ResumePanel",
	data() {
		return {};
	},
	props: ["ix", "dataLoaded", "isLoading"],
	emits: ["loadEntries"],
};
</script>
