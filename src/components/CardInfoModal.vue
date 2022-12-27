<template>
  <div class="modal card-info-modal" @click="closeModalWithAnimation()"
    :class="{ 'close-animation': closeAnimation }"
  >
    <h2 v-if="card === 404" class="no-card-banner">The card was not found :(</h2>
    <h2 v-else-if="typeof card === 'number'" class="no-card-banner">Something went wrong :(</h2>
    <div v-else-if="typeof card?.id === 'number'" class="info">
      <div class="placeholder"></div>

      <div class="card-info" @click.stop
        :class="{ remembered: card.remembered, 'delete-image-btn-hover': deleteImageBtnHover }"
      >
        <div class="card-menu">
          <VisibilityIcon v-if="card.active" />
          <VisibilityOffIcon v-else />
          <h4 :title="`#${card.id}`">{{ `#${card.id}` }}</h4>
        </div>

        <p>{{ card.text }}</p>
        <p>{{ card.translation }}</p>

        <div class="upload-image">
          <button @click="deleteImage" v-if="card.image_path !== null" class="delete-image-btn"
            @mouseover="deleteImageBtnHover = true" @mouseleave="deleteImageBtnHover = false"
          ><ClearIcon /></button>

          <input type="file" accept="image/*" class="upload-input"
            @change="uploadImage($event)" ref="uploadImageInput"
          >
          <div class="upload-message" :class="{ 'upload-field': card.image_path === null }">
            <SaveIcon />
            <p>Upload an image</p>
          </div>
          <img v-if="card.image_path !== null" class="upload-img" alt="Word image"
            :src="cardImageSrc"
          >
        </div>
      </div>

      <ul class="additional-info">
        <li>{{ formatDateText(`Met at: ${card.met_at}`) }}</li>
        <li>{{ formatDateText(`Created at: ${card.created_at}`) }}</li>
        <li>{{ formatDateText(`Updated at: ${card.updated_at}`) }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import VisibilityIcon from '@/assets/icons/visibility.svg';
import VisibilityOffIcon from '@/assets/icons/visibility_off.svg';
import ClearIcon from '@/assets/icons/clear.svg';
import SaveIcon from '@/assets/icons/save.svg';

export default {
  inject: ['backendUrl'],
  components: {
    VisibilityIcon, VisibilityOffIcon, ClearIcon, SaveIcon,
  },
  props: {
    cardId: { type: Number, required: true, validator: (value) => value > 0 },
    closeModal: { type: Function, required: true, validator: (value) => !value.length },
  },
  data: () => ({
    card: null,
    deleteImageBtnHover: false,
    closeAnimation: false,
  }),
  computed: {
    cardImageSrc() {
      const timestamp = new Date(
        this.card.updated_at.replace(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/, '$1T$2Z'),
      ).getTime();

      return `${this.backendUrl}${this.card.image_path}?${timestamp}`;
    },
  },
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
    onKeyUp(e) {
      if (e.code === 'Escape') this.closeModalWithAnimation();
    },
    formatDateText(text) {
      const str = text.slice(0, text.indexOf(':'));
      const d = new Date(
        text.replace(/^\w+ at: (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) UTC$/, '$1T$2Z'),
      );

      if (this.$windowWidth < 580) return '';

      return `${this.$windowWidth < 800 ? str[0] : str}: ${[
        d.getUTCFullYear(), '-', d.getUTCMonth() + 1, '-', d.getUTCDate(),
        this.$windowWidth < 670 ? '' : ' ',
        this.$windowWidth < 670 ? '' : d.getUTCHours(),
        this.$windowWidth < 670 ? '' : ':',
        this.$windowWidth < 670 ? '' : d.getUTCMinutes(),
        this.$windowWidth < 720 || _.inRange(this.$windowWidth, 800, 840) ? '' : ':',
        this.$windowWidth < 720 || _.inRange(this.$windowWidth, 800, 840) ? '' : d.getUTCSeconds(),
      ].map((x) => (typeof x === 'string' ? x : String(x).padStart(2, '0'))).join('')}`;
    },
    async uploadImage(event) {
      const data = new FormData();
      data.append('image', event.target.files[0]);

      this.card = await fetch(
        `${this.backendUrl}/api/cards/${this.cardId}/image`, { method: 'POST', body: data },
      ).then((x) => (x.ok ? x.json() : x.status), () => 0);
    },
    async deleteImage() {
      this.card = await fetch(
        `${this.backendUrl}/api/cards/${this.cardId}/image`, { method: 'DELETE' },
      ).then((x) => (x.ok ? x.json() : x.status), () => 0);

      this.$refs.uploadImageInput.value = null;
    },
  },
};
</script>

<style scoped lang="scss">
.info {
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

.card-info {
  flex: 1;
  border-radius: 16px;
  width: 60%;
  min-width: 360px;
  max-width: 100vh;
  background-color: #fff;
  box-shadow: 4px 4px 2px #0f0f0f, inset 0 0 15px #9b9b9b;
  padding: 0;
  overflow: hidden;
  font-size: 150%;
  line-height: 0;
  border: none;
  transition: box-shadow 0.2s;
  background-color: #fff;

  &:not(.delete-image-btn-hover):focus,
  &:not(.delete-image-btn-hover):hover {
    box-shadow: 6px 6px 15px #000, inset 0 0 15px #9b9b9b;
  }

  .card-menu {
    margin: 4px 0 -6px;
    padding: 0 2px;

    svg {
      fill: #646464;
      margin: 0 4px;
    }

    h4 {
      float: right;
      text-shadow: 2px 2px 6px #888, 0 0 1px #000;
      color: #ffe5de;
      font-size: 20px;
      line-height: normal;
      padding: 0 8px;
      margin: -2px 0 0;
      cursor: default;
    }
  }

  &.remembered .card-menu h4 {
    color: #e5ffde;
  }

  p {
    text-align: center;
    line-height: normal;
    margin: 12px 4px;
    text-shadow: 2px 2px 6px #ccc;
    font-size: 24px;
  }

  .upload-image {
    position: relative;
    width: 100%;

    .delete-image-btn {
      position: fixed;
      padding: 4px;
      background-color: transparent;
      border: none;
      fill: #111;
      cursor: pointer;
      transform: translateX(-100%);
      filter: drop-shadow(0 0 15px #fff);

      &:active,
      &:focus,
      &:hover {
        fill: #000;
      }
    }

    .upload-message {
      position: absolute;
      height: 91%;
      width: 94%;
      margin: 3%;
      padding: 24px;
      box-sizing: border-box;
      border: 2px dashed #000;
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 18px;

      svg {
        transform: scale(2);
        filter: drop-shadow(2px 2px 6px #fff);
      }

      p {
        margin: 0;
      }
    }

    &:focus .upload-message,
    &:hover .upload-message {
      opacity: 0.5;
    }

    .upload-field {
      position: relative;
      opacity: 0.5;
    }

    &:focus .upload-field,
    &:hover .upload-field {
      opacity: 0.8;
    }

    .upload-input {
      position: absolute;
      height: 100%;
      width: 100%;
      cursor: pointer;
      opacity: 0;
    }

    img {
      width: 100%;
      max-height: 40vh;
      object-fit: cover;
    }
  }
}

.additional-info {
  flex: 1;
  list-style-type: none;
  padding: 0;
  opacity: 0.6;
  text-shadow: 0 0 15px #fff, 0 0 10px #fff, 0 0 5px #fff;
  font-weight: bold;
  cursor: default;

  li {
    margin-left: 4%;
  }
}
</style>
