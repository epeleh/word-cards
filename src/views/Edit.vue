<template>
  <div class="edit-page">
    <nav class="nav-bar">
      <router-link to="/" class="btn nav-btn">
        <CheckIcon />
      </router-link>
    </nav>

    <header class="header-bar">
      <div class="search">
        <button @click="searchUsageModalCardId = someCardId"
          class="btn search-btn search-usage-btn"
        >
          <SearchIcon />
        </button>

        <div class="search-input-wrapper">
          <input type="text" name="search" placeholder="search"
            :value="search" @input="(e) => search = e.target.value"
            autocomplete="off" class="search-input" ref="searchInput"
          >
          <p v-if="Array.isArray(cards) && search" class="count"
            :title="`${filteredCards.length} / ${cards.length}`"
          >
            {{ filteredCards.length }} / {{ cards.length }}
          </p>
        </div>
        <button @click="search = ''" :disabled="!search" class="btn search-btn search-clear-btn">
          <ClearIcon v-if="search" />
        </button>
      </div>
    </header>

    <main>
      <div class="cards">
        <form v-if="Array.isArray(cards) && !search" @submit.prevent="createCard"
          class="card create-card"
        >
          <div>
            <div class="errors-info" v-if="cardErrors[0]?.text"
              :title="cardErrors[0].text.join('\n')"
            ><InfoIcon /></div>
            <input type="text" name="text" placeholder="text"
              :value="newCard.text" @input="(e) => newCard.text = e.target.value"
              autocomplete="off" class="text-input"
            >
          </div>

          <div>
            <div class="errors-info" v-if="cardErrors[0]?.translation"
              :title="cardErrors[0].translation.join('\n')"
            ><InfoIcon /></div>
            <input type="text" name="translation" placeholder="translation"
              :value="newCard.translation" @input="(e) => newCard.translation = e.target.value"
              autocomplete="off" class="translation-input"
            >
          </div>

          <button type="submit" class="add-btn" :disabled="!newCard.text || !newCard.translation">
            <AddIcon />
          </button>
        </form>

        <h2 v-if="Array.isArray(cards) && search && !filteredCards.length" class="no-card-banner">
          Nothing found :(
        </h2>
        <h2 v-else-if="typeof cards === 'number'" class="no-card-banner">
          Something went wrong :(
        </h2>
        <div v-else v-for="card in filteredCards.slice(0, cardsDisplayLimit)" :key="card.id"
          class="card" :class="{ remembered: card.remembered }"
        >
          <div class="card-menu">
            <button title="remove" @click="removeModalCardId = card.id"><ClearIcon /></button>
            <button title="hide" v-if="card.active" @click="updateCard(card.id, { active: false })">
              <VisibilityIcon />
            </button>
            <button title="show" v-else @click="updateCard(card.id, { active: true })">
              <VisibilityOffIcon />
            </button>
            <button title="info" @click="infoModalCardId = card.id"><InfoIcon /></button>
            <h4 :title="`#${card.id}`">{{ `#${card.id}` }}</h4>
          </div>

          <div>
            <div>
              <div class="errors-info" v-if="cardErrors[card.id]?.text"
                :title="cardErrors[card.id].text.join('\n')"
              ><InfoIcon /></div>
              <input type="text" name="text" placeholder="text"
                :value="card.text"
                @input="(e) => updateCard(card.id, { text: e.target.value })"
                autocomplete="off" class="text-input"
              >
            </div>

            <div>
              <div class="errors-info" v-if="cardErrors[card.id]?.translation"
                :title="cardErrors[card.id].translation.join('\n')"
              ><InfoIcon /></div>
              <input type="text" name="translation" placeholder="translation"
                :value="card.translation"
                @input="(e) => updateCard(card.id, { translation: e.target.value })"
                autocomplete="off" class="translation-input"
              >
            </div>
          </div>
        </div>
      </div>

      <SearchUsageModal v-if="typeof searchUsageModalCardId === 'number'"
        :cardId="searchUsageModalCardId" :closeModal="() => searchUsageModalCardId = null"
        :readUrlParams="readUrlParams"
      />

      <CardInfoModal v-if="typeof infoModalCardId === 'number'"
        :cardId="infoModalCardId" :closeModal="() => infoModalCardId = null"
      />

      <CardRemoveModal v-if="typeof removeModalCardId === 'number'"
        :cardId="removeModalCardId" :closeModal="() => removeModalCardId = null"
        :deleteCard="deleteCard"
      />
    </main>
  </div>
</template>

<script>
import _ from 'lodash';

import SearchIcon from '@/assets/icons/search.svg';
import ClearIcon from '@/assets/icons/clear.svg';
import CheckIcon from '@/assets/icons/check.svg';

import AddIcon from '@/assets/icons/add.svg';
import VisibilityIcon from '@/assets/icons/visibility.svg';
import VisibilityOffIcon from '@/assets/icons/visibility_off.svg';
import InfoIcon from '@/assets/icons/info.svg';

import SearchUsageModal from '@/components/SearchUsageModal.vue';
import CardInfoModal from '@/components/CardInfoModal.vue';
import CardRemoveModal from '@/components/CardRemoveModal.vue';

export default {
  inject: ['backendUrl'],
  components: {
    SearchIcon,
    ClearIcon,
    CheckIcon,
    AddIcon,
    VisibilityIcon,
    VisibilityOffIcon,
    InfoIcon,
    SearchUsageModal,
    CardInfoModal,
    CardRemoveModal,
  },
  data: () => ({
    search: '',
    cards: null,
    cardsDisplayLimit: 0,
    newCard: { text: '', translation: '' },
    cardErrors: {},
    searchUsageModalCardId: null,
    infoModalCardId: null,
    removeModalCardId: null,
  }),
  watch: {
    search(newValue) {
      this.$router.replace(newValue.trim() ? { query: { s: newValue.trim() } } : {});
      this.renderCards();
    },
    infoModalCardId(newValue) {
      let path = `/${_(this.$route.path).split('/').compact().first()}`;
      if (newValue) path += `/${newValue}`;
      this.$router.push({ path, query: this.$route.query });
    },
  },
  computed: {
    filteredCards() {
      if (!Array.isArray(this.cards)) return [];

      const search = this.search.toLowerCase().trim();
      const searchWords = search.replace(/^#/, '').split('&').map(_.method('trim'));

      return _.orderBy(
        this.cards.filter((card) => (!search.startsWith('#') ? (
          [card.text.toLowerCase(), card.translation.toLowerCase()].some((x) => x.includes(search))
        ) : (
          searchWords.every((word) => [
            `#${card.id}.`,
            `#${card.active ? 'active' : 'inactive'}.`,
            `#${card.image_path ? 'image' : 'noimage'}.`,
            `#${card.remembered ? 'remembered' : 'unremembered'}.`,
          ].some((x) => x.includes(`#${word}`)))
        ))),
        ['active', 'met_at', 'id'], ['desc', 'desc', 'asc'],
      );
    },
    someCardId() {
      return _.sample(this.filteredCards)?.id ?? _.sample(this.cards)?.id ?? 123;
    },
  },
  async created() {
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('popstate', this.readUrlParams);
    this.readUrlParams();

    this.cards = await fetch(`${this.backendUrl}/api/cards`).then(
      (x) => (x.ok ? x.json() : x.status), () => 0,
    );
    this.renderCards();
  },
  mounted() {
    const isSomeModalOpen = [
      this.searchUsageModalCardId, this.infoModalCardId, this.removeModalCardId,
    ].some((x) => x !== null);

    if (!isSomeModalOpen) this.$refs.searchInput.focus();
  },
  unmounted() {
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('popstate', this.readUrlParams);
  },
  methods: {
    onKeyUp(e) {
      if (e.code === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        this.$router.push('/');
      }
    },
    renderCards(restart = true) {
      if (restart) this.cardsDisplayLimit = 0;
      this.cardsDisplayLimit += 10;

      if (this.cardsDisplayLimit >= this.filteredCards.length) return;
      _.defer(this.renderCards, false);
    },
    readUrlParams() {
      this.search = this.$route.query.s ?? '';
      this.infoModalCardId = this.$route.params.cardId ? +this.$route.params.cardId : null;
    },
    async createCard() {
      const [data, status] = await fetch(
        `${this.backendUrl}/api/cards`, { method: 'POST', body: JSON.stringify(this.newCard) },
      ).then(async (x) => ([await x.json().catch(() => null), x.status]), () => [null, 0]);

      switch (status) {
        case 201:
          this.cards.push(data);
          this.renderCards(false);
          this.newCard = { text: '', translation: '' };
          delete this.cardErrors[0];
          break;

        case 400:
          this.cardErrors[0] = data;
          break;

        default:
          this.cards = status;
      }
    },
    async updateCard(cardId, changes) {
      const body = JSON.stringify(Object.assign(this.cards.find((x) => x.id === cardId), changes));

      const [data, status] = await fetch(
        `${this.backendUrl}/api/cards/${cardId}`, { method: 'PUT', body },
      ).then(async (x) => ([await x.json().catch(() => null), x.status]), () => [null, 0]);

      switch (status) {
        case 200:
          delete this.cardErrors[cardId];
          break;

        case 400:
          this.cardErrors[cardId] = data;
          break;

        default:
          this.cards = status;
      }
    },
    async deleteCard(cardId) {
      this.cards = this.cards.filter((x) => x.id !== cardId);

      const response = await fetch(
        `${this.backendUrl}/api/cards/${cardId}`, { method: 'DELETE' },
      ).catch(() => ({ ok: false }));

      if (!response.ok) this.cards = 0;
    },
  },
};
</script>

<style scoped lang="scss">
.edit-page {
  position: absolute;
  width: 100%;
  min-height: 100%;
  box-shadow: inset 0 0 30px 5px #000;
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
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;

    .search-input-wrapper {
      flex: 1;
      position: relative;
      min-width: 184px;
      max-width: calc(84vw - 120px);
    }

    .search-input {
      border-radius: 14px;
      text-align: center;
      width: calc(100% - 8px);
      height: 22px;
      text-shadow: 1px 1px 2px #cdcdcd;
      box-shadow: 4px 4px 12px #0f0f0f, inset 0 0 4px #9b9b9b;
    }

    .count {
      position: absolute;
      top: 0;
      right: 0;
      transform: translateY(-100%);
      margin: 2px 10px;
      opacity: 0.6;
      color: #fff;
      font-size: 12px;
      font-weight: bold;
      cursor: default;
    }

    .search-btn {
      width: auto;
      min-width: 24px;

      svg {
        margin: 0;
        transform: scale(1.5);
      }
    }
  }
}

@keyframes card-show-animation {
  from { transform: scale(0.95); opacity: 0; }
  to { opacity: 1; }
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, 340px);
  justify-content: center;
  align-items: center;
  gap: 22px;
  padding: 6px 2% 2%;

  .card {
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 4px 4px 2px #0f0f0f, inset 0 0 15px #9b9b9b;
    padding: 0 0 4px;
    overflow: hidden;
    font-size: 150%;
    border: none;
    width: 340px;
    height: 122px;
    transition: box-shadow 0.2s;
    animation: card-show-animation 0.2s;

    &:focus,
    &:hover {
      box-shadow: 6px 6px 15px #000, inset 0 0 15px #9b9b9b;
    }

    .card-menu {
      margin: 4px 0 -12px;
      padding: 0 2px;

      button {
        fill: #646464;
        background-color: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        margin: 0 4px;

        &:active,
        &:focus,
        &:hover {
          fill: #000;
        }
      }

      h4 {
        float: right;
        text-shadow: 2px 2px 6px #888, 0 0 1px #000;
        color: #ffe5de;
        font-size: 20px;
        padding: 0 8px;
        margin: -2px 0 0;
        cursor: default;
      }
    }

    &.remembered .card-menu h4 {
      color: #e5ffde;
    }

    .text-input,
    .translation-input {
      display: block;
      text-shadow: 2px 2px 6px #ccc;
      text-align: center;
      font-size: 24px;
      width: calc(100% - 8px);
      margin: 8px 0;
      background: none;
      border-left: none;
      border-right: none;
      border-color: #0002;
      padding: 2px 4px;
    }

    .errors-info {
      position: absolute;
      height: 28px;
      width: 28px;
      margin: 4px 5px;
      cursor: pointer;

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(1.1);
        fill: #ff9f85;
        background-color: #fff;
        border-radius: 50%;
      }
    }
  }

  .create-card .add-btn {
    display: block;
    width: 40%;
    height: 24px;
    border: none;
    margin: -2px auto 0;
    box-shadow: 2px 2px 2px #8f8f8f, inset 0 0 12px #9b9b9b;
    border-radius: 6px;
    fill: #646464;
    background-color: #fff;
    opacity: 0.6;
    transition: opacity 1s, background-color 0.2s;
    cursor: pointer;

    &:disabled {
      opacity: 0.2;
      cursor: not-allowed;
    }

    &:not(:disabled) {
      background-color: #e5ffde;

      &:active,
      &:focus,
      &:hover {
        opacity: 1;
        background-color: #ddffd4;
      }
    }
  }
}
</style>
