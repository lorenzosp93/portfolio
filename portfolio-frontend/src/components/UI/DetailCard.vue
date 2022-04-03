<template>
  <div>
    <div class="heading">
      <h2>
        <slot name="title">
          The title
        </slot>
      </h2>
    </div>
    <div class="separator"></div>
    <div class="content">
      <slot name="content">
        <p>
          Content goes here...
        </p>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetailCard',
  props: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
