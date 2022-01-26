<template>
  <div class="home-page">
    <nav class="nav-bar">
      <router-link to="/edit" class="nav-btn">
        <EditIcon />
      </router-link>
    </nav>
    <main>
      <h2 v-if="this.card === 404" class="no-cards-banner">You have no active cards :(</h2>
      <button v-else-if="typeof this.card?.id === 'number'"
        v-on:click="onCardClick()" class="card" :class="{ remembered: card.remembered }"
      >
        <h4>{{`#${card.id}`}}</h4>
        <p v-if="inverted">{{card.translation}}</p>
        <p v-else>{{card.text}}</p>
        <img v-if="inverted && card.image_path !== null"
          :src="backendUrl + card.image_path" alt="Word image"
        />
      </button>
      <div class="bottom-bts">
        <button v-on:click="onForgetClick()" class="btn forget-btn">
          <p>Forget</p>
          <ClearIcon />
        </button>
        <button v-on:click="onRememberClick()" class="btn remember-btn">
          <p>Remember</p>
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

.nav-bar {
  position: absolute;
  width: 100%;
  pointer-events: none;
  z-index: 100;

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content:center;
    float: right;
    width: 12%;
    min-width: 30px;
    aspect-ratio: 1;
    margin: 3%;
    border-radius: 50%;
    background-color: #bcbcbc;
    box-shadow: 4px 4px 2px #0f0f0f, inset -8px -3px 6px #7c7c7c;
    pointer-events: all;

    svg {
      height: 65%;
      width: 42px;
      aspect-ratio: 1;
    }
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
}

.bottom-bts {
  position: absolute;
  width: 100%;
  height: 100%;
  bottom: 0;

  .btn {
    border: none;
    width: 50%;
    height: 100%;
    background-color: transparent;
    transition: opacity 1s;

    * {
      display: inline-block;
    }

    svg {
      fill: white;
    }
  }

  @mixin side-btn($deg, $color) {
    background:
      linear-gradient($deg + 12, $color 20%, transparent 50%),
      linear-gradient($deg + 8 , $color 10%, transparent 40%),
      linear-gradient($deg + 4 , $color 10%, transparent 40%),
      linear-gradient($deg     , $color 0% , transparent 30%),
      linear-gradient($deg - 4 , $color 10%, transparent 40%),
      linear-gradient($deg - 8 , $color 10%, transparent 40%),
      linear-gradient($deg - 12, $color 20%, transparent 50%);
  }

  .forget-btn {
    @include side-btn(90deg, #281010);
    opacity: 0.6;

    &:focus,
    &:hover {
      opacity: 1;
    }

    &:active {
      @include side-btn(90deg, #301010);
      opacity: 1;
    }
  }

  .remember-btn {
    @include side-btn(270deg, #102810);
    opacity: 0.6;

    &:focus,
    &:hover {
      opacity: 1;
    }

    &:active {
      @include side-btn(270deg, #103010);
      opacity: 1;
    }
  }
}
</style>
