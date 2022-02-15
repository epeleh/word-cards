import { nextTick } from 'vue';
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
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards');
    });

    it('allows to create a card', async () => {
      expect('disabled' in wrapper.find('.create-card button.add-btn').attributes()).toBe(true);

      wrapper.find('form.create-card input[name="text"]').setValue('new text');
      await nextTick();

      expect('disabled' in wrapper.find('.create-card button.add-btn').attributes()).toBe(true);

      wrapper.find('form.create-card input[name="translation"]').setValue('new translation');
      await nextTick();

      expect('disabled' in wrapper.find('.create-card button.add-btn').attributes()).toBe(false);

      global.fetch = jest.fn(() => Promise.resolve({ status: 201, json: () => 'response data' }));
      wrapper.find('form.create-card').trigger('submit');

      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards', {
        method: 'POST', body: JSON.stringify({ text: 'new text', translation: 'new translation' }),
      });

      await flushPromises();
      expect(wrapper.vm.newCard).toEqual({ text: '', translation: '' });
      expect(wrapper.vm.cards.at(-1)).toBe('response data');
    });

    it('allows to remove a card', async () => {
      expect(wrapper.vm.removeModalCardId).toBe(null);
      expect(wrapper.find('card-remove-modal-stub').exists()).toBe(false);

      wrapper.find('div.card div.card-menu button[title="remove"]').trigger('click');
      await nextTick();

      expect(wrapper.vm.removeModalCardId).toBe(90);
      expect(wrapper.find('card-remove-modal-stub').exists()).toBe(true);

      wrapper.vm.deleteCard(90);
      expect(global.fetch.mock.calls.length).toBe(2);
      expect(global.fetch).toHaveBeenLastCalledWith('/api/cards/90', { method: 'DELETE' });
    });

    describe('the search bar', () => {
      it('displays', () => {
        expect(wrapper.find('.search input.search-input').attributes('placeholder')).toBe('search');
      });

      it('filters cards', async () => {
        expect(wrapper.find('form.card.create-card').exists()).toBe(true);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90', '#89']);

        wrapper.find('.search input.search-input').setValue('some text');
        await nextTick();

        expect(wrapper.find('form.card.create-card').exists()).toBe(false);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90', '#89']);

        wrapper.find('.search input.search-input').setValue('some translation 2');
        await nextTick();

        expect(wrapper.find('form.card.create-card').exists()).toBe(false);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90']);

        wrapper.find('.search button.btn.search-btn').trigger('click');
        await nextTick();

        expect(wrapper.find('form.card.create-card').exists()).toBe(true);
        expect(wrapper.findAll('div.card h4').map((x) => x.text())).toEqual(['#90', '#89']);
      });
    });
  });
});
