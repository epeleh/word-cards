<template>
  <div class="modal search-usage-modal" @click="closeModalWithAnimation()"
    :class="{ 'close-animation': closeAnimation }"
  >
    <div class="usage">
      <h2><InfoIcon />Search usage<div class="placeholder"></div></h2>

      <p>
        <router-link :to="`/edit?s=%23${cardId}.`">{{ `#${cardId}.` }}</router-link>
        - find a card by id
      </p>

      <p>
        <router-link to="/edit?s=%23active">#active</router-link>
        - show active cards<br>
        <router-link to="/edit?s=%23inactive">#inactive</router-link>
        - show inactive cards
      </p>

      <p>
        <router-link to="/edit?s=%23image">#image</router-link>
        - show cards with an image<br>
        <router-link to="/edit?s=%23noimage">#noimage</router-link>
        - show cards without an image
      </p>

      <p>
        <router-link to="/edit?s=%23remembered">#remembered</router-link>
        - show cards you remember<br>
        <router-link to="/edit?s=%23unremembered">#unremembered</router-link>
        - show cards you forget
      </p>

      <p>
        also, you can combine filters, like this:<br>
        <router-link to="/edit?s=%23active%26noimage">#active&noimage</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import InfoIcon from '@/assets/icons/info.svg';

const props = defineProps({
  cardId: { type: Number, required: true, validator: (value) => value > 0 },
  closeModal: { type: Function, required: true, validator: (value) => !value.length },
  readUrlParams: { type: Function, required: true, validator: (value) => !value.length },
});

const closeAnimation = ref(false);
const closeModalWithAnimation = () => {
  if (closeAnimation.value) return;
  closeAnimation.value = true;

  props.readUrlParams();
  setTimeout(props.closeModal, 200);
};

const onKeyUp = (e) => { if (e.code === 'Escape') closeModalWithAnimation(); };
window.addEventListener('keyup', onKeyUp);
onUnmounted(() => window.removeEventListener('keyup', onKeyUp));
</script>

<style scoped lang="scss">
.usage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  padding: 20px;
  color: #fff;
  border-radius: 16px;
  background-color: #4f4f4fcc;
  box-shadow: 0 0 64px 64px #4f4f4fcc;
  text-shadow: 1px 1px 2px #000;
}

h2 {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  gap: 2px;

  * {
    width: 24px;
    height: 24px;
    margin: 2px;
    fill: #fff;
  }
}

p {
  line-height: 26px;

  a {
    padding: 2px 14px;
    text-decoration: none;
    text-shadow: 1px 1px 2px #cdcdcd;
    box-shadow: 2px 2px 6px #0f0f0f, inset 0 0 2px #9b9b9b;
    border-radius: 14px;
    color: #000;
    background-color: #fff;
  }
}
</style>
