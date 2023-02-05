import { useDebounceFn, useEventListener } from "@vueuse/core";
import { ref, onMounted } from "vue";

export function useBreakpoints() {
	const breakpointMap = [
		{ name: "md", value: 768 },
		{ name: "lg", value: 1024 },
	];
	const breakpoint = ref("xl");

	onMounted(() => {
		setupColumns();
		updateBreakpoint();
	});

	function updateBreakpoint() {
		breakpoint.value =
			breakpointMap.find((bp) => bp.value >= window.innerWidth)?.name ??
			"xl";
	}

	function resizeEventListener() {
		return useDebounceFn(() => {
			updateBreakpoint();
		}, 100);
	}

	function setupColumns() {
		useEventListener("resize", resizeEventListener());
	}

	return breakpoint;
}
