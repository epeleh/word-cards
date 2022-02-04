<template>
  <div @click="closeModal()" class="card-info-modal">
    <h2 v-if="card === 404" class="no-card-banner">The card was not found :(</h2>
    <div class="info" v-else-if="typeof card?.id === 'number'">
      <div class="placeholder"></div>

      <div class="card-info" :class="{ remembered: card.remembered }" @click.stop>
        <div class="card-menu">
          <VisibilityIcon v-if="card.active" />
          <VisibilityOffIcon v-else />
          <h4>{{`#${card.id}`}}</h4>
        </div>

        <p>{{card.text}}</p>
        <p>{{card.translation}}</p>

        <img v-if="card.image_path !== null"
          :src="backendUrl + card.image_path" alt="Word image"
        />

        <!-- <form @submit.prevent="uploadImage" class="upload-image">
          <div class="upload-input">
            <input class="upload-file" type="file" name="image" accept="image/*" />
            <label for="image">
              <strong>Choose an image</strong>
              <span class="upload-dragndrop"> or drag it here</span>.
            </label>
            <button class="upload-button" type="submit">Upload</button>
          </div>

          <div class="upload-uploading">Uploading…</div>
          <div class="upload-success">Done!</div>
          <div class="upload-error">Error! <span></span>.</div>
        </form> -->
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
import VisibilityIcon from '@/assets/visibility.svg';
import VisibilityOffIcon from '@/assets/visibility_off.svg';

export default {
  name: 'CardInfoModal',
  inject: ['backendUrl'],
  components: {
    VisibilityIcon, VisibilityOffIcon,
  },
  props: {
    cardId: { type: Number, required: true },
    closeModal: { type: Function, required: true },
  },
  data: () => ({
    card: null,
  }),
  async created() {
    this.card = await fetch(`${this.backendUrl}/api/cards/${this.cardId}`).then(
      (x) => (x.ok ? x.json() : x.status),
    );
  },
  methods: {
    formatDateText(text) {
      const str = text.substr(0, text.indexOf(':'));
      const date = new Date(text.substr(text.indexOf(':') + 1));

      if (this.$windowWidth < 340) return '';

      return `${this.$windowWidth < 660 ? str[0] : str}: ${[
        date.getUTCFullYear(), '-', date.getUTCMonth() + 1, '-', date.getUTCDate(),
        this.$windowWidth < 460 ? '' : ' ',
        this.$windowWidth < 460 ? '' : date.getUTCHours(),
        this.$windowWidth < 460 ? '' : ':',
        this.$windowWidth < 460 ? '' : date.getUTCMinutes(),
        this.$windowWidth < 720 ? '' : ':',
        this.$windowWidth < 720 ? '' : date.getUTCSeconds(),
      ].map((x) => (typeof x === 'string' ? x : String(x).padStart(2, '0'))).join('')}`;
    },
  },
};
</script>

<style scoped lang="scss">
.card-info-modal {
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

  &:focus,
  &:hover {
    box-shadow: 6px 6px 15px #000, inset 0 0 15px #9b9b9b;
  }

  .card-menu {
    margin: 4px 0 -12px;
    padding: 0 2px;

    svg {
      fill: #646464;
      margin: 0 4px;
    }

    h4 {
      float: right;
      text-shadow: 2px 2px 6px #000;
      color: #ff7171;
      font-size: 20px;
      line-height: normal;
      padding: 0 8px;
      margin: -2px 0 0;
      cursor: default;
    }
  }

  &.remembered .card-menu h4 {
    color: #7ae85c;
  }

  p {
    text-align: center;
    line-height: normal;
    margin: 26px 4px 24px;
    text-shadow: 2px 2px 6px #ccc;
    font-size: 24px;
  }

  /*.upload-image {
    width: 100%;
    margin-top: -10px;
    max-height: 40vh;
    object-fit: cover;
  }*/
}

.additional-info {
  flex: 1;
  list-style-type: none;
  padding: 0;
  opacity: 0.6;
  text-shadow: 0 0 15px #fff;
  font-weight: bold;
  cursor: default;

  li {
    margin-left: 4%;
  }
}

.no-card-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 10px #00000075;
}
</style>
