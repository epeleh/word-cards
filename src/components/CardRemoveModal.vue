<template>
  <div class="modal card-remove-modal" @click="closeModalWithAnimation()"
    :class="{ 'close-animation': closeAnimation }"
  >
    <h2 v-if="card === 404" class="no-card-banner">The card was not found :(</h2>
    <h2 v-else-if="typeof card === 'number'" class="no-card-banner">Something went wrong :(</h2>
    <div v-else-if="typeof card?.id === 'number'" class="remove">
      <div class="placeholder"></div>

      <div class="card-remove" @click.stop :class="{ remembered: card.remembered }">
        <h4 :title="`#${card.id}`">{{ `#${card.id}` }}</h4>
        <p class="message">Are you sure want to delete the card?</p>
        <button class="btn no-btn" @click="closeModalWithAnimation()">No</button>
        <button class="btn yes-btn" @click="deleteTheCard(); closeModalWithAnimation()">
          Yes
        </button>
      </div>

      <div class="placeholder"></div>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['backendUrl'],
  props: {
    cardId: { type: Number, required: true, validator: (value) => value > 0 },
    closeModal: { type: Function, required: true, validator: (value) => !value.length },
    deleteCard: { type: Function, required: true, validator: (value) => value.length === 1 },
  },
  data: () => ({
    card: null,
    closeAnimation: false,
  }),
  async created() {
    window.addEventListener('keyup', this.onKeyUp);
    this.card = await fetch(`${this.backendUrl}/api/cards/${this.cardId}`).then(
      (x) => (x.ok ? x.json() : x.status), () => 0,
    );
  },
  unmounted() {
    window.removeEventListener('keyup', this.onKeyUp);
  },
  methods: {
    closeModalWithAnimation() {
      if (this.closeAnimation) return;
      this.closeAnimation = true;
      setTimeout(this.closeModal, 200);
    },
    deleteTheCard() {
      if (!this.closeAnimation) this.deleteCard(this.cardId);
    },
    onKeyUp(e) {
      if (e.code === 'Escape') {
        this.closeModalWithAnimation();
        return;
      }

      if (typeof this.card?.id === 'number' && ['Enter', 'Delete'].includes(e.code)) {
        this.deleteTheCard();
        this.closeModalWithAnimation();
      }
    },
  },
};
</script>

<style scoped lang="scss">
.remove {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder {
  flex: 1;
}

.card-remove {
  flex: 1;
  border-radius: 16px;
  width: 60%;
  min-width: 360px;
  max-width: 100vh;
  background-color: #fff;
  box-shadow: 4px 4px 2px #0f0f0f, inset 0 0 15px #9b9b9b;
  padding: 0 0 2px;
  overflow: hidden;
  font-size: 150%;
  border: none;
  transition: box-shadow 0.2s;
  background-color: #fff;
  text-align: center;

  &:focus,
  &:hover {
    box-shadow: 6px 6px 15px #000, inset 0 0 15px #9b9b9b;
  }

  h4 {
    float: right;
    text-shadow: 2px 2px 6px #888, 0 0 1px #000;
    color: #ffe5de;
    font-size: 20px;
    padding: 0 8px;
    margin: 2px 2px -12px;
    cursor: default;
  }

  &.remembered h4 {
    color: #e5ffde;
  }

  .message {
    line-height: normal;
    margin: 26px 20px 0;
    text-shadow: 2px 2px 6px #ccc;
    font-size: 22px;
    cursor: default;
  }

  .btn {
    display: inline-block;
    width: 30%;
    height: 24px;
    padding: 0 6px;
    margin: 8px 25px 14px;
    opacity: 0.6;
    fill: #646464;
    transition: opacity 1s, background-color 0.2s;
    box-shadow: 2px 2px 2px #8f8f8f, inset 0 0 12px #9b9b9b;
    border-radius: 6px;
    border: none;
    cursor: pointer;

    &:active,
    &:focus,
    &:hover {
      opacity: 1;
    }
  }

  .no-btn {
    background-color: #ffe5de;

    &:active,
    &:focus,
    &:hover {
      background-color: #ffddd4;
    }
  }

  .yes-btn {
    background-color: #e5ffde;

    &:active,
    &:focus,
    &:hover {
      background-color: #ddffd4;
    }
  }
}
</style>
