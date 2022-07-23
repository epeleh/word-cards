<template>
  <div class="home-page">
    <nav class="nav-bar">
      <button class="btn nav-btn reverse-btn" @click="pendingReverseMode = !pendingReverseMode">
        <RefreshDescriptionIcon v-if="pendingReverseMode" />
        <RefreshIcon v-else />
      </button>
      <router-link to="/edit" class="btn nav-btn">
        <EditIcon />
      </router-link>
    </nav>

    <main>
      <h2 v-if="card === 404" class="no-card-banner">You have no active cards :(</h2>
      <h2 v-else-if="typeof card === 'number'" class="no-card-banner">Something went wrong :(</h2>
      <button v-else-if="typeof card?.id === 'number'" @keypress.prevent @click="onCardClick()"
        class="card" :class="[{ remembered: card.remembered }, cardAnimation]"
      >
        <DescriptionIcon v-if="inverted" class="inverted-icon" />
        <h4 :title="`#${card.id}`">{{`#${card.id}`}}</h4>

        <p v-if="(inverted && !reverseMode) || (!inverted && reverseMode)">{{card.translation}}</p>
        <p v-else>{{card.text}}</p>

        <img v-if="inverted && card.image_path !== null" alt="Word image" :src="cardImageSrc(card)">
      </button>

      <div class="side-btns" v-if="typeof card?.id === 'number'">
        <button @click="onForgetClick()" class="btn forget-btn">
          <div><ClearIcon /></div>
        </button>
        <button @click="onRememberClick()" class="btn remember-btn">
          <div><CheckIcon /></div>
        </button>
        <div class="placeholder"></div>
      </div>
    </main>
  </div>
</template>

<script>
import RefreshIcon from '@/assets/icons/refresh.svg';
import RefreshDescriptionIcon from '@/assets/icons/refresh_description.svg';
import EditIcon from '@/assets/icons/edit.svg';

import ClearIcon from '@/assets/icons/clear.svg';
import CheckIcon from '@/assets/icons/check.svg';
import DescriptionIcon from '@/assets/icons/description.svg';

export default {
  name: 'Home',
  inject: ['backendUrl'],
  components: {
    RefreshIcon, RefreshDescriptionIcon, EditIcon, ClearIcon, CheckIcon, DescriptionIcon,
  },
  data: () => ({
    card: null,
    inverted: false,
    reverseMode: false,
    pendingReverseMode: false,
    cardAnimation: 'show-animation',
  }),
  watch: {
    pendingReverseMode(newValue) {
      localStorage.setItem(`${this.$options.name}/reverseMode`, newValue);
    },
  },
  async created() {
    this.reverseMode = !!JSON.parse(localStorage.getItem(`${this.$options.name}/reverseMode`));
    this.pendingReverseMode = this.reverseMode;

    window.addEventListener('keyup', this.onKeyUp);
    this.card = await fetch(`${this.backendUrl}/api/cards/next`).then(
      (x) => (x.ok ? x.json() : x.status), () => 0,
    ).then(this.preloadCardImage);

    setTimeout(() => { this.cardAnimation = null; }, 200);
  },
  unmounted() {
    window.removeEventListener('keyup', this.onKeyUp);
  },
  methods: {
    onKeyUp(e) {
      if (typeof this.card?.id !== 'number') return;
      e.preventDefault();

      if (['Space', 'Enter'].includes(e.code)) this.onCardClick();
      else if (e.code === 'ArrowLeft') this.onForgetClick();
      else if (e.code === 'ArrowRight') this.onRememberClick();
    },
    cardImageSrc(card) {
      const timestamp = new Date(
        card.updated_at.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/, '$1T$2Z'),
      ).getTime();

      return `${this.backendUrl}${card.image_path}?${timestamp}`;
    },
    onCardClick() { this.inverted = !this.inverted; },
    onForgetClick() { this.nextCard({ remembered: false }); },
    onRememberClick() { this.nextCard({ remembered: true }); },
    async nextCard({ remembered }) {
      if (this.cardAnimation) return;
      this.cardAnimation = `${remembered ? 'remember' : 'forget'}-animation`;

      document.activeElement.blur();

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

      const [response] = await Promise.all([
        fetch(
          `${this.backendUrl}/api/cards/${this.card.id}`, { method: 'PUT', body },
        ).catch(() => ({ ok: false })),
        new Promise((resolve) => { setTimeout(resolve, 200); }),
      ]);

      if (!response.ok) {
        await new Promise((resolve) => { setTimeout(resolve, 200); });
        this.card = 0;
        return;
      }

      [this.card] = await Promise.all([
        fetch(`${this.backendUrl}/api/cards/next`).then(
          (x) => (x.ok ? x.json() : x.status), () => 0,
        ).then(this.preloadCardImage),
        new Promise((resolve) => { setTimeout(resolve, 200); }),
      ]);

      this.inverted = false;
      this.reverseMode = this.pendingReverseMode;

      this.cardAnimation = 'show-animation';
      setTimeout(() => { this.cardAnimation = null; }, 200);
    },
    async preloadCardImage(card) {
      if (typeof card !== 'number' && card.image_path !== null) {
        (new Image()).src = this.cardImageSrc(card);
      }

      return card;
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
    position: relative;
    transform: translateY(-50%) scale(1.5);
    cursor: pointer;
    margin: 50% auto;
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

  &.reverse-btn {
    left: 0;
  }
}

.side-btns {
  position: absolute;
  width: 100%;
  height: 100%;

  @mixin side-btn-bg($deg, $color) {
    background:
      linear-gradient($deg + 14, $color 20%, transparent 50%),
      linear-gradient($deg + 10, $color 10%, transparent 40%),
      linear-gradient($deg + 6 , $color 10%, transparent 30%),
      linear-gradient($deg     , $color 0% , transparent 30%),
      linear-gradient($deg - 6 , $color 10%, transparent 30%),
      linear-gradient($deg - 10, $color 10%, transparent 40%),
      linear-gradient($deg - 14, $color 20%, transparent 50%);
  }

  .btn div {
    position: absolute;
    width: calc(8vw + 24px);
    height: calc(8vw + 24px);
    max-width: calc(8vh + 24px);
    max-height: calc(8vh + 24px);
    bottom: 0;
  }

  .forget-btn {
    @include side-btn-bg(90deg, #ffa9a908);
    &:active { @include side-btn-bg(90deg, #ffa9a90a); }
    div { left: 0; }
  }

  .remember-btn {
    @include side-btn-bg(270deg, #a9ffa908);
    &:active { @include side-btn-bg(270deg, #a9ffa90a); }
    div { right: 0; }
  }

  .placeholder {
    position: absolute;
    height: 100%;
    width: 25%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

@keyframes card-forget-animation {
  to { transform: translate(calc(-100% - 60vw), -50%); }
}

@keyframes card-remember-animation {
  to { transform: translate(60vw, -50%); }
}

@keyframes card-show-animation {
  from { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
  to { transform: translate(-50%, -50%); opacity: 1; }
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
  width: 60vw;
  max-width: 60vh;
  background-color: #fff;
  box-shadow: 4px 4px 2px #0f0f0f, inset 0 0 15px #9b9b9b;
  padding: 0;
  overflow: hidden;
  font-size: 150%;
  line-height: 0;
  border: none;
  transition: box-shadow 0.2s;

  &:focus,
  &:hover {
    box-shadow: 6px 6px 15px #000, inset 0 0 15px #9b9b9b;
  }

  &.forget-animation { animation: card-forget-animation 0.4s forwards; }
  &.remember-animation { animation: card-remember-animation 0.4s forwards; }
  &.show-animation { animation: card-show-animation 0.2s; }

  .inverted-icon {
    position: absolute;
    display: inline-block;
    left: 0;
    margin: 2px 4px;
    transform: scale(0.75);
    fill: #646464;
  }

  h4 {
    position: absolute;
    display: inline-block;
    right: 0;
    margin: 14px 8px;
    text-shadow: 2px 2px 6px #888, 0 0 1px #000;
    color: #ffe5de;
    transition: color 1s;
    font-size: 20px;
  }

  &.remembered h4 {
    color: #e5ffde;
  }

  p {
    line-height: normal;
    margin: 26px 4px 24px;
    text-shadow: 2px 2px 6px #ccc;
    font-size: 24px;
  }

  img {
    width: 100%;
    margin-top: -10px;
    max-height: 40vh;
    object-fit: cover;
  }
}
</style>
