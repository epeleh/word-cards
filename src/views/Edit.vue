<template>
  <div class="edit-page">
    <nav>
      <button>
        <img src="@/assets/check.svg" alt="Edit complete">
      </button>
    </nav>

    <header>
      <div class="search-bar">
        <img src="@/assets/search.svg" alt="">
        <input type="text" name="search" id="filter">
        <button>
          <img src="@/assets/clear.svg" alt="Clear">
        </button>
      </div>
    </header>

    <main>
      <div class="cards">
        <div class="card">

        </div>
      </div>
    </main>
  </div>
</template>

<script>/**/
export default {
  name: 'Edit',
  components: {
  },
  methods: {
    onClick() {
      // const cards = await fetch(
      //   `${process.env.NODE_ENV === 'development' ? 'http://localhost:4567' : ''}/api/cards`,
      // ).then((x) => x.json());
      // console.log(cards);

      const image = document.getElementById('image-file').files[0];
      const formData = new FormData();

      formData.append('image', image);
      fetch('http://localhost:4567/api/cards/1/upload_image', { method: 'POST', body: formData });
    },
  },
};
</script>

<style scoped lang="scss">/**/
.search-bar {
  background-color: #fff;
}
</style>
