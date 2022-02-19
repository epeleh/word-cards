import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import Edit from '@/views/Edit.vue';

describe('Edit.vue', () => {
  let wrapper;

  describe('when api responds with some cards', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => ([
          {
            id: 89,
            text: 'some text 1',
            translation: 'some translation 1',
            image_path: null,
            met_at: '2022-02-13 13:29:08 UTC',
            remembered: true,
            active: false,
            created_at: '2022-02-11 20:04:45 UTC',
            updated_at: '2022-02-13 13:30:50 UTC',
          },
          {
            id: 90,
            text: 'some text 2',
            translation: 'some translation 2',
            image_path: '/storage/card_90.jpeg',
            met_at: '2022-02-13 13:29:44 UTC',
            remembered: false,
            active: true,
            created_at: '2022-02-11 20:05:38 UTC',
            updated_at: '2022-02-13 13:30:44 UTC',
          },
        ]),
      }));

      wrapper = shallowMount(Edit, {
        global: {
          provide: { backendUrl: '' },
          stubs: [
            'router-link', 'SearchIcon', 'ClearIcon', 'CheckIcon', 'AddIcon',
            'VisibilityIcon', 'VisibilityOffIcon', 'InfoIcon', 'CardInfoModal', 'CardRemoveModal',
          ],
        },
      });
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches cards by the correct endpoint', () => {
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/cards');
    });

    it('allows to create a card', async () => {
      expect(wrapper.get('.create-card .add-btn').attributes()).toHaveProperty('disabled');

      await wrapper.get('form.create-card input[name="text"]').setValue('new text');
      expect(wrapper.get('.create-card .add-btn').attributes()).toHaveProperty('disabled');

      await wrapper.get('form.create-card input[name="translation"]').setValue('new translation');
      expect(wrapper.get('.create-card .add-btn').attributes()).not.toHaveProperty('disabled');

      const newCard = {
        id: 91,
        text: 'some text 3',
        translation: 'some translation 3',
        image_path: null,
        met_at: '2022-02-14 18:22:59 UTC',
        remembered: false,
        active: true,
        created_at: '2022-02-14 18:22:59 UTC',
        updated_at: '2022-02-14 18:22:59 UTC',
      };

      global.fetch = jest.fn(() => Promise.resolve({ status: 201, json: () => newCard }));
      await wrapper.get('form.create-card').trigger('submit');

      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/cards', {
        method: 'POST', body: JSON.stringify({ text: 'new text', translation: 'new translation' }),
      });

      await flushPromises();
      expect(wrapper.vm.newCard).toEqual({ text: '', translation: '' });
      expect(wrapper.vm.cards.at(-1)).toEqual(newCard);
    });

    it('allows to remove a card', async () => {
      expect(wrapper.vm.removeModalCardId).toBeNull();
      expect(wrapper.find('card-remove-modal-stub').exists()).toBe(false);

      await wrapper.get('div.card div.card-menu button[title="remove"]').trigger('click');
      expect(wrapper.vm.removeModalCardId).toBe(90);
      expect(wrapper.find('card-remove-modal-stub').exists()).toBe(true);

      await wrapper.vm.deleteCard(90);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith('/api/cards/90', { method: 'DELETE' });
    });

    describe('the search bar', () => {
      it('displays', () => {
        expect(wrapper.get('.search input.search-input').attributes('placeholder')).toBe('search');
      });

      it('filters cards', async () => {
        expect(wrapper.find('form.card.create-card').exists()).toBe(true);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90', '#89']);

        await wrapper.get('.search input.search-input').setValue('some text');
        expect(wrapper.find('form.card.create-card').exists()).toBe(false);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90', '#89']);

        await wrapper.get('.search input.search-input').setValue('some translation 2');
        expect(wrapper.find('form.card.create-card').exists()).toBe(false);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90']);

        await wrapper.get('.search button.btn.search-btn').trigger('click');
        expect(wrapper.find('form.card.create-card').exists()).toBe(true);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90', '#89']);
      });
    });
  });
});
