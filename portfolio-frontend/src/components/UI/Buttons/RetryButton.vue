<template>
    <div class="p-10 m-auto">
        <div @click="$emit('loadEntries')"
            class="rounded-3xl text-white font-bold py-3 px-5 bg-gray-400 dark:bg-gray-500 shadow-md cursor-pointer hover:scale-105 transition duration-300 ease-in">
            Retry
        </div>
    </div>
</template>

<script>
export default {
    name: "RetryButton",
    props: [
    ],
    emits: [
        'loadEntries'
    ]

}
</script>

<style>

</style>