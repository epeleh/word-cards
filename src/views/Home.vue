<template>
  <div class="home-page">
    <nav class="nav-bar">
      <router-link to="/edit" class="btn nav-btn">
        <EditIcon />
      </router-link>
    </nav>
    <main>
      <h2 v-if="this.card === 404" class="no-cards-banner">You have no active cards :(</h2>
      <button v-else-if="typeof this.card?.id === 'number'"
        v-on:click="onCardClick()" class="card" :class="{ remembered: card.remembered }"
      >
        <EditIcon v-if="inverted" />
        <h4>{{`#${card.id}`}}</h4>
        <p v-if="inverted">{{card.translation}}</p>
        <p v-else>{{card.text}}</p>
        <img v-if="inverted && card.image_path !== null"
          :src="backendUrl + card.image_path" alt="Word image"
        />
      </button>
      <div class="side-btns">
        <button v-on:click="onForgetClick()" class="btn forget-btn">
          <ClearIcon />
        </button>
        <button v-on:click="onRememberClick()" class="btn remember-btn">
          <CheckIcon />
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import EditIcon from '@/assets/edit.svg';
import ClearIcon from '@/assets/clear.svg';
import CheckIcon from '@/assets/check.svg';

export default {
  name: 'Home',
  inject: ['backendUrl'],
  components: { EditIcon, ClearIcon, CheckIcon },
  data: () => ({
    card: null,
    inverted: false,
  }),
  async created() {
    this.card = await fetch(`${this.backendUrl}/api/cards/next`).then(
      (x) => (x.ok ? x.json() : x.status),
    );
  },
  methods: {
    onCardClick() { this.inverted = !this.inverted; },
    onForgetClick() { this.nextCard({ remembered: false }); },
    onRememberClick() { this.nextCard({ remembered: true }); },
    async nextCard({ remembered }) {
      document.activeElement.blur();

      if (typeof this.card?.id !== 'number') return;

      const now = new Date();
      const body = JSON.stringify({
        text: this.card.text,
        translation: this.card.translation,
        remembered,
        met_at: [
          now.getUTCFullYear(), '-', now.getUTCMonth() + 1, '-', now.getUTCDate(), ' ',
          now.getUTCHours(), ':', now.getUTCMinutes(), ':', now.getUTCSeconds(), ' UTC',
        ].map((x) => (typeof x === 'string' ? x : String(x).padStart(2, '0'))).join(''),
      });

      const response = await fetch(
        `${this.backendUrl}/api/cards/${this.card.id}`, { method: 'PUT', body },
      );
      if (!response.ok) return;

      this.card = await fetch(`${this.backendUrl}/api/cards/next`).then(
        (x) => (x.ok ? x.json() : x.status),
      );
      this.inverted = false;
    },
  },
};
</script>

<style scoped lang="scss">
.home-page {
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
    position: absolute;
    cursor: pointer;
    margin: 0;
    fill: #fff;
  }
}

.nav-btn {
  position: absolute;
  width: calc(10vw + 24px);
  height: calc(10vw + 24px);
  z-index: 100;
  right: 0;

  svg {
    position: relative;
    margin: 50% auto 0;
    transform: translateY(-50%) scale(1.5);
  }
}

.side-btns {
  position: absolute;
  width: 100%;
  height: 100%;

  @mixin side-btn-bg($deg, $color) {
    background:
      linear-gradient($deg + 12, $color 20%, transparent 50%),
      linear-gradient($deg + 8 , $color 10%, transparent 40%),
      linear-gradient($deg + 4 , $color 10%, transparent 40%),
      linear-gradient($deg     , $color 0% , transparent 30%),
      linear-gradient($deg - 4 , $color 10%, transparent 40%),
      linear-gradient($deg - 8 , $color 10%, transparent 40%),
      linear-gradient($deg - 12, $color 20%, transparent 50%);
  }

  .btn svg {
    bottom: 5vw;
    transform: scale(1.5);
  }

  .forget-btn {
    @include side-btn-bg(90deg, #281010);
    &:active { @include side-btn-bg(90deg, #301010); }
    svg { left: 5%; }
  }

  .remember-btn {
    @include side-btn-bg(270deg, #102810);
    &:active { @include side-btn-bg(270deg, #103010); }
    svg { right: 5%; }
  }
}

.card {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  z-index: 50;
  cursor: pointer;
  border-radius: 16px;
  width: 60%;
  max-width: 100vh;
  box-shadow: 4px 4px 2px #0f0f0f, inset 0 0 15px #9b9b9b;
  padding: 0;
  overflow: hidden;
  font-size: 150%;
  line-height: 0;
  border: none;

  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;

  h4 {
    position: absolute;
    right: 0;
    margin: 14px 8px;
    text-shadow: 2px 2px 6px #000;
    transition: color 1s;
    color: #ff7171;
    font-size: 20px;
  }

  &.remembered h4 {
    color: #7ae85c;
  }

  p {
    line-height: normal;
    margin: 24px 4px;
    text-shadow: 2px 2px 6px #ccc;
    font-size: 24px;
  }

  img {
    width: 100%;
  }
}
</style>
