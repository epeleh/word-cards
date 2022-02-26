<template>
  <div class="edit-page">
    <nav class="nav-bar">
      <router-link to="/" class="btn nav-btn">
        <CheckIcon />
      </router-link>
    </nav>

    <header class="header-bar">
      <div class="search">
        <SearchIcon class="search-icon" />
        <div class="search-input-wrapper">
          <input type="text" name="search" placeholder="search"
            :value="search" @input="(e) => search = e.target.value"
            autocomplete="off" class="search-input"
          >
          <p v-if="search" class="count" :title="`${filteredCards.length} / ${cards.length}`">
            {{ filteredCards.length }} / {{ cards.length }}
          </p>
        </div>
        <button @click="onClearSearchClick()" :disabled="!search" class="btn search-btn">
          <ClearIcon v-if="search" />
        </button>
      </div>
    </header>

    <main>
      <div class="cards">
        <form v-if="!search" @submit.prevent="createCard" class="card create-card">
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

        <h2 v-if="search && !filteredCards.length" class="no-card-banner">Nothing found :(</h2>
        <div v-else v-for="card in filteredCards" :key="card.id"
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
            <h4 :title="`#${card.id}`">{{`#${card.id}`}}</h4>
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

import SearchIcon from '@/assets/search.svg';
import ClearIcon from '@/assets/clear.svg';
import CheckIcon from '@/assets/check.svg';

import AddIcon from '@/assets/add.svg';
import VisibilityIcon from '@/assets/visibility.svg';
import VisibilityOffIcon from '@/assets/visibility_off.svg';
import InfoIcon from '@/assets/info.svg';

import CardInfoModal from '@/components/CardInfoModal.vue';
import CardRemoveModal from '@/components/CardRemoveModal.vue';

export default {
  name: 'Edit',
  inject: ['backendUrl'],
  components: {
    SearchIcon,
    ClearIcon,
    CheckIcon,
    AddIcon,
    VisibilityIcon,
    VisibilityOffIcon,
    InfoIcon,
    CardInfoModal,
    CardRemoveModal,
  },
  data: () => ({
    search: '',
    cards: [],
    newCard: { text: '', translation: '' },
    cardErrors: {},
    infoModalCardId: null,
    removeModalCardId: null,
  }),
  computed: {
    filteredCards() {
      return _.orderBy(
        this.cards.filter((card) => (
          this.search.toLowerCase().trim().startsWith('#') ? [
            `#${card.id}.`,
            `#${card.active ? 'active' : 'inactive'}.`,
            `#${card.image_path ? 'image' : 'noimage'}.`,
            `#${card.remembered ? 'remembered' : 'unremembered'}.`,
          ] : [
            card.text.toLowerCase(),
            card.translation.toLowerCase(),
          ]
        ).some((x) => x.includes(this.search.toLowerCase().trim()))),
        ['active', 'met_at', 'id'], ['desc', 'desc', 'asc'],
      );
    },
  },
  async created() {
    this.cards = await fetch(`${this.backendUrl}/api/cards`).then(
      (x) => (x.ok ? x.json() : x.status),
    );
  },
  methods: {
    onClearSearchClick() {
      this.search = '';
    },
    async createCard() {
      const [data, status] = await fetch(
        `${this.backendUrl}/api/cards`, { method: 'POST', body: JSON.stringify(this.newCard) },
      ).then(async (x) => ([await x.json(), x.status]));

      switch (status) {
        case 201:
          this.cards.push(data);
          this.newCard = { text: '', translation: '' };
          delete this.cardErrors[0];
          break;

        case 400:
          this.cardErrors[0] = data;
          break;
      }
    },
    async updateCard(cardId, changes) {
      const body = JSON.stringify(Object.assign(this.cards.find((x) => x.id === cardId), changes));

      const [data, status] = await fetch(
        `${this.backendUrl}/api/cards/${cardId}`, { method: 'PUT', body },
      ).then(async (x) => ([await x.json(), x.status]));

      switch (status) {
        case 200:
          delete this.cardErrors[cardId];
          break;

        case 400:
          this.cardErrors[cardId] = data;
          break;
      }
    },
    deleteCard(cardId) {
      this.cards = this.cards.filter((x) => x.id !== cardId);
      fetch(`${this.backendUrl}/api/cards/${cardId}`, { method: 'DELETE' });
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

    .search-icon {
      fill: #fff;
      transform: scale(1.5);
      opacity: 0.6;
      min-width: 24px;
    }

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

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, 340px);
  justify-content: center;
  align-items: baseline;
  gap: 22px;
  padding: 6px 2% 12px;

  .card {
    background-color: #fff;
    border-radius: 16px;
    box-shadow: 4px 4px 2px #0f0f0f, inset 0 0 15px #9b9b9b;
    padding: 0 0 4px;
    overflow: hidden;
    font-size: 150%;
    border: none;
    width: 340px;
    transition: box-shadow 0.2s;

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
    border: none;
    margin: 10px auto;
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
