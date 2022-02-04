<template>
  <div class="card-info-modal">
    <p>Hello World!</p>
  </div>
</template>

<script>
export default {
  name: 'CardInfoModal',
  inject: ['backendUrl'],
  props: {
    cardId: Number,
  },
};
</script>

<style scoped lang="scss">
</style>
