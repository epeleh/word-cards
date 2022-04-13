<template>
  <div class="card-remove-modal" @click="closeModal()">
    <h2 v-if="card === 404" class="no-card-banner">The card was not found :(</h2>
    <div class="remove" v-else-if="typeof card?.id === 'number'">
      <div class="placeholder"></div>

      <div class="card-remove" @click.stop :class="{ remembered: card.remembered }">
        <h4 :title="`#${card.id}`">{{`#${card.id}`}}</h4>
        <p class="message">Are you sure want to delete the card?</p>
        <button class="btn no-btn" @click="closeModal()">No</button>
        <button class="btn yes-btn" @click="deleteCard(cardId); closeModal()">Yes</button>
      </div>

      <div class="placeholder"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardRemoveModal',
  inject: ['backendUrl'],
  props: {
    cardId: { type: Number, required: true },
    closeModal: { type: Function, required: true },
    deleteCard: { type: Function, required: true },
  },
  data: () => ({
    card: null,
  }),
  async created() {
    window.addEventListener('keyup', this.onKeyUp);
    this.card = await fetch(`${this.backendUrl}/api/cards/${this.cardId}`).then(
      (x) => (x.ok ? x.json() : x.status),
    );
  },
  unmounted() {
    window.removeEventListener('keyup', this.onKeyUp);
  },
  methods: {
    onKeyUp(e) {
      if (e.code === 'Enter') this.deleteCard(this.cardId);
      if (['Enter', 'Escape'].includes(e.code)) this.closeModal();
    },
  },
};
</script>

<style scoped lang="scss">
.card-remove-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: inset 0 0 30px 5px #000;
  overflow: hidden;
  background-color: #4f4f4fcc;
  z-index: 5000;
}

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
    height: 27px;
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
