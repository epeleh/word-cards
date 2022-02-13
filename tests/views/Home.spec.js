import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import Home from '@/views/Home.vue';

describe('Home.vue', () => {
  let wrapper;

  describe('when api responds with 404 status', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404 }));

      wrapper = shallowMount(Home, {
        global: {
          provide: { backendUrl: '' },
          stubs: ['router-link', 'EditIcon', 'ClearIcon', 'CheckIcon', 'DescriptionIcon'],
        },
      });

      await flushPromises();
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the "next" endpoint', () => {
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/next');
    });

    it('displays "no-card-banner" with the correct text', () => {
      expect(wrapper.find('h2.no-card-banner').text()).toBe('You have no active cards :(');
    });
  });

  describe('when api responds with some card', () => {
    beforeEach(async () => {
      global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => ({
          id: 42,
          text: 'some text',
          translation: 'some translation',
          image_path: null,
          met_at: '2022-02-12 09:00:13 UTC',
          remembered: false,
          active: true,
          created_at: '2022-02-11 14:58:09 UTC',
          updated_at: '2022-02-12 09:00:13 UTC',
        }),
      }));

      wrapper = shallowMount(Home, {
        global: {
          provide: { backendUrl: '' },
          stubs: ['router-link', 'EditIcon', 'ClearIcon', 'CheckIcon', 'DescriptionIcon'],
        },
      });

      await flushPromises();
    });

    it('renders', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('fetches a card by the "next" endpoint', () => {
      expect(global.fetch.mock.calls.length).toBe(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/cards/next');
    });

    it('displays the correct card id', () => {
      expect(wrapper.find('button.card h4').text()).toBe('#42');
      expect(wrapper.find('button.card h4').attributes()).toEqual({ title: '#42' });
    });

    it('displays the correct text', () => {
      expect(wrapper.find('button.card p').text()).toBe('some text');
    });

    it('displays the correct translation', async () => {
      expect(wrapper.vm.inverted).toBe(false);
      wrapper.find('button.card').trigger('click');
      await nextTick();

      expect(wrapper.vm.inverted).toBe(true);
      expect(wrapper.find('button.card p').text()).toBe('some translation');
    });
  });
});
