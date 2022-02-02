<template>
  <div class="edit-page">
    <nav class="nav-bar">
      <router-link to="/" class="btn nav-btn">
        <CheckIcon />
      </router-link>
    </nav>

    <header class="header-bar">
      <div class="search">
        <SearchIcon />
        <input type="text" name="search" id="filter">
        <button>
          <ClearIcon />
        </button>
      </div>
    </header>

    <main>
      <div class="cards">
        <div class="card create-card">
        </div>
        <div v-for="card in cards" :key="card.id"
          class="card" :class="{ remembered: card.remembered }"
        >
          <div class="card-menu">
            <button><ClearIcon /></button>
            <button v-if="card.active"><VisibilityIcon /></button>
            <button v-else><VisibilityOffIcon /></button>
            <button><InfoIcon /></button>
            <h4>{{`#${card.id}`}}</h4>
          </div>
          <div>
            <p>{{card.translation}}</p>
            <p>{{card.text}}</p>
          </div>
        </div>
      </div>
    </main>

  </div>
</template>

<script>
import SearchIcon from '@/assets/search.svg';
import ClearIcon from '@/assets/clear.svg';
import CheckIcon from '@/assets/check.svg';

import VisibilityIcon from '@/assets/visibility.svg';
import VisibilityOffIcon from '@/assets/visibility_off.svg';
import InfoIcon from '@/assets/info.svg';

export default {
  name: 'Edit',
  inject: ['backendUrl'],
  components: {
    SearchIcon, ClearIcon, CheckIcon, VisibilityIcon, VisibilityOffIcon, InfoIcon,
  },
  data: () => ({
    cards: null,
  }),
  async created() {
    this.cards = await fetch(`${this.backendUrl}/api/cards`).then(
      (x) => (x.ok ? x.json() : x.status),
    );
  },
  methods: {
  },
};
</script>

<style scoped lang="scss">
.edit-page {
  position: absolute;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 30px 5px #000;
  overflow: hidden;
}

.btn {
  border: none;
  width: 50%;
  height: 100%;
  padding: 0;
  opacity: 0.6;
  transition: opacity 1s;
  background-color: transparent;

  &:active,
  &:focus,
  &:hover {
    opacity: 1;
  }

  svg {
    display: block;
    position: relative;
    transform: translateY(-50%) scale(1.5);
    cursor: pointer;
    margin: 50% auto 0;
    fill: #fff;
  }
}

.nav-btn {
  position: absolute;
  width: calc(8vw + 24px);
  height: calc(8vw + 24px);
  max-width: calc(8vh + 24px);
  max-height: calc(8vh + 24px);
  cursor: default;
  z-index: 100;
  right: 0;
}

.header-bar {
  width: 100%;
  height: calc(8vw + 24px);
  max-height: calc(8vh + 24px);

  .search {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    width: 40%;
    border-radius: 16px;
    margin: 0 auto;

    background-color: white;
  }
}
</style>
