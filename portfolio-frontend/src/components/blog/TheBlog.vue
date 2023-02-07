<template>
	<div
		class="min-h-[55vh] lg:min-h-[60vh] w-full relative flex flex-wrap mx-auto"
	>
		<div class="flex flex-wrap mx-auto my-10">
			<h2
				class="w-full mt-auto text-center text-xl font-bold text-gray-600 dark:text-white"
			>
				Thoughts from the blog.
			</h2>
			<p
				class="w-full mb-auto text-center text-gray-600 dark:text-gray-300"
			>
				Who needs MySpace when you can create your own blog and write
				whatever comes to mind on it, right?
			</p>
		</div>
		<div
			v-if="data.length && scrollPosition != 'begin'"
			@click="scrollToSibling(false)"
			class="z-10 absolute left-2 top-1/2 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden md:block hover:bg-gray-100 hover:dark:bg-gray-400 cursor-pointer select-none"
		>
			<chevron-left-icon
				class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
			></chevron-left-icon>
		</div>
		<div
			v-if="data.length && scrollPosition != 'end'"
			@click="scrollToSibling(true)"
			class="z-10 absolute right-2 top-1/2 rounded-full h-10 w-10 shadow-md bg-gray-50 dark:bg-gray-500 hidden md:block hover:dark:bg-gray-400 hover:bg-gray-100 cursor-pointer select-none"
		>
			<chevron-right-icon
				class="w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
			></chevron-right-icon>
		</div>
		<div
			class="p-auto relative flex overflow-x-scroll no-scrollbar snap-x snap-mandatory m-auto scroll-smooth py-5 w-full"
			id="blog-container"
		>
			<div class="px-[12.5%] lg:px-10"></div>
			<list-card
				type="blog"
				class="blog-card w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 snap-center flex-none mx-2.5"
				v-for="post in data"
				:key="post?.uuid"
				v-bind="post"
				:isActive="isActive"
			/>
			<div
				class="snap-center relative w-10 h-10 p-6 my-auto mx-10 flex bg-white dark:bg-gray-900 shadow-md container flex-none rounded-full"
				v-if="isLoading"
			>
				<svg
					role="status"
					class="absolute left-1 top-1 w-10 h-10 text-gray-100 animate-spin dark:text-gray-400 fill-gray-600"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
			</div>
			<retry-button
				v-else-if="!data.length"
				@load-entries="loadEntries"
			/>
			<div class="px-[12.5%] lg:px-10"></div>
		</div>
	</div>
</template>

<script>
import ListCard from "../UI/Card/ListCard.vue";
import RetryButton from "../UI/Buttons/RetryButton.vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { useEventListener, useDebounceFn } from "@vueuse/core";

export default {
	components: { ListCard, RetryButton, ChevronLeftIcon, ChevronRightIcon },
	name: "TheBlog",
	data() {
		return {
			isLoading: false,
			error: false,
			data: [],
			total: 0,
			scrollPosition: "begin",
		};
	},
	watch: {
		isActive(value) {
			if (value && this.data.length == 0 && !this.isLoading) {
				this.isLoading = true;
				this.loadEntries();
			}
		},
	},
	props: ["isActive", "observer"],
	inject: ["loadData", "entriesLimit"],
	computed: {},
	methods: {
		loadEntries() {
			this.isLoading = true;
			let url = `/api/blog/post/?limit=${this.entriesLimit()}&offset=${
				this.data.length
			}`;
			this.loadData(url, this, true);
		},
		scrollToSibling(next) {
			let scrollWidth =
				document.getElementsByClassName("blog-card")[0].clientWidth;
			let container = document.getElementById("blog-container");
			if (next) {
				container.scrollLeft += scrollWidth;
			} else {
				container.scrollLeft -= scrollWidth;
			}
		},
	},
	mounted() {
		this.observer.observe(this.$el);
		let container = document.getElementById("blog-container");
		useEventListener(container, "scroll", () => {
			let currentLength = this.data.length;
			if (container.scrollLeft <= 20) {
				this.scrollPosition = "begin";
			} else if (
				container.scrollLeft >=
				container.scrollWidth - container.offsetWidth - 20
			) {
				this.scrollPosition = "end";
				if (this.total > currentLength && !this.isLoading) {
					this.isLoading = true;
					this.loadEntries();
					useDebounceFn(() => {
						this.loadEntries();
					}, 100);
				}
			} else {
				this.scrollPosition = null;
			}
		});
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
