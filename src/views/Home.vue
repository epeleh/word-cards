<template>
  <div class="home-page">
    <nav>
      <button>
        <img src="@/assets/edit.svg" alt="Edit cards">
      </button>
    </nav>
    <main>
      <button class="card">
        <p>{{card.text}}</p>
      </button>
      <div class="bottom-bts">
        <button class="btn forget-btn">
          <p>Forget</p>
          <img src="@/assets/clear.svg" alt="Forget icon">
        </button>
        <button class="btn remember-btn">
          <p>Remember</p>
          <img src="@/assets/check.svg" alt="Remember icon">
        </button>
      </div>
    </main>
  </div>
</template>

<script>/**/
export default {
  name: 'Home',
  inject: ['backendUrl'],
  data: () => ({
    card: null,
    inverted: false,
  }),
  async created() {
    this.card = await fetch(`${this.backendUrl}/api/cards/next`).then((x) => x.json());
  },
  methods: {
  },
};
</script>

<style scoped lang="scss">/**/
.bottom-bts {
  position: absolute;
  width: 100%;
  bottom: 0;

  .btn {
    border: none;
    width: 50%;

    * {
      display: inline-block;
    }
  }

  .forget-btn {
    background-color: red;
  }

  .remember-btn {
    background-color: green;
  }
}
</style>
